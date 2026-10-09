// Component checks for styled selects: value sync, event delivery, keyboard selection and outside closure.
const vm=require('node:vm'),fs=require('node:fs'),path=require('node:path'),assert=require('node:assert/strict');
class Node {
 constructor(tag='div'){this.tagName=tag.toUpperCase();this.children=[];this.childNodes=this.children;this.listeners={};this.attributes={};this.style={};this.hidden=false;this.textContent='';this.className='';this.classList={toggle:(name,on)=>{this.attributes['class-'+name]=on;}};}
 append(...nodes){for(const node of nodes){this.children.push(node);node.parentElement=this;}}
 replaceWith(next){const owner=this.parentElement;owner.children.splice(owner.children.indexOf(this),1,next);next.parentElement=owner;}
 replaceChildren(){this.children=[];this.childNodes=this.children;}
 setAttribute(k,v){this.attributes[k]=v;}removeAttribute(k){delete this.attributes[k];}
 addEventListener(type,fn){(this.listeners[type]??=[]).push(fn);}dispatchEvent(event){event.target=this;for(const fn of this.listeners[event.type]||[])fn(event);return true;}
 focus(){this.focused=true;}contains(node){return node===this||this.children.some(child=>child.contains?.(node));}
 scrollIntoView(){}getBoundingClientRect(){return{top:100,bottom:154};}
 querySelector(tag){return this.children.find(child=>child.tagName===tag.toUpperCase())||null;}
 get scrollHeight(){return this.children.length*50;}
}
class Select extends Node {
 constructor(id){super('select');this.id=id;this.options=[{textContent:'لم يُحدد',value:''},{textContent:'حضوري',value:'حضوري'},{textContent:'عن بُعد',value:'عن بُعد'}];this.index=0;for(let i=0;i<this.options.length;i++)Object.defineProperty(this.options[i],'selected',{get:()=>this.index===i});}
 get selectedOptions(){return [this.options[this.index]];}get selectedIndex(){return this.index;}set selectedIndex(i){this.index=i;}
 get value(){return this.options[this.index].value;}set value(v){const i=this.options.findIndex(o=>o.value===v);if(i>=0)this.index=i;}
}
const outer=new Node(),label=new Node('label'),select=new Select('procedure');label.className='wide';label.append({nodeType:3,textContent:'طريقة الإجراء'},select);outer.append(label);
const docEvents={};const document={querySelectorAll:()=>[select],createElement:tag=>new Node(tag),addEventListener:(type,fn)=>{(docEvents[type]??=[]).push(fn);}};
class Event{constructor(type,options){this.type=type;Object.assign(this,options);}}
const context={document,window:{innerHeight:800},Event};vm.createContext(context);vm.runInContext(fs.readFileSync(path.resolve(__dirname,'../assets/dropdowns.js'),'utf8'),context);
const run=code=>vm.runInContext(code,context);run('enhanceDropdowns()');assert.equal(select.hidden,true);
const control=run('styledDropdowns.values().next().value'),wrap=control.wrap,trigger=wrap.children[0],list=wrap.children[1];
assert.equal(outer.children[0].children[0].textContent,'طريقة الإجراء');assert.equal(trigger.attributes.role,'combobox');assert.equal(list.attributes.role,'listbox');assert.equal(trigger.children[0].textContent,'لم يُحدد');
trigger.dispatchEvent(new Event('click'));assert.equal(list.hidden,false);assert.equal(trigger.attributes['aria-expanded'],'true');
let inputs=0,changes=0;select.addEventListener('input',()=>inputs++);select.addEventListener('change',()=>changes++);
let keptFocus=false;list.children[2].dispatchEvent({type:'mousedown',preventDefault(){keptFocus=true;}});assert.equal(keptFocus,true);
list.children[2].dispatchEvent(new Event('click'));assert.equal(select.value,'عن بُعد');assert.equal(inputs,1);assert.equal(changes,1);assert.equal(list.hidden,true);assert.equal(trigger.children[0].textContent,'عن بُعد');
select.value='حضوري';run('enhanceDropdowns()');assert.equal(trigger.children[0].textContent,'حضوري');assert.equal(run('styledDropdowns.size'),1);
const key=k=>trigger.dispatchEvent({type:'keydown',key:k,preventDefault(){},stopPropagation(){}});
key('ArrowDown');assert.equal(list.hidden,false);key('ArrowDown');key('Enter');assert.equal(select.value,'عن بُعد');
trigger.dispatchEvent(new Event('click'));key('Escape');assert.equal(list.hidden,true);
trigger.dispatchEvent(new Event('click'));docEvents.click.forEach(fn=>fn({target:outer}));assert.equal(list.hidden,true);
trigger.dispatchEvent(new Event('click'));key('Home');key('Enter');assert.equal(select.value,'');
trigger.dispatchEvent(new Event('click'));key('End');key('Enter');assert.equal(select.value,'عن بُعد');
trigger.dispatchEvent(new Event('click'));key('Tab');assert.equal(list.hidden,true);
console.log('Passed: styled select label/value sync, accessible roles, option selection, input/change delivery, programmatic restore, keyboard selection, Escape/Tab and outside-click closure.');
