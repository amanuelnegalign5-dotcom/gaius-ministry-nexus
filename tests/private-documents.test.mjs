import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {v11Command,v11State} from '../gaius-v11-core.js';

class DB{
 constructor(){this.b=new Map();}
 all(name){return [...(this.b.get(name)||new Map()).values()];}
 one(name,id){return this.b.get(name)?.get(id)||null;}
 put(name,item){if(!this.b.has(name))this.b.set(name,new Map());this.b.get(name).set(item.id,item);}
}
const director={id:'dir1',role:'country_director',accountStatus:'active',name:'Director'};
const otherDirector={id:'dir2',role:'international_director',accountStatus:'active',name:'International Director'};
const staff={id:'staff1',role:'assisting_staff',accountStatus:'active',name:'Staff'};
const source=(sourceId,sourceFile,kind,scopeType)=>({
 sourceId,sourceFile,kind,scopeType,title:'Original Document '+sourceId,
 body:'This is the exact source-derived extracted text as supplied in an authorized import. No automatic approval. Original remains available in an immutable snapshot.',
 sourceSha256:'a'.repeat(64),extraction:'Plain text from original DOCX.'
});
const makeBundle=()=>({schema:'gaius-private-source-documents-v1',documents:[
 source('gaius-ministry-manual-en-2026','GAIUS MINISTRY(1).docx','ministry','organization'),
 source('gaius-teaching-roadmap-am-2026','የትምህርት ሂደት.docx','teaching','organization'),
 source('gaius-country-director-six-month-plan-2026','gaius_director_6_month_plan(1).docx','other','personal')
]});
test('source archive imports three documents once without publishing them',()=>{
 const db=new DB(),bundle=makeBundle();
 const result=v11Command(db,director,'v11.importSourceDocs',{bundle});
 assert.equal(result.count,3);assert.deepEqual(result.skipped,[]);
 const all=db.all('v11_records');assert.equal(all.length,3);
 assert.ok(all.every(x=>x.status==='draft'&&x.sourceSnapshot?.body===x.data.body));
 const again=v11Command(db,director,'v11.importSourceDocs',{bundle});
 assert.equal(again.count,0);assert.equal(again.skipped.length,3);
 assert.equal(db.all('v11_records').length,3);
});
test('organizational documents are director-visible but private plan is owner-only',()=>{
 const db=new DB();v11Command(db,director,'v11.importSourceDocs',{bundle:makeBundle()});
 assert.equal(v11State(db,director).v11.records.filter(r=>r.kind==='manuals').length,3);
 assert.equal(v11State(db,otherDirector).v11.records.filter(r=>r.kind==='manuals').length,2);
 assert.equal(v11State(db,staff).v11.records.length,0);
});
test('staff cannot import sources and tampered source ids are rejected',()=>{
 const db=new DB();
 assert.throws(()=>v11Command(db,staff,'v11.importSourceDocs',{bundle:makeBundle()}),/forbidden/);
 const tampered=makeBundle();tampered.documents[0].sourceFile='malicious.docx';
 assert.throws(()=>v11Command(db,director,'v11.importSourceDocs',{bundle:tampered}),/sourceMetadataInvalid/);
 assert.equal(db.all('v11_records').length,0);
});
test('working copy edits do not overwrite original source text',()=>{
 const db=new DB();v11Command(db,director,'v11.importSourceDocs',{bundle:makeBundle()});
 const doc=db.all('v11_records').find(r=>r.scopeType==='organization');
 const old=doc.sourceSnapshot.body;
 const result=v11Command(db,director,'v11.save',{id:doc.id,version:doc._v,kind:'manuals',data:{...doc.data,body:'Revised working copy - approved source untouched.'}});
 const newer=db.one('v11_records',result.id);
 assert.equal(newer.sourceSnapshot.body,old);
 assert.equal(newer.data.body,'Revised working copy - approved source untouched.');
});
test('PWA launcher references the official GAIUS logo in both mobile and desktop manifests',()=>{
 const manifest=JSON.parse(readFileSync(new URL('../manifest.webmanifest',import.meta.url),'utf8'));
 const html=readFileSync(new URL('../index.html',import.meta.url),'utf8');
 const sw=readFileSync(new URL('../sw.js',import.meta.url),'utf8');
 assert.ok(manifest.icons.find(i=>i.sizes==='512x512'&&i.purpose==='any'&&i.src.includes('11.1.4')));
 assert.match(html,/apple-touch-icon\.png\?v=11\.1\.4/);
 assert.match(html,/manifest\.webmanifest\?v=11\.1\.4/);
 assert.match(html,/favicon-32\.png\?v=11\.1\.4/);
 assert.match(sw,/11\.1\.6-nine-hq-reports/);
});
test('private original texts are never committed to public source files',()=>{
 const ui=readFileSync(new URL('../gaius-v11-ui.js',import.meta.url),'utf8');
 assert.match(ui,/nexusSourceImport/);assert.match(ui,/v11\.importSourceDocs/);
 assert.doesNotMatch(ui,/To see youths capable in every aspect/);
});
