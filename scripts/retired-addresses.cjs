'use strict';
// Publication-only forwarding for apps that moved to standalone repositories.
// Old links reach the new address, and replacement workers retire offline copies.
// Keeps saved accounts and other apps' caches; only the old address's caches go.
const fs=require('node:fs'),path=require('node:path');
const BASE='/speech-website/';
const LEGACY=['voc','senb','taffaha'];
const WORKERS=[['tools/Fluency%20Flow/','/tools/Fluency%20Flow/','tools/Fluency Flow/sw.js'],...['VSS','arabicsounds','aswati','auditory-rehabilitation','ihki-hilou'].map(app=>[`tools/${app}/`,`/tools/${app}/`,`tools/${app}/sw.js`]),...LEGACY.map(app=>[`tools/${app}/`,`/tools/VSS/${app}/`,`tools/${app}/sw.js`]),['forms/ASD/VB-MAPP/','/vb-mapp/','forms/ASD/VB-MAPP/sw.js'],['tools/follow-direction/','/follow-direction/','tools/follow-direction/sw.js']];
const worker=(from,to)=>`'use strict';
const FROM=${JSON.stringify(BASE+from)},TO=${JSON.stringify(to)};
const moved=href=>{const url=new URL(href);url.pathname=TO+url.pathname.slice(FROM.length);return url.href;};
self.addEventListener('install',event=>event.waitUntil(self.skipWaiting()));
self.addEventListener('activate',event=>event.waitUntil((async()=>{
 // Finish retiring even if one window cannot be moved; the fetch handler below still forwards it.
 try{
  await self.clients.claim();
  for(const name of await caches.keys())if(name.includes(FROM))await caches.delete(name);
  for(const client of await self.clients.matchAll({type:'window'}))if(new URL(client.url).pathname.startsWith(FROM))await client.navigate(moved(client.url)).catch(()=>{});
 }finally{await self.registration.unregister();}
})()));
self.addEventListener('fetch',event=>{const url=new URL(event.request.url);if(event.request.method==='GET'&&url.origin===self.location.origin&&url.pathname.startsWith(FROM))event.respondWith(Response.redirect(moved(url.href),302));});
`;
const page=`<!doctype html>
<html lang="ar" dir="rtl"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><meta name="robots" content="noindex"><title>Not found · غير موجود</title><script>
(function(){var p=location.pathname,b=${JSON.stringify(BASE)},r=[[b+'tools/tools.html',b+'tools.html',1],[b+'tools/',b+'tools.html',1],${LEGACY.map(app=>`[b+'tools/${app}/','/tools/VSS/${app}/']`).join(',')},[b+'tools/follow-direction/','/follow-direction/'],[b+'tools/','/tools/'],[b+'forms/ASD/VB-MAPP/','/vb-mapp/']];
for(var i=0;i<r.length;i++){var x=r[i];if(x[2]?p===x[0]:p.indexOf(x[0])===0){location.replace((x[2]?x[1]:x[1]+p.slice(x[0].length))+location.search+location.hash);return;}}})();
</script><style>body{margin:0;min-height:100vh;display:grid;place-content:center;padding:16px;background:#f8fafc;color:#1f2d3a;font-family:system-ui,sans-serif;text-align:center}a{color:#2f6f8f}</style></head><body><main><h1>الصفحة غير موجودة · Page not found</h1><p><a href="${BASE}index.html">الصفحة الرئيسية · Home</a></p></main></body></html>
`;
function writeRetiredAddresses(site){
 for(const [from,to,file] of WORKERS){const target=path.join(site,file);fs.mkdirSync(path.dirname(target),{recursive:true});fs.writeFileSync(target,worker(from,to));}
 fs.writeFileSync(path.join(site,'404.html'),page);
}
module.exports={writeRetiredAddresses};
