// ========================
// Scores & Notes
// ========================
const sectionScores = {}; // numeric scores per section
const sectionNotes = {};  // notes per section

// ========================
// Scoring function
// ========================
function score(sectionId, value, btn) {
  // Highlight selected button
  const buttons = btn.parentElement.querySelectorAll("button");
  buttons.forEach(b => b.classList.remove("selected"));
  btn.classList.add("selected");

  // Map value to numeric
  let numericScore = 0;
  switch(value) {
    case "bad / never": numericScore = 0; break;
    case "not bad / once": numericScore = 1; break;
    case "good / multiple": numericScore = 2; break;
    case "above good / multiple": numericScore = 3; break;
    case "excellent / multiple": numericScore = 4; break;
    case "perfect / multiple": numericScore = 5; break;
  }

  sectionScores[sectionId] = numericScore;

  // Store actual button text for report
  sectionScores[sectionId + "_text"] = btn.innerText;

  updateReport();
}

// ========================
// Notes functions
// ========================
let currentNoteSection = null;

function addNote(sectionId) {
  currentNoteSection = sectionId;
  const box = document.getElementById("floatingBox");
  const textarea = document.getElementById("noteTextarea");
  const text = document.getElementById("floatingText");
  const logo = document.getElementById("floatingLogo");
  const saveBtn = document.getElementById("saveNoteBtn");

  textarea.style.display = "block";
  saveBtn.style.display = "inline-block";
  text.style.display = "none";
  logo.style.display = "none";

  textarea.value = sectionNotes[sectionId] || "";
  box.classList.add("show");
}

function saveNote() {
  if(currentNoteSection !== null){
    const textarea = document.getElementById("noteTextarea");
    sectionNotes[currentNoteSection] = textarea.value.trim();
    closeNoteBox();
    updateReport();
  }
}

function closeNoteBox() {
  const box = document.getElementById("floatingBox");
  box.classList.remove("show");
}

// Show page info
function showTestInfo(target) {
  const box = document.getElementById("floatingBox");
  const textarea = document.getElementById("noteTextarea");
  const text = document.getElementById("floatingText");
  const logo = document.getElementById("floatingLogo");
  const saveBtn = document.getElementById("saveNoteBtn");

  textarea.style.display = "none";
  saveBtn.style.display = "none";
  text.style.display = "block";
  logo.style.display = "block";

if(target === 'page'){
  text.innerHTML = `
    <strong>قائمة رصد المهارات السمعية</strong><br><br>
    MED-EL CORPORATION AND NANCY S. CALF-SCH<br><br>
    يمكن استخدام هذه القائمة لبدء الأهداف السمعية ذات العلاقة بالتواصل اللغوي. 
    ومن المتوقع أن تتداخل مراحل تطور المهارات السمعية لدى الطفل مع تطور مهاراته اللغوية. 
    قدرة الطفل على الاستماع تتغير وتتطور بشكل مستمر، وقد لا تعكس هذه القائمة التسلسل الدقيق لتطور المهارات السمعية واللغوية.<br><br>
    يمكنك إضافة ملاحظة لكل مهارة واتبع حدسك كاختصاصي كلام ولغة في تقييم طفلك.
  `;
}


  box.classList.add("show");
}

function closeFloatingBox() {
  const box = document.getElementById("floatingBox");
  box.classList.remove("show");
}

// ========================
// Auto-calculate age
// ========================
document.getElementById("birthDate").addEventListener("change", updateAge);
document.getElementById("currentDate").addEventListener("change", updateAge);

function updateAge() {
  const birthInput = document.getElementById("birthDate").value;
  if (!birthInput) return;

  const birthDate = new Date(birthInput);
  const currentDateInput = document.getElementById("currentDate");
  const ageField = document.getElementById("age");

  let today = currentDateInput.value ? new Date(currentDateInput.value) : new Date();
  if (!currentDateInput.value) {
    currentDateInput.value = today.toISOString().split("T")[0];
  }

  if (birthDate == "Invalid Date") {
    ageField.value = "";
    return;
  }

  let years = today.getFullYear() - birthDate.getFullYear();
  let months = today.getMonth() - birthDate.getMonth();
  let days = today.getDate() - birthDate.getDate();

  if (days < 0) {
    months--;
    days += new Date(today.getFullYear(), today.getMonth(), 0).getDate();
  }
  if (months < 0) {
    years--;
    months += 12;
  }

  ageField.value = `${years} سنة، ${months} شهر، ${days} يوم`;
}


// ========================
// Update report
// ========================
// ========================
// Update report (numbered list)
// ========================
function updateReport() {
  const reportField = document.getElementById("report");
  if (!reportField) return;

  let reportText = "";

  // Personal info
  const name = document.getElementById("name").value;
  const dob = document.getElementById("birthDate").value;
  const age = document.getElementById("age").value;
  const diagnosis = document.getElementById("medicalDiagnosis").value;
  const examiner = document.getElementById("examinerName").value;
  const today = document.getElementById("currentDate").value;

  reportText += `الاسم: ${name}\nتاريخ الميلاد: ${dob}\nالعمر الزمني: ${age}\nالتشخيص: ${diagnosis}\nاسم الاختصاصي: ${examiner}\nتاريخ اليوم: ${today}\n\n`;

  // Section titles
  const sectionTitles = {
    1: "الوعي على الصوت",
    2: "الانتباه إلى الصوت",
    3: "الإشارة إلى بداية أو توقف الصوت",
    4: "الاستجابة المشروطة للصوت",
    5: "البحث عن مصدر الصوت",
    6: "تحديد مصدر الصوت",
    7: "السمع عن بعد",
    8: "ربط الأصوات المألوفة",
    9: "مدة الصوت",
    10: "نبرة أو حدة الصوت",
    11: "شدة الصوت",
    12: "المراقبة الذاتية للكلام باستخدام النموذج السمعي",
    13: "التعرف إلى الأصوات، الكلمات والعبارات أو التوجيهات البسيطة",
    14: "الذاكرة السمعية للكلمات",
    15: "الذاكرة السمعية لأغاني الأطفال",
    16: "الذاكرة السمعية للتوجيهات والآوامر",
    17: "الذاكرة السمعية للأرقام",
    18: "تحليل وفهم الوصف سمعيا",
    19: "تحليل وفهم الأسئلة سمعيا",
    20: "إتمام المعلومة المتبقية أو الناقصة",
    21: "التعلم العفوي والغير متعمد",
    22: "المحادثات السمعية",
    23: "يستمع ويستوعب أثناء الانشغال بنشاط آخر",
    24: "ينتبه الطفل أو يصحح عندما يخطئ الآخرون في الكلام",
    25: "المحادثة باستخدام الهاتف",
    26: "فهم الكلام من خلال أجهزة الكترونية",
    27: "فهم الكلام في مكان غير هادئ"
  };

  // Build numbered list
  for (const id in sectionTitles) {
    const skillName = sectionTitles[id];
    const scoreValue = sectionScores[id] !== undefined ? sectionScores[id] : "";
    const answerText = sectionScores[id + "_text"] || "لم يتم الاختيار";
    const noteText = sectionNotes[id] ? sectionNotes[id] : "";

    reportText += `${id}. ${skillName}\n`;
    reportText += `   - النتيجة: ${scoreValue}\n`;
    reportText += `   - الجواب: ${answerText}\n`;
    if (noteText) reportText += `   - ملاحظة: ${noteText}\n`;
    reportText += "\n";
  }

  // Total score
  const totalPossibleScore = 79;
  const obtainedScore = Object.values(sectionScores)
    .filter(v => typeof v === "number")
    .reduce((a, b) => a + b, 0);
  const totalPercentage = ((obtainedScore / totalPossibleScore) * 100).toFixed(1);

  reportText += `المجموع الكلي: ${obtainedScore} من ${totalPossibleScore} (${totalPercentage}%)\n`;

  // Signature
  reportText += `\nSLP. Ahmad Ghanem`;

  reportField.value = reportText;
}

// ========================
// Download report (full RTL)
// ========================
function downloadReport() {
  const reportField = document.getElementById("report");
  const rtlText = "\u202B" + reportField.value + "\u202C";

  const blob = new Blob([rtlText], {type: "text/plain;charset=utf-8"});
  const link = document.createElement("a");
  link.href = URL.createObjectURL(blob);
  link.download = "report.txt";
  link.click();
}

// ========================
// Floating box close
// ========================
document.addEventListener("click", function(e){
  if(e.target.id === "floatingBoxClose") closeNoteBox();
});
