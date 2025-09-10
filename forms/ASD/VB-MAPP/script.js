// =============================
// Section 0: Identifying Info
// =============================

// Auto-set today's date for the assessment date
document.addEventListener("DOMContentLoaded", () => {
  const testDateField = document.getElementById("testDate");
  const today = new Date().toISOString().split("T")[0];
  testDateField.value = today;

  // Generate initial empty report
  generateReport();
});

// Calculate chronological age when DOB is selected
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

  ageField.value = `${years}y ${months}m ${days}d`;
  generateReport();
}

// =============================
// Gender Button Toggle
// =============================
const genderButtons = document.querySelectorAll(".btn-gender");
let selectedGender = "";

genderButtons.forEach(button => {
  button.addEventListener("click", () => {
    // Remove active class from all
    genderButtons.forEach(btn => btn.classList.remove("active"));

    // Mark this one active
    button.classList.add("active");
    selectedGender = button.getAttribute("data-value");

    generateReport();
  });
});

// =============================
// Section 1: Medical & Voice History
// =============================
const medicalHistoryFields = [
  { id: "medicalConditions", label: "Medical Conditions" },
  { id: "currentMedications", label: "Current Medications" },
  { id: "surgicalHistory", label: "Surgical History" },
  { id: "previousVoice", label: "Previous Voice Disorders / Therapy" },
  { id: "hydrationLifestyle", label: "Hydration & Lifestyle Habits" },
  { id: "allergiesSinus", label: "Allergies / Sinus Issues" },
  { id: "smokingAlcohol", label: "Smoking / Alcohol Use" },
  { id: "vocalMisuse", label: "Vocal Overuse or Misuse Patterns" }
];

function getSection1MedicalHistory() {
  let sectionText = "";

  medicalHistoryFields.forEach(field => {
    const value = document.getElementById(field.id)?.value.trim();
    if (value) {
      sectionText += `- ${field.label}: ${value}\n`;
    }
  });

  return sectionText ? `Medical & Voice History:\n${sectionText}\n` : "";
}

// =============================
// Section 2: Generate Oral-Peripheral Text
// =============================
function getSection2OralPeripheral() {
  let sectionText = "";

  Object.entries(oralPeripheralData).forEach(([area, data]) => {
    if (data.status || data.notes) {
      sectionText += `- ${area}: ${data.status || "N/A"}`;
      if (data.notes) sectionText += ` (Notes: ${data.notes})`;
      sectionText += "\n";
    }
  });

  return sectionText ? `Oral-Peripheral Exam:\n${sectionText}\n` : "";
}

const oralPeripheralFields = [
  "Lips",
  "Tongue",
  "Palate",
  "Laryngeal Elevation",
  "Resonance"
];

const oralPeripheralData = {};

// Attach listeners
oralPeripheralFields.forEach(labelText => {
  // Find the container by matching the label text
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

    // Button clicks
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

    // Note input changes
    noteInput.addEventListener("input", () => {
      if (!oralPeripheralData[labelText]) oralPeripheralData[labelText] = {};
      oralPeripheralData[labelText].notes = noteInput.value.trim();
      generateReport();
    });
  }
});

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

// =============================
// Section 3: Breathing & Phonation Assessment
// =============================
const breathingPhonationFields = [
  "Breathing Type",
  "Breathing Pattern Regularity",
  "Coordination of Breathing with Speech",
  "Phonation Onset Type",
  "Vocal Loudness & Projection",
  "Vocal Fatigue / Effort"
];

const breathingPhonationData = {};

// -----------------------------
// Info box toggle & close (like GRBAS)
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

// -----------------------------
// Handle button selection & note input (like GRBAS)
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

// -----------------------------
// Generate Section 3 report text
// -----------------------------
function getSection3BreathingPhonation() {
  let sectionText = "";

  Object.entries(breathingPhonationData).forEach(([param, data]) => {
    sectionText += `- ${param}: ${data.status || "N/A"}`;
    if (data.notes) sectionText += ` (Notes: ${data.notes})`;
    sectionText += "\n";
  });

  return sectionText
    ? `Breathing & Phonation Assessment:\n${sectionText}\n`
    : "";
}


// =============================
// Section 4: Perceptual Voice Evaluation (GRBAS Scale)
// =============================
const grbasFields = ["G (Grade)", "R (Roughness)", "B (Breathiness)", "A (Asthenia)", "S (Strain)"];
const grbasData = {};

// -----------------------------
// Info box toggle and close
// -----------------------------
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

// -----------------------------
// Handle button selections
// -----------------------------
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
      // Remove active class from all buttons in the group
      buttons.forEach(b => b.classList.remove("active"));
      btn.classList.add("active");

      // Save the selected number
      grbasData[labelText] = btn.textContent.trim();

      generateReport();
    });
  });
});

// -----------------------------
// Generate Section 4 text for report
// -----------------------------
function getSection4GRBAS() {
  let sectionText = "";

  Object.entries(grbasData).forEach(([param, score]) => {
    sectionText += `- ${param}: ${score}\n`;
  });

  return sectionText ? `Perceptual Voice Evaluation (GRBAS Scale):\n${sectionText}\n` : "";
}
// =============================
// Section 5: Acoustic & Aerodynamic Measures
// =============================
const section5Fields = [
  "Fundamental Frequency (F0)",
  "Maximum Phonation Time (MPT)",
  "Pitch Range",
  "S/Z Ratio",
  "Jitter (%)",
  "Shimmer (%)",
  "Noise-to-Harmonic Ratio",
  "Voice Range Profile (VRP)"
];

const acousticData = {};

// -----------------------------
// Info box toggle and close
// -----------------------------
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

// -----------------------------
// Handle button selections & input
// -----------------------------
section5Fields.forEach(labelText => {
  const containers = document.querySelectorAll("#section5 .history-field");
  
  containers.forEach(container => {
    const label = container.querySelector("label");
    if (!label || label.textContent.trim() !== labelText) return;

    const buttons = container.querySelectorAll(".button-group .btn");
    const noteInput = container.querySelector("input[type='text']");

    // Button selection
    buttons.forEach(btn => {
      btn.addEventListener("click", () => {
        // Toggle active
        buttons.forEach(b => b.classList.remove("active"));
        btn.classList.add("active");

        // Save to data object
        if (!acousticData[labelText]) acousticData[labelText] = {};
        acousticData[labelText].status = btn.textContent.trim();
        acousticData[labelText].notes = noteInput ? noteInput.value.trim() : "";

        generateReport();
      });
    });

    // Input changes
    if (noteInput) {
      noteInput.addEventListener("input", () => {
        if (!acousticData[labelText]) acousticData[labelText] = {};
        acousticData[labelText].notes = noteInput.value.trim();
        generateReport();
      });
    }
  });
});

// -----------------------------
// Generate Section 5 text for report
// -----------------------------
function getSection5AcousticAerodynamic() {
  let sectionText = "";

  Object.entries(acousticData).forEach(([area, data]) => {
    if (data.status || data.notes) {
      sectionText += `- ${area}: ${data.status || "N/A"}`;
      if (data.notes) sectionText += ` (Notes: ${data.notes})`;
      sectionText += "\n";
    }
  });

  return sectionText ? `Acoustic & Aerodynamic Measures:\n${sectionText}\n` : "";
}


// =============================
// Section 6: Vocal Health Assessment
// =============================
const section6Fields = [
  "Sensitivity",
  "Shouting / Loud Screaming",
  "Stimulant Intake (Alcohol, Coffee, Caffeine, Cola, etc.)",
  "Frequent Coughing",
  "Excessive Throat Clearing (Hawking)",
  "Side Effects from Continuous Medication",
  "Vocalization During Exercise",
  "Loud Laughing",
  "Use of Voice in Work (Teaching, Singing, etc.)",
  "Prolonged Speaking Without Breaks",
  "Smoking",
  "Calling Others from a Distance",
  "Activities Requiring Loud Voice",
  "Exposure to Environmental Pollution",
  "Imitating Others’ Sounds",
  "Speaking in Noisy Environments",
  "Speaking While Upset",
  "Low Water Intake",
  "Other"
];

const vocalHealthData = {};

// Attach listeners
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

    // Button clicks
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

    // Input changes
    if (noteInput) {
      noteInput.addEventListener("input", () => {
        if (!vocalHealthData[labelText]) vocalHealthData[labelText] = {};
        vocalHealthData[labelText].notes = noteInput.value.trim();
        generateReport();
      });
    }
  }
});

// Generate Section 6 text for report
function getSection6VocalHealth() {
  let sectionText = "";

  Object.entries(vocalHealthData).forEach(([behavior, data]) => {
    if (data.status || data.notes) {
      sectionText += `- ${behavior}: ${data.status || "N/A"}`;
      if (data.notes) sectionText += ` (Notes: ${data.notes})`;
      sectionText += "\n";
    }
  });

  return sectionText ? `Vocal Health Assessment:\n${sectionText}\n` : "";
}

// =============================
// Section 7: Voice Handicap Index - 10 (VHI-10) with Interpretation
// =============================
const vhiFields = [
  "My voice makes it difficult for people to hear me.",
  "People have difficulty understanding me in a noisy room.",
  "My voice difficulties restrict personal and social life.",
  "I feel left out of conversations because of my voice.",
  "My voice problem causes me to lose income.",
  "I feel as though I have to strain to produce voice.",
  "The clarity of my voice is unpredictable.",
  "My voice problem upsets me.",
  "My voice makes me feel handicapped.",
  "People ask, “What’s wrong with your voice?”"
];

const vhiData = {};

// Attach event listeners for VHI-10 buttons
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

// Calculate total VHI-10 score and update display
function updateVHITotal() {
  const total = Object.values(vhiData).reduce((sum, val) => sum + val, 0);
  document.getElementById("vhiTotal").textContent = total;
}

// Determine VHI-10 interpretation
function getVHIInterpretation(score) {
  if (score >= 0 && score <= 11) return "Normal / Minimal handicap";
  if (score >= 12 && score <= 22) return "Mild handicap";
  if (score >= 23 && score <= 34) return "Moderate handicap";
  if (score >= 35 && score <= 40) return "Severe handicap";
  return "N/A";
}

// Generate Section 7 text for report with interpretation
function getSection7VHI() {
  if (Object.keys(vhiData).length === 0) return "";

  let sectionText = "";
  Object.entries(vhiData).forEach(([statement, score]) => {
    sectionText += `- ${statement}: ${score}\n`;
  });

  const totalScore = Object.values(vhiData).reduce((sum, val) => sum + val, 0);
  const interpretation = getVHIInterpretation(totalScore);

  sectionText += `\nTotal VHI-10 Score: ${totalScore} / 40\n`;
  sectionText += `Interpretation: ${interpretation}\n`;

  return `Voice Handicap Index - 10 (VHI-10):\n${sectionText}`;
}

// =============================
// Section 8: Voice Therapy Stimulability & Strategy Testing
// =============================
const section8Fields = [
  "Relaxation Exercises",
  "Resonant Voice Tasks",
  "Pitch Glides",
  "Semi-Occluded Vocal Tract Exercises (SOVT)",
  "Additional Voice Therapy Strategy",
  "Overall Result / Clinical Recommendations"
];

const therapyData = {};

// -----------------------------
// Info box toggle and close
// -----------------------------
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

// -----------------------------
// Handle button selections & textarea
// -----------------------------
section8Fields.forEach(labelText => {
  const containers = document.querySelectorAll("#section8 .history-field");

  containers.forEach(container => {
    const label = container.querySelector("label");
    if (!label || label.textContent.trim() !== labelText) return;

    const buttons = container.querySelectorAll(".button-group .btn");
    const noteInput = container.querySelector("textarea");

    // Button click
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

    // Note input
    if (noteInput) {
      noteInput.addEventListener("input", () => {
        if (!therapyData[labelText]) therapyData[labelText] = {};
        therapyData[labelText].notes = noteInput.value.trim();
        updateSection8Report();
      });
    }
  });
});

// -----------------------------
// Generate Section 8 report
// -----------------------------
function getSection8Therapy() {
  if (!Object.keys(therapyData).length) return "";

  let sectionText = "";
  Object.entries(therapyData).forEach(([strategy, data]) => {
    const statusText = data.status ? `Status: ${data.status}` : "";
    const notesText = data.notes ? `Notes: ${data.notes}` : "";
    sectionText += `- ${strategy}: ${statusText}${notesText ? ` | ${notesText}` : ""}\n`;
  });

  return `Voice Therapy Stimulability & Strategy Testing:\n${sectionText}\n`;
}

// Update report textarea if exists
function updateSection8Report() {
  const reportTextarea = document.getElementById("report");
  if (reportTextarea) reportTextarea.value = getSection8Therapy();
}


// =============================
// Extend Unified Report Generator
// =============================
function generateReport() {
  // ----- Section 0 -----
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
VOICE ASSESSMENT REPORT
=======================

Patient Information:
- Name: ${name || "N/A"}
- Date of Birth: ${dob || "N/A"}
- Chronological Age: ${age || "N/A"}
- Gender: ${selectedGender || "N/A"}
- Occupation: ${occupation || "N/A"}
- Languages Spoken: ${languages || "N/A"}

Assessment Details:
- Date of Assessment: ${testDate || "N/A"}
- Evaluator: ${examiner || "N/A"}
- Referral Source: ${referralSource || "N/A"}

Reason for Referral:
- Primary Complaint: ${primaryComplaint || "N/A"}
- Onset & Course: ${onsetCourse || "N/A"}
- Impact on Daily Life: ${impactDailyLife || "N/A"}
`;

// Section 1 – Medical History
const section1History = getSection1MedicalHistory();
if (section1History) {
  report += `\n-----------------------------------------\n${section1History}`;
}

// Section 2 – Oral-Peripheral
const section2Oral = getSection2OralPeripheral();
if (section2Oral) {
  report += `\n-----------------------------------------\n${section2Oral}`;
}

// Section 3 – Breathing & Phonation
const section3Breathing = getSection3BreathingPhonation();
if (section3Breathing) {
  report += `\n-----------------------------------------\n${section3Breathing}`;
}

// Section 4 – GRBAS
const section4GRBAS = getSection4GRBAS();
if (section4GRBAS) {
  report += `\n-----------------------------------------\n${section4GRBAS}`;
}

// Section 5 – Acoustic & Aerodynamic
const section5Acoustic = getSection5AcousticAerodynamic();
if (section5Acoustic) {
  report += `\n-----------------------------------------\n${section5Acoustic}`;
}

// Section 6 – Vocal Health
const section6VocalHealth = getSection6VocalHealth();
if (section6VocalHealth) {
  report += `\n-----------------------------------------\n${section6VocalHealth}`;
}

// Section 7 – Voice Handicap Index
const section7VHI = getSection7VHI();
if (section7VHI) {
  report += `\n-----------------------------------------\n${section7VHI}`;
}

// Section 8 – Therapy Recommendations
const section8Therapy = getSection8Therapy();
if (section8Therapy) {
  report += `\n-----------------------------------------\n${section8Therapy}`;
}

report += `
-----------------------------------------
Note: This report will automatically update as additional sections are completed.
Prepared by: SLP Ahmad Ghanem
`;

document.getElementById("report").value = report.trim();

}

// =============================
// Event Listeners for Live Updates
// =============================

// Section 0 inputs
const section0Fields = document.querySelectorAll("#section0 input, #section0 textarea");
section0Fields.forEach(field => {
  field.addEventListener("input", generateReport);
});

// Section 1 inputs (Medical & Voice History)
const section1Fields = document.querySelectorAll("#section1 textarea");
section1Fields.forEach(field => {
  field.addEventListener("input", generateReport);
});

// Section 2: Attach listeners to buttons and note inputs
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

// Generate Section 3 text for report
function getSection3BreathingPhonation() {
  let sectionText = "";

  Object.entries(breathingPhonationData).forEach(([area, data]) => {
    if (data.status || data.notes) {
      sectionText += `- ${area}: ${data.status || "N/A"}`;
      if (data.notes) sectionText += ` (Notes: ${data.notes})`;
      sectionText += "\n";
    }
  });

  return sectionText ? `Breathing & Phonation Assessment:\n${sectionText}\n` : "";
}

// Generate Section 4 text for report
function getSection4GRBAS() {
  let sectionText = "";
  Object.entries(grbasData).forEach(([parameter, value]) => {
    sectionText += `- ${parameter}: ${value || "N/A"}\n`;
  });

  return sectionText ? `Perceptual Voice Evaluation (GRBAS):\n${sectionText}\n` : "";
}

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

    // Buttons
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

    // Input field
    noteInput.addEventListener("input", () => {
      if (!acousticData[labelText]) acousticData[labelText] = {};
      acousticData[labelText].notes = noteInput.value.trim();
      generateReport();
    });
  }
});
// Generate Section 5 text for report
function getSection5AcousticAerodynamic() {
  let sectionText = "";

  Object.entries(acousticData).forEach(([area, data]) => {
    if (data.status || data.notes) {
      sectionText += `- ${area}: ${data.status || "N/A"}`;
      if (data.notes) sectionText += ` (Notes: ${data.notes})`;
      sectionText += "\n";
    }
  });

  return sectionText ? `Acoustic & Aerodynamic Measures:\n${sectionText}\n` : "";
}

// =============================
// Download Report as TXT
// =============================
function downloadReport() {
  const reportText = document.getElementById("report").value.trim();
  if (!reportText) {
    alert("The report is empty. Please complete some fields first.");
    return;
  }

  const blob = new Blob([reportText], { type: "text/plain" });
  const url = URL.createObjectURL(blob);

  const a = document.createElement("a");
  a.href = url;
  a.download = "voice_assessment_report.txt";
  a.click();

  URL.revokeObjectURL(url);
}
// Show the popup
function showTestInfo() {
  document.getElementById('info-overlay').classList.remove('hidden');
}

// Close popup when clicking close button
function closeInfoBox() {
  document.getElementById('info-overlay').classList.add('hidden');
}

// Close popup when clicking outside the modal content
function overlayClick(event) {
  const contentBox = document.getElementById('info-box-page');
  if (!contentBox.contains(event.target)) {
    closeInfoBox();
  }
}
