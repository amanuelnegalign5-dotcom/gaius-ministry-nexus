// Shared domain rules for the v10 workspace, updated to v11.
import {v11Command,v11State,approveFile} from './gaius-v11-core.js';
import {isHQReporter,isNineHQDepartment,isDirectorRole,classifiedPermissions,legacyPermission,eligibleDelegate,isCenterAccount,CENTER_PERMISSION_KEYS} from './gaius-report-policy.js';
export const roleDepartments = {
  media_leader:'Media', followup_leader:'Follow-up', service_leader:'Service Coordination',
  counseling_leader:'Counseling and Support', research_leader:'Research and Training', event_leader:'Event',
  admin_finance:'Administration and Finance', monday_leader:'Monday Staff Program',
  support_leader:'Support Team Department', establishment_leader:'Department of Centers Establishment',
  international_staff:'International', assisting_staff:'', prayer_staff:'Prayer',
  country_director:'', international_director:'',
  center_senior_leader:'',staff:'',center_leader:'',potential_center_leader:'',center_department_leader:'',potential_department_leader:'',volunteer:'',hq_staff:''
};
export const directors = ['country_director','international_director'];
export const permissions = ['reports','review_reports','review_plans','comments','attendance','announcements','projects','documents','manage_users','v11:oversight','v11:approve','v11:publish','v11:teaching','v11:edit_manual','v11:upload_file',...CENTER_PERMISSION_KEYS];
export const sourceIds = ['event','counseling','research','followup','service','media'];
export const seedPeople = [
  {id:'selam',name:'Selam',role:'service_leader',regular:false},
  {id:'kesemay',name:'ከሰማይ',role:'event_leader',regular:false},
  {id:'meron',name:'Meron',role:'staff',regular:false},
  {id:'nathnael',name:'Nathnael',role:'media_leader',monthlyOnce:true}
];
const own = (o,k) => Object.prototype.hasOwnProperty.call(o,k);
export const stateOf = u => u?.accountStatus || 'active'; // Existing v10 accounts were admitted at registration.
export const full = u => !!u && stateOf(u)==='active' && directors.includes(u.role);
export const permit = (u,p) => !!u && stateOf(u)==='active' && (full(u) || legacyPermission(u,p));
export const seesReports = u => !!u && stateOf(u)==='active' &&
 (directors.includes(u.role)||isHQReporter(u));
export const writesReports = u => seesReports(u);
const normalizeUnit=v=>String(v??'').trim().toLowerCase();
const sameUnit=(a,b)=>!!normalizeUnit(a)&&normalizeUnit(a)===normalizeUnit(b);
function canSeeLegacyItem(u,r,kind){
 if(stateOf(u)!=='active')return false;
 if(isDirectorRole(u))return true;
 if(!isHQReporter(u))return false;
 // Shared HQ reporting: leaders can see all NINE HQ departments, never a
 // center report or unrelated staff/personal record. Own drafts remain private.
 if(r.original)return false;
 return !r.center&&isNineHQDepartment(r.department)&&
   (r.userId===u.id||r.submission==='submitted'||['submitted','delayed','approved','locked'].includes(r.status));
}
export const centerRoles=['center_senior_leader','center_leader','center_department_leader','potential_center_leader','potential_department_leader','volunteer'];
const mondayStaffRoles=['media_leader','followup_leader','service_leader','counseling_leader','research_leader','event_leader','admin_finance','monday_leader','support_leader','establishment_leader','international_staff','assisting_staff','prayer_staff','hq_staff','staff'];
export const isMondayParticipant = u => !!u&&!u.onboarding&&stateOf(u)==='active'&&(directors.includes(u.role)||(!String(u.center||'').trim()&&mondayStaffRoles.includes(u.role)));
function validateCenterAssignment(u){
 if(!centerRoles.includes(u.role))return;
 required(u.center,'centerRequired');
 if(['center_senior_leader','center_leader','center_department_leader'].includes(u.role))required(u.department,'departmentRequired');
 required(!['monday staff program','monday-staff','international','prayer','የሰኞ ሠራተኞች ፕሮግራም'].includes(normalizeUnit(u.department)),'departmentScopeMismatch');
}
export const managesAttendance = u => isMondayParticipant(u)&&(permit(u,'attendance') || ['admin_finance','monday_leader'].includes(u?.role));
export const publishes = u => permit(u,'announcements') || (!isCenterAccount(u)&&['admin_finance','monday_leader'].includes(u?.role));
export const now = () => new Date().toISOString();
export const version = r => Number(r?._v||0);
export class AppError extends Error {
  constructor(code,status=400){super(code);this.status=status;}
}
function need(ok,code='forbidden',status=403){if(!ok) throw new AppError(code,status);}
function required(ok,code='required'){need(ok,code,400);}
function txt(v,n=8000){const s=String(v??'').trim();required(s.length<=n,'tooLong');return s;}
function strings(body,keys,max){return Object.fromEntries(keys.map(k=>[k,txt(body[k],max)]));}
function exists(value){need(value,'missing',404);return value;}
function fresh(record,seen){need(version(record)===seen,'conflict',409);}
function put(db,bucket,record){const saved={...record,_v:version(record)+1};db.put(bucket,saved);return saved;}
function audit(db,actor,action,target){
  db.put('audit',{id:crypto.randomUUID(),actorId:actor.id,actorName:actor.name,action,target,at:now()});
}
function knownRole(r){required(own(roleDepartments,r),'roleInvalid');return r;}
function userName(v){const s=txt(v,120).toLowerCase();required(s && !/[\u0000-\u001f]/.test(s),'usernameRequired');return s;}
function uniqueName(db,v){need(!db.all('users').some(u=>String(u.username).toLowerCase()===v),'nameTaken',409);}
const privateUser = u => {const {passwordHash,password,...profile}=u;return profile;};
const directoryUser = u => ({id:u.id,name:u.name,role:u.role,department:u.department,center:u.center,profession:u.profession,photo:u.photo,accountStatus:stateOf(u)});
const allActiveAdmins = db => db.all('users').filter(full);
export function bootstrapOpen(db){
  const used=db.one('system','director-slots')||{};
  return directors.some(role=>!used[role]&&!db.all('users').some(u=>u.role===role));
}
function reserveDirectorSlot(db,user){
  const slots=db.one('system','director-slots')||{id:'director-slots'};
  need(!slots[user.role]&&!db.all('users').some(u=>u.role===user.role),'directorSlotTaken',409);
  db.put('system',{...slots,[user.role]:{usedAt:now(),id:user.id}});
}
function usablePhoto(photo){
  required(/^data:image\/(png|jpe?g|gif|webp|bmp|avif|heic|heif);base64,[A-Za-z0-9+/=]+$/i.test(photo) && photo.length<=2801000,'photoInvalid');
  return photo;
}
function profileData(data,previous={},complete=false){
  const out={...previous,...strings(data,['name','phone','email','profession','church','churchService','occupation','talents','hobbies','languages','center'],500)};
  out.address=strings(data.address||{},['country','region','city','subcity','woreda','kebele','landmark'],500);
  out.photo=data.photo && data.photo!==previous.photo ? usablePhoto(data.photo) : (previous.photo||'');
  required(out.name,'required');
  if(complete){
    required(out.phone && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(out.email),'profileRequired');
    validateCenterAssignment(out);
  }
  return out;
}
function consent(data){required(Array.isArray(data.accepted) && data.accepted.length===12 && data.accepted.every(v=>v===true),'consentRequired');}
function privileged(u){return directors.includes(u.role)||u.fullAdmin===true||!!u.adminPermissions?.length;}
export function canManage(actor,target){
 if(!permit(actor,'manage_users'))return false;
 if(full(actor))return true;
 if(privileged(target))return false;
 if(actor.center)return !!target.center&&sameUnit(actor.center,target.center);
 return !!actor.department&&!target.center&&sameUnit(actor.department,target.department);
}
function keepOne(db,old,next){
  if(full(old)&&!full(next)) need(allActiveAdmins(db).some(x=>x.id!==old.id),'lastAdmin',409);
}
function timestampUser(data,passwordHash){
  const role=knownRole(data.role);
  return {id:crypto.randomUUID(),name:txt(data.name,240),username:userName(data.username),role,
    department:roleDepartments[role]||(['potential_center_leader','volunteer'].includes(role)?'':txt(data.department,160)),center:txt(data.center,160),passwordHash,createdAt:now(),adminPermissions:[],sessionVersion:0};
}
function register(db,data,verifier,bootstrapAuthorized){
  const base=timestampUser(data,verifier);uniqueName(db,base.username);consent(data);
  const requestedDirector=directors.includes(base.role);
  // Both director roles share one backend secret but may be claimed once each.
  if(requestedDirector){need(bootstrapAuthorized,'setupKey',403);reserveDirectorSlot(db,base);}
  const user={...profileData(data,base,true),privacyVersion:'1.0',privacyAcceptedAt:now(),accountStatus:requestedDirector?'active':'pending'};
  put(db,'users',user);audit(db,user,requestedDirector?'admin.bootstrap':'account.request',user.id);
  return {status:user.accountStatus};
}
// Delete the account itself, remove its live credentials and challenges, and
// de-identify structured authorship metadata in preserved organizational records.
// Free-text documents/reports and offsite backups can still contain identifying
// material; those require separate human/legal retention review.
const REDACTED_MEMBER = 'Former member';
const linkedIds = new Set([
  'userId','actorId','createdBy','approvedBy','removedBy','adminGrantedBy',
  'directorId','editedBy','recordedBy','ownerId','personId','by',
  'updatedBy','reviewerId','submittedBy','assignedTo'
]);
const linkedNames = new Set([
  'submitterName','actorName','byName','personName','author',
  'reviewerName','approvedByName','ownerName'
]);
function deidentifyRecord(value,person){
  if(Array.isArray(value)){
    let changed=false;
    const next=value.map(item=>{const updated=deidentifyRecord(item,person);changed ||= updated.changed;return updated.value;});
    return {value:changed?next:value,changed};
  }
  if(!value||typeof value!=='object')return {value,changed:false};
  let changed=false;
  const next={...value};
  for(const [key,entry] of Object.entries(next)){
    if(linkedIds.has(key) && entry===person.id){
      next[key]=null;changed=true;continue;
    }
    if(linkedNames.has(key)&& typeof entry==='string' &&
      (entry===person.name || entry===person.username)){
      next[key]=REDACTED_MEMBER;changed=true;continue;
    }
    if((key==='owner'||key==='actionOwner') && typeof entry==='string' &&
      (entry===person.id||entry===person.name||entry===person.username)){
      next[key]=REDACTED_MEMBER;changed=true;continue;
    }
    // Collections such as review.history contain nested author fields.
    if(entry&&typeof entry==='object'){
      const nested=deidentifyRecord(entry,person);
      if(nested.changed){next[key]=nested.value;changed=true;}
    }
  }
  return {value:changed?next:value,changed};
}
function permanentlyEraseAccount(db,actor,person,data,hashes){
  need(full(actor));
  // Re-authentication is checked by handle() before entering the atomic write.
  required(typeof data.confirmUsername==='string' && data.confirmUsername===person.username &&
    data.confirmPhrase==='DELETE','purgeConfirmation');
  if(full(person))need(allActiveAdmins(db).some(u=>u.id!==person.id),'lastAdmin',409);

  // Personal-only v11 documents and privately held files are not historical
  // organizational records: remove their metadata during account erasure.
  for(const entry of db.all('v11_records'))if(entry.ownerId===person.id&&entry.scopeType==='personal')db.drop('v11_records',entry.id);
  for(const entry of db.all('v11_files'))if(entry.ownerId===person.id&&entry.scopeType==='personal')db.drop('v11_files',entry.id);
  const changes={};
  const historyBuckets=['users','reports','plans','comments','attendance',
    'announcements','projects','documents','audit','reviews','v11_records','v11_files'];
  const updatedVersions=new Map();
  for(const bucket of historyBuckets){
    let count=0;
    for(const record of db.all(bucket)){
      if(bucket==='users'&&record.id===person.id)continue;
      const result=deidentifyRecord(record,person);
      let revised=result.value,changed=result.changed;
      if((bucket==='reports'||bucket==='plans')&&record.userId===person.id){
        // A role that was held by only one employee can re-identify them.
        revised={...revised,submitterRole:''};changed=true;
      }
      if(bucket==='audit'&&record.target===person.id){
        revised={...revised,target:'account-redacted'};changed=true;
      }
      if(bucket==='reviews'){
        const revisedItemVersion=updatedVersions.get(`${record.kind}:${record.itemId}`);
        if(revisedItemVersion!==undefined && record.recordVersion===revisedItemVersion-1){
          revised={...revised,recordVersion:revisedItemVersion};changed=true;
        }
      }
      if(changed){
        const saved=put(db,bucket,revised);
        if(bucket==='reports'||bucket==='plans')
          updatedVersions.set(`${bucket==='reports'?'report':'plan'}:${saved.id}`,version(saved));
        count++;
      }
    }
    if(count)changes[bucket]=count;
  }
  let sessions=0,challenges=0,receipts=0;
  for(const item of db.all('sessions'))if(item.userId===person.id){db.drop('sessions',item.id);sessions++;}
  for(const item of db.all('otps'))if(item.userId===person.id ||
    item.id===`otp:password:${person.id}`||item.id===`otp:email-change:${person.id}`){db.drop('otps',item.id);challenges++;}
  for(const item of db.all('receipts'))if(item.id?.startsWith(person.id+':') ||
    item.result?.id===person.id){db.drop('receipts',item.id);receipts++;}
  db.eraseAttempts?.(hashes);
  db.drop('users',person.id);
  // A non-identifying audit record signals the irreversible operation without
  // recreating the removed account identifier, username or email address.
  db.put('audit',{id:crypto.randomUUID(),actorId:actor.id===person.id?null:actor.id,
    actorName:actor.id===person.id?REDACTED_MEMBER:actor.name,
    action:'account.purge',target:'account-redacted',at:now()});
  return {erased:true,anonymized:changes,revokedSessions:sessions,cancelledCodes:challenges,clearedReceipts:receipts};
}
function manageAccount(db,actor,action,data,secret,hashes){
  need(permit(actor,'manage_users'));
  if(action==='account.add'){
    const u=timestampUser(data,secret); required(u.name,'required');uniqueName(db,u.username);
    need(!directors.includes(u.role),'directorUseTransfer');validateCenterAssignment(u);
    if(!full(actor))need(canManage(actor,u),'forbidden');
    Object.assign(u,{accountStatus:'active',onboarding:true,createdBy:actor.id,approvedBy:actor.id,approvedAt:now()});
    put(db,'users',u);audit(db,actor,action,u.id);return {id:u.id};
  }
  const u=exists(db.one('users',data.id));need(canManage(actor,u));fresh(u,data.version);
  if(action==='account.purge')return permanentlyEraseAccount(db,actor,u,data,hashes);
  const next={...u},status=stateOf(u);
  switch(action){
    case 'account.approve': need(status==='pending','conflict',409); Object.assign(next,{accountStatus:'active',approvedBy:actor.id,approvedAt:now()});break;
    case 'account.remove': need(status!=='removed','conflict',409);Object.assign(next,{accountStatus:'removed',beforeRemoval:status,removedAt:now(),removedBy:actor.id,sessionVersion:(u.sessionVersion||0)+1});break;
    case 'account.restore': need(status==='removed','conflict',409);next.accountStatus=u.beforeRemoval==='pending'?'pending':'active';break;
    case 'account.access':
      need(directors.includes(actor.role));need(status==='active','inactive');next.role=knownRole(data.role);
      if(directors.includes(next.role)&&u.role!==next.role){
        need(!db.all('users').some(x=>x.id!==u.id&&x.role===next.role&&stateOf(x)==='active'),'directorSlotTaken',409);
      }
      required(Array.isArray(data.permissions)&&data.permissions.every(p=>permissions.includes(p)),'roleInvalid');
      next.department=roleDepartments[next.role]||txt(data.department||u.department,160);
      next.center=txt(data.center??u.center,160);
      validateCenterAssignment(next);
      required(!data.fullAdmin||directors.includes(next.role),'roleInvalid');
      required(directors.includes(next.role)?data.permissions.length===0:data.permissions.every(p=>classifiedPermissions(next).includes(p)),'permissionsInvalid');
      next.adminPermissions=[...new Set(data.permissions)];next.fullAdmin=directors.includes(next.role);
      break;
    case 'account.grant':
      need(false,'useClassifiedDelegation',403);
      next.adminGrantedBy=actor.id;next.adminGrantedAt=now();break;
    case 'account.reset':
      need(status==='active'&&u.id!==actor.id);next.passwordHash=secret;next.onboarding=true;next.sessionVersion=(u.sessionVersion||0)+1;break;
    default: throw new AppError('unknown');
  }
  keepOne(db,u,next);put(db,'users',next);audit(db,actor,action,u.id);return {id:u.id};
}
export function flow(record,review){
  if(review && review.recordVersion===version(record))return review.state;
  return record?.submission==='draft'?'draft':'submitted';
}
const reviewKind=k=>k==='report'?'reports':'plans';
function reviewedRecord(db,kind,id){
  required(['plan','report'].includes(kind),'unknown');
  return kind==='report'&&sourceIds.includes(id)?{id,original:true}:exists(db.one(reviewKind(kind),id));
}
function canWriteItem(u,k){return seesReports(u);}
function canEditItem(u,r,k,review){
  if(r.original)return false;
  return full(u)||(canWriteItem(u,k)&&r.userId===u.id&&['draft','revision_requested'].includes(flow(r,review)));
}
function num(v){if(v===''||v==null)return null;const n=Number(v);required(Number.isFinite(n)&&n>=0,'numberInvalid');return n;}
function month(v){required(/^\d{4}-(0[1-9]|1[0-2])$/.test(v),'monthRequired');return v;}
function saveItem(db,u,kind,d){
  need(canWriteItem(u,kind));const bucket=reviewKind(kind);
  const old=d.id?reviewedRecord(db,kind,d.id):null;
  const review=old?db.one('reviews',kind+':'+old.id):null;
  if(old){need(canSeeLegacyItem(u,old,kind)&&canEditItem(u,old,kind,review));fresh(old,d.version);fresh(review,d.reviewVersion);}
  required(['draft','submitted','delayed'].includes(d.status),'invalidTransition');
  let fields;
  if(kind==='report'){
    fields=strings(d,['activity','recordId','department','center','activityDate','result','problem','challenge','actionTaken','nextAction','actionOwner','dueDate','priority','dataSource','evidence','notes']);
    required(fields.activity,'titleRequired');
    for(const k of ['planned','actual','views','engagement','followers'])fields[k]=num(d[k]);
    fields.recordId ||= old?.recordId||'GA-'+crypto.randomUUID().slice(0,8).toUpperCase();
  }else{
    fields=strings(d,['title','objective','target','department','owner','dueDate','projectId']);
    required(fields.title && fields.objective,'planRequired');
    if(fields.projectId && fields.projectId!==old?.projectId)exists(db.one('projects',fields.projectId));
  }
  if(!full(u)){
    if(kind==='plan')need(isHQReporter(u)&&sameUnit(u.department,fields.department),'forbidden');
    else need(isHQReporter(u)&&sameUnit(u.department,fields.department)&&!fields.center,'forbidden');
  }
  const time=now(),submission=d.status==='draft'?'draft':'submitted';
  const r={...old,...fields,id:old?.id||crypto.randomUUID(),userId:old?.userId||u.id,submitterName:old?.submitterName||u.name,
    submitterRole:old?.submitterRole||u.role,month:month(d.month),status:d.status,submission,original:false,
    createdAt:old?.createdAt||old?.submittedAt||time,submittedAt:old?.submittedAt||(submission==='draft'?null:time),updatedAt:time};
  put(db,bucket,r);audit(db,u,kind+'.'+(old?'edit':submission),r.id);return {id:r.id};
}
function decide(db,u,d){
  const r=reviewedRecord(db,d.kind,d.id);need(directors.includes(u.role)&&canSeeLegacyItem(u,r,d.kind),'forbidden');
  const key=d.kind+':'+r.id,old=db.one('reviews',key);fresh(r,d.version);fresh(old,d.reviewVersion);
  const current=flow(r,old),state=d.decision;
  required(['under_review','approved','revision_requested','locked'].includes(state),'invalidTransition');
  need(current!=='draft' && (state!=='locked'||current==='approved') && state!==current,'invalidTransition',409);
  const note=txt(d.note);if(state==='revision_requested')required(note,'revisionNote');
  const event={state,note,by:u.id,byName:u.name,at:now(),recordVersion:version(r)};
  put(db,'reviews',{...old,...event,id:key,kind:d.kind,itemId:r.id,history:[...(old?.history||[]),event]});
  audit(db,u,d.kind+'.'+state,r.id);return {id:r.id};
}
function editComment(db,u,d){
  need(directors.includes(u.role),'forbidden');const report=reviewedRecord(db,'report',d.reportId);need(canSeeLegacyItem(u,report,'report'),'forbidden');
  const old=d.id?exists(db.one('comments',d.id)):null;
  if(old){need(old.reportId===report.id&&(full(u)||old.directorId===u.id));fresh(old,d.version);}
  const text=txt(d.text);required(text,'required');
  const c={...old,id:old?.id||crypto.randomUUID(),reportId:report.id,directorId:old?.directorId||u.id,
    author:old?.author||u.name,text,visible:d.visible!==false,updatedAt:now(),editedBy:u.id};
  put(db,'comments',c);audit(db,u,'comment.save',report.id);return {id:c.id};
}
function personKnown(db,id){return seedPeople.some(p=>p.id===id)||stateOf(db.one('users',id))==='active'&&!!db.one('users',id);}
function attachment(f){
  if(!f)return null;
  required(typeof f.data==='string' && /^data:[^,"<>\s]*;base64,[A-Za-z0-9+/=]*$/.test(f.data) && f.data.length<=2801500,'fileInvalid');
  return {name:txt(f.name,260),type:txt(f.type,150),data:f.data};
}
function editRecord(db,u,bucket,d){
  required(['attendance','announcements','projects','documents'].includes(bucket),'unknown');
  const old=d.id?exists(db.one(bucket,d.id)):null;let values;
  if(bucket==='attendance'){
    need(managesAttendance(u)); const {personId,date,status,note,programType}=strings(d,['personId','date','status','note','programType']);
    required(personKnown(db,personId)||old?.personId===personId,'required');
    need(isMondayParticipant(db.one('users',personId)||seedPeople.find(p=>p.id===personId)),'mondayStaffOnly');
    required(/^\d{4}-\d\d-\d\d$/.test(date)&&['present','absent','permitted','late'].includes(status)&&['regular','special','event'].includes(programType));
    const same=db.all(bucket).findLast(r=>r.id!==old?.id && r.date===date && r.personId===personId && (r.programType||'regular')===programType);
    if(same && (!old || !(old.date===date && old.personId===personId && (old.programType||'regular')===programType)))throw new AppError('attendanceExists',409);
    values={personId,date,status,note,programType,recordedBy:u.id,personName:db.one('users',personId)?.name||seedPeople.find(p=>p.id===personId)?.name||old?.personName};
  }else{
    if(bucket==='announcements')need(publishes(u));
    if(bucket==='projects')need(full(u)||permit(u,'projects'),'forbidden');
    if(bucket==='documents')need(permit(u,'documents'));
    if(old){need(full(u)||permit(u,bucket));if(['projects','documents'].includes(bucket))need(full(u)||old.createdBy===u.id||bucket==='documents'&&old.ownerId===u.id);}
    const title=txt(d.title,500);required(title,'titleRequired');
    if(bucket==='documents'){
      values={title,...strings(d,['type','expiry','fileName'],500),ownerId:old?.ownerId||u.id};
      required(values.fileName,'required');
    }else{
      values={title,body:txt(d.body),file:own(d,'file')?attachment(d.file):old?.file||null};
      if(bucket==='projects')Object.assign(values,strings(d,['owner','due'],250));
      if(bucket==='announcements')values.author=old?.author||u.name;
    }
  }
  if(old)fresh(old,d.version);
  const r={...old,...values,id:old?.id||crypto.randomUUID(),createdAt:old?.createdAt||now(),updatedAt:now(),createdBy:old?.createdBy||u.id};
  put(db,bucket,r);audit(db,u,bucket+'.save',r.id);return {id:r.id};
}
function removeRecord(db,u,d){
  need(full(u));required(['reports','plans','comments','projects','announcements','attendance','documents'].includes(d.bucket),'unknown');
  if(d.bucket==='attendance')need(managesAttendance(u));
  need(!(d.bucket==='reports'&&sourceIds.includes(d.id)),'sourceLocked');
  const old=exists(db.one(d.bucket,d.id));fresh(old,d.version);db.drop(d.bucket,d.id);
  audit(db,u,d.bucket+'.remove',d.id);return {id:d.id};
}
function visibleState(db,u){
  if(u.onboarding)return {me:privateUser(u),onboarding:true};
  const all=db.all('users'),members=all.filter(x=>stateOf(x)==='active'),admin=permit(u,'manage_users');
  const reviews=db.all('reviews'),reportAccess=seesReports(u),reports=reportAccess?db.all('reports').filter(r=>
    canSeeLegacyItem(u,r,'report')&&(flow(r)!=='draft'||r.userId===u.id||directors.includes(u.role))):[];
  const plans=db.all('plans').filter(r=>canSeeLegacyItem(u,r,'plan') &&
    (r.userId===u.id || directors.includes(u.role) || ['submitted','under_review','approved','locked'].includes(flow(r,reviews.find(v=>v.id==='plan:'+r.id)))));
  const reportIds=new Set([...(seesReports(u)?sourceIds:[]),...reports.map(r=>r.id)]),planIds=new Set(plans.map(r=>r.id));
  const visiblePeople=full(u)?members:
    u.center?members.filter(x=>x.id===u.id||x.center===u.center||directors.includes(x.role)):
    u.department?members.filter(x=>x.id===u.id||(!x.center&&x.department===u.department)||directors.includes(x.role)):
    members.filter(x=>x.id===u.id||directors.includes(x.role));
  return {me:privateUser(u),directory:visiblePeople.map(directoryUser),former:full(u)?all.filter(x=>stateOf(x)==='removed').map(x=>({id:x.id,name:x.name})):[],
    users:admin?all.filter(x=>full(u)||canManage(u,x)).map(privateUser):[],reports,plans,
    reviews:reviews.filter(r=>r.kind==='plan'?planIds.has(r.itemId):reportIds.has(r.itemId)),
    comments:reportAccess?db.all('comments').filter(c=>reportIds.has(c.reportId)&&(c.visible===true||directors.includes(u.role))):[],
    attendance:isMondayParticipant(u)?db.all('attendance').filter(r=>managesAttendance(u)||r.personId===u.id):[],
    projects:db.all('projects').filter(r=>full(u)||r.createdBy===u.id),announcements:db.all('announcements'),
    documents:permit(u,'documents')?db.all('documents').filter(r=>full(u)||r.ownerId===u.id):[],
    audit:full(u)?db.all('audit').slice(-100).reverse():[],...v11State(db,u)};
}
const encoder=new TextEncoder();
const hex=b=>Array.from(new Uint8Array(b),x=>x.toString(16).padStart(2,'0')).join('');
export const digest=async s=>hex(await crypto.subtle.digest('SHA-256',encoder.encode(s)));
async function derive(password,salt){
  const key=await crypto.subtle.importKey('raw',encoder.encode(password),'PBKDF2',false,['deriveBits']);
  return hex(await crypto.subtle.deriveBits({name:'PBKDF2',hash:'SHA-256',salt:encoder.encode(salt),iterations:100000},key,256));
}
export async function makeVerifier(p){
  required(typeof p==='string' && p.length>=8 && p.length<=256 && /[A-Za-z]/.test(p) && /[0-9]/.test(p),'weakPassword');
  const salt=hex(crypto.getRandomValues(new Uint8Array(16)));return 'p2$'+salt+'$'+await derive(p,salt);
}
function legacyHash(p){let h=2166136261;for(let i=0;i<p.length;i++){h^=p.charCodeAt(i);h=Math.imul(h,16777619);}return 'g'+(h>>>0).toString(16);}
function same(a,b){if(a.length!==b.length)return false;let v=0;for(let i=0;i<a.length;i++)v|=a.charCodeAt(i)^b.charCodeAt(i);return v===0;}
export async function matches(u,p,local){
  if(typeof p!=='string'||p.length>256||!u)return false;
  const h=String(u.passwordHash||'');
  if(!h.startsWith('p2$'))return local&&same(h,legacyHash(p));
  const [,salt,stored]=h.split('$');return same(await derive(p,salt),stored);
}
function admitted(u){need(u,'expired',401);need(stateOf(u)==='active',stateOf(u)==='pending'?'pending':'removed',403);return u;}
function command(db,u,a,d,verifier,hashes){
  if(a==='profile.complete'){
    need(u.onboarding);consent(d);
    const v=profileData(d,u,true);Object.assign(v,{passwordHash:verifier,onboarding:false,privacyVersion:'1.0',privacyAcceptedAt:now(),sessionVersion:(u.sessionVersion||0)+1});
    put(db,'users',v);audit(db,u,a,u.id);return {};
  }
  need(!u.onboarding,'onboarding');
  if(a.startsWith('account.'))return manageAccount(db,u,a,d,verifier,hashes);
  if(a==='profile.save'){
    const target=d.id&&d.id!==u.id?exists(db.one('users',d.id)):u;need(target.id===u.id||full(u));fresh(target,d.version);
    const revised=profileData(d,target);
    if(target.id===u.id){need(revised.center===target.center,'centerChangeRequiresAdmin',403);}
    need(String(revised.email||'').trim().toLowerCase()===String(target.email||'').trim().toLowerCase(),'emailChangeVerification',400);
    put(db,'users',revised);audit(db,u,a,target.id);return {};
  }
  if(a==='password.change'){
    put(db,'users',{...u,passwordHash:verifier,sessionVersion:(u.sessionVersion||0)+1});audit(db,u,a,u.id);return {};
  }
  if(a==='session.revoke'){
    put(db,'users',{...u,sessionVersion:(u.sessionVersion||0)+1});audit(db,u,a,u.id);return {};
  }
  if(a==='report.save'||a==='plan.save')return saveItem(db,u,a.split('.')[0],d);
  if(a==='review')return decide(db,u,d);
  if(a==='comment.save')return editComment(db,u,d);
  if(a==='attendance.batch'){
    need(managesAttendance(u));required(Array.isArray(d.rows) && d.rows.length>0 && d.rows.length<=500);
    const seen=new Set();
    for(const row of d.rows){
      required(!seen.has(row.personId));seen.add(row.personId);
      editRecord(db,u,'attendance',{...row,date:d.date,programType:d.programType});
    }
    return {count:seen.size};
  }
  if(a==='record.save')return editRecord(db,u,d.bucket,d);
  if(a==='record.remove')return removeRecord(db,u,d);
  if(a.startsWith('v11.')){if(a==='v11.fileReview')return approveFile(db,u,d.id,d.decision);return v11Command(db,u,a,d);}
  throw new AppError('unknown',404);
}
// Validate a backend session for a user who is requesting an email-address change.
// Never return this record to an unauthenticated caller.
export async function authenticatedUser(db,token){
  if(typeof token!=='string'||!token||token.length>256)throw new AppError('expired',401);
  const session=db.one('sessions',await digest(token));
  if(!session||session.until<=Date.now())throw new AppError('expired',401);
  const user=admitted(db.one('users',session.userId));
  if((user.sessionVersion||0)!==session.epoch)throw new AppError('expired',401);
  return {user,session};
}
// Password derivation is asynchronous. Re-read the actor and target inside the atomic write after every await.
export async function handle(db,route,data={},context={}){
  const local=context.local===true;
  if(route==='info')return {bootstrap:bootstrapOpen(db)};
  if(route==='register'){
    // Never bootstrap a real director in publicly inspectable browser code.
    if(local && directors.includes(data.role))throw new AppError('directorRequiresServer',403);
    const hash=await makeVerifier(data.password);
    return db.atomic(()=>register(db,data,hash,local||context.bootstrapAuthorized===true));
  }
  const tokenHash=context.token?await digest(context.token):null;
  const session=()=>{
    const s=tokenHash?db.one('sessions',tokenHash):null;
    if(!s && local && context.legacyId && !context.token){
      const legacy=db.one('users',context.legacyId);
      need(legacy && !(legacy.sessionVersion||0),'expired',401);return admitted(legacy);
    }
    need(s&&s.until>Date.now(),'expired',401);const u=admitted(db.one('users',s.userId));
    need((u.sessionVersion||0)===s.epoch,'expired',401);return u;
  };
  if(route==='login'){
    const name=userName(data.username),old=db.all('users').find(u=>String(u.username).toLowerCase()===name);
    need(await matches(old,data.password,local),'invalidLogin',401);
    const newHash=!old.passwordHash.startsWith('p2$')?await makeVerifier(data.password):null;
    const token=hex(crypto.getRandomValues(new Uint8Array(32))),id=await digest(token);
    return db.atomic(()=>{
      const u=admitted(db.one('users',old.id));need(u.passwordHash===old.passwordHash,'invalidLogin',401);
      if(newHash)db.put('users',{...u,passwordHash:newHash});
      for(const s of db.all('sessions'))if(s.until<=Date.now())db.drop('sessions',s.id);
      db.put('sessions',{id,userId:u.id,epoch:u.sessionVersion||0,until:Date.now()+86400000});
      return {token};
    });
  }
  if(route==='logout'){if(tokenHash)await db.atomic(()=>db.drop('sessions',tokenHash));return {};}
  const actor=session();
  if(route==='state')return visibleState(db,actor);
  need(route==='command','unknown',404);const {action,payload={},requestId}=data;
  required(typeof action==='string' && typeof requestId==='string' && /^[a-zA-Z0-9-]{16,80}$/.test(requestId),'unknown');
  const key=actor.id+':'+requestId,previous=db.one('receipts',key);if(previous)return previous.result;
  let verifier=null;
  if(action==='account.add'||action==='account.reset')need(permit(actor,'manage_users'));
  if(action==='account.purge'){
    need(full(actor),'forbidden',403);
    need(await matches(actor,payload.currentPassword,local),'wrongPassword',403);
  }
  if(action==='password.change')need(await matches(actor,payload.currentPassword,local),'wrongPassword');
  if(action==='profile.complete'){need(actor.onboarding);required(!await matches(actor,payload.password,local),'newPasswordNeeded');}
  if(['account.add','account.reset','password.change','profile.complete'].includes(action))verifier=await makeVerifier(payload.password);
  let purgeHashes=null;
  if(action==='account.purge'){
    const target=db.one('users',payload.id);
    purgeHashes=target ? {username:await digest(String(target.username||'').trim().toLowerCase()),
      email:await digest(String(target.email||'').trim().toLowerCase())} : null;
  }
  return db.atomic(()=>{
    const u=session(),receipt=db.one('receipts',key);if(receipt)return receipt.result;
    if(action==='password.change'||action==='account.purge')need(u.passwordHash===actor.passwordHash,'conflict',409);
    const result=command(db,u,action,payload,verifier,purgeHashes);
    if(['profile.complete','password.change'].includes(action) && tokenHash){
      const s=db.one('sessions',tokenHash);db.put('sessions',{...s,epoch:db.one('users',u.id).sessionVersion});
    }
    // Do not put any deleted person's identifier back into an idempotency receipt.
    if(action!=='account.purge')db.put('receipts',{id:key,result,at:Date.now()});
    return result;
  });
}
