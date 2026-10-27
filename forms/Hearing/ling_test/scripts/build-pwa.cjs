const fs=require('node:fs'),path=require('node:path'),crypto=require('node:crypto');
const root=path.resolve(__dirname,'..'),hash=x=>crypto.createHash('sha256').update(x).digest('hex');
const files=['index.html','manifest.webmanifest','assets/app.css','assets/styled-dropdowns.css','assets/styled-dropdowns.js','assets/app.js','assets/model.js','assets/pwa.js','assets/parent-gate.js','assets/parent-gate.css','images/logo.png','images/icon-192.png','images/icon-512.png',...[1,12,13,24,27,28].flatMap(id=>[`images/${id}.webp`,`sounds/${id}.m4a`])];
const integrity=Object.fromEntries(files.map(file=>[file,hash(fs.readFileSync(path.join(root,file)))]));
const release={version:hash(JSON.stringify(integrity)+hash(fs.readFileSync(path.join(root,'sw.js')))).slice(0,16),files,integrity};
for(const [file,text]of [['release.json',JSON.stringify(release,null,2)+'\n'],['release.js','self.LING_RELEASE='+JSON.stringify(release)+';\n']]){if(process.argv.includes('--check')){if(fs.readFileSync(path.join(root,file),'utf8')!==text)throw Error('Stale Ling release');}else fs.writeFileSync(path.join(root,file),text);}
console.log('Ling '+release.version+': '+files.length+' offline files');
module.exports=release;
