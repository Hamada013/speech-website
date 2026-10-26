const fs=require('node:fs'),path=require('node:path');
const root=path.resolve(__dirname,'..');
fs.copyFileSync(path.join(root,'assets/research-schema.js'),path.join(root,'cloud/functions/research-schema.cjs'));
console.log('Prepared shared research schema for cloud deployment.');
