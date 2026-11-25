import test from 'node:test';
import assert from 'node:assert/strict';
import {offlineSnapshot,draftAllowed,categoryValid,mergeOfflineEdit,seal,unseal,deriveKey,SNAPSHOT_MAX_BYTES} from '../gaius-offline-vault.js';
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

test('independent edits merge against current version, overlapping fields remain conflicts',()=>{
 const base={_v:3,status:'draft',data:{title:'Initial',result:'Before',planned:10}};
 const payload={kind:'monthly',id:'r',version:3,scopeType:'hq',scopeId:'Media',data:{title:'Initial',result:'Local result',planned:'10'}};
 const live={...record,_v:4,data:{title:'Server title',result:'Before',planned:10}};
 const merged=mergeOfflineEdit({payload,base},live);
 assert.deepEqual(merged.payload.data,{title:'Server title',result:'Local result',planned:10});
 assert.equal(merged.payload.version,4);
 assert.deepEqual(mergeOfflineEdit({payload,base},{...live,data:{...live.data,result:'Server result'}}),{conflicts:['result']});
 assert.equal(mergeOfflineEdit({payload,base},{...live,actions:{edit:false}}),null);
 assert.equal(mergeOfflineEdit({payload,base},{...live,data:{...live.data,fileId:'attachment'}}),null);
 assert.equal(mergeOfflineEdit({payload,base},{...live,status:'approved'}),null);
 assert.equal(mergeOfflineEdit({payload:{...payload,kind:'centerAttendance'},base},{...live,kind:'centerAttendance'}),null);
});
test('compact encrypted storage reads legacy array ciphertext and excludes unclassified files',async()=>{
 const key=await deriveKey('long-test-passphrase',crypto.getRandomValues(new Uint8Array(16)));
 const box=await seal(key,{example:'text'},'a');assert.ok(box.cipher instanceof Uint8Array);
 assert.deepEqual(await unseal(key,{iv:Array.from(box.iv),cipher:Array.from(box.cipher)},'a'),{example:'text'});
 assert.equal(SNAPSHOT_MAX_BYTES,20*1024*1024);
 const f={id:'a',name:'Manual.pdf',type:'application/pdf',size:20,status:'approved',scopeType:'organization',scopeId:'org',offlineAllowed:true,createdAt:'2026-11-25'};
 const s=offlineSnapshot({...state,v11:{...state.v11,files:[f,{...f,id:'b',offlineAllowed:false},{...f,id:'c',scopeType:'personal'},{...f,id:'d',type:'image/png'}]}},at,true);
 assert.deepEqual(s.offlineFiles.map(f=>f.id),['a']);
 assert.deepEqual(offlineSnapshot({...state,authorization:{...state.authorization,offlineLease:{issuedAt:at,operationsUntil:at+day,attendanceUntil:at}},v11:{...state.v11,files:[f]}},at,true).offlineFiles,[]);
});
