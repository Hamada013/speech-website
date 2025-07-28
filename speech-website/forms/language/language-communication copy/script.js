document.addEventListener("DOMContentLoaded", () => {
  const exportBtn = document.getElementById("export-btn");
  const form = document.getElementById("evaluation-form");

  exportBtn.addEventListener("click", () => {
    let outputText = "";

    // تعريف الأقسام بالترتيب مع معرف كل قسم
    const sections = [
      { id: "section1", title: "القسم الأول: البيانات الأساسية" },
      { id: "section2", title: "القسم الثاني: الحالة الصحية والسلوكية" },
      { id: "section3", title: "القسم الثالث: تقييم اللغة" },
      { id: "section4", title: "القسم الرابع: تقييم النطق" },
      { id: "section5", title: "القسم الخامس: تقييم الصوت" },
      { id: "section6", title: "القسم السادس: تقييم البلع" },
      { id: "section7", title: "القسم السابع: تقييم القراءة والكتابة" },
      { id: "section8", title: "القسم الثامن: الخلاصة والتشخيص" },
      { id: "section9", title: "القسم التاسع: معلومات إضافية" }
    ];

    sections.forEach(section => {
      const sectionEl = document.getElementById(section.id);
      if (!sectionEl) return;

      outputText += `==============================\n${section.title}\n==============================\n`;

      // معالج الحقول النصية، الاختيارية، والحقول داخل الجداول
      // نبدأ بالحصول على كل عناصر الإدخال داخل القسم
      const inputs = Array.from(sectionEl.querySelectorAll("input, textarea, select"));

      // حقل الاسم بالذات لأجل التصدير واسم الملف
      let patientName = "";

      // لحفظ مدخلات الجداول الخاصة بتقييم اللغة الاستيعابية والانتاجية
      if (section.id === "section3") {
        // مثال: معالجة جداول اللغة (قابلة للتوسيع حسب هيكل الصفحة)
        // اللغة الاستيعابية
        const receptiveTable = sectionEl.querySelector("#receptive-language-table tbody");
        if (receptiveTable) {
          outputText += "اللغة الاستيعابية:\n";
          const rows = receptiveTable.querySelectorAll("tr");
          rows.forEach(row => {
            const domain = row.querySelector(".domain")?.textContent.trim() || "";
            const suitable = row.querySelector("input[type='checkbox'].receptive-suitable")?.checked ? "مناسب ✅" : "غير مناسب ❌";
            const notes = row.querySelector("input[type='text'].receptive-notes")?.value.trim() || "";
            outputText += `${domain} | ${suitable} | ${notes}\n`;
          });
          outputText += "\n";
        }
        // اللغة الإنتاجية (نعم/لا)
        const speaks = sectionEl.querySelector("input[name='speaks']:checked")?.value || "";
        outputText += `هل يتكلم المريض؟: ${speaks}\n`;

        if (speaks === "نعم") {
          const expressiveTable = sectionEl.querySelector("#expressive-language-table tbody");
          if (expressiveTable) {
            outputText += "اللغة الإنتاجية:\n";
            const rows = expressiveTable.querySelectorAll("tr");
            rows.forEach(row => {
              const domain = row.querySelector(".domain")?.textContent.trim() || "";
              const suitable = row.querySelector("input[type='checkbox'].expressive-suitable")?.checked ? "مناسب ✅" : "غير مناسب ❌";
              const notes = row.querySelector("input[type='text'].expressive-notes")?.value.trim() || "";
              outputText += `${domain} | ${suitable} | ${notes}\n`;
            });
            outputText += "\n";
          }
        }
        return; // انتهى معالجة قسم 3
      }

      // معالجة الجداول في قسم 4،5،6 أيضا
      if (section.id === "section4") {
        // قسم تقييم النطق: جدول التقييم التشريحي
        outputText += "التقييم الوظيفي:\n";
        const funcIssue = sectionEl.querySelector("input[name='hasFunctionalIssue']:checked")?.value || "";
        outputText += `هل يوجد مشاكل وظيفية في النطق؟: ${funcIssue}\n`;
        if (funcIssue === "نعم") {
          const phonological = sectionEl.querySelector("#phonological")?.value.trim() || "";
          const articulation = sectionEl.querySelector("#articulation")?.value.trim() || "";
          const apraxia = sectionEl.querySelector("#apraxia")?.value.trim() || "";
          outputText += `الاضطرابات الفونولوجية: ${phonological}\n`;
          outputText += `الاضطرابات النطقية: ${articulation}\n`;
          outputText += `أبراكسيا الكلام: ${apraxia}\n`;
        }
        outputText += "\n";

        // التقييم التشريحي
        outputText += "التقييم التشريحي:\n";
        const anatomyTable = sectionEl.querySelector("#orofacial-table tbody");
        if (anatomyTable) {
          anatomyTable.querySelectorAll("tr").forEach(row => {
            const structure = row.querySelector(".structure")?.textContent.trim() || "";
            const symmetry = row.querySelector("input.symmetry")?.checked ? "نعم ✅" : "لا ❌";
            const strength = row.querySelector("input.strength")?.checked ? "نعم ✅" : "لا ❌";
            const movement = row.querySelector("input.movement")?.checked ? "نعم ✅" : "لا ❌";
            const notes = row.querySelector("input.notes")?.value.trim() || "";
            outputText += `${structure} | تماثل: ${symmetry} | قوة: ${strength} | حركة: ${movement} | ملاحظات: ${notes}\n`;
          });
        }
        outputText += "\n";
        return;
      }

      if (section.id === "section5") {
        // تقييم الصوت
        const hasVoiceIssue = sectionEl.querySelector("input[name='hasVoiceIssue']:checked")?.value || "";
        outputText += `هل يوجد مشاكل في الصوت؟: ${hasVoiceIssue}\n`;

        if (hasVoiceIssue === "نعم") {
          const voiceTable = sectionEl.querySelector("#voice-table tbody");
          if (voiceTable) {
            outputText += "مكونات الصوت:\n";
            voiceTable.querySelectorAll("tr").forEach(row => {
              const parameter = row.querySelector(".parameter")?.textContent.trim() || "";
              const appropriate = row.querySelector("input.appropriate")?.checked ? "مناسب ✅" : "غير مناسب ❌";
              const notes = row.querySelector("input.notes")?.value.trim() || "";
              outputText += `${parameter} | ${appropriate} | ${notes}\n`;
            });
          }
          outputText += "\n";
        }
        return;
      }

      if (section.id === "section6") {
        // تقييم البلع
        const hasSwallowIssue = sectionEl.querySelector("input[name='hasSwallowingIssue']:checked")?.value || "";
        outputText += `هل يوجد مشاكل في البلع؟: ${hasSwallowIssue}\n`;
        if (hasSwallowIssue === "نعم") {
          const swallowingTable = sectionEl.querySelector("#swallowing-table tbody");
          if (swallowingTable) {
            outputText += "أعراض البلع:\n";
            swallowingTable.querySelectorAll("tr").forEach(row => {
              const symptom = row.querySelector(".symptom")?.textContent.trim() || "";
              const present = row.querySelector("input.present")?.checked ? "موجود ✅" : "غير موجود ❌";
              const notes = row.querySelector("input.notes")?.value.trim() || "";
              outputText += `${symptom} | ${present} | ${notes}\n`;
            });
          }
          outputText += "\n";
        }
        return;
      }

      if (section.id === "section7") {
        const hasLiteracyIssue = sectionEl.querySelector("input[name='hasLiteracyIssue']:checked")?.value || "";
        outputText += `هل يوجد مشاكل في القراءة والكتابة؟: ${hasLiteracyIssue}\n`;
        if (hasLiteracyIssue === "نعم") {
          const readingAbility = sectionEl.querySelector("#readingAbility")?.value.trim() || "";
          const writingAbility = sectionEl.querySelector("#writingAbility")?.value.trim() || "";
          const dominantHand = sectionEl.querySelector("input[name='dominantHand']:checked")?.value || "";
          const copyingSkill = sectionEl.querySelector("#copyingSkill")?.value.trim() || "";
          const visualNeglect = sectionEl.querySelector("#visualNeglect")?.checked ? "نعم" : "لا";
          outputText += `القدرة على القراءة: ${readingAbility}\n`;
          outputText += `القدرة على الكتابة: ${writingAbility}\n`;
          outputText += `اليد المستخدمة: ${dominantHand}\n`;
          outputText += `النسخ: ${copyingSkill}\n`;
          outputText += `إهمال بصري لإحدى الجهات: ${visualNeglect}\n\n`;
        }
        return;
      }

      if (section.id === "section8") {
        const resultsSummary = sectionEl.querySelector("#resultsSummary")?.value.trim() || "";
        const diagnosis = sectionEl.querySelector("#diagnosis")?.value.trim() || "";
        const prognosis = sectionEl.querySelector("input[name='prognosis']:checked")?.value || "";
        const recommendations = sectionEl.querySelector("#recommendations")?.value.trim() || "";
        outputText += `ملخص النتائج:\n${resultsSummary}\n\n`;
        outputText += `التشخيص:\n${diagnosis}\n\n`;
        outputText += `إمكانية التحسن: ${prognosis}\n\n`;
        outputText += `التوصيات:\n${recommendations}\n\n`;
        return;
      }

      if (section.id === "section9") {
        const evaluationDate = sectionEl.querySelector("#evaluationDate")?.value || "";
        const filledBy = sectionEl.querySelector("#filledBy")?.value.trim() || "";
        const relationship = sectionEl.querySelector("#relationshipToPatient")?.value.trim() || "";
        outputText += `تاريخ التقييم: ${evaluationDate}\n`;
        outputText += `الشخص الذي قام بالتعبئة: ${filledBy}\n`;
        outputText += `صلة القرابة بالمريض: ${relationship}\n\n`;
        return;
      }

      // المعالجة العامة للحقول الأخرى النصية أو غيرها
      inputs.forEach(input => {
        if (!input.id) return;
        const label = sectionEl.querySelector(`label[for="${input.id}"]`);
        const labelText = label ? label.textContent.trim() : input.name || input.id;

        let val = "";
        if (input.type === "checkbox") {
          val = input.checked ? "نعم" : "لا";
        } else if (input.type === "radio") {
          if (input.checked) val = input.value;
        } else {
          val = input.value.trim();
        }
        if (val) {
          outputText += `✦ ${labelText}: ${val}\n`;
        }
      });

      outputText += "\n";
    });

    // اسم المريض للتسمية
    const patientNameInput = document.querySelector("#name");
    let patientNameForFile = "form";
    if (patientNameInput) {
      patientNameForFile = patientNameInput.value.trim().replace(/\s+/g, "_") || "form";
    }

    const filename = `نموذج_التقييم_${patientNameForFile}.txt`;

    // إنشاء ملف نصي للتحميل
    const blob = new Blob([outputText], { type: "text/plain;charset=utf-8" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    link.remove();
    URL.revokeObjectURL(link.href);
  });
});
