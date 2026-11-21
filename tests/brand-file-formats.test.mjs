import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {validateGaiusUpload,GAIUS_FILE_TYPES,GAIUS_MAX_FILE_BYTES} from '../gaius-upload-types.js';

const index=readFileSync(new URL('../index.html',import.meta.url),'utf8');
const ui=readFileSync(new URL('../gaius-v11-ui.js',import.meta.url),'utf8');
const worker=readFileSync(new URL('../gaius-worker.js',import.meta.url),'utf8');
test('login has prominent GAIUS brand and safe legacy fallback',()=>{
 assert.match(index,/gaius-login-brand/);
 assert.match(index,/icons\/login-brand\.png/);
 assert.match(index,/icons\/official-logo\.jpg/);
});
test('PWA home logo reused in Nexus header',()=>{
 assert.match(ui,/class="v11logo"/);
 assert.match(ui,/icons\/icon-192\.png/);
});
test('PDF, Office, image, text and archive formats are allowlisted',()=>{
 for(const extension of ['pdf','doc','docx','ppt','pptx','xls','xlsx','jpg','png','webp','gif','zip','csv','txt']){
  assert.equal(typeof GAIUS_FILE_TYPES['.'+extension],'string');
  const value=validateGaiusUpload({name:'example.'+extension,size:128,type:''});
  assert.equal(value.extension,'.'+extension);
  assert.ok(ui.includes('.'+extension));
 }
});
test('dangerous file types and deceptive MIME or sizes rejected',()=>{
 for(const ext of ['html','svg','js','exe','php','sh'])assert.throws(
 ()=>validateGaiusUpload({name:'unsafe.'+ext,size:100,type:''}),/fileTypeNotAllowed/);
 assert.throws(()=>validateGaiusUpload({name:'file.pdf',size:101,type:'text/html'}),/fileMimeMismatch/);
 assert.throws(()=>validateGaiusUpload({name:'file.pdf',size:GAIUS_MAX_FILE_BYTES+1,type:''}),/fileTooLarge/);
 assert.throws(()=>validateGaiusUpload({name:'../escape.pdf',size:200,type:''}),/invalidFileName/);
});
test('server has upload validation and keeps R2 optional rather than fake success',()=>{
 assert.match(worker,/validateGaiusUpload/);
 assert.match(worker,/MEDIA_BUCKET/);
});
