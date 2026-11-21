import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
const app=readFileSync(new URL('../gaius-app.js',import.meta.url),'utf8');
const nexus=readFileSync(new URL('../gaius-v11-ui.js',import.meta.url),'utf8');
const html=readFileSync(new URL('../index.html',import.meta.url),'utf8');
const worker=readFileSync(new URL('../sw.js',import.meta.url),'utf8');

test('authenticated refresh notifies director module without credentials',()=>{
 const match=app.match(/window\.dispatchEvent\(new CustomEvent\('gaius:nexus-session-ready',[\s\S]*?\}\)\);/);
 assert.ok(match,'missing session ready event');
 assert.match(match[0],/id:next\.me\?\.id,role:next\.me\?\.role/);
 assert.doesNotMatch(match[0],/token|password|email|secret|apiKey/i);
});
test('directors land in own command center while old pages remain accessible',()=>{
 assert.match(nexus,/directorRole=role=>role==='country_director'\|\|role==='international_director'/);
 assert.match(nexus,/addEventListener\('gaius:nexus-session-ready'/);
 assert.match(nexus,/if\(directorRole\(my\(\)\.role\)&&caps\(\)\.director\)section='director'/);
 assert.match(nexus,/oldMain\.style\.display='none'/);
 assert.match(nexus,/function close\(\)\{[\s\S]*?root\.hidden=true;[\s\S]*?app\.classList\.remove\('nexus-mode'\);[\s\S]*?oldMain\.style\.display='';/);
 assert.match(nexus,/window\.scrollTo\(\{top:0,behavior:'auto'\}\)/);
});
test('signout hides director workspace and clears protected records',()=>{
 assert.match(app,/gaius:nexus-session-cleared/);
 assert.match(nexus,/addEventListener\('gaius:nexus-session-cleared'/);
 assert.match(nexus,/root\.replaceChildren\(\);state=null;autoOpenedDirectorId=null/);
});
test('PWA release invalidates old cached UI modules',()=>{
 assert.match(html,/gaius-app\.js\?v=11\.1\.6/);
 assert.match(html,/gaius-v11-ui\.js\?v=11\.2\.0/);
 assert.match(worker,/11\.2\.0-brand-documents/);
});
