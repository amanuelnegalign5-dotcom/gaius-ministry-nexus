import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {canReadFile,canUploadFile,v11Command} from '../gaius-v11-core.js';

const director={id:'director',role:'country_director',name:'Country Director',accountStatus:'active'};
const hq={id:'hq',role:'media_leader',department:'Media',name:'Media leader',accountStatus:'active'};
const other={id:'other',role:'followup_leader',department:'Follow-up',name:'Follow-up',accountStatus:'active'};
const center={id:'center',role:'center_leader',center:'Gerji',name:'Center lead',accountStatus:'active'};
const staff={id:'staff',role:'assisting_staff',name:'Staff',accountStatus:'active'};
const full={id:'admin',role:'assisting_staff',name:'Granted Admin',accountStatus:'active',fullAdmin:true};
const file=(extra={})=>({id:'one',name:'file.pdf',type:'application/pdf',size:100,scopeType:'hq',scopeId:'Media',ownerId:'hq',status:'pending',...extra});
const db=()=>{
 const buckets=new Map();
 return {one:(k,id)=>buckets.get(k)?.get(id),
 all:k=>[...(buckets.get(k)?.values()||[])],
 put:(k,x)=>{if(!buckets.has(k))buckets.set(k,new Map());buckets.get(k).set(x.id,x);}};
};
test('pending documents are visible only to the owner and directors',()=>{
 const f=file();
 assert.equal(canReadFile(hq,f),true);
 assert.equal(canReadFile(director,f),true);
 assert.equal(canReadFile(other,f),false);
 assert.equal(canReadFile(center,f),false);
 assert.equal(canReadFile(staff,f),false);
 assert.equal(canReadFile({...staff,id:'gone',accountStatus:'removed'},f),false);
});
test('approved documents allow scoped HQ access or explicit user grants, never unrelated staff by default',()=>{
 const f=file({status:'approved'});
 assert.equal(canReadFile(hq,f),true);
 assert.equal(canReadFile(other,f),false);
 assert.equal(canReadFile(center,f),false);
 assert.equal(canReadFile(staff,f),false);
 assert.equal(canReadFile(staff,{...f,allowedUserIds:['staff']}),true);
 assert.equal(canReadFile(other,{...f,allowedUserIds:['other']}),true);
 assert.equal(canReadFile(staff,{...f,status:'rejected',allowedUserIds:['staff']}),false);
});
test('personal files remain private unless approved and explicitly granted by director',()=>{
 const f=file({scopeType:'personal',scopeId:'hq',status:'approved',allowedUserIds:[]});
 assert.equal(canReadFile(hq,f),true);
 assert.equal(canReadFile(other,f),false);
 assert.equal(canReadFile(other,{...f,allowedUserIds:['other']}),true);
});
test('only director can change explicit recipients, and the change is audited',()=>{
 const d=db(),f=file({status:'approved'});d.put('v11_files',f);
 for(const u of [hq,other,center,staff,full])d.put('users',u);
 assert.throws(()=>v11Command(d,hq,'v11.filePermissions',{id:'one',allowedUserIds:['staff']}),/forbidden/);
 assert.deepEqual(v11Command(d,director,'v11.filePermissions',{id:'one',allowedUserIds:['staff','staff']}),{id:'one',count:1});
 assert.deepEqual(d.one('v11_files','one').allowedUserIds,['staff']);
 assert.ok(d.all('audit').some(x=>x.action==='v11.file.permissions'));
 assert.throws(()=>v11Command(d,director,'v11.filePermissions',{id:'one',allowedUserIds:['unknown']}),/invalidRecipients/);
 assert.equal(canReadFile(staff,d.one('v11_files','one')),true);
 v11Command(d,director,'v11.filePermissions',{id:'one',allowedUserIds:[]});
 assert.equal(canReadFile(staff,d.one('v11_files','one')),false);
});
test('general staff need explicit permission to upload; center/HQ users remain scope limited',()=>{
 assert.equal(canUploadFile(staff,'personal','staff'),false);
 assert.equal(canUploadFile({...staff,adminPermissions:['v11:upload_file']},'personal','staff'),true);
 assert.equal(canUploadFile({...staff,adminPermissions:['v11:upload_file']},'personal','other'),false);
 assert.equal(canUploadFile(center,'center','Gerji'),true);
 assert.equal(canUploadFile(center,'center','Mekanisa'),false);
 assert.equal(canUploadFile(hq,'hq','Media'),true);
 assert.equal(canUploadFile(hq,'hq','Follow-up'),false);
});
test('frontend and worker support PPTX, XLSX, DOCX, PDFs and images, with protected endpoint',()=>{
 const worker=readFileSync(new URL('../gaius-worker.js',import.meta.url),'utf8');
 const ui=readFileSync(new URL('../gaius-v11-ui.js',import.meta.url),'utf8');
 const index=readFileSync(new URL('../index.html',import.meta.url),'utf8');
 assert.match(worker,/application\/vnd\.openxmlformats-officedocument\.presentationml\.presentation/);
 assert.match(worker,/application\/vnd\.openxmlformats-officedocument\.spreadsheetml\.sheet/);
 assert.match(worker,/authenticatedUser\(this\.db,token\)/);
 assert.match(ui,/v11\.filePermissions/);
 assert.match(ui,/previewFile/);
 assert.doesNotMatch(index,/gaius-login-hero|gaius-login\.png/);
 assert.match(index,/icons\/gaius-white-logo\.webp/);
 assert.match(index,/gaius-brand\.css/);
});
