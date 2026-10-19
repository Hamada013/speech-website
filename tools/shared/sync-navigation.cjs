const fs=require('node:fs'),path=require('node:path');
for(const app of ['voc','senb','taffaha'])for(const file of ['app-navigation.js','app-navigation.css','flow-ui.js','flow-ui.css','accounts.js']){
 const source=fs.readFileSync(path.join(__dirname,file)),target=path.join(__dirname,'..',app,'assets',file);
 if(process.argv.includes('--check')){if(!fs.existsSync(target)||!source.equals(fs.readFileSync(target)))throw Error('Navigation copy is stale: '+target);}
 else fs.writeFileSync(target,source);
}

const logos={voc:'images/logo.webp',senb:'assets/icons/logo.webp',taffaha:'assets/icons/logo.webp'};
for(const app of Object.keys(logos))for(const [id,file]of Object.entries(logos)){
 const source=fs.readFileSync(path.join(__dirname,'..',id,file)),directory=path.join(__dirname,'..',app,'assets/navigation'),target=path.join(directory,id+'.webp');
 if(process.argv.includes('--check')){if(!fs.existsSync(target)||!source.equals(fs.readFileSync(target)))throw Error('Navigation logo is stale: '+target);}
 else{fs.mkdirSync(directory,{recursive:true});fs.writeFileSync(target,source);}
}
