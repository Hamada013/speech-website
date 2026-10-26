'use strict';
// The root scope only serves this explicit directory shell. App requests pass
// through untouched; app workers and caches remain independently maintained.
importScripts('./assets/site/pwa-release.js');
const RELEASE=self.SPEECH_SITE_RELEASE,PREFIX='speech-site-shell-',CACHE=PREFIX+RELEASE.version;
const root=new URL('./',self.location.href),entries=new Set(RELEASE.shell.map(file=>new URL(file,root).pathname));
self.addEventListener('install',event=>event.waitUntil((async()=>{
 const cache=await caches.open(CACHE);
 try{await Promise.all(RELEASE.shell.map(async file=>{const url=new URL(file,root),response=await fetch(new Request(url,{cache:'reload'}));if(!response.ok||response.type==='opaque')throw Error('Incomplete site release');const body=await response.clone().arrayBuffer(),digest=await crypto.subtle.digest('SHA-256',body),hash=[...new Uint8Array(digest)].map(b=>b.toString(16).padStart(2,'0')).join('');if(hash!==RELEASE.integrity[file])throw Error('Site release integrity mismatch');await cache.put(url,response);}));await self.skipWaiting();}catch(error){await caches.delete(CACHE);throw error;}
})()));
self.addEventListener('activate',event=>event.waitUntil((async()=>{for(const name of await caches.keys())if(name.startsWith(PREFIX)&&name!==CACHE)await caches.delete(name);})()));
self.addEventListener('fetch',event=>{
 if(event.request.method!=='GET')return;
 const url=new URL(event.request.url);if(url.origin!==root.origin)return;
 if(url.pathname===root.pathname)url.pathname+='index.html';
 if(!entries.has(url.pathname))return;
 const key=new URL(url.pathname,root);
 event.respondWith((async()=>{const cache=await caches.open(CACHE),cached=await cache.match(key);return cached||fetch(event.request);})());
});
