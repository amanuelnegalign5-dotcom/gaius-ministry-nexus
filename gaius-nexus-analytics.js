// Gaius Nexus v11.1 — pure functions; never invent data where an indicator is absent.
const iso=val=>/^\d{4}-\d{2}-\d{2}$/.test(String(val||''))?String(val):'';
export function cityGroup(c){
 const city=String(c?.city||'').trim().toLowerCase(),location=String(c?.location||'').toLowerCase();
 if(city==='addis_ababa'||/addis|አዲስ/.test(location))return 'addis_ababa';
 if(city==='bishoftu'||/bishoftu|deb(e|re) ?zeit|ደብረ.?ዘይት|ቢሾፍቱ/.test(location))return 'bishoftu';
 return city==='other'?'other':'unknown';
}
export function frequencyMonths(center){
 const val=Number(center?.data?.visitEveryMonths||0);
 if(Number.isInteger(val)&&val>=1&&val<=24)return val;
 const city=cityGroup(center?.data);return city==='addis_ababa'?1:city==='bishoftu'?2:null;
}
export function addMonths(date,months){
 const d=new Date(date+'T12:00:00Z');if(Number.isNaN(+d))return '';
 const day=d.getUTCDate();d.setUTCDate(1);d.setUTCMonth(d.getUTCMonth()+months);
 const last=new Date(Date.UTC(d.getUTCFullYear(),d.getUTCMonth()+1,0)).getUTCDate();d.setUTCDate(Math.min(day,last));return d.toISOString().slice(0,10);
}
export function visitCompliance(records,today=new Date().toISOString().slice(0,10)){
 const centers=records.filter(r=>r.kind==='centers'&&r.status!=='archived');
 const visits=records.filter(r=>r.kind==='visits'&&r.status!=='archived');
 return centers.map(center=>{
  const freq=frequencyMonths(center);
  const done=visits.filter(r=>r.data?.centerRecordId===center.id&&r.status==='completed'&&iso(r.data.actualDate)&&r.data.actualDate<=today).sort((a,b)=>b.data.actualDate.localeCompare(a.data.actualDate));
  const latest=done[0]?.data.actualDate||'';
  const startOfMonth=today.slice(0,7)+'-01';
  const due=freq===1?addMonths(startOfMonth,1):freq?latest?addMonths(latest,freq):today:'';
  const completed=freq===1?!!latest&&latest>=startOfMonth:!!latest&&due>=today;
  const planned=visits.some(r=>r.data?.centerRecordId===center.id&&r.status!=='completed'&&iso(r.data.plannedDate)&&r.data.plannedDate>=today&&(!due||r.data.plannedDate<=due));
  return {id:center.id,name:center.data?.name||'',city:cityGroup(center.data),frequency:freq,latest:latest||null,due:due||null,completed,planned,status:!freq?'unspecified':completed?'on_track':planned?'planned':due&&due<today?'overdue':'needs_visit'};
 });
}
export function indicators(records){
 const monthly=records.filter(r=>r.kind==='monthly'&&r.status==='approved');
 const followups=records.filter(r=>r.kind==='followups'&&r.status==='approved');
 const counts=new Map();
 for(const r of followups){
  const key=String(r.data?.week||'').slice(0,10);if(!iso(key))continue;
  const n=Number(r.data?.sundayProgram);
  if(!Number.isFinite(n))continue;
  counts.set(key,(counts.get(key)||0)+n);
 }
 const weekly=[...counts].sort((a,b)=>a[0].localeCompare(b[0])).map(([week,attendance])=>({week,attendance}));
 const centers=new Map();
 for(const r of followups){const key=r.scopeId||'unknown';const n=Number(r.data?.sundayProgram);if(!centers.has(key))centers.set(key,{name:key,total:0,records:0,volunteers:0});const item=centers.get(key);
  if(r.data?.sundayProgram!==''&&Number.isFinite(n)){item.total+=n;item.records++;}
  const v=Number(r.data?.volunteers);if(r.data?.volunteers!==''&&Number.isFinite(v))item.volunteers+=v;
 }
 const reports=records.filter(r=>r.kind==='monthly'&&r.status!=='archived');
 return {monthly,weekly,byCenter:[...centers.values()].sort((a,b)=>b.total-a.total),reportsSubmitted:reports.filter(r=>r.status==='submitted').length,reportsApproved:reports.filter(r=>r.status==='approved').length,reportMissingTarget:monthly.filter(r=>r.data?.planned===''||r.data?.planned==null).length};
}
export function safePerformance(planned,achieved){
 if(planned===''||planned===null||planned===undefined||achieved===''||achieved===null||achieved===undefined)return null;
 const a=Number(planned),b=Number(achieved);return a>0&&Number.isFinite(b)&&b>=0?(b/a)*100:null;
}
export function compatiblePlannedActual(records,unit){
 // Strictly separate incomparable units. Unspecified units are never aggregated.
 if(!unit)return [];
 return records.filter(r=>r.kind==='monthly'&&r.status==='approved'&&r.data?.indicatorUnit===unit)
  .map(r=>({id:r.id,center:r.scopeType==='center'?r.scopeId:'HQ',activity:r.data.activity||'',
   planned:r.data.planned,achieved:r.data.achieved,ratio:safePerformance(r.data.planned,r.data.achieved)}));
}
