// Allowlisted attachment formats shared by the Cloudflare Worker and UI.
// No HTML, SVG, JavaScript or executables: uploaded content is untrusted.
export const GAIUS_FILE_TYPES=Object.freeze({
 '.pdf':'application/pdf',
 '.doc':'application/msword',
 '.docx':'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
 '.ppt':'application/vnd.ms-powerpoint',
 '.pptx':'application/vnd.openxmlformats-officedocument.presentationml.presentation',
 '.xls':'application/vnd.ms-excel',
 '.xlsx':'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
 '.jpg':'image/jpeg','.jpeg':'image/jpeg','.png':'image/png',
 '.webp':'image/webp','.gif':'image/gif',
 '.txt':'text/plain','.csv':'text/csv','.zip':'application/zip',
 '.mp4':'video/mp4'
});
export const GAIUS_MAX_FILE_BYTES=10*1024*1024;
export const GAIUS_ACCEPT_TYPES=Object.keys(GAIUS_FILE_TYPES).join(',');
export function validateGaiusUpload({name,size,type}={}){
 if(typeof name!=='string'||!name||name.length>220||/[\\/\0-\x1f]/.test(name))throw Error('invalidFileName');
 const ext=name.slice(name.lastIndexOf('.')).toLowerCase();
 const mime=GAIUS_FILE_TYPES[ext];
 if(!mime)throw Error('fileTypeNotAllowed');
 if(!Number.isSafeInteger(size)||size<1||size>GAIUS_MAX_FILE_BYTES)throw Error('fileTooLarge');
 const supplied=String(type||'').toLowerCase();
 const allowed=new Set([mime,'application/octet-stream','']);
 if(ext==='.zip')allowed.add('application/x-zip-compressed');
 if(ext==='.csv')allowed.add('application/vnd.ms-excel');
 if(ext==='.txt')allowed.add('text/plain');
 if(!allowed.has(supplied))throw Error('fileMimeMismatch');
 return {extension:ext,mime,size};
}
