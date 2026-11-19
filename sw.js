
const scope=new URL(self.registration.scope);
const prefix='gaius-review:'+scope.pathname+':';
const cacheName=prefix+'11.1.0';
const files=['./','./index.html','./gaius-config.js','./gaius-app.js','./gaius-store.js','./gaius-core.js','./gaius-v11-ui.js','./gaius-v11-model.js','./gaius-nexus-analytics.js','./gaius-v11-core.js','./gaius-v11-export.js','./gaius-v11.css','./manifest.webmanifest','./icons/icon-192.png','./icons/icon-512.png','./icons/maskable-192.png','./icons/maskable-512.png','./icons/apple-touch-icon.png','./icons/official-logo.jpg','./icons/favicon-32.png'];
const assets=new Set(files.map(p=>new URL(p,scope).href));
self.addEventListener('install',event=>{
 event.waitUntil((async()=>{const cache=await caches.open(cacheName);await cache.addAll(files.map(p=>new Request(new URL(p,scope),{cache:'reload'})));await self.skipWaiting();})());
});
self.addEventListener('activate',event=>{
 event.waitUntil((async()=>{for(const key of await caches.keys())if(key.startsWith(prefix)&&key!==cacheName)await caches.delete(key);await self.clients.claim();})());
});
self.addEventListener('fetch',event=>{
 const req=event.request,url=new URL(req.url);
 if(req.method!=='GET'||url.origin!==scope.origin)return;
 const relative=url.pathname.slice(scope.pathname.length);
 const nav=req.mode==='navigate'&&url.pathname.startsWith(scope.pathname)&&['','index.html'].includes(relative);
 if(!nav&&!assets.has(url.href))return;
 const key=nav?new URL('index.html',scope).href:url.href;
 event.respondWith((async()=>{
  const cache=await caches.open(cacheName);
  try{
   const response=await fetch(req,{cache:'no-cache'});
   if(response.ok)await cache.put(key,response.clone());
   return response;
  }catch{
   const saved=await cache.match(key);
   return saved||Response.error();
  }
 })());
});

