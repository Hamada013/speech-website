document.addEventListener("DOMContentLoaded", () => {
  setupExport();
});

function setupExport() {
  const exportBtn = document.getElementById("export-btn");
  if (!exportBtn) return;

  exportBtn.addEventListener("click", () => {
    const childName = document.querySelector('input[name="child_name"]')?.value.trim() || "الطفل";
    const filename = `تقرير_اللغة_والتواصل_${childName.replace(/[\\/:*?"<>|]/g, "_")}.txt`;

    const content = generateReportText();
    const blob = new Blob([content], { type: "text/plain;charset=utf-8" });

    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = filename;
    link.click();
  });
}

function generateReportText() {
  let output = "==============================\n";
  output += "تقرير تقييم لغة وتواصل\n";
  output += "==============================\n\n";

  const sections = document.querySelectorAll(".card");

  sections.forEach(card => {
    const title = card.querySelector(".card-header")?.textContent.trim() || "";
    output += `\n${title}\n------------------------------\n`;

    const tables = card.querySelectorAll("table");

    if (tables.length > 0) {
      tables.forEach(table => {
        const rows = table.querySelectorAll("tbody tr");

        rows.forEach(row => {
          const label = row.cells[0]?.textContent.trim() || "";
          const checkboxes = row.querySelectorAll('input[type="checkbox"]');
          const inputs = row.querySelectorAll('input[type="text"], textarea');

          let selected = [];
          checkboxes.forEach(cb => {
            const lbl = cb.closest("label")?.textContent.trim() || "";
            if (cb.checked) selected.push(lbl);
          });

          let value = selected.length > 0 ? selected.join(" / ") : "غير محدد";

          let note = "غير محدد";
          if (inputs.length > 0) {
            const cleanedNotes = Array.from(inputs)
              .map(input => input.value.trim())
              .filter(Boolean);
            if (cleanedNotes.length > 0) {
              note = cleanedNotes.join(" ");
            }
          }

          output += `${label}: ${value}`;
          if (note !== "غير محدد" || inputs.length > 0) {
            output += ` | ملاحظات: ${note}`;
          }
          output += `\n`;
        });
      });

    } else {
      // إذا لم يكن هناك جداول، نعالج الحقول اليدوية فقط
      const inputs = card.querySelectorAll('input:not([type="checkbox"]), textarea');
      inputs.forEach(input => {
        const label = getLabelFromInput(input);
        const val = input.value.trim() || "غير محدد";
        if (label) {
          output += `${label}: ${val}\n`;
        }
      });

      const checkboxes = card.querySelectorAll('input[type="checkbox"]');
      const seenLabels = new Set();
      checkboxes.forEach(cb => {
        const label = getLabelFromInput(cb);
        if (!label || seenLabels.has(label)) return;
        if (cb.checked) {
          output += `${label}: نعم\n`;
        }
        seenLabels.add(label);
      });
    }
  });

  return output.trim();
}

function getLabelFromInput(input) {
  const wrapLabel = input.closest("label");
  if (wrapLabel) return wrapLabel.textContent.trim().replace(/[\r\n]+/g, " ");

  const prev = input.previousElementSibling;
  if (prev?.tagName === "LABEL") return prev.textContent.trim();

  const td = input.closest("td");
  if (!td) return "";
  const firstTd = td.closest("tr")?.querySelector("td");
  return firstTd?.textContent.trim() || "";
}
