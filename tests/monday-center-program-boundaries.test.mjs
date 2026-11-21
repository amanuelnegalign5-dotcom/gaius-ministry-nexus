import test from 'node:test';
import assert from 'node:assert/strict';
import {handle,mondayMember,managesAttendance} from '../gaius-core.js';
import {canReadFile} from '../gaius-v11-core.js';

class DB{
 constructor(){this.m=new Map();}
 one(b,id){return this.m.get(b)?.get(id)||null;}
 all(b){return [...(this.m.get(b)||new Map()).values()];}
 put(b,r){if(!this.m.has(b))this.m.set(b,new Map());this.m.get(b).set(r.id,r);}
 drop(b,id){this.m.get(b)?.delete(id);}
 atomic(fn){return fn();}
}
const accepted=Array(12).fill(true);
const people=[
 ['country_director','Director',{}],
 ['monday_leader','Monday',{department:'Monday Staff Program'}],
 ['hq_staff','Staff',{department:'Media'}],
 ['center_leader','Gerji',{center:'Gerji'}],
 ['center_leader','Mekanisa',{center:'Mekanisa'}],
 ['center_department_leader','Arts',{center:'Gerji',department:'Arts'}],
 ['center_department_leader','Worship',{center:'Gerji',department:'Worship'}],
 ['potential_center_leader','Candidate',{center:'Gerji'}],
 ['potential_department_leader','ArtCandidate',{center:'Gerji',department:'Arts'}]
];
const issue=(db,action,p,token)=>handle(db,'command',{action,payload:p,requestId:crypto.randomUUID()},{token});
const snapshot=(db,token)=>handle(db,'state',{}, {token});
const expectsForbidden=e=>e?.message==='forbidden';
async function fixture(){
 const db=new DB();
 for(const [role,name,extra] of people){
  await handle(db,'register',{role,name,...extra,username:name.toLowerCase(),password:'Secure-Pass9',email:name.toLowerCase()+'@example.com',phone:'+251911111111',accepted},{bootstrapAuthorized:true});
 }
 const boss=(await handle(db,'login',{username:'director',password:'Secure-Pass9'})).token;
 for(const u of db.all('users').filter(u=>u.role!=='country_director'))await issue(db,'account.approve',{id:u.id,version:u._v},boss);
 const t={Director:boss};
 for(const [,name] of people.slice(1))t[name]=(await handle(db,'login',{username:name.toLowerCase(),password:'Secure-Pass9'})).token;
 const id=name=>db.all('users').find(u=>u.username===name.toLowerCase()).id;
 return {db,t,id};
}
const report=title=>({title,month:'2026-11',activity:'Center activity',result:'Done'});
const plan=title=>({title,start:'2026-11-01',end:'2027-05-01',focus:'discipleship',objective:'Teach youth',activities:'Weekly class'});
test('Monday staff cohort includes Directors and HQ staff but excludes all center leaders',async()=>{
 const {db,t}=await fixture();
 for(const name of ['Director','Monday','Staff'])assert.equal(mondayMember((await snapshot(db,t[name])).me),true,name);
 for(const name of ['Gerji','Mekanisa','Arts','Worship','Candidate','ArtCandidate']){
  const u=(await snapshot(db,t[name])).me;
  assert.equal(mondayMember(u),false,name);
  assert.equal(managesAttendance(u),false,name);
  assert.deepEqual((await snapshot(db,t[name])).attendance,[],name);
 }
 assert.equal(managesAttendance((await snapshot(db,t.Monday)).me),true);
 assert.equal(managesAttendance((await snapshot(db,t.Staff)).me),false);
});
test('Monday attendance manager can mark HQ staff but cannot mark a center leader',async()=>{
 const {db,t,id}=await fixture();
 const saved=await issue(db,'attendance.batch',{date:'2026-11-23',programType:'regular',rows:[{personId:id('Staff'),status:'present'}]},t.Monday);
 assert.equal(saved.count,1);
 assert.equal((await snapshot(db,t.Staff)).attendance.length,1);
 assert.equal((await snapshot(db,t.Gerji)).attendance.length,0);
 await assert.rejects(issue(db,'attendance.batch',{date:'2026-11-23',programType:'regular',rows:[{personId:id('Gerji'),status:'present'}]},t.Monday),expectsForbidden);
 await assert.rejects(issue(db,'attendance.batch',{date:'2026-11-23',programType:'regular',rows:[{personId:id('Staff'),status:'present'}]},t.Gerji),expectsForbidden);
 await assert.rejects(issue(db,'attendance.batch',{date:'2026-11-23',programType:'regular',rows:[{personId:id('Staff'),status:'present'}]},t.Staff),expectsForbidden);
});
test('a center fullAdmin flag cannot become a Monday attendance permission',async()=>{
 const {db,t}=await fixture();
 const u=db.all('users').find(x=>x.username==='gerji');
 const privileged={...u,fullAdmin:true,adminPermissions:['attendance']};
 assert.equal(mondayMember(privileged),false);
 assert.equal(managesAttendance(privileged),false);
 db.put('users',privileged);
 const state=await snapshot(db,t.Gerji);
 assert.deepEqual(state.attendance,[]);
 await assert.rejects(issue(db,'attendance.batch',{date:'2026-11-23',programType:'regular',rows:[]},t.Gerji),expectsForbidden);
});
test('center planning and monthly reports stay at the named center, visible to its leader and Directors',async()=>{
 const {db,t}=await fixture();
 const a=await issue(db,'v11.save',{kind:'plans6',scopeType:'center',scopeId:'Gerji',data:plan('Arts six-month plan')},t.Arts);
 const r=await issue(db,'v11.save',{kind:'monthly',scopeType:'center',scopeId:'Gerji',data:report('Arts report')},t.Arts);
 for(const k of [a.id,r.id]){
  const old=db.one('v11_records',k);
  assert.equal(old.scopeId,'Gerji');
  assert.equal(old.data.departmentType,'Arts');
  await issue(db,'v11.transition',{id:k,version:old._v,decision:'submit'},t.Arts);
 }
 for(const name of ['Gerji','Arts','ArtCandidate','Director']){
  const rows=(await snapshot(db,t[name])).v11.records;
  assert.equal(rows.some(x=>x.id===a.id),true,name+' plan');
  assert.equal(rows.some(x=>x.id===r.id),true,name+' report');
 }
 for(const name of ['Mekanisa','Worship','Monday','Staff']){
  const rows=(await snapshot(db,t[name])).v11.records;
  assert.equal(rows.some(x=>x.id===a.id||x.id===r.id),false,name);
 }
 await assert.rejects(issue(db,'v11.save',{kind:'monthly',scopeType:'center',scopeId:'Mekanisa',data:report('Forged center')},t.Arts),expectsForbidden);
 await assert.rejects(issue(db,'v11.save',{kind:'monthly',scopeType:'personal',scopeId:(await snapshot(db,t.Arts)).me.id,data:report('Wrong personal scope')},t.Arts),expectsForbidden);
});
test('center candidates can prepare own center plans/reports but cannot write to a different center',async()=>{
 const {db,t}=await fixture();
 const c=await snapshot(db,t.Candidate);
 const a=await issue(db,'v11.save',{kind:'plans6',scopeType:'center',scopeId:'Gerji',data:plan('Center candidate')},t.Candidate);
 const b=await issue(db,'v11.save',{kind:'monthly',scopeType:'center',scopeId:'Gerji',data:report('Center candidate report')},t.Candidate);
 assert.equal((await snapshot(db,t.Gerji)).v11.records.some(x=>x.id===a.id),false,'another member draft remains private');
 assert.equal(c.v11.capabilities.defaultScopeType,'center');
 assert.ok(c.v11.capabilities.allowedKinds.includes('plans6'));
 assert.ok(c.v11.capabilities.allowedKinds.includes('monthly'));
 assert.ok(!(await snapshot(db,t.Candidate)).v11.capabilities.allowedKinds.includes('centerAttendance'));
 await assert.rejects(issue(db,'v11.save',{kind:'monthly',scopeType:'center',scopeId:'Mekanisa',data:report('Forged')},t.Candidate),expectsForbidden);
 assert.ok(b.id);
});
test('center leader attendance is for Sunday main program and other meeting days, never Monday staff roster',async()=>{
 const {db,t,id}=await fixture();
 const sunday=await issue(db,'v11.save',{kind:'centerAttendance',scopeType:'center',scopeId:'Gerji',
  data:{date:'2026-11-22',eventType:'sunday',participantId:id('Arts'),attendance:'present'}},t.Gerji);
 const other=await issue(db,'v11.save',{kind:'centerAttendance',scopeType:'center',scopeId:'Gerji',
  data:{date:'2026-11-25',eventType:'other_meeting',meetingName:'Wednesday prayer gathering',participantId:id('Arts'),attendance:'late'}},t.Gerji);
 for(const k of [sunday.id,other.id]){
  const old=db.one('v11_records',k);
  assert.equal(old.scopeType,'center');
  assert.equal(old.scopeId,'Gerji');
  assert.equal(old.data.departmentType,'Arts');
  await issue(db,'v11.transition',{id:k,version:old._v,decision:'submit'},t.Gerji);
 }
 for(const name of ['Gerji','Arts','Director']){
  const rows=(await snapshot(db,t[name])).v11.records;
  assert.equal(rows.some(x=>x.id===sunday.id),true,name);
  assert.equal(rows.some(x=>x.id===other.id),true,name);
 }
 for(const name of ['Mekanisa','Worship','Staff','Monday']){
  assert.equal((await snapshot(db,t[name])).v11.records.some(x=>x.id===sunday.id||x.id===other.id),false,name);
 }
 assert.deepEqual((await snapshot(db,t.Gerji)).attendance,[],'center uses v11 attendance, not HQ Monday');
 await assert.rejects(issue(db,'v11.save',{kind:'centerAttendance',scopeType:'center',scopeId:'Gerji',
  data:{date:'2026-11-23',eventType:'sunday',participantId:id('Arts'),attendance:'present'}},t.Gerji),e=>e?.message==='sundayDateRequired');
 await assert.rejects(issue(db,'v11.save',{kind:'centerAttendance',scopeType:'center',scopeId:'Gerji',
  data:{date:'2026-11-25',eventType:'other_meeting',participantId:id('Arts'),attendance:'present'}},t.Gerji),e=>e?.message==='required:meetingName');
});
test('center department leaders cannot mark unrelated departments or another center',async()=>{
 const {db,t,id}=await fixture();
 await assert.rejects(issue(db,'v11.save',{kind:'centerAttendance',scopeType:'center',scopeId:'Gerji',
  data:{date:'2026-11-22',eventType:'sunday',participantId:id('Worship'),attendance:'present'}},t.Arts),e=>e?.message==='departmentScopeMismatch');
 await assert.rejects(issue(db,'v11.save',{kind:'centerAttendance',scopeType:'center',scopeId:'Mekanisa',
  data:{date:'2026-11-22',eventType:'sunday',participantId:id('Mekanisa'),attendance:'present'}},t.Arts),expectsForbidden);
 await assert.rejects(issue(db,'v11.save',{kind:'centerAttendance',scopeType:'personal',scopeId:id('Arts'),
  data:{date:'2026-11-22',eventType:'sunday',participantId:id('Arts'),attendance:'present'}},t.Arts),expectsForbidden);
 const ok=await issue(db,'v11.save',{kind:'centerAttendance',scopeType:'center',scopeId:'Gerji',
  data:{date:'2026-11-22',eventType:'sunday',participantId:id('ArtCandidate'),attendance:'present'}},t.Arts);
 assert.equal(db.one('v11_records',ok.id).data.departmentType,'Arts');
});

test('two separately named meetings on the same date are allowed, but duplicate attendance is denied',async()=>{
 const {db,t,id}=await fixture();
 const payload={kind:'centerAttendance',scopeType:'center',scopeId:'Gerji',
  data:{date:'2026-11-25',eventType:'other_meeting',meetingName:'Wednesday prayer',participantId:id('Arts'),attendance:'present'}};
 const a=await issue(db,'v11.save',payload,t.Gerji);
 const b=await issue(db,'v11.save',{...payload,data:{...payload.data,meetingName:'Wednesday mentorship'}},t.Gerji);
 assert.notEqual(a.id,b.id);
 await assert.rejects(issue(db,'v11.save',payload,t.Gerji),e=>e?.message==='attendanceExists');
});
