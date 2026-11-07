// Local research collector for the language-cognitive assessment. Binds to this computer only.
// Run from this folder: node scripts/research-server.mjs     Add a downloaded file: node scripts/research-server.mjs --import file.json
import http from 'node:http';import fs from 'node:fs/promises';import path from 'node:path';import {fileURLToPath} from 'node:url';import {createRequire} from 'node:module';
import {buildWorkbook,DEFAULT_SETTINGS} from './workbook.mjs';
const require=createRequire(import.meta.url),R=require('../assets/research.js');
const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..'),port=Number(process.env.RESEARCH_PORT??8878),dir=process.env.RESEARCH_DIR?path.resolve(process.env.RESEARCH_DIR):path.join(root,'research');
const dataFile=path.join(dir,'dataset.json'),bookFile=path.join(dir,'language-cognitive-research.xlsx'),settingsFile=path.join(dir,'settings.json');
const mime={'.html':'text/html; charset=utf-8','.js':'text/javascript; charset=utf-8','.css':'text/css; charset=utf-8','.png':'image/png','.jpeg':'image/jpeg','.jpg':'image/jpeg','.webp':'image/webp','.svg':'image/svg+xml','.webmanifest':'application/manifest+json','.json':'application/json'};
const empty=()=>({version:1,catalog:[],assessments:[]});
const text=(v,max)=>typeof v==='string'?v.slice(0,max):'';
// Rebuilds the record from known fields only, so a name or note can never reach the file even if a client sends one.
export function sanitize(packet){
 const r=packet?.record;if(!r||!/^P-[0-9A-F]{8}$/.test(r.caseCode||'')||typeof r.assessmentId!=='string'||!/^\d{4}-\d{2}$/.test(r.visitMonth||''))throw Error('Invalid record');
 const research=R.cleanResearch(r),domains={};
 for(const d of R.DOMAINS){const x=r.domains?.[d.key];if(!x)continue;const n=k=>Number.isInteger(x[k])&&x[k]>=0?x[k]:0;domains[d.key]={total:n('total'),assessed:n('assessed'),correct:n('correct'),complete:x.complete===true,percent:Number.isFinite(x.percent)?x.percent:null};}
 const t=r.total||{},catalog=Array.isArray(packet.catalog)?packet.catalog.filter(i=>/^item-\w+-\d+$/.test(i?.id)).map(i=>({id:i.id,group:text(i.group,20),section:Number.isInteger(i.section)?i.section:null,observation:i.observation===true,label:text(i.label,600)})):[];
 const known=new Set(catalog.map(i=>i.id));
 return {catalog,record:{assessmentId:text(r.assessmentId,60),caseCode:r.caseCode,visitMonth:r.visitMonth,...research,fluencyAnimals:Number.isInteger(r.fluencyAnimals)?r.fluencyAnimals:null,
  profile:Object.fromEntries(['fluency','comprehension','repetition','naming'].map(k=>[k,text(r.profile?.[k],20)])),domains,
  total:{total:t.total|0,assessed:t.assessed|0,correct:t.correct|0,complete:t.complete===true,percent:Number.isFinite(t.percent)?t.percent:null},
  items:(Array.isArray(r.items)?r.items:[]).filter(i=>known.has(i?.id)&&['correct','incorrect','dontknow','skip','present','absent'].includes(i.score)).map(i=>({id:i.id,score:i.score,support:text(i.support,20)}))}};
}
async function readJson(file,fallback){try{return JSON.parse(await fs.readFile(file,'utf8'));}catch(e){if(e.code==='ENOENT')return fallback();throw Error(`${path.basename(file)} is not valid: ${e.message}`);}}
async function readSettings(){const v=await readJson(settingsFile,()=>null);if(v)return {...DEFAULT_SETTINGS,...v};await fs.writeFile(settingsFile,JSON.stringify(DEFAULT_SETTINGS,null,1));return DEFAULT_SETTINGS;}
async function atomic(file,body){await fs.writeFile(file+'.tmp',body);await fs.rename(file+'.tmp',file);}
let queue=Promise.resolve();
function update(change){const run=queue.then(async()=>{await fs.mkdir(dir,{recursive:true});const data=await readJson(dataFile,empty);if(!Array.isArray(data.assessments))throw Error('dataset.json is damaged');change(data);await atomic(bookFile,buildWorkbook(data,await readSettings()));await atomic(dataFile,JSON.stringify(data));return data.assessments.length;});queue=run.catch(()=>{});return run;}
const add=packet=>{const clean=sanitize(packet);return update(data=>{if(clean.catalog.length)data.catalog=clean.catalog;const i=data.assessments.findIndex(a=>a.assessmentId===clean.record.assessmentId);if(i>=0)data.assessments[i]=clean.record;else data.assessments.push(clean.record);});};
if(process.argv.includes('--import')){const count=await add(JSON.parse(await fs.readFile(process.argv[process.argv.indexOf('--import')+1],'utf8')));console.log(`Added. The file now has ${count} visits: ${bookFile}`);process.exit(0);}
let allowed=new Set();
const server=http.createServer(async(req,res)=>{const json=(s,d)=>{res.writeHead(s,{'Content-Type':'application/json','Cache-Control':'no-store'});res.end(JSON.stringify(d));};
 try{const host=`127.0.0.1:${server.address().port}`;if(![host,`localhost:${server.address().port}`].includes(req.headers.host))return json(403,{error:'Local host required'});
  const url=new URL(req.url,'http://'+host),origin=req.headers.origin;
  if(origin&&allowed.has(origin)){res.setHeader('Access-Control-Allow-Origin',origin);res.setHeader('Vary','Origin');res.setHeader('Access-Control-Allow-Methods','POST,GET,OPTIONS');res.setHeader('Access-Control-Allow-Headers','Content-Type');res.setHeader('Access-Control-Allow-Private-Network','true');}
  if(req.method==='OPTIONS'){res.writeHead(origin&&allowed.has(origin)?204:403);return res.end();}
  const body=async limit=>{let b='';for await(const c of req){b+=c;if(b.length>limit)throw Object.assign(Error('Too large'),{status:413});}return b;};
  const posting=()=>req.method==='POST'&&(!origin||allowed.has(origin))&&req.headers['content-type']?.startsWith('application/json');
  if(url.pathname==='/api/aphasia/share'){if(!posting())return json(403,{error:'Allowed origin and JSON POST required'});let count;try{count=await add(JSON.parse(await body(2e6)));}catch(e){return json(e.status||400,{error:e.message});}return json(200,{ok:true,assessments:count});}
  if(url.pathname==='/api/aphasia/reset'){if(!posting()||!origin)return json(403,{error:'Allowed origin and JSON POST required'});if(JSON.parse(await body(1024)).confirm!=='aphasia')return json(400,{error:'Explicit confirmation required'});await update(data=>{data.assessments=[];});return json(200,{reset:'aphasia'});}
  if(url.pathname==='/api/aphasia/workbook'&&req.method==='GET'){await update(()=>{});res.writeHead(200,{'Content-Type':'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet','Content-Disposition':'attachment; filename="language-cognitive-research.xlsx"','Cache-Control':'no-store'});return res.end(await fs.readFile(bookFile));}
  if(req.method!=='GET')return json(405,{error:'GET required'});
  // The app itself, never the research data, scripts or tests.
  const rel=decodeURIComponent(url.pathname).replace(/^\/+/,'')||'index.html',file=path.resolve(root,rel);
  if(!file.startsWith(root+path.sep)||/^(research\/(?!SETUP\.md$)|scripts\/|tests\/|\.)/.test(rel))return json(404,{error:'Not found'});
  const data=await fs.readFile(file);res.writeHead(200,{'Content-Type':mime[path.extname(file)]||'application/octet-stream','Cache-Control':'no-cache'});res.end(data);
 }catch(e){json(e.code==='ENOENT'?404:500,{error:e.code==='ENOENT'?'Not found':e.message});}});
server.listen(port,'127.0.0.1',async()=>{const p=server.address().port;allowed=new Set([`http://127.0.0.1:${p}`,`http://localhost:${p}`,'http://127.0.0.1:8876','http://localhost:8876','https://hamada013.github.io']);await update(()=>{});console.log(`Language-cognitive assessment: http://127.0.0.1:${p}/\nResearch file: ${bookFile}`);});
