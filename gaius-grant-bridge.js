// Server-side bridge: explicit new operational grants on pre-existing v11 records.
// Personal records and director identity are never inherited by a delegate.
const directors=['country_director','international_director'];
const hqRoles=['admin_finance','followup_leader','service_leader','counseling_leader','support_leader','establishment_leader','media_leader','research_leader','monday_leader','event_leader'];
const active=u=>!!u?.id&&(u.accountStatus||'active')==='active'&&!u.onboarding;
const kindModule={centers:'center_registry',centerUnits:'department_catalog',followups:'department_plan_tracking',centerAttendance:'center_attendance',succession:'succession',mentorship:'mentorship',teaching:'teaching',manuals:'documents',documents:'documents',board:'advisory_board',advisoryMeetings:'advisory_board',committees:'document_committee',initiatives:'community_projects',tasks:'administration',updates:'media'};
function resolveCenter(db,key){
 const rows=db.all('governance_records').filter(r=>r.kind==='center'&&r.status!=='archived');
 const direct=rows.find(r=>r.id===key);if(direct)return direct;
 const matches=rows.filter(r=>r.name===key||[r.direction,r.name].filter(Boolean).join(' — ')===key);
 return matches.length===1?matches[0]:null;
}
export function v11Grant(db,u,record,action,now=Date.now()){
 if(!db||!active(u)||u.center||!hqRoles.includes(u.role)||!record||record.scopeType==='personal'||!['view','approve'].includes(action)||!Number.isFinite(now))return false;
 if(!['submitted','approved'].includes(record.status))return false;
 const module=record.kind==='monthly'?(record.scopeType==='center'?'center_reports':'hq_reports'):record.kind==='plans6'?(record.scopeType==='center'?'center_plans':'hq_plans'):kindModule[record.kind];
 if(!module)return false;
 const center=record.scopeType==='center'?resolveCenter(db,record.scopeId):null;
 return db.all('governance_grants').some(g=>{
  const issuer=db.one('users',g.issuerId);
  if(g.recipientId!==u.id||g.status!=='active'||g.revokedAt||!active(issuer)||!directors.includes(issuer.role)||!['permission','delegation'].includes(g.type)||!g.modules?.includes(module)||!g.actions?.includes(action))return false;
  if(g.type==='delegation'&&(!g.startsAt||!g.endsAt))return false;
  if(g.startsAt&&!(Date.parse(g.startsAt)<=now))return false;
  if(g.endsAt&&!(now<Date.parse(g.endsAt)))return false;
  return g.scope==='organization'||!!center&&(g.scope===center.id||g.scope===center.region);
 });
}
