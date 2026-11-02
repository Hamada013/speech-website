/* Local, reproducible picture library. No network and no child data. */
const fs=require('node:fs'),path=require('node:path'),vm=require('node:vm');
const root=path.resolve(__dirname,'..'),repo=path.resolve(root,'../../..');
const context={window:{}};vm.createContext(context);vm.runInContext(fs.readFileSync(path.join(repo,'tools/VSS/voc/assets/game-data.js'),'utf8'),context);
const source=context.window.VOC_GAME_DATA.categories,all=source.flatMap(c=>c.items),byKey=new Map(all.map(i=>[i.key,i]));
const used=new Set(),sets={},cards={};
const norm=s=>s.replace(/[أإآ]/g,'ا').replace(/[\u064b-\u065f\s]/g,'');
const physical=new Set([3,5,6,7,8,10,11,15,16,17,18,19,20,21,22,23,24,26,27,28,29,30,31,34,35,36,37]);
const unique=items=>{const seen=new Set();return items.filter(i=>{const n=norm(i.name);if(seen.has(n))return false;seen.add(n);return true;});};
const objects=unique(all.filter(i=>physical.has(i.catId))),actions=source.find(c=>c.id===2).items;
const common='6_1 10_2 11_17 11_29 10_9 11_11 10_6 15_4 15_2 6_3 11_10 22_17 11_30 11_25 11_6 11_12 11_34 11_20 11_38 10_24 15_10 15_5 15_6 23_7 23_4 10_26 22_6 22_15 22_20 11_2 7_5 6_15 5_3 5_21 5_36 5_12 10_10 11_4 11_5 11_41'.split(' ').map(k=>byKey.get(k));
if(common.some(i=>!i))throw Error('Unknown common object');
function key(item){if(typeof item==='string'){if(!byKey.has(item))throw Error(item);used.add(item);return item;}used.add(item.key);return item.key;}
function page(images,type='array',extra={}){return{type,cards:images.map(i=>typeof i==='object'&&!i.key?i:key(i)),...extra};}
function set(id,pages,note){sets[id]={pages,note:note||null};}
const single=items=>items.map(i=>page([i],'single'));
function array(target,size,index=0,similar=false,pool=objects){
 const others=pool.filter(i=>norm(i.name)!==norm(target.name));
 const near=similar?others.filter(i=>i.catId===target.catId).slice(0,3):[];
 const selected=[target,...near];
 for(let n=0;selected.length<size&&n<others.length;n++){const item=others[(index*7+n)%others.length];if(!selected.some(j=>j.key===item.key))selected.push(item);}
 // Every target appears in a rotating location; no visible answer cue.
 const shift=index%size;return selected.slice(shift).concat(selected.slice(0,shift));
}
function arrays(items,size,matching=false,similar=false){return items.map((item,i)=>page(array(item,size,i,similar),matching?'matching':'array',{messy:true,...(matching?{sample:key(item)}:{})}));}
const support={en:'Supplementary pictures. Select familiar targets and follow the task instructions; pictures do not replace real objects, live actions, pronoun interaction, or observation. The supplied pages alone do not establish completion of the milestone.',ar:'صور مساندة. اختر أهدافاً مألوفة واتبع تعليمات البند؛ لا تستبدل الصور الأشياء الحقيقية أو الأفعال الحية أو تفاعل الضمائر أو الملاحظة. عرض الصفحات المرفقة وحده لا يعني استيفاء معيار البند.'};
set('m1-1',[page(common.slice(0,2)),page([common[4],common[18]])],{en:'Choose genuinely motivating items; offer the actual reinforcer when appropriate.',ar:'اختر أشياء معززة فعلاً للطفل وقدّم المعزز الحقيقي عند ملاءمته.'});
for(const [id,count]of [['t1-1',2],['t1-2',4],['t1-3',6],['t1-4',10],['t1-5',10],['t2-6',25],['t2-10',200],['t3-15',objects.length]])set(id,single((id==='t2-10'||id==='t3-15'?objects:common).slice(0,count)));
set('l1-3',arrays(common.slice(0,5),2),{en:'Use these only if they are known reinforcers. Actual familiar people or pets need personal photos or live presentation.',ar:'استخدم هذه الصور فقط إذا كانت معززات معروفة للطفل. يتطلب عرض أشخاص أو حيوانات مألوفة صورهم الشخصية أو وجودهم الحقيقي.'});
set('l1-5',arrays(common.slice(0,20),4));set('vp1-3',[page([common[5]],'single'),page([common[6]],'single')]);set('vp1-5',arrays(common.slice(0,10),4,true));
set('t2-8',single(actions.slice(0,10)));set('t2-9',single(actions));
set('l2-6',arrays(common,6));set('l2-10',arrays(objects.slice(0,250),6));set('l3-15',arrays(objects,6));
set('vp2-6',arrays(common.slice(0,25),6,true));set('vp2-8',arrays(objects.filter(i=>[15,16,20,21,22,23,24].includes(i.catId)).slice(0,25),6,true,true));
// Real alternate illustrations, not mirrored copies or color filters.
const groups=new Map();for(const item of all.filter(i=>physical.has(i.catId))){const name=norm(item.name);if(!groups.has(name))groups.set(name,[]);const group=groups.get(name);if(!group.some(i=>i.imageHash===item.imageHash))group.push(item);}
const variants=[...groups.values()].filter(g=>g.length>=2);
set('t2-7',variants.slice(0,50).flatMap(g=>single(g)));
set('l2-7',variants.slice(0,50).flatMap(g=>g.map((item,i)=>page(array(item,8,i,true),'array',{messy:true}))));
const nonidentical=variants.slice(0,25).map((g,i)=>page(array(g[1],10,i,true),'matching',{sample:key(g[0]),messy:true}));
set('vp2-9',nonidentical);set('vp3-12',nonidentical);
set('vp2-10',arrays(common.slice(0,25),10,false,true),{en:'Use the pictured item as one side only. Prepare the corresponding real object and similar physical distractors for both 3D/2D directions.',ar:'استخدم الصورة كطرف واحد فقط. جهّز الشيء الحقيقي المقابل ومشتتات حقيقية متشابهة لفحص الاتجاهين بين المجسم والصورة.'});
const foods=source.filter(c=>[5,6,7,8].includes(c.id)).flatMap(c=>c.items);
const nonfood=objects.filter(i=>![3,5,6,7,8,15,16,17,18,19,20,21].includes(i.catId));
set('lr2-6',foods.slice(0,10).map((item,n)=>{const choices=[item,...nonfood.slice(n,n+4)];return page(choices.slice(n%5).concat(choices.slice(0,n%5)),'array',{messy:true});}));
for(const id of ['lr2-7','lr2-8','lr2-9','lr2-10','lr3-11','lr3-14','lr3-15'])set(id,arrays(common.slice(0,25),id==='lr2-7'?8:10,false,true));
set('li2-6',single(common.slice(0,10)),{en:'The judging listener must not see the stimulus. These ten pictures are for the child only.',ar:'يجب ألا يرى المستمع الذي يحكم على وضوح الكلام المثير. هذه الصور العشر للطفل فقط.'});
set('t3-11',single([common[0],common[1],common[2],common[5],common[9]]));
set('t3-12',single(source.find(c=>c.id===12).items),{en:'Pictures support spatial vocabulary only. Assess the four pronouns through live interaction with the child and familiar objects.',ar:'تساند الصور مفردات المكان فقط. قيّم الضمائر الأربعة بتفاعل حي مع الطفل وأشياء مألوفة.'});
set('t3-13',single(source.find(c=>c.id===33).items.filter(i=>[23,24,55,56,87,88,93,94].includes(i.id))));
set('l3-13',[[23,24],[87,88],[93,94],[53,54]].map(ids=>page(ids.map(id=>`33_${id}`))),{en:'Use these for visual comparison only. Relative adverbs require live actions, movement or sound as specified in the task.',ar:'استخدم الصور للمقارنات البصرية فقط. تتطلب الظروف النسبية أفعالاً حية أو حركة أو صوتاً وفق البند.'});
const colors=['#e64b45','#3979c3','#e4b83c','#4e9b64','#985bb3','#ed8b32','#e68cb3','#644b3d','#202b34','#8995a2'];
const shapes=['circle','square','triangle','rectangle','star'];
const token=(shape,color,extra={})=>({shape,color,...extra});
set('vp2-7',[...colors.map((color,i)=>page([token('circle',color),token('triangle',color),...shapes.slice(1,4).map((shape,j)=>token(shape,colors[(i+j+1)%colors.length]))],'matching',{sample:token('square',color)})),...shapes.map((shape,i)=>page([token(shape,colors[0]),token(shape,colors[1]),...shapes.filter(s=>s!==shape).slice(0,3).map((s,j)=>token(s,colors[j+2]))],'matching',{sample:token(shape,colors[6])}))]);
const shapeItems=colors.slice(0,4).flatMap(color=>shapes.slice(0,4).map(shape=>token(shape,color)));
set('l3-11',shapeItems.map((target,i)=>page([target,...shapeItems.filter(t=>t.shape!==target.shape||t.color!==target.color).slice(i%7,i%7+5)].map(x=>x),'array')));
set('vp3-11',Array.from({length:2},(_,i)=>({type:'blocks',design:i,pieces:8})),{en:'Model cards for a real arts/crafts activity. Provide matching physical pieces and observe spontaneous matching.',ar:'نماذج لنشاط فنون حقيقي. قدّم القطع المادية المقابلة ولاحظ المطابقة التلقائية.'});
set('vp3-13',Array.from({length:20},(_,i)=>({type:'blocks',design:i,pieces:8})),{en:'Provide eight or more real blocks or puzzle pieces; these are models, not a screen-based completion test.',ar:'قدّم ثمانية مكعبات أو قطع أحجية حقيقية أو أكثر؛ هذه نماذج وليست اختبار إكمال على الشاشة.'});
const categoryIds=[6,15,22,23,24];set('vp3-14',categoryIds.flatMap(id=>single(source.find(c=>c.id===id).items.slice(0,5))),{en:'Print or use real objects for independent sorting into five categories, with no visible category model.',ar:'اطبع الصور أو استخدم الأشياء الحقيقية للتصنيف المستقل إلى خمس فئات، دون نموذج فئة ظاهر.'});
set('vp3-15',Array.from({length:20},(_,i)=>page(Array.from({length:6},(_,j)=>token(shapes[(i+j%3)%5],colors[(Math.floor(i/5)+j%3)%10])),'sequence')));
const letters='ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('');
set('r3-12',letters.slice(0,10).map((letter,i)=>page(Array.from({length:5},(_,j)=>({text:letters[(i+j)%26]})))));
set('r3-13',letters.slice(0,10).map(text=>page([{text}],'single')));
set('r3-14',[{type:'name',cards:[]}],{en:'Uses the active child’s name. Check spelling and the intended reading language before presenting.',ar:'يعرض اسم الطفل النشط. راجع التهجئة ولغة القراءة المستهدفة قبل العرض.'});
set('r3-15',common.slice(0,5).flatMap((item,i)=>[page(array(item,4,i),'matching',{sample:{text:item.name}}),page(common.slice(0,5).map(i=>({text:i.name})),'matching',{sample:key(item)})]));
set('w3-12',shapes.map(shape=>page([token(shape,'#fff',{outline:true})],'tracing')));
set('w3-13',[...'ABCDE12345'].map(text=>page([{text}],'copy')));
set('w3-15',letters.map(text=>page([{text:text+' '+text.toLowerCase()}],'copy')));
set('ma3-11',Array.from({length:5},(_,i)=>page(Array.from({length:5},(_,j)=>({text:String(1+(i+j)%5)})))));
set('ma3-12',Array.from({length:5},(_,i)=>page([{text:String(i+1)}],'single')));
set('ma3-14',[['big','small'],['long','short'],['thick','thin'],['full','empty']].flatMap(pair=>[pair,pair.slice().reverse()]).map(comparison=>({type:'comparison',comparison})),{en:'Eight visual comparison prompts. Auditory comparisons such as loud/quiet still require actual sound.',ar:'ثمانية مثيرات مقارنة بصرية. تتطلب المقارنات السمعية مثل عالٍ/هادئ صوتاً حقيقياً.'});
set('ma3-15',Array.from({length:5},(_,i)=>[page(Array.from({length:5},(_,j)=>({dots:j+1})),'matching',{sample:{text:String(i+1)}}),page(Array.from({length:5},(_,j)=>({text:String(j+1)})),'matching',{sample:{dots:i+1}})]).flat());
// Original flat-cartoon scenes; each file is also usable as a page in a short read-aloud book.
const sceneNames=['park','kitchen','classroom','bedroom'];
const scenes=sceneNames.map(name=>({type:'scene',src:`images/scene-${name}.webp`,alt:{en:`Simple cartoon ${name} scene`,ar:({park:'مشهد الحديقة',kitchen:'مشهد المطبخ',classroom:'مشهد الصف',bedroom:'مشهد غرفة النوم'})[name]}}));
for(const id of ['t3-14','lr3-12','lr3-13','li3-13','r3-11'])set(id,scenes);
for(const id of used){const item=byKey.get(id);cards[id]={src:`images/cards/${id}.webp`,label:{ar:item.name,en:item.name},category:item.catId};}
const directory=path.join(root,'images/cards');fs.mkdirSync(directory,{recursive:true});
for(const id of used){const sourceFile=path.join(repo,'tools/VSS/voc',byKey.get(id).image),target=path.join(directory,id+'.webp');fs.copyFileSync(sourceFile,target);}
const library={version:1,cards,sets,support,provenance:{objects:'Existing repository VOC cartoon library, copied locally; no dependency on VSS at runtime.',scenes:'Four original simple cartoon illustrations generated with built-in ImageGen on 2026-10-31.'}};
fs.writeFileSync(path.join(root,'assets/stimulus-data.js'),'/* Generated by scripts/build-stimuli.cjs. */\nwindow.VB_PICTURE_DATA = '+JSON.stringify(library)+';\n');
fs.writeFileSync(path.join(root,'images/library.json'),JSON.stringify({cards:Object.keys(cards).length,tasks:Object.keys(sets).length,pages:Object.values(sets).reduce((n,s)=>n+s.pages.length,0),sets:Object.fromEntries(Object.entries(sets).map(([id,s])=>[id,{pages:s.pages.length,types:[...new Set(s.pages.map(p=>p.type))],note:s.note}]))},null,2)+'\n');
console.log(`${Object.keys(sets).length} task sets, ${Object.keys(cards).length} local cartoon cards, ${Object.values(sets).reduce((n,s)=>n+s.pages.length,0)} pages. Generated scenes are prepared separately.`);
