/* App-only offline cache. Updates wait until existing app windows close. */
importScripts('./assets/pwa-release.js');
const {version,files}=self.VBMAPP_RELEASE;
const prefix=`vb-mapp:${new URL(self.registration.scope).pathname}:`,cacheName=prefix+version;
const absolute=url=>new URL(url,self.registration.scope).href;
const shell=new Set(files.map(file=>absolute(file.url)));
self.addEventListener('install',event=>event.waitUntil((async()=>{
  const cache=await caches.open(cacheName);
  for(const file of files){const response=await fetch(absolute(file.url),{cache:'reload',integrity:file.integrity});if(!response.ok||response.redirected)throw Error('Offline file unavailable');await cache.put(absolute(file.url),response);}
})()));
self.addEventListener('activate',event=>event.waitUntil((async()=>{
  for(const name of await caches.keys())if(name.startsWith(prefix)&&name!==cacheName)await caches.delete(name);
  await self.clients.claim();
})()));
self.addEventListener('fetch',event=>{
  const request=event.request,url=new URL(request.url);
  if(request.method!=='GET'||url.origin!==location.origin)return;
  const navigation=request.mode==='navigate'&&url.pathname.startsWith(new URL(self.registration.scope).pathname);
  const stimulus=url.pathname.startsWith(new URL('images/',self.registration.scope).pathname)&&/\.(png|webp|jpg|jpeg)$/i.test(url.pathname);
  if(!navigation&&!shell.has(url.href)&&!stimulus)return;
  event.respondWith((async()=>{
    const cache=await caches.open(cacheName),key=navigation?absolute('index.html'):url.href;
    const saved=await cache.match(key);if(saved)return saved;
    const response=await fetch(request);if(response.ok&&response.type!=='opaque')await cache.put(key,response.clone());return response;
  })());
});
self.addEventListener('message',event=>{
  if(event.data?.type!=='VBMAPP_STATUS')return;
  event.waitUntil((async()=>{const cache=await caches.open(cacheName);let count=0;for(const file of files)if(await cache.match(absolute(file.url)))count++;event.ports[0]?.postMessage({ready:count===files.length,done:count,total:files.length,version});})());
});
