// Safe allowlist for PRIVATE R2 uploads. All downloads remain authenticated;
// never expose a public R2 URL or serve user HTML/SVG inline.
export const MAX_FILE_BYTES=10*1024*1024;
const types={
 pdf:['application/pdf','pdf'],png:['image/png','png'],jpg:['image/jpeg','jpeg'],jpeg:['image/jpeg','jpeg'],
 webp:['image/webp','webp'],gif:['image/gif','gif'],
 doc:['application/msword','ole'],docx:['application/vnd.openxmlformats-officedocument.wordprocessingml.document','zip'],
 ppt:['application/vnd.ms-powerpoint','ole'],pptx:['application/vnd.openxmlformats-officedocument.presentationml.presentation','zip'],
 xls:['application/vnd.ms-excel','ole'],xlsx:['application/vnd.openxmlformats-officedocument.spreadsheetml.sheet','zip'],
 txt:['text/plain','text'],csv:['text/csv','text'],zip:['application/zip','zip']
};
export const FILE_ACCEPT=Object.keys(types).map(x=>'.'+x).join(',');
export function fileTypeFor(name,declared=''){
 const ext=String(name||'').split('.').pop().toLowerCase();
 const record=types[ext];if(!record)return null;
 const mime=String(declared||'').toLowerCase().split(';')[0].trim();
 // iOS browsers may report an empty/octet-stream MIME for Office documents.
 if(mime&&mime!=='application/octet-stream'&&mime!==record[0]&&
   !(ext==='csv'&&mime==='text/plain')&&
   !(ext==='zip'&&['application/x-zip-compressed','application/x-zip'].includes(mime)))return null;
 return {mime:record[0],magic:record[1],ext};
}
export function matchesFileSignature(bytes,kind){
 const b=bytes instanceof Uint8Array?bytes:new Uint8Array(bytes||[]);
 const starts=(...sig)=>sig.every((n,i)=>b[i]===n);
 if(kind==='pdf')return starts(37,80,68,70,45);
 if(kind==='png')return starts(137,80,78,71,13,10,26,10);
 if(kind==='jpeg')return starts(255,216,255);
 if(kind==='gif')return starts(71,73,70,56)&&[55,57].includes(b[4])&&b[5]===97;
 if(kind==='webp')return starts(82,73,70,70)&&String.fromCharCode(...b.slice(8,12))==='WEBP';
 if(kind==='zip')return starts(80,75,3,4)||starts(80,75,5,6);
 if(kind==='ole')return starts(208,207,17,224,161,177,26,225);
 if(kind==='text')return b.length>0&&!b.slice(0,128).some(n=>n===0);
 return false;
}
