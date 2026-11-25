import test from 'node:test';
import assert from 'node:assert/strict';
import {v11Command,v11State,offlineFileEligible,approveFile} from '../gaius-v11-core.js';
class DB{constructor(){this.m=new Map()}all(b){return [...(this.m.get(b)||new Map()).values()]}one(b,id){return this.m.get(b)?.get(id)||null}put(b,r){if(!this.m.has(b))this.m.set(b,new Map());this.m.get(b).set(r.id,r)}}
const d={id:'d',role:'country_director',name:'Director'},u={id:'c',role:'center_leader',center:'East',name:'Center'};
test('only directors can classify an eligible approved organizational document, permissions changes revoke its flag',()=>{
 const db=new DB();db.put('users',d);db.put('users',u);
 const f={id:'f',scopeType:'organization',scopeId:'org',name:'Manual.pdf',type:'application/pdf',status:'approved',ownerId:d.id,size:20,createdAt:'2026-11-25T00:00:00.000Z'};
 db.put('v11_files',f);
 assert.equal(offlineFileEligible(f),true);assert.equal(offlineFileEligible({...f,scopeType:'personal'}),false);
 assert.equal(offlineFileEligible({...f,type:'image/png'}),false);
 assert.throws(()=>v11Command(db,u,'v11.fileOfflinePolicy',{id:'f',enabled:true,version:f.createdAt}),/forbidden/);
 assert.throws(()=>v11Command(db,d,'v11.fileOfflinePolicy',{id:'f',enabled:true,version:'stale'}),/conflict/);
 v11Command(db,d,'v11.fileOfflinePolicy',{id:'f',enabled:true,version:f.createdAt});
 assert.equal(v11State(db,d).v11.files[0].offlineAllowed,true);
 v11Command(db,d,'v11.filePermissions',{id:'f',allowedUserIds:[u.id]});
 assert.equal(db.one('v11_files','f').offlineAllowed,false);
 const next=db.one('v11_files','f');v11Command(db,d,'v11.fileOfflinePolicy',{id:'f',enabled:true,version:next.updatedAt});
 approveFile(db,d,'f','rejected');assert.equal(db.one('v11_files','f').offlineAllowed,false);
});
