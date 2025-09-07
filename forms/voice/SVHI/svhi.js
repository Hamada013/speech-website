// ==========================
// Language Data
// ==========================
const translations = {
  en: {
    title: "SINGING VOICE HANDICAP INDEX (SVHI)",
    name_label: "NAME:",
    date_label: "DATE:",
    music_prompt: "I sing the following kinds of music:",
    level_prompt: "How would you categorize your singing level?",
    income_prompt: "Singing is:",
    instructions_title: "Instructions:",
    instructions_desc: "These are statements many people have used to describe their voices and the effects of their voices on their lives. Select the response that indicates how frequently you have the same experience:",
    scale_info: "0 = never, 1 = almost never, 2 = sometimes, 3 = almost always, 4 = always",
    submit_btn: "Submit",
    toggle_btn: "Instructions", 
    results_title: "Results",
    total_score_label: "Total Score:",
    interpretation_label: "Interpretation:",
    clinical_note_title: "Clinical Note",
    info_text: `
      <h2>About the SVHI</h2>
      <p>The Singing Voice Handicap Index (SVHI) is a validated tool designed to measure the impact of singing problems on a person's life.</p>
      <p>Reference: Cohen et al., 2007.</p>
      <p>Use this form to guide clinical decisions and support voice therapy interventions.</p>
      <p>SLP. Ahmad Ghanem</p>

    `,
    musicTypes: ["Classical", "Pop", "Rock", "Jazz", "Folk", "Other"],
    singingLevels: ["Beginner", "Intermediate", "Advanced", "Professional"],
    incomeLevels: ["Hobby", "Part-time", "Full-time"],
    svhiQuestions: [
      "It takes a lot of effort to sing.",
      "My voice cracks and breaks.",
      "I am frustrated by my singing.",
      "People ask 'What is wrong with your voice?' when I sing.",
      "My ability to sing varies day to day.",
      "My voice 'gives out' on me when I am singing.",
      "My singing voice upsets me.",
      "My singing problems make me not want to sing/perform.",
      "I am embarrassed by my singing.",
      "I am unable to use my 'high voice.'",
      "I get nervous before I sing because of my singing problem",
      "My speaking voice is not normal.",
      "My throat is dry when I sing.",
      "I’ve had to eliminate certain songs from my singing/performances.",
      "I have no confidence in my singing voice.",
      "My singing voice is never normal.",
      "I have trouble making my voice do what I want it to.",
      "I have to 'push it' to produce my voice when singing.",
      "I have trouble controlling the breathiness in my voice.",
      "I have trouble controlling the raspiness in my voice.",
      "I have trouble singing loudly.",
      "I have difficulty staying on pitch when I sing.",
      "I feel anxious about my singing.",
      "My singing sounds forced.",
      "My speaking voice is hoarse after I sing.",
      "My voice quality is inconsistent.",
      "My singing voice makes it difficult for the audience to hear me.",
      "My singing voice makes me feel handicapped.",
      "My singing voice tires easily.",
      "I feel pain, tickling, or choking when I sing.",
      "I am unsure of what will come out when I sing.",
      "I feel something is missing in my life because of my inability to sing.",
      "I am worried my singing problems will cause me to lose money.",
      "I feel left out of the music scene because of my voice.",
      "My singing makes me feel incompetent.",
      "I have to cancel performances, singing engagements, rehearsals, or practices."
    ]
  },
  ar: {
    title: "مؤشر الإعاقة الصوتية للغناء (SVHI)",
    name_label: "الاسم:",
    date_label: "التاريخ:",
    music_prompt: "أغني الأنواع التالية من الموسيقى:",
    level_prompt: "كيف تصنف مستوى الغناء لديك؟",
    income_prompt: "الغناء بالنسبة لي:",
    instructions_title: "التعليمات:",
    instructions_desc: "هذه عبارات يستخدمها العديد من الأشخاص لوصف أصواتهم وتأثير أصواتهم على حياتهم. حدد الإجابة التي تشير إلى مدى تكرار هذه التجربة لديك:",
    scale_info: "0 = أبداً، 1 = نادراً جداً، 2 = أحياناً، 3 = غالباً، 4 = دائماً",
    submit_btn: "التقييم",
    toggle_btn: "التعليمات",
    results_title: "النتائج",
    total_score_label: "المجموع الكلي:",
    interpretation_label: "التفسير:",
    clinical_note_title: "الملاحظة السريرية",
    info_text: `
      <h2>معلومات عن مؤشر SVHI</h2>
      <p>مؤشر الإعاقة الصوتية للغناء (SVHI) هو أداة موثوقة تم تصميمها لقياس تأثير مشاكل الصوت والغناء على حياة الشخص.</p>
      <p>المرجع: Cohen et al., 2007.</p>
      <p>استخدم هذا النموذج لتوجيه القرارات السريرية ودعم تدخلات علاج الصوت.</p>
       <p>اختصاصي الكلام واللغة أحمد غانم</p>
    `,
    musicTypes: ["كلاسيكي", "بوب", "روك", "جاز", "شعبي", "أخرى"],
    singingLevels: ["مبتدئ", "متوسط", "متقدم", "محترف"],
    incomeLevels: ["هواية", "عمل جزئي", "عمل كامل"],
    svhiQuestions: [
      "الغناء يتطلب الكثير من الجهد.",
      "صوتي يتكسر أو ينكسر أثناء الغناء.",
      "أنا محبط بسبب صوتي الغنائي.",
      "يسألني الناس 'ما خطب صوتك؟' عندما أغني.",
      "قدرتي على الغناء تختلف من يوم لآخر.",
      "صوتي يختفي فجأة أثناء الغناء.",
      "صوتي الغنائي يزعجني.",
      "مشاكل صوتي تجعلني لا أرغب في الغناء أو الأداء.",
      "أشعر بالحرج من صوتي الغنائي.",
      "لا أستطيع استخدام النغمة العالية في صوتي.",
      "أشعر بالتوتر قبل الغناء بسبب مشكلة صوتي.",
      "صوتي أثناء الكلام غير طبيعي.",
      "حلقي جاف أثناء الغناء.",
      "اضطررت إلى حذف بعض الأغاني من أدائي بسبب مشكلات صوتي.",
      "ليس لدي ثقة في صوتي الغنائي.",
      "صوتي الغنائي ليس طبيعياً أبداً.",
      "أواجه صعوبة في التحكم في صوتي كما أريد.",
      "عليّ أن أضغط على صوتي لإنتاجه أثناء الغناء.",
      "أواجه صعوبة في التحكم في الهواء في صوتي.",
      "أواجه صعوبة في التحكم في خشونة صوتي.",
      "أواجه صعوبة في الغناء بصوت عالٍ.",
      "أواجه صعوبة في الحفاظ على النغمة الصحيحة أثناء الغناء.",
      "أشعر بالقلق بشأن الغناء.",
      "صوتي أثناء الغناء يبدو مجبراً.",
      "صوتي أثناء الكلام يصبح مبحوحاً بعد الغناء.",
      "جودة صوتي غير ثابتة.",
      "صوتي يجعل من الصعب على الجمهور سماعي.",
      "صوتي يجعلني أشعر بالعجز.",
      "صوتي يتعب بسهولة أثناء الغناء.",
      "أشعر بألم أو دغدغة أو اختناق عند الغناء.",
      "لست متأكداً مما سيخرج عند الغناء.",
      "أشعر أن هناك شيئاً ينقص في حياتي بسبب عدم قدرتي على الغناء.",
      "أشعر بالقلق من أن مشكلات صوتي ستسبب خسارة مالية.",
      "أشعر أنني مستبعد من مجال الموسيقى بسبب صوتي.",
      "الغناء يجعلني أشعر بعدم الكفاءة.",
      "عليّ إلغاء الحفلات أو التدريبات بسبب مشكلات صوتي."
    ]
  }
};


// ==========================
// DOM Elements
// ==========================
const container = document.getElementById("questions-container");
const formTitle = document.getElementById("form-title");
const infoBtn = document.getElementById("info-btn");
const infoModal = document.getElementById("info-modal");
const closeBtn = document.querySelector('#info-modal .close-btn');
const infoText = document.getElementById('info-text');

// ==========================
// Render Form
// ==========================
function renderForm(lang = "en") {
  const t = translations[lang];
  document.documentElement.lang = lang;
  document.body.dir = lang === "ar" ? "rtl" : "ltr";
  formTitle.textContent = t.title;

  // Update elements with data-i18n
  document.querySelectorAll("[data-i18n]").forEach(el => {
    const key = el.getAttribute("data-i18n");
    if (t[key]) el.textContent = t[key];
  });

  // Info modal content
  infoText.innerHTML = t.info_text;

  // Music Types (multi-select)
  renderButtonGroup("music-types", t.musicTypes, true);

  // Singing Level & Income (single-select)
  renderButtonGroup("singing-level", t.singingLevels);
  renderButtonGroup("income-level", t.incomeLevels);

  // SVHI Questions
  container.innerHTML = "";
  t.svhiQuestions.forEach((q, index) => {
    const itemDiv = document.createElement("div");
    itemDiv.classList.add("svhi-item");

    const questionText = document.createElement("p");
    questionText.textContent = `${index + 1}. ${q}`;
    itemDiv.appendChild(questionText);

    const buttonGroup = document.createElement("div");
    buttonGroup.classList.add("button-group");

    for (let i = 0; i <= 4; i++) {
      const btn = document.createElement("button");
      btn.className = "btn";
      btn.dataset.value = i;
      btn.textContent = i;
      btn.addEventListener("click", () => {
        buttonGroup.querySelectorAll(".btn").forEach(b => b.classList.remove("active"));
        btn.classList.add("active");
      });
      buttonGroup.appendChild(btn);
    }

    itemDiv.appendChild(buttonGroup);
    container.appendChild(itemDiv);
  });
}

// ==========================
// Helper: Render Button Groups
// ==========================
function renderButtonGroup(containerId, options, multiSelect = false) {
  const container = document.getElementById(containerId);
  container.innerHTML = "";
  options.forEach(option => {
    const btn = document.createElement("button");
    btn.className = "btn";
    btn.textContent = option;
    btn.addEventListener("click", () => {
      if (multiSelect) {
        btn.classList.toggle("active");
      } else {
        container.querySelectorAll(".btn").forEach(b => b.classList.remove("active"));
        btn.classList.add("active");
      }
    });
    container.appendChild(btn);
  });
}

// ==========================
// Language Switcher
// ==========================
document.getElementById("language-switcher").addEventListener("change", e => renderForm(e.target.value));

// ==========================
// Toggle Instructions
// ==========================
function toggleInstructions() {
  document.getElementById("instructions-box").classList.toggle("hidden");
}

// ==========================
// Generate Professional Text Report
// ==========================
function generateTextReport(lang = "en") {
  const t = translations[lang];
  const patientName = document.getElementById("patient-name").value || "Patient";
  const date = document.getElementById("assessment-date").value || "N/A";

  // Music selections
  const selectedMusic = Array.from(document.querySelectorAll("#music-types .btn.active"))
                             .map(b => b.textContent)
                             .join(", ") || "N/A";

  // Singing Level & Income
  const singingLevel = document.querySelector("#singing-level .btn.active")?.textContent || "N/A";
  const incomeLevel = document.querySelector("#income-level .btn.active")?.textContent || "N/A";

  // SVHI Questions
  let totalScore = 0;
  const questionResponses = [];
  document.querySelectorAll(".svhi-item").forEach(item => {
    const activeBtn = item.querySelector(".button-group .btn.active");
    const value = activeBtn ? parseInt(activeBtn.dataset.value) : "N/A";
    if (activeBtn) totalScore += parseInt(activeBtn.dataset.value);
    questionResponses.push({ question: item.querySelector("p").textContent, response: value });
  });

  // Interpretation
  let interpretation = "";
  if (totalScore <= 20) interpretation = lang === "ar" ? "إعاقة منخفضة – تأثير قليل على الغناء" : "Low handicap – minimal impact on singing";
  else if (totalScore <= 50) interpretation = lang === "ar" ? "إعاقة متوسطة – بعض التأثير على الغناء" : "Moderate handicap – some impact on singing";
  else interpretation = lang === "ar" ? "إعاقة عالية – تأثير كبير على الغناء" : "High handicap – significant impact on singing";

  // Build report
  let reportText = `
${t.title}
========================

${lang === "ar" ? "معلومات المريض" : "Patient Information"}
------------------------
${t.name_label} ${patientName}
${t.date_label} ${date}
${t.music_prompt} ${selectedMusic}
${t.level_prompt} ${singingLevel}
${t.income_prompt} ${incomeLevel}

${lang === "ar" ? "ملخص التقييم" : "SVHI Summary"}
------------------------
${t.total_score_label} ${totalScore}
${t.interpretation_label} ${interpretation}

${lang === "ar" ? "تفاصيل الأسئلة" : "Question Responses"}
------------------------
`;

  questionResponses.forEach((q, index) => {
    reportText += `${index + 1}. ${q.question} — ${q.response}\n`;
  });

  reportText += `
${t.clinical_note_title}
------------------------
${lang === "ar" 
  ? "تم إعداد هذا التقرير بواسطة اختصاصي الكلام واللغة أحمد غانم لتقديم تقييم شامل لدرجة التأثير الصوتي للغناء." 
  : "This report is prepared by SLP. Ahmad Ghanem for a comprehensive assessment of singing voice handicap."}
`;

return reportText.trim();

}

// ==========================
// Show & Download Report
// ==========================
function showDownloadReport() {
  const lang = document.getElementById("language-switcher").value;
  const report = generateTextReport(lang);

  // Show in textarea
  document.getElementById("clinical-note").value = report;

  // Download file
  const blob = new Blob([report], { type: "text/plain;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = `SVHI_Report_${Date.now()}.txt`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

// ==========================
// Submit SVHI
// ==========================
document.getElementById("submit-svhi").addEventListener("click", showDownloadReport);

// ==========================
// Info Modal Events
// ==========================
infoBtn.addEventListener("click", () => infoModal.style.display = "flex");
closeBtn.addEventListener("click", () => infoModal.style.display = "none");
window.addEventListener("click", e => { if (e.target === infoModal) infoModal.style.display = "none"; });

// ==========================
// Initial Render
// ==========================
renderForm("en");








