import {validCenterAttendance} from './gaius-report-policy.js';
// Passphrase-protected offline vault. No server tokens, photos or live records are stored.
export const OFFLINE_KINDS=['monthly','plans6','initiatives','tasks','teaching','updates','centerAttendance'];
export const MAX_AGE=24*60*60*1000;
const encoder=new TextEncoder(), decoder=new TextDecoder();
const bytes=n=>crypto.getRandomValues(new Uint8Array(n));
export async function deriveKey(passphrase,salt){
 if(typeof passphrase!=='string'||passphrase.length<10)throw Error('Use an offline passphrase of at least 10 characters');
 const material=await crypto.subtle.importKey('raw',encoder.encode(passphrase),'PBKDF2',false,['deriveKey']);
 return crypto.subtle.deriveKey({name:'PBKDF2',hash:'SHA-256',salt,iterations:600000},material,{name:'AES-GCM',length:256},false,['encrypt','decrypt']);
}
export async function seal(key,value,aad){
 const iv=bytes(12),cipher=await crypto.subtle.encrypt({name:'AES-GCM',iv,additionalData:encoder.encode(aad)},key,encoder.encode(JSON.stringify(value)));
 return {iv:Array.from(iv),cipher:Array.from(new Uint8Array(cipher))};
}
export async function unseal(key,box,aad){
 const data=await crypto.subtle.decrypt({name:'AES-GCM',iv:new Uint8Array(box.iv),additionalData:encoder.encode(aad)},key,new Uint8Array(box.cipher));
 return JSON.parse(decoder.decode(data));
}
export function offlineSnapshot(state,at=Date.now()){
 const me=state.me,c=state.v11?.capabilities||{},createScopes={};
 for(const k of OFFLINE_KINDS){const scopes=(c.createScopes?.[k]||[]).filter(x=>x.scopeType==='personal'||x.scopeType==='center'||x.scopeType==='hq'||x.scopeType==='organization');if(scopes.length)createScopes[k]=scopes.map(({scopeType,scopeId,label})=>({scopeType,scopeId,label}));}
 // Keep only the authorized attendance roster. No other directory or historical records.
 const participants=createScopes.centerAttendance? (c.attendanceParticipants||[]).map(({id,name,center})=>({id,name,center})):[];
 return {at,mondayRoster:state.authorization?.offlineMondayRoster||[],me:{id:me.id,role:me.role,name:me.name,department:me.department,center:me.center},createScopes,participants};
}
export function snapshotValid(s,owner,now=Date.now()){return !!s?.me&&s.me.id===owner&&Number.isFinite(s.at)&&s.at<=now&&now-s.at<MAX_AGE;}
export function draftAllowed(s,p,now=Date.now()){
 if(!snapshotValid(s,s?.me?.id,now)||p.id||p.version||p.data?.fileId)return false;
 if(p.kind==='mondayAttendance')return !!s.mondayRoster?.some(x=>x.id===p.data?.personId)&&['present','absent','permitted','late'].includes(p.data.status)&&p.data.programType==='regular'&&/^\d{4}-\d{2}-\d{2}$/.test(p.data.date)&&new Date(p.data.date+'T00:00:00Z').getUTCDay()===1&&!p.data.note;
 if(!OFFLINE_KINDS.includes(p.kind))return false;
 if(!s.createScopes[p.kind]?.some(x=>x.scopeType===p.scopeType&&x.scopeId===p.scopeId))return false;
 if(p.kind==='centerAttendance')return s.participants.some(x=>x.id===p.data?.participantId)&&validCenterAttendance(p.data.date,p.data.eventType)&&!p.data?.note;
 return true;
}
const open=()=>new Promise((resolve,reject)=>{const r=indexedDB.open('gaius-encrypted-offline-v1',1);r.onupgradeneeded=()=>r.result.createObjectStore('vault',{keyPath:'id'});r.onsuccess=()=>resolve(r.result);r.onerror=()=>reject(r.error);});
async function transact(mode,work){const db=await open();try{return await new Promise((resolve,reject)=>{const tx=db.transaction('vault',mode),q=work(tx.objectStore('vault'));tx.oncomplete=()=>resolve(q?.result);tx.onabort=tx.onerror=()=>reject(tx.error||Error('Offline storage failed'));});}finally{db.close();}}
const get=id=>transact('readonly',s=>s.get(id)),put=row=>transact('readwrite',s=>s.put(row)),all=()=>transact('readonly',s=>s.getAll()),drop=id=>transact('readwrite',s=>s.delete(id));
let unlocked=null,epoch=0;
export function lockVault(){epoch++;unlocked=null;}
export function vaultUnlocked(owner){return unlocked?.owner===owner;}
export async function hasVault(owner){return !!await get('meta:'+owner);}
export async function unlockVault(owner,passphrase,onlineState=null){
 const mark=++epoch;unlocked=null;
 let meta=await get('meta:'+owner);
 if(!meta){if(!onlineState||onlineState.me.id!==owner)throw Error('First enable offline mode online');const salt=bytes(16),key=await deriveKey(passphrase,salt);const snapshot=offlineSnapshot(onlineState);meta={id:'meta:'+owner,salt:Array.from(salt),box:await seal(key,snapshot,'snapshot:'+owner)};if(mark!==epoch)throw Error('Session changed');await put(meta);if(mark!==epoch)throw Error('Session changed');unlocked={owner,key,snapshot};return snapshot;}
 const key=await deriveKey(passphrase,new Uint8Array(meta.salt)),snapshot=await unseal(key,meta.box,'snapshot:'+owner);
 if(mark!==epoch||snapshot.me.id!==owner)throw Error('Session changed');
 unlocked={owner,key,snapshot};
 if(onlineState)await refreshVault(onlineState);
 return unlocked?.snapshot;
}
export async function refreshVault(state){
 const v=unlocked;if(!v||v.owner!==state.me.id)return;
 const meta=await get('meta:'+v.owner),snapshot=offlineSnapshot(state);
 const box=await seal(v.key,snapshot,'snapshot:'+v.owner);
 if(unlocked!==v)return;await put({...meta,box});if(unlocked===v)v.snapshot=snapshot;
}
export function offlineState(owner){const v=unlocked;if(!v||v.owner!==owner||!snapshotValid(v.snapshot,owner))return null;const s=v.snapshot;return {me:s.me,directory:[],offlineOnly:true,v11:{records:[],files:[],capabilities:{createScopes:s.createScopes,allowedKinds:Object.keys(s.createScopes),readableKinds:Object.keys(s.createScopes),attendanceParticipants:s.participants,offlineMondayRoster:s.mondayRoster||[]}}};}
export function mondayRoster(owner){const v=unlocked;return v?.owner===owner&&snapshotValid(v.snapshot,owner)?v.snapshot.mondayRoster||[]:[];}
export async function queueDraft(owner,payload,requestId=crypto.randomUUID()){
 const v=unlocked;if(!v||v.owner!==owner||!draftAllowed(v.snapshot,payload))throw Error('Offline draft not permitted; reconnect or unlock offline storage');
 const id='draft:'+owner+':'+requestId;
 const existing=await get(id);if(existing)return;
 const data={requestId,payload,createdAt:new Date().toISOString()};
 const box=await seal(v.key,data,id);if(unlocked!==v)throw Error('Session changed');await put({id,owner,box});
}
export async function listDrafts(owner){const v=unlocked;if(!v||v.owner!==owner)return [];const rows=(await all()).filter(r=>r.owner===owner&&r.id.startsWith('draft:'));const result=[];for(const row of rows){result.push({...await unseal(v.key,row.box,row.id),id:row.id});}if(unlocked!==v)throw Error('Session changed');return result;}
export async function deleteDraft(owner,id){if(!vaultUnlocked(owner)||!id.startsWith('draft:'+owner+':'))throw Error('forbidden');await drop(id);}
