import test from 'node:test';
import assert from 'node:assert/strict';
import {privatePhotoCommand} from '../gaius-private-media.js';
import {v11Grant} from '../gaius-grant-bridge.js';
import {v11State,v11Command,canUploadFile,canReadFile} from '../gaius-v11-core.js';
import {isMondayParticipant} from '../gaius-core.js';
import {readFileSync} from 'node:fs';

function photoFixture(){
 let version=1,key=null,oldData='legacy',serial=0,revoked=false,conflict=false;
 const objects=new Map();
 const bucket={async put(k,v){objects.set(k,v)},async get(k){return objects.has(k)?{text:async()=>objects.get(k)}:null},async delete(k){objects.delete(k)}};
 const run=media=>{
  if(revoked)throw Error('forbidden');
  if(media?.prepare)return {version,previousKey:key};
  if(!media)return key?{storageKey:key}:{data:oldData};
  if(conflict||media.expectedVersion!==version)throw Error('conflict');
  const previousKey=key;key=media.storageKey||null;oldData=null;version++;
  return {previousKey};
 };
 const call=(action,payload={},b=bucket)=>privatePhotoCommand({action,payload,bucket:b,run,revalidate:async()=>{if(revoked)throw Error('forbidden')},idFactory:()=>String(++serial)});
 return {objects,call,revoke(){revoked=true},conflict(){conflict=true}};
}
test('private R2 photo adapter preserves legacy reads, replaces and removes private objects',async()=>{
 const f=photoFixture();
 assert.equal((await f.call('governance.photo')).data,'legacy');
 await f.call('governance.setPhoto',{data:'test-image'});
 assert.deepEqual([...f.objects.values()],['test-image']);
 assert.deepEqual(await f.call('governance.photo'),{data:'test-image'});
 await f.call('governance.setPhoto',{data:'replacement'});
 assert.deepEqual([...f.objects.values()],['replacement']);
 await f.call('governance.setPhoto',{remove:true});
 assert.equal(f.objects.size,0);
});
test('new photo uploads fail closed without the R2 binding and failed commits clean up new objects',async()=>{
 const f=photoFixture();
 await assert.rejects(f.call('governance.setPhoto',{data:'test-image'},null),/storageNotConfigured/);
 f.conflict();
 await assert.rejects(f.call('governance.setPhoto',{data:'test-image'}),/conflict/);
 assert.equal(f.objects.size,0);
});
test('revoked sessions cannot retrieve private photos',async()=>{
 const f=photoFixture();await f.call('governance.setPhoto',{data:'test-image'});f.revoke();
 await assert.rejects(f.call('governance.photo'),/forbidden/);
});
function fixture(){
 const d={id:'d',role:'country_director',name:'Director',accountStatus:'active'};
 const h={id:'h',role:'followup_leader',department:'Follow-up',name:'HQ',accountStatus:'active'};
 const p={id:'p',role:'potential_center_leader',center:'East',name:'Potential',accountStatus:'active'};
 const fake={id:'f',role:'center_leader',center:'West',fullAdmin:true,accountStatus:'active'};
 const rows=[{id:'east',kind:'center',name:'East',region:'country',status:'active'},{id:'west',kind:'center',name:'West',region:'country',status:'active'}];
 const record={id:'r',kind:'monthly',scopeType:'center',scopeId:'East',status:'submitted',ownerId:'x',_v:1,data:{title:'Report'},history:[]};
 const g={id:'g',issuerId:'d',recipientId:'h',status:'active',type:'delegation',scope:'east',modules:['center_reports'],actions:['view','approve'],startsAt:'2025-01-01T00:00:00Z',endsAt:'2099-01-01T00:00:00Z'};
 const map=new Map([['users',[d,h,p,fake]],['governance_records',rows],['governance_grants',[g]],['v11_records',[record]]]);
 const db={all:k=>map.get(k)||[],one(k,id){return this.all(k).find(r=>r.id===id)||null},put(k,r){map.set(k,[...this.all(k).filter(x=>x.id!==r.id),r])}};
 return {d,h,p,fake,record,g,db};
}
test('legacy v11 report reads and approvals obey explicit timed scoped grants',()=>{
 const {h,record,g,db}=fixture();assert.equal(v11Grant(db,h,record,'view'),true);
 assert.equal(v11Grant(db,h,{...record,scopeId:'West'},'view'),false);
 assert.equal(v11Grant(db,h,{...record,scopeType:'personal'},'view'),false);
 assert.equal(v11Grant(db,h,record,'view',Date.parse(g.endsAt)),false);
 assert.ok(v11State(db,h).v11.records.some(r=>r.id===record.id&&r.delegatedApproval));
 v11Command(db,h,'v11.transition',{id:record.id,version:1,decision:'approve'});
 assert.equal(db.one('v11_records',record.id).status,'approved');
 db.put('governance_grants',{...g,status:'revoked'});
 assert.equal(v11State(db,h).v11.records.some(r=>r.id===record.id),false);
});
test('potential leaders read submitted same-center reports; legacy fullAdmin does not impersonate a director',()=>{
 const {p,fake,record,db}=fixture();
 assert.ok(v11State(db,p).v11.records.some(r=>r.id===record.id));
 assert.equal(v11State(db,fake).v11.capabilities.director,false);
 assert.equal(v11State(db,fake).v11.records.some(r=>r.id===record.id),false);
});
test('Monday eligibility denies every center-only role even when fullAdmin is present',()=>{
 for(const role of ['center_senior_leader','center_leader','center_department_leader','potential_center_leader','potential_department_leader','volunteer'])
  assert.equal(isMondayParticipant({id:'c',role,center:'East',fullAdmin:true,accountStatus:'active'}),false);
 for(const role of ['country_director','international_director','hq_staff','monday_leader'])
  assert.equal(isMondayParticipant({id:'s',role,accountStatus:'active'}),true);
});
test('deployment configuration, Pages package and cache include required private storage and shared policy',()=>{
 const config=JSON.parse(readFileSync(new URL('../wrangler.jsonc',import.meta.url),'utf8'));
 assert.equal(config.r2_buckets,undefined,'Default deployment cannot require a paid-activation R2 binding');
 const worker=readFileSync(new URL('../gaius-worker.js',import.meta.url),'utf8');
 assert.match(worker,/privateMediaBucket\(new SqlPrivateMedia\(ctx.storage\),env.MEDIA_BUCKET\)/);
 assert.ok(config.durable_objects.bindings.some(b=>b.name==='WORKSPACE'));
 const pages=readFileSync(new URL('../.github/workflows/static.yml',import.meta.url),'utf8');
 const sw=readFileSync(new URL('../sw.js',import.meta.url),'utf8');
 assert.match(pages,/gaius-grant-bridge\.js/);assert.match(sw,/gaius-grant-bridge\.js/);
 assert.doesNotMatch(sw,/gaius-private-media\.js/);
});

test('scoped grant creates the same UI capability and backend authority, then revocation removes both',()=>{
 const {h,db,g}=fixture();
 db.put('governance_grants',{...g,modules:['center_reports'],actions:['view','create','edit']});
 const state=()=>v11State(db,h).v11;
 assert.ok(state().capabilities.createScopes.monthly.some(x=>x.scopeType==='center'&&x.scopeId==='east'));
 assert.ok(!state().capabilities.createScopes.monthly.some(x=>x.scopeId==='west'));
 const data={title:'Synthetic report',month:'2026-11',activity:'Training',result:'Completed'};
 const save=(scopeId)=>v11Command(db,h,'v11.save',{kind:'monthly',scopeType:'center',scopeId,data});
 assert.throws(()=>save('West'),/forbidden/);
 const id=save('East').id;const record=state().records.find(x=>x.id===id);
 assert.ok(record?.actions.edit);assert.ok(record.actions.submit);assert.equal(record.actions.approve,false);
 v11Command(db,h,'v11.save',{kind:'monthly',id,version:record._v,data:{...data,title:'Revised'}});
 db.put('governance_grants',{...g,status:'revoked'});
 assert.ok(!state().capabilities.createScopes.monthly.some(x=>x.scopeId==='east'));
 assert.ok(!state().records.some(x=>x.id===id));
 assert.throws(()=>save('East'),/forbidden/);
});
test('create-only and edit-only grants do not silently authorize other actions',()=>{
 const {h,db,g}=fixture();
 db.put('governance_grants',{...g,modules:['center_reports'],actions:['create']});
 const data={title:'Synthetic',month:'2026-11',activity:'Training',result:'Done'};
 const id=v11Command(db,h,'v11.save',{kind:'monthly',scopeType:'center',scopeId:'East',data}).id;
 const r=v11State(db,h).v11.records.find(x=>x.id===id);
 assert.equal(r.actions.edit,false);
 assert.throws(()=>v11Command(db,h,'v11.save',{kind:'monthly',id,version:r._v,data}),/forbidden/);
 db.put('governance_grants',{...g,modules:['center_reports'],actions:['edit']});
 assert.equal(v11State(db,h).v11.records.find(x=>x.id===id).actions.edit,true);
 assert.throws(()=>v11Command(db,h,'v11.save',{kind:'monthly',scopeType:'center',scopeId:'East',data}),/forbidden/);
});
test('document grant scope governs upload and file retrieval; personal and other centers stay protected',()=>{
 const {h,db,g}=fixture();db.put('governance_grants',{...g,modules:['documents'],actions:['view','create']});
 assert.equal(canUploadFile(h,'center','East',db),true);
 assert.equal(canUploadFile(h,'center','West',db),false);
 const f={id:'file',kind:'documents',scopeType:'center',scopeId:'East',ownerId:'other',status:'approved'};
 assert.equal(canReadFile(h,f,db),true);
 assert.equal(canReadFile(h,{...f,status:'pending'},db),false);
 assert.equal(canReadFile(h,{...f,scopeId:'West'},db),false);
 assert.equal(canReadFile(h,{...f,scopeType:'personal'},db),false);
 db.put('governance_grants',{...g,status:'revoked'});
 assert.equal(canReadFile(h,f,db),false);
 assert.equal(canUploadFile(h,'center','East',db),false);
});
