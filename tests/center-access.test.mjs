import test from 'node:test';
import assert from 'node:assert/strict';
import {mondayMember, managesAttendance, roleDepartments} from '../gaius-core.js';
import {v11Command, v11State} from '../gaius-v11-core.js';
const centerRoles=['senior_center_leader','center_leader','potential_center_leader','center_department_leader','potential_department_leader','volunteer'];
const user=(role,center='East')=>({id:role,name:role,role,center,accountStatus:'active'});
const director=user('country_director','');
const leader=user('senior_center_leader');
const candidate=user('potential_department_leader');
function database(){
 const rows={users:[leader,candidate],v11_records:[],audit:[]};
 return {all:k=>rows[k]||[],one:(k,id)=>rows[k]?.find(r=>r.id===id),put(k,r){rows[k]=(rows[k]||[]).filter(x=>x.id!==r.id).concat(r);}};
}
test('Monday eligibility and attendance delegation follow active staff roles',()=>{
 for(const role of Object.keys(roleDepartments))assert.equal(mondayMember(user(role)),!centerRoles.includes(role));
 for(const role of centerRoles)assert.equal(managesAttendance({...user(role),fullAdmin:true}),false);
 assert.equal(mondayMember(user('unknown')),false);
 assert.equal(mondayMember({...director,accountStatus:'removed'}),false);
});
test('all assigned center roles can file and see submitted plans and reports only in their center',()=>{
 for(const role of centerRoles){
  const db=database(),actor=user(role);
  for(const [kind,data] of Object.entries({monthly:{title:'Report',month:'2026-11',activity:'Study',result:'Done'},plans6:{title:'Plan',start:'2026-11-01',end:'2027-04-30',focus:'mission',objective:'Teach',activities:'Train'}})){
   const p={kind,scopeType:'center',scopeId:'East',data};
   const {id}=v11Command(db,actor,'v11.save',p);
   const observer={...candidate,id:'observer'};
   const visible=u=>v11State(db,u).v11.records.some(r=>r.id===id);
   assert.equal(visible(observer),false);
   v11Command(db,actor,'v11.transition',{id,version:1,decision:'submit'});
   assert.ok(visible(observer)&&visible(director));
   assert.equal(visible({...actor,center:'West',fullAdmin:true}),false);
   assert.equal(visible(user('hq_staff','')),false);
   assert.throws(()=>v11Command(db,actor,'v11.save',{...p,scopeId:'West'}));
  }
 }
});
test('center attendance distinguishes Sunday and another meeting day',()=>{
 const db=database(),p={kind:'centerAttendance',scopeType:'center',scopeId:'East',data:{date:'2026-11-22',eventType:'sunday',participantId:candidate.id,attendance:'present'}};
 v11Command(db,leader,'v11.save',p);
 assert.throws(()=>v11Command(db,leader,'v11.save',{...p,data:{...p.data,date:'2026-11-24'}}));
 v11Command(db,leader,'v11.save',{...p,data:{...p.data,eventType:'meeting',date:'2026-11-24'}});
 assert.equal(v11State(db,candidate).v11.records.length,2);
 assert.throws(()=>v11Command(db,user('center_leader','West'),'v11.save',p));
});
test('only senior and designated department leaders record attendance, in their own center',()=>{
 const db=database(),p={kind:'centerAttendance',scopeType:'center',scopeId:'East',data:{date:'2026-11-24',eventType:'meeting',participantId:candidate.id,attendance:'present'}};
 for(const role of ['center_department_leader','center_leader']){
  for(const department of ['Follow-up','Service Coordination','Administration and Finance']){
   const actor={...user(role),department};
   assert.ok(v11State(db,actor).v11.capabilities.allowedKinds.includes('centerAttendance'));
   v11Command(database(),actor,'v11.save',p);
   assert.throws(()=>v11Command(database(),{...actor,center:'West'},'v11.save',p));
  }
 }
 for(const role of ['center_leader','center_department_leader','potential_department_leader','potential_center_leader','volunteer']){
  assert.throws(()=>v11Command(db,{...user(role),department:role.startsWith('potential')?'Follow-up':'Media'},'v11.save',p));
 }
});
test('center leaders see candidate drafts; external grants permit submitted and approved records only',()=>{
 const db=database(),actor=user('potential_center_leader'),hq={...user('hq_staff',''),centerReportViews:['East']};
 const {id}=v11Command(db,actor,'v11.save',{kind:'monthly',scopeType:'center',scopeId:'East',data:{title:'Report',month:'2026-11',activity:'Study',result:'Complete'}});
 const visible=u=>v11State(db,u).v11.records.some(r=>r.id===id);
 assert.ok(visible(leader)&&visible(user('center_department_leader')));
 assert.ok(!visible(hq)&&!visible(user('volunteer'))&&!visible(user('center_leader','West')));
 v11Command(db,actor,'v11.transition',{id,version:1,decision:'submit'});
 const external={...user('center_leader','West'),centerReportViews:['East']};
 assert.ok(visible(hq)&&visible(external)&&visible(user('volunteer')));
 assert.throws(()=>v11Command(db,{...hq,fullAdmin:true},'v11.transition',{id,version:2,decision:'approve'}));
 v11Command(db,director,'v11.transition',{id,version:2,decision:'approve'});
 assert.ok(visible(hq)&&!visible({...hq,centerReportViews:[]}));
});
test('HQ reporting view override grants and revokes reading without granting authorship',()=>{
 const db=database(),r={id:'hq1',scopeType:'hq',scopeId:'Media',kind:'monthly',ownerId:'another',status:'submitted'};
 db.put('v11_records',r);
 const visible=u=>v11State(db,u).v11.records.some(x=>x.id===r.id);
 const staff=user('hq_staff',''),media={...user('media_leader',''),department:'Media'};
 assert.ok(!visible(staff)&&visible(media));
 assert.ok(visible({...staff,hqReportingView:'allow'})&&!visible({...media,hqReportingView:'deny'}));
 assert.throws(()=>v11Command(db,{...staff,hqReportingView:'allow'},'v11.save',{kind:'monthly',scopeType:'hq',scopeId:'Media',data:{}}),/forbidden/);
});
test('staff page overrides apply to HQ staff and preserve director and center role boundaries',async()=>{
 const {staffViews,staffViewOverride}=await import('../gaius-core.js');
 for(const page of staffViews){
  assert.equal(staffViewOverride({...user('hq_staff'),staffViews:{[page]:'allow'}},page),'allow');
  assert.equal(staffViewOverride({...user('media_leader'),staffViews:{[page]:'deny'}},page),'deny');
  assert.equal(staffViewOverride({...leader,staffViews:{[page]:'allow'}},page),'default');
  assert.equal(staffViewOverride({...director,staffViews:{[page]:'deny'}},page),'default');
 }
});
