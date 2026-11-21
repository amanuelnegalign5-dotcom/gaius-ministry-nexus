import test from 'node:test';
import assert from 'node:assert/strict';
import {handle} from '../gaius-core.js';
const p=[...Array(12)].map(()=>true);
class MemoryDB{
 constructor(){this.map=new Map();}
 one(b,id){return this.map.get(b)?.get(id)||null;}
 all(b){return [...(this.map.get(b)||new Map()).values()];}
 put(b,v){if(!this.map.has(b))this.map.set(b,new Map());this.map.get(b).set(v.id,v);}
 drop(b,id){this.map.get(b)?.delete(id);}
 atomic(fn){return fn();}
}
const ctx=db=>({local:false,bootstrapAuthorized:true});
async function register(db,role,name,extra={}){return handle(db,'register',{
 username:name.toLowerCase(),password:'Strong-Pass9',role,name,phone:'+251900000000',email:name.toLowerCase()+'@example.com',accepted:p,...extra
},ctx(db));}
async function login(db,name){return (await handle(db,'login',{username:name.toLowerCase(),password:'Strong-Pass9'})).token;}
async function cmd(db,token,action,payload){return handle(db,'command',{action,payload,requestId:crypto.randomUUID()},{token});}
async function state(db,token){return handle(db,'state',{}, {token});}
test('both director roles share bootstrap validation, third claim is refused',async()=>{
 const d=new MemoryDB();await register(d,'country_director','Country');
 assert.equal((await handle(d,'info')).bootstrap,true);
 await register(d,'international_director','International');
 assert.equal((await handle(d,'info')).bootstrap,false);
 await assert.rejects(()=>register(d,'country_director','Imposter'),e=>e.message==='directorSlotTaken');
 await assert.rejects(()=>handle(d,'register',{username:'malicious',password:'GoodPassword9',role:'international_director',name:'Malicious',phone:'123',email:'m@example.com',accepted:p},{bootstrapAuthorized:false}),e=>e.message==='setupKey');
});
test('v11 record drafts private, submitted HQ reports shared among nine leaders',async()=>{
 const db=new MemoryDB();await register(db,'country_director','Country');
 await register(db,'followup_leader','Followup');await register(db,'media_leader','Media');
 const boss=await login(db,'Country');
 const members=(await state(db,boss)).users;
 for(const name of ['Followup','Media']){const u=members.find(x=>x.username===name.toLowerCase());await cmd(db,boss,'account.approve',{id:u.id,version:u._v});}
 const token=await login(db,'Followup');
 const saved=await cmd(db,token,'v11.save',{kind:'monthly',scopeType:'hq',scopeId:'Follow-up',data:{title:'Weekly review',month:'2026-11',activity:'Support',result:'Completed'}});
 let v=(await state(db,token)).v11.records.find(x=>x.id===saved.id);assert.equal(v.status,'draft');
 const mediaToken=await login(db,'Media');
 assert.equal((await state(db,mediaToken)).v11.records.some(x=>x.id===saved.id),false);
 await cmd(db,token,'v11.transition',{id:saved.id,version:v._v,decision:'submit'});
 v=(await state(db,boss)).v11.records.find(x=>x.id===saved.id);assert.equal(v.status,'submitted');
 assert.equal((await state(db,mediaToken)).v11.records.some(x=>x.id===saved.id),true);
 await assert.rejects(()=>cmd(db,mediaToken,'v11.transition',{id:saved.id,version:v._v,decision:'approve'}),e=>e.message==='forbidden');
 await cmd(db,boss,'v11.transition',{id:saved.id,version:v._v,decision:'approve'});
 assert.equal((await state(db,token)).v11.records.find(x=>x.id===saved.id).status,'approved');
 await assert.rejects(()=>cmd(db,token,'v11.save',{kind:'monthly',id:saved.id,version:v._v,data:{title:'Update',month:'2026-11',activity:'x',result:'y'}}),e=>['conflict','lockedRecord'].includes(e.message));
});
test('director personal notes are not shared, successor slots limited to two',async()=>{
 const db=new MemoryDB();await register(db,'country_director','Country');await register(db,'international_director','International');
 const a=await login(db,'Country'),b=await login(db,'International'),owner=(await state(db,a)).me;
 const x=await cmd(db,a,'v11.save',{kind:'manuals',scopeType:'personal',scopeId:owner.id,data:{title:'Personal notes',kind:'other',body:'confidential'}});
 assert.equal((await state(db,b)).v11.records.find(r=>r.id===x.id),undefined);
 const s1=await cmd(db,a,'v11.save',{kind:'succession',scopeType:'personal',scopeId:owner.id,data:{leaderId:owner.id,slot:'1',successorId:'user-1'}});
 assert.ok(s1.id);
 await assert.rejects(()=>cmd(db,a,'v11.save',{kind:'succession',scopeType:'personal',scopeId:owner.id,data:{leaderId:owner.id,slot:'1',successorId:'user-2'}}),e=>e.message==='slotOccupied');
});
test('offline local browser cannot self-issue director privilege',async()=>{
 const db=new MemoryDB();await assert.rejects(()=>handle(db,'register',{username:'x',role:'country_director',password:'Strong-Pass9'}, {local:true,bootstrapAuthorized:true}),e=>e.message==='directorRequiresServer');
});
test('center monthly report stays within its center leadership and the directors',async()=>{
 const db=new MemoryDB();await register(db,'country_director','Country');
 await register(db,'center_leader','GerjiLead',{center:'Gerji'});
 await register(db,'center_leader','MekanisaLead',{center:'Mekanisa'});
 await register(db,'center_department_leader','GerjiArts',{center:'Gerji',department:'Art and Literature Department'});
 const boss=await login(db,'Country');
 const us=(await state(db,boss)).users;
 for(const user of us.filter(x=>x.role.startsWith('center_'))){await cmd(db,boss,'account.approve',{id:user.id,version:user._v});}
 const arts=await login(db,'GerjiArts'),gerji=await login(db,'GerjiLead'),mekanisa=await login(db,'MekanisaLead');
 const created=await cmd(db,arts,'v11.save',{kind:'monthly',scopeType:'center',scopeId:'Gerji',data:{title:'Arts outreach',month:'2026-11',activity:'Training',result:'Progress'}});
 let r=(await state(db,arts)).v11.records.find(x=>x.id===created.id);
 await cmd(db,arts,'v11.transition',{id:r.id,version:r._v,decision:'submit'});
 // Center leader may review submitted reports for their own center before Director approval.
 assert.equal((await state(db,gerji)).v11.records.some(x=>x.id===r.id),true);
 r=(await state(db,boss)).v11.records.find(x=>x.id===r.id);
 await cmd(db,boss,'v11.transition',{id:r.id,version:r._v,decision:'approve'});
 assert.equal((await state(db,gerji)).v11.records.some(x=>x.id===r.id),true);
 assert.equal((await state(db,mekanisa)).v11.records.some(x=>x.id===r.id),false);
});
