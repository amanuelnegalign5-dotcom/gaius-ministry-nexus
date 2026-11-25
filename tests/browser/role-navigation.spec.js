import {test,expect} from '@playwright/test';
// Role tests exercise the actual application, independently of service-worker lifecycle.
test.use({serviceWorkers:'block'});
test.beforeEach(async({page})=>{page.on('pageerror',e=>console.log('PAGE ERROR:',e.message));page.on('requestfailed',r=>console.log('REQUEST FAILED:',r.url(),r.failure()?.errorText));});
async function load(page){const response=await page.goto('http://127.0.0.1:4173/index.html?workspace=local');expect(response?.ok()).toBeTruthy();await expect(page.locator('#auth')).toBeAttached();await expect(page.locator('#app')).toBeAttached();}
const centerRoles=['center_senior_leader','center_leader','center_department_leader','potential_center_leader','potential_department_leader','volunteer'];
const staffRoles=['country_director','international_director','hq_staff','staff','monday_leader','media_leader'];
async function enter(page,role,center){
 await page.addInitScript(({role,center})=>{
  localStorage.setItem('gLang','en');
  localStorage.setItem('users',JSON.stringify([{id:'fixture',name:'Test account',username:'fixture',role,center,department:center?'Worship Team':role==='media_leader'?'Media':'',accountStatus:'active',adminPermissions:[],_v:1}]));
  sessionStorage.setItem('me','fixture');
 },{role,center});
 await load(page);
 await expect(page.locator('#app')).toBeVisible();
 await expect(page.locator('#who')).toContainText('Test account');
 // The director and center roles automatically open Nexus. Verify the preserved
 // legacy navigation after deliberately returning from that workspace as well.
 if(['country_director','international_director',...centerRoles.filter(r=>r!=='volunteer')].includes(role)){
  await expect(page.locator('#gaiusV11 [data-v="close"]')).toBeVisible();
  await page.locator('#gaiusV11 [data-v="close"]').click();
 }
}
for(const role of centerRoles)test(role+' cannot see Monday attendance on any legacy navigation screen',async({page})=>{
 await enter(page,role,'Gerji');
 await expect(page.locator('#app')).toHaveAttribute('data-monday-access','no');
 await expect(page.locator('[data-page="attendance"]')).toBeHidden();
 await expect(page.locator('#attendance')).toBeHidden();
 await page.locator('[data-page="attendance"]').evaluate(el=>el.click());
 await expect(page.locator('#attendance')).toBeHidden();
 await expect(page.locator('#profileSummary')).not.toContainText(/Present|Permitted/);
});
for(const role of staffRoles)test(role+' is allowed the Monday navigation',async({page})=>{
 await enter(page,role,'');
 await expect(page.locator('#app')).toHaveAttribute('data-monday-access','yes');
 await expect(page.locator('[data-page="attendance"]')).toBeVisible();
 await page.locator('[data-page="attendance"]').click();
 await expect(page.locator('#attendance')).toBeVisible();
});

test('director sees center-specific permission controls without false delegated administrator labels',async({page})=>{
 await page.addInitScript(()=>{
  localStorage.setItem('gLang','en');
  localStorage.setItem('users',JSON.stringify([
   {id:'d',name:'Test Director',username:'director',role:'country_director',accountStatus:'active',_v:1},
   {id:'c',name:'Test Center Leader',username:'center',role:'center_leader',center:'Gerji',department:'Worship Team',accountStatus:'active',adminPermissions:['attendance'],fullAdmin:true,_v:1},
   {id:'h',name:'Test HQ Leader',username:'hq',role:'followup_leader',department:'Follow-up',accountStatus:'active',adminPermissions:['comments'],_v:1}
  ]));sessionStorage.setItem('me','d');
 });
 await load(page);
 await page.locator('#gaiusV11 [data-v="close"]').click();
 await page.locator('[data-page="admin"]').click();
 const center=page.locator('#adminUsers [data-id="c"]'),hq=page.locator('#adminUsers [data-id="h"]');
 await expect(center).toContainText('Test Center Leader');
 await expect(center).not.toContainText('Delegated administrator');
 await expect(hq).not.toContainText('Delegated administrator');
 await center.locator('.accessEditor summary').click();
 await expect(center.locator('[data-permission="center:attendance"]')).toBeVisible();
 await expect(center.locator('[data-permission="center:review_reports"]')).toBeVisible();
 await expect(center.locator('[data-permission="attendance"]')).toHaveCount(0);
 // Current main explicitly allows own-center grants to eligible center accounts.
 await expect(center.locator('[data-action="open-delegation"]')).toBeVisible();
 await hq.locator('.accessEditor summary').click();
 await expect(hq.locator('[data-action="open-delegation"]')).toBeVisible();
});

test('appearance switches on login and persists through reload and system setting',async({page})=>{
 await page.emulateMedia({colorScheme:'light'});
 await load(page);
 const select=page.locator('#auth [data-appearance]');
 await expect(select).toBeVisible();await select.selectOption('dark');
 await expect(page.locator('html')).toHaveAttribute('data-theme','dark');
 await page.reload();await expect(page.locator('html')).toHaveAttribute('data-theme','dark');
 await select.selectOption('light');await expect(page.locator('html')).toHaveAttribute('data-theme','light');
 await select.selectOption('system');await page.emulateMedia({colorScheme:'dark'});await expect(page.locator('html')).toHaveAttribute('data-theme','dark');
 await page.locator('#auth [data-help]').click();await expect(page.locator('#nexusHelp')).toBeVisible();
 await expect(page.locator('#nexusHelp')).not.toContainText('Delegation & permissions');
 await page.keyboard.press('Escape');await expect(page.locator('#nexusHelp')).toBeHidden();
});
test('center user help lists only authorized navigation and guides center attendance',async({page})=>{
 await enter(page,'center_leader','Gerji');
 await page.locator('#app [data-appearance]').selectOption('dark');
 await page.locator('#app [data-help]').click();
 await expect(page.locator('#nexusHelp')).toBeVisible();
 await expect(page.locator('#nexusHelp')).not.toContainText(/Monday attendance|HQ reports|Delegation & permissions/);
 await page.locator('#nexusHelp').getByRole('button',{name:'Open Nexus workspace'}).click();
 await page.locator('#gaiusV11 [data-section="records"]').click();
 await page.locator('#v11Kind').selectOption('centerAttendance');
 await page.locator('#app [data-help]').click();
 await expect(page.locator('#nexusHelp')).toContainText('Sunday program plus one weekly meeting');
 await expect(page.locator('#nexusHelp')).not.toContainText('Monday attendance');
 await expect(page.locator('html')).toHaveAttribute('data-theme','dark');
});

test('center profile retains direct center work links after returning from Nexus',async({page})=>{
 await enter(page,'center_leader','Gerji');
 const nav=page.locator('#centerWorkspaceNav');
 await expect(nav).toBeVisible();
 await expect(nav).not.toContainText(/Monday attendance|HQ reports/i);
 await expect(nav.locator('[data-center-shortcut="plans6"]')).toBeVisible();
 await expect(nav.locator('[data-center-shortcut="monthly"]')).toBeVisible();
 await nav.locator('[data-center-shortcut="centerAttendance"]').click();
 await expect(page.locator('#v11Kind')).toHaveValue('centerAttendance');
 await page.locator('#gaiusV11 [data-v="close"]').click();
 await expect(nav.locator('[data-center-shortcut="monthly"]')).toBeVisible();
 await nav.locator('[data-center-shortcut="monthly"]').click();
 await expect(page.locator('#v11Kind')).toHaveValue('monthly');
});
test('unassigned center account sees assignment warning rather than an unexplained profile-only page',async({page})=>{
 await enter(page,'center_leader','');
 const nav=page.locator('#centerWorkspaceNav');
 await expect(nav).toContainText('No center is assigned');
 await expect(nav.locator('[data-center-shortcut="centerAttendance"]')).toHaveCount(0);
 await expect(nav.locator('[data-center-shortcut="overview"]')).toBeVisible();
});

test('staff sees individually granted documents and announcements, and loses them after revocation',async({page})=>{
 await enter(page,'staff','');
 await expect(page.locator('[data-page="documents"]')).toBeHidden();
 await expect(page.locator('[data-page="board"]')).toBeHidden();
 await page.locator('[data-page="workspace"]').click();
 await expect(page.locator('#workspace')).toBeVisible();
 await expect(page.locator('#saveProject')).toBeHidden();
 await page.evaluate(()=>{const u=JSON.parse(localStorage.users);u[0].adminPermissions=['documents','announcements','projects'];localStorage.users=JSON.stringify(u);});
 await page.locator('#modeLine [data-action="refresh"]').click();
 await expect(page.locator('[data-page="documents"]')).toBeVisible();
 await expect(page.locator('[data-page="board"]')).toBeVisible();
 await page.locator('[data-page="documents"]').click();
 await expect(page.locator('#documents')).toBeVisible();
 await page.locator('[data-page="board"]').click();
 await expect(page.locator('#board')).toBeVisible();
 await page.locator('[data-page="workspace"]').click();
 await expect(page.locator('#saveProject')).toBeVisible();
 await page.evaluate(()=>{const u=JSON.parse(localStorage.users);u[0].adminPermissions=[];localStorage.users=JSON.stringify(u);});
 await page.locator('#modeLine [data-action="refresh"]').click();
 await expect(page.locator('[data-page="documents"]')).toBeHidden();
 await expect(page.locator('[data-page="board"]')).toBeHidden();
 await expect(page.locator('#saveProject')).toBeHidden();
});
test('center permission refresh removes revoked editing controls without removing attendance reading',async({page})=>{
 await enter(page,'center_leader','Gerji');
 await page.evaluate(()=>{const u=JSON.parse(localStorage.users);u[0].adminPermissions=['center:attendance'];localStorage.users=JSON.stringify(u);});
 await page.locator('#modeLine [data-action="refresh"]').click();
 await page.locator('[data-center-shortcut="centerAttendance"]').click();
 await expect(page.locator('#v11form')).toBeVisible();
 await page.evaluate(()=>{const u=JSON.parse(localStorage.users);u[0].adminPermissions=[];localStorage.users=JSON.stringify(u);document.dispatchEvent(new Event('visibilitychange'));});
 await expect(page.locator('#v11form')).toHaveCount(0);
 await expect(page.locator('#v11Kind')).toHaveValue('centerAttendance');
 await expect(page.locator('[data-section="delegation"]')).toHaveCount(0);
});
for(const role of ['country_director','international_director','hq_staff','staff','media_leader','center_leader','potential_department_leader','volunteer'])test(role+' opens every visible legacy page and Nexus section',async({page})=>{
 await enter(page,role,['center_leader','potential_department_leader','volunteer'].includes(role)?'Gerji':'');
 const pages=await page.locator('#app .nav:visible').evaluateAll(nodes=>nodes.map(n=>n.dataset.page));
 for(const id of pages){await page.locator('[data-page="'+id+'"]').click();await expect(page.locator('#'+id)).toBeVisible();}
 await page.locator('#v11launch').click();
 await expect(page.locator('#gaiusV11 .v11nav')).toBeVisible();
 const sections=await page.locator('#gaiusV11 [data-section]:visible').evaluateAll(nodes=>nodes.map(n=>n.dataset.section));
 for(const section of sections){await page.locator('#gaiusV11 [data-section="'+section+'"]').click();await expect(page.locator('#gaiusV11 [data-section="'+section+'"]')).toHaveClass('on');await expect(page.locator('#gaiusV11 .v11content')).toBeVisible();}
 if(['center_leader','potential_department_leader','volunteer'].includes(role))await expect(page.locator('#gaiusV11 [data-section="delegation"]')).toHaveCount(0);
});
