import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
const nexus=readFileSync(new URL('../gaius-v11-ui.js',import.meta.url),'utf8');
const css=readFileSync(new URL('../gaius-v11.css',import.meta.url),'utf8');
const html=readFileSync(new URL('../index.html',import.meta.url),'utf8');
const sw=readFileSync(new URL('../sw.js',import.meta.url),'utf8');

test('legacy header navigation is hidden only while nexus screen is active',()=>{
 assert.match(css,/#app\.nexus-mode \.bar \.tabs,/);
 assert.match(css,/#app\.nexus-mode \.bar \.modeLine\{display:none!important\}/);
 assert.match(nexus,/app\.classList\.add\('nexus-mode'\)/);
 assert.match(nexus,/app\.classList\.remove\('nexus-mode'\)/);
});
test('launcher cannot accidentally dismiss the active Director workspace',()=>{
 assert.doesNotMatch(nexus,/launch\.onclick=\(\)=>active\?close\(\):/);
 assert.match(nexus,/if\(active\)\{section=directorRole/);
 assert.match(nexus,/if\(op==='close'\)\{close\(\);return;\}/);
});
test('async load cannot resurrect a closed workspace',()=>{
 assert.match(nexus,/opening=false,viewEpoch=0/);
 assert.match(nexus,/if\(epoch!==viewEpoch\)return/);
 assert.match(nexus,/function close\(\)\{[\s\S]*?\+\+viewEpoch;/);
 assert.match(nexus,/root\.innerHTML='<div class="v11wrap"/);
});
test('mobile layout eliminates double-sticky navigation and preserves logout controls',()=>{
 assert.match(css,/@media\(max-width:700px\)/);
 assert.match(css,/#app\.nexus-mode \.v11nav\{position:static/);
 assert.match(css,/#app\.nexus-mode \.bar\{position:relative/);
 assert.match(css,/#app\.nexus-mode \.bar \.actions/);
});
test('PWA cache and static asset versions invalidate old iPhone interface',()=>{
 assert.match(sw,/11\.1\.4-source-brand/);
 assert.match(html,/gaius-v11\.css\?v=11\.1\.4/);
 assert.match(html,/gaius-v11-ui\.js\?v=11\.1\.4/);
 assert.match(html,/gaius-app\.js\?v=11\.1\.4/);
});
