import test from 'node:test';
import assert from 'node:assert/strict';
import {deriveKey,seal,unseal,offlineSnapshot,draftAllowed,snapshotValid,MAX_AGE} from '../gaius-offline-vault.js';
const state={me:{id:'c',role:'center_leader',center:'East'},authorization:{offlineMondayRoster:[]},v11:{records:[{private:'not cached'}],capabilities:{createScopes:{monthly:[{scopeType:'center',scopeId:'East'}],centerAttendance:[{scopeType:'center',scopeId:'East'}],succession:[{scopeType:'center',scopeId:'East'}]},attendanceParticipants:[{id:'p',name:'Synthetic',center:'East',email:'secret'}]}}};
test('offline scope, expiry and privacy',()=>{
 const s=offlineSnapshot(state),p={kind:'monthly',scopeType:'center',scopeId:'East',data:{title:'Draft'}};
 assert.ok(draftAllowed(s,p));assert.equal(draftAllowed(s,{...p,scopeId:'West'}),false);assert.equal(draftAllowed(s,{...p,id:'existing'}),false);assert.equal(draftAllowed(s,{...p,data:{fileId:'secret'}}),false);
 assert.equal(s.records,undefined);assert.equal(s.createScopes.succession,undefined);assert.equal(s.participants[0].email,undefined);assert.equal(snapshotValid(s,'c',s.at+MAX_AGE),false);assert.equal(snapshotValid(s,'other'),false);
});
test('attendance respects Monday and Sunday separation',()=>{
 const s=offlineSnapshot(state),p={kind:'centerAttendance',scopeType:'center',scopeId:'East',data:{participantId:'p',eventType:'sunday',date:'2026-11-29',attendance:'present'}};
 assert.ok(draftAllowed(s,p));assert.equal(draftAllowed(s,{...p,data:{...p.data,eventType:'weekly',date:'2026-11-30'}}),false);
 const m={kind:'mondayAttendance',data:{personId:'staff',date:'2026-11-30',status:'present',programType:'regular'}};
 assert.equal(draftAllowed(s,m),false);assert.ok(draftAllowed(offlineSnapshot({...state,authorization:{offlineMondayRoster:[{id:'staff'}]}}),m));
});
test('AES-GCM rejects wrong passphrase and modified ciphertext',async()=>{
 const salt=crypto.getRandomValues(new Uint8Array(16)),key=await deriveKey('long-passphrase-test',salt),wrong=await deriveKey('wrong-passphrase-test',salt);
 const value={title:'private synthetic draft'},box=await seal(key,value,'draft:c:one');
 assert.deepEqual(await unseal(key,box,'draft:c:one'),value);await assert.rejects(unseal(wrong,box,'draft:c:one'));await assert.rejects(unseal(key,box,'draft:other:one'));box.cipher[0]^=1;await assert.rejects(unseal(key,box,'draft:c:one'));
});
