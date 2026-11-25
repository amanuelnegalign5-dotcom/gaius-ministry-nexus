// Private SQLite fallback for accounts without an R2 subscription.
// Never expose the database or bucket directly; the authenticated Worker controls access.
export const FREE_MEDIA_LIMIT=1024*1024;
export const FREE_MEDIA_QUOTA=128*1024*1024;
export class SqlPrivateMedia {
 constructor(storage){
  this.storage=storage;this.sql=storage.sql;
  this.sql.exec('CREATE TABLE IF NOT EXISTS private_media (key TEXT PRIMARY KEY, bytes BLOB NOT NULL, size INTEGER NOT NULL)');
  this.sql.exec('CREATE TABLE IF NOT EXISTS private_media_usage (id INTEGER PRIMARY KEY CHECK(id=1), size INTEGER NOT NULL)');
  this.sql.exec('INSERT OR IGNORE INTO private_media_usage(id,size) SELECT 1,COALESCE(SUM(size),0) FROM private_media');
 }
 get(key){const [r]=this.sql.exec('SELECT bytes FROM private_media WHERE key=?',key);return r?.bytes??null;}
 put(key,bytes){
  this.storage.transactionSync(()=>{
   const [old]=this.sql.exec('SELECT size FROM private_media WHERE key=?',key);
   const [usage]=this.sql.exec('SELECT size FROM private_media_usage WHERE id=1');
   const total=usage.size-(old?.size||0)+bytes.byteLength;
   if(total>FREE_MEDIA_QUOTA)throw Object.assign(new Error('mediaQuotaExceeded'),{status:507});
   this.sql.exec('INSERT INTO private_media(key,bytes,size) VALUES(?,?,?) ON CONFLICT(key) DO UPDATE SET bytes=excluded.bytes,size=excluded.size',key,bytes,bytes.byteLength);
   this.sql.exec('UPDATE private_media_usage SET size=? WHERE id=1',total);
  });
 }
 delete(key){return this.storage.transactionSync(()=>{
   const [old]=this.sql.exec('SELECT size FROM private_media WHERE key=?',key);
   if(!old)return false;
   this.sql.exec('DELETE FROM private_media WHERE key=?',key);
   this.sql.exec('UPDATE private_media_usage SET size=size-? WHERE id=1',old.size);
   return true;
 });}
}
export function privateMediaBucket(local,r2=null){
 return {
  maxFileBytes:r2?10*1024*1024:FREE_MEDIA_LIMIT,
  mode:r2?'r2':'sqlite',
  async put(key,value,options){
   if(r2)return r2.put(key,value,options);
   const bytes=typeof value==='string'?new TextEncoder().encode(value).buffer:value instanceof ArrayBuffer?value:ArrayBuffer.isView(value)?value.buffer.slice(value.byteOffset,value.byteOffset+value.byteLength):null;
   if(!bytes||!bytes.byteLength||bytes.byteLength>FREE_MEDIA_LIMIT)throw Object.assign(new Error('fileTooLarge'),{status:413});
   local.put(key,bytes);
  },
  async get(key){
   const bytes=local.get(key);
   if(bytes!==null)return {body:bytes,text:async()=>new TextDecoder().decode(bytes)};
   return r2?await r2.get(key):null;
  },
  async delete(key){if(local.delete(key))return;if(r2)await r2.delete(key);}
 };
}
