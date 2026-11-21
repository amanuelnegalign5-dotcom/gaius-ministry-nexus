import {V11_KINDS,V11_KINDS_LIST} from './gaius-v11-model.js';
import {isHQReporter,isDirectorRole,isNineHQDepartment} from './gaius-report-policy.js';
// Authoritative v11 permission logic. Every API write/read runs these checks in the Worker.
const clean=(x,n=9000)=>String(x??'').trim().slice(0,n);
const isDirector=u=>['country_director','international_director'].includes(u?.role)||u?.fullAdmin===true;
const granted=(u,p)=>isDirector(u)||(u?.adminPermissions||[]).includes(p);
const active=u=>u&&u.accountStatus!=='removed'&&u.accountStatus!=='pending';
const fail=(code,status=403)=>{const e=new Error(code);e.status=status;throw e;};
const check=(condition,code='forbidden',status=403)=>{if(!condition)fail(code,status);};
const at=()=>new Date().toISOString();
const ver=r=>Number(r?._v||0);
const homeScope=u=>['center_leader','potential_center_leader','center_department_leader','potential_department_leader','volunteer'].includes(u?.role)?'center': ['country_director','international_director'].includes(u?.role)?'personal':'hq';
export const validScope=(s)=>['organization','hq','center','personal'].includes(s);
function belongs(u,r){
 if(r.scopeType==='personal')return r.ownerId===u.id;
 if(r.scopeType==='center')return !!u.center&&String(u.center)===String(r.scopeId);
 if(r.scopeType==='hq')return !!u.department&&String(u.department)===String(r.scopeId);
 return r.scopeType==='organization';
}
// Default-deny, unit-scoped policy. A permission flag does not erase the user's unit boundary.
const CENTER_ROLES=new Set(['center_leader','center_department_leader']);
const unit=x=>String(x??'').trim().toLowerCase();
const sameUnit=(a,b)=>!!unit(a)&&unit(a)===unit(b);
const hqLeader=u=>isHQReporter(u);
const centerMember=u=>CENTER_ROLES.has(u?.role)&&!!u.center;
const centerDepartmentMatches=(u,r)=>sameUnit(u.department,r.data?.departmentType||r.data?.department||r.data?.unit);
const sharedStatus=r=>['approved','submitted'].includes(r.status);
function canRead(u,r){
 if(!active(u))return false;
 if(r.scopeType==='personal')return r.ownerId===u.id;
 // HQ plans/reports are shared only among the nine assigned HQ leaders and
 // the real Directors. A custom fullAdmin flag is NOT a reporting role.
 if(r.scopeType==='hq'&&['monthly','plans6'].includes(r.kind)){
  if(isDirectorRole(u))return true;
  if(!hqLeader(u)||!isNineHQDepartment(r.scopeId))return false;
  return r.ownerId===u.id||sharedStatus(r);
 }
 if(isDirector(u))return true;
 // Publicly approved updates can be viewed by leaders, not unrelated staff.
 if(r.scopeType==='organization'){
  if(r.kind==='centers')return centerMember(u)&&sameUnit(u.center,r.data?.name)&&r.status==='approved';
  return r.kind==='updates'&&r.status==='approved'&&(hqLeader(u)||centerMember(u));
 }
 if(r.kind==='board'||r.kind==='advisoryMeetings'||r.kind==='visits'||r.kind==='directorGoals')return false;
 if(r.kind==='manuals')return granted(u,'v11:edit_manual')&&belongs(u,r);
 if(r.kind==='succession'&&r.ownerId!==u.id&&r.data?.leaderId!==u.id)return false;
 if(r.scopeType==='center'){
  if(!centerMember(u)||!sameUnit(u.center,r.scopeId))return false;
  if(r.ownerId===u.id)return true;
  if(u.role==='center_leader')return sharedStatus(r);
  return centerDepartmentMatches(u,r)&&sharedStatus(r);
 }
 if(r.scopeType==='hq'){
  if(!hqLeader(u)||!sameUnit(u.department,r.scopeId))return false;
  return r.ownerId===u.id||sharedStatus(r);
 }
 return false;
}
function canCreate(u,k,scopeType,scopeId){
 if(!active(u)||!V11_KINDS[k])return false;
 if(V11_KINDS[k].personalOnly)return isDirector(u)&&scopeType==='personal'&&scopeId===u.id&&u.role==='country_director';
 if(scopeType==='personal'){
  if(isDirector(u))return scopeId===u.id&&!V11_KINDS[k].centerOnly;
  // Private personal reporting workspace for staff and center-related workers
  // who are not assigned a center-leadership role. No HQ report access.
  return scopeId===u.id&&['monthly','plans6'].includes(k);
 }
 if(scopeType==='hq'&&['monthly','plans6'].includes(k)&&!isDirectorRole(u)&&!hqLeader(u))return false;
 if(isDirector(u))return true;
 if(V11_KINDS[k].fullOnly||k==='centers')return false;
 if(V11_KINDS[k].fullOrPermission&&!granted(u,V11_KINDS[k].fullOrPermission))return false;
 if(k==='followups'||k==='centerAttendance')return false;
 if(scopeType==='center')return centerMember(u)&&sameUnit(scopeId,u.center)&&!V11_KINDS[k].fullOnly;
 if(scopeType==='hq')return hqLeader(u)&&sameUnit(scopeId,u.department)&&!V11_KINDS[k].centerOnly;
 if(scopeType==='organization')return granted(u,'v11:publish')&&['updates'].includes(k);
 return false;
}
function validate(k,input){
 const out={},schema=V11_KINDS[k];check(schema,'invalidKind',400);
 for(const [key,, ,type,required] of schema.fields){
  const raw=input?.[key];const v=clean(raw,type==='long'?40000:900);
  if(required)check(v,'required:'+key,400);
  if(type==='number'&&v){const n=Number(v);check(Number.isFinite(n)&&n>=0&&n<=100000000,'numberInvalid',400);out[key]=n;}
  else if(type==='date'&&v){check(/^\d{4}-\d{2}-\d{2}$/.test(v)&&!Number.isNaN(Date.parse(v)),'dateInvalid',400);out[key]=v;}
  else if(type==='month'&&v){check(/^\d{4}-(0[1-9]|1[0-2])$/.test(v),'monthRequired',400);out[key]=v;}
  else if(type==='slot'&&v){check(['1','2'].includes(v),'slotInvalid',400);out[key]=v;}
  else if(type==='focus'&&v){check(['discipleship','evangelism','mission','holistic'].includes(v),'focusInvalid',400);out[key]=v;}
  else if(type==='level'&&v){check(['A','B','C'].includes(v),'levelInvalid',400);out[key]=v;}
  else if(type==='attendance'&&v){check(['present','absent','late','excused'].includes(v),'attendanceInvalid',400);out[key]=v;}
  else out[key]=v;
 }
 if(k==='plans6'&&out.start&&out.end)check(out.start<=out.end,'dateInvalid',400);
 return out;
}
function audit(db,actor,action,record){db.put('audit',{id:crypto.randomUUID(),actorId:actor.id,actorName:actor.name,action,target:record?.id||record,at:at()});}
function save(db,u,p){
 const kind=clean(p.kind,60),def=V11_KINDS[kind];check(def,'invalidKind',400);
 const old=p.id?db.one('v11_records',p.id):null;
 if(p.id)check(old&&old.kind===kind,'missing',404);
 const scopeType=old?.scopeType||clean(p.scopeType,30)||homeScope(u);
 const scopeId=old?.scopeId||clean(p.scopeId,160)||(scopeType==='center'?u.center:scopeType==='hq'?u.department:scopeType==='personal'?u.id:'org');
 check(validScope(scopeType),'scopeInvalid',400);
 check(!!scopeId,'scopeIdRequired',400);
 check(canCreate(u,kind,scopeType,scopeId)||old&&isDirector(u)&&scopeType!=='personal','forbidden');
 if(old){
  check(canRead(u,old),'forbidden');check(old._v===Number(p.version),'conflict',409);
  check(['draft','revision_requested'].includes(old.status),'lockedRecord',409);
  check(isDirector(u)||old.ownerId===u.id,'forbidden');
 }
 const data=validate(kind,p.data||{});
 // A center department cannot label or publish reports for a different department.
 if(!isDirector(u)&&scopeType==='center'&&u.role==='center_department_leader'&&kind==='monthly'){
  check(!data.departmentType||sameUnit(data.departmentType,u.department),'departmentScopeMismatch');
  data.departmentType=u.department;
 }
 if(kind==='visits'){
   check(u.role==='country_director'&&scopeType==='personal'&&scopeId===u.id,'forbidden');
   const center=db.one('v11_records',data.centerRecordId);check(center&&center.kind==='centers'&&center.status!=='archived','centerNotFound',400);
 }
 if(kind==='directorGoals')check(u.role==='country_director'&&scopeType==='personal'&&scopeId===u.id,'forbidden');
 if(kind==='succession'){
  check(data.leaderId===u.id||isDirector(u),'forbidden');
  if(scopeType==='personal')check(data.leaderId===u.id,'personalOwnerOnly');
  // Two active succession slots per incumbent, not two per editor.
  check(!db.all('v11_records').some(r=>r.id!==old?.id&&r.kind==='succession'&&r.status!=='archived'&&r.data.leaderId===data.leaderId&&r.data.slot===data.slot),'slotOccupied',409);
 }
 if(kind==='followups'){check(!db.all('v11_records').some(r=>r.id!==old?.id&&r.kind==='followups'&&r.scopeId===scopeId&&r.data?.week===data.week&&r.status!=='archived'),'duplicateWeeklyFollowup',409);}
 if(kind==='centerAttendance'){
   const participant=db.one('users',data.participantId);
   check(participant&&['center_leader','potential_center_leader'].includes(participant.role)&&participant.center===scopeId,'participantRoleInvalid',400);
   check(!db.all('v11_records').some(r=>r.id!==old?.id&&r.kind===kind&&r.scopeId===scopeId&&r.data.date===data.date&&r.data.eventType===data.eventType&&r.data.participantId===data.participantId&&r.status!=='archived'),'attendanceExists',409);
 }
 const record={id:old?.id||crypto.randomUUID(),kind,scopeType,scopeId,ownerId:old?.ownerId||u.id,ownerName:old?.ownerName||u.name,
  createdAt:old?.createdAt||at(),updatedAt:at(),status:old?.status||'draft',sourceSnapshot:old?.sourceSnapshot||null,importTag:old?.importTag||null,data,history:[...(old?.history||[]),{at:at(),by:u.id,action:old?'edited':'created'}],_v:ver(old)+1};
 db.put('v11_records',record);audit(db,u,'v11.'+kind+'.save',record);return {id:record.id};
}
function updateState(db,u,p){
 const old=db.one('v11_records',clean(p.id));check(old,'missing',404);check(canRead(u,old),'forbidden');check(old._v===Number(p.version),'conflict',409);
 const decision=clean(p.decision,40),note=clean(p.note,3000);
 if(['visits','directorGoals'].includes(old.kind))check(decision==='archive','useDedicatedWorkflow',400);check(['submit','approve','revision_requested','reject','archive','revise'].includes(decision),'invalidTransition',400);
 const authority=isDirector(u)||granted(u,'v11:approve');
 if(decision==='submit')check(old.ownerId===u.id||isDirector(u),'forbidden');
 else if(decision==='revise')check(old.ownerId===u.id||isDirector(u),'forbidden');
 else if(decision==='archive')check(isDirector(u)||old.ownerId===u.id,'forbidden');
 else {check(authority,'forbidden');if(!isDirector(u))check(old.ownerId!==u.id,'forbidden');}
 const allowed={submit:['draft','revision_requested'],approve:['submitted'],revision_requested:['submitted'],reject:['submitted'],archive:['draft','approved','rejected','revision_requested'],revise:['approved']};
 check(allowed[decision]?.includes(old.status),'invalidTransition',409);
 if(decision==='revision_requested')check(!!note,'required:note',400);
 if(old.scopeType==='personal')check(old.ownerId===u.id,'forbidden');
 if(decision==='revise'){
  // New draft revision; original approved record remains immutable and traceable.
  const next={...old,id:crypto.randomUUID(),status:'draft',supersedes:old.id,createdAt:at(),updatedAt:at(),_v:1,history:[{at:at(),by:u.id,action:'revised-from',parent:old.id}]};
  db.put('v11_records',next);audit(db,u,'v11.'+old.kind+'.revise',next);return {id:next.id};
 }
 const status={submit:'submitted',approve:'approved',revision_requested:'revision_requested',reject:'rejected',archive:'archived'}[decision];
 const next={...old,status,updatedAt:at(),_v:ver(old)+1,history:[...old.history,{at:at(),by:u.id,byName:u.name,action:decision,note}]};
 db.put('v11_records',next);audit(db,u,'v11.'+old.kind+'.'+decision,next);return {id:next.id};
}
function remove(db,u,p){
 const old=db.one('v11_records',clean(p.id));check(old,'missing',404);check(isDirector(u),'forbidden');check(old.scopeType!=='personal'||old.ownerId===u.id,'forbidden');check(old._v===Number(p.version),'conflict',409);
 // Archive preserves legal/organizational traceability; irreversible personal-data deletion is separate.
 const next={...old,status:'archived',updatedAt:at(),_v:ver(old)+1,history:[...old.history,{at:at(),by:u.id,action:'archived'}]};
 db.put('v11_records',next);audit(db,u,'v11.'+old.kind+'.archive',next);return {id:next.id};
}
// Secure director-only import. The private JSON is supplied by the Director at runtime,
// NOT embedded in frontend or public GitHub Pages source.
function importDirectorPlan(db,u,p){
 check(active(u)&&u.role==='country_director','forbidden');
 check(p?.plan?.schema==='gaius-country-director-plan-v1','invalidSource',400);
 const goals=p.plan.goals;
 check(Array.isArray(goals)&&goals.length===16,'expected16Objectives',400);
 const numbers=goals.map(g=>Number(g.no));
 check(new Set(numbers).size===16&&numbers.every(n=>Number.isInteger(n)&&n>=1&&n<=16),'objectiveNumbers',400);
 const budgets=goals.map(g=>Number(g.budget));
 check(budgets.every(n=>Number.isSafeInteger(n)&&n>=0)&&budgets.reduce((a,b)=>a+b,0)===68000&&Number(p.plan.declaredTotal)===68000,'planTotalInvalid',400);
 const existing=db.all('v11_records').filter(r=>r.kind==='directorGoals'&&r.ownerId===u.id&&r.importTag==='gaius-country-director-plan-v1');
 if(existing.length)fail('planAlreadyImported',409);
 const entries=goals.map(g=>{
  const data=validate('directorGoals',{number:g.no,title:g.title,activities:g.activities,originalMonths:g.originalMonths,
   accountable:g.accountable,collaborators:g.collaborators,expected:g.expected,budget:g.budget});
  return {id:crypto.randomUUID(),kind:'directorGoals',scopeType:'personal',scopeId:u.id,ownerId:u.id,
   ownerName:u.name,createdAt:at(),updatedAt:at(),status:'draft',_v:1,importTag:p.plan.schema,
   sourceSnapshot:{...data},data,history:[{at:at(),by:u.id,action:'imported-from-private-source'}]};
 });
 for(const r of entries)db.put('v11_records',r);
 audit(db,u,'v11.directorPlan.import',u.id);
 return {count:entries.length,totalBudget:68000};
}
// Authenticated Director import. Only extracted text traverses the backend;
// original DOCX files and this private bundle are never committed to Pages.
const SOURCE_DOCUMENTS={
 'gaius-ministry-manual-en-2026':{filename:'GAIUS MINISTRY(1).docx',kind:'ministry',scope:'organization'},
 'gaius-teaching-roadmap-am-2026':{filename:'የትምህርት ሂደት.docx',kind:'teaching',scope:'organization'},
 'gaius-country-director-six-month-plan-2026':{filename:'gaius_director_6_month_plan(1).docx',kind:'other',scope:'personal'}
};
function importSourceDocs(db,u,p){
 check(active(u)&&isDirector(u),'forbidden');
 const bundle=p?.bundle;
 check(bundle?.schema==='gaius-private-source-documents-v1','invalidSource',400);
 check(Array.isArray(bundle.documents)&&bundle.documents.length>=1&&bundle.documents.length<=3,'sourceCountInvalid',400);
 const seen=new Set(),created=[],skipped=[];
 for(const doc of bundle.documents){
  const sourceId=clean(doc?.sourceId,95),expected=SOURCE_DOCUMENTS[sourceId];
  check(expected&&!seen.has(sourceId),'sourceNotRecognized',400);
  seen.add(sourceId);
  check(doc?.sourceFile===expected.filename&&doc?.kind===expected.kind&&doc?.scopeType===expected.scope,'sourceMetadataInvalid',400);
  if(expected.scope==='personal')check(u.role==='country_director','forbidden');
  check(typeof doc.body==='string'&&doc.body.length>=50&&doc.body.length<=40000,'sourceTextInvalid',400);
  check(typeof doc.sourceSha256==='string'&&/^[a-f0-9]{64}$/.test(doc.sourceSha256),'sourceHashInvalid',400);
  const title=clean(doc.title,900);
  check(title.length>=10,'sourceTitleInvalid',400);
  const existing=db.all('v11_records').find(x=>x.kind==='manuals'&&x.importTag===sourceId&&
    (expected.scope==='organization'||x.ownerId===u.id)&&x.status!=='archived');
  if(existing){skipped.push(sourceId);continue;}
  const data=validate('manuals',{title,kind:doc.kind,body:doc.body,
   versionNote:'Source-derived text from '+expected.filename+'; original DOCX is not uploaded and approval is separate.'});
  const record={id:crypto.randomUUID(),kind:'manuals',
   scopeType:expected.scope,scopeId:expected.scope==='personal'?u.id:'org',
   ownerId:u.id,ownerName:u.name,createdAt:at(),updatedAt:at(),status:'draft',
   _v:1,importTag:sourceId,data,
   sourceSnapshot:{...data,sourceId,sourceFile:expected.filename,
    docxSha256:doc.sourceSha256,extraction:clean(doc.extraction,240)},
   history:[{at:at(),by:u.id,action:'imported-source-text-private'}]};
  db.put('v11_records',record);audit(db,u,'v11.sourceDoc.import',record);
  created.push(sourceId);
 }
 return {count:created.length,created,skipped};
}
function completeVisit(db,u,p){
 check(active(u)&&u.role==='country_director','forbidden');
 const r=db.one('v11_records',clean(p.id));
 check(r&&r.kind==='visits'&&r.ownerId===u.id,'missing',404);
 check(r._v===Number(p.version),'conflict',409);
 check(['draft','revision_requested','missed','rescheduled'].includes(r.status),'invalidTransition',409);
 const actual=clean(p.actualDate,20),observations=clean(p.observations,3000);
 check(/^\d{4}-\d{2}-\d{2}$/.test(actual)&&!Number.isNaN(Date.parse(actual))&&!!observations,'visitEvidenceRequired',400);
 const next={...r,status:'completed',updatedAt:at(),_v:ver(r)+1,
 data:{...r.data,actualDate:actual,observations},history:[...r.history,{at:at(),by:u.id,action:'completed'}]};
 db.put('v11_records',next);audit(db,u,'v11.visit.completed',next);return {id:next.id};
}
// File recipients are managed only by Directors, and never through frontend-only flags.
function filePermissions(db,u,p){
 check(active(u)&&isDirector(u),'forbidden');
 const f=db.one('v11_files',clean(p?.id,100));check(f&&f.status!=='removed','missing',404);
 check(Array.isArray(p?.allowedUserIds)&&p.allowedUserIds.length<=100,'invalidRecipients',400);
 const ids=[...new Set(p.allowedUserIds.map(id=>clean(id,100)))];
 check(ids.every(id=>db.one('users',id)&&active(db.one('users',id))),'invalidRecipients',400);
 const next={...f,allowedUserIds:ids,updatedAt:at()};
 db.put('v11_files',next);audit(db,u,'v11.file.permissions',next);
 return {id:f.id,count:ids.length};
}
export function v11Command(db,u,action,p){
 if(action==='v11.filePermissions')return filePermissions(db,u,p);
 if(action==='v11.importSourceDocs')return importSourceDocs(db,u,p);
 if(action==='v11.importDirectorPlan')return importDirectorPlan(db,u,p);
 if(action==='v11.completeVisit')return completeVisit(db,u,p);
 if(action==='v11.save')return save(db,u,p);
 if(action==='v11.transition')return updateState(db,u,p);
 if(action==='v11.remove')return remove(db,u,p);
 fail('unknown',404);
}
export function v11State(db,u){
 const scopeType=isDirector(u)?'organization':centerMember(u)?'center':hqLeader(u)?'hq':'personal';
 const scopeId=scopeType==='center'?u.center:scopeType==='hq'?u.department:scopeType==='personal'?u.id:'org';
 const allowedKinds=isDirector(u)?V11_KINDS_LIST.filter(k=>!V11_KINDS[k].personalOnly||u.role==='country_director'):V11_KINDS_LIST.filter(k=>canCreate(u,k,scopeType,scopeId));
 return {v11:{records:db.all('v11_records').filter(r=>canRead(u,r)),
  capabilities:{director:isDirector(u),oversight:isDirector(u),canApprove:granted(u,'v11:approve'),canPublish:granted(u,'v11:publish'),canEditManual:granted(u,'v11:edit_manual'),allowedKinds,canUploadFile:scopeType!=='personal'||(u.adminPermissions||[]).includes('v11:upload_file'),defaultScopeType:scopeType,defaultScopeId:scopeId,hqReports:isDirectorRole(u)||hqLeader(u)},
  files:db.all('v11_files').filter(f=>canReadFile(u,f)).map(f=>({id:f.id,name:f.name,type:f.type,size:f.size,scopeType:f.scopeType,scopeId:f.scopeId,ownerId:f.ownerId,status:f.status,createdAt:f.createdAt,...(isDirector(u)?{allowedUserIds:f.allowedUserIds||[]}:{} )}))}};
}
export function canReadFile(u,f){
 if(!active(u)||f.status==='removed')return false;
 if(isDirector(u))return true;
 if(f.ownerId===u.id)return true;
 if(f.status!=='approved')return false;
 if((f.allowedUserIds||[]).includes(u.id))return true;
 if(f.scopeType==='personal')return false;
 if(f.scopeType==='center')return centerMember(u)&&sameUnit(u.center,f.scopeId)&&
   (f.ownerId===u.id||(u.role==='center_leader'&&f.status==='approved'));
 if(f.scopeType==='hq')return hqLeader(u)&&sameUnit(u.department,f.scopeId);
 return false;
}
export function canUploadFile(u,scopeType,scopeId){
 if(!active(u)||!validScope(scopeType))return false;
 if(scopeType==='personal')return scopeId===u.id&&(isDirector(u)||(u.adminPermissions||[]).includes('v11:upload_file'));
 if(isDirector(u))return true;
 if(scopeType==='center')return centerMember(u)&&sameUnit(u.center,scopeId);
 if(scopeType==='hq')return hqLeader(u)&&sameUnit(u.department,scopeId);
 if(scopeType==='organization')return (u.adminPermissions||[]).includes('v11:upload_file');
 return false;
}
export function approveFile(db,u,id,decision){
 check(isDirector(u)||granted(u,'v11:approve'),'forbidden');
 const f=db.one('v11_files',clean(id));check(f,'missing',404);check(['approved','rejected','removed'].includes(decision),'invalidTransition',400);
 if(!isDirector(u))check(canReadFile(u,f)&&f.ownerId!==u.id,'forbidden');
 const next={...f,status:decision,updatedAt:at(),reviewerId:u.id};db.put('v11_files',next);audit(db,u,'v11.file.'+decision,next);return {id:next.id};
}
