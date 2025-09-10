/* Full M-CHAT app (non-editable questions, yes/no buttons, auto scoring, info modal, download)
   - Uses 23 fixed Arabic questions (taken/cleaned from user input)
   - Each question has a mapping: which answer counts as "غير طبيعي" (atypical)
   - Critical items: [1,7,9,13,14,15] (as agreed in previous step)
   - Auto-updates totals, shows interpretation, prepares report, can download .txt
*/

(function(){
  // Questions array (23). I used the content you pasted and formed clear Arabic items.
  const QUESTIONS = [
    "هل يستجيب الطفل عند مناداته باسمه؟",
    "هل يتتبع الطفل حركة الإشارة أو الإيماء (يأتبِع الإشارة إلى شيء)؟",
    "هل يستمتع الطفل بتسلق أو اللعب الحركي (مثل صعود السلالم/الألعاب الحركية)؟",
    "هل يعطي الطفل أو يشارك الألعاب أو الأشياء مع الآخرين؟",
    "هل يظهر سلوكيات متكررة أو حركات نمطية (مثل التلويح، الهز)؟",
    "هل يستخدم الطفل الإشارات غير اللفظية (مثل الإشارة بالإصبع لطلب شيء)؟",
    "هل يتبادل الطفل التواصل البصري مع الأشخاص المقربين عند التفاعل؟",
    "هل يلعب الطفل ألعاباً تخيّلية بسيطة أو ألعاب تظاهرية؟",
    "هل يستجيب الطفل عندما تناديه وتلتفت انتباهه (يركز عند المناداة)؟",
    "هل ينفذ الطفل أوامر بسيطة بدون الحاجة للإشارة؟",
    "هل يستطيع الطفل التركيز على شيء أو صوت لفترة قصيرة؟",
    "هل يتفاعل الطفل مع أصوات عالية أو مفاجئة (يظهر استجابة)؟",
    "هل يقلِّد الطفل حركات الوجه أو بعض الأصوات التي تراها أمامه؟",
    "هل يواجه الطفل صعوبة في توجيه نظره نحو شخص يتحدث إليه؟",
    "هل يتجنب الطفل التواصل البصري أثناء اللعب أو التفاعل؟",
    "هل بدأ الطفل يمشي في الفترة المتوقعة لنموه؟",
    "هل يظهر الطفل ارتباطاً غير عادي بأشياء معينة أو سلوكيات ثابتة؟",
    "هل يجيب الطفل عند مناداته أو عند رؤية وجه مألوف؟",
    "هل يتفاعل الطفل عاطفياً عندما يفرح أو يحزن الآخرون (ردود فعل اجتماعية)؟",
    "هل يجلب الطفل ألعاباً أو أشياء للفت الانتباه أو للمشاركة معك؟",
    "هل يلاحظ الآخرون أن الطفل يتصرف وكأنه في عالمه الخاص أحياناً؟",
    "هل يعيد الطفل رمي أو ترتيب الألعاب بشكل متكرر دون هدف واضح؟",
    "هل يظهر للطفل سلوكيات غير متوقعة مع الآخرين (مثل عدم الاستجابة أو الانسحاب)؟"
  ];

  // For each question: which answer counts as atypical ("غير طبيعي")
  // value 'yes' means answering YES counts as atypical; 'no' means answering NO counts as atypical.
  // These are set as reasonable defaults; clinician should interpret clinically.
  const ATYPICAL_MAP = {
    1: 'no',
    2: 'no',
    3: 'no',
    4: 'no',
    5: 'yes',
    6: 'no',
    7: 'no',
    8: 'yes',
    9: 'no',
    10: 'no',
    11: 'yes',
    12: 'yes',
    13: 'yes',
    14: 'yes',
    15: 'yes',
    16: 'no',
    17: 'yes',
    18: 'no',
    19: 'no',
    20: 'yes',
    21: 'yes',
    22: 'yes',
    23: 'yes'
  };

  // Critical items (1-based indices)
  const CRITICAL_ITEMS = new Set([1,7,9,13,14,15]);

  // DOM refs
  const qList = document.getElementById('questionsList');
  const totalScoreEl = document.getElementById('totalScore');
  const criticalScoreEl = document.getElementById('criticalScore');
  const interpretationEl = document.getElementById('interpretation');
  const reportArea = document.getElementById('reportArea');
  const downloadBtn = document.getElementById('downloadBtn');
  const resetBtn = document.getElementById('resetBtn');
  const infoBtn = document.getElementById('infoBtn');
  const overlay = document.getElementById('overlay');
  const closeModal = document.getElementById('closeModal');
  const modalTableBody = document.getElementById('modalTableBody');
  const childNameEl = document.getElementById('childName');
  const clinicianNameEl = document.getElementById('clinicianName');
  const examDateEl = document.getElementById('examDate');

  // State: answers: index-> 'yes' | 'no' | null
  const answers = new Array(24).fill(null); // ignore 0

  // Build UI questions (non-editable text)
  function buildQuestions(){
    for(let i=1;i<=23;i++){
      const qwrap = document.createElement('div');
      qwrap.className = 'q-item';
      qwrap.innerHTML = `
        <div class="q-index">${i}</div>
        <div class="q-text">${QUESTIONS[i-1]}</div>
        <div class="q-actions" data-index="${i}">
          <button class="btn button-toggle" data-val="yes">نعم</button>
          <button class="btn button-toggle" data-val="no">لا</button>
        </div>
      `;
      qList.appendChild(qwrap);
    }
  }

  // Update modal table with atypical mapping list
  function fillModalTable(){
    modalTableBody.innerHTML = '';
    for(let i=1;i<=23;i++){
      const tr = document.createElement('tr');
      const qshort = QUESTIONS[i-1].length > 60 ? QUESTIONS[i-1].slice(0,57) + '...' : QUESTIONS[i-1];
      const atyp = ATYPICAL_MAP[i] === 'yes' ? 'نعم' : 'لا';
      const crit = CRITICAL_ITEMS.has(i) ? 'نعم' : '-';
      tr.innerHTML = `<td>${i}</td><td style="text-align:right;padding-right:10px">${qshort}</td><td>${atyp}</td><td>${crit}</td>`;
      modalTableBody.appendChild(tr);
    }
  }

  // Toggle answer when user clicks yes/no
  function attachToggleHandlers(){
    qList.addEventListener('click', (e)=>{
      const btn = e.target.closest('.button-toggle');
      if(!btn) return;
      const parent = btn.parentElement;
      const index = Number(parent.getAttribute('data-index'));
      const val = btn.getAttribute('data-val'); // 'yes' or 'no'

      // Update state: toggle same button off, or switch to other
      if(answers[index] === val){
        answers[index] = null;
      } else {
        answers[index] = val;
      }
      renderButtonsForIndex(index);
      calculateAndRender();
    });
  }

  // Render button states for a question index
  function renderButtonsForIndex(index){
    const container = qList.querySelector(`.q-actions[data-index="${index}"]`);
    if(!container) return;
    const yesBtn = container.querySelector('button[data-val="yes"]');
    const noBtn = container.querySelector('button[data-val="no"]');
    yesBtn.classList.toggle('active', answers[index] === 'yes');
    noBtn.classList.toggle('active', answers[index] === 'no');
  }

  // Calculate scores
  function calculateScores(){
    let total = 0, critical = 0;
    for(let i=1;i<=23;i++){
      const picked = answers[i]; // yes | no | null
      if(!picked) continue;
      const atyp = ATYPICAL_MAP[i];
      if(picked === atyp){
        total++;
        if(CRITICAL_ITEMS.has(i)) critical++;
      }
    }
    return {total, critical};
  }

  // Determine interpretation text
  function getInterpretation(total, critical){
    let interp = '';
    if(total <= 2){
      interp = 'خطر منخفض: مراقبة دورية ومتابعة نمو. لا حاجة فورية لإحالة ما لم تكن هناك ملاحظات سريرية إضافية.';
    } else if(total >=3 && total <=7){
      interp = 'خطر متوسط: يوصى بإعادة الفحص خلال 2–4 أسابيع أو إحالة لتقييم شامل بحسب الموارد والسريرية.';
    } else {
      interp = 'خطر مرتفع: إحالة فورية لتقييم تشخيصي شامل من فريق متعدد التخصصات.';
    }

    if(critical >= 2){
      interp += ' ملاحظة: وجود ≥2 عناصر حرجة غير طبيعية — إحالة عاجلة موصى بها بغض النظر عن الدرجة الكمية.';
    }
    return interp;
  }

  // Generate report text
  function generateReportText(total, critical, interp){
    const child = childNameEl.value.trim() || 'غير محدد';
    const clin = clinicianNameEl.value.trim() || 'غير محدد';
    const date = examDateEl.value || (new Date()).toISOString().slice(0,10);

    const lines = [];
    lines.push('تقرير فحص M-CHAT');
    lines.push(`اسم الطفل / المعرف: ${child}`);
    lines.push(`تاريخ الفحص: ${date}`);
    lines.push(`المُقيّم: ${clin}`);
    lines.push('');
    lines.push('النتائج:');
    lines.push(`الدرجة الكمية: ${total}`);
    lines.push(`الدرجة الحرجة: ${critical}`);
    lines.push('');
    lines.push('التفسير:');
    lines.push(interp);
    lines.push('');
lines.push('تفصيل الإجابات: (نعم = Yes، لا = No، - = لم يُجب)`');

// Loop through each question and show its answer
for (let i = 1; i <= 23; i++) {
  const ans = answers[i] 
    ? (answers[i] === 'yes' ? 'نعم' : 'لا') 
    : '-';
  lines.push(`${i}. ${QUESTIONS[i-1]} — الإجابة: ${ans}`);
}

return lines.join('\n');
  }

  // Calculate & render UI
  function calculateAndRender(){
    const {total, critical} = calculateScores();
    totalScoreEl.textContent = total;
    criticalScoreEl.textContent = critical;
    const interp = getInterpretation(total, critical);
    interpretationEl.textContent = interp;
    reportArea.value = generateReportText(total, critical, interp);
  }

  // Reset all
  function resetAll(){
    for(let i=1;i<=23;i++){
      answers[i] = null;
      renderButtonsForIndex(i);
    }
    calculateAndRender();
  }

  // Download report as .txt
  function downloadReport(){
    calculateAndRender(); // ensure latest
    const text = reportArea.value || '';
    const blob = new Blob([text], {type:'text/plain;charset=utf-8'});
    const filename = `MCHAT_report_${(new Date()).toISOString().slice(0,10)}.txt`;
    if(window.navigator && window.navigator.msSaveOrOpenBlob){
      window.navigator.msSaveOrOpenBlob(blob, filename);
    } else {
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(url);
    }
    downloadBtn.textContent = 'تم التنزيل';
    setTimeout(()=> downloadBtn.textContent = 'تنزيل التقرير', 1400);
  }

  // Modal show/hide with outside click to close
  function showModal(){
    overlay.classList.remove('hidden');
  }
  function hideModal(){
    overlay.classList.add('hidden');
  }
  function setupModalBehavior(){
    // close button
    closeModal.addEventListener('click', hideModal);
    // outside click
    overlay.addEventListener('click', (e)=>{
      if(e.target === overlay) hideModal();
    });
  }

  // Init
  function init(){
    buildQuestions();
    fillModalTable();
    attachToggleHandlers();
    setupModalBehavior();
    // initial render
    calculateAndRender();

    // hook buttons
    downloadBtn.addEventListener('click', downloadReport);
    resetBtn.addEventListener('click', resetAll);
    infoBtn.addEventListener('click', showModal);
  }

  // Run init after DOM ready
  if(document.readyState === 'loading'){
    document.addEventListener('DOMContentLoaded', init);
  } else init();

})();
