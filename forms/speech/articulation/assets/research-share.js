'use strict';
(() => {
 let busy=false;
 // Only loopback destinations are allowed. Google account sync is independent.
 const localHost=['localhost','127.0.0.1'].includes(location.hostname);
 let bridge='http://127.0.0.1:8876';
 // A static preview has no write API. Use its origin only when it identifies
 // itself as our collector; otherwise use the dedicated loopback service.
 const bridgeReady=localHost?fetch('/api/research/status',{cache:'no-store',signal:AbortSignal.timeout(3000)}).then(async response=>{if(response.ok&&(await response.json()).service==='local-research-workbooks')bridge=location.origin;}).catch(()=>{}):Promise.resolve();
 for(const id of ['openResearchLocal','openWorkbookButton'])$(id).disabled=true;
 bridgeReady.finally(()=>{for(const id of ['openResearchLocal','openWorkbookButton'])$(id).disabled=false;});
 function status(text,error=false){$('researchShareStatus').textContent=error?'':text;$('researchShareError').textContent=error?text:'';}
 function payload(){
  const child=activeChild();if(!child)throw Error('اختر حالة أولاً.');
  const records=child.assessments.filter(record=>record.state.meta.researchConsent!=='no');
  if(!records.length)throw Error('مشاركة البحث مرفوضة في فحوصات هذه الحالة.');
  return ArticulationResearch.createPayload({...child,assessments:records},allProbes,{identifiers:$('researchIdentifiers').checked,source:ArticulationCloud.source(),diagnose:record=>diagnosticImpression(record,'ar')});
 }
 async function saveLocal(){
  if(busy)return;busy=true;$('saveResearchLocal').disabled=true;status('جارٍ تحديث ملف Excel على هذا الكمبيوتر…');
  try{
   await bridgeReady;
   if(!saveCase())throw Error('تعذر حفظ الفحص الحالي.');
   const response=await fetch(bridge+'/api/research/share',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(payload()),signal:AbortSignal.timeout(120000)});
   if(!response.ok)throw Error('Local collection failed');const result=await response.json();
   if(!Number.isInteger(result.assessments)||!Number.isInteger(result.findings))throw Error('Unverified local receipt');
   status(`تم تحديث ملف Excel المحلي: ${result.assessments} فحص و${result.findings} بند.`);
  }catch(error){status(error.message.includes('مشاركة')||error.message.includes('الفحص')?error.message:'تعذر تحديث ملف Excel. افتح التطبيق من الخادم المحلي على الكمبيوتر ثم أعد المحاولة. تبقى الحالات محفوظة؛ يمكنك تنزيل JSON ونقله إلى الكمبيوتر.',true);}
  finally{busy=false;$('saveResearchLocal').disabled=false;}
 }
 $('shareResearch').onclick=async()=>{
  if(busy||!activeChild()||!saveCase())return;
  const records=activeChild().assessments.filter(r=>r.state.meta.researchConsent!=='no');
  $('researchShareDescription').textContent=`${activeChild().name} · ${records.length} فحص. ملف Excel محلي على هذا الكمبيوتر. الفحوصات التي ترفض مشاركة البحث مستبعدة.`;
  $('researchIdentifiers').checked=false;status('');openDialog($('researchShareDialog'));await saveLocal();
 };
 $('saveResearchLocal').onclick=saveLocal;
 $('exportResearchJson').onclick=()=>{try{const blob=new Blob([JSON.stringify(payload(),null,2)],{type:'application/json;charset=utf-8'}),url=URL.createObjectURL(blob),a=document.createElement('a');a.href=url;a.download='articulation-research-'+activeChild().id+'.json';document.body.append(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(url),60000);status('تم تنزيل JSON على هذا الجهاز.');}catch(error){status(error.message,true);}};
 const openWorkbook=()=>window.open(bridge+'/api/research/workbook','_blank','noopener');
 $('openResearchLocal').onclick=openWorkbook;
 $('openWorkbookButton').onclick=openWorkbook;
 $('importResearchJson').onchange=async event=>{
  const file=event.target.files[0];if(!file||busy)return;busy=true;$('saveResearchLocal').disabled=true;status('جارٍ استيراد الملف إلى Excel المحلي…');
  try{await bridgeReady;if(file.size>20*1024*1024)throw Error('large');const data=ArticulationResearch.validate(JSON.parse(await file.text()));const response=await fetch(bridge+'/api/research/share',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(data),signal:AbortSignal.timeout(120000)});if(!response.ok)throw Error('failed');const result=await response.json();if(!Number.isInteger(result.assessments)||!Number.isInteger(result.findings))throw Error('receipt');status(`تم تحديث ملف Excel المحلي: ${result.assessments} فحص و${result.findings} بند.`);}catch{status('تعذر استيراد الملف. تحقق من JSON والخادم المحلي؛ لم يُؤكد تحديث Excel.',true);}finally{busy=false;$('saveResearchLocal').disabled=false;event.target.value='';}
 };
 for(const [id,name,label] of [['saveResearchLocal','report','تحديث ملف Excel المحلي'],['exportResearchJson','download','تنزيل JSON على هذا الجهاز'],['openResearchLocal','sheet','فتح ملف Excel المحلي'],['openWorkbookButton','sheet','فتح ملف Excel المحلي'],['importResearchButton','plus','استيراد JSON من جهاز آخر']])setButtonIcon($(id),name,label);
 $('importResearchButton').onclick=()=>$('importResearchJson').click();
})();
