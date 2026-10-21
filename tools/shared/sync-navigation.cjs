const fs=require('node:fs'),path=require('node:path');
const soundApps=['arabicsounds','auditory-rehabilitation'];
for(const app of ['voc','senb','taffaha',...soundApps])for(const file of ['app-navigation.js','app-navigation.css','flow-ui.js','flow-ui.css','accounts.js','session-homework.js','session-homework.css','updates.js','welcome.js','welcome.css']){
 if(soundApps.includes(app)&&file.startsWith('session-homework'))continue;
 if(soundApps.includes(app)&&file.startsWith('welcome.'))continue;
 const source=fs.readFileSync(path.join(__dirname,file)),target=path.join(__dirname,'..',app,'assets',file);
 if(process.argv.includes('--check')){if(!fs.existsSync(target)||!source.equals(fs.readFileSync(target)))throw Error('Navigation copy is stale: '+target);}
 else fs.writeFileSync(target,source);
}

const logos={voc:'images/logo.webp',senb:'assets/icons/logo.webp',taffaha:'assets/icons/logo.webp',arabicsounds:'images/logo.webp','auditory-rehabilitation':'images/logo.webp'};
for(const app of Object.keys(logos))for(const [id,file]of Object.entries(logos)){
 const source=fs.readFileSync(path.join(__dirname,'..',id,file)),directory=path.join(__dirname,'..',app,'assets/navigation'),target=path.join(directory,id+'.webp');
 if(process.argv.includes('--check')){if(!fs.existsSync(target)||!source.equals(fs.readFileSync(target)))throw Error('Navigation logo is stale: '+target);}
 else{fs.mkdirSync(directory,{recursive:true});fs.writeFileSync(target,source);}
}

for(const app of soundApps)for(const file of ['sound-progress.js','sound-suite.js','sound-suite.css','detection-game.js','detection-game.css','parent-gate.js','parent-gate.css']){
 const origin=file.startsWith('parent-gate')?path.join(__dirname,'../voc/assets',file):path.join(__dirname,file),target=path.join(__dirname,'..',app,'assets',file),source=fs.readFileSync(origin);
 if(process.argv.includes('--check')){if(!fs.existsSync(target)||!source.equals(fs.readFileSync(target)))throw Error('Sound suite copy is stale: '+target);}else fs.writeFileSync(target,source);
}
