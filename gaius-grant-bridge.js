import {eligibleGrantRecipient,classifiedGrant,roleClass,isNineHQDepartment} from './gaius-report-policy.js';
// Shared scoped grant evaluator. Each evaluation is built from current server data,
// never from client-submitted roles or cached authorizations.
const active=u=>!!u?.id&&(u.accountStatus||'active')==='active'&&!u.onboarding;
const directors=['country_director','international_director'];
const kindModule={centers:'center_registry',centerUnits:'department_catalog',followups:'department_plan_tracking',centerAttendance:'center_attendance',succession:'succession',mentorship:'mentorship',teaching:'teaching',manuals:'documents',documents:'documents',board:'advisory_board',advisoryMeetings:'advisory_board',committees:'document_committee',initiatives:'community_projects',tasks:'administration',updates:'media'};
export const operationModule=r=>r.kind==='monthly'?(r.scopeType==='center'?'center_reports':r.scopeType==='hq'?'hq_reports':null):r.kind==='plans6'?(r.scopeType==='center'?'center_plans':r.scopeType==='hq'?'hq_plans':null):kindModule[r.kind];
export function grantContext(db,u,now=Date.now()){
 const centers=db.all('governance_records').filter(r=>r.kind==='center'&&r.status!=='archived');
 const byId=new Map(centers.map(c=>[c.id,c])),byName=new Map();for(const c of centers)for(const key of new Set([c.name,[c.direction,c.name].filter(Boolean).join(' — ')])){if(!key)continue;byName.set(key,byName.has(key)?null:c);}
 const resolve=key=>byId.get(key)||byName.get(key)||null;
 const own=resolve(u?.center);
 const grants=eligibleGrantRecipient(u)?db.all('governance_grants').filter(g=>{
  if(g.recipientId!==u.id||!classifiedGrant(u,g.modules,g.actions)||g.status!=='active'||g.revokedAt||!['permission','delegation'].includes(g.type))return false;
  const issuer=db.one('users',g.issuerId);if(!active(issuer)||!directors.includes(issuer.role))return false;
  if(g.type==='delegation'&&(!g.startsAt||!g.endsAt))return false;
  if(g.startsAt&&!(Date.parse(g.startsAt)<=now)||g.endsAt&&!(now<Date.parse(g.endsAt)))return false;
  return roleClass(u)!=='center'||!!own&&g.scope===own.id;
 }):[];
 const allows=(module,action,{centerId='',region='',scopeType='organization'}={})=>{
  if(!module||scopeType==='personal')return false;
  if(roleClass(u)==='center'&&(!own||centerId!==own.id||scopeType==='hq'))return false;
  return grants.some(g=>g.modules.includes(module)&&g.actions.includes(action)&&(g.scope==='organization'||!!centerId&&g.scope===centerId||!!region&&g.scope===region));
 };
 const record=(r,action)=>{
  if(!r||!['center','hq','organization'].includes(r.scopeType))return false;
  if(r.scopeType==='hq'&&!isNineHQDepartment(r.scopeId)||r.scopeType==='organization'&&r.scopeId!=='org')return false;
  const c=r.scopeType==='center'?resolve(r.scopeId):null;
  if(r.scopeType==='center'&&!c)return false;
  if(action==='view'&&!['submitted','approved'].includes(r.status))return false;
  if(action==='approve'&&r.status!=='submitted')return false;
  if(action==='edit'&&!['draft','revision_requested'].includes(r.status))return false;
  return allows(operationModule(r),action,{scopeType:r.scopeType,centerId:c?.id,region:c?.region});
 };
 return {centers,resolve,own,grants,allows,record};
}
export function v11Grant(db,u,r,action,now=Date.now()){
 return !!db&&!!r&&grantContext(db,u,now).record(r,action);
}
