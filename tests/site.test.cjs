'use strict';
const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path'),cp=require('node:child_process'),vm=require('node:vm'),crypto=require('node:crypto');
const root=path.resolve(__dirname,'..'),pages=require('../scripts/site-pages.cjs');
cp.execFileSync(process.execPath,[path.join(root,'scripts/build-site.cjs'),'--check'],{stdio:'inherit'});
const symbols=new Set([...fs.readFileSync(path.join(root,'assets/site/icons.svg'),'utf8').matchAll(/<symbol id="([^"]+)"/g)].map(m=>m[1]));
for(const page of pages){
 const html=fs.readFileSync(path.join(root,page.path),'utf8');
 assert(!/\.gif|cdn\.tailwindcss|fonts\.googleapis|<audio|onerror=/.test(html),page.path+' must use local, static presentation');
 assert.equal((html.match(/aria-current="page"/g)||[]).length,1,page.path+' active navigation');
 for(const match of html.matchAll(/(?:href|src)="([^"]+)"/g)){
  const value=match[1];if(/^(?:https?:|mailto:|tel:|#)/.test(value))continue;
  const [file,fragment]=value.split('#'),resolved=path.resolve(root,path.dirname(page.path),decodeURIComponent(file.split('?')[0]));
  assert(resolved.startsWith(root+path.sep),page.path+' escaped site root');
  assert(fs.existsSync(resolved),page.path+' missing local target '+value);
  if(file.endsWith('icons.svg'))assert(symbols.has(fragment),'Unknown icon '+fragment);
 }
 for(const section of page.sections)for(const card of section.cards){assert(symbols.has(card.icon),'Card icon '+card.icon);assert(card.ar&&card.arDescription,'Bilingual card required');}
}
assert.deepEqual(fs.readFileSync(path.join(root,'assets/site/brand/logo.webp')),fs.readFileSync(path.join(root,'tools/VSS/voc/images/logo.webp')),'Main site uses the VOC artwork');
const context={self:{}};vm.runInNewContext(fs.readFileSync(path.join(root,'assets/site/pwa-release.js'),'utf8'),context);const release=context.self.SPEECH_SITE_RELEASE;
for(const file of release.shell){assert.equal(crypto.createHash('sha256').update(fs.readFileSync(path.join(root,file))).digest('hex'),release.integrity[file],'Offline file integrity: '+file);assert(!/^(tools|forms)\//.test(file)||pages.some(p=>p.path===file),'Only directory pages belong in the root cache');}
const manifest=JSON.parse(fs.readFileSync(path.join(root,'manifest.webmanifest'),'utf8'));assert.equal(manifest.scope,'./');assert.equal(manifest.display,'standalone');for(const icon of manifest.icons)assert(fs.existsSync(path.join(root,icon.src)));
console.log('PASS: 12 consistent directories, nested local links, bilingual content, SVG symbols, VOC logo and complete main-site PWA integrity.');
