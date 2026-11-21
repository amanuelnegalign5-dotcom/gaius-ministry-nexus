import test from 'node:test';
import assert from 'node:assert/strict';
import {canReadFile,canUploadFile,v11Command,v11State} from '../gaius-v11-core.js';

class DB {
 constructor(){this.buckets=new Map();}
 all(name){return [...(this.buckets.get(name)?.values()||[])];}
 one(name,id){return this.buckets.get(name)?.get(id)||null;}
 put(name,item){if(!this.buckets.has(name))this.buckets.set(name,new Map());this.buckets.get(name).set(item.id,item);}
}
const country={id:'director-a',role:'country_director',name:'Director A',accountStatus:'active'};
const international={id:'director-b',role:'international_director',name:'Director B',accountStatus:'active'};
const fullAdmin={id:'generic-admin',role:'assisting_staff',name:'Delegated administrator',fullAdmin:true,accountStatus:'active'};
const staff={id:'staff',role:'assisting_staff',name:'Staff',accountStatus:'active'};
const doc=(overrides={})=>({
 id:'personal-document',name:'confidential.pdf',type:'application/pdf',size:123,
 scopeType:'personal',scopeId:country.id,ownerId:country.id,status:'approved',allowedUserIds:[],...overrides
});
const isDenied=fn=>assert.throws(fn,e=>e?.message==='forbidden');

test('Director B and delegated Full Admin cannot list or read Director A private files',()=>{
 const db=new DB(),file=doc();db.put('v11_files',file);
 assert.equal(canReadFile(country,file),true);
 assert.equal(canReadFile(international,file),false);
 assert.equal(canReadFile(fullAdmin,file),false);
 assert.equal(canReadFile(staff,file),false);
 assert.deepEqual(v11State(db,international).v11.files,[]);
 assert.deepEqual(v11State(db,fullAdmin).v11.files,[]);
 assert.deepEqual(v11State(db,country).v11.files.map(x=>x.id),[file.id]);
});

test('an unrelated Director or delegated Full Admin cannot self-grant private document access',()=>{
 const db=new DB(),file=doc();
 db.put('v11_files',file);
 for(const user of [country,international,fullAdmin,staff])db.put('users',user);
 isDenied(()=>v11Command(db,international,'v11.filePermissions',{id:file.id,allowedUserIds:[international.id]}));
 isDenied(()=>v11Command(db,fullAdmin,'v11.filePermissions',{id:file.id,allowedUserIds:[fullAdmin.id]}));
 assert.deepEqual(db.one('v11_files',file.id).allowedUserIds,[]);
});

test('a private file owner may explicitly approve named readers; permission revocation is immediate',()=>{
 const db=new DB(),file=doc();
 db.put('v11_files',file);
 for(const user of [country,international,fullAdmin,staff])db.put('users',user);
 assert.deepEqual(v11Command(db,country,'v11.filePermissions',{id:file.id,allowedUserIds:[international.id]}),{id:file.id,count:1});
 assert.equal(canReadFile(international,db.one('v11_files',file.id)),true);
 assert.equal(canReadFile(fullAdmin,db.one('v11_files',file.id)),false);
 v11Command(db,country,'v11.filePermissions',{id:file.id,allowedUserIds:[]});
 assert.equal(canReadFile(international,db.one('v11_files',file.id)),false);
 assert.ok(db.all('audit').some(e=>e.action==='v11.file.permissions'));
});

test('pending or rejected personal file cannot be read by explicit recipients',()=>{
 for(const status of ['pending','rejected','removed']){
  assert.equal(canReadFile(international,doc({status,allowedUserIds:[international.id]})),false);
 }
 assert.equal(canReadFile(country,doc({status:'pending'})),true);
});

test('only active users may access or upload to document storage',()=>{
 const statuses=['pending','removed','suspended','disabled'];
 for(const status of statuses){
  const u={...country,accountStatus:status};
  assert.equal(canReadFile(u,doc()),false,status);
  assert.equal(canUploadFile(u,'personal',u.id),false,status);
 }
 const legacy={...country};delete legacy.accountStatus;
 assert.equal(canReadFile(legacy,doc()),true,'Legacy accounts without explicit status stay admitted');
});

test('organization file oversight remains available to an active Director',()=>{
 const org=doc({scopeType:'organization',scopeId:'org',ownerId:staff.id,status:'pending'});
 assert.equal(canReadFile(country,org),true);
 assert.equal(canReadFile(international,org),true);
 assert.equal(canReadFile(fullAdmin,org),true);
 assert.equal(canReadFile(staff,org),true);
 assert.equal(canReadFile({...staff,id:'other-user'},org),false);
});
