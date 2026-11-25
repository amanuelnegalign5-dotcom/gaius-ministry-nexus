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

// Authorization classification shared by the UI, legacy endpoints and governance.
export const HQ_LEADER_ROLES=Object.freeze([...Object.keys(hqDepartmentAliases),'event_leader']);
export const GENERAL_STAFF_ROLES=Object.freeze(['staff','hq_staff','international_staff','assisting_staff','prayer_staff']);
export const CENTER_ROLE_NAMES=Object.freeze(['center_senior_leader','center_leader','center_department_leader','potential_center_leader','potential_department_leader','volunteer']);
export const isCenterAccount=u=>!!u&&(CENTER_ROLE_NAMES.includes(u.role)||!!String(u.center||'').trim()&&!isDirectorRole(u));
export function roleClass(u){
 if(!u)return 'none';
 if(isDirectorRole(u))return 'director';
 if(isCenterAccount(u))return 'center';
 if(HQ_LEADER_ROLES.includes(u.role))return 'hq_leader';
 if(GENERAL_STAFF_ROLES.includes(u.role))return 'staff';
 return 'none';
}
export const eligibleDelegate=u=>!!u?.id&&(u.accountStatus||'active')==='active'&&!u.onboarding&&['hq_leader','staff'].includes(roleClass(u));
const hqLegacy=['reports','review_reports','review_plans','comments','attendance','announcements','projects','documents','manage_users','v11:oversight','v11:approve','v11:publish','v11:teaching','v11:edit_manual','v11:upload_file'];
const staffLegacy=['attendance','announcements','projects','documents','v11:publish','v11:teaching','v11:upload_file'];
export function classifiedPermissions(u){
 const c=roleClass(u);
 return c==='hq_leader'?hqLegacy.slice():c==='staff'?staffLegacy.slice():[];
}
export const legacyPermission=(u,p)=>classifiedPermissions(u).includes(p)&&(u.adminPermissions||[]).includes(p);
const governanceModules=['center_registry','member_registry','community_projects','document_committee','mentorship','department_plan_tracking','director_visits','center_attendance','hq_plans','hq_reports','center_plans','center_reports','department_catalog','succession','advisory_board','documents','teaching','administration','media'];
export function classifiedGrantOptions(u){
 if(!eligibleDelegate(u))return {modules:[],actions:[]};
 // HQ leaders may receive review/approval authority. Other staff receive operational grants, not approval.
 return roleClass(u)==='hq_leader'?{modules:governanceModules.slice(),actions:['view','create','edit','approve']}:{modules:governanceModules.filter(m=>!['member_registry','mentorship','succession','advisory_board','director_visits'].includes(m)),actions:['view','create','edit']};
}
export function classifiedGrant(u,modules,actions){
 const allowed=classifiedGrantOptions(u);
 return Array.isArray(modules)&&modules.length>0&&modules.every(m=>allowed.modules.includes(m))&&Array.isArray(actions)&&actions.length>0&&actions.every(a=>allowed.actions.includes(a));
}
export function centerAttendanceWeek(date){
 if(typeof date!=='string'||!/^\\d{4}-\\d{2}-\\d{2}$/.test(date))return null;
 const d=new Date(date+'T00:00:00Z');if(!Number.isFinite(+d)||d.toISOString().slice(0,10)!==date)return null;
 const day=d.getUTCDay();d.setUTCDate(d.getUTCDate()-day);return {day,week:d.toISOString().slice(0,10)};
}
export const attendanceCategory=p=>p==='sunday'?'sunday':['weekly','other_center_meeting','biweekly','special'].includes(p)?'weekly':null;
export function validCenterAttendance(date,program){
 const w=centerAttendanceWeek(date),p=attendanceCategory(program);
 return !!w&&(p==='sunday'?w.day===0:p==='weekly'&&w.day>=2);
}
export function sameAttendanceWeek(a,b){
 const w1=centerAttendanceWeek(a.date),w2=centerAttendanceWeek(b.date);
 return !!w1&&!!w2&&w1.week===w2.week&&attendanceCategory(a.program)===attendanceCategory(b.program)&&a.participantId===b.participantId;
}
