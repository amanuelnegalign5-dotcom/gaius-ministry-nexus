import test from 'node:test';
import assert from 'node:assert/strict';
import {handle} from '../gaius-core.js';
import {visitCompliance,safePerformance,cityGroup,indicators,compatiblePlannedActual,addMonths} from '../gaius-nexus-analytics.js';
import {V11_KINDS,NEXUS_DEPARTMENT_FIELDS} from '../gaius-v11-model.js';
class DB {
 constructor(){this.map=new Map();}
 one(b,id){return this.map.get(b)?.get(id)||null;}
 all(b){return [...(this.map.get(b)||new Map()).values()];}
 put(b,v){if(!this.map.has(b))this.map.set(b,new Map());this.map.get(b).set(v.id,v);}
 drop(b,id){this.map.get(b)?.delete(id);}
 atomic(fn){return fn();}
}
const accepted=Array(12).fill(true);
async function create(db,role,name,opts={}){
 return handle(db,'register',{role,name,username:name.toLowerCase(),password:'Strong-Pass9',phone:'+251900000000',email:`${name.toLowerCase()}@example.com`,accepted,...opts},{bootstrapAuthorized:true});
}
async function login(db,name){return (await handle(db,'login',{username:name.toLowerCase(),password:'Strong-Pass9'})).token;}
const cmd=(db,token,action,payload)=>handle(db,'command',{action,payload,requestId:crypto.randomUUID()},{token});
const state=(db,t)=>handle(db,'state',{}, {token:t});
const err=(msg)=>(e)=>e.message===msg;
function samplePlan(){return {schema:'gaius-country-director-plan-v1',sourceName:'PRIVATE ORIGINAL',declaredTotal:68000,
 goals:Array.from({length:16},(_,i)=>({no:i+1,title:`Strategic objective ${i+1}`,activities:'Complete authorized activities',originalMonths:'መስከረም – የካቲት',accountable:'Director',collaborators:'Team',expected:'Results',budget:i===15?68000-15*4000:4000}))};}
test('private director import creates 16 original-budget objectives once, isolated from second director',async()=>{
 const db=new DB();await create(db,'country_director','Country');await create(db,'international_director','International');const c=await login(db,'Country'),i=await login(db,'International');
 const res=await cmd(db,c,'v11.importDirectorPlan',{plan:samplePlan()});assert.equal(res.count,16);assert.equal(res.totalBudget,68000);
 const own=(await state(db,c)).v11.records.filter(r=>r.kind==='directorGoals');assert.equal(own.length,16);assert.equal(own.reduce((sum,r)=>sum+r.data.budget,0),68000);
 assert.equal((await state(db,i)).v11.records.filter(r=>r.kind==='directorGoals').length,0);
 await assert.rejects(cmd(db,c,'v11.importDirectorPlan',{plan:samplePlan()}),err('planAlreadyImported'));
 await assert.rejects(cmd(db,i,'v11.importDirectorPlan',{plan:samplePlan()}),err('forbidden'));
 const invalid=samplePlan();invalid.goals[0].budget=100;
 const db2=new DB();await create(db2,'country_director','Country');const c2=await login(db2,'Country');
 await assert.rejects(cmd(db2,c2,'v11.importDirectorPlan',{plan:invalid}),err('planTotalInvalid'));
 assert.equal((await state(db2,c2)).v11.records.filter(r=>r.kind==='directorGoals').length,0);
});
test('director can edit working objective while immutable source snapshot survives revisions',async()=>{
 const db=new DB();await create(db,'country_director','Country');const t=await login(db,'Country'),me=(await state(db,t)).me;
 await cmd(db,t,'v11.importDirectorPlan',{plan:samplePlan()});const goal=(await state(db,t)).v11.records.find(r=>r.kind==='directorGoals');
 await cmd(db,t,'v11.save',{kind:'directorGoals',scopeType:'personal',scopeId:me.id,id:goal.id,version:goal._v,data:{...goal.data,activities:'Updated working actions',budget:5000}});
 const changed=(await state(db,t)).v11.records.find(r=>r.id===goal.id);assert.equal(changed.data.budget,5000);assert.equal(changed.sourceSnapshot.budget,4000);
 await assert.rejects(cmd(db,t,'v11.transition',{id:goal.id,version:changed._v,decision:'submit'}),err('useDedicatedWorkflow'));
});
test('center visits are director-private and can only be completed with evidence',async()=>{
 const db=new DB();await create(db,'country_director','Country');await create(db,'international_director','International');
 const t=await login(db,'Country'),it=await login(db,'International'),me=(await state(db,t)).me;
 const center=await cmd(db,t,'v11.save',{kind:'centers',scopeType:'organization',scopeId:'org',data:{name:'Gerji',city:'addis_ababa',location:'Addis Ababa',level:'C'}});
 let v=await cmd(db,t,'v11.save',{kind:'visits',scopeType:'personal',scopeId:me.id,data:{centerRecordId:center.id,location:'Gerji',plannedDate:'2026-11-18',purpose:'Review',visitor:'Director'}});
 let item=(await state(db,t)).v11.records.find(x=>x.id===v.id);
 assert.equal((await state(db,it)).v11.records.find(x=>x.id===v.id),undefined);
 await assert.rejects(cmd(db,t,'v11.completeVisit',{id:v.id,version:item._v,actualDate:'2026-11-18',observations:''}),err('visitEvidenceRequired'));
 await cmd(db,t,'v11.completeVisit',{id:v.id,version:item._v,actualDate:'2026-11-18',observations:'Met leaders and reviewed records'});
 item=(await state(db,t)).v11.records.find(x=>x.id===v.id);assert.equal(item.status,'completed');
 assert.equal(visitCompliance((await state(db,t)).v11.records,'2026-11-19').find(x=>x.name==='Gerji').completed,true);
});
test('monthly Addis and two-month Bishoftu are derived from center registry, not names',()=>{
 const r=(id,name,city)=>({kind:'centers',id,status:'draft',data:{name,city}});
 const visits=[r('1','A','addis_ababa'),r('2','B','bishoftu'),r('3','Other','other'),
 {kind:'visits',status:'completed',data:{centerRecordId:'1',actualDate:'2026-11-10'}},
 {kind:'visits',status:'completed',data:{centerRecordId:'2',actualDate:'2026-10-12'}}];
 const x=visitCompliance(visits,'2026-11-19');assert.equal(x[0].frequency,1);assert.equal(x[1].frequency,2);
 assert.equal(x[0].completed,true);assert.equal(x[1].completed,true);assert.equal(x[2].frequency,null);
 assert.equal(addMonths('2026-01-31',1),'2026-02-28');
 assert.equal(cityGroup({city:'bishoftu'}),'bishoftu');
});
test('no fabricated percentages; only comparable verified reporting fields are charted',()=>{
 assert.equal(safePerformance('',50),null);assert.equal(safePerformance(0,50),null);assert.equal(safePerformance(100,50),50);
 assert.ok(NEXUS_DEPARTMENT_FIELDS['media-pr'].some(x=>x[0]==='newFollowers'));
 assert.ok(V11_KINDS.monthly.fields.some(x=>x[0]==='ethiopianYear'));
 const rows=[{kind:'monthly',status:'approved',scopeType:'center',scopeId:'Gerji',id:'a',data:{activity:'Support',planned:'',achieved:18,indicatorUnit:'people'}},
 {kind:'monthly',status:'approved',scopeType:'center',scopeId:'Gerji',id:'b',data:{activity:'Training',planned:20,achieved:10,indicatorUnit:'people'}},
 {kind:'monthly',status:'approved',scopeType:'center',scopeId:'Gerji',id:'c',data:{activity:'Videos',planned:4,achieved:3,indicatorUnit:'videos'}}];
 assert.equal(compatiblePlannedActual(rows,'people').length,2);
 assert.equal(compatiblePlannedActual(rows,'people').filter(x=>x.ratio!==null).length,1);
 assert.equal(indicators(rows).reportMissingTarget,1);
});
test('one weekly follow-up per center prevents duplicating reported attendance',async()=>{
 const db=new DB();await create(db,'country_director','Country');const t=await login(db,'Country');
 const data={week:'2026-11-16',sundayProgram:50,volunteers:10};
 await cmd(db,t,'v11.save',{kind:'followups',scopeType:'center',scopeId:'Gerji',data});
 await assert.rejects(cmd(db,t,'v11.save',{kind:'followups',scopeType:'center',scopeId:'Gerji',data}),err('duplicateWeeklyFollowup'));
});
