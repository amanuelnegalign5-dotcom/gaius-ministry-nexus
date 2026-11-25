// Proposed governance foundation. Not yet connected to production authorization.
// Store grants server-side; never trust a grant or timestamp supplied by a client.
export const DIRECTORS = Object.freeze(['country_director','international_director']);
export const HQ_LEADERS = Object.freeze(['admin_finance','followup_leader','service_leader','counseling_leader','support_leader','establishment_leader','media_leader','research_leader','monday_leader','event_leader']);
export const CENTER_LEADERS = Object.freeze(['center_senior_leader','center_leader','center_department_leader']);
export const CENTER_POTENTIAL = Object.freeze(['potential_center_leader','potential_department_leader']);
export const CENTER_ROLES = Object.freeze([...CENTER_LEADERS,...CENTER_POTENTIAL,'volunteer']);
export const STAFF_ROLES = Object.freeze([...HQ_LEADERS,'staff','hq_staff','international_staff','assisting_staff','prayer_staff']);
export const MODULES = Object.freeze(['hq_plans','hq_reports','center_plans','center_reports','monday_program','monday_attendance','center_attendance','center_registry','member_registry','mentorship','succession','department_catalog','department_plan_tracking','director_visits','advisory_board','document_committee','documents','alumni','annual_events','fundraising','finance','partnerships','community_projects','evaluation','media','administration','user_management','analytics','teaching']);
export const ACTIONS = Object.freeze(['view','create','edit','review','approve','archive','export']);
export const CENTER_LEVELS = Object.freeze(['A','B','C']);
export const MEMBER_LEVELS = Object.freeze([1,2,3]);
export const MEMBER_STATUS = Object.freeze(['guest','potential_member','active','intern','volunteer','alumni','exited','transferred']);
const active = u => !!u?.id && u.accountStatus === 'active' && !u.onboarding;
const director = u => active(u) && DIRECTORS.includes(u.role);
const instant = v => typeof v==='string' && /^\d{4}-\d\d-\d\dT\d\d:\d\d:\d\d(?:\.\d{1,3})?(?:Z|[+-]\d\d:\d\d)$/.test(v) && Number.isFinite(Date.parse(v)) ? Date.parse(v) : NaN;
const unique = a => Array.isArray(a) && a.length>0 && new Set(a).size===a.length;
const key = s => typeof s==='string' && s.trim().length>0 && s.length<=200;
const scopeValid = s => !!s && (s.type==='organization' && s.id==='org' || ['hq','center','department'].includes(s.type) && key(s.id));
const scopeMatches = (g,r) => scopeValid(g)&&scopeValid(r)&&(g.type==='organization'||g.type===r.type&&g.id===r.id);
// Directors alone may create or revoke these grants; an acting director never inherits grant management.
export function validateGrant(issuer,recipient,grant) {
 if(!director(issuer)||!active(recipient)||!HQ_LEADERS.includes(recipient.role)||issuer.id===recipient.id) return false;
 if(!grant||grant.issuerId!==issuer.id||grant.recipientId!==recipient.id||!['permission','delegation'].includes(grant.type)) return false;
 if(!unique(grant.modules)||!grant.modules.every(m=>MODULES.includes(m))||!unique(grant.actions)||!grant.actions.every(a=>ACTIONS.includes(a))||!scopeValid(grant.scope)) return false;
 if(grant.type==='delegation'&&(!key(grant.purpose)||!key(grant.reference)||!Number.isFinite(instant(grant.startsAt))||!Number.isFinite(instant(grant.endsAt)))) return false;
 if(grant.startsAt!=null&&!Number.isFinite(instant(grant.startsAt))) return false;
 if(grant.endsAt!=null&&!Number.isFinite(instant(grant.endsAt))) return false;
 if(grant.startsAt!=null&&grant.endsAt!=null&&instant(grant.endsAt)<=instant(grant.startsAt)) return false;
 return true;
}
export function grantIsEffective(grant,issuer,recipient,nowMs) {
 if(!Number.isFinite(nowMs)||!validateGrant(issuer,recipient,grant)||grant.status!=='active'||grant.revokedAt) return false;
 return (grant.startsAt==null||nowMs>=instant(grant.startsAt))&&(grant.endsAt==null||nowMs<instant(grant.endsAt));
}
// Caller supplies server-verified issuer and recipient records, and a server-generated timestamp.
// Protected identities, secrets, private clinical records and grant administration are not modules here.
export function hasExplicitGrant(grant,issuer,recipient,request,nowMs) {
 return grantIsEffective(grant,issuer,recipient,nowMs)&&MODULES.includes(request?.module)&&ACTIONS.includes(request?.action)&&grant.modules.includes(request.module)&&grant.actions.includes(request.action)&&scopeMatches(grant.scope,request.scope);
}
export function attendanceEligible(user,program,centerId) {
 if(!active(user)) return false;
 if(program==='monday') return DIRECTORS.includes(user.role)||(!user.center&&STAFF_ROLES.includes(user.role));
 if(!['sunday','other_center_meeting'].includes(program)) return false;
 return [...CENTER_LEADERS,...CENTER_POTENTIAL].includes(user.role)&&key(centerId)&&user.center===centerId;
}
export function leadershipRequirements(role) {
 const leader=CENTER_LEADERS.includes(role);
 return {centerRequired:CENTER_ROLES.includes(role),departmentRequired:leader,mentorRequired:leader};
}
export function activeMenteeCount(rows,mentorId) {
 return new Set(rows.filter(r=>r.mentorId===mentorId&&r.status==='active'&&key(r.menteeId)).map(r=>r.menteeId)).size;
}
export function validProgressReport(r) {
 return !!r&&key(r.planItemId)&&key(r.period)&&key(r.outcome)&&typeof r.challenges==='string'&&r.challenges.trim().length>0&&typeof r.nextAction==='string'&&r.nextAction.trim().length>0;
}
export function achievementPercent(target,actual) {
 return typeof target==='number'&&typeof actual==='number'&&Number.isFinite(target)&&Number.isFinite(actual)&&target>0&&actual>=0?actual/target*100:null;
}
export const POLICY_REFERENCE=Object.freeze({membershipMonths:42,leadershipEligibilityMonths:18,leadershipTermMonths:24,centerFoundingMinimum:12,centerOrdinaryCapacity:120,centerExceptionalCapacity:200});
export const DIRECTOR_CADENCE=Object.freeze({advisoryMeeting:'monthly',addisCenterVisit:'monthly-per-center',addisLeadersMeeting:'monthly',bishoftuVisit:'every-14-days',specialStaffMeeting:'every-3-months',unityEvent:'annual',celebration:'annual',reportReview:'monthly',planReview:'six-monthly'});
