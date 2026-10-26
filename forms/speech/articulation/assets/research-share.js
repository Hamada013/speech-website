'use strict';
(() => {
 let link={},token=null,busy=false;
 const configReady=fetch('research/google-link.json',{cache:'no-store'}).then(r=>r.ok?r.json():{}).then(value=>link=value).catch(()=>{});
 function status(text,error=false){$('researchShareStatus').textContent=error?'':text;$('researchShareError').textContent=error?text:'';}
 function payload(){
  const child=activeChild();if(!child)throw Error('اختر حالة أولاً.');
  const records=child.assessments.filter(record=>record.state.meta.researchConsent!=='no');
  if(!records.length)throw Error('مشاركة البحث مرفوضة في فحوصات هذه الحالة.');
  return ArticulationResearch.createPayload({...child,assessments:records},allProbes,{identifiers:$('researchIdentifiers').checked,source:ArticulationCloud.source(),diagnose:record=>diagnosticImpression(record,'ar')});
 }
 function downloadJson(data){const blob=new Blob([JSON.stringify(data,null,2)],{type:'application/json;charset=utf-8'}),url=URL.createObjectURL(blob),a=document.createElement('a');a.href=url;a.download='articulation-research-'+activeChild().id+'.json';document.body.append(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(url),60000);}
 function setBusy(value){busy=value;for(const id of ['saveResearchLocal','sendResearchGoogle','exportResearchJson'])$(id).disabled=value;}
 $('shareResearch').onclick=async()=>{
  if(!activeChild()||!saveCase())return;await configReady;
  const records=activeChild().assessments.filter(r=>r.state.meta.researchConsent!=='no');
  $('researchShareDescription').textContent=`${activeChild().name} · ${records.length} فحص. تتضمن المشاركة نتائج البنود والملاحظات. تُستبعد الفحوصات ذات رفض المشاركة. يُرفق حساب المصدر (البريد عند الدخول) أو معرّف الضيف.`;
  $('researchIdentifiers').checked=false;status('');openDialog($('researchShareDialog'));
 };
 $('exportResearchJson').onclick=async()=>{if(busy)return;setBusy(true);try{const data=payload();downloadJson(data);if(ArticulationCloud.configured()){status('تم تنزيل الملف · جارٍ تحديث Google…');await ArticulationCloud.sendResearch(data);status('تم تنزيل الملف وتحديث Google Sheets مع حساب المصدر.');}else status('تم تنزيل ملف المشاركة. الإرسال التلقائي إلى Google ينتظر تفعيل الربط؛ يمكنك الاستيراد من قائمة البحث.');}catch(error){status('الملف المحلي متاح؛ لم يكتمل تحديث Google. '+error.message,true);}finally{setBusy(false);}};
 $('openResearchSheet').onclick=async()=>{await configReady;if(link.spreadsheetUrl)window.open(link.spreadsheetUrl,'_blank','noopener');else status('لم يُربط جدول Google بعد.',true);};
 $('saveResearchLocal').onclick=async()=>{
  if(busy)return;setBusy(true);status('جارٍ حفظ ملف البحث المحلي…');
  try{
   const data=payload();await configReady;
   const endpoint=link.localBridgeOrigin?new URL('/api/research/share',link.localBridgeOrigin).href:new URL('api/research/share',document.baseURI).href;
   const response=await fetch(endpoint,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(data),signal:AbortSignal.timeout?.(90000)});
   if(!response.ok)throw Error('Local collection failed');const result=await response.json();
   if(ArticulationCloud.configured()){status('تم تحديث Excel المحلي · جارٍ تحديث Google…');await ArticulationCloud.sendResearch(data);status(`تم تحديث Excel وGoogle Sheets: ${result.assessments} فحص، مع حساب المصدر.`);}else status(`تم تحديث ملف Excel المحلي: ${result.assessments} فحص و${result.findings} بند. لم تُرسل بيانات إلى Google؛ الربط ينتظر التفعيل.`);
  }catch(error){status(error.message.includes('مشاركة')?error.message:'لم تكتمل عملية الحفظ أو الإرسال. تحقق من خادم البحث المحلي والاتصال بـ Google؛ يمكنك تنزيل ملف المشاركة وإعادة المحاولة.',true);}
  finally{setBusy(false);}
 };
 async function authorize(){
  if(token&&token.expires>Date.now())return token.value;
  if(!globalThis.google?.accounts?.oauth2)await new Promise((resolve,reject)=>{const script=document.createElement('script');script.src='https://accounts.google.com/gsi/client';script.onload=resolve;script.onerror=reject;document.head.append(script);});
  return new Promise((resolve,reject)=>{const client=google.accounts.oauth2.initTokenClient({client_id:link.oauthClientId,scope:'https://www.googleapis.com/auth/spreadsheets',callback:response=>{if(response.error){reject(Error('Google authorization failed'));return;}token={value:response.access_token,expires:Date.now()+(Number(response.expires_in||3600)-60)*1000};resolve(token.value);},error_callback:()=>reject(Error('Google authorization cancelled'))});client.requestAccessToken({prompt:'select_account'});});
 }
 async function googleRequest(path,access,body){const response=await fetch('https://sheets.googleapis.com/v4/spreadsheets/'+link.spreadsheetId+path,{method:body?'POST':'GET',headers:{Authorization:'Bearer '+access,...(body?{'Content-Type':'application/json'}:{})},...(body?{body:JSON.stringify(body)}:{})});if(!response.ok){if(response.status===401)token=null;throw Error('Google Sheets '+response.status);}return response.json();}
 $('sendResearchGoogle').onclick=async()=>{
  if(busy)return;await configReady;
  if(ArticulationCloud.configured()){setBusy(true);status('جارٍ تحديث جدول Google…');try{const result=await ArticulationCloud.sendResearch(payload());status(`تم تحديث Google Sheets: ${result.assessments} فحص و${result.findings} بند، مع حساب المصدر.`);}catch(error){status(error.message,true);}finally{setBusy(false);}return;}
  if(!link.oauthClientId||!link.spreadsheetId){status('الإرسال المباشر غير مفعّل بعد. نزّل ملف المشاركة واستورده في جدول Google؛ تعليمات الربط محفوظة في مجلد البحث.',true);return;}
  setBusy(true);status('جارٍ الاتصال بـ Google…');
  try{
   const incoming=payload(),access=await authorize();
   const metadata=await googleRequest('?fields=sheets.properties',access),sheets=Object.fromEntries(metadata.sheets.map(s=>[s.properties.title,s.properties]));
   for(const name of ['Case_info','Findings','Results'])if(!sheets[name])throw Error('Google research workbook is missing required sheets');
   const response=await googleRequest('/values:batchGet?valueRenderOption=UNFORMATTED_VALUE&ranges=Case_info!A2:AP2001&ranges=Findings!A2:AN168001',access);
   const pad=(rows,width)=>rows.filter(r=>r[0]).map(r=>Array.from({length:width},(_,i)=>r[i]??''));
   const existing={...ArticulationResearch.empty(),caseRows:pad(response.valueRanges[0].values||[],ArticulationResearch.CASE_COLUMNS.length),findingRows:pad(response.valueRanges[1].values||[],ArticulationResearch.FINDING_COLUMNS.length)};
   const merged=ArticulationResearch.merge(existing,incoming);
   // This writes literal string values, so authored text cannot become a formula.
   const cells=rows=>rows.map(row=>({values:row.map(value=>({userEnteredValue:typeof value==='number'?{numberValue:value}:{stringValue:String(value??'')}}))}));
   const formulas=merged.caseRows.map((_,i)=>{const r=i+90,s=i+2;return {values:[`=IF(Case_info!A${s}="","",Case_info!A${s})`,`=IF(A${r}="","",Case_info!C${s})`,`=IF(A${r}="","",Case_info!F${s})`,`=IF(A${r}="","",IF(Case_info!G${s}="","",Case_info!G${s}))`,`=IF(A${r}="","",IF(COUNTIFS($B$90:B${r},B${r})=1,1,0))`,`=IF(A${r}="","",D${r})`,`=IF(A${r}="","",Case_info!W${s})`,`=IF(A${r}="","",Case_info!X${s})`].map(formulaValue=>({userEnteredValue:{formulaValue}}))};});
   await googleRequest(':batchUpdate',access,{requests:[{updateCells:{start:{sheetId:sheets.Case_info.sheetId,rowIndex:1,columnIndex:0},rows:cells(merged.caseRows),fields:'userEnteredValue'}},{updateCells:{start:{sheetId:sheets.Findings.sheetId,rowIndex:1,columnIndex:0},rows:cells(merged.findingRows),fields:'userEnteredValue'}},{updateCells:{start:{sheetId:sheets.Results.sheetId,rowIndex:89,columnIndex:0},rows:formulas,fields:'userEnteredValue'}}]});
   const check=await googleRequest('/values/Case_info!A2:A2001',access);const ids=new Set((check.values||[]).map(r=>r[0]));if(incoming.caseRows.some(r=>!ids.has(r[0])))throw Error('Google write verification failed');
   status(`تم تحديث Google Sheets: ${merged.caseRows.length} فحص. تتم إعادة حساب النتائج والرسوم تلقائياً.`);
  }catch{status('لم تكتمل المشاركة مع Google. لم يُسجل نجاح زائف؛ يمكنك إعادة المحاولة أو تنزيل ملف المشاركة.',true);}
  finally{setBusy(false);}
 };
 for(const [id,name,label] of [['saveResearchLocal','report','حفظ الحالة في ملف البحث المحلي'],['sendResearchGoogle','share','إرسال الحالة إلى Google Sheets'],['exportResearchJson','download','تنزيل ملف المشاركة للاستيراد'],['openResearchSheet','next','فتح Google Sheets']])setButtonIcon($(id),name,label);
})();
