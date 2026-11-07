// One build entrypoint for GitHub Pages and the final app bundle. No npm install required.
const fs=require('node:fs'),path=require('node:path'),vm=require('node:vm'),crypto=require('node:crypto'),cp=require('node:child_process');
const ROOT=path.resolve(__dirname,'../..');
const APPS=['arabicsounds','auditory-rehabilitation'];
const sha=(body,encoding='hex')=>crypto.createHash('sha256').update(body).digest(encoding);
function inventory(app,root=ROOT){
 const base=path.join(root,'tools',app),context={self:{}};
 const release=vm.runInNewContext(fs.readFileSync(path.join(base,'assets/release-worker.js'),'utf8')+';RELEASE;',context);
 const media=release.media,shell=[...release.shell.map(entry=>entry.url),'sw.js','assets/release-worker.js'];
 for(const entry of release.shell)if(sha(fs.readFileSync(path.join(base,entry.url)))!==entry.sha)throw Error(`Stale shell: ${app}/${entry.url}`);
 for(const entry of media){
  if(entry.url.startsWith('/')||entry.url.split('/').includes('..'))throw Error('Invalid media path: '+entry.url);
  const body=fs.readFileSync(path.join(base,entry.url));
  if(body.length!==entry.bytes||sha(body)!==(entry.revision||entry.sha))throw Error(`Stale media: ${app}/${entry.url}`);
 }
 const files=[...new Set([...shell,...media.map(entry=>entry.url)])].sort();
 if(files.some(file=>file.startsWith('/')||file.split('/').includes('..')))throw Error('Invalid shell path');
 return {app,version:release.version,mediaCount:media.length,mediaBytes:media.reduce((sum,entry)=>sum+entry.bytes,0),files};
}
function articulationInventory(root=ROOT){
 const prefix='forms/speech/articulation/',base=path.join(root,prefix),context={self:{}};
 vm.runInNewContext(fs.readFileSync(path.join(base,'assets/pwa-release.js'),'utf8'),context);
 const release=context.self.ARTICULATION_RELEASE;
 for(const file of release.shell)if(release.integrity[file]!=='sha256-'+sha(fs.readFileSync(path.join(base,file)),'base64'))throw Error('Stale articulation shell: '+file);
 return [...release.shell,'sw.js','assets/pwa-release.js'].map(file=>prefix+file);
}
function aphasiaInventory(root=ROOT){
 const prefix='forms/aphasia/langiuage-cognitive/',base=path.join(root,prefix),context={self:{}};
 vm.runInNewContext(fs.readFileSync(path.join(base,'release.js'),'utf8'),context);
 for(const file of context.self.APHASIA_RELEASE.files)if(file.hash!==sha(fs.readFileSync(path.join(base,file.url))))throw Error('Stale aphasia shell: '+file.url);
 return [...context.self.APHASIA_RELEASE.files.map(file=>file.url),'release.js'].map(file=>prefix+file);
}

function lingInventory(root=ROOT){
 const prefix='forms/Hearing/ling_test/',base=path.join(root,prefix),release=JSON.parse(fs.readFileSync(path.join(base,'release.json'),'utf8'));
 for(const file of release.files)if(sha(fs.readFileSync(path.join(base,file)))!==release.integrity[file])throw Error('Stale Ling shell: '+file);
 return [...release.files,'sw.js','release.js','release.json'].map(file=>prefix+file);
}
function asdAssessmentInventory(root=ROOT){
 const files=[];
 for(const app of ['BALF','M-CHAT']){
  const prefix=`forms/ASD/${app}/`,base=path.join(root,prefix),context={self:{}};
  vm.runInNewContext(fs.readFileSync(path.join(base,'assets/pwa-release.js'),'utf8'),context);
  const release=context.self.ASSESSMENT_RELEASE;
  for(const file of release.shell){
   const relative=path.posix.normalize(prefix+file);
   if(!relative.startsWith(prefix)&&!relative.startsWith('forms/ASD/assessment-shared/'))throw Error('Invalid ASD shell path');
   if(release.integrity[file]!==sha(fs.readFileSync(path.join(root,relative))))throw Error(`Stale ASD shell: ${app}/${file}`);
   files.push(relative);
  }
  files.push(prefix+'sw.js',prefix+'assets/pwa-release.js');
 }
 return [...new Set(files)];
}
function build(){
 cp.execFileSync(process.execPath,[path.join(__dirname,'sync-navigation.cjs')],{stdio:'inherit'});
 for(const app of APPS)cp.execFileSync(process.execPath,[path.join(ROOT,'tools',app,'scripts/build-pwa.cjs')],{stdio:'inherit'});
 cp.execFileSync(process.execPath,[path.join(ROOT,'forms/speech/articulation/scripts/build-pwa.cjs')],{stdio:'inherit'});
 cp.execFileSync(process.execPath,[path.join(ROOT,'forms/aphasia/langiuage-cognitive/scripts/build-release.cjs')],{stdio:'inherit'});
 cp.execFileSync(process.execPath,[path.join(ROOT,'forms/Hearing/ling_test/scripts/build-pwa.cjs')],{stdio:'inherit'});
 cp.execFileSync(process.execPath,[path.join(ROOT,'forms/ASD/assessment-shared/build-pwa.cjs')],{stdio:'inherit'});
 asdAssessmentInventory();
 lingInventory();
 articulationInventory();
 return APPS.map(app=>inventory(app));
}
// Apps that moved to their own repositories. The old address forwards to the new one, and a
// replacement worker moves open offline copies there; saved accounts stay (same origin).
// Old VSS pages (and the older tools/voc|senb|taffaha addresses) forward page by page.
const VOC_PAGES=['index.html','games.html','matching.html','memory.html','rapid.html','report.html','test.html'];
const MOVED=[['tools/follow-direction/','/follow-direction/'],['tools/Fluency Flow/','/fluency-flow/'],
 ['tools/VSS/voc/','/vocabulary-builder/',VOC_PAGES],['tools/VSS/senb/','/sentences-builder/'],['tools/VSS/taffaha/','/syllables-builder/'],
 ['tools/voc/','/vocabulary-builder/',VOC_PAGES],['tools/senb/','/sentences-builder/'],['tools/taffaha/','/syllables-builder/']];
const forwardPage=(target,keepPath)=>`<!doctype html><html lang="ar" dir="rtl"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><meta name="robots" content="noindex"><meta http-equiv="refresh" content="0;url=${target}"><link rel="canonical" href="${target}"><title>انتقل التطبيق · App moved</title><script>location.replace(${JSON.stringify(target)}${keepPath?'+location.search+location.hash':''})</script></head><body><p><a href="${target}">${target}</a></p></body></html>\n`;
// The old VSS suite: its home goes to the tools page, each activity to its own app. The old
// worker hands open windows over, removes the suite's own caches and unregisters.
function writeRetiredVSS(destination){
 const out=path.join(destination,'tools/VSS'),scope='/speech-website/tools/VSS/';fs.mkdirSync(out,{recursive:true});
 fs.writeFileSync(path.join(out,'index.html'),forwardPage('../tools.html',false));
 fs.writeFileSync(path.join(out,'sw.js'),`'use strict';
const SCOPE=${JSON.stringify(scope)},HOME='/speech-website/tools/tools.html';
const ROUTES=[[SCOPE+'voc/','/vocabulary-builder/'],[SCOPE+'senb/','/sentences-builder/'],[SCOPE+'taffaha/','/syllables-builder/']];
const moved=href=>{const url=new URL(href);for(const [from,to] of ROUTES)if(url.pathname.startsWith(from)){url.pathname=to+url.pathname.slice(from.length);return url.href;}url.pathname=HOME;url.search='';url.hash='';return url.href;};
self.addEventListener('install',event=>event.waitUntil(self.skipWaiting()));
self.addEventListener('activate',event=>event.waitUntil((async()=>{
 try{
  await self.clients.claim();
  for(const client of await self.clients.matchAll({type:'window'}))if(new URL(client.url).pathname.startsWith(SCOPE))await client.navigate(moved(client.url)).catch(()=>{});
  for(const name of await caches.keys())if(name.startsWith('vss:'+SCOPE))await caches.delete(name);
 }finally{await self.registration.unregister();}
})()));
self.addEventListener('fetch',event=>{const url=new URL(event.request.url);if(event.request.method==='GET'&&event.request.mode==='navigate'&&url.origin===self.location.origin&&url.pathname.startsWith(SCOPE))event.respondWith(Response.redirect(moved(url.href),302));});
`);
}
function writeMovedApps(destination){
 writeRetiredVSS(destination);
 for(const [dir,to,pages=['index.html']] of MOVED){
  const from=encodeURI('/speech-website/'+dir),target='https://hamada013.github.io'+to,out=path.join(destination,dir);fs.mkdirSync(out,{recursive:true});
  for(const page of pages)fs.writeFileSync(path.join(out,page),forwardPage(target+(page==='index.html'?'':page),true));
  fs.writeFileSync(path.join(out,'sw.js'),`'use strict';
const FROM=${JSON.stringify(from)},TO=${JSON.stringify(to)};
const moved=href=>{const url=new URL(href);url.pathname=TO+url.pathname.slice(FROM.length);return url.href;};
self.addEventListener('install',event=>event.waitUntil(self.skipWaiting()));
self.addEventListener('activate',event=>event.waitUntil((async()=>{
 try{await self.clients.claim();for(const client of await self.clients.matchAll({type:'window'}))if(new URL(client.url).pathname.startsWith(FROM))await client.navigate(moved(client.url)).catch(()=>{});}
 finally{await self.registration.unregister();}
})()));
self.addEventListener('fetch',event=>{const url=new URL(event.request.url);if(event.request.method==='GET'&&url.origin===self.location.origin&&url.pathname.startsWith(FROM))event.respondWith(Response.redirect(moved(url.href),302));});
`);
 }
}
function stageSite(releases){
 const destination=path.join(ROOT,'output/pages');
 fs.rmSync(destination,{recursive:true,force:true});fs.mkdirSync(destination,{recursive:true});
 // Tracked site files preserve all existing pages. Runtime inventories also
 // include new local app assets when checking a release before its first commit.
 const tracked=cp.execFileSync('git',['ls-files','-z'],{cwd:ROOT}).toString().split('\0').filter(Boolean);
 const files=new Set([...tracked,...articulationInventory(),...aphasiaInventory(),...lingInventory(),...asdAssessmentInventory(),...releases.flatMap(release=>release.files.map(file=>`tools/${release.app}/${file}`))]);
 const omitted=new Set(['node_modules','.git','.github','.aws','.agents','.codex','.vscode','output','tmp','tests','scripts','__pycache__']);
 let total=0;
 for(const file of [...files].sort()){
  const parts=file.split('/'),name=parts.at(-1);
  if(parts.some(part=>omitted.has(part))||name==='.DS_Store'||name==='AGENTS.md'||name.startsWith('.env')||name==='package-lock.json'||name==='package.json')continue;
  if(file.startsWith('forms/speech/articulation/cloud/')&&file!=='forms/speech/articulation/cloud/config.json')continue;
  if(file.startsWith('forms/Hearing/ling_test/research/'))continue;
  if(file.startsWith('forms/speech/articulation/research/'))continue;
  if(file.startsWith('forms/aphasia/langiuage-cognitive/research/')&&file!=='forms/aphasia/langiuage-cognitive/research/SETUP.md')continue;
  const source=path.join(ROOT,file);if(!fs.existsSync(source))continue;
  if(fs.lstatSync(source).isSymbolicLink())throw Error('Pages files must not be symlinks: '+file);
  if(!fs.statSync(source).isFile())continue;
  const target=path.join(destination,file);fs.mkdirSync(path.dirname(target),{recursive:true});fs.copyFileSync(source,target);total++;
 }
 fs.writeFileSync(path.join(destination,'.nojekyll'),'');
 for(const release of releases)inventory(release.app,destination);
 articulationInventory(destination);
 aphasiaInventory(destination);
 writeMovedApps(destination);
 lingInventory(destination);
 asdAssessmentInventory(destination);
 console.log(`Pages artifact: ${total} files in output/pages; every app shell and media revision verified.`);
 return destination;
}
if(require.main===module){
 const releases=process.argv.includes('--check')?APPS.map(app=>inventory(app)):build();
 if(process.argv.includes('--check')){articulationInventory();aphasiaInventory();lingInventory();asdAssessmentInventory();}
 if(process.argv.includes('--site'))stageSite(releases);
 console.log(JSON.stringify(releases.map(({files,...summary})=>summary),null,2));
}
module.exports={APPS,inventory,build,stageSite,asdAssessmentInventory};
