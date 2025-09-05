// ==========================
// SVHI Questions
// ==========================
const svhiQuestions = [
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
];

// ==========================
// Generate SVHI questions dynamically
// ==========================
const container = document.getElementById("svhi-questions");

svhiQuestions.forEach((q, index) => {
  const itemDiv = document.createElement("div");
  itemDiv.classList.add("svhi-item");

  const questionText = document.createElement("p");
  questionText.textContent = `${index + 1}. ${q}`;
  itemDiv.appendChild(questionText);

  const buttonGroup = document.createElement("div");
  buttonGroup.classList.add("button-group");

  for (let i = 0; i <= 4; i++) {
    const btn = document.createElement("button");
    btn.textContent = i;
    btn.classList.add("btn");
    btn.dataset.value = i;

    btn.addEventListener("click", () => {
      // Remove active from siblings
      buttonGroup.querySelectorAll(".btn").forEach(b => b.classList.remove("active"));
      btn.classList.add("active");
    });

    buttonGroup.appendChild(btn);
  }

  itemDiv.appendChild(buttonGroup);
  container.appendChild(itemDiv);
});

// ==========================
// Handle SVHI submission
// ==========================
document.getElementById("submit-svhi").addEventListener("click", () => {
  let totalScore = 0;
  let allAnswered = true;

  document.querySelectorAll(".svhi-item").forEach(item => {
    const activeBtn = item.querySelector(".button-group .btn.active");
    if (activeBtn) {
      totalScore += parseInt(activeBtn.dataset.value);
    } else {
      allAnswered = false;
    }
  });

  if (!allAnswered) {
    alert("Please answer all SVHI questions before submitting.");
    return;
  }

  // Show total score
  document.getElementById("total-score").textContent = totalScore;

  // Interpretation
  let interpretation = "";
  if (totalScore <= 20) {
    interpretation = "Low handicap – minimal impact on singing";
  } else if (totalScore <= 50) {
    interpretation = "Moderate handicap – some impact on singing";
  } else {
    interpretation = "High handicap – significant impact on singing";
  }
  document.getElementById("score-interpretation").textContent = interpretation;

  // Collect patient info
  const name = document.getElementById("patient-name").value || "[Name]";
  const date = document.getElementById("assessment-date").value || "[Date]";
  const musicTypes = Array.from(document.querySelectorAll('input[name=music]:checked'))
    .map(c => c.value)
    .join(", ") || "[Not specified]";
  const level = document.querySelector('input[name=level]:checked')?.value || "[Not specified]";
  const income = document.querySelector('input[name=income]:checked')?.value || "[Not specified]";

  // Generate formatted clinical note
  const note = `
========================================
SINGING VOICE HANDICAP INDEX (SVHI) REPORT
========================================

Patient Name: ${name}
Date of Assessment: ${date}

Types of Music Sung: ${musicTypes}
Singing Level: ${level}
Income Source from Singing: ${income}

------------------------------
SVHI Total Score: ${totalScore}
Interpretation: ${interpretation}
------------------------------

CLINICAL SUMMARY:
The patient reports difficulties as indicated by the SVHI questionnaire. Observed impacts on singing include effort, vocal fatigue, pitch control, voice breaks, and psychological effects such as anxiety or embarrassment. These results suggest the need for:

- Voice therapy tailored to singing demands
- Vocal hygiene education
- Possible referral to ENT or voice specialist if indicated

Therapy goals may include:
1. Reducing vocal strain and fatigue
2. Improving breath support and pitch accuracy
3. Enhancing confidence in singing
4. Minimizing psychosocial impact related to singing difficulties

Follow-up assessment recommended to monitor progress and adjust interventions.
========================================
  `;

  document.getElementById("clinical-note").value = note.trim();
  document.getElementById("svhi-result").style.display = "block";
});
