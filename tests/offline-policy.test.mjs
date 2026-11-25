import test from 'node:test';
import assert from 'node:assert/strict';
import {offlineLease,OFFLINE_POLICY_DEFAULTS,validOfflinePolicy} from '../gaius-report-policy.js';
import {offlineSnapshot,draftAllowed} from '../gaius-offline-vault.js';
import {handle} from '../gaius-core.js';
const day=86400000;
test('role and data ceiling, timed grant cap, and disabled policy',()=>{
 const at=Date.now(),u={id:'d',role:'country_director'},p=OFFLINE_POLICY_DEFAULTS;
 assert.equal(offlineLease(u,p,[],at).operationsUntil,at+7*day);
 assert.equal(offlineLease(u,p,[],at).attendanceUntil,at+day);
 assert.equal(offlineLease(u,p,[{endsAt:new Date(at+3600000).toISOString()}],at).operationsUntil,at+3600000);
 assert.equal(offlineLease(u,{...p,country_director:0},[],at).operationsUntil,at);
 assert.equal(validOfflinePolicy({...p,attendance:30}),false);
 const lease=offlineLease(u,p,[],at),s=offlineSnapshot({me:u,authorization:{offlineLease:lease,offlineMondayRoster:[{id:'staff'}]},v11:{capabilities:{createScopes:{monthly:[{scopeType:'organization',scopeId:'org'}]}}}},at);
 assert.equal(draftAllowed(s,{kind:'monthly',scopeType:'organization',scopeId:'org',data:{}},at+2*day),true);
 assert.equal(draftAllowed(s,{kind:'mondayAttendance',data:{personId:'staff',date:'2026-11-30',status:'present',programType:'regular'}},at+2*day),false);
});
class DB{constructor(){this.m=new Map()}all(b){return [...(this.m.get(b)||new Map()).values()]}one(b,id){return this.m.get(b)?.get(id)||null}put(b,r){if(!this.m.has(b))this.m.set(b,new Map());this.m.get(b).set(r.id,r)}drop(b,id){this.m.get(b)?.delete(id)}atomic(fn){return fn()}}
test('only real directors can configure policy, with audit and optimistic version',async()=>{
 const db=new DB();db.put('users',{id:'d',role:'country_director',name:'Director'});db.put('users',{id:'c',role:'center_leader',center:'Gerji',name:'Center',fullAdmin:true,adminPermissions:['manage_users']});
 const save=(id,values,version)=>handle(db,'command',{action:'offline.policy.save',payload:{values,version},requestId:crypto.randomUUID()},{local:true,legacyId:id});
 await assert.rejects(save('c',OFFLINE_POLICY_DEFAULTS,0),/forbidden/);
 await assert.rejects(save('d',{...OFFLINE_POLICY_DEFAULTS,attendance:30},0),/offlinePolicyInvalid/);
 await save('d',{...OFFLINE_POLICY_DEFAULTS,center:7},0);
 assert.equal(db.one('system','offline-policy').values.center,7);assert.equal(db.all('audit').length,1);
 await assert.rejects(save('d',OFFLINE_POLICY_DEFAULTS,0),/conflict/);
 const view=await handle(db,'state',{}, {local:true,legacyId:'c'});
 assert.equal(view.authorization.offlinePolicy,undefined);
 assert.equal(view.authorization.offlineLease.operationsUntil-view.authorization.offlineLease.issuedAt,7*day);
 assert.equal(view.authorization.offlineLease.attendanceUntil-view.authorization.offlineLease.issuedAt,day);
});
