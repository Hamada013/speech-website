'use strict';
const CACHE='ag-ddk-shell-v1';
const SHELL=['./','./index.html','./assets/index-KswJac6i.css','./assets/index-DqtmioYj.js','./assets/analysis.js','./assets/analyzer-worker.js','./assets/icon.svg','./assets/icon-192.png','./assets/icon-512.png','./manifest.webmanifest'];
self.addEventListener('install',event=>event.waitUntil(caches.open(CACHE).then(cache=>cache.addAll(SHELL)).then(()=>self.skipWaiting())));
self.addEventListener('activate',event=>event.waitUntil(caches.keys().then(keys=>Promise.all(keys.filter(key=>key.startsWith('ag-ddk-shell-')&&key!==CACHE).map(key=>caches.delete(key)))).then(()=>self.clients.claim())));
self.addEventListener('fetch',event=>{
  const request=event.request,url=new URL(request.url);
  if(request.method!=='GET'||url.origin!==self.location.origin||!SHELL.some(path=>new URL(path,self.registration.scope).pathname===url.pathname))return;
  event.respondWith((async()=>{
    const cache=await caches.open(CACHE);
    if(request.mode==='navigate'){try{return await fetch(request);}catch{return await cache.match(request,{ignoreSearch:true})||await cache.match('./index.html');}}
    return await cache.match(request,{ignoreSearch:true})||fetch(request);
  })());
});
