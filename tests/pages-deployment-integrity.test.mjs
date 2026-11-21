import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync, existsSync} from 'node:fs';
import {fileURLToPath} from 'node:url';
import {dirname, resolve} from 'node:path';

// Guard against publishing an HTML shell without a transitive JS dependency.
// Missing gaius-report-policy.js caused the sign-in text to be blank because
// the app module never initialized; missing gaius-brand.css hid new styling.
const root=resolve(dirname(fileURLToPath(import.meta.url)),'..');
const read=file=>readFileSync(resolve(root,file),'utf8');
const workflow=read('.github/workflows/static.yml');
const html=read('index.html');
const sw=read('sw.js');
const fileBlock=workflow.match(/files=\(\s*([\s\S]*?)\s*\)/);
assert.ok(fileBlock,'Frontend files array is missing from GitHub Pages workflow');
const published=new Set(fileBlock[1].trim().split(/\s+/));

test('GitHub Pages bundle includes all the top-level entrypoints and styles',()=>{
 for(const name of ['index.html','gaius-config.js','gaius-app.js','gaius-v11-ui.js','sw.js','manifest.webmanifest','gaius-brand.css','gaius-report-policy.js']){
  assert.ok(published.has(name),`GitHub Pages build does not publish ${name}`);
  assert.ok(existsSync(resolve(root,name)),`Missing source file: ${name}`);
 }
});
test('GitHub Pages contains all transitive ES module dependencies',()=>{
 const seen=new Set(),pending=['gaius-app.js','gaius-v11-ui.js'];
 while(pending.length){
  const name=pending.pop();
  if(seen.has(name))continue;
  seen.add(name);
  assert.ok(published.has(name),`JS module import will 404 on GitHub Pages: ${name}`);
  const s=read(name),pattern=/(?:\bfrom\s*|\bimport\s*)['"]\.\/([^'"]+\.js)['"]/g;
  for(const match of s.matchAll(pattern))pending.push(match[1]);
 }
 assert.ok(seen.has('gaius-report-policy.js'),'HQ permission policy must be included in production');
});
test('every CSS file loaded by sign-in HTML is published',()=>{
 for(const m of html.matchAll(/<link[^>]+rel="stylesheet"[^>]+href="\.\/([^"?]+\.css)(?:\?[^"]*)?"/g)){
  assert.ok(published.has(m[1]),`CSS will 404 on GitHub Pages: ${m[1]}`);
 }
});
test('PWA pre-cache refers only to published web assets',()=>{
 const match=sw.match(/const files=\[([\s\S]*?)\];/);
 assert.ok(match,'PWA asset list missing');
 for(const [,path] of match[1].matchAll(/'\.\/([^']*)'/g)){
  if(!path||path==='index.html')continue;
  if(path.startsWith('icons/')){
   if(path.endsWith('.png'))assert.ok(workflow.includes('cp icons/*.png'),`PNG icon not copied: ${path}`);
   else assert.ok(workflow.includes(path),`Non-PNG icon not copied: ${path}`);
   assert.ok(existsSync(resolve(root,path)),`PWA asset missing from repository: ${path}`);
  }else{
   assert.ok(published.has(path),`SW install will fail because ${path} was not published`);
  }
 }
});
test('registration and sign-in strings have static fallback',()=>{
 assert.match(html,/data-i="title"/);
 assert.match(html,/id="loginTab"/);
 assert.match(html,/id="authBtn"/);
 assert.match(html,/gaius-white-logo\.webp/);
 assert.doesNotMatch(html,/gaius-login-hero/);
});
