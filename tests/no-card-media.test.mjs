import test from 'node:test';
import assert from 'node:assert/strict';
import {DatabaseSync} from 'node:sqlite';
import {SqlPrivateMedia,privateMediaBucket,FREE_MEDIA_LIMIT,FREE_MEDIA_QUOTA} from '../gaius-sqlite-media.js';
function setup(){
 const db=new DatabaseSync(':memory:');
 const sql={exec(query,...args){const stmt=db.prepare(query);const params=args.map(v=>v instanceof ArrayBuffer?new Uint8Array(v):v);if(/^SELECT/i.test(query))return stmt.all(...params);stmt.run(...params);return [];}};
 const storage={sql,transactionSync(fn){db.exec('BEGIN');try{const v=fn();db.exec('COMMIT');return v;}catch(e){db.exec('ROLLBACK');throw e;}}};
 return {db,local:new SqlPrivateMedia(storage)};
}
test('no-card media stores exact bytes, text photos, quota and deletion in SQLite',async()=>{
 const {db,local}=setup(),b=privateMediaBucket(local);
 assert.equal(b.mode,'sqlite');assert.equal(b.maxFileBytes,FREE_MEDIA_LIMIT);
 await b.put('private/photo','sample');assert.equal(await (await b.get('private/photo')).text(),'sample');
 await b.put('private/doc',new Uint8Array([0,1,255]).buffer);
 assert.deepEqual(Array.from(new Uint8Array((await b.get('private/doc')).body)),[0,1,255]);
 assert.equal(db.prepare('SELECT size FROM private_media_usage').get().size,9);
 await assert.rejects(b.put('private/large',new ArrayBuffer(FREE_MEDIA_LIMIT+1)),/fileTooLarge/);
 db.prepare('UPDATE private_media_usage SET size=?').run(FREE_MEDIA_QUOTA);
 await assert.rejects(b.put('private/quota','a'),/mediaQuotaExceeded/);
 assert.equal(await b.get('private/quota'),null);
 await b.delete('private/photo');assert.equal(await b.get('private/photo'),null);
});
test('future R2 activation preserves existing private SQLite objects',async()=>{
 const {local}=setup(),old=privateMediaBucket(local);await old.put('private/old','previous');
 const remote=new Map(),r2={async put(k,v){remote.set(k,v)},async get(k){return remote.has(k)?{text:async()=>remote.get(k)}:null},async delete(k){remote.delete(k)}};
 const b=privateMediaBucket(local,r2);assert.equal(b.mode,'r2');assert.equal(await (await b.get('private/old')).text(),'previous');
 await b.put('private/new','next');assert.equal(remote.get('private/new'),'next');await b.delete('private/old');assert.equal(await b.get('private/old'),null);
});
