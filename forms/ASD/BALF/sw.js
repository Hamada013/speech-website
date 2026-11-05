/* Shared source, copied to each app. Only the explicit verified shell is cached. */
importScripts('./assets/pwa-release.js');
const BASE=self.registration.scope,PREFIX=`asd-assessment:${BASE}:shell:`,RELEASE=self.ASSESSMENT_RELEASE,CACHE=PREFIX+RELEASE.version,ENTRY=new URL('index.html',BASE).href;
const FILES=new Set(RELEASE.shell.map(file=>new URL(file,BASE).href));
self.addEventListener('install',event=>event.waitUntil((async()=>{
 const cache=await caches.open(CACHE);
 try{for(const file of RELEASE.shell){const url=new URL(file,BASE),response=await fetch(new Request(url,{cache:'reload'}));if(!response.ok||response.type==='opaque')throw Error('Incomplete offline release');const digest=await crypto.subtle.digest('SHA-256',await response.clone().arrayBuffer()),hash=[...new Uint8Array(digest)].map(b=>b.toString(16).padStart(2,'0')).join('');if(hash!==RELEASE.integrity[file])throw Error('Offline integrity mismatch');await cache.put(url,response);}}
 catch(error){await caches.delete(CACHE);throw error;}
})()));
self.addEventListener('activate',event=>event.waitUntil((async()=>{for(const name of await caches.keys())if(name.startsWith(PREFIX)&&name!==CACHE)await caches.delete(name);await self.clients.claim();})()));
self.addEventListener('message',event=>{if(event.data?.type==='ACTIVATE_UPDATE')self.skipWaiting();});
self.addEventListener('fetch',event=>{
 const url=new URL(event.request.url),key=url.origin+url.pathname;
 const entry=event.request.mode==='navigate'&&(key===BASE||key===ENTRY);
 if(event.request.method!=='GET'||url.origin!==self.location.origin||!entry&&!FILES.has(key))return;
 event.respondWith((async()=>{const cache=await caches.open(CACHE);return await cache.match(entry?ENTRY:key)||fetch(event.request);})());
});
