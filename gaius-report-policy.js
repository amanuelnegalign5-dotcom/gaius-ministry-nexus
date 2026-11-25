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

// Meeting participation and center reporting are role boundaries, not admin grants.
export const centerLeadershipRoles=Object.freeze(['center_leader','potential_center_leader','center_department_leader','potential_department_leader']);
export const isCenterRole=u=>centerLeadershipRoles.includes(u?.role)||u?.role==='volunteer';
export const isCenterReportingMember=u=>!!u&&(u.accountStatus||'active')==='active'&&isCenterRole(u)&&!!normalizeUnit(u.center);
export const isCenterMeetingParticipant=u=>isCenterReportingMember(u)&&centerLeadershipRoles.includes(u.role);
export const sameCenter=(a,b)=>!!normalizeUnit(a)&&normalizeUnit(a)===normalizeUnit(b);
const mondayStaffRoles=new Set([...Object.keys(hqDepartmentAliases),'event_leader','international_staff','assisting_staff','prayer_staff','hq_staff','staff']);
export const isMondayParticipant=u=>!!u&&(u.accountStatus||'active')==='active'&&(isDirectorRole(u)||(!normalizeUnit(u.center)&&mondayStaffRoles.has(u.role)));
export const isMondayManager=u=>isMondayParticipant(u)&&(isDirectorRole(u)||u.fullAdmin===true||['admin_finance','monday_leader'].includes(u.role)||(u.adminPermissions||[]).includes('attendance'));
export const isCenterAttendanceManager=u=>isDirectorRole(u)||(isCenterMeetingParticipant(u)&&u.role==='center_leader');
export const isMeetingDate=(date,day)=>{if(!/^\d{4}-\d{2}-\d{2}$/.test(date))return false;const d=new Date(date+'T12:00:00Z');return !Number.isNaN(+d)&&d.toISOString().slice(0,10)===date&&(day===undefined||d.getUTCDay()===day);};
