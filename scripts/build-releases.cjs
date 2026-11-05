// One build entrypoint for GitHub Pages. No npm install required. Tools and VB-MAPP publish from their own repositories.
const fs=require('node:fs'),path=require('node:path'),vm=require('node:vm'),crypto=require('node:crypto'),cp=require('node:child_process');
const ROOT=path.resolve(__dirname,'..');
const sha=(body,encoding='hex')=>crypto.createHash('sha256').update(body).digest(encoding);
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
 for(const script of ['forms/speech/articulation/scripts/build-pwa.cjs','forms/aphasia/langiuage-cognitive/scripts/build-release.cjs','forms/Hearing/ling_test/scripts/build-pwa.cjs','forms/ASD/assessment-shared/build-pwa.cjs'])cp.execFileSync(process.execPath,[path.join(ROOT,script)],{stdio:'inherit'});
 asdAssessmentInventory();
 lingInventory();
 articulationInventory();
}
function stageSite(){
 const destination=path.join(ROOT,'output/pages');
 fs.rmSync(destination,{recursive:true,force:true});fs.mkdirSync(destination,{recursive:true});
 // Tracked site files preserve all existing pages. Runtime inventories also
 // include new local app assets when checking a release before its first commit.
 const tracked=cp.execFileSync('git',['ls-files','-z'],{cwd:ROOT}).toString().split('\0').filter(Boolean);
 const files=new Set([...tracked,...articulationInventory(),...aphasiaInventory(),...lingInventory(),...asdAssessmentInventory()]);
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
 require('./retired-addresses.cjs').writeRetiredAddresses(destination);
 articulationInventory(destination);
 aphasiaInventory(destination);
 lingInventory(destination);
 asdAssessmentInventory(destination);
 console.log(`Pages artifact: ${total} files in output/pages; every app shell and media revision verified.`);
 return destination;
}
if(require.main===module){
 if(process.argv.includes('--check')){articulationInventory();aphasiaInventory();lingInventory();asdAssessmentInventory();}else build();
 if(process.argv.includes('--site'))stageSite();
}
module.exports={build,stageSite,asdAssessmentInventory};
