import * as store from './gaius-store.js';
import {V11_KINDS, V11_KINDS_LIST,HQ_UNITS,CENTER_UNITS,FOCUS,TEACHING_UNITS,NEXUS_DEPARTMENT_FIELDS} from './gaius-v11-model.js';
import {visitCompliance,indicators,safePerformance,compatiblePlannedActual} from './gaius-nexus-analytics.js';
import {makeDocx,makePdf,saveDownload} from './gaius-v11-export.js';
// New v11 module coexists with v10.3: old screens, reports and workflows remain intact.
const escape=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&quot;'}[c]));
const $=id=>document.getElementById(id);
const localLang=()=>localStorage.gLang==='en'?'en':'am';
const text=(am,en)=>localLang()==='am'?am:en;
const statusText=s=>({draft:text('ረቂቅ','Draft'),submitted:text('ለማጽደቅ ቀርቧል','Submitted'),approved:text('ጸድቋል','Approved'),revision_requested:text('ማሻሻያ ተጠይቋል','Changes requested'),rejected:text('ውድቅ','Rejected'),archived:text('ተመዝግቦ ተዘግቷል','Archived'),pending:text('ማጽደቅ ይጠብቃል','Pending')}[s]||s);
const scopeLabel=s=>({organization:text('ድርጅት','Organization'),hq:'HQ',center:text('ማዕከል','Center'),personal:text('የግል','Personal')}[s]||s);
const validFileName=name=>String(name).replace(/[^\p{L}\p{N}_.-]+/gu,'_').slice(0,85)||'GAIUS';
let active=false,section='overview',state=null,kind='plans6',editing=null,queueBusy=false;
let analysisFilters={month:'',center:'',department:'',ethiopianYear:'',ethiopianMonth:'',startDate:'',endDate:'',focus:'',status:'',unit:''},selectedCenter='',selectedWeek='';
const root=document.createElement('section');root.id='gaiusV11';root.className='v11root';root.hidden=true;
const app=$('app'),oldMain=app.querySelector('main'),header=app.querySelector('header .actions')||app.querySelector('header');
const launch=document.createElement('button');launch.type='button';launch.className='btn ghost';launch.id='v11launch';launch.textContent='✦ '+text('ጋይዮስ ኔክሰስ','Gaius Nexus');header.prepend(launch);app.append(root);
function alertMsg(m,error=false){const x=$('v11notice');if(x){x.textContent=String(m||'');x.className='v11notice '+(error?'v11error':'');x.hidden=false;}}
async function load(){
 try{
  state=await store.state();
  if(state.onboarding)throw Error(text('መጀመሪያ መገለጫዎን ያጠናቅቁ','Complete your profile first'));
  // Only a minimal identity marker is cached; never cache organizational lists
  // or confidential backend records in offline session storage.
  sessionStorage.setItem('gaius.v11.offlineIdentity',JSON.stringify({at:Date.now(),me:{id:state.me.id,name:state.me.name,role:state.me.role,department:state.me.department,center:state.me.center}}));
 }catch(e){
  if(e.message!=='offline'||!store.hasSession())throw e;
  const cached=JSON.parse(sessionStorage.getItem('gaius.v11.offlineIdentity')||'null');
  if(!cached?.me||Date.now()-cached.at>86400000)throw Error(text('ያለ ኢንተርኔት መለያ ማረጋገጥ አልተቻለም','Offline identity expired; reconnect to verify'));
  state={me:cached.me,directory:[],v11:{records:[],files:[],capabilities:{}},offlineOnly:true};
  if(section==='overview'||section==='files')section='offline';
 }
 return state;
}
async function open(){try{await load();active=true;root.hidden=false;oldMain.style.display='none';render();}catch(e){active=false;alert(e.message);}}
function close(){active=false;root.hidden=true;oldMain.style.display='';}
launch.onclick=()=>active?close():open();
app.addEventListener('click',e=>{if(active&&(e.target.closest('button.nav')||e.target.closest('#logout')))close();},true);
window.addEventListener('online',()=>{if(active){alertMsg(text('ኢንተርኔት ተመልሷል፤ ያልተላኩ ረቂቆችን መላክ ይችላሉ','Online: pending drafts can now sync'));}});
const my=()=>state?.me||{};const caps=()=>state?.v11?.capabilities||{};const records=()=>state?.v11?.records||[];
const mine=()=>my().center?'center':my().department?'hq':'organization';
const appStrings={director:['የዳይሬክተር ሥራ','Director workspace'],analytics:['የማዕከላት ትንታኔ','Center analytics'],overview:['ዋና እይታ','Overview'],records:['ሥራ መዝገቦች','Operations'],files:['የሰነድ ማከማቻ','File uploads'],offline:['ያልተላኩ ረቂቆች','Offline drafts'],reference:['የድርጅት ስሞች','Official names']};
const tr=s=>appStrings[s]?(localLang()==='am'?appStrings[s][0]:appStrings[s][1]):s;
function frame(content){root.innerHTML=`<div class="v11wrap"><div class="v11top"><div class="v11identity"><img src="./icons/official-logo.jpg" class="v11logo" alt="GAIUS Ministry logo"><div><h1>Gaius Nexus <small>v11.1</small></h1><p>${text('የድርጅት አመራር፣ እቅድ፣ ሪፖርትና ክትትል','Ministry leadership, planning, reporting and follow-up')}</p></div></div><button type="button" class="btn ghost" data-v="close">${text('ወደ v10 ገጾች','Back to existing pages')}</button></div>
  <div class="v11nav">${Object.keys(appStrings).filter(x=>x==='director'?caps().director:x==='analytics'?(caps().director||caps().oversight):x==='records'?myAvailableKinds().length>0:x==='files'?(caps().canUploadFile||(state?.v11?.files||[]).length>0):true).map(x=>`<button class="${section===x?'on':''}" type="button" data-v="section" data-section="${x}">${tr(x)}</button>`).join('')}</div><div id="v11notice" class="v11notice" hidden></div><div class="v11content">${content}</div></div>`;}
function tile(title,value,desc=''){return `<div class="v11tile"><span>${escape(title)}</span><strong>${escape(value)}</strong><small>${escape(desc)}</small></div>`;}
function dashboard(){const all=records().filter(r=>r.kind!=='centers'&&r.kind!=='centerUnits');const approved=all.filter(r=>r.status==='approved'),pending=all.filter(r=>r.status==='submitted');
 const centers=records().filter(r=>r.kind==='centers'),month=records().filter(r=>r.kind==='monthly'),pulses=records().filter(r=>r.kind==='followups');
 const total=(k)=>pulses.filter(r=>r.status==='approved').reduce((a,r)=>a+(Number(r.data?.[k])||0),0);
 const today=new Date().toISOString().slice(0,10),in14=new Date(Date.now()+14*86400000).toISOString().slice(0,10);
 const incomplete=all.filter(r=>r.data?.due&&r.data.due<today&&r.status!=='approved'&&r.status!=='archived');
 const upcoming=all.filter(r=>{const due=r.data?.due||r.data?.date||r.data?.reviewDate||r.data?.next;return due&&due>=today&&due<=in14;}).slice(0,12);
 frame(`<div class="v11guide">${text('ይህ ዳሽቦርድ ከተፈቀዱ መዝገቦች ብቻ ይሰላል። ያልተላኩ ረቂቆች እና አሁን ያልተገናኙ ማዕከላት በቁጥሮች አይካተቱም።','Only authorized saved records contribute to this dashboard. Unsubmitted drafts and unintegrated center data are excluded.')}</div>
 <div class="v11tiles">${tile(text('የቀረቡ ጉዳዮች','Pending review'),pending.length)}${tile(text('የጸደቁ ጉዳዮች','Approved'),approved.length)}${tile(text('የማዕከላት መዝገብ','Centers'),centers.length)}${tile(text('ወርሃዊ ሪፖርቶች','Monthly reports'),month.length)}${tile(text('ያለፈ ቀነ ገደብ','Overdue'),incomplete.length)}${caps().director||caps().oversight?tile(text('የእሁድ ተሳታፊዎች ድምር','Sunday participants, recorded'),total('sundayProgram')):''}</div>
 <div class="v11box"><h2>${text('የቅርብ ጊዜ ሥራዎች','Recent activities')}</h2>${all.slice().sort((a,b)=>b.updatedAt.localeCompare(a.updatedAt)).slice(0,8).map(card).join('')||'<p>—</p>'}</div><div class="v11box"><h2>${text('በ14 ቀናት ውስጥ የሚደርሱ ስብሰባዎችና ሥራዎች','Upcoming meetings and deadlines (14 days)')}</h2>${upcoming.map(card).join('')||'<p>—</p>'}</div>`);
}
function myAvailableKinds(){return (caps().allowedKinds||[]).filter(k=>V11_KINDS[k]);}
const opts=(values,selected)=>values.map(([v,l])=>`<option value="${escape(v)}" ${String(v)===String(selected)?'selected':''}>${escape(l)}</option>`).join('');
function userOptions(cur){return opts([['','—'],...(state.directory||[]).map(u=>[u.id,u.name+' · '+(u.department||u.center||u.role)])],cur);}
function centerOptions(cur){const names=records().filter(r=>r.kind==='centers').map(r=>r.data.name);if(my().center&&!names.includes(my().center))names.push(my().center);return opts([['','—'],...names.map(s=>[s,s])],cur);}
function field(f,value=''){const [key,am,en,type,required]=f,label=escape(localLang()==='am'?am:en)+(required?' *':'');let control;
 const select=items=>`<select data-field="${key}" ${required?'required':''}>${opts(items,value)}</select>`;
 switch(type){
 case 'long':control=`<textarea data-field="${key}" rows="4" ${required?'required':''}>${escape(value)}</textarea>`;break;
 case 'focus':control=select([['','—'],...FOCUS.map(v=>[v[0],text(v[1],v[2])])]);break;
 case 'teachingunit':control=select([['','—'],...TEACHING_UNITS.map(x=>[x,x])]);break;
 case 'centerunit':control=select([['','—'],...CENTER_UNITS.map(u=>[u.id,text(u.am,u.en)])]);break;
 case 'center':control=select([['','—'],...records().filter(r=>r.kind==='centers').map(r=>[r.data.name,r.data.name]),...(my().center?[[my().center,my().center]]:[])]);break;
 case 'user':control=`<select data-field="${key}" ${required?'required':''}>${userOptions(value)}</select>`;break;
 case 'registrycenter':control=select([['','—'],...records().filter(r=>r.kind==='centers'&&r.status!=='archived').map(r=>[r.id,r.data.name+' · '+(r.data.location||'')])]);break;
 case 'city':control=select([['','—'],['addis_ababa','Addis Ababa / አዲስ አበባ'],['bishoftu','Bishoftu / Debre Zeit'],['other','Other / ሌላ']]);break;
 case 'department':control=select([['','—'],...HQ_UNITS.map(u=>[u.id,text(u.am,u.en)])]);break;
 case 'advisorytype':control=select([['','—'],['individual',text('የወር የአንድ አማካሪ ግንኙነት','Monthly individual contact')],['formal',text('መደበኛ የቦርድ ሪፖርት ስብሰባ','Formal board reporting meeting')]]);break;
 case 'progressStatus':control=select([['','—'],['not_started',text('አልተጀመረም','Not started')],['in_progress',text('በመካሄድ ላይ','In progress')],['completed',text('ተጠናቋል','Completed')],['blocked',text('ተገድቧል','Blocked')]]);break;
 case 'level':control=select([['','—'],['C','C / ሐ'],['B','B / ለ'],['A','A / ሀ']]);break;
 case 'slot':control=select([['','—'],['1','1'],['2','2']]);break;
 case 'meeting':control=select([['','—'],['sunday','Sunday'],['biweekly','Biweekly'],['special','Special']]);break;
 case 'attendance':control=select([['','—'],['present','Present'],['absent','Absent'],['late','Late'],['excused','Excused']]);break;
 case 'board':control=select([['','—'],['board','Board'],['advisory','Advisory Board']]);break;
 case 'manual':control=select([['','—'],['ministry','Ministry manual'],['teaching','Teaching roadmap'],['policy','Policy'],['other','Other']]);break;
 case 'readiness':control=select([['','—'],['developing','Developing'],['ready','Ready'],['review','Review needed']]);break;
 case 'priority':control=select([['','—'],['high','High'],['normal','Normal'],['low','Low']]);break;
 default:control=`<input data-field="${key}" type="${type==='number'?'number':type==='month'?'month':type==='date'?'date':'text'}" ${type==='number'?'min="0" step="any"':''} value="${escape(value)}" ${required?'required':''}>`;
 }
 return `<label class="v11field"><span>${label}</span>${control}</label>`;
}
function scopeForm(rec){const director=caps().director;
 const choices=director?[['organization',text('ለድርጅት','Organization')],['hq','HQ'],['center',text('ማዕከል','Center')],['personal',text('የግል','Personal')]]:my().center?[['center',text('የራሴ ማዕከል','My center')]]:my().department?[['hq',text('የራሴ ክፍል','My HQ department')]]:[['organization',text('ድርጅት','Organization')]];
 let sc=rec?.scopeType||(V11_KINDS[kind].personalOnly?'personal':choices[0][0]);if(V11_KINDS[kind].centerOnly)sc='center';
 const id=rec?.scopeId||(sc==='personal'?my().id:sc==='hq'?my().department:sc==='center'?my().center:'org');
 const deptOpts=[...HQ_UNITS.map(u=>[u.en,text(u.am,u.en)]),...(my().department?[[my().department,my().department]]:[])];
 const selectors=director?`<label class="v11field"><span>${text('የውሂብ ወሰን','Scope')}</span><select id="v11Scope">${opts(V11_KINDS[kind].centerOnly?choices.filter(x=>x[0]==='center'):V11_KINDS[kind].personalOnly?choices.filter(x=>x[0]==='personal'):choices,sc)}</select></label>`:'<input type="hidden" id="v11Scope" value="'+sc+'">';
 const unit=director?`<label class="v11field"><span>${text('የሚመለከተው ክፍል/ማዕከል','Assigned unit / center')}</span><input id="v11ScopeId" value="${escape(id)}" placeholder="${text('የማዕከሉ ስም ወይም የክፍሉ ስም','Center or department name')}"></label>`:`<input type="hidden" id="v11ScopeId" value="${escape(id)}">`;
 return selectors+unit;
}
const SPECIAL_FIELDS=new Set(Object.values(NEXUS_DEPARTMENT_FIELDS).flat().map(x=>x[0]));
function reportFields(rec){
 if(kind!=='monthly')return V11_KINDS[kind].fields.map(f=>field(f,rec?.data?.[f[0]]??'')).join('');
 const unit=rec?.data?.departmentType||HQ_UNITS.find(u=>u.en===my().department||u.id===my().department)?.id||'';
 const common=V11_KINDS.monthly.fields.filter(f=>!SPECIAL_FIELDS.has(f[0]));
 return common.map(f=>f[0]==='departmentType'?`<label class="v11field"><span>${text('የክፍሉ የሪፖርት ዓይነት','Department template')}</span><select id="v11DepartmentType" data-field="departmentType">${opts([['','—'],...HQ_UNITS.map(u=>[u.id,text(u.am,u.en)])],unit)}</select></label>`:field(f,rec?.data?.[f[0]]??'')).join('')+
 `<div id="v11DeptExtras" class="v11extras">${(NEXUS_DEPARTMENT_FIELDS[unit]||[]).map(f=>field(f,rec?.data?.[f[0]]??'')).join('')}</div>`;
}
function formHTML(rec){return `<div class="v11box><h2>${rec?text('ረቂቅ ማስተካከያ','Edit draft'):text('አዲስ መዝገብ','New record')} — ${text(V11_KINDS[kind].am,V11_KINDS[kind].en)}</h2><p class="v11guide">${text('እቅዶችና ሪፖርቶች መጀመሪያ እንደ ረቂቅ ይቀመጣሉ፤ ለማጽደቅ በተለየ አዝራር ያስገቡ። ያለ ኢንተርኔት ረቂቆች በዚህ መሣሪያ ይቀመጣሉ።','Save drafts first, then submit them for approval. Offline drafts remain on this device until synced.')}</p><form id="v11form"><div class="v11fields">${scopeForm(rec)}${reportFields(rec)}</div><div class="v11actions"><button class="btn" type="submit">${text('ረቂቅ አስቀምጥ','Save draft')}</button><button class="btn ghost" type="button" data-v="cancel">${text('ሰርዝ','Cancel')}</button></div></form></div>`;}
function card(r){const def=V11_KINDS[r.kind]||{},data=r.data||{};const title=data.title||data.name||data.activity||data.topic||data.member||(r.kind==='visits'?records().find(x=>x.id===data.centerRecordId)?.data?.name:'')||def.am||r.kind;
 const allowEdit=(r.status==='draft'||r.status==='revision_requested')&&(caps().director||r.ownerId===my().id);
 const canReview=(caps().director||caps().canApprove)&&r.status==='submitted'&&r.scopeType!=='personal';
 const fields=r.kind==='monthly'?[['Activity',data.activity],['Planned',data.planned],['Achieved',data.achieved],['Performance',safePerformance(data.planned,data.achieved)===null?'N/A':safePerformance(data.planned,data.achieved).toFixed(1)+'%'],['Focus',data.focus],['Key Result',data.result],['Challenge',data.challenge],['Next Action',data.next]]:Object.entries(data).filter(([,v])=>v!==''&&v!=null).slice(0,4);
 const actions=[];
 if(allowEdit)actions.push(`<button type="button" data-v="edit" data-id="${r.id}">${text('አርትዕ','Edit')}</button>`);
 if(!['visits','directorGoals'].includes(r.kind)&&(r.ownerId===my().id||caps().director)&&['draft','revision_requested'].includes(r.status))actions.push(`<button type="button" data-v="transition" data-id="${r.id}" data-decision="submit">${text('ለማጽደቅ ላክ','Submit')}</button>`);
 if(canReview){actions.push(`<button type="button" data-v="transition" data-id="${r.id}" data-decision="approve">${text('አጽድቅ','Approve')}</button>`,`<button type="button" data-v="transition" data-id="${r.id}" data-decision="revision_requested">${text('ማሻሻያ ጠይቅ','Request changes')}</button>`);}
 if(r.kind==='visits'&&r.ownerId===my().id&&['draft','revision_requested'].includes(r.status))actions.push(`<button type="button" data-v="completeVisit" data-id="${r.id}">${text('ጉብኝት ተጠናቋል','Mark visit completed')}</button>`);
 if(r.status==='approved'&&(caps().director||r.ownerId===my().id))actions.push(`<button type="button" data-v="transition" data-id="${r.id}" data-decision="revise">${text('አዲስ ቅጂ','New revision')}</button>`);
 if(caps().director)actions.push(`<button type="button" data-v="transition" data-id="${r.id}" data-decision="archive">${text('ማህደር','Archive')}</button>`);
 if(['monthly','plans6','followups','manuals','directorGoals','visits'].includes(r.kind))actions.push(`<button type="button" data-v="export" data-id="${r.id}" data-as="docx">Word</button>`,`<button type="button" data-v="export" data-id="${r.id}" data-as="pdf">PDF</button>`);
 return `<article class="v11record" data-id="${escape(r.id)}"><div class="v11recordhead"><h3>${escape(title)}</h3><span class="v11status">${statusText(r.status)}</span></div><p class="v11muted">${escape(text(def.am,def.en))} · ${scopeLabel(r.scopeType)} ${escape(r.scopeId||'')} · ${escape(r.ownerName||'')} · ${escape((r.updatedAt||'').slice(0,10))}</p>${(data.fileId||data.photoFileId)?`<div class="v11gallery"><img data-v11-media="${escape(data.fileId||data.photoFileId)}" alt="Approved report evidence / member photo" hidden><small>${text('የተፈቀደ ማስረጃ ፎቶ','Approved evidence photo')}</small></div>`:''}<div class="v11summary">${fields.map(([k,v])=>`<p><b>${escape(k)}:</b> ${escape(String(v??'—').slice(0,500))}</p>`).join('')}</div><details><summary>${text('ሙሉ መረጃ / የታሪክ ማስታወሻ','Full details / review history')}</summary>${Object.entries(data).map(([k,v])=>`<p><b>${escape(k)}:</b> ${escape(v)}</p>`).join('')}<p>${r.history?.map(e=>escape(e.action+' · '+e.byName+' · '+e.at.slice(0,16)+' '+(e.note||''))).join(' | ')||''}</p></details><div class="v11actions">${actions.join('')}</div></article>`;
}
function recordsScreen(){const list=myAvailableKinds(),def=V11_KINDS[kind];if(!list.includes(kind))kind=list[0]||'plans6';
 if(!list.length){frame(`<div class="v11box"><p>${text('ለዚህ ሚና የሥራ መዝገብ ማስገባት አልተፈቀደም።','No record-editing modules are assigned to this role.')}</p></div>`);return;}
 const chosen=records().filter(r=>r.kind===kind&&r.status!=='archived').sort((a,b)=>b.updatedAt.localeCompare(a.updatedAt));
 frame(`<div class="v11box"><label class="v11field"><span>${text('የሥራ ክፍል ምረጥ','Choose module')}</span><select id="v11Kind">${opts(list.map(x=>[x,text(V11_KINDS[x].am,V11_KINDS[x].en)]),kind)}</select></label><p class="v11guide">${kind==='manuals'?text('የጋይዮስ መመሪያንና የትምህርት ሂደትን በሙሉ ጽሑፍ በዚህ ገጽ ይያዙ። የግል ሰነዶችን በይፋ ወደ GitHub አትጫኑ።','Import the complete manual and teaching roadmap securely here. Do not publish confidential source documents in GitHub.'):text('በአማርኛና English የሚሠራ የተዋቀረ መዝገብ።','Structured bilingual records.')}</p></div>${formHTML(editing)}<div class="v11box"><h2>${text('የተፈቀዱ መዝገቦች','Visible records')} (${chosen.length})</h2>${chosen.map(card).join('')||'<p class="v11muted">'+text('ገና መዝገብ የለም','No records yet')+'</p>'}</div>${kind==='monthly'&&caps().director?legacyReports():''}`);
}
function legacyReports(){const items=window.GAIUS_V10?.originals||[];return `<div class="v11box"><h2>${text('የv10 የጥቅምት ስድስት ኦሪጅናል ሪፖርቶች','Six preserved v10 October source reports')}</h2><p class="v11guide">${text('ይህ የታሪካዊ ጽሑፍ ነው፤ አዲስ ሪፖርት አይደለም።','Historical originals, not newly submitted reports.')}</p>${items.map((r,i)=>`<article class="v11record"><h3>${escape(localLang()==='am'?r.amTitle:r.enTitle)}</h3><details><summary>${text('ይዘት አሳይ','Show content')}</summary><pre class="v11body">${escape(localLang()==='am'?r.am:r.en)}</pre></details><button type="button" data-v="legacy-export" data-legacy="${i}" data-as="docx">Word</button> <button type="button" data-v="legacy-export" data-legacy="${i}" data-as="pdf">PDF</button></article>`).join('')}</div>`;}
function filesScreen(){const files=state.v11.files||[];const sc=my().center?'center':my().department?'hq':'organization',id=my().center||my().department||'org';
 frame(`<div class="v11box"><h2>${text('ሰነድ፣ ፎቶ እና ቪዲዮ','Secure document and media uploads')}</h2><p class="v11guide">${text('ሰነዶች በአገልግሎት በጋራ ከመታየታቸው በፊት ማጽደቅ ይፈልጋሉ። ይህ ለመሥራት Cloudflare R2 ማዋቀር አለበት።','Files require admin approval before shared publication. Configure Cloudflare R2 storage for uploads.')}</p><form id="v11Upload"><label class="v11field"><span>PDF / DOCX / JPG / PNG / WEBP / MP4 / TXT (max 10 MB)</span><input type="file" id="v11File" required accept=".pdf,.docx,.jpg,.jpeg,.png,.webp,.mp4,.txt"></label>${caps().director?`<label class="v11field"><span>${text('የፋይሉ ሚስጥራዊነት','File access scope')}</span><select id="v11FileScope"><option value="personal">${text('የግል — ለእኔ ብቻ','Personal — owner only')}</option><option value="organization">${text('ለድርጅቱ — ከጸደቀ በኋላ','Organization — after approval')}</option></select></label>`:`<input type="hidden" id="v11FileScope" value="${sc}">`}<input type="hidden" id="v11FileUnit" value="${escape(caps().director?my().id:id)}"><button class="btn" type="submit">${text('ለማጽደቅ ጫን','Upload for review')}</button></form></div><div class="v11box"><h2>${text('የተፈቀዱ የእኔ ፋይሎች','Accessible files')} (${files.length})</h2>${files.map(f=>`<article class="v11record"><h3>${escape(f.name)}</h3><p>${statusText(f.status)} · ${(f.size/1024).toFixed(0)} KB · ${scopeLabel(f.scopeType)}</p><div class="v11actions"><button type="button" data-v="download" data-id="${f.id}">${text('አውርድ','Download')}</button>${caps().director||caps().canApprove?`<button type="button" data-v="fileReview" data-id="${f.id}" data-decision="approved">${text('አጽድቅ','Approve')}</button><button type="button" data-v="fileReview" data-id="${f.id}" data-decision="rejected">${text('ውድቅ','Reject')}</button><button type="button" data-v="fileReview" data-id="${f.id}" data-decision="removed">${text('አስወግድ','Remove')}</button>`:''}</div></article>`).join('')||'<p>—</p>'}</div>`);
}
const DBNAME='gaius-v11-local-drafts', STORE='drafts';
function draftDb(){return new Promise((resolve,reject)=>{const r=indexedDB.open(DBNAME,1);r.onupgradeneeded=()=>r.result.createObjectStore(STORE,{keyPath:'id'});r.onsuccess=()=>resolve(r.result);r.onerror=()=>reject(r.error);});}
async function pending(){const d=await draftDb();return new Promise((resolve,reject)=>{const tr=d.transaction(STORE,'readonly');const q=tr.objectStore(STORE).getAll();q.onsuccess=()=>{const all=q.result.filter(x=>x.ownerId===my().id);d.close();resolve(all);};q.onerror=()=>reject(q.error);});}
async function draftPut(data){const d=await draftDb();return new Promise((resolve,reject)=>{const tr=d.transaction(STORE,'readwrite');tr.objectStore(STORE).put(data);tr.oncomplete=()=>{d.close();resolve();};tr.onerror=()=>reject(tr.error);});}
async function draftDelete(id){const d=await draftDb();return new Promise((resolve,reject)=>{const tr=d.transaction(STORE,'readwrite');tr.objectStore(STORE).delete(id);tr.oncomplete=()=>{d.close();resolve();};tr.onerror=()=>reject(tr.error);});}
async function offlineScreen(){const drafts=await pending();frame(`<div class="v11box"><h2>${text('በስልኩ ያሉ ረቂቆች','Offline drafts')} (${drafts.length})</h2><p class="v11guide">${text('ያለ ኢንተርኔት ረቂቆች በዚህ ስልክ ውስጥ ይቀመጣሉ። በተጋራ ስልክ ላይ ሚስጥራዊ መረጃ አታስቀምጡ። እስኪመሳሰሉ ድረስ የተላኩ አይደሉም።','Drafts are stored on this device, not encrypted. Avoid confidential content on shared devices. They are not submitted until synced.')}</p><button class="btn" type="button" data-v="sync">${text('ያልተላኩትን መልስ ላክ','Sync pending drafts')}</button>${drafts.map(x=>`<div class="v11record"><b>${escape(V11_KINDS[x.kind]?.am||x.kind)}</b><p>${escape(x.data?.title||x.data?.activity||x.data?.topic||x.id)}</p><small>${escape(x.createdAt)}</small><button type="button" data-v="dropDraft" data-id="${x.id}">${text('የስልኩን ረቂቅ ሰርዝ','Discard local draft')}</button></div>`).join('')||'<p>—</p>'}</div>`);}
function reference(){frame(`<div class="v11box"><h2>${text('የተረጋገጠ የHQ ክፍል መጠሪያ ዝርዝር','Source-aligned HQ departments')}</h2>${HQ_UNITS.map(x=>`<p><b>${escape(x.am)}</b> — ${escape(x.en)} ${x.unverified?'('+text('ስም ይረጋገጥ','name to confirm')+')':''}</p>`).join('')}</div><div class="v11box"><h2>${text('የማዕከል ክፍሎች','Center departments')}</h2>${CENTER_UNITS.map(x=>`<p><b>${escape(x.am)}</b> — ${escape(x.en)}</p>`).join('')}</div><div class="v11box"><h2>${text('የትምህርት ሂደት ሰባት ክፍሎች','Teaching roadmap units')}</h2>${TEACHING_UNITS.map((x,i)=>`<p>${i+1}. ${escape(x)}</p>`).join('')}<p class="v11guide">${text('የመጀመሪያውን ሙሉ ሰነድ በOperations → Master Documents ውስጥ በዳይሬክተር ፈቃድ ያስገቡ።','The full source can be securely pasted and versioned in Operations → Master Documents by an authorized Director.')}</p></div>`);}
const safeNum=n=>Number.isFinite(Number(n))?Number(n):0;
const fmt=n=>new Intl.NumberFormat(localLang()==='am'?'en-US':'en-US').format(Number(n)||0);
function barList(items,valueKey='total',isCenter=true){
 const max=Math.max(1,...items.map(r=>Number(r[valueKey])||0));
 return items.length?`<div class="nexusbars">${items.map(r=>`<div class="nexusbar"><button type="button" class="nexusbarlabel" data-v="showCenter" data-center="${escape(r.name)}" ${isCenter?'':'disabled'}>${escape(r.name)}</button><div class="nexusbartrack"><div class="nexusbarfill" style="width:${Math.max(0,Math.min(100,(Number(r[valueKey])||0)*100/max))}%"></div></div><b>${fmt(r[valueKey])}</b></div>`).join('')}</div>`:`<p class="v11muted">${text('የተረጋገጠ መረጃ የለም','No verified data')}</p>`;
}
function sundayLine(weekly){
 if(!weekly.length)return `<p class="v11muted">${text('የተረጋገጠ የእሁድ ተሳትፎ መረጃ የለም','No verified Sunday attendance data')}</p>`;
 const last=weekly.slice(-10),w=640,h=170,pad=30,max=Math.max(1,...last.map(x=>x.attendance));
 const coords=last.map((x,i)=>[pad+(w-2*pad)*(last.length===1?.5:i/(last.length-1)),h-pad-(h-2*pad)*x.attendance/max]);
 const points=coords.map(([x,y])=>`${x.toFixed(1)},${y.toFixed(1)}`).join(' ');
 return `<svg viewBox="0 0 ${w} ${h}" role="img" aria-label="Weekly Sunday attendance" class="nexusline"><path d="M${pad},${h-pad} L${w-pad},${h-pad}" stroke="#cbd9d3"/><polyline fill="none" stroke="#167454" stroke-width="4" stroke-linejoin="round" points="${points}"/>${coords.map(([x,y],i)=>`<circle cx="${x}" cy="${y}" r="5" fill="#167454"><title>${escape(last[i].week)}: ${fmt(last[i].attendance)}</title></circle>`).join('')}</svg><div class="nexuslegend">${escape(last[0].week)} — ${escape(last[last.length-1].week)}</div>`;
}
function directorScreen(){
 if(!caps().director){section='overview';dashboard();return;}
 const goal=records().filter(r=>r.kind==='directorGoals'&&r.ownerId===my().id),sourceTotal=goal.reduce((sum,r)=>sum+safeNum(r.sourceSnapshot?.budget??r.data?.budget),0);
 const visits=visitCompliance(records()),today=new Date().toISOString().slice(0,10);
 const advisory=records().filter(r=>r.kind==='advisoryMeetings');
 const month=today.slice(0,7);const personalContacts=advisory.filter(r=>r.data?.engagementType==='individual'&&r.data?.date?.slice(0,7)===month&&r.status==='approved');
 const formal=advisory.filter(r=>r.data?.engagementType==='formal'&&r.status==='approved');
 const responsibilities=[
 [text('የድርጅት ራዕይና መመሪያ','Vision and organizational governance'),'directorGoals'],
 [text('የHQ ክፍሎች ክትትል','HQ departmental reviews'),'monthly'],
 [text('የማዕከላት ጉብኝት','Center leadership visits'),'visits'],
 [text('የመሪዎች እድገትና ተተኪነት','Mentorship and succession'),'succession'],
 [text('የትምህርትና የሰነድ ልማት','Teaching and document development'),'teaching'],
 [text('የአማካሪ ቦርድ ስብሰባ','Advisory board engagement'),'advisoryMeetings'],
 [text('ፋይናንስና ሀብት ማሰባሰብ','Finance and resource mobilization'),'initiatives'],
 [text('አጋርነትና አዲስ ማዕከላት','Partnerships and center establishment'),'tasks']];
 frame(`<div class="v11guide">${text('የCountry Director የግል ሥራ መዝገቦች ለባለቤታቸው ብቻ ይታያሉ። ለስልታዊ ዕቅድ ሰነዱ በግል ማስገባት ያስፈልጋል።','Country Director personal records are owner-only. The original plan must be imported privately; it is never embedded in public source code.')}</div>
 <div class="v11tiles">${tile(text('የስልታዊ ግቦች','Strategic objectives'),goal.length?goal.length:text('አልተጫነም','Not imported'))}${tile(text('የመጀመሪያው በጀት','Source budget'),goal.length?fmt(sourceTotal)+' ETB':'No data')}${tile(text('በዚህ ወር የተጎበኙ ማዕከላት','Centers meeting visit target'),visits.filter(x=>x.completed).length+' / '+visits.filter(x=>x.frequency).length)}${tile(text('የወሩ የአማካሪ ግንኙነት','Individual advisory contact this month'),personalContacts.length)}</div>
 ${my().role==='country_director'&&goal.length===0?`<div class="v11box"><h2>${text('የመጀመሪያውን 16 የ6 ወር እቅዶች አስገባ','Import original 16-objective six-month plan')}</h2><p class="v11guide">${text('የግል JSON ፋይሉን ከChatGPT ውስጥ ወደ መሣሪያህ አውርድ። በPublic GitHub ላይ አትጫን። በእውነተኛ Backend ሲገናኝ ብቻ ይህን ያስገባ።','Select the separate private plan JSON file. Never upload it to the public GitHub repository. Import requires the live authenticated backend.')}</p><form id="nexusPlanImport"><input type="file" accept=".json,application/json" id="nexusPlanFile" required><button class="btn" type="submit" ${store.shared?'':'disabled'}>${text('የግል እቅድ አስገባ','Import privately')}</button></form></div>`:''}
 <div class="v11box"><h2>${text('የዳይሬክተር ዋና ኃላፊነቶች','Director responsibilities')}</h2><div class="nexusresponsibilities">${responsibilities.map(([title,k])=>`<button type="button" class="nexusaction" data-v="openKind" data-kind="${k}">${escape(title)} <span>›</span></button>`).join('')}</div></div>
 <div class="v11box"><h2>${text('የማዕከላት ጉብኝት ዝርዝር','Center visit compliance')}</h2><p class="v11muted">${text('አዲስ አበባ በየወሩ፤ ቢሾፍቱ በሁለት ወር። ማዕከሉ በCenter Registry መመዝገብ አለበት።','Addis Ababa monthly; Bishoftu every two months. Centers must first be entered in the registry.')}</p>${visits.map(x=>`<article class="v11record"><b>${escape(x.name)}</b> · ${x.frequency?x.frequency+' month(s)':text('የጉብኝት ጊዜ አልተወሰነም','Frequency unspecified')}<p>${text('ሁኔታ','Status')}: ${escape(x.status.replaceAll('_',' '))} · ${text('የመጨረሻው ጉብኝት','Last visit')}: ${escape(x.latest||'No data')} · ${text('የቀጣዩ ጊዜ','Due')}: ${escape(x.due||'—')}</p></article>`).join('')||`<p>${text('ማዕከላት ገና አልተመዘገቡም','No center registry data')}</p>`}<button type="button" class="btn" data-v="openKind" data-kind="visits">${text('ጉብኝት መዝግብ','Record visit')}</button></div>
 <div class="v11box"><h2>${text('የአማካሪ ቦርድ ክትትል','Advisory engagement')}</h2><p>${text('የወርሃዊ የአንድ አባል ግንኙነት','Individual monthly contacts')}: ${personalContacts.length}; ${text('መደበኛ የቦርድ ስብሰባዎች','Formal meetings recorded')}: ${formal.length}</p><button type="button" class="btn" data-v="openKind" data-kind="advisoryMeetings">${text('የስብሰባ መዝገብ','Manage meetings')}</button></div>`);
}
function analyticsScreen(){
 if(!caps().director&&!caps().oversight){section='overview';dashboard();return;}
 const all=records();const filter=analysisFilters;
 const base=all.filter(r=>r.kind==='monthly'&&r.status!=='archived');
 const m=base.filter(r=>(!filter.month||r.data.month===filter.month)&&(!filter.center||r.scopeId===filter.center)&&(!filter.department||r.data?.departmentType===filter.department)&&(!filter.ethiopianYear||r.data.ethiopianYear===filter.ethiopianYear)&&(!filter.ethiopianMonth||r.data.ethiopianMonth===filter.ethiopianMonth)&&(!filter.startDate||r.data.activityDate>=filter.startDate)&&(!filter.endDate||r.data.activityDate<=filter.endDate)&&(!filter.focus||r.data.focus===filter.focus)&&(!filter.status||r.status===filter.status));
 const f=all.filter(r=>r.kind==='followups'&&r.status==='approved'&&(!filter.center||r.scopeId===filter.center)&&(!filter.month||r.data.week?.slice(0,7)===filter.month));
 const centers=all.filter(r=>r.kind==='centers').map(x=>x.data.name).filter(Boolean), uniq=[...new Set([...centers,...base.filter(x=>x.scopeType==='center').map(x=>x.scopeId)])].sort();
 const stats=indicators([...m,...f]);
 const comparable=compatiblePlannedActual(m,filter.unit).filter(x=>!filter.center||x.center===filter.center);
 const approved=m.filter(r=>r.status==='approved');
 const targets=comparable.filter(x=>x.ratio!==null);
 const values=stats.byCenter;
 const statuses=[['Draft',m.filter(x=>x.status==='draft').length],['Submitted',m.filter(x=>x.status==='submitted').length],['Approved',approved.length],['Changes requested',m.filter(x=>x.status==='revision_requested').length]];
 const yearOptions=[...new Set(base.map(x=>x.data.ethiopianYear).filter(Boolean))].sort();
 const ethMonthOptions=[...new Set(base.map(x=>x.data.ethiopianMonth).filter(Boolean))].sort();
 const filterSelect=(key,options)=>`<label class="v11field"><span>${escape(key)}</span><select data-analytics-filter="${key}">${opts(options,filter[key]||'')}</select></label>`;
 // Use stable machine field keys to avoid language-dependent filter bindings.
 const select=(key,label,options)=>`<label class="v11field"><span>${escape(label)}</span><select data-analytics-filter="${key}">${opts(options,filter[key]||'')}</select></label>`;
 frame(`<div class="v11guide">${text('ገብተው ከጸደቁ መረጃዎች ብቻ ቻርቶች ይዘጋጃሉ። መረጃ ከሌለ «No Data» ይታያል።','Charts are built only from entered, approved evidence; absent values show No Data.')}</div>
 <div class="v11box"><h2>${text('የመረጃ ማጣሪያ','Analytics filters')}</h2><div class="v11fields">${select('month',text('ወር','Month'),[['',text('ሁሉም','All')],...[...new Set(base.map(x=>x.data.month).filter(Boolean))].sort().reverse().map(x=>[x,x])])}${select('center',text('ማዕከል','Center'),[['',text('ሁሉም','All')],...uniq.map(x=>[x,x])])}${select('department',text('HQ ክፍል','HQ Department'),[['',text('ሁሉም','All')],...HQ_UNITS.map(x=>[x.id,text(x.am,x.en)])])}${select('ethiopianYear',text('የኢትዮጵያ ዓመት','Ethiopian year'),[['',text('ሁሉም','All')],...yearOptions.map(x=>[x,x])])}${select('ethiopianMonth',text('የኢትዮጵያ ወር','Ethiopian month'),[['',text('ሁሉም','All')],...ethMonthOptions.map(x=>[x,x])])}${`<label class="v11field"><span>${text('ከዚህ ቀን','From activity date')}</span><input type="date" data-analytics-filter="startDate" value="${escape(filter.startDate)}"></label><label class="v11field"><span>${text('እስከዚህ ቀን','To activity date')}</span><input type="date" data-analytics-filter="endDate" value="${escape(filter.endDate)}"></label>`}${select('focus',text('የስልታዊ ትኩረት','Focus'),[['',text('ሁሉም','All')],...FOCUS.map(x=>[x[0],text(x[1],x[2])])])}${select('status',text('ሁኔታ','Status'),[['',text('ሁሉም','All')],['draft','Draft'],['submitted','Submitted'],['approved','Approved'],['revision_requested','Changes requested']])}${select('unit',text('ተመሳሳይ የመለኪያ ክፍል','Comparable indicator unit'),[['',text('ምረጥ','Select unit')],...[...new Set(base.map(r=>r.data.indicatorUnit).filter(Boolean))].map(x=>[x,x])])}</div></div>
 <div class="v11tiles">${tile(text('የተመዘገቡ ሪፖርቶች','Reports'),m.length)}${tile(text('የጸደቁ ሪፖርቶች','Approved reports'),approved.length)}${tile(text('ማጽደቅ የሚጠብቁ','Pending approval'),m.filter(r=>r.status==='submitted').length)}${tile(text('ያልተጠቀሰ እቅድ ያላቸው','Approved reports lacking targets'),approved.filter(r=>!r.data.planned&&r.data.planned!==0).length)}</div>
 <div class="v11box"><h2>${text('በእሁድ ተሳትፎ የማዕከላት ንጽጽር','Center Sunday attendance (reported sum)')}</h2>${barList(values)}</div>
 <div class="v11box"><h2>${text('የእሁድ ተሳትፎ የሳምንት አዝማሚያ','Weekly Sunday attendance trend')}</h2>${sundayLine(stats.weekly)}</div>
 <div class="v11box"><h2>${text('ተመሳሳይ የመለኪያ ክፍል፦ እቅድ እና አፈጻጸም','Same-unit plan versus achievement')}</h2>${targets.length?targets.map(x=>`<div class="v11record"><b>${escape(x.activity)}</b><p>${escape(x.center)} · ${x.ratio.toFixed(1)}%</p><div class="nexusdual"><small>${text('የታቀደ','Planned')}: ${fmt(x.planned)}</small><div class="nexusbartrack"><div class="nexusbarfill" style="width:100%;background:#96bca5"></div></div><small>${text('የተከናወነ','Achieved')}: ${fmt(x.achieved)}</small><div class="nexusbartrack"><div class="nexusbarfill" style="width:${Math.min(100,x.ratio)}%"></div></div></div></div>`).join(''):`<p>${text('ተመሳሳይ መለኪያ ምረጥ፤ የሚነጻጸር የጸደቀ መረጃ የለም','Select a comparable indicator unit; no verified matched data.')}</p>`}</div>
 <div class="v11box"><h2>${text('የሪፖርት ሁኔታ','Report statuses')}</h2>${statuses.map(([label,n])=>`<p><b>${escape(label)}</b>: ${fmt(n)}</p>`).join('')}</div>
 ${selectedCenter?`<div class="v11box"><h2>${text('የተመረጠ ማዕከል','Selected center')}: ${escape(selectedCenter)}</h2>${all.filter(r=>r.scopeType==='center'&&r.scopeId===selectedCenter&&['monthly','followups'].includes(r.kind)&&r.status==='approved').map(card).join('')||'<p>No Data</p>'}</div>`:''}`);
}
async function render(){if(!active)return;
 const appNow=localLang();launch.textContent='✦ '+(appNow==='am'?'ጋይዮስ ኔክሰስ':'Gaius Nexus');
 if(section==='director')directorScreen();else if(section==='analytics')analyticsScreen();else if(section==='overview')dashboard();else if(section==='records')recordsScreen();else if(section==='files')filesScreen();else if(section==='offline')await offlineScreen();else reference();
 if(state.offlineOnly)alertMsg(text('ያለ ኢንተርኔት የረቂቅ ሁኔታ ብቻ ነው። የኦንላይን መረጃ አልተጫነም።','Offline draft-only mode; no live organizational data is loaded.'));
 await loadMediaPreviews();}
async function loadMediaPreviews(){for(const img of root.querySelectorAll('img[data-v11-media]')){const f=state.v11.files?.find(f=>f.id===img.dataset.v11Media);if(!f||!f.type.startsWith('image/'))continue;try{const blob=await store.downloadFile(f.id);const url=URL.createObjectURL(blob);img.src=url;img.hidden=false;img.onload=()=>setTimeout(()=>URL.revokeObjectURL(url),1000*60*2);}catch{}}}
async function update(){await load();await render();}
async function withBusy(fn){if(queueBusy)return;queueBusy=true;try{await fn();}catch(e){alertMsg(e.message,true);}finally{queueBusy=false;}}
function serializedForm(){const form=$('v11form');if(!form.reportValidity())return null;
 const payload={kind,scopeType:$('v11Scope').value,scopeId:$('v11ScopeId').value.trim(),data:{}};
 for(const el of form.querySelectorAll('[data-field]'))payload.data[el.dataset.field]=el.value;
 if(editing){payload.id=editing.id;payload.version=editing._v;}
 return payload;
}
async function saveRecord(){const data=serializedForm();if(!data)return;
 if(!navigator.onLine && store.shared){if(['succession','followups','centerAttendance','board','advisoryMeetings','manuals','directorGoals','visits'].includes(kind))throw Error(text('ይህ ሚስጥራዊ መዝገብ ያለ ኢንተርኔት አይቀመጥም','This restricted record cannot be stored offline'));
  await draftPut({...data,id:crypto.randomUUID(),ownerId:my().id,createdAt:new Date().toISOString(),isLocal:true});editing=null;section='offline';await render();alertMsg(text('በዚህ ስልክ እንደ ረቂቅ ተቀምጧል','Saved as a local draft'));return;}
 try{await store.command('v11.save',data);editing=null;await update();alertMsg(text('ረቂቅ ተቀምጧል','Draft saved'));}
 catch(e){if(e.message==='offline'&&!data.id&&!['succession','followups','centerAttendance','board','advisoryMeetings','manuals','directorGoals','visits'].includes(kind)){
   await draftPut({...data,id:crypto.randomUUID(),ownerId:my().id,createdAt:new Date().toISOString(),isLocal:true});editing=null;section='offline';await render();alertMsg(text('በመሣሪያው ተቀምጧል','Saved locally for later sync'));return;
  }throw e;}
}
async function transition(id,decision){const item=records().find(r=>r.id===id);if(!item)throw Error('missing');
 let note='';if(decision==='revision_requested')note=prompt(text('የማሻሻያ ምክንያት ጻፍ','Describe required changes'))||'';
 if(decision==='archive'&&!confirm(text('ወደ ማህደር ልታስገባ?','Archive this record?')))return;
 const result=await store.command('v11.transition',{id,version:item._v,decision,note});await update();
 if(decision==='revise'){kind=item.kind;editing=records().find(r=>r.id===result.id);section='records';render();}
 else alertMsg(text('ሁኔታው ተቀይሯል','Status updated'));
}
function exportRecord(id,format){const item=records().find(x=>x.id===id);if(!item)throw Error('missing');
 const def=V11_KINDS[item.kind];const title=item.data.title||item.data.activity||def.en;
 const rows=[[text('የሪፖርት ዓይነት','Type'),text(def.am,def.en)],[text('ሁኔታ','Status'),statusText(item.status)],[text('የክፍል/ማዕከል መረጃ','Unit'),item.scopeType+' / '+item.scopeId],[text('አቅራቢ','Submitted by'),item.ownerName],...def.fields.map(f=>[text(f[1],f[2]),item.data[f[0]]])];
 const name=validFileName(title)+'.'+format;saveDownload(format==='pdf'?makePdf(title,rows):makeDocx(title,rows),name);
}
function exportLegacy(i,format){const item=window.GAIUS_V10.originals[i];if(!item)return;
 const title=localLang()==='am'?item.amTitle:item.enTitle;
 const rows=[['Original reporting period','October 2026'],['Source','GAIUS v10 archived original'],['Full original report',localLang()==='am'?item.am:item.en]];
 saveDownload(format==='pdf'?makePdf(title,rows):makeDocx(title,rows),validFileName(title)+'.'+format);
}
async function sync(){if(!navigator.onLine)throw Error('offline');const drafts=await pending();if(!drafts.length){alertMsg(text('ያልተላከ ረቂቅ የለም','No pending drafts'));return;}
 let count=0;for(const draft of drafts){const {id,ownerId,createdAt,isLocal,...payload}=draft;
  try{await store.command('v11.save',payload);await draftDelete(id);count++;}
  catch(e){alertMsg(text('አንዳንድ ረቂቆች አልተላኩም','Some drafts were not synced')+': '+e.message,true);break;}}
 await update();alertMsg(text('የተመሳሰሉ ረቂቆች','Drafts synced')+': '+count);
}
root.addEventListener('submit',e=>{e.preventDefault();withBusy(async()=>{
 if(e.target.id==='v11form')await saveRecord();
 if(e.target.id==='nexusPlanImport'){
  if(!store.shared)throw Error(text('የግል ዕቅድ ለማስገባት የተጠበቀ Backend ያስፈልጋል','Secure backend is required for private import'));
  const file=$('nexusPlanFile')?.files?.[0];if(!file||file.size>150000)throw Error('Invalid private plan file');
  const plan=JSON.parse(await file.text());
  if(!confirm(text('16ቱን ዕቅዶች ወደ የግል መዝገብህ ልጫን?','Import 16 goals into your personal workspace?')))return;
  const result=await store.command('v11.importDirectorPlan',{plan});await update();alertMsg(text('የተጫኑ ግቦች','Imported objectives')+': '+result.count);
 }
 if(e.target.id==='v11Upload'){
  const file=$('v11File').files[0];const result=await store.uploadFile(file,$('v11FileScope').value,$('v11FileUnit').value);
  await update();alertMsg(text('ፋይሉ ማጽደቅ ይጠብቃል','Upload pending approval')+' #'+result.id);
 }
});});
root.addEventListener('change',e=>{
 if(e.target.dataset.analyticsFilter){analysisFilters[e.target.dataset.analyticsFilter]=e.target.value;selectedCenter='';render();return;}
 if(e.target.id==='v11FileScope'){const unit=$('v11FileUnit');if(unit)unit.value=e.target.value==='personal'?my().id:'org';return;}
 if(e.target.id==='v11DepartmentType'){const group=$('v11DeptExtras');if(group){group.innerHTML=(NEXUS_DEPARTMENT_FIELDS[e.target.value]||[]).map(f=>field(f,editing?.data?.[f[0]]??'')).join('');}return;}
 if(e.target.id==='v11Kind'){kind=e.target.value;editing=null;render();}else if(e.target.id==='v11Scope'){const x=$('v11ScopeId');if(x)x.value=e.target.value==='personal'?my().id:e.target.value==='hq'?my().department||'':e.target.value==='center'?my().center||'':'org';}});
root.addEventListener('click',e=>{const b=e.target.closest('[data-v]');if(!b)return;
 withBusy(async()=>{const op=b.dataset.v,id=b.dataset.id;
 if(op==='close'){close();return;}
 if(op==='showCenter'){selectedCenter=b.dataset.center;section='analytics';render();return;}
 if(op==='openKind'){kind=b.dataset.kind;editing=null;section='records';await render();return;}
 if(op==='completeVisit'){const item=records().find(r=>r.id===id);if(!item)throw Error('missing');if(!item.data.actualDate||!item.data.observations)throw Error(text('መጀመሪያ የተጎበኘበትን ቀንና የታዩትን ነገሮች በEdit ሙላ','Edit visit to enter actual date and observations first'));await store.command('v11.completeVisit',{id,version:item._v,actualDate:item.data.actualDate,observations:item.data.observations});await update();return;}
 if(op==='section'){section=b.dataset.section;editing=null;await update();return;}
 if(op==='cancel'){editing=null;render();return;}
 if(op==='edit'){const obj=records().find(r=>r.id===id);if(!obj)throw Error('missing');kind=obj.kind;editing=obj;section='records';render();root.querySelector('#v11form')?.scrollIntoView({block:'start'});return;}
 if(op==='transition'){await transition(id,b.dataset.decision);return;}
 if(op==='export'){exportRecord(id,b.dataset.as);return;}
 if(op==='legacy-export'){exportLegacy(Number(b.dataset.legacy),b.dataset.as);return;}
 if(op==='sync'){await sync();return;}
 if(op==='dropDraft'){if(confirm(text('ያልተላከ ረቂቅ ልሰርዝ?','Delete the unsynced local draft?'))){await draftDelete(id);await render();}return;}
 if(op==='fileReview'){if(b.dataset.decision==='removed'&&!confirm(text('ፋይሉ ከR2 ማከማቻ ይሰረዛል። ለመቀጠል እርግጠኛ ነህ?','The file will be deleted from storage. Continue?')))return;await store.command('v11.fileReview',{id,decision:b.dataset.decision});await update();alertMsg('Updated');return;}
 if(op==='download'){const file=state.v11.files.find(f=>f.id===id);const blob=await store.downloadFile(id);saveDownload(blob,file?.name||'GAIUS-file');return;}
 });});
