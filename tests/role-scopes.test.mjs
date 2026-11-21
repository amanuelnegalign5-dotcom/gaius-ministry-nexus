import test from 'node:test';
import assert from 'node:assert/strict';
import {handle} from '../gaius-core.js';

class DB {
 constructor(){this.m=new Map();}
 one(b,id){return this.m.get(b)?.get(id)||null;}
 all(b){return [...(this.m.get(b)||new Map()).values()];}
 put(b,r){if(!this.m.has(b))this.m.set(b,new Map());this.m.get(b).set(r.id,r);}
 drop(b,id){this.m.get(b)?.delete(id);}
 atomic(fn){return fn();}
}
const accepted=Array(12).fill(true);
const make=(db,role,name,extra={})=>handle(db,'register',{role,name,username:name.toLowerCase(),password:'Secure-Pass9',email:name.toLowerCase()+'@example.com',phone:'+251911111111',accepted,...extra},{bootstrapAuthorized:true});
const login=async(db,name)=>(await handle(db,'login',{username:name.toLowerCase(),password:'Secure-Pass9'})).token;
const cmd=(db,t,a,p)=>handle(db,'command',{action:a,payload:p,requestId:crypto.randomUUID()},{token:t});
const state=(db,t)=>handle(db,'state',{}, {token:t});
const err=code=>e=>e.message===code;
async function setup(){
 const db=new DB();
 await make(db,'country_director','Director');
 await make(db,'media_leader','Media');
 await make(db,'followup_leader','Followup');
 await make(db,'center_leader','Gerji',{center:'Gerji'});
 await make(db,'center_leader','Mekanisa',{center:'Mekanisa'});
 await make(db,'center_department_leader','Arts',{center:'Gerji',department:'Arts'});
 await make(db,'center_department_leader','Worship',{center:'Gerji',department:'Worship'});
 await make(db,'hq_staff','Staff',{department:'Media'});
 const boss=await login(db,'Director');
 for(const u of (await state(db,boss)).users.filter(x=>x.role!=='country_director'))
   await cmd(db,boss,'account.approve',{id:u.id,version:u._v});
 const t={};for(const name of ['Media','Followup','Gerji','Mekanisa','Arts','Worship','Staff'])
   t[name]=await login(db,name);
 return {db,boss,t};
}
const report=title=>({title,month:'2026-11',activity:'Service',result:'Completed'});
test('legacy shared HQ reports are for leaders and Directors only',async()=>{
 const {db,boss,t}=await setup();
 const media=await cmd(db,t.Media,'report.save',{status:'submitted',department:'Media',center:'',month:'2026-11',activity:'Media report'});
 const follow=await cmd(db,t.Followup,'report.save',{status:'submitted',department:'Follow-up',center:'',month:'2026-11',activity:'Follow-up report'});
 assert.deepEqual((await state(db,t.Media)).reports.map(x=>x.id).sort(),[media.id,follow.id].sort());
 assert.deepEqual((await state(db,t.Followup)).reports.map(x=>x.id).sort(),[media.id,follow.id].sort());
 assert.equal((await state(db,t.Gerji)).reports.length,0);
 assert.equal((await state(db,t.Mekanisa)).reports.length,0);
 assert.equal((await state(db,t.Arts)).reports.length,0);
 assert.equal((await state(db,t.Worship)).reports.length,0);
 assert.equal((await state(db,t.Staff)).reports.length,0);
 assert.equal((await state(db,boss)).reports.length,2);
 await assert.rejects(cmd(db,t.Gerji,'report.save',{status:'submitted',department:'Arts',center:'Gerji',month:'2026-11',activity:'Center report'}),err('forbidden'));
 await assert.rejects(cmd(db,t.Staff,'report.save',{status:'submitted',department:'Media',month:'2026-11',activity:'Staff report'}),err('forbidden'));
 await assert.rejects(cmd(db,t.Media,'report.save',{status:'submitted',department:'Follow-up',month:'2026-11',activity:'Wrong HQ'}),err('forbidden'));
});
test('v11 scope checks stop cross-unit reads, writes and reviews',async()=>{
 const {db,boss,t}=await setup();
 const a=await cmd(db,t.Media,'v11.save',{kind:'monthly',scopeType:'hq',scopeId:'Media',data:report('HQ')});
 const b=await cmd(db,t.Arts,'v11.save',{kind:'monthly',scopeType:'center',scopeId:'Gerji',data:report('Arts')});
 await cmd(db,t.Arts,'v11.transition',{id:b.id,version:db.one('v11_records',b.id)._v,decision:'submit'});
 assert.equal(db.one('v11_records',b.id).data.departmentType,'Arts');
 assert.equal((await state(db,t.Gerji)).v11.records.some(r=>r.id===b.id),true);
 for(const name of ['Media','Followup','Mekanisa','Worship','Staff'])
   assert.equal((await state(db,t[name])).v11.records.some(r=>r.id===b.id),false);
 assert.equal((await state(db,t.Arts)).v11.records.some(r=>r.id===a.id),false);
 assert.equal((await state(db,boss)).v11.records.some(r=>r.id===b.id),true);
 await assert.rejects(cmd(db,t.Arts,'v11.save',{kind:'monthly',scopeType:'center',scopeId:'Gerji',data:{...report('wrong'),departmentType:'Worship'}}),err('departmentScopeMismatch'));
 await assert.rejects(cmd(db,t.Media,'v11.save',{kind:'monthly',scopeType:'center',scopeId:'Gerji',data:report('bad')}),err('forbidden'));
 await assert.rejects(cmd(db,t.Media,'v11.transition',{id:b.id,version:db.one('v11_records',b.id)._v,decision:'approve'}),err('forbidden'));
});
test('approved organization operational records remain director-only',async()=>{
 const {db,boss,t}=await setup();
 const r=await cmd(db,boss,'v11.save',{kind:'monthly',scopeType:'organization',scopeId:'org',data:report('Private org')});
 await cmd(db,boss,'v11.transition',{id:r.id,version:db.one('v11_records',r.id)._v,decision:'submit'});
 await cmd(db,boss,'v11.transition',{id:r.id,version:db.one('v11_records',r.id)._v,decision:'approve'});
 for(const token of Object.values(t)) assert.equal((await state(db,token)).v11.records.some(x=>x.id===r.id),false);
 assert.equal((await state(db,boss)).v11.records.some(x=>x.id===r.id),true);
 assert.deepEqual(new Set((await state(db,t.Staff)).v11.capabilities.allowedKinds),new Set(['plans6','monthly']));
 assert.equal((await state(db,t.Staff)).v11.capabilities.canUploadFile,false);
});
test('delegated permissions do not bypass unit and private record boundaries',async()=>{
 const {db,boss,t}=await setup();
 const staff=db.all('users').find(x=>x.username==='staff');
 db.put('users',{...staff,adminPermissions:['manage_users','v11:oversight','v11:approve']});
 const scoped=await state(db,t.Staff);
 assert.equal(scoped.v11.capabilities.oversight,false);
 assert.equal(scoped.users.some(x=>x.username==='gerji'),false);
 assert.deepEqual(new Set(scoped.v11.capabilities.allowedKinds),new Set(['plans6','monthly']));
 const gerji=db.all('users').find(x=>x.username==='gerji');
 await assert.rejects(cmd(db,t.Staff,'account.remove',{id:gerji.id,version:gerji._v}),err('forbidden'));
 assert.equal((await state(db,boss)).v11.capabilities.allowedKinds.includes('directorGoals'),true);
});
test('pending center files remain hidden from other units and unrelated staff',async()=>{
 const {db,boss,t}=await setup();
 const owner=(await state(db,t.Gerji)).me.id;
 db.put('v11_files',{id:'center-file',name:'private.pdf',type:'application/pdf',size:15,status:'pending',scopeType:'center',scopeId:'Gerji',ownerId:owner});
 assert.equal((await state(db,t.Gerji)).v11.files.some(x=>x.id==='center-file'),true);
 for(const name of ['Media','Mekanisa','Staff'])
   assert.equal((await state(db,t[name])).v11.files.some(x=>x.id==='center-file'),false);
 assert.equal((await state(db,boss)).v11.files.some(x=>x.id==='center-file'),true);
});
