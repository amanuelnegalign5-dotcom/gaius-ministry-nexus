import { AppError, handle } from './gaius-core.js';

const legacyBuckets=new Set(['users','reports','comments','attendance','announcements','projects','documents']);
const key=b=>legacyBuckets.has(b)?b:'gaius.v10.'+b;
class BrowserRecords {
  constructor(){this.pending=null;}
  all(b){
    if(this.pending?.has(b))return this.pending.get(b);
    const raw=localStorage.getItem(key(b));
    if(raw===null)return [];
    let data;try{data=JSON.parse(raw);}catch{throw new AppError('badStore');}
    if(!Array.isArray(data))throw new AppError('badStore');
    return data;
  }
  one(b,id){return this.all(b).find(r=>r.id===id)||null;}
  put(b,r){const a=this.all(b),idx=a.findIndex(x=>x.id===r.id);this.pending.set(b,idx<0?[...a,r]:a.map((v,i)=>i===idx?r:v));}
  drop(b,id){this.pending.set(b,this.all(b).filter(r=>r.id!==id));}
  async atomic(fn){
    const write=()=>{
      this.pending=new Map();const previous=new Map();
      try{
        const result=fn();
        for(const [b,v] of this.pending){
          const k=key(b);previous.set(k,localStorage.getItem(k));
          localStorage.setItem(k,JSON.stringify(v));
        }
        return result;
      }catch(e){
        for(const [k,raw] of [...previous].reverse()){
          if(raw===null)localStorage.removeItem(k);else if(localStorage.getItem(k)!==raw)localStorage.setItem(k,raw);
        }
        if(e.name==='QuotaExceededError')throw new AppError('quota');
        throw e;
      }finally{this.pending=null;}
    };
    if(navigator.locks)return navigator.locks.request('gaius.v10.write',write);
    return write();
  }
}
const local=new BrowserRecords();
const configured=(window.GAIUS_CONFIG?.apiUrl||'').trim().replace(/\/+$/,'');
const api=new URLSearchParams(location.search).get('workspace')==='local' ? '' : configured;
export const shared=!!api;
export const localArchive=!!configured&&!shared;
const tokenKey='gaius.v10.session:'+ (api||'local');
export function hasSession(){return !!(sessionStorage.getItem(tokenKey)||(!shared&&sessionStorage.me));}
let stateCache=null,stateFlight=null,stateGeneration=0;
function invalidateState(){stateGeneration++;stateCache=null;stateFlight=null;}
export function clearSession(){invalidateState();sessionStorage.removeItem(tokenKey);if(!shared)sessionStorage.removeItem('me');}
async function call(route,data={}){
  const token=sessionStorage.getItem(tokenKey);
  if(!shared)return handle(local,route,data,{local:true,token,legacyId:sessionStorage.me});
  let target;try{target=new URL(api);}catch{throw new AppError('configInvalid');}
  if(target.protocol!=='https:'&&!['localhost','127.0.0.1'].includes(target.hostname))throw new AppError('configInvalid');
  let res;
  try{res=await fetch(api+'/'+route,{method:'POST',cache:'no-store',credentials:'omit',headers:{'Content-Type':'application/json',...(token?{Authorization:'Bearer '+token}:{})},body:JSON.stringify(data)});}
  catch{throw new AppError('offline',503);}
  let body;try{body=await res.json();}catch{throw new AppError('serviceError',503);}
  if(!res.ok)throw new AppError(body.error||'serviceError',res.status);
  return body;
}
export const info=()=>call('info');
// Short-lived in-memory reuse only; never persist private data or use it offline.
export async function state({reuse=false}={}){
 const identity=sessionStorage.getItem(tokenKey)||(!shared?sessionStorage.me:'');
 if(reuse&&navigator.onLine&&identity&&stateCache?.identity===identity&&Date.now()-stateCache.at<5000)return stateCache.value;
 if(stateFlight?.identity===identity)return stateFlight.promise;
 const generation=stateGeneration;
 const promise=call('state').then(value=>{
  const current=sessionStorage.getItem(tokenKey)||(!shared?sessionStorage.me:'');
  if(current!==identity)throw new AppError('expired',401);
  if(generation!==stateGeneration)return state();
  stateCache={identity,at:Date.now(),value};return value;
 }).finally(()=>{if(stateFlight?.promise===promise)stateFlight=null;});
 stateFlight={identity,promise};return promise;
}
export const register=d=>shared&&['country_director','international_director'].includes(d.role)?call('director/claim',{registration:d,code:d.directorEmailCode}):call('register',d);
export const requestDirectorCode=(role,email,setupKey)=>{if(!shared)throw new AppError('directorRequiresServer',403);return call('director/challenge',{role,email,setupKey});};
export async function login(d){invalidateState();const {token}=await call('login',d);sessionStorage.setItem(tokenKey,token);if(!shared)sessionStorage.removeItem('me');}
export async function logout(){try{await call('logout');}finally{clearSession();}}
export async function command(action,payload){
  const mutating=!['governance.list','governance.photo'].includes(action);if(mutating)invalidateState();
  const data={action,payload,requestId:crypto.randomUUID()};
  try{try{return await call('command',data);}
  catch(e){if(shared&&e.message==='offline'&&navigator.onLine)return await call('command',data);throw e;}}
  finally{if(mutating)invalidateState();}
}

// Email recovery requires the shared, server-side mail service. Never generate
// one-time codes or store the mail API key in a browser or public repository.
export async function requestPasswordCode(email){
  if(!shared)throw new AppError('emailRequiresServer',503);
  return call('password/request',{email});
}
export async function confirmPasswordCode(email,code,newPassword){
  if(!shared)throw new AppError('emailRequiresServer',503);
  return call('password/confirm',{email,code,newPassword});
}
export async function requestEmailCode(newEmail,currentPassword){
  if(!shared)throw new AppError('emailRequiresServer',503);
  return call('email/request',{newEmail,currentPassword});
}
export async function confirmEmailCode(code){
  if(!shared)throw new AppError('emailRequiresServer',503);
  return call('email/confirm',{code});
}

// v11 private evidence attachments: browser never receives an R2 public URL.
export async function uploadFile(file,scopeType='organization',scopeId='org'){
  invalidateState();
  if(!shared)throw new AppError('storageRequiresServer',503);
  if(!file||file.size>10*1024*1024)throw new AppError('fileTooLarge',413);
  const token=sessionStorage.getItem(tokenKey);
  let res;try{res=await fetch(api+'/file/upload',{method:'POST',cache:'no-store',credentials:'omit',
    headers:{'Authorization':'Bearer '+token,'Content-Type':({pdf:'application/pdf',docx:'application/vnd.openxmlformats-officedocument.wordprocessingml.document',doc:'application/msword',
       pptx:'application/vnd.openxmlformats-officedocument.presentationml.presentation',ppt:'application/vnd.ms-powerpoint',
       xlsx:'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',xls:'application/vnd.ms-excel',csv:'text/csv',
       jpg:'image/jpeg',jpeg:'image/jpeg',png:'image/png',webp:'image/webp',mp4:'video/mp4',txt:'text/plain'}[file.name.split('.').pop().toLowerCase()]||file.type||'application/octet-stream'),
      'X-File-Name':encodeURIComponent(file.name).slice(0,220),'X-Gaius-Scope':scopeType,'X-Gaius-Unit':scopeId},body:file});}
  catch{throw new AppError('offline',503);}
  const data=await res.json().catch(()=>({error:'serviceError'}));
  if(!res.ok)throw new AppError(data.error||'serviceError',res.status);
  return data;
}
export async function downloadFile(id){
  if(!shared)throw new AppError('storageRequiresServer',503);
  const token=sessionStorage.getItem(tokenKey);
  let res;try{res=await fetch(api+'/file/download',{method:'POST',cache:'no-store',credentials:'omit',headers:{'Authorization':'Bearer '+token,'Content-Type':'application/json'},body:JSON.stringify({id})});}
  catch{throw new AppError('offline',503);}
  if(!res.ok){const body=await res.json().catch(()=>({}));throw new AppError(body.error||'serviceError',res.status);}
  return res.blob();
}
