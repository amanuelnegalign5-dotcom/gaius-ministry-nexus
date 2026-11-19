// Dependency-free offline DOCX and PDF export for v11 records (valid files, not renamed HTML).
const enc=new TextEncoder();
const xml=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&apos;'}[c]));
function crc32(buf){let crc=0xffffffff;for(const b of buf){crc^=b;for(let n=0;n<8;n++)crc=(crc>>>1)^(0xedb88320&-(crc&1));}return (crc^0xffffffff)>>>0;}
const u16=n=>[n&255,(n>>>8)&255],u32=n=>[n&255,(n>>>8)&255,(n>>>16)&255,(n>>>24)&255];
const join=chunks=>{const total=chunks.reduce((s,x)=>s+x.length,0),out=new Uint8Array(total);let k=0;for(const p of chunks){out.set(p,k);k+=p.length;}return out;};
function zip(items){const chunks=[],central=[];let offset=0;
 for(const [name,text] of items){const nm=enc.encode(name),data=enc.encode(text),crc=crc32(data);const local=join([Uint8Array.from([...u32(0x04034b50),...u16(20),...u16(0x800),...u16(0),...u16(0),...u16(0),...u32(crc),...u32(data.length),...u32(data.length),...u16(nm.length),...u16(0)]),nm,data]);
  chunks.push(local);central.push(join([Uint8Array.from([...u32(0x02014b50),...u16(20),...u16(20),...u16(0x800),...u16(0),...u16(0),...u16(0),...u32(crc),...u32(data.length),...u32(data.length),...u16(nm.length),...u16(0),...u16(0),...u16(0),...u16(0),...u32(0),...u32(offset)]),nm]));offset+=local.length; }
 const cd=join(central),end=Uint8Array.from([...u32(0x06054b50),...u16(0),...u16(0),...u16(items.length),...u16(items.length),...u32(cd.length),...u32(offset),...u16(0)]);
 return new Blob([...chunks,cd,end],{type:'application/vnd.openxmlformats-officedocument.wordprocessingml.document'});
}
function paragraph(t,bold=false){return '<w:p><w:pPr><w:spacing w:after="120"/></w:pPr><w:r><w:rPr>'+(bold?'<w:b/>':'')+'<w:sz w:val="23"/></w:rPr><w:t xml:space="preserve">'+xml(t)+'</w:t></w:r></w:p>';}
export function makeDocx(title,rows){
 const body=paragraph('GAIUS MINISTRY | '+title,true)+paragraph('Generated: '+new Date().toLocaleString(),false)+rows.flatMap(([k,v])=>[paragraph(k,true),...String(v??'—').split(/\n/).map(x=>paragraph(x||' '))]).join('');
 const doc=`<?xml version="1.0" encoding="UTF-8" standalone="yes"?><w:document xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main"><w:body>${body}<w:sectPr><w:pgSz w:w="11906" w:h="16838"/><w:pgMar w:top="1000" w:right="1050" w:bottom="1000" w:left="1050"/></w:sectPr></w:body></w:document>`;
 const types=`<?xml version="1.0" encoding="UTF-8"?><Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types"><Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/><Default Extension="xml" ContentType="application/xml"/><Override PartName="/word/document.xml" ContentType="application/vnd.openxmlformats-officedocument.wordprocessingml.document.main+xml"/></Types>`;
 const rels=`<?xml version="1.0" encoding="UTF-8"?><Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships"><Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument" Target="word/document.xml"/></Relationships>`;
 return zip([['[Content_Types].xml',types],['_rels/.rels',rels],['word/document.xml',doc]]);
}
function layout(title,rows){const sheets=[];let canvas,ctx,y;
 const start=()=>{canvas=document.createElement('canvas');canvas.width=1240;canvas.height=1754;ctx=canvas.getContext('2d');ctx.fillStyle='#ffffff';ctx.fillRect(0,0,canvas.width,canvas.height);ctx.fillStyle='#173c38';ctx.fillRect(0,0,1240,12);ctx.fillStyle='#193b36';ctx.font='bold 38px system-ui, sans-serif';ctx.fillText('GAIUS MINISTRY',70,88);ctx.fillStyle='#2a4643';ctx.font='bold 29px system-ui, sans-serif';ctx.fillText(String(title).slice(0,55),70,143);ctx.font='19px system-ui, sans-serif';ctx.fillText(new Date().toLocaleString(),70,183);y=230;};
 const next=()=>{if(canvas)sheets.push(canvas);start();};
 const wrap=(text,font,size)=>{ctx.font=`${font} ${size}px "Noto Sans Ethiopic", "Nyala", system-ui, sans-serif`;const lines=[];for(const p of String(text??'—').split('\n')){let line='';for(const word of p.split(/\s+/)){let test=line?line+' '+word:word;if(ctx.measureText(test).width>1090&&line){lines.push(line);line=word;}else line=test;}lines.push(line||' ');}return lines;};
 start();for(const [k,v] of rows){const head=wrap(k,'bold',25),body=wrap(v,'normal',22);const needed=head.length*37+body.length*35+27;if(y+needed>1680)next();for(const line of head){ctx.fillStyle='#1b6d65';ctx.font='bold 25px "Noto Sans Ethiopic", system-ui, sans-serif';ctx.fillText(line,70,y);y+=37;}for(const line of body){if(y>1680)next();ctx.fillStyle='#202e2c';ctx.font='22px "Noto Sans Ethiopic", system-ui, sans-serif';ctx.fillText(line.slice(0,210),70,y);y+=35;}y+=24;}
 sheets.push(canvas);return sheets;}
function pdfFromCanvases(sheets){let objects=[null],pages=[];
 const put=data=>{objects.push(data);return objects.length-1;};
 const catalog=put(''),pagesId=put('');
 for(const canvas of sheets){const base64=canvas.toDataURL('image/jpeg',0.88).split(',')[1],binary=atob(base64),img=Uint8Array.from(binary,c=>c.charCodeAt(0));
  const content=enc.encode(`q\n595 0 0 842 0 0 cm\n/Im0 Do\nQ\n`);
  const imgId=put({header:`<< /Type /XObject /Subtype /Image /Width ${canvas.width} /Height ${canvas.height} /ColorSpace /DeviceRGB /BitsPerComponent 8 /Filter /DCTDecode /Length ${img.length} >>\nstream\n`,bytes:img});
  const contentId=put({header:`<< /Length ${content.length} >>\nstream\n`,bytes:content});
  pages.push(put(`<< /Type /Page /Parent ${pagesId} 0 R /MediaBox [0 0 595 842] /Resources << /XObject << /Im0 ${imgId} 0 R >> >> /Contents ${contentId} 0 R >>`));
 }
 objects[catalog]=`<< /Type /Catalog /Pages ${pagesId} 0 R >>`;
 objects[pagesId]=`<< /Type /Pages /Count ${pages.length} /Kids [${pages.map(id=>id+' 0 R').join(' ')}] >>`;
 const parts=[enc.encode('%PDF-1.4\n%\xE2\xE3\xCF\xD3\n')],positions=[0];let length=parts[0].length;
 const add=b=>{parts.push(b);length+=b.length;};
 objects.slice(1).forEach((obj,i)=>{const id=i+1;positions[id]=length;add(enc.encode(`${id} 0 obj\n`));if(typeof obj==='string')add(enc.encode(obj+'\n'));else{add(enc.encode(obj.header));add(obj.bytes);add(enc.encode('\nendstream\n'));}add(enc.encode('endobj\n'));});
 const xref=length;add(enc.encode(`xref\n0 ${objects.length}\n0000000000 65535 f \n`));for(let i=1;i<objects.length;i++)add(enc.encode(String(positions[i]).padStart(10,'0')+' 00000 n \n'));
 add(enc.encode(`trailer\n<< /Size ${objects.length} /Root ${catalog} 0 R >>\nstartxref\n${xref}\n%%EOF`));return new Blob(parts,{type:'application/pdf'});
}
export function makePdf(title,rows){return pdfFromCanvases(layout(title,rows));}
export function saveDownload(blob,name){const u=URL.createObjectURL(blob),a=document.createElement('a');a.href=u;a.download=name;a.style.display='none';document.body.append(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(u),2500);}
