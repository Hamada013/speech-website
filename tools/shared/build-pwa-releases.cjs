// One build entrypoint for GitHub Pages and the final app bundle. No npm install required.
const fs=require('node:fs'),path=require('node:path'),vm=require('node:vm'),crypto=require('node:crypto'),cp=require('node:child_process');
const ROOT=path.resolve(__dirname,'../..');
const APPS=['VSS','arabicsounds','auditory-rehabilitation'];
const sha=(body,encoding='hex')=>crypto.createHash('sha256').update(body).digest(encoding);
function inventory(app,root=ROOT){
 const base=path.join(root,'tools',app),context={self:{}};
 let release,media,shell;
 if(app==='VSS'){
  vm.runInNewContext(fs.readFileSync(path.join(base,'assets/pwa-release.js'),'utf8'),context);
  release=context.self.VSS_RELEASE;
  media=release.media;
  shell=[...release.shell,'sw.js','assets/pwa-release.js'];
  for(const file of release.shell){
   const expected=release.integrity[file],body=fs.readFileSync(path.join(base,file));
   if(expected!=='sha256-'+sha(body,'base64'))throw Error(`Stale shell: ${app}/${file}`);
  }
 }else{
  release=vm.runInNewContext(fs.readFileSync(path.join(base,'assets/release-worker.js'),'utf8')+';RELEASE;',context);
  media=release.media;shell=[...release.shell.map(entry=>entry.url),'sw.js','assets/release-worker.js'];
  for(const entry of release.shell)if(sha(fs.readFileSync(path.join(base,entry.url)))!==entry.sha)throw Error(`Stale shell: ${app}/${entry.url}`);
 }
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

function followDirectionInventory(root=ROOT){
 const prefix='tools/follow-direction/',base=path.join(root,prefix),context={self:{}};
 vm.runInNewContext(fs.readFileSync(path.join(base,'release.js'),'utf8'),context);
 const release=context.self.FD_RELEASE;
 if(release.workerHash!==sha(fs.readFileSync(path.join(base,'sw.js'))))throw Error('Stale Follow Direction worker');
 for(const file of release.files)if(file.hash!==sha(fs.readFileSync(path.join(base,file.url))))throw Error('Stale Follow Direction shell: '+file.url);
 return [...release.files.map(file=>file.url),'sw.js','release.js'].map(file=>prefix+file);
}
function lingInventory(root=ROOT){
 const prefix='forms/Hearing/ling_test/',base=path.join(root,prefix),release=JSON.parse(fs.readFileSync(path.join(base,'release.json'),'utf8'));
 for(const file of release.files)if(sha(fs.readFileSync(path.join(base,file)))!==release.integrity[file])throw Error('Stale Ling shell: '+file);
 return [...release.files,'sw.js','release.js','release.json'].map(file=>prefix+file);
}
function build(){
 cp.execFileSync(process.execPath,[path.join(__dirname,'sync-navigation.cjs')],{stdio:'inherit'});
 for(const app of APPS)cp.execFileSync(process.execPath,[path.join(ROOT,'tools',app,'scripts/build-pwa.cjs')],{stdio:'inherit'});
 cp.execFileSync(process.execPath,[path.join(ROOT,'forms/speech/articulation/scripts/build-pwa.cjs')],{stdio:'inherit'});
 cp.execFileSync(process.execPath,[path.join(ROOT,'forms/aphasia/langiuage-cognitive/scripts/build-release.cjs')],{stdio:'inherit'});
 cp.execFileSync(process.execPath,[path.join(ROOT,'tools/follow-direction/scripts/build-pwa.cjs')],{stdio:'inherit'});
 cp.execFileSync(process.execPath,[path.join(ROOT,'forms/Hearing/ling_test/scripts/build-pwa.cjs')],{stdio:'inherit'});
 followDirectionInventory();
 lingInventory();
 articulationInventory();
 return APPS.map(app=>inventory(app));
}
function stageSite(releases){
 const destination=path.join(ROOT,'output/pages');
 fs.rmSync(destination,{recursive:true,force:true});fs.mkdirSync(destination,{recursive:true});
 // Tracked site files preserve all existing pages. Runtime inventories also
 // include new local app assets when checking a release before its first commit.
 const tracked=cp.execFileSync('git',['ls-files','-z'],{cwd:ROOT}).toString().split('\0').filter(Boolean);
 const files=new Set([...tracked,...articulationInventory(),...aphasiaInventory(),...followDirectionInventory(),...lingInventory(),...releases.flatMap(release=>release.files.map(file=>`tools/${release.app}/${file}`))]);
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
 require('../VSS/scripts/legacy-redirects.cjs').writeRedirects(destination);
 for(const release of releases)inventory(release.app,destination);
 articulationInventory(destination);
 aphasiaInventory(destination);
 followDirectionInventory(destination);
 lingInventory(destination);
 console.log(`Pages artifact: ${total} files in output/pages; every app shell and media revision verified.`);
 return destination;
}
if(require.main===module){
 const releases=process.argv.includes('--check')?APPS.map(app=>inventory(app)):build();
 if(process.argv.includes('--check')){articulationInventory();aphasiaInventory();followDirectionInventory();lingInventory();}
 if(process.argv.includes('--site'))stageSite(releases);
 console.log(JSON.stringify(releases.map(({files,...summary})=>summary),null,2));
}
module.exports={APPS,inventory,build,stageSite};
