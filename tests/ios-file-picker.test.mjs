import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';

const ui=readFileSync(new URL('../gaius-v11-ui.js',import.meta.url),'utf8');
const css=readFileSync(new URL('../gaius-v11.css',import.meta.url),'utf8');
const worker=readFileSync(new URL('../gaius-worker.js',import.meta.url),'utf8');
const html=readFileSync(new URL('../index.html',import.meta.url),'utf8');
const sw=readFileSync(new URL('../sw.js',import.meta.url),'utf8');

test('both private import forms retain directly tappable native iOS file inputs',()=>{
 assert.match(ui,/filePickerHTML\('nexusPlanFile'\)/);
 assert.match(ui,/filePickerHTML\('nexusSourceFile'\)/);
 assert.match(ui,/input class="v11pickerInput" type="file" id=/);
 assert.match(ui,/label for=/);
 assert.match(ui,/required><p class="v11pickerStatus"/);
 assert.doesNotMatch(css,/\.v11pickerInput\{[^}]*display:none/);
 assert.match(css,/\.v11pickerInput\{[^}]*pointer-events:auto!important/);
 assert.match(css,/\.v11pickerInput\{[^}]*min-height:52px/);
});
test('selected filename is announced and wrong source type is explicitly explained',()=>{
 assert.match(ui,/data-file-status/);
 assert.match(ui,/e\.target\?\.matches\?\.\('input\[type="file"\]'\)/);
 assert.match(ui,/!\/\\\.json\$\/i\.test\(file\.name\)/);
 assert.match(ui,/role="status" aria-live="polite"/);
 assert.match(ui,/Only a \.json import file works here/);
});
test('general media upload is disabled until the authenticated backend confirms R2',()=>{
 assert.match(worker,/if\(route==='state'\)\{/);
 assert.match(worker,/services:\{mediaUploads:!!this\.env\.MEDIA_BUCKET\}/);
 assert.match(ui,/mediaReady=state\.services\?\.mediaUploads===true/);
 assert.match(ui,/mediaReady\?'':'disabled'/);
 assert.match(ui,/if\(state\.services\?\.mediaUploads!==true\)throw Error/);
 assert.match(ui,/filePickerHTML\('v11File','attachment'\)/);
});
test('JSON imports are separate from R2 uploads, preserving director-only server authorization',()=>{
 assert.match(ui,/store\.command\('v11\.importSourceDocs',\{bundle\}\)/);
 assert.match(ui,/store\.command\('v11\.importDirectorPlan',\{plan\}\)/);
 const backend=readFileSync(new URL('../gaius-v11-core.js',import.meta.url),'utf8');
 assert.match(backend,/check\(active\(u\)&&isDirector\(u\),'forbidden'\)/);
 assert.match(backend,/check\(active\(u\)&&u\.role==='country_director','forbidden'\)/);
});
test('updated iOS launcher invalidates JS and CSS without changing private data',()=>{
 assert.match(html,/gaius-v11-ui\.js\?v=11\.1\.5/);
 assert.match(html,/gaius-v11\.css\?v=11\.1\.5/);
 assert.match(sw,/11\.1\.5-file-picker/);
});
