// Copies of shared form helpers. Edit the source in scripts/shared/, then run this (or --check).
const fs=require('node:fs'),path=require('node:path');
const ROOT=path.resolve(__dirname,'..'),SHARED=path.join(__dirname,'shared'),check=process.argv.includes('--check');
const copies=[
 // Research collectors share one reset confirmation.
 ['workbook-reset.js','forms/speech/articulation/assets/workbook-reset.js'],
 ['workbook-reset.js','forms/aphasia/langiuage-cognitive/assets/workbook-reset.js'],
 ['styled-dropdowns.js','forms/Hearing/ling_test/assets/styled-dropdowns.js'],
 ['styled-dropdowns.css','forms/Hearing/ling_test/assets/styled-dropdowns.css']
];
for(const [file,to] of copies){
 const source=fs.readFileSync(path.join(SHARED,file)),target=path.join(ROOT,to);
 if(check){if(!fs.existsSync(target)||!source.equals(fs.readFileSync(target)))throw Error('Shared copy is stale: '+to);}
 else fs.writeFileSync(target,source);
}
console.log(`${check?'Checked':'Synced'} ${copies.length} shared form files.`);
