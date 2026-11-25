// Optional shared service. Wrangler bundles this module with gaius-core.js.
import { AppError, digest, handle, authenticatedUser } from './gaius-core.js';
import {canReadFile,canUploadFile} from './gaius-v11-core.js';
import {governanceService,GOVERNANCE_CATALOG} from './gaius-governance-service.js';
import {privatePhotoCommand} from './gaius-private-media.js';
import { RecoveryService, recoveryReady } from './gaius-recovery.js';

class SqlRecords {
  constructor(storage) {
    this.storage=storage;
    this.sql=storage.sql;
    this.sql.exec('CREATE TABLE IF NOT EXISTS records (bucket TEXT NOT NULL, id TEXT NOT NULL, body TEXT NOT NULL, PRIMARY KEY(bucket,id))');
    this.sql.exec('CREATE TABLE IF NOT EXISTS attempts (key TEXT PRIMARY KEY, hits INTEGER NOT NULL, expires INTEGER NOT NULL)');
  }
  all(bucket){return Array.from(this.sql.exec('SELECT body FROM records WHERE bucket=? ORDER BY rowid',bucket),r=>JSON.parse(r.body));}
  one(bucket,id){const [row]=this.sql.exec('SELECT body FROM records WHERE bucket=? AND id=?',bucket,id);return row?JSON.parse(row.body):null;}
  put(bucket,r){this.sql.exec('INSERT INTO records(bucket,id,body) VALUES(?,?,?) ON CONFLICT(bucket,id) DO UPDATE SET body=excluded.body',bucket,r.id,JSON.stringify(r));}
  drop(bucket,id){this.sql.exec('DELETE FROM records WHERE bucket=? AND id=?',bucket,id);}
  eraseAttempts(hashes){
    if(!hashes)return;
    this.sql.exec('DELETE FROM attempts WHERE key IN (?, ?)',
      'login-user:'+hashes.username,'recovery-address:'+hashes.email);
  }
  atomic(fn){return this.storage.transactionSync(fn);}
  limit(key,max,windowMs=600000){
    const t=Date.now();
    this.sql.exec('DELETE FROM attempts WHERE expires<=?',t);
    const [r]=this.sql.exec('INSERT INTO attempts(key,hits,expires) VALUES(?,1,?) ON CONFLICT(key) DO UPDATE SET hits=hits+1 RETURNING hits',key,t+windowMs);
    if(r.hits>max)throw new AppError('rateLimited',429);
  }
}
const json=(body,status=200,headers={})=>new Response(JSON.stringify(body),{status,headers:{'Content-Type':'application/json; charset=utf-8','Cache-Control':'no-store','X-Content-Type-Options':'nosniff',...headers}});
export class MinistryWorkspace {
  constructor(ctx,env){this.db=new SqlRecords(ctx.storage);this.env=env;this.recovery=new RecoveryService(this.db,env);}
  async fetch(request){
    try{
      const pathname=new URL(request.url).pathname;
      if(pathname==='/file/upload')return await this.upload(request);
      if(pathname==='/file/download')return await this.download(request);
      const route=new URL(request.url).pathname.slice(1);
      if(!['info','register','login','logout','state','command','password/request','password/confirm','email/request','email/confirm','director/challenge','director/claim'].includes(route))throw new AppError('unknown',404);
      if(request.method!=='POST')throw new AppError('unknown',405);
      if(!request.headers.get('Content-Type')?.startsWith('application/json'))throw new AppError('unknown',415);
      if(['register','login','password/request','password/confirm','email/request','email/confirm','director/challenge','director/claim'].includes(route)){
        const tag=await digest(request.headers.get('CF-Connecting-IP')||'unavailable');
        const limits={'register':[20,600000],'login':[30,600000],'password/request':[12,3600000],
          'password/confirm':[35,600000],'email/request':[12,3600000],'email/confirm':[35,600000],'director/challenge':[8,3600000],'director/claim':[20,3600000]};
        this.db.limit('ip:'+route+':'+tag,...limits[route]);
      }
      if(Number(request.headers.get('Content-Length')||0)>3600000)throw new AppError('fileInvalid',413);
      const raw=await request.text();if(raw.length>3600000)throw new AppError('fileInvalid',413);
      let data;try{data=JSON.parse(raw||'{}');}catch{throw new AppError('unknown',400);}
      if(!data||Array.isArray(data)||typeof data!=='object')throw new AppError('unknown',400);
      const token=(request.headers.get('Authorization')||'').replace(/^Bearer /,'');
      if(route==='info')return json({...(await handle(this.db,route,data,{token})),emailRecovery:recoveryReady(this.env)});
      if(route==='login' && typeof data.username==='string')
        this.db.limit('login-user:'+await digest(data.username.trim().toLowerCase()),20,600000);
      if(route==='password/request' || route==='email/request'){
        this.recovery.requireEnabled();
        if(route==='password/request'){
          // Throttle both known and unknown addresses without storing the address in the attempt key.
          if(typeof data.email==='string')this.db.limit('recovery-address:'+await digest(data.email.trim().toLowerCase()),6,3600000);
          return json(await this.recovery.requestPassword(data));
        }
        return json(await this.recovery.requestEmailChange(data,token));
      }
      if(route==='password/confirm' || route==='email/confirm')
        return json(await this.recovery.verify(data,route==='password/confirm'?'password':'email-change',token));
      // First-time Director issuance requires BOTH the shared setup key and
      // proof of control of the corresponding pre-authorized email address.
      if(route==='director/challenge'||route==='director/claim'){
        this.recovery.requireEnabled();
        const claim=route==='director/claim',registration=claim?data.registration:data;
        const role=String(registration?.role||''),email=String(registration?.email||'').trim().toLowerCase();
        if(!['country_director','international_director'].includes(role))throw new AppError('directorRoleInvalid',403);
        const authorized=String(role==='country_director'?this.env.COUNTRY_DIRECTOR_EMAIL||'':this.env.INTERNATIONAL_DIRECTOR_EMAIL||'').trim().toLowerCase();
        if(!authorized||email!==authorized)throw new AppError('directorEmailNotAuthorized',403);
        if(typeof this.env.SETUP_KEY!=='string'||!this.env.SETUP_KEY||typeof registration.setupKey!=='string'||
            (await digest(registration.setupKey))!==(await digest(this.env.SETUP_KEY)))throw new AppError('setupKey',403);
        if(this.db.all('users').some(u=>u.role===role))throw new AppError('directorSlotTaken',409);
        const otpId=this.recovery.keyFor('director-bootstrap','bootstrap:'+role);
        if(!claim){
          await this.recovery.issue('director-bootstrap',{id:'bootstrap:'+role},email);
          return json({ok:true,message:'verificationRequested'});
        }
        const code=String(data.code||'').trim(),otp=this.db.one('otps',otpId),now=Date.now();
        if(!/^\d{8}$/.test(code)||!otp||otp.delivery!=='ready'||otp.email!==email||otp.expiresAt<=now||otp.attempts>=5)
          throw new AppError('codeInvalid',403);
        const hash=await this.recovery.keyMaterial('director-bootstrap','bootstrap:'+role,otp.nonce,code);
        // Fixed-length digest comparison avoids branch on the prefix of a secret.
        let mismatch=hash.length^otp.hash.length;for(let n=0;n<Math.max(hash.length,otp.hash.length);n++)mismatch|=(hash.charCodeAt(n)||0)^(otp.hash.charCodeAt(n)||0);
        if(mismatch){this.db.atomic(()=>{const x=this.db.one('otps',otpId);if(x?.nonce===otp.nonce)this.db.put('otps',{...x,attempts:x.attempts+1});});throw new AppError('codeInvalid',403);}
        // Handle already enforces one slot per role atomically.
        const result=await handle(this.db,'register',registration,{bootstrapAuthorized:true,local:false});
        this.db.atomic(()=>this.db.drop('otps',otpId));
        return json(result);
      }
      if(route==='register'&&['country_director','international_director'].includes(data.role))
        throw new AppError('directorEmailVerificationRequired',403);
      const setup=this.env.SETUP_KEY;
      const bootstrapAuthorized=route==='register' && !!setup && typeof data.setupKey==='string' && (await digest(data.setupKey))===(await digest(setup));
      if(route==='command'&&data.action==='account.purge'){
        const person=this.db.one('users',String(data.payload?.id||''));
        const personalFiles=person?this.db.all('v11_files').filter(f=>f.ownerId===person.id&&f.scopeType==='personal'):[];
        const result=await handle(this.db,route,data,{token,bootstrapAuthorized});
        if(this.env.MEDIA_BUCKET)for(const f of personalFiles)await this.env.MEDIA_BUCKET.delete(f.key);
        return json(result);
      }
      if(route==='command'&&data.action==='v11.fileReview'&&data.payload?.decision==='removed'){
        const f=this.db.one('v11_files',String(data.payload.id||''));
        const result=await handle(this.db,route,data,{token,bootstrapAuthorized});
        if(f?.key&&this.env.MEDIA_BUCKET)await this.env.MEDIA_BUCKET.delete(f.key);
        return json(result);
      }
      if(route==='command'&&typeof data.action==='string'&&data.action.startsWith('governance.')){
        const {user}=await authenticatedUser(this.db,token);
        const payload=data.payload||{};
        if(typeof payload!=='object'||Array.isArray(payload))throw new AppError('unknown',400);
        const run=(media=null)=>this.db.atomic(()=>{const fresh=this.db.one('users',user.id);if(!fresh||(fresh.sessionVersion||0)!==(user.sessionVersion||0))throw new AppError('expired',401);return governanceService(this.db,fresh,data.action,payload,Date.now(),()=>crypto.randomUUID(),GOVERNANCE_CATALOG,media);});
        if(['governance.photo','governance.setPhoto'].includes(data.action)){
          const result=await privatePhotoCommand({action:data.action,payload,bucket:this.env.MEDIA_BUCKET,run,revalidate:async()=>{await authenticatedUser(this.db,token);},idFactory:()=>crypto.randomUUID()});
          return json(result);
        }
        return json(run());
      }
      if(route==='state'){
        const snapshot=await handle(this.db,route,data,{token,bootstrapAuthorized});
        return json({...snapshot,services:{mediaUploads:!!this.env.MEDIA_BUCKET}});
       }
       return json(await handle(this.db,route,data,{token,bootstrapAuthorized}));
    }catch(e){return e instanceof AppError||Number.isInteger(e?.status)?json({error:e.message},e.status):json({error:'serviceError'},500);}
  }
  async upload(request){
    if(request.method!=='POST')throw new AppError('unknown',405);
    if(!this.env.MEDIA_BUCKET)throw new AppError('storageNotConfigured',503);
    const token=(request.headers.get('Authorization')||'').replace(/^Bearer /,'');
    const {user}=await authenticatedUser(this.db,token);
    const scopeType=request.headers.get('X-Gaius-Scope')||'organization';
    const scopeId=request.headers.get('X-Gaius-Unit')||'org';
    if(!canUploadFile(user,scopeType,scopeId))throw new AppError('forbidden',403);
    const type=(request.headers.get('Content-Type')||'').split(';')[0].toLowerCase();
    const allowed=new Map([
      ['application/pdf',['pdf']],['application/vnd.openxmlformats-officedocument.wordprocessingml.document',['docx']],
      ['application/vnd.openxmlformats-officedocument.presentationml.presentation',['pptx']],
      ['application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',['xlsx']],
      ['application/msword',['doc']],['application/vnd.ms-powerpoint',['ppt']],
      ['application/vnd.ms-excel',['xls']],['text/plain',['txt']],
      ['text/csv',['csv']],['image/jpeg',['jpg','jpeg']],['image/png',['png']],
      ['image/webp',['webp']],['video/mp4',['mp4']]]);
    if(!allowed.has(type))throw new AppError('fileInvalid',415);
    const name=decodeURIComponent(request.headers.get('X-File-Name')||'upload').replace(/[\/\r\n\0]/g,'').slice(0,180);
    if(!name)throw new AppError('fileInvalid',400);
    const ext=name.split('.').pop()?.toLowerCase();
    if(!allowed.get(type)?.includes(ext))throw new AppError('fileInvalid',415);
    if(Number(request.headers.get('Content-Length')||0)>10*1024*1024)throw new AppError('fileTooLarge',413);
    const bytes=await request.arrayBuffer();
    if(bytes.byteLength===0||bytes.byteLength>10*1024*1024)throw new AppError('fileTooLarge',413);
    const first=new Uint8Array(bytes.slice(0,16));
    const starts=(...b)=>b.every((v,i)=>first[i]===v);
    if(type==='application/pdf'&&!starts(37,80,68,70,45))throw new AppError('fileInvalid',415);
    const zipTypes=['application/vnd.openxmlformats-officedocument.wordprocessingml.document',
       'application/vnd.openxmlformats-officedocument.presentationml.presentation',
       'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'];
    if(zipTypes.includes(type)&&!starts(80,75,3,4))throw new AppError('fileInvalid',415);
    if(['application/msword','application/vnd.ms-powerpoint','application/vnd.ms-excel'].includes(type)&&
       !starts(208,207,17,224,161,177,26,225))throw new AppError('fileInvalid',415);
    if(type==='image/png'&&!starts(137,80,78,71))throw new AppError('fileInvalid',415);
    if(type==='image/jpeg'&&!starts(255,216,255))throw new AppError('fileInvalid',415);
    if(type==='image/webp'&&!(starts(82,73,70,70)&&String.fromCharCode(...first.slice(8,12))==='WEBP'))throw new AppError('fileInvalid',415);
    if(type==='video/mp4'&&String.fromCharCode(...first.slice(4,8))!=='ftyp')throw new AppError('fileInvalid',415);
    const id=crypto.randomUUID(),key='private/'+id;
    await this.env.MEDIA_BUCKET.put(key,bytes,{httpMetadata:{contentType:type}});
    const record={id,key,name,type,size:bytes.byteLength,scopeType,scopeId,ownerId:user.id,
      allowedUserIds:[],status:'pending',createdAt:new Date().toISOString()};
    await this.db.atomic(()=>this.db.put('v11_files',record));
    return json({id,status:'pending'});
  }
  async download(request){
    if(request.method!=='POST')throw new AppError('unknown',405);
    if(!this.env.MEDIA_BUCKET)throw new AppError('storageNotConfigured',503);
    const token=(request.headers.get('Authorization')||'').replace(/^Bearer /,'');
    const {user}=await authenticatedUser(this.db,token);
    let data;try{data=await request.json();}catch{throw new AppError('unknown',400);}
    const file=this.db.one('v11_files',String(data.id||''));
    if(!file)throw new AppError('missing',404);
    if(!canReadFile(user,file))throw new AppError('forbidden',403);
    const result=await this.env.MEDIA_BUCKET.get(file.key);
    if(!result)throw new AppError('missing',404);
    return new Response(result.body,{headers:{'Content-Type':file.type,'Content-Disposition':"attachment; filename*=UTF-8''"+encodeURIComponent(file.name),
      'Cache-Control':'private, no-store','X-Content-Type-Options':'nosniff'}});
  }
}
export default {
  async fetch(request,env){
    const origin=request.headers.get('Origin'),allowed=env.ALLOWED_ORIGIN;
    if(!allowed||origin!==allowed)return json({error:'originDenied'},403);
    const cors={'Access-Control-Allow-Origin':allowed,'Access-Control-Allow-Methods':'POST, OPTIONS','Access-Control-Allow-Headers':'Authorization, Content-Type, X-File-Name, X-Gaius-Scope, X-Gaius-Unit','Vary':'Origin'};
    if(request.method==='OPTIONS')return new Response(null,{status:204,headers:cors});
    const room=env.WORKSPACE.get(env.WORKSPACE.idFromName('gaius-ministry-v10'));
    const response=await room.fetch(request);
    return new Response(response.body,{status:response.status,headers:{...Object.fromEntries(response.headers),...cors}});
  }
};
