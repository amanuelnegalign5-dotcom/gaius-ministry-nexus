// The service remains synchronous for SQLite transactions. Only this server-side adapter talks to R2.
export async function privatePhotoCommand({action,payload,bucket,run,revalidate,idFactory}){
 const fail=(message,status=503)=>{throw Object.assign(new Error(message),{status});};
 if(action==='governance.photo'){
  const result=run();
  if(!result.storageKey)return result;
  if(!bucket)fail('storageNotConfigured');
  const object=await bucket.get(result.storageKey);
  if(!object)fail('missing',404);
  const data=await object.text();
  await revalidate();
  if(run().storageKey!==result.storageKey)fail('conflict',409);
  return {data};
 }
 const prepared=run({prepare:true});
 if(!bucket&&(!payload.remove||prepared.previousKey))fail('storageNotConfigured');
 if(payload.remove===true){
  await revalidate();
  const result=run({expectedVersion:prepared.version});
  if(result.previousKey)await bucket.delete(result.previousKey);
  return {};
 }
 const storageKey='private/lijoch-photos/'+idFactory();
 await bucket.put(storageKey,payload.data,{httpMetadata:{contentType:'text/plain',cacheControl:'private, no-store'}});
 let result;
 try{
  await revalidate();
  result=run({expectedVersion:prepared.version,storageKey});
 }catch(e){
  try{await bucket.delete(storageKey);}catch{}
  throw e;
 }
 if(result.previousKey&&result.previousKey!==storageKey)await bucket.delete(result.previousKey);
 return {};
}
