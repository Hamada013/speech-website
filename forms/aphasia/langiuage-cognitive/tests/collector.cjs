const fs=require('node:fs'),vm=require('node:vm'),assert=require('node:assert/strict');
// In-memory SpreadsheetApp double: exercises actual collector writes without patient or cloud data.
class Range{
 constructor(sheet,row,col,rows=1,cols=1){Object.assign(this,{sheet,row,col,rows,cols});}
 getValues(){return Array.from({length:this.rows},(_,r)=>Array.from({length:this.cols},(_,c)=>this.sheet.cells.get(`${this.row+r}:${this.col+c}`)??''));}
 setValues(values){assert.equal(values.length,this.rows);if(this.row+this.rows-1>this.sheet.maxRows)throw Error('Range exceeds sheet grid');values.forEach((row,r)=>{assert.equal(row.length,this.cols);row.forEach((value,c)=>this.sheet.cells.set(`${this.row+r}:${this.col+c}`,value));});return this;}
 setValue(v){return this.setValues([[v]]);}
 clearContent(){for(let r=0;r<this.rows;r++)for(let c=0;c<this.cols;c++)this.sheet.cells.delete(`${this.row+r}:${this.col+c}`);return this;}
}
for(const method of ['setBackground','setFontColor','setFontWeight','setFontSize','setNumberFormat'])Range.prototype[method]=function(){return this;};
class Sheet{
 constructor(name){this.name=name;this.cells=new Map();this.maxRows=1000;this.charts=[];}
 getRange(row,col,rows,cols){if(typeof row==='string'){const [,letters,num]=row.match(/^([A-Z]+)(\d+)$/);row=Number(num);col=[...letters].reduce((n,c)=>n*26+c.charCodeAt(0)-64,0);}return new Range(this,row,col,rows,cols);}
 getLastRow(){return Math.max(0,...[...this.cells].filter(([,v])=>v!=='').map(([k])=>Number(k.split(':')[0])));}
 getLastColumn(){return Math.max(0,...[...this.cells].map(([k])=>Number(k.split(':')[1])));}
 getMaxRows(){return this.maxRows;}
 insertRowsAfter(row,count){this.maxRows+=count;}
 getCharts(){return [...this.charts];}
 removeChart(chart){this.charts=this.charts.filter(c=>c!==chart);}
 clear(){this.cells.clear();}
 newChart(){const builder={};for(const m of ['setChartType','addRange','setNumHeaders','setPosition','setOption'])builder[m]=()=>builder;builder.build=()=>({chart:true});return builder;}
 insertChart(chart){this.charts.push(chart);}
}
for(const m of ['setHiddenGridlines','setColumnWidths','setColumnWidth','setFrozenRows'])Sheet.prototype[m]=function(){return this;};
const sheets=new Map(),book={getSheetByName:name=>sheets.get(name),insertSheet:name=>{const s=new Sheet(name);sheets.set(name,s);return s;}},properties={DEVICE_KEY:'ephemeral-test-key',WORKBOOK_ID:'test-workbook'},lock={waitLock(){},hasLock:()=>true,releaseLock(){}};
const context={Set,Charts:{ChartType:{LINE:'line'}},PropertiesService:{getScriptProperties:()=>({getProperty:key=>properties[key]})},LockService:{getScriptLock:()=>lock},SpreadsheetApp:{openById:()=>book,flush(){}},ContentService:{MimeType:{JSON:'json'},createTextOutput:value=>({setMimeType:()=>JSON.parse(value)})}};
vm.createContext(context);vm.runInContext(fs.readFileSync(require.resolve('../research/Collector.gs'),'utf8'),context);
const catalog=Array.from({length:197},(_,n)=>({id:'item-1-'+(n+1),section:1,label:'Fixture '+n,observation:false}));
function payload(id,count,revision){return {version:1,revision,token:properties.DEVICE_KEY,catalog,case:{id,name:'Fixture '+id,assessments:Array.from({length:count},(_,n)=>({id:id+'-assessment-'+n,createdAt:'2026-10-27T00:00:00Z',state:{fields:{currentDate:'2026-10-27',name:'=TEXT(1)'},responses:{'item-1-1':'correct','item-1-2':'incorrect'},supports:{'item-1-1':'independent'},comments:{'item-1-1':'=IMPORTXML("fixture")'},notes:{0:'Fixture note'}}}))}};}
const send=p=>context.doPost({postData:{contents:JSON.stringify(p)}});
let p=payload('case-a',6,1),receipt=send(p);assert.equal(receipt.ok,true);assert.equal(receipt.items,1182);assert.equal(sheets.get('Items').getLastRow(),1183);assert.equal(sheets.get('Case_casea').getCharts().length,1);assert.ok(sheets.get('Case_casea').getMaxRows()>1000);
assert.equal(send(p).ok,true);assert.equal(sheets.get('Items').getLastRow(),1183);assert.equal(sheets.get('Case_casea').getCharts().length,1);
assert.equal(send(payload('case-b',1,1)).ok,true);assert.equal(sheets.get('Cases').getLastRow(),3);p.revision=2;p.case.assessments[0].state.responses['item-1-2']='correct';assert.equal(send(p).ok,true);assert.equal(sheets.get('Items').getLastRow(),1380);assert.equal(sheets.get('Assessments').getLastRow(),8);
assert.equal(sheets.get('Assessments').getRange(2,8).getValues()[0][0],1);assert.equal(send(payload('case-a',6,1)).ok,false);p.token='incorrect';assert.equal(send(p).ok,false);assert.equal(sheets.get('Cases').getLastRow(),3);
const originalSet=Range.prototype.setValues;Range.prototype.setValues=function(values){if(this.sheet.name==='Items'&&values[0]?.[0]==='case-a')throw Error('Simulated interrupted write');return originalSet.call(this,values);};p.token=properties.DEVICE_KEY;p.revision=3;assert.equal(send(p).ok,false);const otherRows=sheets.get('Items').getRange(2,1,sheets.get('Items').getLastRow()-1,8).getValues().filter(r=>r[0]==='case-b');assert.equal(otherRows.length,197);Range.prototype.setValues=originalSet;assert.equal(send(p).ok,true);
assert.ok([...sheets.get('Items').cells.values()].includes('\'=IMPORTXML("fixture")'));
console.log('Aphasia collector: multi-case upserts, 1,182-item case tab, charts, retry idempotency, revision/key rejection and formula-safe text passed');
