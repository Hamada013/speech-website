const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path'),vm=require('node:vm');
const root=path.resolve(__dirname,'..'),context={window:{}};vm.createContext(context);
for(const file of ['stimuli','stimulus-data'])vm.runInContext(fs.readFileSync(path.join(root,'assets',file+'.js'),'utf8'),context);
const {cards,sets}=context.window.VB_PICTURE_DATA;
assert.equal(Object.keys(sets).length,60);assert.equal(Object.keys(cards).length,629);
for(const [key,card]of Object.entries(cards))assert.ok(fs.existsSync(path.join(root,card.src)),key);
const shapeTypes=new Set(['circle','triangle','square','rectangle','star']);
function check(value){if(typeof value==='string')assert.ok(cards[value],value);else{assert.ok(value.text!==undefined||value.dots||shapeTypes.has(value.shape));if(value.dots)assert.ok(value.dots>=1&&value.dots<=5);}}
for(const [id,set]of Object.entries(sets)){
 assert.ok(context.window.VB_STIMULI[id],id);assert.ok(set.pages.length);
 for(const board of set.pages){
  (board.cards||[]).forEach(check);if(board.sample!==undefined)check(board.sample);
  if(board.src)assert.ok(fs.existsSync(path.join(root,board.src)),board.src);
  if(board.cards&&board.type!=='sequence'){const serialized=board.cards.map(x=>JSON.stringify(x));assert.equal(new Set(serialized).size,serialized.length,`No duplicated choices on ${id}`);}
 }
}
for(const [id,count]of [['l1-3',2],['l1-5',4],['l2-6',6],['l2-7',8],['vp2-6',6],['vp2-8',6],['vp2-9',10],['lr2-6',5],['lr2-7',8],['lr2-8',10],['l3-11',6]])assert.ok(sets[id].pages.every(page=>page.cards.length===count),id);
assert.equal(sets['l2-6'].pages.length,40);assert.equal(sets['vp2-6'].pages.length,25);
assert.equal(new Set(sets['vp3-15'].pages.map(p=>JSON.stringify(p.cards))).size,20,'Twenty different three-step patterns');
assert.equal(sets['w3-15'].pages.length,26);assert.equal(sets['vp3-13'].pages.length,20);
for(const page of sets['vp2-6'].pages)assert.equal(page.cards.filter(k=>k===page.sample).length,1);
for(const page of sets['vp2-9'].pages){assert.ok(!page.cards.includes(page.sample));const label=cards[page.sample].label.ar;assert.equal(page.cards.filter(k=>cards[k].label.ar.replace(/[أإآ]/g,'ا')===label.replace(/[أإآ]/g,'ا')).length,1);}
assert.equal(sets['li2-8'],undefined);assert.equal(sets['li2-9'],undefined);
const html=fs.readFileSync(path.join(root,'index.html'),'utf8');for(const file of ['stimulus-data','stimulus-viewer'])assert.ok(html.includes(`assets/${file}.js`));
console.log('PASS: 60 picture tasks, all local files, choice counts, distinct alternatives, exact/alternate matching, geometry, 26 letter pairs and protected observation tasks.');
