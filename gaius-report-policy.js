// Central reporting policy: nine HQ departments plus the two Director roles.
// Legacy aliases preserve existing account assignments and historical reports.
export const hqDepartmentAliases=Object.freeze({
 admin_finance:['Administration and Finance','admin-finance'],
 followup_leader:['Follow-up','Follow-up Department','followup'],
 service_leader:['Service Coordination','Coordination Department','coordination'],
 counseling_leader:['Counseling and Support','Counseling','counseling'],
 support_leader:['Support Team Department','Support','support'],
 establishment_leader:['Department of Centers Establishment','Centers Establishment','establishment'],
 media_leader:['Media','Media and Public Relation','Media & PR','media-pr'],
 research_leader:['Research and Training','research'],
 monday_leader:['Monday Staff Program','Monday Staff','monday-staff']
});
const normalizeUnit=v=>String(v??'').trim().toLowerCase();
export const isNineHQDepartment=department=>Object.values(hqDepartmentAliases).some(
 names=>names.some(n=>normalizeUnit(n)===normalizeUnit(department)));
export const isHQReporter=u=>!!u&&(u.accountStatus||'active')==='active'&&!u.center&&
 Object.prototype.hasOwnProperty.call(hqDepartmentAliases,u.role)&&
 hqDepartmentAliases[u.role].some(n=>normalizeUnit(n)===normalizeUnit(u.department));
export const isDirectorRole=u=>!!u&&(u.accountStatus||'active')==='active'&&
 ['country_director','international_director'].includes(u.role);


export const isCenterLeaderRole = role => ['senior_center_leader', 'center_leader', 'potential_center_leader', 'center_department_leader', 'potential_department_leader'].includes(role);
export const isCenterRole = role => role === 'volunteer' || isCenterLeaderRole(role);

export const isConfirmedCenterLeader = role => ['senior_center_leader','center_leader','center_department_leader'].includes(role);
export function recordsCenterAttendance(u) {
 if(u.role==='senior_center_leader')return true;
 return ['center_leader','center_department_leader'].includes(u.role) &&
  ['follow-up','c-follow','ክትትል','administration and finance','center administration and finance','c-admin','የአስተዳደር እና ፋይናንስ የአገልግሎት ክፍል','service coordination','c-coord','የአገልግሎት አስተባባሪ'].includes(normalizeUnit(u.department));
}
export function seesHQReports(u) {
 if(isDirectorRole(u))return true;
 if(!u||(u.accountStatus||'active')!=='active'||isCenterRole(u.role)||u.hqReportingView==='deny')return false;
 return u.hqReportingView==='allow'||isHQReporter(u);
}
export const hasCenterViewGrant = (u,center) => !!center && (u.centerReportViews||[]).some(name=>normalizeUnit(name)===normalizeUnit(center));
