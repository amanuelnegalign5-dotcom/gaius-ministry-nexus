import {validCenterAttendance} from './gaius-report-policy.js';
// Passphrase-protected offline vault. Never persist server tokens, credentials, attachments or full server state.
export const OFFLINE_KINDS=['monthly','plans6','initiatives','tasks','teaching','updates','centerAttendance'];
export const EXTENDED_KINDS=['centers','centerUnits','monthly','plans6','followups','centerAttendance','teaching','documents','committees','initiatives','tasks','updates','directorGoals','visits','advisoryMeetings','succession'];
export const OFFLINE_FILE_MAX_BYTES=5*1024*1024;
export const OFFLINE_FILES_TOTAL_BYTES=30*1024*1024;
const offlineFileSafe=f=>f?.offlineAllowed===true&&f.status==='approved'&&f.scopeType==='organization'&&f.scopeId==='org'&&['application/pdf','application/vnd.openxmlformats-officedocument.wordprocessingml.document','application/vnd.openxmlformats-officedocument.presentationml.presentation','application/vnd.openxmlformats-officedocument.spreadsheetml.sheet','text/plain','text/csv'].includes(f.type)&&f.size>0&&f.size<=OFFLINE_FILE_MAX_BYTES;
const RESTRICTED_KINDS=new Set(['centerAttendance','succession','advisoryMeetings','visits','directorGoals','documents','committees','centerUnits']);
const categoryFor=k=>RESTRICTED_KINDS.has(k)||k==='mondayAttendance'?'attendance':'operations';
const TRANSITIONS={submit:'submit',approve:'approve',revision_requested:'requestChanges',revise:'revise',archive:'archive'};
const recordSafe=r=>EXTENDED_KINDS.includes(r.kind)&&r.status!=='archived'&&!(r.kind==='centerAttendance'&&r.data?.note)&&!(r.kind==='monthly'&&/counsel|ምክር/i.test(r.data?.departmentType||r.scopeId||''));
const recordProjection=r=>{
 const {fileId,photoFileId,...data}=r.data||{};
 // Do not cache review notes, source text, binary attachments or arbitrary profile details.
 const edit=r.actions?.edit===true&&!fileId&&!photoFileId;
 return {id:r.id,kind:r.kind,scopeType:r.scopeType,scopeId:r.scopeId,ownerId:r.ownerId,ownerName:r.ownerName,status:r.status,_v:r._v,createdAt:r.createdAt,updatedAt:r.updatedAt,data,actions:{...Object.fromEntries(Object.keys(TRANSITIONS).map(k=>[TRANSITIONS[k],r.actions?.[TRANSITIONS[k]]===true])),edit},...(r.kind==='directorGoals'&&r.sourceSnapshot?{sourceSnapshot:{budget:r.sourceSnapshot.budget}}:{})};
};
export const MAX_AGE=24*60*60*1000;
export const SNAPSHOT_MAX_BYTES=20*1024*1024;
const sameValue=(a,b)=>String(a??'')===String(b??'');
// Only scalar field-level changes on the same authorized editable record may merge.
// A changed attachment, scope, status or overlapping field always requires review.
export function mergeOfflineEdit(draft,live){
 const p=draft?.payload,base=draft?.base;if(!p?.id||p.intent||!base||!live?.actions?.edit||live.id!==p.id||live.kind!==p.kind||live._v===p.version||base._v!==p.version||live.scopeType!==p.scopeType||live.scopeId!==p.scopeId||live.status!==base.status||live.data?.fileId||live.data?.photoFileId||p.kind==='centerAttendance'||p.kind==='mondayAttendance')return null;
 const out={...live.data},conflicts=[];
 for(const k of new Set([...Object.keys(base.data||{}),...Object.keys(p.data||{})])){
  if(!Object.hasOwn(p.data||{},k))continue;
  const a=base.data?.[k],b=p.data[k],c=live.data?.[k];
  if([a,b,c].some(v=>v!==null&&typeof v==='object'))return null;
  if(sameValue(a,b))continue;
  if(!sameValue(a,c)&&!sameValue(b,c)){conflicts.push(k);continue;}
  out[k]=b;
 }
 return conflicts.length?{conflicts}:{payload:{...p,version:live._v,data:out}};
}
const encoder=new TextEncoder(), decoder=new TextDecoder();
const bytes=n=>crypto.getRandomValues(new Uint8Array(n));
export async function deriveKey(passphrase,salt){
 if(typeof passphrase!=='string'||passphrase.length<10)throw Error('Use an offline passphrase of at least 10 characters');
 const material=await crypto.subtle.importKey('raw',encoder.encode(passphrase),'PBKDF2',false,['deriveKey']);
 return crypto.subtle.deriveKey({name:'PBKDF2',hash:'SHA-256',salt,iterations:600000},material,{name:'AES-GCM',length:256},false,['encrypt','decrypt']);
}
export async function seal(key,value,aad){
 const iv=bytes(12),cipher=await crypto.subtle.encrypt({name:'AES-GCM',iv,additionalData:encoder.encode(aad)},key,encoder.encode(JSON.stringify(value)));
 return {iv,cipher:new Uint8Array(cipher)};
}
export async function unseal(key,box,aad){
 const data=await crypto.subtle.decrypt({name:'AES-GCM',iv:new Uint8Array(box.iv),additionalData:encoder.encode(aad)},key,new Uint8Array(box.cipher));
 return JSON.parse(decoder.decode(data));
}
export function offlineSnapshot(state,at=Date.now(),extended=false){
 const me=state.me,c=state.v11?.capabilities||{},createScopes={};
 for(const k of extended?EXTENDED_KINDS:OFFLINE_KINDS){const scopes=(c.createScopes?.[k]||[]).filter(x=>x.scopeType==='personal'||x.scopeType==='center'||x.scopeType==='hq'||x.scopeType==='organization');if(scopes.length)createScopes[k]=scopes.map(({scopeType,scopeId,label})=>({scopeType,scopeId,label}));}
 // Keep only the authorized attendance roster. No other directory or historical records.
 const participants=createScopes.centerAttendance? (c.attendanceParticipants||[]).map(({id,name,center})=>({id,name,center})):[];
 const lease=state.authorization?.offlineLease;
 const issued=lease?.issuedAt??at;
 const deadline=key=>Number.isFinite(lease?.[key])?Math.min(lease[key],issued+30*MAX_AGE):issued+MAX_AGE;
 const extra=extended?{extended:true,offlineFiles:deadline('attendanceUntil')>issued?(state.v11?.files||[]).filter(offlineFileSafe).map(({id,name,type,size,updatedAt,createdAt})=>({id,name,type,size,version:updatedAt||createdAt})):[],records:(state.v11?.records||[]).filter(r=>recordSafe(r)&&deadline(categoryFor(r.kind)+'Until')>issued).map(recordProjection),readableKinds:(c.readableKinds||c.allowedKinds||[]).filter(k=>EXTENDED_KINDS.includes(k)),onlineKinds:(c.readableKinds||c.allowedKinds||[]).filter(k=>!EXTENDED_KINDS.includes(k)),directory:(deadline('attendanceUntil')>issued?state.directory||[]:[]).map(({id,name,role,center,department})=>({id,name,role,center,department})),nav:{director:c.director===true,oversight:c.oversight===true,files:c.canUploadFile===true||!!state.v11?.files?.length,governance:!!(c.director||c.hqReports||me.center||me.role==='staff'||me.role==='hq_staff'),legacyPages:state.authorization?.legacyPages||[]},defaultScopeType:c.defaultScopeType,defaultScopeId:c.defaultScopeId,mondayRecords:(deadline('attendanceUntil')>issued?state.attendance||[]:[]).filter(r=>!r.note&&(r.programType||'regular')==='regular').map(({id,personId,date,status,programType,_v})=>({id,personId,date,status,programType:programType||'regular',_v})),legacy:{reports:(state.reports||[]).filter(r=>!/counsel|ምክር/i.test(r.department||'')).map(({id,title,month,department,status,activity,planned,achieved,result,challenge,next,updatedAt})=>({id,title,month,department,status,activity,planned,achieved,result,challenge,next,updatedAt})),plans:(state.plans||[]).map(({id,title,month,department,status,objective,activities,expected,due,updatedAt})=>({id,title,month,department,status,objective,activities,expected,due,updatedAt}))}}:{};
 return {...extra,at:issued,operationsUntil:deadline('operationsUntil'),attendanceUntil:deadline('attendanceUntil'),mondayRoster:deadline('attendanceUntil')>issued?state.authorization?.offlineMondayRoster||[]:[],me:{id:me.id,role:me.role,name:me.name,department:me.department,center:me.center},createScopes,participants:deadline('attendanceUntil')>issued?participants:[]};
}
export function categoryValid(s,owner,category,now=Date.now()){const end=s?.[category+'Until']??((s?.at||0)+MAX_AGE);return !!s?.me&&s.me.id===owner&&Number.isFinite(s.at)&&s.at<=now&&Number.isFinite(end)&&now<end&&end<=s.at+30*MAX_AGE;}
export function snapshotValid(s,owner,now=Date.now()){return categoryValid(s,owner,'operations',now)||categoryValid(s,owner,'attendance',now);}
export function draftAllowed(s,p,now=Date.now()){
 if(!categoryValid(s,s?.me?.id,categoryFor(p.kind),now)||p.data?.fileId||p.data?.photoFileId||p.kind==='monthly'&&/counsel|ምክር/i.test(p.data?.departmentType||p.scopeId||''))return false;
 if(p.intent==='transition'){const r=s.records?.find(r=>r.id===p.id&&r.kind===p.kind);return !!r&&r._v===p.version&&r.actions?.[TRANSITIONS[p.decision]]===true&&Object.hasOwn(TRANSITIONS,p.decision);}
 if(p.kind==='mondayAttendance'&&p.id){const r=s.mondayRecords?.find(r=>r.id===p.id);if(!r||r._v!==p.version||r.personId!==p.data?.personId||r.date!==p.data?.date)return false;}
 else if(p.id){const r=s.records?.find(r=>r.id===p.id&&r.kind===p.kind);if(!r||r._v!==p.version||!r.actions?.edit||r.scopeType!==p.scopeType||r.scopeId!==p.scopeId)return false;}
 else if(p.version)return false;
 if(p.kind==='mondayAttendance')return !!s.mondayRoster?.some(x=>x.id===p.data?.personId)&&['present','absent','permitted','late'].includes(p.data.status)&&p.data.programType==='regular'&&/^\d{4}-\d{2}-\d{2}$/.test(p.data.date)&&new Date(p.data.date+'T00:00:00Z').getUTCDay()===1&&!p.data.note;
 if(!(s.extended?EXTENDED_KINDS:OFFLINE_KINDS).includes(p.kind))return false;
 if(!p.id&&!s.createScopes[p.kind]?.some(x=>x.scopeType===p.scopeType&&x.scopeId===p.scopeId))return false;
 if(p.kind==='centerAttendance')return s.participants.some(x=>x.id===p.data?.participantId)&&validCenterAttendance(p.data.date,p.data.eventType)&&!p.data?.note;
 return true;
}
const open=()=>new Promise((resolve,reject)=>{const r=indexedDB.open('gaius-encrypted-offline-v1',1);r.onupgradeneeded=()=>r.result.createObjectStore('vault',{keyPath:'id'});r.onsuccess=()=>resolve(r.result);r.onerror=()=>reject(r.error);});
async function transact(mode,work){const db=await open();try{return await new Promise((resolve,reject)=>{const tx=db.transaction('vault',mode),q=work(tx.objectStore('vault'));tx.oncomplete=()=>resolve(q?.result);tx.onabort=tx.onerror=()=>reject(tx.error||Error('Offline storage failed'));});}finally{db.close();}}
const get=id=>transact('readonly',s=>s.get(id)),put=row=>transact('readwrite',s=>s.put(row)),all=()=>transact('readonly',s=>s.getAll()),drop=id=>transact('readwrite',s=>s.delete(id));
let unlocked=null,epoch=0,loginBusy=false;
const loginTag=async username=>Array.from(new Uint8Array(await crypto.subtle.digest('SHA-256',encoder.encode('gaius-offline-login:'+String(username||'').trim().toLowerCase()))),b=>b.toString(16).padStart(2,'0')).join('');
export function lockVault(){epoch++;unlocked=null;}
export function vaultUnlocked(owner){return unlocked?.owner===owner;}
export async function hasVault(owner){return !!await get('meta:'+owner);}
export async function offlineLogin(username,passphrase){
 if(loginBusy)throw Error('offlineLoginBusy');loginBusy=true;
 try{
  const tag=await loginTag(username),id='login:'+tag,entry=await get(id),now=Date.now();
  if((entry?.retryAt||0)>now)throw Error('offlineLoginThrottled');
  if(!entry?.owner)throw Error('offlineLoginUnavailable');
  let snapshot;try{snapshot=await unlockVault(entry.owner,passphrase);}catch{
   const failures=(entry.failures||0)+1;await put({...entry,failures,retryAt:failures>=5?now+Math.min(300000,30000*2**Math.min(4,failures-5)):0});throw Error('offlineLoginInvalid');
  }
  if(!snapshotValid(snapshot,entry.owner)){lockVault();throw Error('offlineLoginExpired');}
  await put({...entry,failures:0,retryAt:0});return snapshot.me;
 }finally{loginBusy=false;}
}
async function enrollLogin(state){
 const v=unlocked;if(!v||v.owner!==state.me.id||!state.me.username)return;
 const tag=await loginTag(state.me.username),id='login:'+tag;
 if(unlocked!==v)return;
 for(const row of await all())if(row.id.startsWith('login:')&&row.owner===v.owner&&row.id!==id)await drop(row.id);
 if(unlocked===v)await put({id,owner:v.owner,failures:0,retryAt:0});
}
export async function unlockVault(owner,passphrase,onlineState=null){
 const mark=++epoch;unlocked=null;
 let meta=await get('meta:'+owner);
 if(!meta){if(!onlineState||onlineState.me.id!==owner)throw Error('First enable offline mode online');const salt=bytes(16),key=await deriveKey(passphrase,salt);const snapshot=offlineSnapshot(onlineState);meta={id:'meta:'+owner,salt:Array.from(salt),box:await seal(key,snapshot,'snapshot:'+owner)};if(mark!==epoch)throw Error('Session changed');await put(meta);if(mark!==epoch)throw Error('Session changed');unlocked={owner,key,snapshot};await enrollLogin(onlineState);return snapshot;}
 const key=await deriveKey(passphrase,new Uint8Array(meta.salt)),snapshot=await unseal(key,meta.box,'snapshot:'+owner);
 if(mark!==epoch||snapshot.me.id!==owner)throw Error('Session changed');
 unlocked={owner,key,snapshot};
 if(onlineState)await refreshVault(onlineState);
 return unlocked?.snapshot;
}
export async function refreshVault(state){
 const v=unlocked;if(!v||v.owner!==state.me.id)return;
 const meta=await get('meta:'+v.owner),snapshot=offlineSnapshot(state,Date.now(),v.snapshot.extended===true);
 if(snapshot.at===v.snapshot.at&&JSON.stringify(snapshot)===JSON.stringify(v.snapshot))return;
 if(encoder.encode(JSON.stringify(snapshot)).length>SNAPSHOT_MAX_BYTES)throw Error('Offline snapshot exceeds 20 MB; keep draft-only mode or reduce stored records');
 const box=await seal(v.key,snapshot,'snapshot:'+v.owner);
 if(unlocked!==v)return;await put({...meta,box});if(unlocked===v){v.snapshot=snapshot;await pruneFiles(v);await enrollLogin(state);}
}
export async function setExtendedWorkspace(state,enabled){const v=unlocked;if(!v||v.owner!==state.me.id)throw Error('Unlock offline vault first');const snapshot=offlineSnapshot(state,Date.now(),enabled);if(encoder.encode(JSON.stringify(snapshot)).length>SNAPSHOT_MAX_BYTES)throw Error('Offline snapshot exceeds 20 MB; keep draft-only mode or reduce stored records');const meta=await get('meta:'+v.owner),box=await seal(v.key,snapshot,'snapshot:'+v.owner);if(unlocked!==v)throw Error('Session changed');await put({...meta,box});if(unlocked===v){v.snapshot=snapshot;await pruneFiles(v);}}
export function offlineState(owner){
 const v=unlocked;if(!v||v.owner!==owner||!snapshotValid(v.snapshot,owner))return null;
 const s=v.snapshot,operations=categoryValid(s,owner,'operations'),attendance=categoryValid(s,owner,'attendance');
 const createScopes=Object.fromEntries(Object.entries(s.createScopes).filter(([k])=>categoryValid(s,owner,categoryFor(k))));
 const records=(s.records||[]).filter(r=>categoryValid(s,owner,categoryFor(r.kind)));
 const readableKinds=[...new Set([...Object.keys(createScopes),...records.map(r=>r.kind),...(s.readableKinds||[]).filter(k=>categoryValid(s,owner,categoryFor(k)))])];
 return {me:s.me,directory:attendance?s.directory||[]:[],offlineOnly:true,extended:s.extended===true,snapshotAt:s.at,onlineKinds:s.onlineKinds||[],offlineNav:s.nav||{},offlineFiles:attendance?s.offlineFiles||[]:[],legacy:operations?s.legacy||{}:{},mondayRecords:attendance?s.mondayRecords||[]:[],v11:{records,files:[],capabilities:{director:!!s.nav?.director,oversight:!!s.nav?.oversight,defaultScopeType:s.defaultScopeType,defaultScopeId:s.defaultScopeId,createScopes,allowedKinds:Object.keys(createScopes),readableKinds,attendanceParticipants:attendance?s.participants:[],offlineMondayRoster:attendance?s.mondayRoster||[]:[]}}};
}
async function fileRows(owner){return (await all()).filter(r=>r.owner===owner&&r.id.startsWith('file:'));}
const fileKey=(owner,id)=>'file:'+owner+':'+id;
async function pruneFiles(v){const allowed=new Map((v.snapshot.offlineFiles||[]).map(f=>[f.id,f.version]));for(const r of await fileRows(v.owner)){if(unlocked!==v)return;if(!allowed.has(r.fileId)||allowed.get(r.fileId)!==r.version)await drop(r.id);}}
export async function cachedFiles(owner){const v=unlocked;if(!v||v.owner!==owner||!categoryValid(v.snapshot,owner,'attendance'))return [];const rows=await fileRows(owner);if(unlocked!==v)return [];return (v.snapshot.offlineFiles||[]).filter(f=>rows.some(r=>r.fileId===f.id&&r.version===f.version));}
export async function cacheFile(owner,id,blob){const v=unlocked;if(!v||v.owner!==owner||!v.snapshot.extended||!categoryValid(v.snapshot,owner,'attendance'))throw Error('Enable extended offline workspace first');const f=v.snapshot.offlineFiles?.find(f=>f.id===id);if(!f||f.size!==blob.size||blob.size>OFFLINE_FILE_MAX_BYTES)throw Error('offlineFileNotEligible');const rows=await fileRows(owner);if(rows.filter(r=>r.fileId!==id).reduce((n,r)=>n+r.size,0)+blob.size>OFFLINE_FILES_TOTAL_BYTES)throw Error('Offline files exceed 30 MB; remove a local copy first');const key=fileKey(owner,id),iv=bytes(12),cipher=await crypto.subtle.encrypt({name:'AES-GCM',iv,additionalData:encoder.encode(key+':'+f.version)},v.key,await blob.arrayBuffer());if(unlocked!==v||!categoryValid(v.snapshot,owner,'attendance')||!v.snapshot.offlineFiles?.some(x=>x.id===id&&x.version===f.version))throw Error('Session or file access changed');await put({id:key,owner,fileId:id,version:f.version,size:blob.size,iv,cipher:new Uint8Array(cipher)});}
export async function readCachedFile(owner,id){const v=unlocked;if(!v||v.owner!==owner||!categoryValid(v.snapshot,owner,'attendance'))throw Error('Offline file access expired');const f=v.snapshot.offlineFiles?.find(f=>f.id===id),r=await get(fileKey(owner,id));if(!f||!r||r.version!==f.version)throw Error('Offline file not saved');const bytes=await crypto.subtle.decrypt({name:'AES-GCM',iv:new Uint8Array(r.iv),additionalData:encoder.encode(r.id+':'+f.version)},v.key,new Uint8Array(r.cipher));if(unlocked!==v||!categoryValid(v.snapshot,owner,'attendance')||!v.snapshot.offlineFiles?.some(x=>x.id===id&&x.version===f.version))throw Error('Session or file access changed');return {name:f.name,blob:new Blob([bytes],{type:f.type})};}
export async function removeCachedFile(owner,id){if(!vaultUnlocked(owner))throw Error('forbidden');await drop(fileKey(owner,id));}
export function extendedEnabled(owner){return unlocked?.owner===owner&&unlocked.snapshot.extended===true;}

export function vaultLease(owner){const v=unlocked;if(v?.owner!==owner)return null;const s=v.snapshot;return {operationsUntil:s.operationsUntil??s.at+MAX_AGE,attendanceUntil:s.attendanceUntil??s.at+MAX_AGE};}
export function mondayRoster(owner){const v=unlocked;return v?.owner===owner&&categoryValid(v.snapshot,owner,'attendance')?v.snapshot.mondayRoster||[]:[];}
export async function queueDraft(owner,payload,requestId=crypto.randomUUID()){
 const v=unlocked;if(!v||v.owner!==owner||!draftAllowed(v.snapshot,payload))throw Error('Offline draft not permitted; reconnect or unlock offline storage');
 const id='draft:'+owner+':'+requestId;
 const existing=await get(id);if(existing)return;
 if(payload.id&&(await listDrafts(owner)).some(d=>d.payload.id===payload.id))throw Error('A change for this record is already queued. Sync or discard it first.');
 const base=payload.id&&!payload.intent?v.snapshot.records?.find(r=>r.id===payload.id&&r.kind===payload.kind):null;
 const data={requestId,payload,createdAt:new Date().toISOString(),...(base?{base:{_v:base._v,status:base.status,data:base.data}}:{})};
 const box=await seal(v.key,data,id);if(unlocked!==v)throw Error('Session changed');await put({id,owner,box});
}
export async function listDrafts(owner){const v=unlocked;if(!v||v.owner!==owner)return [];const rows=(await all()).filter(r=>r.owner===owner&&r.id.startsWith('draft:'));const result=[];for(const row of rows){result.push({...await unseal(v.key,row.box,row.id),id:row.id});}if(unlocked!==v)throw Error('Session changed');return result;}
export async function markDraftError(owner,id,error,conflicts=[]){const v=unlocked;if(!v||v.owner!==owner)return;const row=await get(id);if(!row||row.owner!==owner)return;const data=await unseal(v.key,row.box,id);const box=await seal(v.key,{...data,error:String(error).slice(0,100),conflicts:conflicts.map(k=>String(k).slice(0,100)).slice(0,100)},id);if(unlocked===v)await put({...row,box});}
export async function deleteDraft(owner,id){if(!vaultUnlocked(owner)||!id.startsWith('draft:'+owner+':'))throw Error('forbidden');await drop(id);}
