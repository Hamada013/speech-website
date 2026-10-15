const fs=require('node:fs'),path=require('node:path'),vm=require('node:vm'),crypto=require('node:crypto'),assert=require('node:assert/strict');
const root=path.resolve(__dirname,'..'),voc=path.resolve(root,'../voc'),ctx={self:{}};
vm.runInNewContext(fs.readFileSync(path.join(root,'assets/pwa-release.js'),'utf8'),ctx);
const release=ctx.self.TAFFAHA_RELEASE,hash=b=>crypto.createHash('sha256').update(b).digest('hex');
for(const [file,revision]of Object.entries(release.integrity))assert.equal(hash(fs.readFileSync(path.join(root,file))),revision,file);
const unique=new Set();for(const a of release.media){assert.ok(!unique.has(a.url));unique.add(a.url);const body=fs.readFileSync(path.resolve(root,a.url));assert.equal(body.length,a.bytes);assert.equal(hash(body),a.revision);}
const {words}=JSON.parse(fs.readFileSync(path.join(root,'assets/words.json'))),source=fs.readFileSync(path.join(voc,'index.html'),'utf8'),start=source.indexOf('const RAW_CATEGORIES ='),end=source.indexOf('const app =',start);
const categories=vm.runInNewContext(source.slice(start,end)+';JSON.parse(JSON.stringify(CATEGORIES))',{}, {timeout:1000});
const corrections={'voc-5-21':'images/5/29.webp','voc-5-23':'images/5/27.webp','voc-5-25':'images/5/23.webp','voc-5-33':'images/5/35.webp','voc-5-32':'images/5/34.webp'};
assert.equal(new Set(words.map(w=>w.id)).size,words.length);assert.deepEqual([...new Set(words.map(w=>w.syllables.length))].sort(),[1,2,3,4,5]);
for(const word of words){
 const [,folder,number]=word.id.split('-').map((v,i)=>i?v*1:v),item=categories.find(c=>c.id===folder).items.find(w=>w.id===number);
 assert.equal(word.label,item.name);assert.equal(word.audio.path,item.audio,'Title/audio retain their source ID');assert.equal(word.image.path,corrections[word.id]||item.image,'Only reviewed artwork references differ');assert.equal(word.syllableCount,word.syllables.length);
 for(const a of [word.image,word.audio])assert.ok(fs.existsSync(path.join(voc,a.path)));assert.equal(word.image.revision,hash(fs.readFileSync(path.join(voc,word.image.path))));
}
const manifest=JSON.parse(fs.readFileSync(path.join(root,'manifest.json')));assert.equal(manifest.dir,'rtl');assert.equal(manifest.scope,'./');
for(const icon of manifest.icons){const bytes=fs.readFileSync(path.join(root,icon.src)),[w,h]=icon.sizes.split('x').map(Number);assert.equal(bytes.readUInt32BE(16),w);assert.equal(bytes.readUInt32BE(20),h);}
const html=fs.readFileSync(path.join(root,'index.html'),'utf8');assert.ok(html.includes('lang="ar" dir="rtl"'));assert.ok(!/open-settings|settings-dialog|record-target|محاولتك محفوظة|خطوة صغيرة، كلمة كبيرة|أهلًا بك!/.test(html));assert.ok(html.includes('slp.ahmadghanem@gmail.com'));
console.log(`PASS: ${words.length} title/audio mappings, five corrected artwork references, syllable groups 1–5, ${release.shell.length} shell hashes and ${release.media.length} shared media hashes.`);
