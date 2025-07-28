// ====== CORE APPLICATION ======
const RESOURCE_FILES = { en: "en.json", ar: "ar.json" };
let currentLang = "en";
let translations = {};
let timers = {}; // Object to hold timer states

// DOM elements
const langToggleEl = document.getElementById('lang-toggle');
const exportBtnEl = document.getElementById('export-btn');
const analyzeBtn = document.getElementById('analyze-btn');
const pediatricTasksBody = document.getElementById('pediatric-tasks-body');
const olderTasksBody = document.getElementById('older-tasks-body');
const resultsContent = document.getElementById('results-content');

// Normative Data
const PEDIATRIC_NORMS = {
  3: { p: { mean: 2.9, sd: 0.6 }, t: { mean: 2.9, sd: 0.6 }, k: { mean: 2.7, sd: 0.6 }, ptk: { mean: 1.8, sd: 0.4 } },
  4: { p: { mean: 3.5, sd: 0.7 }, t: { mean: 3.5, sd: 0.7 }, k: { mean: 3.3, sd: 0.7 }, ptk: { mean: 2.3, sd: 0.5 } },
  5: { p: { mean: 4.0, sd: 0.8 }, t: { mean: 4.0, sd: 0.8 }, k: { mean: 3.8, sd: 0.8 }, ptk: { mean: 2.7, sd: 0.6 } },
  6: { p: { mean: 4.5, sd: 0.9 }, t: { mean: 4.5, sd: 0.9 }, k: { mean: 4.3, sd: 0.9 }, ptk: { mean: 3.1, sd: 0.7 } }
};

const OLDER_NORMS = {
  6: { p: { mean: 5.8, sd: 1.0 }, t: { mean: 5.9, sd: 1.0 }, k: { mean: 6.5, sd: 1.0 }, ptk: { mean: 10.3, sd: 1.2 } },
  7: { p: { mean: 5.3, sd: 1.0 }, t: { mean: 5.4, sd: 1.0 }, k: { mean: 6.0, sd: 1.0 }, ptk: { mean: 9.8, sd: 1.1 } },
  8: { p: { mean: 5.0, sd: 0.9 }, t: { mean: 5.1, sd: 0.9 }, k: { mean: 5.7, sd: 0.9 }, ptk: { mean: 9.2, sd: 1.0 } },
  9: { p: { mean: 4.7, sd: 0.9 }, t: { mean: 4.8, sd: 0.9 }, k: { mean: 5.3, sd: 0.9 }, ptk: { mean: 8.7, sd: 0.9 } },
  10: { p: { mean: 4.5, sd: 0.9 }, t: { mean: 4.6, sd: 0.9 }, k: { mean: 5.0, sd: 0.9 }, ptk: { mean: 8.4, sd: 0.9 } },
  11: { p: { mean: 4.3, sd: 0.9 }, t: { mean: 4.4, sd: 0.9 }, k: { mean: 4.8, sd: 0.9 }, ptk: { mean: 8.1, sd: 0.8 } },
  12: { p: { mean: 4.1, sd: 0.9 }, t: { mean: 4.2, sd: 0.9 }, k: { mean: 4.6, sd: 0.9 }, ptk: { mean: 7.8, sd: 0.8 } },
  13: { p: { mean: 4.0, sd: 0.9 }, t: { mean: 4.1, sd: 0.9 }, k: { mean: 4.5, sd: 0.9 }, ptk: { mean: 7.5, sd: 0.7 } }
};

// Task definitions
const PEDIATRIC_TASKS = [
  { id: 'p', syllable: '/pʌ/', repetitions: null, type: 'ped' },
  { id: 't', syllable: '/tʌ/', repetitions: null, type: 'ped' },
  { id: 'k', syllable: '/kʌ/', repetitions: null, type: 'ped' },
  { id: 'ptk', syllable: '/pʌtʌkʌ/', repetitions: null, type: 'ped' }
];

const OLDER_TASKS = [
  { id: 'p', syllable: '/pʌ/', repetitions: 20, type: 'older' },
  { id: 't', syllable: '/tʌ/', repetitions: 20, type: 'older' },
  { id: 'k', syllable: '/kʌ/', repetitions: 20, type: 'older' },
  { id: 'ptk', syllable: '/pʌtʌkʌ/', repetitions: 10, type: 'older' }
];

// ====== LANGUAGE HANDLER ======
async function setLanguage(lang) {
  currentLang = lang;
  const response = await fetch(RESOURCE_FILES[lang]);
  translations = await response.json();
  
  document.documentElement.lang = lang;
  document.documentElement.dir = lang === 'ar' ? 'rtl' : 'ltr';
  
  document.querySelectorAll('[data-i18n]').forEach(element => {
    const key = element.dataset.i18n;
    if (translations[key]) {
      // For buttons, we might need to adjust the text content differently
      if (element.tagName === 'BUTTON') {
        const icon = element.querySelector('i');
        element.textContent = translations[key];
        if (icon) {
          element.prepend(icon, ' ');
        }
      } else {
        element.textContent = translations[key];
      }
    }
  });
  
  // Update placeholders
  document.querySelectorAll('[placeholder]').forEach(element => {
    const key = element.id;
    if (translations[`${key}-placeholder`]) {
      element.placeholder = translations[`${key}-placeholder`];
    }
  });

  // Update button text for stopwatches
  document.querySelectorAll('.stopwatch-btn').forEach(btn => {
    const taskId = btn.dataset.taskId;
    if (timers[taskId] && timers[taskId].running) {
      btn.textContent = translations['btn-stop'];
    } else {
      btn.textContent = translations['btn-start'];
    }
  });
}

function toggleLanguage() {
  const newLang = langToggleEl.checked ? 'ar' : 'en';
  setLanguage(newLang);
}

// ====== INITIALIZATION ======
function initApp() {
  setupTabs();
  buildTaskTables();
  initFramework();
  setLanguage('en'); // Set default language
}

// Set up tab navigation
function setupTabs() {
  const tabs = document.querySelectorAll('.tab');
  tabs.forEach(tab => {
    tab.addEventListener('click', () => {
      tabs.forEach(t => t.classList.remove('active'));
      document.querySelectorAll('.tab-content').forEach(c => c.classList.remove('active'));
      tab.classList.add('active');
      document.getElementById(`${tab.dataset.tab}-tab`).classList.add('active');
    });
  });
}

// Build task tables
function buildTaskTables() {
  const createTaskRow = (task) => {
    const taskId = `${task.type}-${task.id}`;
    const row = document.createElement('tr');
    row.id = `row-${taskId}`;
    row.className = 'task-row';
    row.innerHTML = `
      <td class="syllable-display">${task.syllable}</td>
      <td class="reps-display">
        ${task.repetitions ? task.repetitions : '<input type="number" id="reps-' + taskId + '" min="1" class="reps-input" placeholder="Count">'}
      </td>
      <td>
        <button type="button" class="stopwatch-btn" data-task-id="${taskId}" data-i18n="btn-start">Start</button>
      </td>
      <td>
        <input type="number" id="seconds-${taskId}" min="0" step="0.01" class="seconds-input" placeholder="Time">
      </td>
      <td id="feedback-${taskId}" class="feedback"></td>
    `;
    return row;
  };

  PEDIATRIC_TASKS.forEach(task => pediatricTasksBody.appendChild(createTaskRow(task)));
  OLDER_TASKS.forEach(task => olderTasksBody.appendChild(createTaskRow(task)));
}

// Stopwatch handler
function handleStopwatch(event) {
  const button = event.target;
  const taskId = button.dataset.taskId;

  if (!timers[taskId] || !timers[taskId].running) {
    // Start timer
    timers[taskId] = {
      startTime: Date.now(),
      intervalId: setInterval(() => {
        const elapsedTime = ((Date.now() - timers[taskId].startTime) / 1000).toFixed(2);
        document.getElementById(`seconds-${taskId}`).value = elapsedTime;
      }, 100),
      running: true
    };
    button.textContent = translations['btn-stop'] || 'Stop';
    button.classList.add('running');
  } else {
    // Stop timer
    clearInterval(timers[taskId].intervalId);
    const elapsedTime = ((Date.now() - timers[taskId].startTime) / 1000).toFixed(2);
    const secondsInput = document.getElementById(`seconds-${taskId}`);
    secondsInput.value = elapsedTime;
    secondsInput.dispatchEvent(new Event('change')); // Trigger feedback calculation
    timers[taskId].running = false;
    button.textContent = translations['btn-start'] || 'Start';
    button.classList.remove('running');
  }
}

// Generate feedback for a task
function calculateFeedback(taskId) {
  const ageInput = document.getElementById('client-age');
  const age = parseInt(ageInput.value);
  const secondsInput = document.getElementById(`seconds-${taskId}`);
  const repsInput = document.getElementById(`reps-${taskId}`);
  const feedbackEl = document.getElementById(`feedback-${taskId}`);
  
  if (!age || !secondsInput.value || (repsInput && !repsInput.value)) {
      feedbackEl.textContent = '';
      feedbackEl.className = 'feedback';
      return;
  }
  
  const seconds = parseFloat(secondsInput.value);
  const taskType = taskId.split('-')[0];
  const syllable = taskId.split('-')[1];
  
  let norm, value, unit, isAbnormal, rate;
  
  if (taskType === 'ped') {
    const reps = parseInt(repsInput.value);
    if (!reps) return;
    rate = reps / seconds;
    value = rate.toFixed(2);
    unit = "rps";
    const normAge = Math.min(Math.max(age, 3), 6);
    norm = PEDIATRIC_NORMS[normAge][syllable];
    isAbnormal = Math.abs(rate - norm.mean) > norm.sd;
  } else {
    value = seconds.toFixed(2);
    unit = "sec";
    const normAge = Math.min(Math.max(age, 6), 13);
    norm = OLDER_NORMS[normAge][syllable];
    isAbnormal = Math.abs(seconds - norm.mean) > norm.sd;
  }
  
  const feedbackKey = isAbnormal ? 'feedback-abnormal' : 'feedback-normal';
  feedbackEl.textContent = `${translations[feedbackKey] || ''} (${value} ${unit})`;
  feedbackEl.className = `feedback ${isAbnormal ? 'feedback-abnormal' : 'feedback-normal'}`;
}

// Generate clinical summary
function generateSummary() {
  const summaryEl = document.getElementById('summary-text');
  if (!summaryEl) return;
  
  const name = document.getElementById('client-name').value || "[Client Name]";
  const age = document.getElementById('client-age').value || "[Age]";
  const examiner = document.getElementById('examiner-name').value || "[Examiner]";
  const date = document.getElementById('assessment-date').value || "[Date]";
  
  let summary = `Diadochokinetic Syllable Rates Assessment Results\n\n`;
  summary += `Client: ${name}\n`;
  summary += `Age: ${age}\n`;
  summary += `Examiner: ${examiner}\n`;
  summary += `Date: ${date}\n\n`;
  
  let hasAbnormal = false;
  document.querySelectorAll('.task-row').forEach(row => {
    const taskId = row.id.replace('row-', '');
    const syllableEl = row.querySelector('.syllable-display');
    const secondsInput = document.getElementById(`seconds-${taskId}`);
    const repsEl = row.querySelector('.reps-display');
    const feedbackEl = document.getElementById(`feedback-${taskId}`);
    
    if (secondsInput && secondsInput.value) {
      const syllable = syllableEl.textContent;
      const reps = repsEl.querySelector('input') ? repsEl.querySelector('input').value : repsEl.textContent.trim();
      const seconds = secondsInput.value;
      const feedback = feedbackEl.textContent;
      if (feedbackEl.classList.contains('feedback-abnormal')) hasAbnormal = true;
      
      summary += `• ${syllable}: ${reps} repetitions in ${seconds} seconds - ${feedback}\n`;
    }
  });
  
  summary += `\nClinical Interpretation:\n`;
  summary += `Based on the assessment results, ${name} demonstrates ${hasAbnormal ? 'potential oral motor difficulties' : 'age-appropriate diadochokinetic rates'}.\n`;
  summary += `Further evaluation may be warranted to assess oral motor planning and coordination skills.\n\n`;
  summary += `Recommendations:\n`;
  summary += `1. Consider comprehensive oral motor examination\n`;
  summary += `2. Evaluate for possible apraxia of speech\n`;
  summary += `3. Monitor progress with follow-up assessments\n`;
  
  summaryEl.value = summary;
}

// Generate results display
function generateResults() {
  const name = document.getElementById('client-name').value || "Client";
  const age = document.getElementById('client-age').value || "N/A";
  const date = document.getElementById('assessment-date').value || "N/A";
  
  let hasAbnormal = !!document.querySelector('.feedback-abnormal');
  
  let resultsHTML = `
    <div class="result-item">
      <div class="result-label">Client Name:</div>
      <div class="result-value">${name}</div>
    </div>
    <div class="result-item">
      <div class="result-label">Age:</div>
      <div class="result-value">${age} years</div>
    </div>
    <div class="result-item">
      <div class="result-label">Assessment Date:</div>
      <div class="result-value">${date}</div>
    </div>
    <div class="result-item">
      <div class="result-label">Overall Result:</div>
      <div class="result-value">
        <strong>${hasAbnormal ? 'Potential Oral Motor Difficulties' : 'Normal Diadochokinetic Rates'}</strong>
      </div>
    </div>
    <div class="results-header" style="margin-top: 30px;">Task Results</div>
  `;
  
  document.querySelectorAll('.task-row').forEach(row => {
    const taskId = row.id.replace('row-', '');
    const secondsInput = document.getElementById(`seconds-${taskId}`);
    
    if (secondsInput && secondsInput.value) {
      const syllable = row.querySelector('.syllable-display').textContent;
      const repsEl = row.querySelector('.reps-display');
      const reps = repsEl.querySelector('input') ? repsEl.querySelector('input').value : repsEl.textContent.trim();
      const feedbackEl = document.getElementById(`feedback-${taskId}`);
      const feedback = feedbackEl.textContent;
      const isAbnormal = feedbackEl.classList.contains('feedback-abnormal');
      
      resultsHTML += `
        <div class="result-item">
          <div class="result-label">${syllable}:</div>
          <div class="result-value">
            ${reps} repetitions in ${secondsInput.value} seconds
            <span class="${isAbnormal ? 'feedback-abnormal' : 'feedback-normal'}" style="margin-left: 10px;">
              <i class="fas ${isAbnormal ? 'fa-exclamation-circle' : 'fa-check-circle'}"></i>
              ${feedback}
            </span>
          </div>
        </div>
      `;
    }
  });
  
  const summary = document.getElementById('summary-text').value || "";
  resultsHTML += `
    <div class="results-header" style="margin-top: 30px;">Clinical Summary</div>
    <div class="result-item">
      <div class="result-value" style="white-space: pre-wrap; padding: 15px; background: #f8fafc; border-radius: 8px; line-height: 1.6;">
        ${summary}
      </div>
    </div>
  `;
  
  resultsContent.innerHTML = resultsHTML;
}

// Export data as TXT
function exportFormData() {
  const name = document.getElementById('client-name').value || "unknown";
  const formTitle = "Diadochokinetic_Assessment";
  
  let data = `${formTitle}\n`;
  data += `Assessment ID: DDK_${name}_${Date.now()}\n\n`;
  
  data += `Basic Information:\n`;
  data += `Name: ${document.getElementById('client-name').value || ''}\n`;
  data += `Age: ${document.getElementById('client-age').value || ''}\n`;
  data += `Date: ${document.getElementById('assessment-date').value || ''}\n`;
  data += `Examiner: ${document.getElementById('examiner-name').value || ''}\n\n`;
  
  data += `Task Measurements:\n`;
  document.querySelectorAll('.task-row').forEach(row => {
    const secondsInput = row.querySelector('.seconds-input');
    if (secondsInput && secondsInput.value) {
      const syllable = row.querySelector('.syllable-display').textContent.trim();
      const repsEl = row.querySelector('.reps-display');
      const reps = repsEl.querySelector('input') ? repsEl.querySelector('input').value : repsEl.textContent.trim();
      const feedback = row.querySelector('.feedback').textContent;
      data += `• ${syllable}: ${reps} reps, ${secondsInput.value} seconds - ${feedback}\n`;
    }
  });
  
  data += `\nSummary:\n${document.getElementById('summary-text').value || ''}`;
  
  const blob = new Blob([data], { type: 'text/plain;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `${formTitle.replace(/\s+/g, '_')}_${name}.txt`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

// Initialize framework
function initFramework() {
  langToggleEl.addEventListener('change', toggleLanguage);
  exportBtnEl.addEventListener('click', exportFormData);
  analyzeBtn.addEventListener('click', () => {
    generateSummary();
    generateResults();
    document.querySelector('.tab[data-tab="results"]').click();
  });

  const handleInteraction = (event) => {
    const target = event.target;
    if (target.classList.contains('stopwatch-btn')) {
      handleStopwatch(event);
    } else if (target.classList.contains('seconds-input') || target.classList.contains('reps-input')) {
      const row = target.closest('.task-row');
      if (row) {
        calculateFeedback(row.id.replace('row-', ''));
      }
    }
  };

  pediatricTasksBody.addEventListener('click', handleInteraction);
  olderTasksBody.addEventListener('click', handleInteraction);
  pediatricTasksBody.addEventListener('change', handleInteraction);
  olderTasksBody.addEventListener('change', handleInteraction);

  document.getElementById('client-age').addEventListener('change', () => {
    document.querySelectorAll('.task-row').forEach(row => {
      const taskId = row.id.replace('row-', '');
      if (document.getElementById(`seconds-${taskId}`).value) {
        calculateFeedback(taskId);
      }
    });
  });
}

// Initialize the app when the DOM is loaded
window.addEventListener('DOMContentLoaded', initApp);