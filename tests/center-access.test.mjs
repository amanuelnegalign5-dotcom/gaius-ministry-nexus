import test from 'node:test';
import assert from 'node:assert/strict';
import {mondayMember, managesAttendance, roleDepartments} from '../gaius-core.js';
import {v11Command, v11State} from '../gaius-v11-core.js';
const centerRoles=['center_leader','potential_center_leader','center_department_leader','potential_department_leader','volunteer'];
const user=(role,center='East')=>({id:role,name:role,role,center,accountStatus:'active'});
const director=user('country_director','');
const leader=user('center_leader');
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
