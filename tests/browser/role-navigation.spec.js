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
