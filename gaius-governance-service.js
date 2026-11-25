import {grantContext} from './gaius-grant-bridge.js';
import {eligibleDelegate,roleClass,classifiedGrantOptions,classifiedGrant,validCenterAttendance,sameAttendanceWeek,centerRosterManager,centerLijochManager,centerMentorshipManager} from './gaius-report-policy.js';
// Server-only governance extension. Never store real profiles in public source.
export const GOVERNANCE_CATALOG={
  "projects": [
    {
      "name": "Bateal",
      "purpose": "Equip women",
      "status": "active"
    },
    {
      "name": "Man Enough",
      "purpose": "Equip men",
      "status": "active"
    },
    {
      "name": "Addicted Project",
      "purpose": "Support people affected by addiction",
      "status": "active"
    },
    {
      "name": "Bible Study Boot Camp",
      "purpose": "Bible study and discipleship training",
      "status": "active"
    },
    {
      "name": "Parenting Project",
      "purpose": "Parenting education and support",
      "status": "planned"
    },
    {
      "name": "After School Project",
      "purpose": "After-school education and development",
      "status": "planned"
    }
  ],
  "internationalCenters": [
    {
      "name": "Ghana",
      "country": "GH",
      "status": "active"
    },
    {
      "name": "Brazil",
      "country": "BR",
      "status": "active"
    },
    {
      "name": "Burkina Faso",
      "country": "BF",
      "status": "active"
    }
  ],
  "levels": [
    {
      "id": 1,
      "am": "ግልገል",
      "en": "Lamb"
    },
    {
      "id": 2,
      "am": "ጠቦት",
      "en": "Young sheep"
    },
    {
      "id": 3,
      "am": "በግ",
      "en": "Sheep"
    }
  ]
};
export function governanceService(db,u,action,p,now,idFactory,catalog,media=null){
 const fail=(msg,status=403)=>{throw Object.assign(new Error(msg),{status});};
 const check=(ok,msg='forbidden',status=403)=>{if(!ok)fail(msg,status);};
 const str=(v,n=200)=>typeof v==='string'?v.trim().slice(0,n):'';
 const live=x=>!!x?.id&&(x.accountStatus||'active')==='active'&&!x.onboarding;
 const director=x=>live(x)&&['country_director','international_director'].includes(x.role);
 const hq=eligibleDelegate;
 const senior=x=>live(x)&&x.role==='center_senior_leader';
 const leaders=['center_senior_leader','center_leader','center_department_leader'];
 const potential=['potential_center_leader','potential_department_leader'];
 const centerRole=x=>live(x)&&[...leaders,...potential,'volunteer'].includes(x.role);
 const validRegion=r=>['country','international'].includes(r);
 const region=x=>x.role==='country_director'?'country':x.role==='international_director'?'international':'';
 const kindMap={center:'center_registry',child:'member_registry',project:'community_projects',committee:'document_committee',mentee:'mentorship',progress:'department_plan_tracking',meeting:'director_visits',attendance:'center_attendance'};
 const kinds=Object.keys(kindMap);
 const actTypes=['view','create','edit','approve','archive','export'];
 const modules=[...Object.values(kindMap),'hq_plans','hq_reports','center_plans','center_reports','monday_program','monday_attendance','department_catalog','succession','advisory_board','documents','alumni','annual_events','fundraising','finance','partnerships','evaluation','media','administration','user_management','analytics','teaching'];
 const all=()=>db.all('governance_records');
 const ctx=grantContext(db,u,now);
 const centers=()=>ctx.centers;
 const resolveCenter=x=>ctx.resolve(x?.center)||undefined;
 const date=v=>typeof v==='string'&&/^\d{4}-\d{2}-\d{2}$/.test(v)&&Number.isFinite(Date.parse(v))&&new Date(v+'T00:00:00Z').toISOString().slice(0,10)===v;
 const stamp=v=>typeof v==='string'&&/^\d{4}-\d\d-\d\dT\d\d:\d\d:\d\d(?:\.\d+)?Z$/.test(v)&&Number.isFinite(Date.parse(v));
 const grant=(module,op,r)=>ctx.allows(module,op,{centerId:r.kind==='center'?r.id:r.centerId,region:r.region,scopeType:r.kind==='center'||r.centerId?'center':'organization'});
 const belongs=r=>{const c=resolveCenter(u);return !!c&&(r.centerId===c.id||r.kind==='center'&&r.id===c.id);};
 const canView=r=>director(u)||grant(kindMap[r.kind],'view',r)||grant(kindMap[r.kind],'edit',r)||r.ownerId===u.id&&grant(kindMap[r.kind],'create',r)||(centerRole(u)&&belongs(r)&&((['center','progress'].includes(r.kind)||r.kind==='attendance'&&(centerRosterManager(u)||r.participantId===u.id))||r.kind==='child'&&(centerLijochManager(u)||centerMentorshipManager(u)||r.mentorId===u.id)||r.kind==='mentee'&&(centerMentorshipManager(u)||r.mentorId===u.id)));
 const canWrite=(r,op)=>director(u)&&region(u)===r.region||grant(kindMap[r.kind],op,r)||(centerRole(u)&&belongs(r)&&(r.kind==='child'&&centerLijochManager(u)||r.kind==='mentee'&&centerMentorshipManager(u)||r.kind==='progress'&&leaders.includes(u.role)&&r.ownerId===u.id||r.kind==='attendance'&&centerRosterManager(u)));
 const canPhoto=r=>director(u)||centerRole(u)&&belongs(r)&&(centerLijochManager(u)||r.mentorId===u.id);
 const audit=(event,target)=>db.put('audit',{id:idFactory(),actorId:u.id,action:event,target,at:new Date(now).toISOString()});
 const safeRecord=r=>{const {photoId,...rest}=r;return {...rest,hasPhoto:!!photoId,actions:{edit:canWrite(r,'edit'),photo:canPhoto(r),setPhoto:canPhoto(r)&&canWrite(r,'edit')}};};
 check(live(u));
 if(action==='governance.list'){
  const records=all().filter(canView).map(safeRecord);
  const targets=kind=>[...(kind==='center'?[]:centers().map(c=>({region:c.region,centerId:c.id,name:[c.direction,c.name].filter(Boolean).join(' — ')}))),...['center','project','committee','meeting','progress'].includes(kind)?['country','international'].map(region=>({region,centerId:''})):[]];
  const createTargets=Object.fromEntries(kinds.map(kind=>[kind,targets(kind).filter(t=>canWrite({kind,region:t.region,centerId:t.centerId,id:'',ownerId:u.id},'create'))]));
  const viewKinds=kinds.filter(k=>ctx.grants.some(g=>g.modules.includes(kindMap[k])&&g.actions.some(a=>['view','edit','create'].includes(a))));
  return {me:{id:u.id,role:u.role,department:u.department,center:u.center},records,grants:db.all('governance_grants').filter(g=>director(u)||hq(u)&&g.recipientId===u.id&&classifiedGrant(u,g.modules,g.actions)).map(g=>({...g,effectiveStatus:g.status==='revoked'?'revoked':!classifiedGrant(db.one('users',g.recipientId),g.modules,g.actions)||!director(db.one('users',g.issuerId))?'ineligible':g.endsAt&&Date.parse(g.endsAt)<=now?'expired':g.startsAt&&Date.parse(g.startsAt)>now?'scheduled':'active'})),catalog:director(u)?catalog:null,capabilities:{createTargets,visibleKinds:[...new Set([...records.map(r=>r.kind),...kinds.filter(k=>createTargets[k].length),...viewKinds,...(centerRole(u)&&ctx.own?['center','child','mentee','progress','attendance']:[])])],director:director(u),region:region(u),senior:senior(u),centerId:resolveCenter(u)?.id||'',centerRole:centerRole(u),hq:hq(u),canManageChildren:centerLijochManager(u)||director(u),canManageAttendance:centerRosterManager(u)||director(u),canManageMentorship:centerMentorshipManager(u)||director(u),canMentor:leaders.includes(u.role)},participants:db.all('users').filter(x=>live(x)&&[...leaders,...potential].includes(x.role)&&(director(u)||!!resolveCenter(u)&&resolveCenter(x)?.id===resolveCenter(u)?.id)).map(x=>({id:x.id,name:x.name,centerId:resolveCenter(x)?.id||''})),eligibleHQ:director(u)?db.all('users').filter(hq).map(x=>({id:x.id,name:x.name,role:x.role,classification:roleClass(x),centerId:roleClass(x)==='center'?(resolveCenter(x)?.id||''):'',...classifiedGrantOptions(x)})):[],mentors:db.all('users').filter(x=>live(x)&&leaders.includes(x.role)&&(director(u)||resolveCenter(x)?.id===resolveCenter(u)?.id&&!!resolveCenter(u))).map(x=>({id:x.id,name:x.name,centerId:resolveCenter(x)?.id||''}))};
 }
 if(action==='governance.grant'){
  check(director(u));const recipient=db.one('users',str(p.recipientId));check(hq(recipient),'recipientInvalid',400);
  const type=str(p.type),scope=str(p.scope),startsAt=p.startsAt||null,endsAt=p.endsAt||null;
  check(['permission','delegation'].includes(type)&&(['organization','country','international'].includes(scope)||centers().some(c=>c.id===scope)),'scopeInvalid',400);
  check(classifiedGrant(recipient,p.modules,p.actions),'permissionsInvalid',400);
  if(roleClass(recipient)==='center')check(!!resolveCenter(recipient)&&scope===resolveCenter(recipient).id,'scopeInvalid',400);
  check((!startsAt||stamp(startsAt))&&(!endsAt||stamp(endsAt))&&(!startsAt||!endsAt||Date.parse(endsAt)>Date.parse(startsAt))&&(!endsAt||Date.parse(endsAt)>now),'dateInvalid',400);
  check(type!=='delegation'||startsAt&&endsAt&&str(p.purpose,1000)&&str(p.reference),'delegationTimeRequired',400);
  const g={id:idFactory(),issuerId:u.id,recipientId:recipient.id,type,scope,modules:[...new Set(p.modules)],actions:[...new Set(p.actions)],startsAt,endsAt,purpose:str(p.purpose,1000),reference:str(p.reference),status:'active',createdAt:new Date(now).toISOString()};
  db.put('governance_grants',g);audit(action,g.id);return {id:g.id};
 }
 if(action==='governance.revoke'){
  check(director(u));const g=db.one('governance_grants',str(p.id));check(g,'missing',404);db.put('governance_grants',{...g,status:'revoked',revokedAt:new Date(now).toISOString(),revokedBy:u.id});audit(action,g.id);return {};
 }
 if(action==='governance.photo'){
  const r=db.one('governance_records',str(p.id));check(r?.kind==='child'&&canPhoto(r),'forbidden');check(r.photoId,'missing',404);const ph=db.one('governance_photos',r.photoId);check(ph,'missing',404);audit(action,r.id);return ph.storageKey?{storageKey:ph.storageKey}:{data:ph.data};
 }
 if(action==='governance.setPhoto'){
  const r=db.one('governance_records',str(p.id));check(r?.kind==='child'&&canWrite(r,'edit')&&canPhoto(r),'forbidden');
  const previous=r.photoId?db.one('governance_photos',r.photoId):null;
  if(media?.expectedVersion!==undefined)check(media.expectedVersion===r.version,'conflict',409);
  if(p.remove===true){
    if(media?.prepare)return {version:r.version,previousKey:previous?.storageKey||null};
    if(r.photoId)db.drop('governance_photos',r.photoId);
    db.put('governance_records',{...r,photoId:null,version:r.version+1});audit(action,r.id);
    return {previousKey:previous?.storageKey||null};
  }
  check(p.consent===true&&p.ageConsentConfirmed===true,'photoConsentRequired',400);
  const v=typeof p.data==='string'?p.data:'';check(v.length<=420000&&/^data:image\/(?:jpeg|png|webp);base64,[A-Za-z0-9+/]+={0,2}$/.test(v),'photoInvalid',400);
  // Decode magic bytes; never accept SVG or executable formats.
  const [head,b64]=v.split(',');let raw;try{raw=atob(b64.slice(0,32));}catch{fail('photoInvalid',400);}
  check(head.includes('jpeg')?raw.charCodeAt(0)===255&&raw.charCodeAt(1)===216&&raw.charCodeAt(2)===255:head.includes('png')?raw.startsWith('\x89PNG\r\n\x1a\n'):raw.startsWith('RIFF')&&raw.slice(8,12)==='WEBP','photoInvalid',400);
  if(media?.prepare)return {version:r.version,previousKey:previous?.storageKey||null};
  const photoId=r.photoId||idFactory();
  db.put('governance_photos',{id:photoId,...(media?.storageKey?{storageKey:media.storageKey}:{data:v}),consentAt:new Date(now).toISOString(),by:u.id});
  db.put('governance_records',{...r,photoId,version:r.version+1});audit(action,r.id);
  return {previousKey:previous?.storageKey||null};
 }
 if(action!=='governance.save')fail('unknown',404);
 const kind=str(p.kind);check(kinds.includes(kind),'kindInvalid',400);
 const old=p.id?db.one('governance_records',str(p.id)):null;check(!p.id||old?.kind===kind,'missing',404);
 if(old)check(old.version===p.version,'conflict',409);
 const centerId=old?.centerId||str(p.centerId);
 const c=centers().find(x=>x.id===centerId);
 const reg=old?.region||(kind==='center'?str(p.region):c?.region||str(p.region)||region(u));
 check(validRegion(reg),'regionInvalid',400);
 const row={id:old?.id||idFactory(),kind,region:reg,centerId:kind==='center'?'':centerId,ownerId:old?.ownerId||u.id,version:(old?.version||0)+1,updatedAt:new Date(now).toISOString(),createdAt:old?.createdAt||new Date(now).toISOString(),name:str(p.name),status:str(p.status)||'active'};
 check(canWrite({...row,mentorId:old?.mentorId||str(p.mentorId)},old?'edit':'create'));
 if(old)check(canView(old)||canWrite(old,'edit'));
 if(['child','mentee','attendance'].includes(kind)||centerId)check(c&&c.region===reg,'centerInvalid',400);
 check(row.name,'nameRequired',400);
 if(kind==='center'){
  row.country=str(p.country,2).toUpperCase();row.city=str(p.city);row.direction=str(p.direction);row.level=str(p.level);
  check(/^[A-Z]{2}$/.test(row.country)&&((reg==='country')===(row.country==='ET')),'countryInvalid',400);
  check(['','A','B','C'].includes(row.level)&&['active','planned','forming','inactive','archived'].includes(row.status),'levelInvalid',400);
  row.levelHistory=[...(old?.levelHistory||[]),...((old?.level||'')!==row.level?[{from:old?.level||'',to:row.level,at:row.updatedAt,by:u.id,reason:str(p.levelReason)}]:[])];
  if(old&&old.level!==row.level)check(str(p.levelReason),'levelReasonRequired',400);
 }else if(kind==='child'){
  row.level=Number(p.level||0);row.joinedOn=str(p.joinedOn);row.leftOn=str(p.leftOn);row.lastVisit=str(p.lastVisit);row.firstVisit=str(p.firstVisit);row.exitReason=str(p.exitReason,1000);row.mentorId=str(p.mentorId);row.batch=str(p.batch);row.church=str(p.church);row.talents=str(p.talents,1000);row.photoId=old?.photoId||null;
  check([0,1,2,3].includes(row.level)&&['guest','potential','active','intern','volunteer','alumni','exited','transferred'].includes(row.status),'statusInvalid',400);
  for(const d of [row.joinedOn,row.leftOn,row.firstVisit,row.lastVisit])check(!d||date(d),'dateInvalid',400);
  check(!row.leftOn||row.joinedOn&&row.leftOn>=row.joinedOn,'dateInvalid',400);
  check(!['exited','alumni','transferred'].includes(row.status)||row.leftOn&&row.exitReason,'exitDetailsRequired',400);
  if(row.mentorId){const m=db.one('users',row.mentorId);check(live(m)&&leaders.includes(m.role)&&resolveCenter(m)?.id===centerId,'mentorInvalid',400);}
 }else if(kind==='mentee'){
  row.mentorId=str(p.mentorId);row.childId=str(p.childId);const child=db.one('governance_records',row.childId),m=db.one('users',row.mentorId);
  check(child?.kind==='child'&&child.centerId===centerId&&live(m)&&leaders.includes(m.role)&&resolveCenter(m)?.id===centerId,'mentorInvalid',400);
  check(['active','completed','transferred','inactive'].includes(row.status),'statusInvalid',400);
  check(!all().some(x=>x.kind==='mentee'&&x.id!==row.id&&x.childId===row.childId&&x.status==='active'&&row.status==='active'),'duplicateMentee',409);
  row.name=child.name;check(child.mentorId===row.mentorId,'mentorAssignmentRequired',400);row.goal=str(p.goal,2000);row.challenges=str(p.challenges,2000);row.nextAction=str(p.nextAction,2000);
 }else if(kind==='attendance'){
  row.participantId=str(p.participantId);row.date=str(p.date);row.program=str(p.program);
  const participant=db.one('users',row.participantId);
  check(live(participant)&&[...leaders,...potential].includes(participant.role)&&resolveCenter(participant)?.id===centerId&&date(row.date)&&['sunday','other_center_meeting'].includes(row.program)&&['present','absent','late','excused'].includes(row.status),'attendanceInvalid',400);
  check(validCenterAttendance(row.date,row.program),row.program==='sunday'?'sundayRequired':'weeklyMeetingDayInvalid',400);
  check(!all().some(x=>x.kind==='attendance'&&x.id!==row.id&&x.centerId===centerId&&sameAttendanceWeek(x,row)),'attendanceExists',409);
  check(!db.all('v11_records').some(x=>x.kind==='centerAttendance'&&x.status!=='archived'&&x.scopeType==='center'&&[c.id,c.name,[c.direction,c.name].filter(Boolean).join(' — ')].includes(x.scopeId)&&sameAttendanceWeek({date:x.data?.date,program:x.data?.eventType,participantId:x.data?.participantId},row)),'attendanceExists',409);
  row.name=participant.name;
 }else{
  row.purpose=str(p.purpose,4000);row.lead=str(p.lead);row.start=str(p.start);row.end=str(p.end);row.challenges=str(p.challenges,4000);row.nextAction=str(p.nextAction,4000);row.outcome=str(p.outcome,4000);row.department=str(p.department);row.planId=str(p.planId);row.meetingType=str(p.meetingType);row.frequency=str(p.frequency);row.budget=str(p.budget,80);row.members=str(p.members,4000);row.deliverables=str(p.deliverables,4000);row.quantitative=str(p.quantitative,2000);row.qualitative=str(p.qualitative,4000);
  check(['planned','active','completed','paused','archived','draft','submitted','approved'].includes(row.status),'statusInvalid',400);
  check(!row.start||date(row.start),'dateInvalid',400);check(!row.end||date(row.end)&&(!row.start||row.end>=row.start),'dateInvalid',400);
  if(kind==='progress'){check(row.planId&&row.department&&row.outcome&&row.challenges&&row.nextAction,'progressDetailsRequired',400);if(!director(u)&&!grant('department_plan_tracking','approve',row))check(!['approved','archived'].includes(row.status),'approvalRequiresAuthority');if(centerRole(u))check(row.department===u.department,'departmentScopeMismatch');}
 }
 db.put('governance_records',row);audit(action,row.id);return {id:row.id};
}
