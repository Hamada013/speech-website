// ======= Identifying Info =======
document.addEventListener("DOMContentLoaded", () => {
  const today = new Date().toISOString().split("T")[0];
  document.getElementById("testDate").value = today;
});

function calculateAge() {
  const dob = document.getElementById("dob").value;
  if (!dob) return;
  const birthDate = new Date(dob);
  const today = new Date();
  let years = today.getFullYear() - birthDate.getFullYear();
  let months = today.getMonth() - birthDate.getMonth();
  let days = today.getDate() - birthDate.getDate();
  if (days < 0) { months--; days += new Date(today.getFullYear(), today.getMonth(), 0).getDate(); }
  if (months < 0) { years--; months += 12; }
  document.getElementById("age").value = `${years}y ${months}m ${days}d`;
}

function selectOption(field, value, btn) {
  document.getElementById(field).value = value;
  const group = btn.parentNode.querySelectorAll("button");
  group.forEach(b => b.classList.remove("active-btn"));
  btn.classList.add("active-btn");
}
// ======= Resources Section: Floating Image Box =======
const floatingBox = document.getElementById("floating-box");
const resourceImg = document.getElementById("resource-img");

// Attach events to resource buttons (correct selector!)
document.querySelectorAll("#resources-section .resource-buttons button").forEach(btn => {
  btn.addEventListener("click", () => {
    const imgSrc = btn.getAttribute("data-img");
    if (imgSrc) {
      resourceImg.src = imgSrc;
      floatingBox.classList.remove("hidden"); // show box
    }
  });
});

// Close floating box when clicking outside the image
floatingBox.addEventListener("click", (e) => {
  if (e.target === floatingBox) { // only if click on background
    floatingBox.classList.add("hidden"); // hide box
    resourceImg.src = ""; // clear image
  }
});


// ======= Elements =======
const recordBtn = document.getElementById("recordBtn");
const stopBtn = document.getElementById("stopBtn");
const timerDisplay = document.getElementById("timer");
const waveform = document.getElementById("waveform");
const ctx = waveform.getContext("2d");

const playBtn = document.getElementById("playBtn");
const progressContainerEl = document.getElementById("progressContainer");
const progressEl = document.getElementById("progress");
const currentTimeDisplayEl = document.getElementById("currentTime");

let mediaRecorder, audioChunks = [];
let audioContext, analyser, source, dataArray;
let animationId, startTime;

let audioElement = new Audio();
let isPlaying = false;
let isDragging = false;

// ======= Waveform Drawing (RTL) =======
function drawWave() {
  if (!analyser) return;
  animationId = requestAnimationFrame(drawWave);
  analyser.getByteTimeDomainData(dataArray);

  ctx.fillStyle = "#f0f4f8";
  ctx.fillRect(0, 0, waveform.width, waveform.height);

  ctx.lineWidth = 2;
  ctx.strokeStyle = "#007BFF";
  ctx.beginPath();

  const sliceWidth = waveform.width / dataArray.length;
  let x = waveform.width; // start from right for RTL

  for (let i = 0; i < dataArray.length; i++) {
    let v = dataArray[i] / 128.0;
    let y = v * waveform.height / 2;
    if (i === 0) ctx.moveTo(x, y);
    else ctx.lineTo(x, y);
    x -= sliceWidth;
  }

  ctx.lineTo(0, waveform.height / 2);
  ctx.stroke();

  // Timer in seconds
  if (startTime) {
    let elapsed = (Date.now() - startTime) / 1000;
    timerDisplay.textContent = elapsed.toFixed(2) + " s";
  }
}

// ======= Assign Recorded Audio =======
function assignAudioToPlayer(blob) {
  const url = URL.createObjectURL(blob);
  audioElement.src = url;
  audioElement.load();
  progressEl.style.width = "0%";
  currentTimeDisplayEl.textContent = "0.00 s";
}

// ======= Recording =======
recordBtn.addEventListener("click", async () => {
  try {
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    let options = { mimeType: 'audio/webm' };
    if (!MediaRecorder.isTypeSupported('audio/webm')) {
      options = MediaRecorder.isTypeSupported('audio/mp4') ? { mimeType: 'audio/mp4' } : {};
    }

    audioContext = new (window.AudioContext || window.webkitAudioContext)();
    source = audioContext.createMediaStreamSource(stream);
    analyser = audioContext.createAnalyser();
    analyser.fftSize = 2048;
    source.connect(analyser);
    dataArray = new Uint8Array(analyser.fftSize);
    drawWave();

    audioChunks = [];
    mediaRecorder = new MediaRecorder(stream, options);
    mediaRecorder.ondataavailable = e => { if (e.data.size > 0) audioChunks.push(e.data); };
    mediaRecorder.onstop = () => {
      const blob = new Blob(audioChunks, { type: mediaRecorder.mimeType });
      assignAudioToPlayer(blob);
      if (audioContext) audioContext.close();
      analyser = null;
      cancelAnimationFrame(animationId);
      recordBtn.disabled = false;
      stopBtn.disabled = true;
    };

    mediaRecorder.start();
    startTime = Date.now();
    recordBtn.disabled = true;
    stopBtn.disabled = false;

  } catch (err) {
    alert("Error accessing microphone: " + err);
  }
});

stopBtn.addEventListener("click", () => {
  if (mediaRecorder && mediaRecorder.state !== "inactive") mediaRecorder.stop();
});

document.addEventListener("keydown", e => {
  if (e.code === "Space" && !stopBtn.disabled) {
    stopBtn.click();
    e.preventDefault();
  }
});

// ======= Custom Audio Player =======

// Play/Pause toggle
playBtn.addEventListener("click", () => {
  if (!audioElement.src) return;
  if (!isPlaying) {
    audioElement.play();
    isPlaying = true;
    playBtn.textContent = "⏸️";
    requestAnimationFrame(updateProgress);
  } else {
    audioElement.pause();
    isPlaying = false;
    playBtn.textContent = "▶️";
  }
});

// Update progress bar & time
function updateProgress() {
  if (!isPlaying) return;
  if (!isDragging) {
    const percent = audioElement.currentTime / audioElement.duration;
    progressEl.style.width = (percent * 100) + "%";
    currentTimeDisplayEl.textContent = audioElement.currentTime.toFixed(2) + " s";
  }
  if (!audioElement.paused && !audioElement.ended) {
    requestAnimationFrame(updateProgress);
  } else {
    isPlaying = false;
    playBtn.textContent = "▶️";
  }
}

// ======= Drag/Touch Scrub =======
function scrubAudio(e) {
  const rect = progressContainerEl.getBoundingClientRect();
  let x = e.clientX - rect.left;
  x = Math.max(0, Math.min(rect.width, x));

  // RTL: invert x
  const percent = 1 - x / rect.width;
  audioElement.currentTime = percent * audioElement.duration;

  progressEl.style.width = (percent * 100) + "%";
  currentTimeDisplayEl.textContent = audioElement.currentTime.toFixed(2) + " s";
}

// Mouse events
progressContainerEl.addEventListener("mousedown", (e) => {
  if (!audioElement.src || !audioElement.duration) return;
  isDragging = true;
  scrubAudio(e);
});

document.addEventListener("mousemove", (e) => {
  if (isDragging) scrubAudio(e);
});

document.addEventListener("mouseup", () => {
  isDragging = false;
});

// Touch events
progressContainerEl.addEventListener("touchstart", (e) => {
  if (!audioElement.src || !audioElement.duration) return;
  isDragging = true;
  scrubAudio(e.touches[0]);
  e.preventDefault();
});

progressContainerEl.addEventListener("touchmove", (e) => {
  if (isDragging) {
    scrubAudio(e.touches[0]);
    e.preventDefault();
  }
});

document.addEventListener("touchend", () => {
  isDragging = false;
});

// Update progress during playback
audioElement.addEventListener("timeupdate", () => {
  if (!isDragging) {
    const percent = audioElement.currentTime / audioElement.duration;
    progressEl.style.width = (percent * 100) + "%";
    currentTimeDisplayEl.textContent = audioElement.currentTime.toFixed(2) + " s";
  }
});

/* =========================
   Syllables Logic (Optimized)
========================= */

// Syllable mapping dictionary (expandable)
const syllableMap = {
  "فقت": 2, "اليوم": 3, "الصبح": 2, "الساعة": 3, "ستة": 2, "أي": 1, "كتير": 2, "بكير": 2,
  "شو": 1, "عملت": 2, "قهوة": 2, "بعدين": 2, "شربت": 2, "القهوة": 3, "عل":1, "الدرج":2,
  "احيانا":3, "بقعد":2, "على":2, "نفسه":2, "وبشربها":3, "بعد":1, "ما":1, "درست":2,
  "شوي":1, "انكليزي":3, "من":1, "كتاب":2, "حلو":2, "سمعت":2, "الصوتيات":3, "الخاصة":3,
  "بالكتاب":3, "واشتغلت":4, "قواعد":2, "وغرامر":3, "اخد":2, "معي":2, "الموضوع":3,
  "شي":1, "ساعتين":2, "بعدها":2, "فطور":2, "اكلت":2, "بيض":1, "وجبنة":3, "تستوي":2,
  "بحط":2, "بطفي":2, "تحت":2, "بتركهن":3, "لحتى":3, "تدوب":2, "مكدوس":2, "جنبهن":2,
  "خيارة":3
};

// Regex for Arabic vowels (including diacritics)
const vowels = /[اويًٌٍَُِْ]/g;

// Normalize words: remove punctuation and extra spaces
function normalizeWord(word) {
  return word.replace(/[.,!?؛:]/g,'').trim();
}

// Estimate syllables for unknown words
function estimateSyllables(word) {
  word = normalizeWord(word);
  const match = word.match(vowels);
  // If no vowels, estimate at least 1 syllable based on length
  return match ? match.length : Math.max(1, Math.ceil(word.length/3));
}

// Analyze text sample for syllables, stutter events, and durations
function analyzeText(text, textId) {
  const regex = /\(([^)]+)\)/g;
  let matches;
  const uniqueEvents = new Set();
  const durations = [];
  let totalSyllables = 0;
  let totalWords = 0;

  // One-pass parsing
  let cursor = 0;
  while (cursor < text.length) {
    regex.lastIndex = cursor;
    matches = regex.exec(text);
    
    if (matches && matches.index === cursor) {
      // Handle (word duration)
      const parts = matches[1].trim().split(' ');
      const word = normalizeWord(parts[0]);
      const dur = parseFloat(parts[1] || 0);

      uniqueEvents.add(word);
      durations.push(dur);
      totalSyllables += syllableMap[word] || estimateSyllables(word);
      totalWords++;

      cursor = regex.lastIndex;
    } else {
      // Handle plain words outside parentheses
      const nextParen = matches ? matches.index : text.length;
      const segment = text.slice(cursor, nextParen).split(/\s+/).filter(Boolean);
      segment.forEach(w => {
        const word = normalizeWord(w);
        totalSyllables += syllableMap[word] || estimateSyllables(word);
        totalWords++;
      });
      cursor = nextParen;
    }
  }

  return { stutterEvents: uniqueEvents.size, totalSyllables, totalWords, durations };
}

// Compute mean of array
function mean(arr) {
  if(arr.length === 0) return 0;
  return arr.reduce((a,b)=>a+b,0)/arr.length;
}

/* =========================
   Frequency & Duration Logic
========================= */
// Store per-text sample type
const sampleTypes = {
  text1: 'Reader',
  text2: 'Reader'
};

// Frequency scoring tables
const frequencyTable = {
  Reader: [
    { range: [1,1], score: 2 },
    { range: [2,2], score: 3 },
    { range: [3,3], score: 4 },
    { range: [4,5], score: 5 },
    { range: [6,7], score: 6 },
    { range: [8,11], score: 7 },
    { range: [12,21], score: 8 },
    { range: [22,Infinity], score: 9 }
  ],
  Nonreader: [
    { range: [1,1], score: 4 },
    { range: [2,2], score: 6 },
    { range: [3,3], score: 8 },
    { range: [4,5], score: 10 },
    { range: [6,7], score: 12 },
    { range: [8,11], score: 14 },
    { range: [12,21], score: 16 },
    { range: [22,Infinity], score: 18 }
  ],
  "speaking / readers": [
    { range: [1,1], score: 2 },
    { range: [2,2], score: 3 },
    { range: [3,3], score: 4 },
    { range: [4,5], score: 5 },
    { range: [6,7], score: 6 },
    { range: [8,11], score: 7 },
    { range: [12,21], score: 8 },
    { range: [22,Infinity], score: 9 }
  ]
};

// Duration scoring table
const durationTable = [
  { max: 0.5, score: 2 },
  { max: 0.9, score: 4 },
  { max: 1.9, score: 6 },
  { max: 2.9, score: 8 },
  { max: 4.9, score: 10 },
  { max: 9.9, score: 12 },
  { max: 29.9, score: 14 },
  { max: 59.9, score: 16 },
  { max: Infinity, score: 18 }
];

// Select per-text sample type
function selectSampleType(textId, type, btn) {
  sampleTypes[textId] = type;
  const group = btn.parentNode;
  group.querySelectorAll('button').forEach(b => b.classList.remove('active-btn'));
  btn.classList.add('active-btn');
}

// Frequency score lookup
function getFrequencyScore(frequencyPercent, type) {
  const table = frequencyTable[type];
  const val = parseFloat(frequencyPercent);
  for(let i=0;i<table.length;i++){
    const [min,max] = table[i].range;
    if(val >= min && val <= max) return table[i].score;
  }
  return 0;
}

// Duration score lookup
function getDurationScore(avgDuration) {
  const row = durationTable.find(r => avgDuration <= r.max);
  return row ? row.score : 0;
}

// Main calculation function
function calculateFrequencyDuration() {
  const text1 = document.getElementById('text1').value;
  const text2 = document.getElementById('text2').value;

  const results = [];

  if(text1.trim()) results.push(processText(text1, 'text1'));
  if(text2.trim()) results.push(processText(text2, 'text2'));

  let combinedResult;

  if(results.length > 1){
    combinedResult = combineResults(results);
    results.push(combinedResult);
  } else if(results.length === 1){
    combinedResult = results[0];
  } else {
    combinedResult = { frequencyScore:0, durationScore:0 };
  }

  // Save globally
  window.combinedFrequencyScore = combinedResult.frequencyScore;
  window.combinedDurationScore = combinedResult.durationScore;

  // Output
  displayResults(results);

  // Update the report automatically
  updateFinalReport();
}

// Process single text sample
function processText(text, textId){
  const syllableData = analyzeText(text, textId);
  const top3 = syllableData.durations.sort((a,b)=>b-a).slice(0,3);
  const durationMean = mean(top3);
  const frequencyPercent = ((syllableData.stutterEvents / syllableData.totalSyllables)*100).toFixed(2);
  const frequencyScore = getFrequencyScore(frequencyPercent, sampleTypes[textId]);
  const durationScore = getDurationScore(durationMean);

  return {
    id: textId,
    label: textId==='text1'?'Text 1':'Text 2',
    stutterEvents: syllableData.stutterEvents,
    totalSyllables: syllableData.totalSyllables,
    totalWords: syllableData.totalWords,
    frequencyPercent,
    frequencyScore,
    durationMean,
    durationScore
  };
}

// Combine multiple results
function combineResults(results){
  const combinedType = results.some(r => sampleTypes[r.id]==='Nonreader') ? 'Nonreader' :
                       results.some(r => sampleTypes[r.id]==='speaking / readers') ? 'speaking / readers' :
                       'Reader';

  const stutterEvents = results[0].stutterEvents + results[1].stutterEvents;
  const totalSyllables = results[0].totalSyllables + results[1].totalSyllables;
  const totalWords = results[0].totalWords + results[1].totalWords;
  const durationMean = mean([results[0].durationMean, results[1].durationMean]);
  const frequencyPercent = ((stutterEvents / totalSyllables)*100).toFixed(2);
  const frequencyScore = getFrequencyScore(frequencyPercent, combinedType);
  const durationScore = getDurationScore(durationMean);

  return {
    label: 'Text 1 + Text 2',
    stutterEvents,
    totalSyllables,
    totalWords,
    frequencyPercent,
    frequencyScore,
    durationMean,
    durationScore
  };
}

// Display results in output div
function displayResults(results){
  let output = '';
  results.forEach(res => {
    output += `${res.label}:\n`;
    output += `Total Syllables = ${res.totalSyllables}\n`;
    output += `Total Words = ${res.totalWords}\n`;
    output += `Frequency Percentage = ${res.frequencyPercent}%\n`;
    output += `Frequency Score = ${res.frequencyScore}\n`;
    output += `Mean Duration = ${res.durationMean ? res.durationMean.toFixed(2) : 0} sec\n`;
    output += `Duration Score = ${res.durationScore}\n\n`;
  });

  const resultsDiv = document.getElementById('results');
  resultsDiv.style.display = 'block';
  document.getElementById('results-output').textContent = output;
}


/* =========================
   Physical Concomitants Logic
========================= */

// store multiple types per category
const physicalData = {
  "Distracting Sounds": { types: [], score: 0 },
  "Facial Grimaces": { types: [], score: 0 },
  "Head Movements": { types: [], score: 0 },
  "Movements of the Extremities": { types: [], score: 0 }
};

// toggle type selection
function selectType(category, type) {
  const index = physicalData[category].types.indexOf(type);
  if (index === -1) {
    physicalData[category].types.push(type);
  } else {
    physicalData[category].types.splice(index, 1);
  }
  updateButtonState(category, type);
  updatePhysicalResults();
}

// handle custom type input
function promptOther(category) {
  const custom = prompt("Enter custom type for " + category + ":");
  if (custom) {
    physicalData[category].types.push(custom);
    updatePhysicalResults();
    // optionally create a button for the custom type visually
  }
}

// set rating (single score per category)
function setScore(category, score) {
  physicalData[category].score = score;
  updateRatingButtons(category, score);
  updatePhysicalResults();
}

// visual toggle for type buttons
function updateButtonState(category, type) {
  document.querySelectorAll(`#physical-concomitants .physical-item[data-category="${category}"] .type-buttons button`)
    .forEach(btn => {
      if (btn.textContent === type) btn.classList.toggle('selected');
    });
}

// visual toggle for rating buttons
function updateRatingButtons(category, score) {
  document.querySelectorAll(`#physical-concomitants .physical-item[data-category="${category}"] .rating button`)
    .forEach(btn => {
      if (parseInt(btn.textContent) === score) {
        btn.classList.add('selected');
      } else {
        btn.classList.remove('selected');
      }
    });
}

// update results output
function updatePhysicalResults() {
  let output = "Physical Concomitants\n";
  let total = 0;
  for (const [cat, data] of Object.entries(physicalData)) {
    output += `${cat}: ${data.types.join(", ")} = ${data.score}\n`;
    total += data.score;
  }
  output += `Physical Concomitants score = ${total}`;
  
  document.getElementById("physical-results").style.display = "block";
  document.getElementById("physical-output").textContent = output;
}

// ---------------------------
// Info Button Pop-up Logic
// ---------------------------
const infoMessages = {
  page: "This checklist evaluates auditory skills in children and adults. Use it to record observations and measure frequency, duration, and naturalness of speech.",
  resources: "This section lists all available resources. Click a resource button to view or download the corresponding item.",
  frequency: "Paste speech or reading samples here to calculate frequency and duration measures. Select sample type and click calculate.",
  physical: "Only observable phenomena associated with the stuttering should be scored. General behavior such as restlessness is not rated.",
  naturalness: "immediately after scoring the speaking sample. Speech naturalness refers to the degree to which the speaker sounds like most normal speakers of the same gen- der, age, and dialect. You should base this judgment on the following scale: 1 = highly natural sounding speech; 9 = highly unnatural sounding speech"
};

// Show info box
function showTestInfo(key) {
  const boxId = `info-box-${key}`;
  const box = document.getElementById(boxId);
  if (!box) return;

  // Set message dynamically if needed
  const p = box.querySelector("p");
  if (p && infoMessages[key]) p.textContent = infoMessages[key];

  // Show with animation
  box.classList.remove("hidden");
  box.classList.add("fade-in");
  box.classList.remove("fade-out");
}

// Close info box
function closeInfoBox(key) {
  const boxId = `info-box-${key}`;
  const box = document.getElementById(boxId);
  if (!box) return;

  // Animate out
  box.classList.remove("fade-in");
  box.classList.add("fade-out");
  setTimeout(() => {
    box.classList.add("hidden");
  }, 250); // Match animation duration
}

// Optional: close any open boxes if clicking outside
document.addEventListener("click", function (e) {
  const openBoxes = document.querySelectorAll(".info-box:not(.hidden)");
  openBoxes.forEach(box => {
    if (!box.contains(e.target) && !e.target.classList.contains("btn-info")) {
      closeInfoBox(box.id.replace("info-box-",""));
    }
  });
});


// ---------------------------
// naturalnessScale Logic
// --------------------------
  const naturalnessScale = document.getElementById('naturalnessScale');
  const naturalnessValue = document.getElementById('naturalnessValue');

  function updateNaturalnessValue() {
    naturalnessValue.textContent = naturalnessScale.value;
  }

  naturalnessScale.addEventListener('input', updateNaturalnessValue);
  // Initialize display
  updateNaturalnessValue();

// ======= Severity Tables =======
const severityTables = {
  "Preschool": [
    { range:[0,8], percentile:"1-4", severity:"Very mild" },
    { range:[9,10], percentile:"5-11", severity:"Very mild" },
    { range:[11,12], percentile:"12-23", severity:"Mild" },
    { range:[13,16], percentile:"24-40", severity:"Mild" },
    { range:[17,23], percentile:"41-60", severity:"Moderate" },
    { range:[24,26], percentile:"61-77", severity:"Moderate" },
    { range:[27,28], percentile:"78-88", severity:"Severe" },
    { range:[29,31], percentile:"89-95", severity:"Severe" },
    { range:[32,Infinity], percentile:"96-99", severity:"Very severe" }
  ],
  "School Age": [
    { range:[6,8], percentile:"1-4", severity:"Very mild" },
    { range:[9,10], percentile:"5-11", severity:"Very mild" },
    { range:[11,15], percentile:"12-23", severity:"Mild" },
    { range:[16,20], percentile:"24-40", severity:"Mild" },
    { range:[21,23], percentile:"41-60", severity:"Moderate" },
    { range:[24,27], percentile:"61-77", severity:"Moderate" },
    { range:[28,31], percentile:"78-88", severity:"Severe" },
    { range:[32,35], percentile:"89-95", severity:"Severe" },
    { range:[36,Infinity], percentile:"96-99", severity:"Very severe" }
  ],
  "Adult": [
    { range:[10,12], percentile:"1-4", severity:"Very mild" },
    { range:[13,17], percentile:"5-11", severity:"Very mild" },
    { range:[18,20], percentile:"12-23", severity:"Mild" },
    { range:[21,24], percentile:"24-40", severity:"Mild" },
    { range:[25,27], percentile:"41-60", severity:"Moderate" },
    { range:[28,31], percentile:"61-77", severity:"Moderate" },
    { range:[32,34], percentile:"78-88", severity:"Severe" },
    { range:[35,36], percentile:"89-95", severity:"Severe" },
    { range:[37,46], percentile:"96-99", severity:"Very severe" }
  ]
};
// ======= Global category tracker =======
let currentCategory = "Preschool"; // default selection

// ======= Category Button Handler =======
function selectOption(field, value, btn) {
  if(field === "category") {
    currentCategory = value; // update selected category
  }

  // update button styles
  const group = btn.parentNode;
  group.querySelectorAll('button').forEach(b => b.classList.remove('active-btn'));
  btn.classList.add('active-btn');

  // auto-update report
  updateFinalReport();
}

// ======= Update Final Report Automatically =======
function updateFinalReport() {
  const category = currentCategory; // use selected button
  const frequency = window.combinedFrequencyScore || 0;
  const duration = window.combinedDurationScore || 0;

  // Physical concomitants
  let physicalScore = 0;
  let physicalText = "";
  for (const [cat, data] of Object.entries(physicalData || {})) {
    physicalScore += data.score || 0;
    if (data.types && data.types.length) physicalText += `${cat}: ${data.types.join(", ")} = ${data.score}\n`;
  }

  const totalScore = frequency + duration + physicalScore;

  // Determine percentile & severity
  let percentile = "N/A", severity = "N/A";
  const table = severityTables[category];
  if(table) {
    for (let row of table) {
      if (totalScore >= row.range[0] && totalScore <= row.range[1]) {
        percentile = row.percentile;
        severity = row.severity;
        break;
      }
    }
  }

  const reportContent = `
Identifying Information
Name: ${document.getElementById("name")?.value || ""}
Grade: ${document.getElementById("grade")?.value || ""}
School: ${document.getElementById("school")?.value || ""}
DOB: ${document.getElementById("dob")?.value || ""}
Age: ${document.getElementById("age")?.value || ""}
Category: ${category}
Gender: ${document.getElementById("gender")?.value || ""}
Examiner: ${document.getElementById("examiner")?.value || ""}
Reader: ${document.getElementById("reader")?.value || ""}

Frequency & Duration Results
Frequency Score = ${frequency}
Duration Score = ${duration}

Physical Concomitants
${physicalText || "None selected"}
Physical Score = ${physicalScore}

Speech Naturalness
Scale Value = ${document.getElementById("naturalnessScale")?.value || ""}
Notes = ${document.getElementById("naturalnessNotes")?.value || ""}

Total Score = ${totalScore}
Percentile = ${percentile}
Severity = ${severity}
`;

  document.getElementById("report").value = reportContent;
}

// ======= Auto-update triggers =======

// Frequency/duration recalculation triggers report update
document.getElementById("text1")?.addEventListener("input", calculateFrequencyDuration);
document.getElementById("text2")?.addEventListener("input", calculateFrequencyDuration);

// Physical concomitants buttons
document.querySelectorAll(`#physical-concomitants button`).forEach(btn => btn.addEventListener("click", updateFinalReport));

// Naturalness slider
document.getElementById("naturalnessScale")?.addEventListener("input", updateFinalReport);

// ======= Download Report =======
function downloadReport() {
  const content = document.getElementById("report")?.value || "";
  if (!content) return alert("Report is empty!");
  const blob = new Blob([content], {type:"text/plain"});
  const link = document.createElement("a");
  link.href = URL.createObjectURL(blob);
  link.download = "report.txt";
  link.click();
}
