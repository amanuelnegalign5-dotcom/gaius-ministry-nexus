import test from 'node:test';
import assert from 'node:assert/strict';
import {offlineSnapshot,draftAllowed} from '../gaius-offline-vault.js';
import {legacyPages,directorSlots,SESSION_IDLE_MS,authenticatedUser,digest} from '../gaius-core.js';
const at=Date.now(),day=86400000;
const scope={scopeType:'center',scopeId:'Gerji'};
function snapshot(me,extra={}){
 return offlineSnapshot({me,authorization:{legacyPages:legacyPages(me),offlineLease:{issuedAt:at,operationsUntil:at+7*day,attendanceUntil:at+day}},v11:{capabilities:{createScopes:{monthly:[scope]}},records:[]},reports:[{id:'r',_v:2,activity:'Training',month:'2026-11',department:'Media',userId:me.id,submission:'draft',notes:''},{id:'private',department:'Counseling',activity:'Confidential'},{id:'protected',_v:1,department:'Media',activity:'Protected',notes:'private note',userId:me.id,submission:'draft'}],plans:[],projects:[],announcements:[],documents:[],...extra},at,true);
}
const report={kind:'legacyReport',data:{month:'2026-11',department:'Media',activity:'Training',status:'draft',center:''}};
test('legacy forms preserve role scope, correct record version and confidential exclusions',()=>{
 for(const role of ['country_director','international_director','media_leader']){
 const me={id:'u',role,department:'Media'},s=snapshot(me);
 assert.equal(draftAllowed(s,report,at),true,role);
 assert.equal(draftAllowed(s,{...report,id:'r',version:2,reviewVersion:0},at),true);
 assert.equal(draftAllowed(s,{...report,id:'r',version:1,reviewVersion:0},at),false);
 assert.equal(draftAllowed(s,{...report,id:'protected',version:1,reviewVersion:0},at),false);
 assert.equal(draftAllowed(s,{...report,data:{...report.data,department:'Counseling'}},at),false);
 assert.equal(s.legacy.reports.some(r=>r.id==='private'),false);
 assert.equal(JSON.stringify(s).includes('private note'),false);
 assert.equal(draftAllowed(s,report,at+7*day),false);
 }
 const s=snapshot({id:'h',role:'media_leader',department:'Media'});
 assert.equal(draftAllowed(s,{...report,data:{...report.data,department:'Research'}},at),false);
 assert.equal(draftAllowed(s,{kind:'legacyComment',data:{text:'Feedback',reportId:'r',visible:true}},at),false);
 for(const role of ['center_leader','volunteer','staff','international_staff']){
 const v=snapshot({id:'u',role,center:role==='center_leader'||role==='volunteer'?'Gerji':'',department:'Media'});
 assert.equal(draftAllowed(v,report,at),false,role);
 assert.equal(draftAllowed(v,{kind:'monthly',...scope,data:{title:'Nexus report'}},at),true,role);
 }
});
test('directors can queue visible comments and versioned decisions; never private comments',()=>{
 const s=snapshot({id:'d',role:'international_director',department:'Media'},{reports:[{id:'r',_v:2,activity:'Training',month:'2026-11',department:'Media',submission:'submitted'}]});
 assert.equal(draftAllowed(s,{kind:'legacyComment',data:{text:'Feedback',reportId:'r',visible:true}},at),true);
 assert.equal(draftAllowed(s,{kind:'legacyComment',data:{text:'Feedback',reportId:'r',visible:false}},at),false);
 assert.equal(draftAllowed(s,{kind:'legacyReview',data:{kind:'report',id:'r',version:2,reviewVersion:0,decision:'approved',note:''}},at),true);
});
test('role-specific director slots and rolling session keep revocation',async()=>{
 const records=new Map(),key=(b,id)=>b+':'+id;
 const db={one:(b,id)=>records.get(key(b,id)),all:b=>[...records.entries()].filter(([k])=>k.startsWith(b+':')).map(([,v])=>v),put:(b,r)=>records.set(key(b,r.id),r)};
 db.put('users',{id:'u',role:'country_director',sessionVersion:0});
 assert.deepEqual(directorSlots(db),{country_director:false,international_director:true});
 const token='test-token',id=await digest(token);db.put('sessions',{id,userId:'u',epoch:0,until:Date.now()+day});
 await authenticatedUser(db,token);
 assert.ok(db.one('sessions',id).until>Date.now()+SESSION_IDLE_MS-day);
 db.put('users',{id:'u',role:'country_director',sessionVersion:1});
 await assert.rejects(authenticatedUser(db,token),/expired/);
});
