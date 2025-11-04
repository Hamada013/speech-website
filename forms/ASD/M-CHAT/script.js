(function(){
  // ---------- Data ----------
  const QUESTIONS = [
    "هل يستمتع طفلك بالآرجحة على ركبتك أو عندما تحضنه ؟",
    "هل لطفلك اهتمام بالأطفال الآخرين ؟",
    "هل يحب طفلك التسلق على الأشياء مثل صعود الدرج مثلا ؟",
    "هل يستمتع طفلك بلعبة الاختباء والاختفاء (الغميضة) ؟",
    "هل يتظاهر طفلك بالحديث بالهاتف أو اللعب بالدمى أو التظاهر بأشياء أخرى ؟",
    "هل يستخدم طفلك إصبعته (سبابته) للإشارة أو السؤال عن شيء ؟",
    "هل يستخدم طفلك إصبعته (سبابته) للتعبير عن اهتمامه بشيء معين ؟",
    "هل يلعب طفلك كما يجب باللعب الصغيرة السيارات ، المكعبات … بدون أن يضعها في فمه أو يعبث بها أو يرميها ؟",
    "هل يحاول طفلك أن يجلب أشياء لكي يريك شيء ما ؟",
    "هل يمكن لطفلك أن يحدق في عينيك لاكثر من ثانية ؟",
    "هل يبدو طفلك حساساً للضوضاء أو الأصوات (مثال يغلق أو يسد أذنيه) ؟",
    "هل يتجاوب طفلك لابتسامتك أو نظرتك بابتسامه ؟",
    "هل يقلدك طفلك (مثل يقوم بتقليد وجهك معبرا عن الفرح أو الحزن) ؟",
    "هل يستجيب (يلتفت أو ينتبه) الطفل عندما تناديه باسمه ؟",
    "عندما تشير إلى لعبه أو شيء في الغرفة ، هل ينظر طفلك إليها ؟",
    "هل يمشي طفلك ؟",
    "هل ينظر طفلك إلى الأشياء التي تنظر إليها ؟",
    "هل يقوم طفلك بحركات غير اعتيادية بأصبعه أمام وجهه ؟",
    "هل يحاول طفلك جذب (لفت) انتباهك إلى ما يقوم به (يفعله) ؟",
    "هل تساءلت يوما إذا كان طفلك أصم (لايسمع) ؟",
    "هل يفهم طفلك مايقوله الآخرون ؟",
    "هل يحدق طفلك أحيانا في شيء غير معين أو يتجول بدون هدف ؟",
    "هل ينظر طفلك إلى وجهك لمعرفة إحساسك أو ردة فعلك عندما يواجه شيئا غير معتاد عليه ؟"
  ];

  // Polished descriptions + examples for each question (1-based indices)
  const QUESTIONS_INFO = {
    1: {
      description: "يقيس هذا البند الاهتمام بالتفاعل الجسدي والحميمي مع البالغين، وهو مؤشر على الاستجابة الاجتماعية والارتباط.",
      example: "مثال: يضحك الطفل أو يستمتع عندما تُرجحه على ركبتك أو عندما تحضنه."
    },
    2: {
      description: "يقيس مدى اهتمام الطفل بالأقران وسلوكه تجاه أطفال آخرين خلال اللعب أو التواجد نفسه.",
      example: "مثال: يراقب أطفال آخرين، يقترب للعب، أو يستجيب لمقترحات اللعب."
    },
    3: {
      description: "سلوك التسلق طبيعي ويدل على نشاط وحركة؛ يُستخدم هنا كمؤشر على مشاركة الطفل في اللعب الحركي.",
      example: "مثال: يتسلق السلالم أو الأثاث بطريقة متكررة أثناء اللعب."
    },
    4: {
      description: "اللعب بالاختباء (غميضة) مؤشر على الفهم الاجتماعي والمرح المشترك والقدرة على تبادل الأدوار.",
      example: "مثال: يستمتع الطفل بلعبة الاختباء ويبحث عنك أو يضحك عندما تُظهر نفسك."
    },
    5: {
      description: "اللعب التظاهري يدل على نمو الخيال والتمثيل الاجتماعي وقدرة الطفل على محاكاة أدوار الحياة اليومية.",
      example: "مثال: يتظاهر بالحديث على هاتف أو يطعم دمية."
    },
    6: {
      description: "الإشارة بالسبابة لطلب شيء مؤشر مهم لتواصل مقصود وتوجيه انتباه الآخرين.",
      example: "مثال: يشير الطفل إلى لعبة يريدها بدلاً من الإمساك بها وسحبها."
    },
    7: {
      description: "استخدام الإشارة لجذب الانتباه إلى شيء ما يدل على التواصل التشاركي (joint attention).",
      example: "مثال: يشير إلى طائر أو لعبة ليريك ما يراه."
    },
    8: {
      description: "اللعب الوظيفي باللعب الصغيرة يعكس التطور الحسي الحركي والقدرة على استخدام الأشياء بطريقة مقبولة.",
      example: "مثال: يلعب بالسيارات والمكعبات بشكل مناسب دون مصها أو رميها المستمر."
    },
    9: {
      description: "جلب الأشياء لإظهارها للبالغين يدل على رغبة في المشاركة والتواصل المقصود.",
      example: "مثال: يحضر لعبة ليُريك شيئاً ويُنتظر تفاعلك."
    },
    10: {
      description: "التواصل البصري المطول (أكثر من ثانية) مؤشر على الربط الاجتماعي والاهتمام بالمتفاعل.",
      example: "مثال: يستطيع الطفل أن ينظر إلى عينيك لثانية أو أكثر أثناء التفاعل."
    },
    11: {
      description: "حساسية أصوات عالية أو مفاجئة قد تظهر سلوكيات تغطي الأذن أو انسحاب؛ مؤشر على المعالجة الحسية.",
      example: "مثال: يغلق أذنيه أو يبتعد عند سماع أصوات مفاجئة."
    },
    12: {
      description: "الاستجابة لابتسامتك أو نظرتك تعكس التفاعل الاجتماعي المبكر وردود الفعل العاطفية.",
      example: "مثال: يبتسم أو يرد بنظرة عندما تبتسم له."
    },
    13: {
      description: "التقليد الوجهي أو الصوتي مؤشر قوي على التعلم الاجتماعي والتواصل غير اللفظي.",
      example: "مثال: يقلد تعبير وجهك أو يصدر أصواتاً تشبه ما تفعل."
    },
    14: {
      description: "الاستجابة بالالتفات عند مناداة الاسم مؤشر مهم على الانتباه السمعي والتواصل الاجتماعي.",
      example: "مثال: يلتفت أو ينظر عندما تناديه باسمه."
    },
    15: {
      description: "متابعة الإشارة بالانتباه تشير إلى فهم تأطير الانتباه المشترك والقدرة على تتبع الإشارة.",
      example: "مثال: عندما تشير إلى لعبة، ينظر الطفل إليها."
    },
    16: {
      description: "المشي ضمن النطاق المتوقع يدل على التطور الحركي الأساسي؛ يُسأل هنا للتمييز التنموي العام.",
      example: "مثال: يمشي الطفل مستقيم الخطوات دون دعم في الوقت المتوقع."
    },
    17: {
      description: "النظر إلى نفس الأشياء التي تنظر إليها يعكس الانتباه المشترك وفهم القصد.",
      example: "مثال: تنظر إلى صورة في كتاب والطفل ينظر إليها أيضاً."
    },
    18: {
      description: "حركات إصبعية غير اعتيادية أمام الوجه قد تكون سلوكاً نمطياً متكررًا ويحتاج الملاحظة.",
      example: "مثال: يحرك الطفل إصبعه أمام عينيه أو وجهيه بشكل متكرر."
    },
    19: {
      description: "محاولة جذب الانتباه إلى ما يقوم به يدل على التواصل المقصود والرغبة بالانخراط معك.",
      example: "مثال: يظهر لعبة أو عمل ليطلب منك النظر أو التفاعل."
    },
    20: {
      description: "القلق حول السمع مُهم لاستبعاد ضعف سمعي قد يفسر بعض صعوبات التواصل.",
      example: "مثال: يبدو أن الطفل لا يستجيب لأصوات مألوفة مثل اسم والدته."
    },
    21: {
      description: "فهم ما يقوله الآخرون يظهر مستوى اللغة الاستقبالية المناسب للعمر.",
      example: "مثال: يستجيب لأوامر بسيطة أو يفهم تعليمات قصيرة."
    },
    22: {
      description: "التحديق المطوّل أو التجوال بدون هدف قد يعكس غياب الانتباه للمنبهات الاجتماعية أو انشغال خاص.",
      example: "مثال: يحدق في نقطة ثابتة لساعات قصيرة أو يتجول بدون تركيز."
    },
    23: {
      description: "البحث عن رد فعلك الوجهية عند مواقف جديدة يدل على قراءة المشاعر والربط الاجتماعي.",
      example: "مثال: ينظر إلى وجهك ليرى إن كنت قلقاً أو سعيداً عندما يواجه شيئاً جديداً."
    }
  };

  // Mapping which answer counts as atypical: 'yes' means YES counts as atypical; 'no' means NO counts as atypical.
  const ATYPICAL_MAP = {
    1: 'no', 2: 'no', 3: 'no', 4: 'no', 5: 'no', 6: 'no', 7: 'no', 8: 'no',
    9: 'no', 10: 'no', 11: 'yes', 12: 'no', 13: 'no', 14: 'no', 15: 'no',
    16: 'no', 17: 'no', 18: 'yes', 19: 'no', 20: 'yes', 21: 'no', 22: 'yes', 23: 'no'
  };

const CRITICAL_ITEMS = new Set([2,7,9,13,14,15]);

function buildQuestions() {
  const qList = document.querySelector('.questions-list');
  QUESTIONS.forEach((q, index) => {
    const qNumber = index + 1;
    const qItem = document.createElement('div');
    qItem.className = 'q-item';
    
    // Add critical class if in set
    if (CRITICAL_ITEMS.has(qNumber)) {
      qItem.classList.add('critical');
    }

    qItem.innerHTML = `
      <div class="q-index">${qNumber}</div>
      <div class="q-text">${q}</div>
      <div class="q-actions">
        <button class="btn button-toggle" data-val="yes">نعم</button>
        <button class="btn button-toggle" data-val="no">لا</button>
      </div>
    `;
    qList.appendChild(qItem);
  });
}

  // ---------- DOM refs ----------
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

  // State
  const answers = new Array(24).fill(null); // 1..23

  // ---------- Build UI ----------
  function buildQuestions(){
    qList.innerHTML = '';
    for(let i=1;i<=23;i++){
      const wrap = document.createElement('div');
      wrap.className = 'q-item';
        if (CRITICAL_ITEMS.has(i)) wrap.classList.add('critical');
      wrap.innerHTML = `
        <div class="q-header" data-index="${i}" tabindex="0" role="button" aria-expanded="false" aria-controls="details-${i}">
          <div class="q-index">${i}</div>
          <div class="q-text">${QUESTIONS[i-1]}</div>
          <div class="q-actions" data-index="${i}">
            <button class="btn button-toggle" data-val="yes" aria-pressed="false">نعم</button>
            <button class="btn button-toggle" data-val="no" aria-pressed="false">لا</button>
          </div>
        </div>
        <div class="q-details hidden" id="details-${i}" aria-hidden="true">
          <p><strong>وصف:</strong> ${QUESTIONS_INFO[i].description}</p>
          <p><strong>مثال:</strong> ${QUESTIONS_INFO[i].example}</p>
        </div>
      `;
      qList.appendChild(wrap);
    }
  }

  // Fill modal table
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

  // Toggle yes/no via delegation
  function attachToggleHandlers(){
    qList.addEventListener('click', (e)=>{
      const btn = e.target.closest('.button-toggle');
      if(!btn) return;
      const parent = btn.parentElement;
      const index = Number(parent.getAttribute('data-index'));
      const val = btn.getAttribute('data-val'); // 'yes' | 'no'

      if(answers[index] === val){
        answers[index] = null;
      } else {
        answers[index] = val;
      }
      renderButtonsForIndex(index);
      calculateAndRender();
    });

    // keyboard support for toggling details (Enter / Space)
    qList.addEventListener('keydown', (e)=>{
      const header = e.target.closest('.q-header');
      if(!header) return;
      if(e.key === 'Enter' || e.key === ' '){
        e.preventDefault();
        toggleDetails(Number(header.getAttribute('data-index')));
      }
    });
  }

  // Render button states
  function renderButtonsForIndex(index){
    const container = qList.querySelector(`.q-actions[data-index="${index}"]`);
    if(!container) return;
    const yesBtn = container.querySelector('button[data-val="yes"]');
    const noBtn = container.querySelector('button[data-val="no"]');
    yesBtn.classList.toggle('active', answers[index] === 'yes');
    noBtn.classList.toggle('active', answers[index] === 'no');
    yesBtn.setAttribute('aria-pressed', answers[index] === 'yes' ? 'true' : 'false');
    noBtn.setAttribute('aria-pressed', answers[index] === 'no' ? 'true' : 'false');
  }

  // Scores
  function calculateScores(){
    let total = 0, critical = 0;
    for(let i=1;i<=23;i++){
      const picked = answers[i];
      if(!picked) continue;
      const atyp = ATYPICAL_MAP[i];
      if(picked === atyp){
        total++;
        if(CRITICAL_ITEMS.has(i)) critical++;
      }
    }
    return {total, critical};
  }

  function getInterpretation(total, critical){
    let interp = '';
    if(total <= 2){
      interp = 'خطر منخفض: مراقبة دورية ومتابعة نمو. لا حاجة فورية لإحالة ما لم تكن هناك ملاحظات سريرية إضافية.';
    } else if(total >=3 && total <=7){
      interp = 'خطر متوسط: يوصى بإعادة الفحص خلال 2–4 أسابيع أو إحالة لتقييم شامل بحسب الموارد والالملاحظات السريرية.';
    } else {
      interp = 'خطر مرتفع: إحالة فورية لتقييم تشخيصي شامل من فريق متعدد التخصصات.';
    }

    if(critical >= 2){
      interp += ' ملاحظة: وجود ≥2 عناصر حرجة غير طبيعية — إحالة عاجلة موصى بها بغض النظر عن الدرجة الكمية.';
    }
    return interp;
  }

  // Report
function generateReportText(total, critical, interp){
  const child = childNameEl.value.trim() || 'غير محدد';
  const clin = clinicianNameEl.value.trim() || 'غير محدد';
  const date = examDateEl.value || (new Date()).toISOString().slice(0,10);

  const correct = [];
  const incorrect = [];

  for (let i = 1; i <= 23; i++) {
    const ans = answers[i] 
      ? (answers[i] === 'yes' ? 'نعم' : 'لا') 
      : '-';
    // check if answer matches atypical mapping
    const atypical = ATYPICAL_MAP[i]; // 'yes' or 'no'
    if(answers[i] === atypical){
      incorrect.push(`${i}. ${QUESTIONS[i-1]} — الإجابة: ${ans}`);
    } else {
      correct.push(`${i}. ${QUESTIONS[i-1]} — الإجابة: ${ans}`);
    }
  }

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
  
  if(correct.length){
    lines.push('الإجابات الطبيعية / صحيحة:');
    lines.push(...correct);
    lines.push('');
  }

  if(incorrect.length){
    lines.push('الإجابات غير الطبيعية / غير صحيحة:');
    lines.push(...incorrect);
    lines.push('');
  }

  return lines.join('\n');
}

  // Render UI
  function calculateAndRender(){
    const {total, critical} = calculateScores();
    totalScoreEl.textContent = total;
    criticalScoreEl.textContent = critical;
    const interp = getInterpretation(total, critical);
    interpretationEl.textContent = interp;
    reportArea.value = generateReportText(total, critical, interp);
  }

  // Reset
  function resetAll(){
    for(let i=1;i<=23;i++){
      answers[i] = null;
      renderButtonsForIndex(i);
      closeDetails(i);
    }
    calculateAndRender();
  }

  // Download
  function downloadReport(){
    calculateAndRender();
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
    setTimeout(()=> downloadBtn.textContent = 'تنزيل التقرير (نص)', 1400);
  }

  // Modal
  function showModal(){
    overlay.classList.remove('hidden');
    overlay.setAttribute('aria-hidden', 'false');
  }
  function hideModal(){
    overlay.classList.add('hidden');
    overlay.setAttribute('aria-hidden', 'true');
  }
  function setupModalBehavior(){
    closeModal.addEventListener('click', hideModal);
    overlay.addEventListener('click', (e)=>{
      if(e.target === overlay) hideModal();
    });
  }

  // ---------- Details (accordion) ----------
  function toggleDetails(index){
    const details = document.getElementById(`details-${index}`);
    const header = qList.querySelector(`.q-header[data-index="${index}"]`);
    if(!details || !header) return;

    const isHidden = details.classList.contains('hidden');

    // close all others
    document.querySelectorAll('.q-details').forEach(d => {
      if(!d.classList.contains('hidden')){
        d.classList.add('hidden');
        d.setAttribute('aria-hidden','true');
        const h = qList.querySelector(`.q-header[data-index="${d.id.replace('details-','')}"]`);
        if(h) h.setAttribute('aria-expanded','false');
      }
    });

    if(isHidden){
      details.classList.remove('hidden');
      details.setAttribute('aria-hidden','false');
      header.setAttribute('aria-expanded','true');
      // ensure visible (optional scroll)
      setTimeout(()=> details.scrollIntoView({behavior:'smooth', block:'nearest'}), 160);
    } else {
      details.classList.add('hidden');
      details.setAttribute('aria-hidden','true');
      header.setAttribute('aria-expanded','false');
    }
  }

  // close specific
  function closeDetails(index){
    const details = document.getElementById(`details-${index}`);
    const header = qList.querySelector(`.q-header[data-index="${index}"]`);
    if(details){ details.classList.add('hidden'); details.setAttribute('aria-hidden','true'); }
    if(header) header.setAttribute('aria-expanded','false');
  }

  function attachQuestionHeaderToggles(){
    qList.addEventListener('click', (e)=>{
      const header = e.target.closest('.q-header');
      // if clicked on button inside header, ignore here — handled elsewhere
      if(!header) return;
      // if the click target is a toggle button, do not handle as header toggle
      if(e.target.closest('.button-toggle')) return;
      const index = Number(header.getAttribute('data-index'));
      toggleDetails(index);
    });
  }

  // ---------- Init ----------
  function init(){
    buildQuestions();
    fillModalTable();
    attachToggleHandlers();
    attachQuestionHeaderToggles();
    setupModalBehavior();
    calculateAndRender();

    downloadBtn.addEventListener('click', downloadReport);
    resetBtn.addEventListener('click', resetAll);
    infoBtn.addEventListener('click', showModal);
  }

  if(document.readyState === 'loading'){
    document.addEventListener('DOMContentLoaded', init);
  } else init();

})();
