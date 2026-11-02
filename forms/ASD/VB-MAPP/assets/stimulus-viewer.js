/* Supplementary child-facing picture sets; scoring remains with the assessor. */
(() => {
 'use strict';
 const data=window.VB_PICTURE_DATA;
 if(!data)return;
 for(const [id,set] of Object.entries(data.sets)){
  const entry=window.VB_STIMULI[id];if(!entry)continue;
  entry.boards=set.pages;entry.pictureNote=set.note;entry.prepared=true;
 }
 const svgNS='http://www.w3.org/2000/svg';
 function shape(token){
  const svg=document.createElementNS(svgNS,'svg');svg.setAttribute('viewBox','0 0 200 200');svg.setAttribute('role','img');svg.setAttribute('aria-label',token.shape);
  const node=document.createElementNS(svgNS,({circle:'circle',triangle:'polygon',star:'polygon'})[token.shape]||'rect');
  const attributes=token.shape==='circle'?{cx:100,cy:100,r:70}:token.shape==='triangle'?{points:'100,24 178,166 22,166'}:token.shape==='star'?{points:'100,18 122,72 180,78 137,117 150,176 100,145 50,176 63,117 20,78 78,72'}:token.shape==='rectangle'?{x:18,y:52,width:164,height:96,rx:3}:{x:30,y:30,width:140,height:140,rx:3};
  for(const [name,value]of Object.entries({...attributes,fill:token.color||'#3979c3',stroke:token.outline?'#263b48':'#263b48','stroke-width':token.outline?3:2}))node.setAttribute(name,value);
  svg.append(node);return svg;
 }
 function prepare(page,{lang='ar',childName=''}={}){
  const element=document.createElement('div');element.className='stimulus-board stimulus-'+(page.type==='array'?'array-page':page.type);element.dataset.boardType=page.type;
  const pending=[];let observer;
  function picture(src,alt){const image=new Image();image.alt=alt||'';image.decoding='async';image.draggable=false;pending.push(new Promise((resolve,reject)=>{image.onload=resolve;image.onerror=()=>reject(Error('Missing stimulus: '+src));}));image.src=src;return image;}
  function cell(value){
   const card=document.createElement('div');card.className='stimulus-picture';
   if(typeof value==='string'){const item=data.cards[value];if(!item)throw Error('Unknown picture '+value);card.append(picture(item.src,item.label[lang]||item.label.ar));}
   else if(value.shape)card.append(shape(value));
   else if(value.text!==undefined){const text=document.createElement('span');text.className='stimulus-symbol';text.dir='auto';text.textContent=value.text;card.append(text);}
   else if(value.dots){card.classList.add('stimulus-quantity');card.setAttribute('role','img');card.setAttribute('aria-label',String(value.dots));for(let i=0;i<value.dots;i++){const dot=document.createElement('span');dot.className='stimulus-dot';dot.setAttribute('aria-hidden','true');card.append(dot);}}
   return card;
  }
  if(page.type==='scene')element.append(picture(page.src,page.alt?.[lang]||''));
  else if(page.type==='name'){
   if(childName.trim())element.append(cell({text:childName.trim()}));
   else{const hint=document.createElement('p');hint.className='stimulus-no-name';hint.textContent=lang==='ar'?'أدخل اسم الطفل في بيانات الحالة أولاً.':'Enter the child’s name in case details first.';element.append(hint);}
  }else if(page.type==='blocks'){
   // Eight individual pieces remain visually distinct in the assessor's model.
   const layout=document.createElement('div');layout.className='stimulus-block-model';layout.style.setProperty('--model-columns',8);
   for(let i=0;i<page.pieces;i++){const block=document.createElement('div');block.className='stimulus-block';block.style.background=['#e64b45','#3979c3','#e4b83c','#4e9b64'][(i+page.design)%4];block.style.gridColumn=String((i<4?i+page.design%5:i-4+Math.floor(page.design/5))+1);block.style.gridRow=String(i<4?1:2);layout.append(block);}element.append(layout);
  }else if(page.type==='comparison'){
   for(const kind of page.comparison){const c=document.createElement('div');c.className='stimulus-compare stimulus-compare-'+kind;c.setAttribute('role','img');c.setAttribute('aria-label',kind);const object=document.createElement('span');object.className='comparison-object';c.append(object);element.append(c);}
  }else{
   const grid=document.createElement('div');grid.className='stimulus-array';grid.dataset.count=page.cards.length;grid.classList.toggle('is-messy',!!page.messy);
   page.cards.forEach((value,i)=>{const c=cell(value);if(page.messy){c.style.setProperty('--offset-x',`${(i*7%13)-6}px`);c.style.setProperty('--offset-y',`${(i*11%13)-6}px`);}grid.append(c);});element.append(grid);
   observer=new ResizeObserver(()=>{const rect=grid.getBoundingClientRect(),style=getComputedStyle(grid),width=rect.width-parseFloat(style.paddingLeft)-parseFloat(style.paddingRight),height=rect.height-parseFloat(style.paddingTop)-parseFloat(style.paddingBottom),count=page.cards.length;if(width<=0||height<=0||!count)return;let best={size:0,cols:1,rows:count};for(let cols=1;cols<=Math.min(count,6);cols++){const rows=Math.ceil(count/cols),size=Math.min((width-(cols-1)*12)/cols,(height-(rows-1)*12)/rows);if(size>best.size)best={size,cols,rows};}grid.style.setProperty('--cell-size',`${Math.floor(best.size)}px`);grid.style.setProperty('--cols',best.cols);grid.style.setProperty('--rows',best.rows);});observer.observe(grid);
   if(page.sample!==undefined){const sample=document.createElement('div');sample.className='stimulus-sample';sample.setAttribute('role','group');sample.setAttribute('aria-label',lang==='ar'?'نموذج المطابقة':'Matching sample');sample.append(cell(page.sample));element.append(sample);}
  }
  return {element,ready:Promise.all(pending),dispose:()=>observer?.disconnect()};
 }
 window.VBPictureLibrary={prepare,data};
})();
