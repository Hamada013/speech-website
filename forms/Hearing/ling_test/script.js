// =========================
// Variables & Setup
// =========================
const cardSounds = [
  {id: 'card1', sound: 'sound1', name: 'a'},
  {id: 'card2', sound: 'sound2', name: 'i'},
  {id: 'card3', sound: 'sound3', name: 'u'},
  {id: 'card4', sound: 'sound4', name: 's'},
  {id: 'card5', sound: 'sound5', name: 'sh'},
  {id: 'card6', sound: 'sound6', name: 'm'}
];

let currentSound = null;
let trialCount = 0;
const maxTrials = 10;
let sessionResults = [];
let allCycles = [];
let cycleNumber = 1;
let lastNote = "";
let trialActive = false;
let remainingSounds = [...cardSounds]; // for ensuring all six tested once

const findings = {
  'm': "Low (~250 Hz) - Low-frequency sounds; vowel/nasal detection",
  'a': "Low-mid (~500 Hz) - Low-mid vowel sound",
  'i': "Mid (~2000 Hz) - Mid-frequency vowel sound",
  'u': "Low-mid (~500 Hz) - Rounded vowel, mid-low frequency",
  'sh': "High (~4000 Hz) - High-frequency consonant",
  's': "Very high (~6000 Hz) - Very high-frequency consonant; fricative"
};

const correctSound = new Audio('sounds/correct.mp3');
const incorrectSound = new Audio('sounds/incorrect.mp3');

// =========================
// Auto-fill date & age
// =========================
function fillDateAndAge() {
  const today = new Date();
  document.getElementById('currentDate').value = today.toISOString().split('T')[0];
  const birthInput = document.getElementById('birthDate');
  birthInput.addEventListener('change', () => {
    const birthDate = new Date(birthInput.value);
    if (!isNaN(birthDate)) {
      let age = today.getFullYear() - birthDate.getFullYear();
      const m = today.getMonth() - birthDate.getMonth();
      if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) age--;
      document.getElementById('age').value = age;
    }
  });
}
fillDateAndAge();

// =========================
// Current Sound Box
// =========================
function showCurrentSoundBox(letter) {
  let box = document.getElementById('currentSoundBox');
  if (box) box.textContent = letter;
}

// =========================
// Play sound
// =========================
function playSound(id, callback, retryCount = 0) {
  const audio = document.getElementById(id);
  if (!audio) return;
  audio.currentTime = 0;
  audio.play().then(() => {
    audio.onended = () => { if (callback) callback(); };
  }).catch(() => {
    if (retryCount < 3) {
      setTimeout(() => playSound(id, callback, retryCount + 1), 100);
    } else if (callback) callback();
  });
}

// =========================
// "+" Button: Start next trial
// =========================
function startNextTrial() {
  if (trialCount >= maxTrials) {
    showFloatingBox('المحاولة الحالية انتهت! اضغط + لبدء محاولة جديدة.');
    return;
  }
  trialActive = true;
  showFloatingBoxWithImage('images/ear.png', 1000, () => {
    if (remainingSounds.length > 0) {
      // Pick one sound from remaining to ensure all six appear
      const index = Math.floor(Math.random() * remainingSounds.length);
      currentSound = remainingSounds.splice(index, 1)[0];
    } else {
      // After all six used, pick random for remaining trials
      const index = Math.floor(Math.random() * cardSounds.length);
      currentSound = cardSounds[index];
    }
    showCurrentSoundBox(currentSound.name);
  });
}

// =========================
// Card click handler
// =========================
function selectCard(cardId) {
  const cardObj = cardSounds.find(c => c.id === cardId);
  if (!cardObj || !trialActive || !currentSound) return;

  playSound(cardObj.sound);

  const correct = currentSound.id === cardId;
  sessionResults.push({ playedSound: currentSound.name, correct });

  correct ? correctSound.play() : incorrectSound.play();

  const percent = Math.round((sessionResults.filter(r => r.correct).length / maxTrials) * 100);
  document.getElementById('progress1').style.width = percent + '%';
  document.getElementById('percent1').textContent = `${percent}%`;

  trialCount++;
  currentSound = null;
  trialActive = false;
  showCurrentSoundBox('');

  if (trialCount >= maxTrials) {
    saveCycle();
    trialCount = 0;
    sessionResults = [];
    remainingSounds = [...cardSounds];
    document.getElementById('progress1').style.width = '0%';
    document.getElementById('percent1').textContent = '0%';
    cycleNumber++;
    showFloatingBox('المحاولة انتهت!');
  }
}

// =========================
// Save cycle results
// =========================
function saveCycle() {
  const totalCorrect = sessionResults.filter(r => r.correct).length;
  const percent = Math.round((totalCorrect / maxTrials) * 100);

  // Check if all six sounds had at least one correct
  const allSixCorrect = cardSounds.every(s =>
    sessionResults.some(r => r.playedSound === s.name && r.correct)
  );

  const passFail = (percent >= 80 && allSixCorrect) ? 'نجح' : 'لم ينجح';

  const correctSounds = sessionResults.filter(r => r.correct).map(r => r.playedSound);
  const incorrectSounds = sessionResults.filter(r => !r.correct).map(r => r.playedSound);

  // Build result strings for "+/-"
  const resultStrings = cardSounds.map(s => {
    const trials = sessionResults.filter(r => r.playedSound === s.name);
    let str = s.name;
    trials.forEach(t => str += t.correct ? ' +' : ' -');
    return str;
  });

  allCycles.push({
    cycle: cycleNumber,
    percent,
    passFail,
    correctSounds,
    incorrectSounds,
    resultStrings,
    note: lastNote
  });
  lastNote = "";
  updateReport();
}

// =========================
// Add note
// =========================
function addNote() {
  const note = prompt("اكتب ملاحظتك لهذه المحاولة:");
  if (!note) return;
  lastNote = note;
  showFloatingBox("تمت إضافة الملاحظة!");
  updateReport();
}

// =========================
// Update final report
// =========================
function updateReport() {
  const name = document.getElementById('name').value || 'غير محدد';
  const birthDate = document.getElementById('birthDate').value || 'غير محدد';
  const age = document.getElementById('age').value || 'غير محدد';
  const diagnosis = document.getElementById('medicalDiagnosis').value || 'غير محدد';
  const examiner = document.getElementById('examinerName').value || 'غير محدد';
  const today = document.getElementById('currentDate').value || 'غير محدد';

  let reportText = `معلومات المستخدم:
الاسم: ${name}
تاريخ الميلاد: ${birthDate}
العمر: ${age}
التاريخ: ${today}
التشخيص: ${diagnosis}
الاختصاصي: ${examiner}\n\n`;

  allCycles.forEach(c => {
    reportText += `المحاولة ${c.cycle}: (${c.percent}%)
الحالة: ${c.passFail}
الأصوات:
- ${c.resultStrings.join('\n- ')}\n`;

    if (c.incorrectSounds.length) {
      reportText += "النتائج:\n";
      const uniqueIncorrect = [...new Set(c.incorrectSounds)];
      uniqueIncorrect.forEach(s => { 
        if (findings[s]) reportText += `- ${s}: ${findings[s]}\n`; 
      });
    }
    if (c.note) reportText += `ملاحظة المحاولة: ${c.note}\n\n`;
  });

  reportText += "SLP. Ahmad Ghanem";
  document.getElementById('report').value = reportText;
}

// =========================
// Floating Boxes
// =========================
function showFloatingBox(message) {
  const box = document.getElementById('floatingBox');
  box.innerHTML = `<p>${message}</p>`;
  box.style.display = 'block';
  box.classList.add('show');
  setTimeout(() => { box.classList.remove('show'); box.style.display = 'none'; }, 1500);
}

function showFloatingBoxWithImage(imgSrc, duration, callback) {
  const box = document.getElementById('floatingBox');
  box.innerHTML = `<img src="${imgSrc}" alt="صورة">`;
  box.style.display = 'block';
  box.classList.add('show');
  setTimeout(() => { box.classList.remove('show'); box.style.display = 'none'; if (callback) callback(); }, duration);
}

// =========================
// Expand Section
// =========================
function expandCard(sectionNum) {
  if (sectionNum !== 1) return;
  const sec = document.getElementById('section1');
  sec.classList.toggle('expanded');
  if (sec.classList.contains('expanded')) {
    sec.style.width = "89vw";
    sec.style.height = "89vh";
  } else {
    sec.style.width = "";
    sec.style.height = "";
  }
}

// =========================
// Download report
// =========================
function downloadReport() {
  const reportText = document.getElementById('report').value;
  const blob = new Blob([reportText], {type: "text/plain;charset=utf-8"});
  const link = document.createElement("a");
  link.href = URL.createObjectURL(blob);
  link.download = "report.txt";
  link.click();
}

// =========================
// Shuffle Cards
// =========================
function shuffleCards() {
  const wrapper = document.querySelector('#section1 .card-wrapper');
  const cards = Array.from(wrapper.querySelectorAll('.card'));
  cards.forEach(card => { card.style.transition = 'transform 0.25s ease'; card.style.transform = 'translateY(-15px)'; });

  setTimeout(() => {
    cards.forEach(card => card.style.transform = 'translateY(0)');
    const shuffled = cards.map(card => ({sort: Math.random(), value: card}))
                          .sort((a, b) => a.sort - b.sort)
                          .map(obj => obj.value);
    shuffled.forEach(card => wrapper.appendChild(card));
    showFloatingBox("تم خلط الأصوات!");
    attachCardListeners();
  }, 250);
}

// =========================
// Event listeners
// =========================
function attachCardListeners() {
  document.querySelectorAll('#section1 .card').forEach(card => {
    card.onclick = () => selectCard(card.id);
  });
}
attachCardListeners();

// Add shuffle button next to "+"
const addBtn = document.querySelector('.btn-add');
if (addBtn) {
  const shuffleBtn = document.createElement('button');
  shuffleBtn.textContent = '↔';
  shuffleBtn.classList.add('btn-add','btn-shuffle');
  shuffleBtn.style.marginLeft = '5px';
  shuffleBtn.title = 'خلط الأصوات';
  shuffleBtn.onclick = shuffleCards;
  addBtn.parentNode.insertBefore(shuffleBtn, addBtn.nextSibling);
}

// =========================
// Feedback animations
// =========================
function animateFeedback(element, type) {
  if (!element) return;
  element.classList.remove('correct', 'incorrect', 'note', 'dontknow');
  element.classList.add(type);
  setTimeout(() => { element.classList.remove(type); }, 600);
}

// =========================
// Info box
// =========================
const floatingBox = document.getElementById('floatingBox');
function showTestInfo(testId) {
  let infoText = '';
  if (testId === 'lingTest') {
    infoText = `
<div class="floating-header">
  <h3>اختبار الأصوات الستة (Ling Six Sound Test)</h3>
  <button class="btn-close" onclick="closeFloatingBox()">×</button>
</div>

<p>
  اختبار الأصوات الستة هو طريقة سريعة وعملية للتحقق مما إذا كان الطفل المصاب بفقدان السمع يستطيع الوصول إلى مجموعة واسعة من الأصوات الكلامية من خلال أجهزة السمع الخاصة به.  
  يستخدم الاختبار ستة فونيمات محددة – a, u, e, sh, s, m – والتي تمثل ترددات مختلفة ضمن نطاق الكلام.  
  قدرة الطفل على اكتشاف هذه الأصوات أو تقليدها تشير إلى أن تقنيات السمع تعمل بشكل صحيح، ويوفر هذا الاختبار مراجعة يومية أو أسبوعية لضمان وصول الطفل إلى أساسيات اللغة المنطوقة، وفقًا لمعيار MED-EL.
</p>

<div class="floating-image">
  <img src="images/ling-six-sounds.png" alt="Ling Six Sounds Test">
</div>


    `;
  }
  floatingBox.innerHTML = infoText;
  floatingBox.style.display = 'block';
  floatingBox.classList.add('show');
  setTimeout(() => {
    document.addEventListener('click', outsideClickListener);
    document.addEventListener('touchstart', outsideClickListener);
  }, 0);
}

function closeFloatingBox() {
  floatingBox.classList.remove('show');
  setTimeout(() => { floatingBox.style.display = 'none'; }, 300);
  document.removeEventListener('click', outsideClickListener);
  document.removeEventListener('touchstart', outsideClickListener);
}

function outsideClickListener(event) {
  if (!floatingBox.contains(event.target) && !event.target.classList.contains('btn-info')) {
    closeFloatingBox();
  }
}
