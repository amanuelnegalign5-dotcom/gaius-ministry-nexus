import test from 'node:test';
import assert from 'node:assert/strict';
import {handle,isMondayParticipant,centerRoles} from '../gaius-core.js';
class DB{
 constructor(){this.m=new Map();}
 all(b){return [...(this.m.get(b)||new Map()).values()];}
 one(b,id){return this.m.get(b)?.get(id)||null;}
 put(b,r){if(!this.m.has(b))this.m.set(b,new Map());this.m.get(b).set(r.id,r);}
 drop(b,id){this.m.get(b)?.delete(id);}
 atomic(fn){return fn();}
}
const call=(db,id,action,payload)=>handle(db,'command',{action,payload,requestId:crypto.randomUUID()},{local:true,legacyId:id});
test('every center-only role is denied Monday state, write, batch and delete even with stale broad permissions',async()=>{
 const db=new DB();
 db.put('users',{id:'director',name:'Director',role:'country_director',accountStatus:'active'});
 db.put('attendance',{id:'monday',personId:'director',date:'2026-11-23',programType:'regular',status:'present',_v:1});
 for(const role of centerRoles){
  const u={id:role,name:'Synthetic',role,center:'Gerji',department:'Worship Team',accountStatus:'active',fullAdmin:true,adminPermissions:['attendance']};
  db.put('users',u);
  assert.equal(isMondayParticipant(u),false);
  const state=await handle(db,'state',{}, {local:true,legacyId:u.id});assert.deepEqual(state.attendance,[]);
  const payload={bucket:'attendance',personId:'director',date:'2026-11-23',programType:'regular',status:'present'};
  await assert.rejects(call(db,u.id,'record.save',payload),/forbidden/);
  await assert.rejects(call(db,u.id,'attendance.batch',{date:payload.date,programType:payload.programType,rows:[payload]}),/forbidden/);
  await assert.rejects(call(db,u.id,'record.remove',{bucket:'attendance',id:'monday',version:1}),/forbidden/);
 }
 assert.equal(db.one('attendance','monday').status,'present');
});
test('Monday access requires a recognized staff assignment and excludes onboarding',()=>{
 for(const role of ['country_director','international_director','monday_leader','hq_staff','staff','international_staff','assisting_staff','prayer_staff']){
  assert.equal(isMondayParticipant({role,accountStatus:'active'}),true);
  assert.equal(isMondayParticipant({role,accountStatus:'active',onboarding:true}),false);
 }
 assert.equal(isMondayParticipant({role:'unknown',accountStatus:'active'}),false);
 assert.equal(isMondayParticipant({role:'hq_staff',center:'Gerji',accountStatus:'active'}),false);
});
test('center assignment rejects missing department and Monday staff department on registration and direct admin invitation',async()=>{
 const db=new DB();db.put('users',{id:'d',name:'Director',role:'country_director',accountStatus:'active'});
 const base={role:'center_leader',name:'Synthetic',username:'synthetic',password:'Secure-Pass9',center:'Gerji'};
 await assert.rejects(call(db,'d','account.add',{...base,department:''}),/departmentRequired/);
 await assert.rejects(call(db,'d','account.add',{...base,department:'Monday Staff Program'}),/departmentScopeMismatch/);
 const r=await call(db,'d','account.add',{...base,department:'Worship Team'});assert.equal(db.one('users',r.id).center,'Gerji');
});
