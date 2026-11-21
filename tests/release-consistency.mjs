// One source of truth for release/cache assertions.
// Do not pin historical v11.1/v11.2 strings: every legitimate release would
// otherwise fail even when the PWA cache and HTML move forward together.
import assert from 'node:assert/strict';
import {readFileSync, existsSync} from 'node:fs';
import {fileURLToPath} from 'node:url';
import {dirname,resolve} from 'node:path';

const root=resolve(dirname(fileURLToPath(import.meta.url)),'..');
const source=name=>readFileSync(resolve(root,name),'utf8');
const escapeRegExp=s=>s.replace(/[.*+?^${}()|[\]\\]/g,'\\$&');

export function checkReleaseAssets(){
 const html=source('index.html');
 const sw=source('sw.js');
 const version=JSON.parse(source('package.json')).version;
 const marker=sw.match(/const cacheName=prefix\+'([^']+)'/);
 assert.ok(marker,'Service worker cache release marker is missing');
 assert.ok(marker[1].startsWith(version+'-'),`PWA cache ${marker[1]} must be rotated on app release ${version}`);
 for(const filename of ['gaius-v11.css','gaius-brand.css','gaius-v11-ui.js']){
  const rx=new RegExp(escapeRegExp(filename)+'\\?v=([^"\\s<>]+)');
  const matched=html.match(rx);
  assert.ok(matched,`index.html must version ${filename}`);
  assert.equal(matched[1],version,`Update ${filename} cache-busting version with package.json`);
  assert.ok(sw.includes("'./"+filename+"'"),`Service worker must pre-cache ${filename}`);
  assert.ok(existsSync(resolve(root,filename)),`${filename} must exist`);
 }
 assert.ok(sw.includes("'./icons/official-logo.jpg'"),'PWA must cache the chosen white official logo');
 assert.ok(existsSync(resolve(root,'icons/official-logo.jpg')),'White logo image must exist');
 assert.ok(sw.includes("'./icons/gaius-white-logo.webp'"),'PWA must precache the new white logo');
 assert.ok(existsSync(resolve(root,'icons/gaius-white-logo.webp')),'User supplied logo asset missing');
 assert.match(html,/class="logo"[^>]*background-image:url\(\.\/icons\/gaius-white-logo\.webp\)/);
 assert.doesNotMatch(html,/gaius-login-hero|icons\/gaius-login\.png/,'Oversized dark login artwork must not be reintroduced');
 assert.doesNotMatch(sw,/icons\/gaius-login\.png/,'Retired black banner must not be pre-cached');
 return {version,cache:marker[1]};
}
