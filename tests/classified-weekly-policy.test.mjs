import test from 'node:test';
import assert from 'node:assert/strict';
import {governanceService,GOVERNANCE_CATALOG} from '../gaius-governance-service.js';
import {v11Command,v11State,canReadFile} from '../gaius-v11-core.js';
import {full,permit} from '../gaius-core.js';
import {classifiedPermissions,eligibleDelegate,eligibleGrantRecipient,validCenterAttendance} from '../gaius-report-policy.js';
function setup(){
 const map=new Map();const db={all:k=>map.get(k)||[],one(k,id){return this.all(k).find(r=>r.id===id)},put(k,r){map.set(k,[...this.all(k).filter(x=>x.id!==r.id),r])}};
 for(const [id,role,center] of [['d','country_director',''],['h','followup_leader',''],['f','hq_staff',''],['s','center_senior_leader','East'],['m','center_leader','East'],['p','potential_center_leader','East']])db.put('users',{id,name:id,role,center,accountStatus:'active',department:id==='h'?'Follow-up':'Worship Team'});
 let n=0;const call=(id,action,p)=>governanceService(db,db.one('users',id),action,p,Date.parse('2026-11-25T12:00:00Z'),()=>String(++n),GOVERNANCE_CATALOG);
 const east=call('d','governance.save',{kind:'center',name:'East',region:'country',country:'ET'}).id;
 return {db,call,east};
}
test('every non-Director member can receive a grant, classified by role',()=>{
 const {db,call,east}=setup();const p={type:'delegation',scope:'organization',modules:['center_reports'],actions:['view'],startsAt:'2026-11-25T00:00:00Z',endsAt:'2026-11-26T00:00:00Z',purpose:'Review',reference:'D1'};
 for(const id of ['h','f','s','m','p'])assert.equal(eligibleGrantRecipient(db.one('users',id)),true,id);
 for(const id of ['s','m','p'])assert.equal(eligibleDelegate(db.one('users',id)),false,id);
 assert.equal(eligibleDelegate(db.one('users','d')),false,'Directors grant; they are not recipients');
 assert.throws(()=>call('d','governance.grant',{...p,recipientId:'d'}),/recipientInvalid/);
 // HQ leaders and staff: unchanged organization-wide classification.
 assert.ok(call('d','governance.grant',{...p,recipientId:'f'}).id);
 assert.throws(()=>call('d','governance.grant',{...p,recipientId:'f',actions:['approve']}),/permissionsInvalid/);
 assert.ok(call('d','governance.grant',{...p,recipientId:'h',actions:['view','approve']}).id);
 // Center members: own center only, center modules only.
 const own={...p,type:'permission',scope:east};
 assert.throws(()=>call('d','governance.grant',{...p,scope:east,recipientId:'m'}),/grantTypeInvalid/);
 for(const id of ['s','m','p'])assert.ok(call('d','governance.grant',{...own,recipientId:id}).id,id);
 for(const id of ['s','m','p'])assert.throws(()=>call('d','governance.grant',{...own,scope:'organization',recipientId:id}),/scopeInvalid/,'organization scope refused for '+id);
 const west=call('d','governance.save',{kind:'center',name:'West',region:'country',country:'ET'}).id;
 assert.throws(()=>call('d','governance.grant',{...own,scope:west,recipientId:'m'}),/scopeInvalid/,'another center refused');
 for(const module of ['hq_reports','hq_plans','director_visits','succession','advisory_board'])
  assert.throws(()=>call('d','governance.grant',{...own,recipientId:'m',modules:[module]}),/permissionsInvalid/,module+' is never delegable to a center member');
 assert.ok(call('d','governance.grant',{...own,recipientId:'m',actions:['view','approve']}).id,'center leaders may receive review authority');
 assert.throws(()=>call('d','governance.grant',{...own,recipientId:'p',actions:['approve']}),/permissionsInvalid/,'potential leaders may not');
 assert.throws(()=>call('h','governance.grant',{...own,recipientId:'m'}),/forbidden/,'only Directors grant');
 const recipients=call('d','governance.list',{}).eligibleHQ;
 assert.deepEqual(recipients.map(x=>x.id).sort(),['f','h','m','p','s']);
 assert.equal(recipients.find(x=>x.id==='m').centerId,east);
 assert.ok(!recipients.find(x=>x.id==='f').actions.includes('approve'));
 assert.ok(!recipients.find(x=>x.id==='p').actions.includes('approve'));
});
test('a center member\'s grant stops working outside their own center',()=>{
 const {db,call,east}=setup();
 const child=call('d','governance.save',{kind:'child',centerId:east,name:'Synthetic youth',status:'active'}).id;
 const sees=id=>call(id,'governance.list',{}).records.some(r=>r.id===child);
 assert.equal(sees('m'),false,'a center leader has no registry access by role alone');
 call('d','governance.grant',{recipientId:'m',type:'permission',scope:east,modules:['member_registry'],actions:['view'],startsAt:'2026-11-25T00:00:00Z',endsAt:'2026-11-26T00:00:00Z',purpose:'Cover',reference:'D2'});
 assert.equal(sees('m'),true,'the delegation opens it');
 db.put('users',{...db.one('users','m'),center:'West'});
 assert.equal(sees('m'),false,'moving to another center ends it');
});
test('center-only roles cannot inherit legacy administration or HQ file/report visibility',()=>{
 const {db}=setup();const u={...db.one('users','m'),fullAdmin:true,adminPermissions:['attendance','reports','manage_users','v11:approve']};
 assert.equal(full(u),false);assert.equal(permit(u,'manage_users'),false);assert.ok(classifiedPermissions(u).length>0);assert.ok(classifiedPermissions(u).every(p=>p.startsWith('center:')));
 db.put('v11_records',{id:'hq',kind:'monthly',scopeType:'hq',scopeId:'Media',ownerId:'h',status:'approved',data:{}});
 assert.ok(!v11State(db,u).v11.records.some(r=>r.id==='hq'));
 assert.equal(canReadFile(u,{scopeType:'hq',scopeId:'Media',ownerId:'h',status:'approved',allowedUserIds:['m']}),false);
 assert.ok(v11State(db,u).v11.capabilities.readableKinds.includes('centerAttendance'));
 assert.ok(!v11State(db,u).v11.capabilities.allowedKinds.includes('centerAttendance'));
});
test('Sunday plus one non-Monday weekly meeting; cross-store duplicate protection',()=>{
 const {db,call,east}=setup();
 const save=(date,program)=>call('s','governance.save',{kind:'attendance',name:'Attendance',centerId:east,participantId:'m',date,program,status:'present'});
 assert.ok(save('2026-11-29','sunday').id);
 assert.throws(()=>save('2026-11-30','other_center_meeting'),/weeklyMeetingDayInvalid/);
 assert.ok(save('2026-12-01','other_center_meeting').id);
 assert.throws(()=>save('2026-12-03','other_center_meeting'),/attendanceExists/);
 const v11=(date,eventType)=>v11Command(db,db.one('users','s'),'v11.save',{kind:'centerAttendance',scopeType:'center',scopeId:'East',data:{date,eventType,participantId:'m',attendance:'present'}});
 assert.throws(()=>v11('2026-12-02','weekly'),/attendanceExists/);
 assert.throws(()=>v11('2026-12-07','weekly'),/weeklyMeetingDayInvalid/);
 assert.ok(v11('2026-12-06','sunday').id);
 assert.ok(v11State(db,db.one('users','m')).v11.records.some(r=>r.kind==='centerAttendance'));
 assert.equal(validCenterAttendance('2026-12-06','weekly'),false);
 assert.equal(validCenterAttendance('2026-12-08','weekly'),true);
});

test('director-assigned center permission permits own-center attendance only and is revocable',()=>{
 const {db,call,east}=setup();
 const u=db.one('users','m');
 const payload={kind:'attendance',name:'Attendance',centerId:east,participantId:'s',date:'2026-11-29',program:'sunday',status:'present'};
 assert.throws(()=>call('m','governance.save',payload),/forbidden/);
 db.put('users',{...u,adminPermissions:['center:attendance']});
 assert.ok(call('m','governance.save',payload).id);
 assert.ok(v11State(db,db.one('users','m')).v11.capabilities.allowedKinds.includes('centerAttendance'));
 const west=call('d','governance.save',{kind:'center',name:'West',region:'country',country:'ET'}).id;
 assert.throws(()=>call('m','governance.save',{...payload,centerId:west}),/forbidden/);
 db.put('users',u);
 assert.throws(()=>call('m','governance.save',{...payload,date:'2026-12-06'}),/forbidden/);
});
test('center permissions for registry and mentorship do not allow cross-center access',()=>{
 const {db,call,east}=setup();
 const u=db.one('users','m');
 const payload={kind:'child',centerId:east,name:'Synthetic youth',status:'active',mentorId:'m'};
 assert.throws(()=>call('m','governance.save',payload),/forbidden/);
 db.put('users',{...u,adminPermissions:['center:lijoch','center:mentorship']});
 const child=call('m','governance.save',payload).id;
 assert.ok(call('m','governance.save',{kind:'mentee',name:'Assignment',centerId:east,childId:child,mentorId:'m',status:'active'}).id);
 assert.ok(eligibleGrantRecipient(db.one('users','m')));assert.equal(eligibleDelegate(db.one('users','m')),false);
 const west=call('d','governance.save',{kind:'center',name:'West',region:'country',country:'ET'}).id;
 assert.throws(()=>call('m','governance.save',{...payload,centerId:west}),/forbidden/);
});
test('center review permission requests changes only, never approves or reviews another center',()=>{
 const {db}=setup();const u={...db.one('users','m'),adminPermissions:['center:review_reports']};db.put('users',u);
 for(const [id,scopeId] of [['east','East'],['west','West']])db.put('v11_records',{id,kind:'monthly',scopeType:'center',scopeId,ownerId:'s',status:'submitted',data:{},history:[],_v:1});
 assert.equal(v11State(db,u).v11.records.find(r=>r.id==='east').centerReview,true);
 assert.throws(()=>v11Command(db,u,'v11.transition',{id:'east',version:1,decision:'approve'}),/forbidden/);
 assert.throws(()=>v11Command(db,u,'v11.transition',{id:'west',version:1,decision:'revision_requested',note:'Revise'}),/forbidden/);
 v11Command(db,u,'v11.transition',{id:'east',version:1,decision:'revision_requested',note:'Revise'});
 assert.equal(db.one('v11_records','east').status,'revision_requested');
});
test('potential leaders receive limited own-center options and no management',()=>{
 const {db}=setup();const p=db.one('users','p');
 assert.deepEqual(classifiedPermissions(p),['center:submit_reports','center:submit_plans','center:upload_files']);
 assert.ok(!v11State(db,p).v11.capabilities.allowedKinds.includes('monthly'));
 const u={...p,adminPermissions:['center:submit_reports','center:upload_files']};
 assert.ok(v11State(db,u).v11.capabilities.allowedKinds.includes('monthly'));
 assert.equal(v11State(db,u).v11.capabilities.canUploadFile,true);
 assert.equal(eligibleDelegate(u),false);
});
