import test from 'node:test';
import assert from 'node:assert/strict';
import {governanceService,GOVERNANCE_CATALOG} from '../gaius-governance-service.js';
import {v11Command,v11State,canReadFile} from '../gaius-v11-core.js';
import {full,permit} from '../gaius-core.js';
import {classifiedPermissions,eligibleDelegate,validCenterAttendance} from '../gaius-report-policy.js';
function setup(){
 const map=new Map();const db={all:k=>map.get(k)||[],one(k,id){return this.all(k).find(r=>r.id===id)},put(k,r){map.set(k,[...this.all(k).filter(x=>x.id!==r.id),r])}};
 for(const [id,role,center] of [['d','country_director',''],['h','followup_leader',''],['f','hq_staff',''],['s','center_senior_leader','East'],['m','center_leader','East'],['p','potential_center_leader','East']])db.put('users',{id,name:id,role,center,accountStatus:'active',department:id==='h'?'Follow-up':'Worship Team'});
 let n=0;const call=(id,action,p)=>governanceService(db,db.one('users',id),action,p,Date.parse('2026-11-25T12:00:00Z'),()=>String(++n),GOVERNANCE_CATALOG);
 const east=call('d','governance.save',{kind:'center',name:'East',region:'country',country:'ET'}).id;
 return {db,call,east};
}
test('HQ and staff are the only eligible recipients; grants are classified by role',()=>{
 const {db,call}=setup();const p={type:'delegation',scope:'organization',modules:['center_reports'],actions:['view'],startsAt:'2026-11-25T00:00:00Z',endsAt:'2026-11-26T00:00:00Z',purpose:'Review',reference:'D1'};
 assert.equal(eligibleDelegate(db.one('users','f')),true);
 assert.ok(call('d','governance.grant',{...p,recipientId:'f'}).id);
 assert.throws(()=>call('d','governance.grant',{...p,recipientId:'f',actions:['approve']}),/permissionsInvalid/);
 for(const id of ['s','m','p'])assert.throws(()=>call('d','governance.grant',{...p,recipientId:id}),/recipientInvalid/);
 assert.throws(()=>call('h','governance.grant',{...p,recipientId:'f'}),/forbidden/);
 const recipients=call('d','governance.list',{}).eligibleHQ;
 assert.deepEqual(recipients.map(x=>x.id).sort(),['f','h']);assert.ok(recipients.find(x=>x.id==='h').actions.includes('approve'));
 assert.ok(!recipients.find(x=>x.id==='f').actions.includes('approve'));
});
test('center-only roles cannot inherit legacy administration or HQ file/report visibility',()=>{
 const {db}=setup();const u={...db.one('users','m'),fullAdmin:true,adminPermissions:['attendance','reports','manage_users','v11:approve']};
 assert.equal(full(u),false);assert.equal(permit(u,'manage_users'),false);assert.deepEqual(classifiedPermissions(u),[]);
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
