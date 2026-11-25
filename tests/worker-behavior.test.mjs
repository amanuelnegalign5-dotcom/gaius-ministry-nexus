// Executes the real Worker code (not regexes on its source) against an in-memory SQLite
// stand-in for Durable Object storage. Covers origin lock, CORS, request validation,
// login throttling, Director registration gate, and upload validation/cleanup.
import test from 'node:test';
import assert from 'node:assert/strict';
import {DatabaseSync} from 'node:sqlite';
import worker,{MinistryWorkspace} from '../gaius-worker.js';
import {digest} from '../gaius-core.js';

const ORIGIN='https://example.github.io';

function fakeStorage(){
  const db=new DatabaseSync(':memory:');
  let depth=0;
  return {
    db,
    // Durable Object SQL takes ArrayBuffer blobs and returns them as ArrayBuffer; node:sqlite uses Uint8Array.
    sql:{exec:(q,...params)=>db.prepare(q).all(...params.map(v=>v instanceof ArrayBuffer?new Uint8Array(v):v))
      .map(row=>Object.fromEntries(Object.entries(row).map(([k,v])=>[k,v instanceof Uint8Array?v.slice().buffer:v])))},
    transactionSync(fn){
      if(depth>0)return fn();
      db.exec('BEGIN');depth++;
      try{const r=fn();db.exec('COMMIT');return r;}
      catch(e){db.exec('ROLLBACK');throw e;}
      finally{depth--;}
    }
  };
}
function setup(){
  const storage=fakeStorage();
  const room=new MinistryWorkspace({storage},{ALLOWED_ORIGIN:ORIGIN});
  const env={ALLOWED_ORIGIN:ORIGIN,WORKSPACE:{idFromName:n=>n,get:()=>room}};
  return {room,env,storage};
}
const post=(path,body,{ip='1.1.1.1',origin=ORIGIN,headers={}}={})=>new Request('https://api.test'+path,{
  method:'POST',
  headers:{'Content-Type':'application/json','Origin':origin,'CF-Connecting-IP':ip,...headers},
  body:JSON.stringify(body)
});

async function seedDirector(room){
  const user={id:'u1',name:'Test Director',username:'director',role:'country_director',accountStatus:'active',sessionVersion:0};
  room.db.put('users',user);
  const token='t'.repeat(64);
  room.db.put('sessions',{id:await digest(token),userId:user.id,epoch:0,until:Date.now()+3600000});
  return {user,token};
}
const upload=(token,{name='note.txt',type='text/plain',bytes=new TextEncoder().encode('hello')}={})=>new Request('https://api.test/file/upload',{
  method:'POST',
  headers:{'Authorization':'Bearer '+token,'Content-Type':type,'X-File-Name':encodeURIComponent(name),'X-Gaius-Scope':'personal','X-Gaius-Unit':'u1','Origin':ORIGIN},
  body:bytes
});

test('requests from other origins are denied before reaching the workspace',async()=>{
  const {env}=setup();
  const res=await worker.fetch(post('/info',{},{origin:'https://evil.example'}),env);
  assert.equal(res.status,403);
  assert.equal((await res.json()).error,'originDenied');
});

test('preflight succeeds only for the configured origin and echoes it',async()=>{
  const {env}=setup();
  const res=await worker.fetch(new Request('https://api.test/login',{method:'OPTIONS',headers:{Origin:ORIGIN}}),env);
  assert.equal(res.status,204);
  assert.equal(res.headers.get('Access-Control-Allow-Origin'),ORIGIN);
});

test('unknown routes, wrong methods and non-JSON bodies are rejected',async()=>{
  const {env}=setup();
  assert.equal((await worker.fetch(post('/nope',{}),env)).status,404);
  assert.equal((await worker.fetch(new Request('https://api.test/login',{method:'GET',headers:{Origin:ORIGIN}}),env)).status,405);
  const bad=new Request('https://api.test/login',{method:'POST',headers:{Origin:ORIGIN,'Content-Type':'text/plain'},body:'x'});
  assert.equal((await worker.fetch(bad,env)).status,415);
});

test('one attacker cannot lock a user out: login throttling is per username and address',async()=>{
  const {env}=setup();
  const attempt=ip=>worker.fetch(post('/login',{username:'victim',password:'wrong-password1'},{ip}),env);
  const statuses=[];
  for(let n=0;n<12;n++)statuses.push((await attempt('9.9.9.9')).status);
  assert.equal(statuses[0],401);
  assert.equal(statuses.at(-1),429,'the attacker address is throttled');
  const other=await attempt('8.8.8.8');
  assert.equal(other.status,401,'the real user on another address is not locked out');
});

test('Director accounts cannot be registered through the plain register route',async()=>{
  const {env}=setup();
  const res=await worker.fetch(post('/register',{role:'country_director',username:'x',password:'Password1',name:'X'}),env);
  assert.equal(res.status,403);
  assert.equal((await res.json()).error,'directorEmailVerificationRequired');
});

test('upload requires a valid session',async()=>{
  const {room}=setup();
  const res=await room.fetch(upload('f'.repeat(64)));
  assert.equal(res.status,401);
});

test('a valid text upload is stored as pending and is downloadable by its owner',async()=>{
  const {room}=setup();
  const {token}=await seedDirector(room);
  const res=await room.fetch(upload(token));
  assert.equal(res.status,200);
  const {id,status}=await res.json();
  assert.equal(status,'pending');
  const dl=await room.fetch(new Request('https://api.test/file/download',{method:'POST',headers:{Authorization:'Bearer '+token,'Content-Type':'application/json'},body:JSON.stringify({id})}));
  assert.equal(dl.status,200);
  assert.equal(dl.headers.get('X-Content-Type-Options'),'nosniff');
  assert.match(dl.headers.get('Content-Disposition'),/^attachment;/);
});

test('uploads whose bytes do not match the declared type are rejected',async()=>{
  const {room}=setup();
  const {token}=await seedDirector(room);
  const fakePdf=await room.fetch(upload(token,{name:'a.pdf',type:'application/pdf',bytes:new TextEncoder().encode('not a pdf')}));
  assert.equal(fakePdf.status,415);
  const binaryText=await room.fetch(upload(token,{name:'a.txt',type:'text/plain',bytes:new Uint8Array([104,105,0,1,2,3])}));
  assert.equal(binaryText.status,415,'binary content is not accepted as plain text');
  const mismatchedExt=await room.fetch(upload(token,{name:'a.exe',type:'text/plain'}));
  assert.equal(mismatchedExt.status,415);
});

test('a failed database write removes the just-stored blob',async()=>{
  const {room,storage}=setup();
  const {token}=await seedDirector(room);
  const original=room.db.put.bind(room.db);
  room.db.put=(bucket,r)=>{if(bucket==='v11_files')throw new Error('boom');return original(bucket,r);};
  const res=await room.fetch(upload(token));
  assert.equal(res.status,500);
  assert.equal((await res.json()).error,'serviceError','fails because of the injected database error');
  const [{n}]=storage.sql.exec('SELECT COUNT(*) AS n FROM private_media');
  assert.equal(n,0,'no orphaned blob remains');
});
