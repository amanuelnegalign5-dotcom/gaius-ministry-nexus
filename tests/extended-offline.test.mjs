import test from 'node:test';
import assert from 'node:assert/strict';
import {offlineSnapshot,draftAllowed,categoryValid} from '../gaius-offline-vault.js';
const day=86400000,at=Date.now();
const me={id:'d',role:'country_director',name:'Director',passwordHash:'never-store'};
const record={id:'r',kind:'monthly',scopeType:'hq',scopeId:'Media',ownerId:'m',status:'draft',_v:3,data:{title:'Authorized report',month:'2026-11',result:'Result'},actions:{edit:true,submit:true},history:[{note:'private review note'}]};
const state={me,authorization:{offlineLease:{issuedAt:at,operationsUntil:at+7*day,attendanceUntil:at+day},legacyPages:['dashboard','reports']},directory:[{id:'m',name:'Staff',phone:'private phone',photo:'private photo'}],v11:{capabilities:{director:true,readableKinds:['monthly','manuals'],createScopes:{monthly:[{scopeType:'hq',scopeId:'Media'}]}},records:[record,{...record,id:'p',kind:'manuals',data:{body:'private document'}},{...record,id:'c',scopeId:'Counseling and Support'},{...record,id:'a',kind:'centerAttendance',data:{note:'private attendance note'}},{...record,id:'f',data:{...record.data,fileId:'private attachment'}}]}};
test('extended workspace is opt-in; only authorized projected records and least-privilege edits',()=>{
 assert.equal(offlineSnapshot(state,at).records,undefined);
 const s=offlineSnapshot(state,at,true);
 assert.deepEqual(s.records.map(r=>r.id),['r','f']);assert.equal(s.directory[0].phone,undefined);assert.equal(s.me.passwordHash,undefined);
 assert.equal(s.records[0].history,undefined);assert.equal(s.records[1].data.fileId,undefined);assert.equal(s.records[1].actions.edit,false);
 const p={kind:'monthly',id:'r',version:3,scopeType:'hq',scopeId:'Media',data:{title:'Edit'}};
 assert.ok(draftAllowed(s,p,at));assert.equal(draftAllowed(s,{...p,version:2},at),false);assert.equal(draftAllowed(s,{...p,scopeId:'Other'},at),false);assert.equal(draftAllowed(s,{...p,id:'f'},at),false);
 assert.ok(draftAllowed(s,{kind:'monthly',id:'r',version:3,intent:'transition',decision:'submit'},at));
 assert.equal(draftAllowed(s,{kind:'monthly',id:'r',version:3,intent:'transition',decision:'approve'},at),false);
 assert.equal(categoryValid(s,'d','attendance',at+2*day),false);assert.ok(draftAllowed(s,p,at+2*day));
 assert.equal(draftAllowed(s,p,at+7*day),false);
});
