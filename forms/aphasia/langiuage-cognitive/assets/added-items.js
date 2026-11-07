/* Tasks added after checking the original list against ASHA and published aphasia batteries.
   Inserted before the page builds its items, so they score, save and report like the originals.
   Wording, procedure and scoring are drafts for clinical review. */
(function(root,factory){const api=factory();if(typeof module==='object'&&module.exports)module.exports=api;else root.AphasiaAdded=api;})(globalThis,function(){
'use strict';
const ASHA='ASHA Practice Portal, Aphasia: a comprehensive assessment covers “word, sentence, and paragraph comprehension; naming; repetition; spontaneous speech; discourse; writing; and gestures.”';
const ADDED={
 '2subE':{section:2,title:'فهم الجمل ذات الأدوار المتبادلة',source:`${ASHA} Sentences whose roles can swap test grammar, not only word meaning.`,
  how:'المواد: دميتان أو صورتان لولد وبنت.<br>قل الجملة مرة واحدة واطلب من الشخص أن يمثلها بالدميتين.<br>التقييم: صحيح إذا قام الفاعل الصحيح بالفعل.',
  items:['البنت تدفع الولد','الولد يلحق البنت','الولد الذي دفعته البنت وقع']},
 '6subF':{section:6,title:'تكرار الكلمات',source:`${ASHA} Word repetition is a subtest of the Russian Aphasia Test (Ivanova et al., 2021).`,
  how:'قل الكلمة بوضوح مرة واحدة واطلب من الشخص أن يكررها.<br>التقييم: صحيح إذا كررها كاملة دون إبدال أو حذف صوت.',
  items:['باب','شبّاك','طاولة','مستشفى']},
 '6subG':{section:6,title:'تكرار كلمات غير حقيقية',source:'Ivanova et al. (2021), Russian Aphasia Test: nonword repetition is a subtest, and older healthy adults scored lower on it, so norms by age matter here.',
  how:'قل للشخص: سأقول كلمات ليس لها معنى، كررها كما تسمعها.<br>التقييم: صحيح إذا كررها كاملة.',
  items:['كَمْبيل','فَرْتوس']},
 '9subG':{section:9,title:'القراءة الجهرية',source:`${ASHA} Reading aloud is separate from reading for meaning, which the original list already tests.`,
  how:'اكتب الكلمة أو الجملة بخط كبير واعرضها، واطلب من الشخص قراءتها بصوت عالٍ.<br>التقييم: صحيح إذا قرأها كاملة دون أخطاء.',
  items:['شمس','كتاب','مستشفى','الولد يشرب الحليب']},
 '9subH':{section:9,title:'الكتابة بالإملاء',source:`${ASHA} The original list asks only for the person's name and the date, which are well practised.`,
  how:'أعطِ الشخص ورقة وقلماً. قل الكلمة أو الجملة واطلب منه كتابتها.<br>التقييم: صحيح إذا كتبها مقروءة ودون أخطاء إملائية تغير الكلمة.',
  items:['باب','قلم','الجو حار اليوم']},
 '13sub4':{section:13,title:'الإيماءات حسب الطلب',source:`${ASHA} The original list only notes gestures during conversation; this asks for them on request.`,
  how:'قل: أرني كيف… دون أن تمثل الحركة أمامه.<br>التقييم: صحيح إذا كانت الحركة واضحة ويمكن التعرف عليها. لا يُحسب استخدام اليد كأنها الأداة نفسها خطأً إذا كان المعنى واضحاً.',
  items:['أرني كيف تمشط شعرك','أرني كيف تشرب من كوب','أرني كيف تفتح باباً بمفتاح']},
 '13sub5':{section:13,title:'ملاحظات الكلام الحركي',observation:true,source:'ASHA Practice Portal, Acquired Apraxia of Speech: “Groping—visible struggle or effort to move the mouth, lips, or tongue into the correct position”; “A particular phoneme is not always produced incorrectly or with the same error.” Slow rate is already observed in this list.',
  how:'سجّل ما تلاحظه أثناء الكلام والتكرار.<br>هذه علامات للمتابعة وليست تشخيصاً: تظهر أيضاً مع الحبسة أو عسر التلفظ. عند وجودها استخدم تقييم الكلام الحركي.',
  items:['تلمّس حركات الفم: محاولات واضحة لإيجاد وضع الشفاه أو اللسان','أخطاء صوتية غير ثابتة في الكلمة نفسها عند تكرارها']}
};
const FLUENCY={source:'Verbal fluency is part of many aphasia assessments, and animal fluency was reported as especially sensitive to mild aphasia (search summaries; confirm against the full papers). Egyptian Arabic ACE-III norms stratified by age and education found age differences in verbal fluency.',
 how:'قل: اذكر أكبر عدد ممكن من أسماء الحيوانات خلال دقيقة واحدة. ابدأ التوقيت عند أول كلمة.<br>احسب الحيوانات المختلفة. لا تُحسب الكلمات المكررة.'};
function esc(s){return String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));}
function heading(title,how,source){const h=document.createElement('h3');h.innerHTML=`${esc(title)} <span class="added-tag">جديد</span> `;const info=document.createElement('button');info.className='btn-info';info.type='button';info.textContent='?';const html=`<p>${how}</p><p class="item-source" dir="ltr">${esc(source)}</p>`;info.addEventListener('click',()=>showInfo(html));h.append(info);return h;}
// Runs before the page reads its cards, so the added tasks are numbered after the originals in each group.
function insert(){
 if(typeof document==='undefined')return;
 for(const [group,a] of Object.entries(ADDED)){
  const section=document.getElementById('section'+a.section);if(!section||section.querySelector(`[data-added-group="${group}"]`))continue;
  const row=document.createElement('div');row.className='card-row';row.dataset.addedGroup=group;
  for(const label of a.items){const card=document.createElement('div');card.className='card';card.innerHTML=`<label>${esc(label)}</label><div class="button-row"><button class="btn-correct" onclick="score('${group}','correct',this)">+</button></div>`;row.append(card);}
  section.append(heading(a.title,a.how,a.source),row);
 }
 const naming=document.getElementById('section5');
 if(naming&&!document.getElementById('verbalFluency')){const s=document.createElement('section');s.id='verbalFluency';s.innerHTML=`<h2>الطلاقة اللفظية <span class="added-tag">جديد</span></h2><p class="assessment-help">${FLUENCY.how}</p><div class="card-row"><div class="card"><label for="fluencyAnimals">عدد الحيوانات خلال دقيقة</label><input type="text" id="fluencyAnimals" inputmode="numeric" dir="ltr" autocomplete="off"></div></div><p class="item-source" dir="ltr">${esc(FLUENCY.source)}</p>`;naming.after(s);}
}
insert();
return {ADDED,FLUENCY,insert};
});
