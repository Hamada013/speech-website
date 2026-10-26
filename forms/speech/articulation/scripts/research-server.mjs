import http from 'node:http';
import fs from 'node:fs/promises';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {createRequire} from 'node:module';
import {buildResearch} from './build-research.mjs';
const require=createRequire(import.meta.url),schema=require('../assets/research-schema.js');
const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..'),port=Number(process.env.RESEARCH_PORT||8876);
const dataDir=process.env.RESEARCH_DATA_DIR?path.resolve(process.env.RESEARCH_DATA_DIR):path.join(root,'research');
const allowed=new Set((process.env.RESEARCH_ALLOWED_ORIGINS||`http://127.0.0.1:${port},http://localhost:${port},http://127.0.0.1:8765,http://localhost:8765`).split(','));
const mime={'.html':'text/html; charset=utf-8','.js':'text/javascript; charset=utf-8','.css':'text/css; charset=utf-8','.webmanifest':'application/manifest+json','.json':'application/json','.webp':'image/webp','.png':'image/png','.svg':'image/svg+xml','.xlsx':'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'};
let queue=Promise.resolve();
function json(res,status,data){res.writeHead(status,{'Content-Type':'application/json','Cache-Control':'no-store'});res.end(JSON.stringify(data));}
const server=http.createServer(async(req,res)=>{
 try{
  if(!['127.0.0.1:'+server.address().port,'localhost:'+server.address().port].includes(req.headers.host)){json(res,403,{error:'Local host required'});return;}
  const url=new URL(req.url,`http://127.0.0.1:${port}`),origin=req.headers.origin;
  if(origin&&allowed.has(origin)){res.setHeader('Access-Control-Allow-Origin',origin);res.setHeader('Vary','Origin');res.setHeader('Access-Control-Allow-Methods','POST,GET,OPTIONS');res.setHeader('Access-Control-Allow-Headers','Content-Type');}
  if(req.method==='OPTIONS'){res.writeHead(origin&&allowed.has(origin)?204:403);res.end();return;}
  if(url.pathname==='/api/research/share'){
   if(req.method!=='POST'||!origin||!allowed.has(origin)||!req.headers['content-type']?.startsWith('application/json')){json(res,403,{error:'Origin and JSON POST required'});return;}
   let body='';for await(const chunk of req){body+=chunk;if(body.length>20*1024*1024){json(res,413,{error:'Batch too large'});return;}}
   const incoming=schema.validate(JSON.parse(body));
   const job=queue.then(async()=>{
    let existing=schema.empty();try{existing=JSON.parse(await fs.readFile(path.join(dataDir,'dataset.json'),'utf8'));}catch(error){if(error.code!=='ENOENT')throw error;}
    await fs.mkdir(dataDir,{recursive:true});const merged=schema.merge(existing,incoming),xlsx=path.join(dataDir,'arabic-speech-research.xlsx');
    await buildResearch(merged,xlsx+'.tmp');
    await fs.writeFile(path.join(dataDir,'dataset.json.tmp'),JSON.stringify(merged,null,2));
    await fs.rename(xlsx+'.tmp',xlsx);await fs.rename(path.join(dataDir,'dataset.json.tmp'),path.join(dataDir,'dataset.json'));
    return {assessments:merged.caseRows.length,findings:merged.findingRows.length};
   });queue=job.catch(()=>{});try{json(res,200,await job);}catch(error){json(res,422,{error:error.message});}return;
  }
  let relative=decodeURIComponent(url.pathname).replace(/^\/forms\/speech\/articulation\//,'').replace(/^\//,'')||'index.html';
  if(relative==='research/dataset.json'||relative.endsWith('.tmp')||relative.endsWith('.inspect.ndjson')||relative.startsWith('.')){res.writeHead(403);res.end();return;}
  const file=path.resolve(root,relative);if(!file.startsWith(root+path.sep)){res.writeHead(403);res.end();return;}
  const data=await fs.readFile(file);res.writeHead(200,{'Content-Type':mime[path.extname(file)]||'application/octet-stream','Cache-Control':'no-store'});res.end(data);
 }catch{json(res,404,{error:'Not found'});}
});
server.listen(port,'127.0.0.1',()=>{const actual=server.address().port;allowed.add(`http://127.0.0.1:${actual}`);allowed.add(`http://localhost:${actual}`);console.log(`اختبار النطق: http://127.0.0.1:${actual}/forms/speech/articulation/ — local research writes enabled`);});
