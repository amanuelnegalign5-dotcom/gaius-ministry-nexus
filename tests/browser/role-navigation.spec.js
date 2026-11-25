import {test,expect} from '@playwright/test';
const centerRoles=['center_senior_leader','center_leader','center_department_leader','potential_center_leader','potential_department_leader','volunteer'];
const staffRoles=['country_director','international_director','hq_staff','staff','monday_leader','media_leader'];
async function enter(page,role,center){
 await page.addInitScript(({role,center})=>{
  localStorage.setItem('gLang','en');
  localStorage.setItem('users',JSON.stringify([{id:'fixture',name:'Test account',username:'fixture',role,center,department:center?'Worship Team':role==='media_leader'?'Media':'',accountStatus:'active',adminPermissions:[],_v:1}]));
  sessionStorage.setItem('me','fixture');
 },{role,center});
 await page.goto('http://127.0.0.1:4173/?workspace=local');
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
 await page.goto('http://127.0.0.1:4173/?workspace=local');
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
 await expect(center.locator('[data-action="open-delegation"]')).toHaveCount(0);
 await hq.locator('.accessEditor summary').click();
 await expect(hq.locator('[data-action="open-delegation"]')).toBeVisible();
});
