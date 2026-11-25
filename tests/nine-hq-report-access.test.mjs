import test from 'node:test';
import assert from 'node:assert/strict';
import {handle,roleDepartments,seesReports} from '../gaius-core.js';
import {HQ_UNITS} from '../gaius-v11-model.js';

class DB {
 constructor(){this.m=new Map();}
 one(b,id){return this.m.get(b)?.get(id)||null;}
 all(b){return [...(this.m.get(b)||new Map()).values()];}
 put(b,r){if(!this.m.has(b))this.m.set(b,new Map());this.m.get(b).set(r.id,r);}
 drop(b,id){this.m.get(b)?.delete(id);}
 atomic(fn){return fn();}
}
const accepted=Array(12).fill(true);
const register=(db,role,name,extra={})=>handle(db,'register',{
 role,name,username:name.toLowerCase(),password:'Private-test123',email:name.toLowerCase()+'@example.com',
 phone:'+251911111111',accepted,...extra},{bootstrapAuthorized:true});
const login=async(db,name)=>(await handle(db,'login',{username:name.toLowerCase(),password:'Private-test123'})).token;
const command=(db,token,action,payload)=>handle(db,'command',{action,payload,requestId:crypto.randomUUID()},{token});
const state=(db,token)=>handle(db,'state',{}, {token});
const isForbidden=e=>e.message==='forbidden';
const hqRoles=[
 'admin_finance','followup_leader','service_leader','counseling_leader',
 'support_leader','establishment_leader','media_leader','research_leader','monday_leader'
];
async function fixture(){
 const db=new DB(); await register(db,'country_director','Director');
 for(let i=0;i<hqRoles.length;i++)await register(db,hqRoles[i],'HQ'+i);
 await register(db,'center_leader','Center',{center:'Gerji',department:'Service Coordination'});
 await register(db,'center_department_leader','CenterArts',{center:'Gerji',department:'Arts'});
 await register(db,'hq_staff','OrdinaryStaff',{department:'Media'});
 await register(db,'event_leader','LegacyEvent');
 await register(db,'support_leader','InvalidHQ',{center:'Gerji'});
 const boss=await login(db,'Director');
 for(const u of (await state(db,boss)).users.filter(x=>x.role!=='country_director'))
  await command(db,boss,'account.approve',{id:u.id,version:u._v});
 const tokens={Director:boss};
 for(const name of [...hqRoles.map((_,i)=>'HQ'+i),'Center','CenterArts','OrdinaryStaff','LegacyEvent','InvalidHQ'])
   tokens[name]=await login(db,name);
 return {db,tokens};
}
test('official HQ names contain exactly nine units including Monday Staff',()=>{
 assert.equal(HQ_UNITS.length,9);
 assert.equal(HQ_UNITS.find(x=>x.id==='monday-staff')?.en,'Monday Staff Program');
 assert.equal(new Set(hqRoles).size,9);
});
test('all nine assigned HQ leaders can see every HQ department report, not just their own',async()=>{
 const {db,tokens}=await fixture(),ids=[];
 for(let i=0;i<hqRoles.length;i++){
  const role=hqRoles[i],department=roleDepartments[role];
  const result=await command(db,tokens['HQ'+i],'report.save',{
    status:'submitted',department,center:'',month:'2026-11',activity:'Report '+i});
  ids.push(result.id);
 }
 for(let i=0;i<9;i++){
  const actual=(await state(db,tokens['HQ'+i])).reports;
  assert.equal(actual.length,9,'HQ role '+hqRoles[i]+' should see nine reports');
  assert.deepEqual(new Set(actual.map(x=>x.id)),new Set(ids));
  assert.equal(seesReports((await state(db,tokens['HQ'+i])).me),true);
 }
 assert.equal((await state(db,tokens.Director)).reports.length,9);
 for(const name of ['Center','CenterArts','OrdinaryStaff','LegacyEvent','InvalidHQ']){
  const r=await state(db,tokens[name]);
  assert.deepEqual(r.reports,[],'HQ reports should be denied to '+name);
  assert.equal(seesReports(r.me),false);
  await assert.rejects(command(db,tokens[name],'report.save',{
   status:'submitted',department:'Media',center:'',month:'2026-11',activity:'Leak'}),isForbidden);
 }
});
test('HQ reporters cannot read each others draft reports or approve organizational reports',async()=>{
 const {db,tokens}=await fixture();
 const draft=await command(db,tokens.HQ0,'report.save',{
  status:'draft',department:roleDepartments.admin_finance,center:'',month:'2026-11',activity:'Draft'});
 const submitted=await command(db,tokens.HQ0,'report.save',{
  status:'submitted',department:roleDepartments.admin_finance,center:'',month:'2026-11',activity:'Submitted'});
 const other=await state(db,tokens.HQ1);
 assert.equal(other.reports.some(r=>r.id===draft.id),false);
 assert.equal(other.reports.some(r=>r.id===submitted.id),true);
 const existing=db.one('reports',submitted.id);
 await assert.rejects(command(db,tokens.HQ1,'review',{
  kind:'report',id:submitted.id,version:existing._v,reviewVersion:0,decision:'approved'}),isForbidden);
});
test('center leaders and general staff retain scoped spaces for their own plans/reports',async()=>{
 const {db,tokens}=await fixture();
 const monthly={title:'My November Report',month:'2026-11',activity:'Activities',result:'Work completed'};
 const plan={title:'Personal Plan',start:'2026-11-01',end:'2027-04-30',focus:'discipleship',
  objective:'Personal development',activities:'Complete assigned tasks'};
 const center=await state(db,tokens.Center),worker=await state(db,tokens.OrdinaryStaff);
 assert.equal(center.v11.capabilities.defaultScopeType,'center');
 assert.equal(worker.v11.capabilities.defaultScopeType,'personal');
 for(const token of [tokens.Center,tokens.OrdinaryStaff]){
  const info=await state(db,token),c=info.v11.capabilities;
  assert.ok(c.allowedKinds.includes('plans6')&&c.allowedKinds.includes('monthly'));
  const report=await command(db,token,'v11.save',{
   kind:'monthly',scopeType:c.defaultScopeType,scopeId:c.defaultScopeId,data:monthly});
  const p=await command(db,token,'v11.save',{
   kind:'plans6',scopeType:c.defaultScopeType,scopeId:c.defaultScopeId,data:plan});
  const own=(await state(db,token)).v11.records.map(r=>r.id);
  assert.ok(own.includes(report.id)&&own.includes(p.id));
 }
 assert.equal((await state(db,tokens.HQ2)).v11.records.some(r=>r.scopeType==='center'||r.scopeType==='personal'),false);
 assert.equal((await state(db,tokens.OrdinaryStaff)).v11.records.some(r=>r.scopeType==='center'),false);
 await assert.rejects(command(db,tokens.OrdinaryStaff,'v11.save',{
  kind:'monthly',scopeType:'hq',scopeId:'Media',data:monthly}),isForbidden);
 await assert.rejects(command(db,tokens.Center,'v11.save',{
  kind:'monthly',scopeType:'hq',scopeId:'Media',data:monthly}),isForbidden);
});
test('HQ monthly v11 reports are shared across nine leaders but center reports are private to center',async()=>{
 const {db,tokens}=await fixture();
 const monthly={title:'Ministry Report',month:'2026-11',activity:'HQ update',result:'Completed'};
 const a=await command(db,tokens.HQ0,'v11.save',{
  kind:'monthly',scopeType:'hq',scopeId:roleDepartments.admin_finance,data:monthly});
 const c=await command(db,tokens.Center,'v11.save',{
  kind:'monthly',scopeType:'center',scopeId:'Gerji',data:{...monthly,title:'Center report'}});
 const id=db.one('v11_records',a.id);
 await command(db,tokens.HQ0,'v11.transition',{id:a.id,version:id._v,decision:'submit'});
 assert.equal((await state(db,tokens.HQ5)).v11.records.some(x=>x.id===a.id),true);
 assert.equal((await state(db,tokens.HQ5)).v11.records.some(x=>x.id===c.id),false);
 assert.equal((await state(db,tokens.Center)).v11.records.some(x=>x.id===a.id),false);
 assert.equal((await state(db,tokens.OrdinaryStaff)).v11.records.some(x=>x.id===a.id),false);
 assert.equal((await state(db,tokens.Director)).v11.records.some(x=>x.id===a.id),true);
});
