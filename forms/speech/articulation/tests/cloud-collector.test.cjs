// Retired online collector paths must not be reintroduced by configuration or cached settings.
const fs=require('node:fs'),path=require('node:path'),assert=require('node:assert/strict');
const root=path.resolve(__dirname,'..');
for(const file of ['assets/research-share.js','assets/cloud.js','../../aphasia/langiuage-cognitive/assets/app.js']){
 const code=fs.readFileSync(path.join(root,file),'utf8');assert.doesNotMatch(code,/sheets\.googleapis|script\.google\.com|accounts\.google\.com\/gsi|sendResearch|researchEndpoint/);
}
assert.equal(fs.existsSync(path.join(root,'cloud/functions/index.cjs')),false);
assert.equal(JSON.parse(fs.readFileSync(path.join(root,'cloud/firebase.json'))).functions,undefined);
assert.match(fs.readFileSync(path.join(root,'assets/cloud.js'),'utf8'),/signInWithPopup/);
console.log('PASS: online spreadsheet transports and collector deployment removed; personal Google sync retained.');
