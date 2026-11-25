import test from 'node:test';
import assert from 'node:assert/strict';
import {isMondayParticipant,isMondayManager,isCenterReportingMember,isCenterMeetingParticipant,isMeetingDate} from '../gaius-report-policy.js';
import {v11State,v11Command} from '../gaius-v11-core.js';
const user=(id,role,center='',extra={})=>({id,name:id,role,center,accountStatus:'active',...extra});
const director=user('d','country_director'), staff=user('s','hq_staff'), leader=user('l','center_leader','Gerji'), dept=user('p','center_department_leader','Gerji',{department:'Charity'}), potential=user('q','potential_department_leader','Gerji'), volunteer=user('v','volunteer','Gerji'), other=user('o','center_leader','Mekanisa'), admin=user('a','hq_staff','',{fullAdmin:true});
function database(){const buckets=new Map();return {one:(k,id)=>buckets.get(k)?.get(id),all:k=>[...(buckets.get(k)?.values()||[])],put(k,x){if(!buckets.has(k))buckets.set(k,new Map());buckets.get(k).set(x.id,x);}};}
const db=()=>{const d=database();for(const u of [director,staff,leader,dept,potential,volunteer,other,admin])d.put('users',u);return d;};
test('Monday access is limited to directors and staff; center roles cannot gain it by grants',()=>{
 for(const u of [director,staff,admin])assert.equal(isMondayParticipant(u),true);
 for(const u of [leader,dept,potential,volunteer,other,{...leader,fullAdmin:true,adminPermissions:['attendance']},{...staff,accountStatus:'pending'}])assert.equal(isMondayParticipant(u),false);
 assert.equal(isMondayManager(staff),false);assert.equal(isMondayManager(director),true);
 assert.equal(isMeetingDate('2026-11-23',1),true);assert.equal(isMeetingDate('2026-11-22',0),true);assert.equal(isMeetingDate('2026-11-31'),false);
});
test('center reports and plans share submitted records within the assigned center, not drafts or other centers',()=>{
 const d=db();for(const kind of ['plans6','monthly'])for(const status of ['draft','submitted','approved'])d.put('v11_records',{id:kind+status,kind,scopeType:'center',scopeId:'Gerji',ownerId:leader.id,status,data:{},history:[],_v:1});
 for(const u of [dept,potential,volunteer]){assert.equal(isCenterReportingMember(u),true);assert.equal(v11State(d,u).v11.records.length,4);assert.equal(v11State(d,u).v11.capabilities.defaultScopeType,'center');}
 for(const u of [other,staff,admin])assert.equal(v11State(d,u).v11.records.length,0);
 assert.equal(v11State(d,director).v11.records.length,6);
 assert.equal(v11State(d,leader).v11.records.length,6);
 const data={title:'Plan',start:'2026-11-01',end:'2027-04-30',focus:'holistic',objective:'Objective',activities:'Activities'};
 assert.throws(()=>v11Command(d,potential,'v11.save',{kind:'plans6',scopeType:'center',scopeId:'Mekanisa',data}),/forbidden/);
 assert.ok(v11Command(d,potential,'v11.save',{kind:'plans6',scopeType:'center',scopeId:'Gerji',data}).id);
 assert.throws(()=>v11Command(d,{...dept,adminPermissions:['v11:approve']},'v11.transition',{id:'monthlysubmitted',version:1,decision:'approve'}),/forbidden/);
});
test('center attendance is separate, with eligible local leaders, Sunday validation and read boundaries',()=>{
 const d=db();const data={date:'2026-11-22',eventType:'sunday',participantId:dept.id,attendance:'present'};
 assert.equal(isCenterMeetingParticipant(volunteer),false);
 assert.throws(()=>v11Command(d,staff,'v11.save',{kind:'centerAttendance',scopeType:'center',scopeId:'Gerji',data}),/forbidden/);
 assert.throws(()=>v11Command(d,leader,'v11.save',{kind:'centerAttendance',scopeType:'center',scopeId:'Gerji',data:{...data,participantId:other.id}}),/participantRoleInvalid/);
 assert.throws(()=>v11Command(d,leader,'v11.save',{kind:'centerAttendance',scopeType:'center',scopeId:'Gerji',data:{...data,date:'2026-11-23'}}),/dateInvalid/);
 const {id}=v11Command(d,leader,'v11.save',{kind:'centerAttendance',scopeType:'center',scopeId:'Gerji',data});
 v11Command(d,leader,'v11.transition',{id,version:1,decision:'submit'});
 assert.equal(v11State(d,dept).v11.records.some(r=>r.id===id),true);
 for(const u of [other,staff,volunteer,potential,admin])assert.equal(v11State(d,u).v11.records.some(r=>r.id===id),false);
 assert.equal(v11State(d,director).v11.records.some(r=>r.id===id),true);
});
