'use strict';
(() => {
 const OWNER_KEY='articulation-cloud-owner',CLAIM_KEY='articulation-guest-claimed-by',DEVICE_KEY='articulation-source-device';
 let config={},sdk=null,auth=null,db=null,user=null,ready=null,busy=false,syncing=false,timer=null,epoch=0,mutations=0,applying=false;
 const configReady=fetch('cloud/config.json',{cache:'no-store'}).then(r=>r.ok?r.json():{}).then(value=>{config=value;}).catch(()=>{});
 const currentOwner=()=>{try{return localStorage.getItem(OWNER_KEY)||'';}catch{return '';}};
 const baseKey=uid=>'articulation-cloud-baseline-'+uid;
 function message(text,error=false){$('cloudStatus').textContent=text;$('cloudStatus').classList.toggle('error',error);$('cloudHomeStatus').textContent=text;}
 function configured(){return !!(config.firebase?.apiKey&&config.firebase?.projectId&&config.firebase?.authDomain&&config.firebase?.appId);}
 function readBase(uid){return JSON.parse(localStorage.getItem(baseKey(uid))||'{}');}
 function updateControls(){const signed=!!user&&!user.isAnonymous;$('cloudIdentity').textContent=signed?user.email:'الحفظ بين الأجهزة اختياري';$('googleSignIn').hidden=signed;$('cloudSignOut').hidden=!signed;$('cloudSyncNow').hidden=!signed;$('cloudPromptCopy').textContent=signed?'تُحفظ حالات هذا الحساب وفحوصاته في مساحة خاصة مرتبطة بحساب Google.':'اربط Google لحفظ حالات الأطفال وفحوصاتهم والوصول إليها من جهاز آخر. عند الدخول ستُنسخ الحالات المحلية غير المرتبطة إلى حسابك. يمكنك المتابعة على الجهاز فقط.';}
 async function initialize(){
  await configReady;if(!configured())throw Error('ربط Google غير مفعّل بعد. يلزم إعداد المشروع أولاً؛ يمكنك المتابعة والحفظ على الجهاز.');
  if(ready)return ready;
  ready=(async()=>{const version='13.1.0',root=`https://www.gstatic.com/firebasejs/${version}/`;const [app,a,f]=await Promise.all([import(root+'firebase-app.js'),import(root+'firebase-auth.js'),import(root+'firebase-firestore.js')]);sdk={...a,...f};const instance=app.initializeApp(config.firebase,'articulation');auth=a.getAuth(instance);db=f.getFirestore(instance);await auth.authStateReady();user=auth.currentUser;updateControls();return sdk;})().catch(error=>{ready=null;throw error;});return ready;
 }
 function localSwitch(uid){
  const previous=currentOwner();if(previous===uid)return;
  if(cases.activeChild&&!saveCase())throw Error('تعذر حفظ الفحص الحالي؛ لم يتم تبديل الحساب.');
  const guest=!previous?copyCase(cases):null;
  const nextKey=uid?'articulation-cases-google-'+uid:'articulation-cases-v2';
  const raw=localStorage.getItem(nextKey),next=raw?JSON.parse(raw):emptyCases();
  if(next.version!==2||!Array.isArray(next.children))throw Error('تعذر قراءة الحالات المحفوظة.');
  const claim=localStorage.getItem(CLAIM_KEY);
  if(uid&&guest&&(!claim||claim===uid)){
   for(const child of guest.children)if(!next.children.some(c=>c.id===child.id))next.children.push(child);
   if(!next.activeChild&&next.children.some(c=>c.id===guest.activeChild)){next.activeChild=guest.activeChild;next.activeAssessment=guest.activeAssessment;}
   localStorage.setItem(CLAIM_KEY,uid);
  }
  // Write the target successfully before changing the app's active storage slot.
  localStorage.setItem(nextKey,JSON.stringify(next));
  if(uid)localStorage.setItem(OWNER_KEY,uid);else localStorage.removeItem(OWNER_KEY);
  CASE_KEY=nextKey;cases=next;epoch++;renderStore();
 }
 function renderStore(navigate=true){const record=activeAssessment();state=record?copyCase(record.state):freshState();selectedProbe=record?.cursor||0;notePanels.clear();reportSourceId=null;comparisonSelection=null;document.querySelectorAll('dialog[open]').forEach(d=>{if(d.id!=='cloudDialog')closeDialog(d);});renderMeta();renderTrials();refreshHome();if(navigate)showPage('home');}
 function schedule(){if(!user||user.isAnonymous||currentOwner()!==user.uid)return;clearTimeout(timer);timer=setTimeout(()=>sync().catch(()=>{}),1200);}
 async function sync(){
  if(syncing||!user||user.isAnonymous||currentOwner()!==user.uid)return;
  if(!navigator.onLine){message('محفوظ على الجهاز · بانتظار الاتصال للمزامنة');return;}
  syncing=true;const uid=user.uid,generation=epoch,change=mutations;message('جارٍ مزامنة الحالات…');
  try{
   const collection=sdk.collection(db,'users',uid,'records'),snapshot=await sdk.getDocsFromServer(collection),remote={},revisions={};
   snapshot.forEach(doc=>{const value=doc.data();remote[doc.id]=JSON.parse(value.value);revisions[doc.id]=value.revision;});
   if(generation!==epoch||auth.currentUser?.uid!==uid)return;
   const local=ArticulationCloudModel.entities(readCases()),base=readBase(uid),merged=ArticulationCloudModel.reconcile(local,remote,base,caseId);
   for(const [id,value] of Object.entries(merged.entities)){
    if(ArticulationCloudModel.stable(value)===ArticulationCloudModel.stable(remote[id]))continue;
    if(generation!==epoch||auth.currentUser?.uid!==uid)return;
    const serialized=JSON.stringify(value);if(new TextEncoder().encode(serialized).length>=900000)throw Error('حجم أحد الفحوصات كبير؛ بقي محفوظاً على الجهاز.');
    await sdk.runTransaction(db,async transaction=>{const ref=sdk.doc(collection,id),latest=await transaction.get(ref);if((latest.exists()?latest.data().revision:undefined)!==revisions[id])throw Error('sync-retry');transaction.set(ref,{value:serialized,revision:(revisions[id]||0)+1});});
   }
   if(generation!==epoch||auth.currentUser?.uid!==uid)return;
   localStorage.setItem(baseKey(uid),JSON.stringify(merged.entities));
   if(change!==mutations||ArticulationCloudModel.stable(ArticulationCloudModel.entities(readCases()))!==ArticulationCloudModel.stable(local)){schedule();return;}
   const next=ArticulationCloudModel.storeFromEntities(merged.entities,cases);
   if(ArticulationCloudModel.stable(next)!==ArticulationCloudModel.stable(cases)){applying=true;const saved=writeCases(next);applying=false;if(!saved)throw Error('تعذر حفظ النسخة المسترجعة على الجهاز.');}
   // Guest data is removed only after its complete upload and a successful local save.
   if(localStorage.getItem(CLAIM_KEY)===uid){localStorage.removeItem('articulation-cases-v2');localStorage.removeItem(CLAIM_KEY);}
   if(ArticulationCloudModel.stable(ArticulationCloudModel.entities(next))!==ArticulationCloudModel.stable(local))renderStore(false);message(merged.conflicts.length?'تمت المزامنة · حُفظت نسختان من الفحص الذي عُدّل على جهازين.':'تمت مزامنة الحالات مع Google');
  }catch(error){message(error.message==='sync-retry'?'تغيرت البيانات على جهاز آخر؛ جارٍ إعادة المزامنة.':'بقيت الحالات محفوظة على الجهاز؛ لم تكتمل المزامنة. أعد المحاولة عند الاتصال.',true);if(error.message==='sync-retry')schedule();throw error;}
  finally{syncing=false;}
 }
 async function signIn(){
  if(busy)return;busy=true;$('googleSignIn').disabled=true;
  try{await initialize();if(cases.activeChild&&!saveCase())throw Error('تعذر حفظ الفحص الحالي.');const provider=new sdk.GoogleAuthProvider();provider.setCustomParameters({prompt:'select_account'});const result=await sdk.signInWithPopup(auth,provider);user=result.user;localSwitch(user.uid);updateControls();await sync();}
  catch(error){message(configured()?'لم يكتمل الدخول أو المزامنة. بيانات الجهاز محفوظة؛ يمكنك التخطي والمحاولة لاحقاً.':error.message,true);}
  finally{busy=false;$('googleSignIn').disabled=false;}
 }
 async function signOut(){
  if(busy||syncing)return;busy=true;
  try{if(cases.activeChild&&!saveCase())throw Error('تعذر حفظ الفحص الحالي.');epoch++;await sdk.signOut(auth);user=null;localSwitch('');updateControls();message('تتم المتابعة على الجهاز. النسخة المحلية لحساب Google تبقى في مساحته المنفصلة.');}
  catch{message('لم يكتمل تسجيل الخروج؛ لم تُحذف بياناتك.',true);}finally{busy=false;}
 }
 async function openCloud(){await configReady;updateControls();openDialog($('cloudDialog'));if(!configured())message('ربط Google ينتظر إعداد المشروع. المتابعة والحفظ على الجهاز متاحان.');else initialize().catch(()=>message('تعذر الاتصال بـ Google. يمكنك المتابعة دون اتصال.',true));}
 function deviceId(){let id=localStorage.getItem(DEVICE_KEY);if(!id){id=caseId();localStorage.setItem(DEVICE_KEY,id);}return id;}
 function source(){return {accountId:user&&!user.isAnonymous?user.uid:'guest-'+deviceId(),email:user&&!user.isAnonymous?user.email||'':'',signIn:user&&!user.isAnonymous?'google':'guest',deviceId:deviceId(),origin:location.origin,verified:false};}
 window.ArticulationCloud={source,open:openCloud};
 window.addEventListener('articulation-cases-saved',()=>{if(applying)return;mutations++;schedule();});
 window.addEventListener('online',()=>{initialize().then(()=>sync()).catch(()=>{});});
 window.addEventListener('focus',()=>{if(user&&!user.isAnonymous)sync().catch(()=>{});});
 window.addEventListener('storage',event=>{if(event.key===CASE_KEY){mutations++;schedule();}if(event.key===OWNER_KEY&&currentOwner()!==(user&&!user.isAnonymous?user.uid:'')){epoch++;message('تغيّر حساب Google في نافذة أخرى. أعد فتح التطبيق قبل المزامنة.',true);}});
 $('cloudAccount').onclick=openCloud;$('googleSignIn').onclick=signIn;$('cloudSignOut').onclick=signOut;$('cloudSyncNow').onclick=()=>sync().catch(()=>{});$('skipCloud').onclick=()=>closeDialog($('cloudDialog'));
 for(const [id,icon,label] of [['cloudAccount','cloud','حساب Google والمزامنة'],['googleSignIn','google','تسجيل الدخول باستخدام Google'],['skipCloud','next','المتابعة على الجهاز / تخطي'],['cloudSignOut','logout','تسجيل الخروج'],['cloudSyncNow','refresh','مزامنة الآن']])setButtonIcon($(id),icon,label);
 window.addEventListener('articulation-launch-complete',async()=>{await configReady;if(configured()&&navigator.onLine){try{await initialize();if(user&&!user.isAnonymous){localSwitch(user.uid);await sync();return;}}catch{message('الحفظ على الجهاز متاح؛ تعذر الاتصال بالمزامنة.',true);}}if(!document.querySelector('dialog[open]'))openCloud();});
})();
