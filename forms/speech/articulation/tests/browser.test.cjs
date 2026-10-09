// Browser-facing compatibility helpers, exercised with native and fallback dialog APIs.
const fs=require('node:fs'),path=require('node:path'),vm=require('node:vm'),assert=require('node:assert/strict');
function fixture(native=true){
 const listeners={},viewportListeners={},timers=[],downloaded=[],revoked=[];
 const classes=()=>{const set=new Set();return{add:name=>set.add(name),remove:name=>set.delete(name),contains:name=>set.has(name)};};
 const dialog={open:false,attrs:{},classList:classes(),events:{},addEventListener(type,fn){this.events[type]=fn},setAttribute(k,v){this.attrs[k]=v;if(k==='open')this.open=true;},removeAttribute(k){delete this.attrs[k];if(k==='open')this.open=false;},querySelector(){return{focus(){}}},querySelectorAll(){return[]},dispatchEvent(event){this.events[event.type]?.(event);return !event.defaultPrevented;}};
 if(native){dialog.showModal=function(){this.open=true};dialog.close=function(){this.open=false;this.events.close?.()};}
 const body={style:{position:'',top:'',left:'',right:'',width:''},append(node){node.parent=this;}};
 const properties={};const doc={body,documentElement:{style:{setProperty:(k,v)=>properties[k]=v},classList:classes()},querySelectorAll:()=>[dialog],addEventListener:(type,fn)=>listeners[type]=fn,createElement(tag){return{className:'',remove(){this.removed=true;},click(){downloaded.push({href:this.href,filename:this.download})}}}};
 const win={scrollX:12,scrollY:250,innerHeight:1024,addEventListener:(type,fn)=>listeners['window-'+type]=fn,scrollTo(x,y){this.restored=[x,y]},visualViewport:{height:900,offsetTop:20,addEventListener:(type,fn)=>viewportListeners[type]=fn}};
 class Event{constructor(type,options={}){this.type=type;Object.assign(this,options);this.defaultPrevented=false;}preventDefault(){this.defaultPrevented=true;}}
 let blob;const context={document:doc,window:win,Blob,Event,URL:{createObjectURL:b=>{blob=b;return'blob:report';},revokeObjectURL:url=>revoked.push(url)},setTimeout:(fn,ms)=>timers.push({fn,ms})};vm.createContext(context);vm.runInContext(fs.readFileSync(path.resolve(__dirname,'../assets/browser.js'),'utf8'),context);
 return{run:code=>vm.runInContext(code,context),dialog,body,win,properties,viewportListeners,listeners,timers,downloaded,revoked,blob:()=>blob};
}
(async()=>{
 const f=fixture();f.context=undefined;
 assert.equal(f.properties['--app-height'],'900px');assert.equal(f.properties['--viewport-top'],'20px');
 assert.equal(f.run("hasOwn(Object.create({inherited:true}),'inherited')"),false);
 f.run("openDialog(document.querySelectorAll('dialog')[0])");assert.equal(f.dialog.open,true);assert.equal(f.body.style.position,'fixed');assert.equal(f.body.style.top,'-250px');
 f.run("openDialog(document.querySelectorAll('dialog')[0])");assert.equal(f.run('openAppDialogs.size'),1);
 f.run("closeDialog(document.querySelectorAll('dialog')[0])");assert.equal(f.body.style.position,'');assert.deepEqual(f.win.restored,[12,250]);assert.equal(f.run('openAppDialogs.size'),0);
 f.win.visualViewport.height=430;f.viewportListeners.resize();assert.equal(f.properties['--app-height'],'430px');
 f.run("downloadTextReport('Arabic report: نص','report.txt')");assert.equal(f.downloaded[0].filename,'report.txt');assert.equal(f.timers[0].ms,60000);assert.equal(f.revoked.length,0);assert.ok((await f.blob().text()).includes('نص'));f.timers[0].fn();assert.deepEqual(f.revoked,['blob:report']);
 const fallback=fixture(false);fallback.run("openDialog(document.querySelectorAll('dialog')[0])");assert.equal(fallback.dialog.open,true);assert.equal(fallback.dialog.attrs['aria-modal'],'true');assert.equal(fallback.dialog.classList.contains('fallback-dialog'),true);
 fallback.run("closeDialog(document.querySelectorAll('dialog')[0])");assert.equal(fallback.dialog.open,false);assert.equal(fallback.body.style.position,'');assert.equal(fallback.dialog._fallbackBackdrop,null);
 console.log('Passed: visual viewport/keyboard sizing, native and fallback dialogs, background scroll restoration, own-property compatibility and delayed UTF-8 download URL cleanup.');
})().catch(error=>{console.error(error);process.exitCode=1;});
