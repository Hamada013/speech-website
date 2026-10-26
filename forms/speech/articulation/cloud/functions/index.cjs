'use strict';
const {onRequest}=require('firebase-functions/v2/https'),{defineString}=require('firebase-functions/params');
const {initializeApp}=require('firebase-admin/app'),{getAuth}=require('firebase-admin/auth'),{getFirestore}=require('firebase-admin/firestore');
const {GoogleAuth}=require('google-auth-library'),crypto=require('node:crypto');
const schema=require('./research-schema.cjs'),{attribute,literal,helperRows}=require('./collector.cjs');
initializeApp();
const allowedOrigins=defineString('APP_ORIGINS'),sheetId=defineString('RESEARCH_SPREADSHEET_ID'),google=new GoogleAuth({scopes:['https://www.googleapis.com/auth/spreadsheets']});
exports.submitResearch=onRequest({region:'europe-west1',timeoutSeconds:120,maxInstances:1,concurrency:1,memory:'512MiB',cors:false},async(req,res)=>{
 const origin=req.get('origin'),allowed=allowedOrigins.value().split(',').map(s=>s.trim());
 res.set('Cache-Control','no-store');if(!origin||!allowed.includes(origin)){res.status(403).json({error:'Origin denied'});return;}
 res.set('Access-Control-Allow-Origin',origin);res.set('Vary','Origin');res.set('Access-Control-Allow-Headers','Authorization,Content-Type');res.set('Access-Control-Allow-Methods','POST,OPTIONS');
 if(req.method==='OPTIONS'){res.status(204).end();return;}if(req.method!=='POST'){res.status(405).end();return;}
 let identity;try{identity=await getAuth().verifyIdToken((req.get('authorization')||'').replace(/^Bearer /,''));}catch{res.status(401).json({error:'Authentication required'});return;}
 const provider=identity.firebase?.sign_in_provider;if(!['anonymous','google.com'].includes(provider)){res.status(403).json({error:'Unsupported sign in'});return;}
 let incoming;try{if(Buffer.byteLength(JSON.stringify(req.body))>5*1024*1024)throw Error('Batch too large');incoming=attribute(req.body,{uid:identity.uid,email:identity.email_verified?identity.email:'',provider},origin);}catch{res.status(422).json({error:'Invalid research payload'});return;}
 const db=getFirestore(),lease=db.doc('internal/research-lease'),leaseId=crypto.randomUUID(),rate=db.doc('internal/rate-'+identity.uid);
 let locked=false;
 try{
  await db.runTransaction(async tx=>{const [lock,speed]=await Promise.all([tx.get(lease),tx.get(rate)]),now=Date.now();if(lock.exists&&lock.data().expires>now)throw Error('busy');if(speed.exists&&now-speed.data().last<10000)throw Error('rate');tx.set(lease,{id:leaseId,expires:now+180000});tx.set(rate,{last:now});});locked=true;
  const client=await google.getClient(),base=`https://sheets.googleapis.com/v4/spreadsheets/${sheetId.value()}`;
  const request=async(path,data)=>{const result=await client.request({url:base+path,method:data?'POST':'GET',...(data?{data}:{})});return result.data;};
  const metadata=await request('?fields=sheets.properties'),sheets=Object.fromEntries(metadata.sheets.map(s=>[s.properties.title,s.properties]));
  for(const name of ['Case_info','Findings','Results'])if(!sheets[name])throw Error('missing sheet');
  const range=await request('/values:batchGet?valueRenderOption=UNFORMATTED_VALUE&ranges=Case_info!A1:AP2001&ranges=Findings!A1:AN168001');
  const existing=schema.empty();
  for(const [i,key,columns] of [[0,'caseRows',schema.CASE_COLUMNS],[1,'findingRows',schema.FINDING_COLUMNS]]){const rows=range.valueRanges[i].values||[],header=rows.shift()||[];if(header.slice(0,i?34:36).join('|')!==columns.slice(0,i?34:36).join('|'))throw Error('header mismatch');existing[key]=rows.filter(r=>r[0]).map(r=>Array.from({length:columns.length},(_,c)=>r[c]??(c===columns.length-1?0:'')));}
  const merged=schema.merge(existing,incoming),requests=[];
  const accountsId=sheets.Accounts?.sheetId??Math.max(...metadata.sheets.map(s=>s.properties.sheetId))+1;
  if(!sheets.Accounts)requests.push({addSheet:{properties:{sheetId:accountsId,title:'Accounts',gridProperties:{rowCount:2001,columnCount:7,frozenRowCount:1}}}});
  const accountsFormula='=IFERROR(QUERY(Case_info!A2:AP2001,"select AK, AL, AM, count(A), sum(W), sum(X), sum(Y) where A is not null group by AK, AL, AM label AK \'Source account\', AL \'Email\', AM \'Sign-in\', count(A) \'Assessments\', sum(W) \'Recorded\', sum(X) \'Scored\', sum(Y) \'Correct\'",0),"No shared assessments yet")';
  requests.push({updateCells:{start:{sheetId:accountsId,rowIndex:0,columnIndex:0},rows:[{values:[{userEnteredValue:{formulaValue:accountsFormula}}]}],fields:'userEnteredValue'}});
  for(const [name,columns,rows,minRows] of [['Case_info',schema.CASE_COLUMNS,merged.caseRows,2001],['Findings',schema.FINDING_COLUMNS,merged.findingRows,168001]]){
   const props=sheets[name],sheet=props.sheetId;if(props.gridProperties.columnCount<columns.length||props.gridProperties.rowCount<minRows)requests.push({updateSheetProperties:{properties:{sheetId:sheet,gridProperties:{rowCount:Math.max(minRows,props.gridProperties.rowCount),columnCount:Math.max(columns.length,props.gridProperties.columnCount)}},fields:'gridProperties'}});
   requests.push({updateCells:{start:{sheetId:sheet,rowIndex:0,columnIndex:0},rows:literal([columns,...rows]),fields:'userEnteredValue'}});
  }
  if(sheets.Results.gridProperties.rowCount<2089)requests.push({updateSheetProperties:{properties:{sheetId:sheets.Results.sheetId,gridProperties:{rowCount:2089}},fields:'gridProperties.rowCount'}});
  requests.push({updateCells:{start:{sheetId:sheets.Results.sheetId,rowIndex:89,columnIndex:0},rows:helperRows(merged),fields:'userEnteredValue'}});
  await request(':batchUpdate',{requests});
  const check=await request('/values/Case_info!A2:A2001'),ids=new Set((check.values||[]).map(r=>r[0]));if(incoming.caseRows.some(r=>!ids.has(r[0])))throw Error('write not verified');
  res.json({status:'updated',assessments:merged.caseRows.length,findings:merged.findingRows.length});
 }catch(error){res.status(['busy','rate'].includes(error.message)?429:503).json({error:'Submission not confirmed; retry later'});}
 finally{if(locked)await db.runTransaction(async tx=>{const current=await tx.get(lease);if(current.data()?.id===leaseId)tx.delete(lease);}).catch(()=>{});}
});
