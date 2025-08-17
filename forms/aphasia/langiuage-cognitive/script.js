// =========================
// المتغيرات لتخزين النقاط لكل قسم وSubsection
// =========================
let scores = {
  1: [], '2subA': [], '2subB': [], '2subC': [], '2subD': [],
  3: [], '3subA': [], '3subB': [], '3subC': [],
  4: [], 5: [],
  '6subA': [], '6subB': [], '6subC': [], '6subD': [], '6subE': [],
  '7subA': [], '7subB': [], '7subC': [],
  8: [],
  '9subA': [], '9subB': [], '9subC': [], '9subD': [], '9subE': [], '9subF': [],
  '12sub1': [], '12sub2': [], '12sub3': [], '12sub4': [],
  10: [],
  11: [],
  '13sub1': [], '13sub2': [], '13sub3': []
};

let notes = {}; // ملاحظات الأقسام

// =========================
// تسجيل النقاط
// =========================
function score(section, type, btn) {
  let cardLabel = btn.closest('.card').querySelector('label').innerText;
  btn.parentElement.querySelectorAll('button').forEach(b => {
    if (b !== btn) {
      b.classList.remove('selected');
      b.dataset.selected = 'false';
    }
  });

  if (btn.dataset.selected === 'true') {
    btn.dataset.selected = 'false';
    btn.classList.remove('selected');
    removeScore(section, cardLabel);
  } else {
    btn.dataset.selected = 'true';
    btn.classList.add('selected');
    addScore(section, type, cardLabel);
  }

  updateAllSectionsPercent();
  updateReport();
}

function addScore(section, type, cardLabel) {
  if (!scores[section]) scores[section] = [];
  scores[section] = scores[section].filter(item => item.card !== cardLabel);
  let value = (type === 'correct') ? 1 : 0;
  scores[section].push({ card: cardLabel, value: value, type: type });
}

function removeScore(section, cardLabel) {
  if (!scores[section]) return;
  scores[section] = scores[section].filter(item => item.card !== cardLabel);
}

// =========================
// إضافة ملاحظة (!)
// =========================
function addNote(section) {
  let text = prompt("أدخل الملاحظة للقسم " + section);
  if (text) notes[section] = text;
  updateReport();
}

// =========================
// الصندوق العائم
// =========================
function openBox(content) {
  const box = document.getElementById('floatingBox');
  const closeButton = `<button class="btn-close" onclick="closeBox()">×</button>`;
  box.innerHTML = `${closeButton}${content}`;
  box.classList.add('show');
  box.style.opacity = '0';
  box.style.transition = 'opacity 0.3s ease';
  requestAnimationFrame(() => { box.style.opacity = '1'; });
}

function showInfo(text) { openBox(text); }
function showImage(src) { openBox(`<img src="${src}" alt="صورة">`); }

function closeBox() {
  const box = document.getElementById('floatingBox');
  box.style.opacity = '0';
  box.addEventListener('transitionend', function handler() {
    box.classList.remove('show');
    box.style.transition = '';
    box.removeEventListener('transitionend', handler);
  });
}

// =========================
// عدد البطاقات لكل قسم
// =========================
function getCardCount(section) {
  const map = {
    1:16, '2subA':4,'2subB':2,'2subC':6,'2subD':8,
    '3subA':8,'3subB':4,'3subC':4,
    4:6,5:18,
    '6subA':4,'6subB':4,'6subC':2,'6subD':2,'6subE':2,
    '7subA':6,'7subB':6,'7subC':6,
    8:6,
    '9subA':4,'9subB':4,'9subC':4,'9subD':2,'9subE':1,'9subF':2,
    '12sub1':8,'12sub2':2,'12sub3':8,'12sub4':9,
    10:6,
    11:0,
    '13sub1':6,'13sub2':6,'13sub3':6
  };
  return map[section] || 0;
}

// =========================
// حساب النسبة
// =========================
function calcPercent(section) {
  const totalCards = getCardCount(section);
  if (!scores[section] || totalCards===0) return 0;
  let sum = scores[section].reduce((acc,item)=>acc+item.value,0);
  return Math.round((sum/totalCards)*100);
}

// =========================
// تحديث نسبة الأقسام
// =========================
function updateSectionPercent(section) {
  let percent = 0;
  switch(section){
    case 1: percent=calcPercent(1); break;
    case 2: percent=Math.round(['2subA','2subB','2subC','2subD'].reduce((acc,s)=>acc+calcPercent(s),0)/4); break;
    case 3: percent=Math.round(['3subA','3subB','3subC'].reduce((acc,s)=>acc+calcPercent(s),0)/3); break;
    case 4: percent=calcPercent(4); break;
    case 5: percent=calcPercent(5); break;
    case 6: percent=Math.round(['6subA','6subB','6subC','6subD','6subE'].reduce((acc,s)=>acc+calcPercent(s),0)/5); break;
    case 7: percent=Math.round(['7subA','7subB','7subC'].reduce((acc,s)=>acc+calcPercent(s),0)/3); break;
    case 8: percent=calcPercent(8); break;
    case 9: percent=Math.round(['9subA','9subB','9subC','9subD','9subE','9subF'].reduce((acc,s)=>acc+calcPercent(s),0)/6); break;
    case 10: percent=calcPercent(10); break;
    case 12: percent=Math.round(['12sub1','12sub2','12sub3','12sub4'].reduce((acc,s)=>acc+calcPercent(s),0)/4); break;
  }
  let el=document.getElementById('percent'+section);
  if(el) el.innerText=percent+'%';
}

function updateAllSectionsPercent() {
  [1,2,3,4,5,6,7,8,9,10,12].forEach(s=>updateSectionPercent(s));
}

// =========================
// أسماء الأقسام
// =========================
const sectionTitles = {
  1:'التوجه والوعي',2:'الفهم السمعي',3:'الأسئلة الفكرية المعقدة',
  4:'حل المشكلات',5:'التسمية',6:'تكرار الجمل',
  7:'المنطق والاستدلال والفهم',8:'تنظيم الافكار',9:'القراءة والمعالجة البصرية',
  10:'الحساب',11:'البراغماتية والتأثير الانفعالي',12:'الذاكرة',13:'خصائص الكلام'
};

const subsectionTitles = {
  '2subA':'تقديم الاوامر البسيطة','2subB':'الأسئلة الشخصية البسيطة',
  '2subC':'أسئلة نعم/لا','2subD':'تقديم أوامر متتابعة',
  '3subA':'تفكير','3subB':'قصة ١','3subC':'قصة ٢',
  '6subA':'حرف','6subB':'رقم','6subC':'جمل قصيرة','6subD':'جمل متوسطة','6subE':'جمل طويلة',
  '7subA':'تصحيح جمل منطق','7subB':'تفسير معنى','7subC':'اللغة الدلالية',
  '9subA':'استبعاد كلمة','9subB':'اتباع اوامر','9subC':'فهم القرائي','9subD':'رسم ساعة','9subE':'إهمال البصري','9subF':'كتابة',
  '12sub1':'الذاكرة الفورية','12sub2':'قصة','12sub3':'الذاكرة الحديثة','12sub4':'الذاكرة طويلة المدى',
  '13sub1':'بارافيزيا','13sub2':'تعقيد الكلام','13sub3':'الصوت'
};

// =========================
// إنشاء التقرير
// =========================
function updateReport() {
  updateAllSectionsPercent();
  let report='';

  // البيانات الشخصية
  report+=`البيانات الشخصية والطبية\n`;
  report+=`الاسم: ${document.getElementById('name').value}\n`;
  report+=`الطبيب المعالج: ${document.getElementById('treatingDoctor').value}\n`;
  report+=`التشخيص الطبي: ${document.getElementById('medicalDiagnosis').value}\n`;
  report+=`تاريخ الحادث: ${document.getElementById('incidentDate').value}\n`;
  report+=`الحالة قبل الحادث: ${document.getElementById('preIncidentCondition').value}\n`;
  report+=`العمر: ${document.getElementById('age').value}\n`;
  report+=`تاريخ اليوم: ${document.getElementById('currentDate').value}\n`;
  report+=`النتائج: ${document.getElementById('results').value}\n`;
  report+=`الأدوية: ${document.getElementById('medications').value}\n`;
  report+=`اسم الفاحص: ${document.getElementById('examinerName').value}\n\n`;

  // الأقسام 1-10
  for(let sec of [1,2,3,4,5,6,7,8,9,10]){
    const el=document.getElementById('percent'+sec);
    if(el){
      let title=sectionTitles[sec];
      report+=`القسم ${sec} : ${title} - ${el.innerText}\n`;
      if(notes[sec]) report+=`ملاحظة: ${notes[sec]}\n`;
      Object.keys(subsectionTitles).filter(sk=>sk.startsWith(sec+'sub')).forEach(subKey=>{
        if(scores[subKey]){
          let subPercent=calcPercent(subKey);
          report+=`- ${subsectionTitles[subKey]}: ${subPercent}%`;
          let unknowns=scores[subKey].filter(i=>i.type==='dontknow').map(i=>i.card);
          if(unknowns.length>0) report+=` (أسئلة غير محددة: ${unknowns.join(', ')})`;
          report+='\n';
        }
      });
      report+='\n';
    }
  }

  // القسم 11
  if(scores[11] && scores[11].length>0){
    report+=`القسم 11 – البراغماتية والتأثير الانفعالي:\n`;
    scores[11].forEach(item=>{
      let mark=(item.type==='correct')?'+':(item.type==='dontknow')?'/':'-';
      report+=`- ${item.card} (${mark})\n`;
    });
    if(notes[11]) report+=`ملاحظة: ${notes[11]}\n`;
    report+='\n';
  }

  // القسم 12
  const el12=document.getElementById('percent12');
  if(el12){
    report+=`القسم 12 : ${sectionTitles[12]} - ${el12.innerText}\n`;
    if(notes[12]) report+=`ملاحظة: ${notes[12]}\n`;
    Object.keys(subsectionTitles).filter(sk=>sk.startsWith('12')).forEach(subKey=>{
      if(scores[subKey]){
        let subPercent=calcPercent(subKey);
        report+=`- ${subsectionTitles[subKey]}: ${subPercent}%`;
        let unknowns=scores[subKey].filter(i=>i.type==='dontknow').map(i=>i.card);
        if(unknowns.length>0) report+=` (أسئلة غير محددة: ${unknowns.join(', ')})`;
        report+='\n';
      }
    });
    report+='\n';
  }

  // القسم 13 – خصائص الكلام
  if(Object.keys(scores).some(k=>k.startsWith('13sub'))){
    report+=`القسم 13 – خصائص الكلام:\n`;
    if(notes[13]) report+=`ملاحظة: ${notes[13]}\n`;
    ['13sub1','13sub2','13sub3'].forEach(sub=>{
      if(scores[sub] && scores[sub].length>0){
        report+=`- ${subsectionTitles[sub]}:\n`;
        scores[sub].forEach(item=>{
          let mark=(item.type==='correct')?'+':(item.type==='dontknow')?'/':'-';
          report+=`  • ${item.card} (${mark})\n`;
        });
      }
    });
    report+='\n';
  }

  report+=`SLP. AHMAD GHANEM`;
  document.getElementById('report').value=report;
}

// =========================
// تحميل التقرير
// =========================
function downloadReport() {
  const text=document.getElementById('report').value;
  const blob=new Blob([text],{type:'text/plain;charset=utf-8'});
  const link=document.createElement('a');
  link.href=URL.createObjectURL(blob);
  link.download='التقرير.txt';
  link.click();
}
