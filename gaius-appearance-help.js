// Appearance and contextual help are UI-only; never change authorization.
const root=document.documentElement, prefKey='gaius.appearance', media=matchMedia('(prefers-color-scheme: dark)');
const read=()=>{try{return localStorage.getItem(prefKey)||'system';}catch{return 'system';}};
let preference=['light','dark','system'].includes(read())?read():'system';
const tr=(am,en)=>root.lang==='en'?en:am;
function appearance(){
 const actual=preference==='system'?(media.matches?'dark':'light'):preference;
 root.dataset.theme=actual;root.dataset.appearance=preference;
 document.querySelector('meta[name="theme-color"]')?.setAttribute('content',actual==='dark'?'#101c19':'#167454');
 for(const select of document.querySelectorAll('[data-appearance]')){
  select.replaceChildren(...[['system','ስርዓት','System'],['light','ብርሃን','Light'],['dark','ጨለማ','Dark']].map(([value,am,en])=>new Option(tr(am,en),value)));
  select.value=preference;select.setAttribute('aria-label',tr('የገጽ ቀለም','Appearance'));
 }
 for(const b of document.querySelectorAll('[data-help]'))b.textContent=tr('ስለ App / እገዛ','About & Help');
}
media.addEventListener?.('change',()=>{if(preference==='system')appearance();});
const dialog=document.createElement('dialog');dialog.id='nexusHelp';dialog.setAttribute('aria-labelledby','nexusHelpTitle');document.body.append(dialog);
const node=(tag,value,attrs={})=>{const n=document.createElement(tag);if(value!=null)n.textContent=value;for(const [k,v] of Object.entries(attrs))n.setAttribute(k,v);return n;};
const guides={
 auth:['መግቢያና ምዝገባ','Sign in & registration','የመለያ ስምና የይለፍ ቃል ያስገቡ። አዲስ መለያ ከፈለጉ ይመዝገቡ፣ ማጽደቅን ይጠብቁ። የይለፍ ቃል ከረሱ Forgot password ይጠቀሙ።','Enter your username and password. For a new account register and wait for approval. Use Forgot password for recovery.'],
 dashboard:['ዋና ገጽ','Dashboard','ወር ወይም ዓመት ይምረጡ፤ የተፈቀዱ ሪፖርቶችንና አፈጻጸም ይመልከቱ።','Choose month or year to review authorized reports and performance.'],
 reports:['ሪፖርቶች','Reports','በወር፣ ክፍልና ሁኔታ ያጣሩ። የሚታዩ መዝገቦችን ይክፈቱ።','Filter by month, department or status and open authorized records.'],
 reportEntry:['አዲስ ሪፖርት','New report','የሪፖርቱን ወር፣ ተግባር፣ ዕቅድ፣ ውጤትና ችግር ይሙሉ፤ ያስቀምጡና ለግምገማ ይላኩ።','Complete the reporting period, activity, target, result and challenges; save and submit for review.'],
 plans:['ዕቅዶች','Plans','ግብ፣ ኃላፊ፣ ጊዜና ውጤት ይግለጹ፤ ያስቀምጡ።','Specify objective, owner, deadline and expected outcome; save your plan.'],
 attendance:['የሰኞ መገኘት','Monday attendance','ቀንና የፕሮግራም ዓይነት ይምረጡ። የመመዝገብ ፈቃድ ካለዎት ሁኔታውን ያስገቡ።','Select date and program type. Record attendance only if your account is authorized to manage it.'],
 board:['ማስታወቂያዎች','Board','የተፈቀዱ ማስታወቂያዎችን ያንብቡ። የማሳተም ፈቃድ ካለዎት ይጨምሩ።','Read authorized notices and publish only if the publish control is available.'],
 workspace:['የሥራ ቦታ','Staff workspace','የሥራ እቅዶችን፣ አስተያየቶችንና የተፈቀዱ ፕሮግራሞችን ይከታተሉ።','Follow authorized staff programs, plans and feedback.'],
 directory:['የተጠቃሚዎች መዝገብ','Directory','የተፈቀዱ መገለጫዎችን ይፈልጉ። የግል መረጃን አያጋሩ።','Find permitted profiles. Do not disclose personal information.'],
 profilePage:['መገለጫ','My profile','የራስዎን መረጃ ይፈትሹ፣ ያድሱ፣ የይለፍ ቃል ይቀይሩ።','Review and update your own profile or change your password.'],
 documents:['ሰነዶች','Documents','የተፈቀዱ ሰነዶችን ይጠቀሙ፤ ሚስጥራዊ ፋይሎችን በNexus File uploads ብቻ ያስገቡ።','Use authorized documents. For private file uploads use the secure Nexus file workspace.'],
 admin:['አስተዳደር','User management','መለያዎችን በተፈቀደው ወሰን ያስተዳድሩ። ዳይሬክተር የሚና ፈቃድን በRole and permissions ያስቀምጣል።','Manage accounts within your authority. Directors assign role permissions using Role and permissions.'],
 director:['የዳይሬክተር ሥራ','Director workspace','ግቦች፣ ጉብኝቶች፣ ግምገማና የድርጅት ክትትልን ከሚታዩ መቆጣጠሪያዎች ያስተዳድሩ።','Use available controls to manage director goals, visits, reviews and organizational oversight.'],
 analytics:['ትንታኔ','Center analytics','በማዕከል፣ ጊዜና ክፍል ያጣሩ። ውጤቱን ከመረጃ ምንጩ ጋር ያረጋግጡ።','Filter by center, period and unit. Check results against the underlying records.'],
 overview:['ዋና እይታ','Overview','የተፈቀዱ ሥራዎችና የሪፖርት ሁኔታዎችን ይመልከቱ፤ Operations ይክፈቱ።','Review authorized activities and record status; open Operations.'],
 records:['የሥራ መዝገቦች','Operations','የሚታየውን የመዝገብ ዓይነት ይምረጡ። ቅጽ ካለ ረቂቅ ያስቀምጡ፣ ለግምገማ ይላኩ።','Select an available record type. If an editor is available, save a draft and submit when ready.'],
 files:['የሰነድ ማከማቻ','File uploads','ፈቃድ ካለዎት ፋይል ይምረጡ፣ የሚመለከተውን ወሰን ያረጋግጡና ያስገቡ። የፋይሉን ገደብ ይከተሉ።','If upload is available, choose a file, verify its scope and submit within the displayed size limit.'],
 offline:['ያልተላኩ ረቂቆች','Offline drafts','ረቂቆችን ይፈትሹ፤ ኢንተርኔት ሲኖር ያስመሳስሉ። ያልተላከ ረቂቅ የቀረበ ሪፖርት አይደለም።','Review unsent drafts and sync when online. An unsent draft is not a submitted report.'],
 governance:['የጋይዮስ አስተዳደር','Governance','በሚታዩ የማዕከል፣ መካሪነት፣ ዕቅድና ሌሎች ክፍሎች ይሥሩ። Create/Edit ካለ ብቻ ይቀይሩ።','Use the displayed governance modules. Create or edit only when the corresponding controls are available.'],
 delegation:['ውክልናና ፈቃድ','Delegation & permissions','ተቀባይ፣ የፈቃድ ዓይነት፣ ወሰንና ተግባራት ይምረጡ። ለውክልና የጊዜ ገደብና ምክንያት ያስገቡ፤ ካስፈለገ Revoke ይጠቀሙ።','Choose an eligible recipient, authority type, scope and actions. Delegation requires dates, purpose and reference. Revoke when needed.'],
 reference:['የድርጅት ስሞች','Official names','የተፈቀዱ የክፍልና ማዕከል መጠሪያዎችን ይመልከቱ።','Consult the official names available to your role.'],
 center:['ማዕከላት','Centers','የተፈቀዱ ማዕከላትን ይመልከቱ፤ የማዕከሉን ስምና ምደባ ያረጋግጡ።','Review authorized centers and verify name and assignment.'],
 child:['የጋይዮስ ልጆች','Gaius Lijoch','የተፈቀዱ መገለጫዎችን ይጠቀሙ፤ ፎቶ ለማስገባት ተገቢ ፈቃድ ያረጋግጡ።','Use authorized profiles; confirm required consent before uploading a photo.'],
 mentee:['መካሪነት','Mentorship','የተመደቡ ልጆችንና ግቦቻቸውን ይከታተሉ።','Track assigned mentees and goals; respect confidentiality.'],
 progress:['የዕቅድ ክትትል','Plan progress','የዕቅድ ማጣቀሻ፣ ውጤት፣ ችግርና ቀጣይ እርምጃ ይግለጹ።','Record the plan reference, outcome, challenges and next action.'],
 project:['ፕሮጀክቶች','Projects','ዓላማ፣ ኃላፊና የሥራ ሂደት ይፈትሹ፤ ፈቃድ ካለ ያድሱ።','Review objectives, lead and progress; update when authorized.'],
 committee:['ኮሚቴዎች','Committees','ዓላማ፣ ተሳታፊዎችና ውጤት ይከታተሉ።','Track committee purpose, participants and deliverables.'],
 meeting:['ጉብኝትና ስብሰባ','Visits & meetings','ቀን፣ ዓላማ፣ ውጤትና ቀጣይ እርምጃ ይመዝግቡ።','Record date, purpose, outcomes and follow-up when authorized.'],
 centerAttendance:['የማዕከል መገኘት','Center attendance','እሁድና ከማክሰኞ እስከ ቅዳሜ አንድ ሳምንታዊ ስብሰባ። የራስዎን መዝገብ ይፈትሹ፤ የመመዝገብ ፈቃድ ካለ ያስገቡ።','Sunday program plus one weekly meeting Tuesday–Saturday. Review your attendance; manage the roster only if authorized.'],
 charters:['የክፍል ኃላፊነት','Department charters','የሚታዩትን የክፍል ዓላማና ውጤቶች ያንብቡ።','Read the displayed department purpose and deliverables.']
};

function currentGuide(){
 const auth=!document.getElementById('auth').classList.contains('hide');
 if(auth)return {key:'auth',nav:[]};
 const nexus=document.getElementById('app').classList.contains('nexus-mode');
 const nav=Array.from(document.querySelectorAll(nexus?'#gaiusV11 .v11nav button[data-section]':'#app .nav[data-page]')).filter(b=>!b.hidden&&!b.classList.contains('hide')&&getComputedStyle(b).display!=='none').map(b=>({key:b.dataset.section||b.dataset.page,label:b.textContent.trim(),button:b}));
 let key=nav.find(x=>x.button.classList.contains('on'))?.key||'profilePage';
 const gov=document.querySelector('#governancePanel');
 if(gov&&nexus){const tab=gov.dataset.helpTab;if(tab)key=tab==='attendance'?'centerAttendance':tab==='grants'?'delegation':tab;}
 const selector=nexus&&key==='records'?document.querySelector('#v11Kind'):null;
 if(selector?.value==='centerAttendance')key='centerAttendance';
 return {key,nav,nexus,selector,gov};
}
function showHelp(){
 const {key,nav,nexus,selector,gov}=currentGuide();const g=guides[key]||guides.overview;
 dialog.replaceChildren();
 const header=node('div',null,{class:'helphead'}),close=node('button',tr('ዝጋ','Close'),{class:'btn ghost',type:'button'});close.onclick=()=>dialog.close();header.append(node('h2',tr('ስለ GAIUS Nexus እና የአጠቃቀም መመሪያ','About GAIUS Nexus & user guide'),{id:'nexusHelpTitle'}),close);dialog.append(header);
 dialog.append(node('p',tr('የጋይዮስ አገልግሎት የአመራር፣ ዕቅድ፣ ሪፖርት፣ መገኘትና ክትትል ሥርዓት።','GAIUS Ministry’s workspace for leadership, planning, reporting, attendance and follow-up.')));
 if(key!=='auth'){const who=document.getElementById('who')?.textContent||'';dialog.append(node('p',who,{class:'muted'}));}
 const cur=node('section',null,{class:'helpcurrent'});cur.append(node('h3',tr('አሁን ያሉበት ገጽ፦ ','Current page: ')+tr(g[0],g[1])),node('p',tr(g[2],g[3])));dialog.append(cur);
 if(selector){const block=node('section',null,{class:'helpsection'});block.append(node('h3',tr('የሚታዩ የሥራ መዝገቦች','Available record modules')));for(const o of selector.options){const b=node('button',o.textContent,{type:'button',class:'helplink'});b.onclick=()=>{dialog.close();if(selector.isConnected){selector.value=o.value;selector.dispatchEvent(new Event('change',{bubbles:true}));}};const row=node('div');row.append(b);if(o.selected)row.append(node('span',tr(' · የአሁኑ',' · Current'),{class:'muted'}));block.append(row);}block.append(node('p',document.querySelector('#v11form')?tr('የዚህ ገጽ የማስገቢያ ቅጽ አለ።','An entry form is available on this page.'):tr('የዚህ ገጽ መዝገቦችን ብቻ ይመልከቱ።','This page currently has no entry form.')));dialog.append(block);}
 if(gov){const block=node('section',null,{class:'helpsection'});block.append(node('h3',tr('የሚታዩ የአስተዳደር ክፍሎች','Available governance modules')));for(const b of gov.querySelectorAll('nav button')){const link=node('button',b.textContent,{type:'button',class:'helplink'});link.onclick=()=>{dialog.close();if(b.isConnected)b.click();};const row=node('div');row.append(link);block.append(row);}dialog.append(block);}
 if(nav.length){const section=node('section',null,{class:'helpsection'});section.append(node('h3',tr('በመለያዎ የሚታዩ ገጾች','Pages available to your account')));const ul=node('ul');for(const item of nav){const li=node('li'),b=node('button',item.label,{type:'button',class:'helplink'});b.onclick=()=>{dialog.close();if(item.button.isConnected)item.button.click();};li.append(b);const d=guides[item.key];if(d)li.append(node('p',tr(d[2],d[3]),{class:'muted'}));ul.append(li);}section.append(ul);dialog.append(section);}
 if(key!=='auth'){const destination=document.querySelector(nexus?'#gaiusV11 [data-v="close"]':'#v11launch');if(destination&&!destination.hidden&&getComputedStyle(destination).display!=='none'){const link=node('button',nexus?tr('ወደ ነባር ገጾች','Back to existing pages'):tr('ወደ Nexus የሥራ ቦታ','Open Nexus workspace'),{type:'button',class:'btn ghost'});link.onclick=()=>{dialog.close();destination.click();};dialog.append(link);}}
 dialog.append(node('h3',tr('ፈቃድና ግላዊነት','Access & privacy')),node('p',tr('የሚታዩት ገጾች በሚናዎና በተሰጠው ፈቃድ ይወሰናሉ። የጎደለ ፈቃድ ካለ ዳይሬክተርዎን ያነጋግሩ። የይለፍ ቃልና ሚስጥራዊ መረጃ አያጋሩ።','Visible pages depend on your role and grants. Contact your director if access is missing. Never share passwords or confidential records.')),node('h3',tr('የገጽ ቀለም','Appearance')),node('p',tr('Light፣ Dark ወይም System ይምረጡ። ምርጫዎ በዚህ Browser ይቀመጣል።','Choose Light, Dark or System in the header. Your preference is saved in this browser.')));
 if(!dialog.open)dialog.showModal();
}
document.addEventListener('change',e=>{if(!e.target.matches('[data-appearance]'))return;preference=e.target.value;try{localStorage.setItem(prefKey,preference);}catch{}appearance();});
document.addEventListener('click',e=>{if(e.target.closest('[data-help]'))showHelp();});
new MutationObserver(()=>{appearance();if(dialog.open)showHelp();}).observe(root,{attributes:true,attributeFilter:['lang']});
window.addEventListener('gaius:nexus-session-cleared',()=>{if(dialog.open)dialog.close();dialog.replaceChildren();});
appearance();
