// =============================
// القسم 0: المعلومات الشخصية
// =============================

// تعيين تاريخ اليوم تلقائياً لتاريخ التقييم
document.addEventListener("DOMContentLoaded", () => {
  const testDateField = document.getElementById("testDate");
  const today = new Date().toISOString().split("T")[0];
  testDateField.value = today;

  // إنشاء تقرير أولي فارغ
  generateReport();
});

// حساب العمر الزمني عند اختيار تاريخ الميلاد
function calculateAge() {
  const dobField = document.getElementById("dob");
  const ageField = document.getElementById("age");

  if (!dobField.value) {
    ageField.value = "";
    return;
  }

  const dob = new Date(dobField.value);
  const today = new Date();

  let years = today.getFullYear() - dob.getFullYear();
  let months = today.getMonth() - dob.getMonth();
  let days = today.getDate() - dob.getDate();

  if (days < 0) {
    months--;
    days += new Date(today.getFullYear(), today.getMonth(), 0).getDate();
  }
  if (months < 0) {
    years--;
    months += 12;
  }

  ageField.value = `${years}س ${months}ش ${days}ي`;
  generateReport();
}

// =============================
// أزرار اختيار الجنس
// =============================
const genderButtons = document.querySelectorAll(".btn-gender");
let selectedGender = "";

genderButtons.forEach(button => {
  button.addEventListener("click", () => {
    // إزالة الصف النشط من جميع الأزرار
    genderButtons.forEach(btn => btn.classList.remove("active"));

    // وضع علامة على الزر النشط
    button.classList.add("active");
    selectedGender = button.getAttribute("data-value");

    generateReport();
  });
});

// =============================
// القسم 1: التاريخ الطبي والصوتي
// =============================
const medicalHistoryFields = [
  { id: "medicalConditions", label: "الحالات الطبية" },
  { id: "currentMedications", label: "الأدوية الحالية" },
  { id: "surgicalHistory", label: "التاريخ الجراحي" },
  { id: "previousVoice", label: "اضطرابات صوتية سابقة / علاج" },
  { id: "hydrationLifestyle", label: "العادات الغذائية ونمط الحياة" },
  { id: "allergiesSinus", label: "الحساسية / مشاكل الجيوب الأنفية" },
  { id: "smokingAlcohol", label: "التدخين / تعاطي الكحول" },
  { id: "vocalMisuse", label: "أنماط الإفراط في استخدام الصوت أو سوء الاستخدام" }
];

function getSection1MedicalHistory() {
  let sectionText = "";

  medicalHistoryFields.forEach(field => {
    const value = document.getElementById(field.id)?.value.trim();
    if (value) {
      sectionText += `- ${field.label}: ${value}\n`;
    }
  });

  return sectionText ? `التاريخ الطبي والصوتي:\n${sectionText}\n` : "";
}

// =============================
// القسم 2: فحص الفم والجهاز النطقي
// =============================
const oralPeripheralFields = [
  "الشفاه",
  "اللسان",
  "الحنك",
  "ارتفاع الحنجرة",
  "الرنين (فموي vs أنفي)"
];

const oralPeripheralData = {};

// إرفاق المستمعين
oralPeripheralFields.forEach(labelText => {
  // البحث عن الحاوية بمطابقة نص التسمية
  const containers = document.querySelectorAll("#section2 .history-field");
  let container = null;

  containers.forEach(c => {
    const label = c.querySelector("label");
    if (label && label.textContent.trim().startsWith(labelText)) {
      container = c;
    }
  });

  if (container) {
    const buttons = container.querySelectorAll(".button-group .btn");
    const noteInput = container.querySelector("input[type='text']");

    // النقر على الأزرار
    buttons.forEach(btn => {
      btn.addEventListener("click", () => {
        buttons.forEach(b => b.classList.remove("active"));
        btn.classList.add("active");

        if (!oralPeripheralData[labelText]) oralPeripheralData[labelText] = {};
        oralPeripheralData[labelText].status = btn.textContent.trim();
        oralPeripheralData[labelText].notes = noteInput.value.trim();

        generateReport();
      });
    });

    // تغييرات ملاحظات الإدخال
    noteInput.addEventListener("input", () => {
      if (!oralPeripheralData[labelText]) oralPeripheralData[labelText] = {};
      oralPeripheralData[labelText].notes = noteInput.value.trim();
      generateReport();
    });
  }
});

// مربع المعلومات للقسم 2
const section2 = document.querySelector("#section2");
const infoButton2 = section2.querySelector(".btn-info");
const infoBox2 = section2.querySelector(".info-box");
const closeButton2 = infoBox2.querySelector(".btn-close");

infoButton2.addEventListener("click", () => {
  infoBox2.classList.toggle("open");
});

closeButton2.addEventListener("click", () => {
  infoBox2.classList.remove("open");
});

// إنشاء نص القسم 2 للتقرير
function getSection2OralPeripheral() {
  let sectionText = "";

  Object.entries(oralPeripheralData).forEach(([area, data]) => {
    if (data.status || data.notes) {
      sectionText += `- ${area}: ${data.status || "غير محدد"}`;
      if (data.notes) sectionText += ` (ملاحظات: ${data.notes})`;
      sectionText += "\n";
    }
  });

  return sectionText ? `فحص الفم وال الجهاز النطقي:\n${sectionText}\n` : "";
}

// =============================
// القسم 3: تقييم التنفس وإصدار الصوت
// =============================
const breathingPhonationFields = [
  "نوع التنفس",
  "انتظام نمط التنفس",
  "تنسيق التنفس مع الكلام",
  "نوع بدء إصدار الصوت",
  "مستوى الصوت والإسقاط",
  "إجهاد الصوت / الجهد"
];

const breathingPhonationData = {};

// تبديل وإغلاق مربع المعلومات (مثل GRBAS)
const section3 = document.querySelector("#section3");
const infoButton3 = section3.querySelector(".btn-info");
const infoBox3 = section3.querySelector(".info-box");
const closeButton3 = infoBox3.querySelector(".btn-close");

infoButton3.addEventListener("click", () => {
  infoBox3.classList.toggle("open");
});

closeButton3.addEventListener("click", () => {
  infoBox3.classList.remove("open");
});

// التعامل مع اختيار الأزرار وإدخال الملاحظات (مثل GRBAS)
breathingPhonationFields.forEach(labelText => {
  const containers = section3.querySelectorAll(".history-field");
  let container = null;

  containers.forEach(c => {
    const label = c.querySelector("label");
    if (label && label.textContent.trim().startsWith(labelText)) container = c;
  });

  if (!container) return;

  const buttons = container.querySelectorAll(".button-group .btn");
  const noteInput = container.querySelector("input[type='text']");

  buttons.forEach(btn => {
    btn.addEventListener("click", () => {
      buttons.forEach(b => b.classList.remove("active"));
      btn.classList.add("active");

      if (!breathingPhonationData[labelText]) breathingPhonationData[labelText] = {};
      breathingPhonationData[labelText].status = btn.textContent.trim();
      breathingPhonationData[labelText].notes = noteInput ? noteInput.value.trim() : "";

      generateReport();
    });
  });

  if (noteInput) {
    noteInput.addEventListener("input", () => {
      if (!breathingPhonationData[labelText]) breathingPhonationData[labelText] = {};
      breathingPhonationData[labelText].notes = noteInput.value.trim();
      generateReport();
    });
  }
});

// إنشاء نص تقرير القسم 3
function getSection3BreathingPhonation() {
  let sectionText = "";

  Object.entries(breathingPhonationData).forEach(([param, data]) => {
    sectionText += `- ${param}: ${data.status || "غير محدد"}`;
    if (data.notes) sectionText += ` (ملاحظات: ${data.notes})`;
    sectionText += "\n";
  });

  return sectionText
    ? `تقييم التنفس وإصدار الصوت:\n${sectionText}\n`
    : "";
}

// =============================
// القسم 4: التقييم الإدراكي للصوت (مقياس GRBAS)
// =============================
const grbasFields = ["G (الدرجة)", "R (الخشونة)", "B (النفاخية)", "A (الوهن)", "S (الإجهاد)"];
const grbasData = {};

// تبديل وإغلاق مربع المعلومات
const section4 = document.querySelector("#section4");
const infoButton = section4.querySelector(".btn-info");
const infoBox = section4.querySelector(".info-box");

infoButton.addEventListener("click", () => {
  infoBox.classList.toggle("open");
});

const closeButton = infoBox.querySelector(".btn-close");
closeButton.addEventListener("click", () => {
  infoBox.classList.remove("open");
});

// التعامل مع اختيارات الأزرار
grbasFields.forEach(labelText => {
  const containers = section4.querySelectorAll(".grbas-item");
  let container = null;

  containers.forEach(c => {
    const label = c.querySelector("label");
    if (label && label.textContent.trim() === labelText) container = c;
  });

  if (!container) return;

  const buttons = container.querySelectorAll(".button-group .btn");

  buttons.forEach(btn => {
    btn.addEventListener("click", () => {
      // إزالة الصف النشط من جميع الأزرار في المجموعة
      buttons.forEach(b => b.classList.remove("active"));
      btn.classList.add("active");

      // حفظ الرقم المحدد
      grbasData[labelText] = btn.textContent.trim();

      generateReport();
    });
  });
});

// إنشاء نص القسم 4 للتقرير
function getSection4GRBAS() {
  let sectionText = "";

  Object.entries(grbasData).forEach(([param, score]) => {
    sectionText += `- ${param}: ${score}\n`;
  });

  return sectionText ? `التقييم الإدراكي للصوت (مقياس GRBAS):\n${sectionText}\n` : "";
}

// =============================
// القسم 5: القياسات الصوتية والديناميكية الهوائية
// =============================
const section5Fields = [
  "التردد الأساسي (F0)",
  "زمن الصوت الأقصى (MPT)",
  "نسبة S/Z",
  "التذبذب (Jitter) (%)",
  "الاهتزاز (Shimmer) (%)",
  "نسبة الضوضاء إلى النغمات"
];

const acousticData = {};

// تبديل وإغلاق مربع المعلومات
document.querySelectorAll("#section5 .btn-info").forEach(btn => {
  btn.addEventListener("click", () => {
    const container = btn.closest(".history-field");
    const infoBox = container.querySelector(".info-box");
    if (infoBox) infoBox.classList.toggle("open");
  });
});

document.querySelectorAll("#section5 .btn-close").forEach(btn => {
  btn.addEventListener("click", () => {
    const infoBox = btn.closest(".info-box");
    if (infoBox) infoBox.classList.remove("open");
  });
});

// التعامل مع اختيارات الأزرار والإدخال
section5Fields.forEach(labelText => {
  const containers = document.querySelectorAll("#section5 .history-field");
  
  containers.forEach(container => {
    const label = container.querySelector("label");
    if (!label || label.textContent.trim() !== labelText) return;

    const buttons = container.querySelectorAll(".button-group .btn");
    const noteInput = container.querySelector("input[type='text']");

    // اختيار الزر
    buttons.forEach(btn => {
      btn.addEventListener("click", () => {
        // تبديل النشط
        buttons.forEach(b => b.classList.remove("active"));
        btn.classList.add("active");

        // حفظ في كائن البيانات
        if (!acousticData[labelText]) acousticData[labelText] = {};
        acousticData[labelText].status = btn.textContent.trim();
        acousticData[labelText].notes = noteInput ? noteInput.value.trim() : "";

        generateReport();
      });
    });

    // تغييرات الإدخال
    if (noteInput) {
      noteInput.addEventListener("input", () => {
        if (!acousticData[labelText]) acousticData[labelText] = {};
        acousticData[labelText].notes = noteInput.value.trim();
        generateReport();
      });
    }
  });
});

// إنشاء نص القسم 5 للتقرير
function getSection5AcousticAerodynamic() {
  let sectionText = "";

  Object.entries(acousticData).forEach(([area, data]) => {
    if (data.status || data.notes) {
      sectionText += `- ${area}: ${data.status || "غير محدد"}`;
      if (data.notes) sectionText += ` (ملاحظات: ${data.notes})`;
      sectionText += "\n";
    }
  });

  return sectionText ? `القياسات الصوتية والديناميكية الهوائية:\n${sectionText}\n` : "";
}

// =============================
// القسم 6: تقييم صحة الصوت
// =============================
const section6Fields = [
  "الحساسية",
  "الصراخ / الصياح بصوت عالٍ",
  "تناول المنبهات (الكحول، القهوة، الكافيين، الكولا، إلخ)",
  "السعال المتكرر",
  "النباح المفرط (تنظيف الحلق)",
  "الآثار الجانبية من الأدوية المستمرة",
  "التصويت أثناء التمرين",
  "الضحك بصوت عالٍ",
  "استخدام الصوت في العمل (التدريس، الغناء، إلخ)",
  "التحدث المطول دون استراحات",
  "التدخين",
  "مناداة الآخرين من بعيد",
  "الأنشطة التي تتطلب صوتاً عالياً",
  "التعرض للتلوث البيئي",
  "تقليد أصوات الآخرين",
  "التحدث في بيئات صاخبة",
  "التحدث أثناء الانزعاج",
  "قلة شرب الماء",
  "أخرى"
];

const vocalHealthData = {};

// إرفاق المستمعين
section6Fields.forEach(labelText => {
  const containers = document.querySelectorAll("#section6 .history-field");
  let container = null;

  containers.forEach(c => {
    const label = c.querySelector("label");
    if (label && label.textContent.trim() === labelText) container = c;
  });

  if (container) {
    const buttons = container.querySelectorAll(".button-group .btn");
    const noteInput = container.querySelector("input[type='text']");

    // النقر على الأزرار
    buttons.forEach(btn => {
      btn.addEventListener("click", () => {
        buttons.forEach(b => b.classList.remove("active"));
        btn.classList.add("active");

        if (!vocalHealthData[labelText]) vocalHealthData[labelText] = {};
        vocalHealthData[labelText].status = btn.textContent.trim();
        vocalHealthData[labelText].notes = noteInput ? noteInput.value.trim() : "";

        generateReport();
      });
    });

    // تغييرات الإدخال
    if (noteInput) {
      noteInput.addEventListener("input", () => {
        if (!vocalHealthData[labelText]) vocalHealthData[labelText] = {};
        vocalHealthData[labelText].notes = noteInput.value.trim();
        generateReport();
      });
    }
  }
});

// إنشاء نص القسم 6 للتقرير
function getSection6VocalHealth() {
  let sectionText = "";

  Object.entries(vocalHealthData).forEach(([behavior, data]) => {
    if (data.status || data.notes) {
      sectionText += `- ${behavior}: ${data.status || "غير محدد"}`;
      if (data.notes) sectionText += ` (ملاحظات: ${data.notes})`;
      sectionText += "\n";
    }
  });

  return sectionText ? `تقييم صحة الصوت:\n${sectionText}\n` : "";
}

// =============================
// القسم 7: مؤشر إعاقة الصوت - 10 (VHI-10) مع التفسير
// =============================
const vhiFields = [
  "صوتي يجعل من الصعب على الآخرين سماعي.",
  "يواجه الآخرون صعوبة في فهمي في غرفة صاخبة.",
  "صعوبات صوتي تقيد حياتي الشخصية والاجتماعية.",
  "أشعر بأنني مستبعد من المحادثات بسبب صوتي.",
  "مشكلة صوتي تتسبب في فقداني الدخل.",
  "أشعر كما لو أنني يجب أن أجهد لإنتاج الصوت.",
  "وضوح صوتي غير متوقع.",
  "مشكلة صوتي تزعجني.",
  "صوتي يجعلني أشعر بأنني معاق.",
  "يسأل الناس: \"ما الخطأ في صوتك؟\""
];

const vhiData = {};

// إرفاق مستمعي الأحداث لأزرار VHI-10
vhiFields.forEach(labelText => {
  const containers = document.querySelectorAll("#section7 .history-field");
  let container = null;

  containers.forEach(c => {
    const label = c.querySelector("label");
    if (label && label.textContent.trim() === labelText) container = c;
  });

  if (container) {
    const buttons = container.querySelectorAll(".button-group .btn");

    buttons.forEach(btn => {
      btn.addEventListener("click", () => {
        buttons.forEach(b => b.classList.remove("active"));
        btn.classList.add("active");

        vhiData[labelText] = parseInt(btn.getAttribute("data-value"), 10);

        updateVHITotal();
        generateReport();
      });
    });
  }
});

// حساب مجموع درجة VHI-10 وتحديث العرض
function updateVHITotal() {
  const total = Object.values(vhiData).reduce((sum, val) => sum + val, 0);
  document.getElementById("vhiTotal").textContent = total;
}

// تحديد تفسير VHI-10
function getVHIInterpretation(score) {
  if (score >= 0 && score <= 11) return "طبيعي / إعاقة طفيفة";
  if (score >= 12 && score <= 22) return "إعاقة خفيفة";
  if (score >= 23 && score <= 34) return "إعاقة متوسطة";
  if (score >= 35 && score <= 40) return "إعاقة شديدة";
  return "غير محدد";
}

// إنشاء نص القسم 7 للتقرير مع التفسير
function getSection7VHI() {
  if (Object.keys(vhiData).length === 0) return "";

  let sectionText = "";
  Object.entries(vhiData).forEach(([statement, score]) => {
    sectionText += `- ${statement}: ${score}\n`;
  });

  const totalScore = Object.values(vhiData).reduce((sum, val) => sum + val, 0);
  const interpretation = getVHIInterpretation(totalScore);

  sectionText += `\nإجمالي درجة VHI-10: ${totalScore} / 40\n`;
  sectionText += `التفسير: ${interpretation}\n`;

  return `مؤشر إعاقة الصوت - 10 (VHI-10):\n${sectionText}`;
}

// =============================
// القسم 8: اختبار القابلية للاستثارة واستراتيجيات علاج الصوت
// =============================
const section8Fields = [
  "تمارين الاسترخاء",
  "مهام الصوت الرنان",
  "الانزلاقات النغمية",
  "تمارين المسالك الصوتية شبه المغلقة (SOVT)",
  "استراتيجية علاج صوت إضافية",
  "النتيجة العامة / التوصيات السريرية"
];

const therapyData = {};

// تبديل وإغلاق مربع المعلومات
document.querySelectorAll("#section8 .btn-info").forEach(btn => {
  btn.addEventListener("click", () => {
    const container = btn.closest(".history-field");
    const infoBox = container.querySelector(".info-box");
    if (infoBox) infoBox.classList.toggle("open");
  });
});

document.querySelectorAll("#section8 .btn-close").forEach(btn => {
  btn.addEventListener("click", () => {
    const infoBox = btn.closest(".info-box");
    if (infoBox) infoBox.classList.remove("open");
  });
});

// التعامل مع اختيارات الأزرار ومنطقة النص
section8Fields.forEach(labelText => {
  const containers = document.querySelectorAll("#section8 .history-field");

  containers.forEach(container => {
    const label = container.querySelector("label");
    if (!label || label.textContent.trim() !== labelText) return;

    const buttons = container.querySelectorAll(".button-group .btn");
    const noteInput = container.querySelector("textarea");

    // النقر على الزر
    buttons.forEach(btn => {
      btn.addEventListener("click", () => {
        buttons.forEach(b => b.classList.remove("active"));
        btn.classList.add("active");

        if (!therapyData[labelText]) therapyData[labelText] = {};
        therapyData[labelText].status = btn.dataset.value;
        therapyData[labelText].notes = noteInput ? noteInput.value.trim() : "";

        updateSection8Report();
      });
    });

    // إدخال الملاحظات
    if (noteInput) {
      noteInput.addEventListener("input", () => {
        if (!therapyData[labelText]) therapyData[labelText] = {};
        therapyData[labelText].notes = noteInput.value.trim();
        updateSection8Report();
      });
    }
  });
});

// إنشاء تقرير القسم 8
function getSection8Therapy() {
  if (!Object.keys(therapyData).length) return "";

  let sectionText = "";
  Object.entries(therapyData).forEach(([strategy, data]) => {
    const statusText = data.status ? `الحالة: ${data.status}` : "";
    const notesText = data.notes ? `ملاحظات: ${data.notes}` : "";
    sectionText += `- ${strategy}: ${statusText}${notesText ? ` | ${notesText}` : ""}\n`;
  });

  return `اختبار القابلية للاستثارة واستراتيجيات علاج الصوت:\n${sectionText}\n`;
}

// تحديث منطقة النص للتقرير إذا كانت موجودة
function updateSection8Report() {
  const reportTextarea = document.getElementById("report");
  if (reportTextarea) reportTextarea.value = getSection8Therapy();
}

// =============================
// منشئ التقرير الموحد الموسع
// =============================
function generateReport() {
  // ----- القسم 0 -----
  const name = document.getElementById("name").value.trim();
  const dob = document.getElementById("dob").value;
  const age = document.getElementById("age").value.trim();
  const testDate = document.getElementById("testDate").value;
  const examiner = document.getElementById("examiner").value.trim();
  const referralSource = document.getElementById("referralSource").value.trim();
  const occupation = document.getElementById("occupation").value.trim();
  const languages = document.getElementById("languages").value.trim();
  const primaryComplaint = document.getElementById("primaryComplaint").value.trim();
  const onsetCourse = document.getElementById("onsetCourse").value.trim();
  const impactDailyLife = document.getElementById("impactDailyLife").value.trim();

let report = `
تقرير تقييم الصوت
=================

المعلومات الشخصية:
- الاسم: ${name || "غير محدد"}
- تاريخ الميلاد: ${dob || "غير محدد"}
- العمر الزمني: ${age || "غير محدد"}
- الجنس: ${selectedGender || "غير محدد"}
- المهنة: ${occupation || "غير محدد"}
- اللغة/اللغات المتحدث بها: ${languages || "غير محدد"}

تفاصيل التقييم:
- تاريخ التقييم: ${testDate || "غير محدد"}
- المقيّم: ${examiner || "غير محدد"}
- مصدر الإحالة: ${referralSource || "غير محدد"}

سبب الإحالة:
- الشكوى الرئيسية: ${primaryComplaint || "غير محدد"}
- البداية والتطور: ${onsetCourse || "غير محدد"}
- التأثير على الحياة اليومية: ${impactDailyLife || "غير محدد"}
`;

// القسم 1 – التاريخ الطبي
const section1History = getSection1MedicalHistory();
if (section1History) {
  report += `\n-----------------------------------------\n${section1History}`;
}

// القسم 2 – الفحص النطقي
const section2Oral = getSection2OralPeripheral();
if (section2Oral) {
  report += `\n-----------------------------------------\n${section2Oral}`;
}

// القسم 3 – التنفس وإصدار الصوت
const section3Breathing = getSection3BreathingPhonation();
if (section3Breathing) {
  report += `\n-----------------------------------------\n${section3Breathing}`;
}

// القسم 4 – GRBAS
const section4GRBAS = getSection4GRBAS();
if (section4GRBAS) {
  report += `\n-----------------------------------------\n${section4GRBAS}`;
}

// القسم 5 – القياسات الصوتية
const section5Acoustic = getSection5AcousticAerodynamic();
if (section5Acoustic) {
  report += `\n-----------------------------------------\n${section5Acoustic}`;
}

// القسم 6 – صحة الصوت
const section6VocalHealth = getSection6VocalHealth();
if (section6VocalHealth) {
  report += `\n-----------------------------------------\n${section6VocalHealth}`;
}

// القسم 7 – مؤشر إعاقة الصوت
const section7VHI = getSection7VHI();
if (section7VHI) {
  report += `\n-----------------------------------------\n${section7VHI}`;
}

// القسم 8 – التوصيات العلاجية
const section8Therapy = getSection8Therapy();
if (section8Therapy) {
  report += `\n-----------------------------------------\n${section8Therapy}`;
}

report += `
-----------------------------------------
ملاحظة: سيتم تحديث هذا التقرير تلقائياً عند إكمال أقسام إضافية.
أعدّه: أخصائي النطق واللغة أحمد غانم
`;

document.getElementById("report").value = report.trim();
}

// =============================
// مستمعي الأحداث للتحديثات المباشرة
// =============================

// مدخلات القسم 0
const section0Fields = document.querySelectorAll("#section0 input, #section0 textarea");
section0Fields.forEach(field => {
  field.addEventListener("input", generateReport);
});

// مدخلات القسم 1 (التاريخ الطبي والصوتي)
const section1Fields = document.querySelectorAll("#section1 textarea");
section1Fields.forEach(field => {
  field.addEventListener("input", generateReport);
});

// القسم 2: إرفاق المستمعين بالأزرار ومدخلات الملاحظات
oralPeripheralFields.forEach(labelText => {
  const containers = document.querySelectorAll("#section2 .history-field");
  let container = null;

  containers.forEach(c => {
    const label = c.querySelector("label");
    if (label && label.textContent.trim().startsWith(labelText)) container = c;
  });

  if (container) {
    const buttons = container.querySelectorAll(".button-group .btn");
    const noteInput = container.querySelector("input[type='text']");

    buttons.forEach(btn => {
      btn.addEventListener("click", () => {
        buttons.forEach(b => b.classList.remove("active"));
        btn.classList.add("active");

        if (!oralPeripheralData[labelText]) oralPeripheralData[labelText] = {};
        oralPeripheralData[labelText].status = btn.textContent.trim();
        oralPeripheralData[labelText].notes = noteInput.value.trim();

        generateReport();
      });
    });

    noteInput.addEventListener("input", () => {
      if (!oralPeripheralData[labelText]) oralPeripheralData[labelText] = {};
      oralPeripheralData[labelText].notes = noteInput.value.trim();
      generateReport();
    });
  }
});

section5Fields.forEach(labelText => {
  const containers = document.querySelectorAll("#section5 .history-field");
  let container = null;

  containers.forEach(c => {
    const label = c.querySelector("label");
    if (label && label.textContent.trim() === labelText) container = c;
  });

  if (container) {
    const buttons = container.querySelectorAll(".button-group .btn");
    const noteInput = container.querySelector("input[type='text']");

    // الأزرار
    buttons.forEach(btn => {
      btn.addEventListener("click", () => {
        buttons.forEach(b => b.classList.remove("active"));
        btn.classList.add("active");

        if (!acousticData[labelText]) acousticData[labelText] = {};
        acousticData[labelText].status = btn.textContent.trim();
        acousticData[labelText].notes = noteInput.value.trim();

        generateReport();
      });
    });

    // حقل الإدخال
    noteInput.addEventListener("input", () => {
      if (!acousticData[labelText]) acousticData[labelText] = {};
      acousticData[labelText].notes = noteInput.value.trim();
      generateReport();
    });
  }
});

// =============================
// تحميل التقرير كملف TXT
// =============================
function downloadReport() {
  const reportText = document.getElementById("report").value.trim();
  if (!reportText) {
    alert("التقرير فارغ. يرجى إكمال بعض الحقول أولاً.");
    return;
  }

  const blob = new Blob([reportText], { type: "text/plain" });
  const url = URL.createObjectURL(blob);

  const a = document.createElement("a");
  a.href = url;
  a.download = "تقرير_تقييم_الصوت.txt";
  a.click();

  URL.revokeObjectURL(url);
}

// إظهار النافذة المنبثقة
function showTestInfo() {
  document.getElementById('info-overlay').classList.remove('hidden');
}

// إغلاق النافذة المنبثقة عند النقر على زر الإغلاق
function closeInfoBox() {
  document.getElementById('info-overlay').classList.add('hidden');
}

// إغلاق النافذة المنبثقة عند النقر خارج محتوى النافذة
function overlayClick(event) {
  const contentBox = document.getElementById('info-box-page');
  if (!contentBox.contains(event.target)) {
    closeInfoBox();
  }
}