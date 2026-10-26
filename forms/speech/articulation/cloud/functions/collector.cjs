'use strict';
const schema=require('./research-schema.cjs');
function attribute(raw,identity,origin){
 const data=JSON.parse(JSON.stringify(schema.validate(raw)));
 if(!data.caseRows.length||data.caseRows.length>50)throw Error('Submit between 1 and 50 assessments per request');
 if(data.caseRows.some(r=>r[14]==='no'))throw Error('Research consent declined');
 const prefix=identity.uid+':',source=[identity.uid,identity.email||'',identity.provider==='google.com'?'google':'guest','',origin,1];
 for(const row of data.caseRows){const device=String(row[39]||'').slice(0,100);row[0]=prefix+row[0];row[1]=prefix+row[1];row[2]=prefix+row[2];row.splice(36,6,...source);row[39]=device;}
 for(const row of data.findingRows){const device=String(row[37]||'').slice(0,100);row[1]=prefix+row[1];row[0]=row[1]+':'+row[12];row[2]=prefix+row[2];row[3]=prefix+row[3];row.splice(34,6,...source);row[37]=device;}
 return schema.validate(data);
}
function literal(rows){return rows.map(row=>({values:row.map(v=>({userEnteredValue:typeof v==='number'?{numberValue:v}:{stringValue:String(v??'')}}))}));}
function helperRows(data){return data.caseRows.map((_,i)=>{const r=i+90,s=i+2;return {values:[`=IF(Case_info!A${s}="","",Case_info!A${s})`,`=IF(A${r}="","",Case_info!C${s})`,`=IF(A${r}="","",Case_info!F${s})`,`=IF(A${r}="","",IF(Case_info!G${s}="","",Case_info!G${s}))`,`=IF(A${r}="","",IF(COUNTIFS($B$90:B${r},B${r})=1,1,0))`,`=IF(A${r}="","",D${r})`,`=IF(A${r}="","",Case_info!W${s})`,`=IF(A${r}="","",Case_info!X${s})`].map(formulaValue=>({userEnteredValue:{formulaValue}}))};});}
module.exports={attribute,literal,helperRows};
