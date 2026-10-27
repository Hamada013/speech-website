/* This worker owns only the Ling directory and Ling caches. */
importScripts('release.js');
const CACHE='ling-'+self.LING_RELEASE.version;
self.addEventListener('install',event=>event.waitUntil((async()=>{try{const cache=await caches.open(CACHE);await cache.addAll(self.LING_RELEASE.files);await cache.put(new URL('release.json',self.registration.scope),new Response(JSON.stringify(self.LING_RELEASE),{headers:{'Content-Type':'application/json'}}));}catch(error){await caches.delete(CACHE);throw error;}})()));
self.addEventListener('activate',event=>event.waitUntil((async()=>{for(const key of await caches.keys())if(key.startsWith('ling-')&&key!==CACHE)await caches.delete(key);await self.clients.claim();})()));
self.addEventListener('message',event=>{if(event.data?.type==='ACTIVATE')self.skipWaiting();});
self.addEventListener('fetch',event=>{const url=new URL(event.request.url);if(event.request.method!=='GET'||!url.href.startsWith(self.registration.scope))return;event.respondWith((async()=>{const cache=await caches.open(CACHE),match=await cache.match(event.request);if(match)return match;try{return await fetch(event.request);}catch(error){if(event.request.mode==='navigate')return await cache.match(new URL('index.html',self.registration.scope));throw error;}})());});
