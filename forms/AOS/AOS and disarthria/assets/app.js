/* Acquired AOS assessment: native controls, bilingual UI, private drafts and reports. */
(function () {
  'use strict';
  const { sections, sources, pair } = window.AOSData;
  const M = window.AOSModel;
  const T = window.AOSTasks;
  const $ = id => document.getElementById(id);
  const KEY = 'aghanem-acquired-aos-v1';
  const initialAnswers = () => ({ assessmentDate: M.today(), examiner: 'Ahmad Ghanem', trials: [] });
  let answers = initialAnswers(), lang = 0, step = 0, storageEnabled = false, storedDraft = false, dirty = false;
  let saveState = '', messageState = '', clearFailed = false;
  let removedTrial = null;
  const openNotes = new Set(), fieldMap = new Map(M.fields.map(field => [field.id, field]));
  const t = labels => labels[lang];
  const translations = {
    skipLink: pair('Skip to form', 'الانتقال إلى النموذج'),
    branding: pair('Ahmad Ghanem · Speech and Language Pathology', 'أحمد غانم · اختصاص النطق واللغة'),
    appTitle: pair('Acquired AOS assessment', 'تقييم تعذر الأداء النطقي المكتسب'),
    subtitle: pair('Adult motor speech assessment · Clinical observations', 'تقييم الكلام الحركي للبالغين · الملاحظات السريرية'),
    previous: pair('← Previous', 'السابق →'), next: pair('Next →', '← التالي'), review: pair('Review & export report', 'مراجعة وتصدير التقرير'),
    rememberLabel: pair('Save draft on this device', 'حفظ المسودة على هذا الجهاز'),
    privacyText: pair('Saving is off by default. Answers stay in this browser and are not sent to a server. Enable saving only on a private device; clear the draft after use.', 'الحفظ معطل افتراضياً. تبقى الإجابات في هذا المتصفح ولا تُرسل إلى خادم. فعّل الحفظ على جهاز خاص فقط وامسح المسودة بعد الاستخدام.'),
    clear: pair('New / clear form', 'جديد / مسح النموذج'), reportTitle: pair('Review & export', 'المراجعة والتصدير'), closeReport: pair('Close', 'إغلاق'),
    exportHelp: pair('Review the report before exporting. PDF opens the browser print dialog; choose Save as PDF. On iPad, use the print preview’s Share option to save to Files. You can also select both languages below.', 'راجع التقرير قبل تصديره. يفتح خيار PDF نافذة الطباعة؛ اختر حفظ كـ PDF. على آيباد استخدم خيار المشاركة في معاينة الطباعة للحفظ في الملفات. ويمكنك اختيار اللغتين أدناه.'),
    pdfExport: pair('Print / Save as PDF', 'طباعة / حفظ كـ PDF'), textExport: pair('Download text (.txt)', 'تنزيل نص (.txt)'),
    bilingualLabel: pair('Bilingual report (English + Arabic)', 'تقرير باللغتين (العربية + الإنجليزية)'), emptyLabel: pair('Include unanswered fields', 'تضمين الحقول غير المجاب عنها'),
    referencesLabel: pair('Include research references', 'تضمين المراجع البحثية'),
    relatedTitle: pair('Related assessments', 'التقييمات المرتبطة'), adultLink: pair('Adult case history', 'تاريخ حالة البالغين'), oralLink: pair('Oral motor examination', 'فحص الوظائف الحركية الفموية'), ddkLink: pair('DDK recording / analysis', 'تسجيل / تحليل DDK'),
    clearTitle: pair('Start a new assessment?', 'بدء تقييم جديد؟'), clearHelp: pair('This clears all current answers and samples, and this form’s saved draft on this device. Export the report first if needed.', 'يمسح هذا جميع الإجابات والعينات الحالية والمسودة المحفوظة لهذا النموذج على الجهاز. صدّر التقرير أولاً إذا كنت تحتاجه.'),
    cancelClear: pair('Cancel', 'إلغاء'), confirmClear: pair('Clear form', 'مسح النموذج'),
    footerProfession: pair('SPEECH AND LANGUAGE PATHOLOGY', 'اختصاص النطق واللغة'), footerName: pair('Ahmad Ghanem', 'أحمد غانم'), footerLocation: pair('Latakia - Syria', 'اللاذقية - سوريا')
  };
  const messages = {
    restored: pair('Saved draft restored on this device.', 'استُعيدت المسودة المحفوظة على هذا الجهاز.'),
    saved: pair('Draft saved on this device.', 'حُفظت المسودة على هذا الجهاز.'),
    saveError: pair('Draft could not be saved. Keep this tab open or export the report.', 'تعذر حفظ المسودة. أبقِ هذه النافذة مفتوحة أو صدّر التقرير.'),
    removed: pair('Saved draft removed. Current answers remain open.', 'حُذفت المسودة المحفوظة. تبقى الإجابات الحالية مفتوحة.'),
    removeError: pair('The saved draft could not be removed. Saving remains enabled; clear browser site data to remove it.', 'تعذر حذف المسودة المحفوظة. يبقى الحفظ مفعلاً؛ امسح بيانات الموقع في المتصفح لحذفها.'),
    restoreError: pair('A saved draft could not be restored. Current answers are still usable; saving is off.', 'تعذر استعادة مسودة محفوظة. يمكنك تعبئة النموذج الحالي؛ الحفظ معطل.'),
    dates: pair('Correct the highlighted date or sample measurement before exporting the report.', 'صحح التاريخ أو قياس العينة المحدد قبل تصدير التقرير.'),
    clearError: pair('The saved draft could not be removed. Export your report and clear this site’s browser data before starting a new case.', 'تعذر حذف المسودة المحفوظة. صدّر تقريرك وامسح بيانات هذا الموقع في المتصفح قبل بدء حالة جديدة.')
  };
  try {
    const raw = localStorage.getItem(KEY);
    if (raw) {
      storedDraft = true;
      const saved = JSON.parse(raw);
      if (saved.version !== 1 || !saved.answers || typeof saved.answers !== 'object' || Array.isArray(saved.answers)) throw new Error('Unsupported draft');
      // Defaults are for a new case only. A deliberately blank saved date stays blank.
      answers = M.sanitizeAnswers(saved.answers);
      lang = saved.lang === 1 ? 1 : 0;
      step = Number.isInteger(saved.step) && saved.step >= 0 && saved.step < sections.length ? saved.step : 0;
      storageEnabled = true;
      saveState = 'restored';
    }
  } catch { saveState = 'restoreError'; }
  // An explicit entry-language link takes precedence over the restored UI language.
  const entryLanguage = new URLSearchParams(location.search).get('lang');
  if (entryLanguage === 'ar' || entryLanguage === 'en') lang = entryLanguage === 'ar' ? 1 : 0;
  $('includeReferences').checked = true;
  M.fields.filter(field => field.options && answers[field.id + 'Note']).forEach(field => openNotes.add(field.id));

  function sourcesHTML() {
    return `<div class="sources-list">${sources.map(source => `<article id="source-${source.id}" class="source-card" tabindex="-1"><p class="eyebrow">[${source.id}] ${M.esc(t(source.kind))}</p><p class="source-citation" dir="ltr">${M.esc(source.citation)}</p><p>${M.esc(t(source.use))}</p><a href="${M.esc(source.url)}" target="_blank" rel="noopener noreferrer">${t(pair('Read source', 'قراءة المصدر'))} ↗</a>${source.doi ? `<p class="hint" dir="ltr">DOI: ${M.esc(source.doi)}</p>` : ''}</article>`).join('')}</div>`;
  }
  function exampleLanguage() {
    return answers.exampleLanguage || (['ar', 'en'].includes(answers.assessmentLanguage) ? answers.assessmentLanguage : lang ? 'ar' : 'en');
  }
  function sampleContentHTML() {
    const exampleLang = exampleLanguage();
    return `<p class="hint">${t(pair('Example language is separate from the interface language. Existing targets never change when you switch the interface.', 'لغة الأمثلة منفصلة عن لغة الواجهة. لا تتغير الأهداف الموجودة عند تبديل الواجهة.'))}</p><div class="actions sample-language"><button type="button" data-example-language="ar" aria-pressed="${exampleLang === 'ar'}">${t(pair('Arabic examples', 'أمثلة عربية'))}</button><button type="button" data-example-language="en" aria-pressed="${exampleLang === 'en'}">${t(pair('English examples', 'أمثلة إنجليزية'))}</button></div><div class="task-library">${T.tasks.map(task => `<article class="task-card"><h3>${M.esc(t(task.label))}</h3><p class="hint">${M.esc(t(task.guide))}</p><div class="prompt-buttons">${task.prompts[exampleLang].map((prompt, index) => `<button type="button" data-add-sample="${task.id}" data-prompt-index="${index}" data-prompt-language="${exampleLang}" dir="${exampleLang === 'ar' ? 'rtl' : 'ltr'}">+ ${M.esc(prompt)}</button>`).join('')}</div><button type="button" class="custom-target" data-add-sample="${task.id}" data-prompt-language="${exampleLang}">${t(pair('+ Custom target', '+ هدف مخصص'))}</button></article>`).join('')}</div><div class="sample-heading"><h3>${t(pair('Recorded / planned samples', 'العينات المسجلة / المخطط لها'))} (${answers.trials.length})</h3><button type="button" data-undo-sample ${removedTrial ? '' : 'hidden'}>${t(pair('Undo last sample removal', 'التراجع عن حذف آخر عينة'))}</button></div><p class="hint">${t(pair('DDK rates below are descriptive counts divided by time, with no age or language norms. Use the related DDK form for local audio recording and counting support.', 'معدلات DDK أدناه أعداد وصفية مقسومة على الزمن دون معايير للعمر أو اللغة. استخدم نموذج DDK المرتبط للتسجيل الصوتي المحلي والمساعدة في العد.'))}</p><div class="trial-list">${answers.trials.length ? answers.trials.map(trialHTML).join('') : `<p class="empty-samples">${t(pair('No samples added. Select a prompt or add a custom target above.', 'لم تُضف عينات. اختر مثيراً أو أضف هدفاً مخصصاً أعلاه.'))}</p>`}</div>`;
  }
  function samplingHTML() { return `<div id="samplesWorkspace">${sampleContentHTML()}</div>`; }
  function trialHTML(trial, index) {
    const attr = part => `data-trial="${trial.id}" data-trial-part="${part}"`;
    const choices = (part, options) => `<fieldset><legend>${t(part === 'status' ? pair('Task status', 'حالة المهمة') : part === 'condition' ? pair('Elicitation condition', 'شرط الاستثارة') : pair('Sample annotations — select observed features', 'تعليقات العينة — اختر العلامات الملحوظة'))}</legend><div class="choices">${options.map(([key, labels]) => `<label class="choice${(part === 'flags' ? trial.flags.includes(key) : trial[part] === key) ? ' selected' : ''}"><input ${attr(part)} type="${part === 'flags' ? 'checkbox' : 'radio'}" name="trial-${trial.id}-${part}" value="${key}" ${(part === 'flags' ? trial.flags.includes(key) : trial[part] === key) ? 'checked' : ''}><span>${M.esc(t(labels))}</span></label>`).join('')}</div></fieldset>`;
    const rate = T.rate(trial), rateText = rate ? t(trial.task === 'smr' ? pair(`${rate.perSecond.toFixed(2)} complete cycles/s · ${rate.syllablesPerSecond.toFixed(2)} syllables/s (${rate.syllablesPerCycle} per cycle)`, `${rate.perSecond.toFixed(2)} دورة كاملة/ث · ${rate.syllablesPerSecond.toFixed(2)} مقطع/ث (${rate.syllablesPerCycle} في الدورة)`) : pair(`${rate.perSecond.toFixed(2)} syllables/s`, `${rate.perSecond.toFixed(2)} مقطع/ث`)) : t(pair('No rate calculated.', 'لم يُحسب معدل.'));
    return `<article class="trial-card" id="trial-${trial.id}" aria-labelledby="trial-title-${trial.id}"><div class="dialogtop"><h3 id="trial-title-${trial.id}">${index + 1}. ${M.esc(t(T.taskById(trial.task).label))}</h3><button type="button" data-remove-sample="${trial.id}" aria-label="${M.esc(t(pair(`Remove sample ${index + 1}`, `حذف العينة ${index + 1}`)))}">${t(pair('Remove', 'حذف'))}</button></div><div class="trial-grid"><div class="field wide"><label for="trial-target-${trial.id}">${t(pair('Exact target / instruction', 'الهدف / التعليمات الدقيقة'))}</label><input id="trial-target-${trial.id}" ${attr('target')} type="text" dir="auto" value="${M.esc(trial.target)}" aria-describedby="trial-error-${trial.id}"></div><fieldset class="wide"><legend>${t(pair('Language of this sample', 'لغة هذه العينة'))}</legend><div class="choices">${[['ar', pair('Arabic', 'العربية')], ['en', pair('English', 'الإنجليزية')], ['other', pair('Other — document in note', 'أخرى — وثّقها في الملاحظة')]].map(([key, labels]) => `<label class="choice${trial.language === key ? ' selected' : ''}"><input ${attr('language')} type="radio" name="trial-${trial.id}-language" value="${key}" ${trial.language === key ? 'checked' : ''}><span>${t(labels)}</span></label>`).join('')}</div></fieldset><div class="wide">${choices('status', T.statusOptions)}</div><div class="wide">${choices('condition', T.conditions)}<button class="small-button" type="button" data-clear-condition="${trial.id}">${t(pair('Clear condition', 'مسح شرط الاستثارة'))}</button></div>${trial.task === 'repeated' ? [0, 1, 2].map(i => `<div class="field ${i === 2 ? 'wide' : ''}"><label for="trial-${trial.id}-attempt-${i}">${t(pair(`Attempt ${i + 1} — actual production`, `المحاولة ${i + 1} — الإنتاج الفعلي`))}</label><input id="trial-${trial.id}-attempt-${i}" ${attr('attempt-' + i)} type="text" dir="auto" value="${M.esc(trial.repetitions[i])}"></div>`).join('') : ''}<div class="field wide"><label for="trial-response-${trial.id}">${t(pair('Response / transcription / comparison', 'الاستجابة / النسخ الصوتي / المقارنة'))}</label><textarea id="trial-response-${trial.id}" ${attr('response')} dir="auto">${M.esc(trial.response)}</textarea></div><div class="wide">${choices('flags', T.flags)}<p class="hint">${t(pair('No selected annotation means not recorded; it does not mean a normal sample.', 'عدم اختيار تعليق يعني أنه غير مسجل؛ ولا يعني عينة طبيعية.'))}</p></div>${['amr', 'smr'].includes(trial.task) ? `<div class="field"><label for="trial-count-${trial.id}">${t(trial.task === 'smr' ? pair('Complete sequence cycles', 'دورات السلسلة الكاملة') : pair('Syllable repetitions', 'تكرارات المقطع'))}</label><input id="trial-count-${trial.id}" ${attr('count')} type="text" inputmode="numeric" dir="ltr" value="${M.esc(trial.count)}"></div><div class="field"><label for="trial-seconds-${trial.id}">${t(pair('Measured duration (seconds)', 'الزمن المقاس (الثواني)'))}</label><input id="trial-seconds-${trial.id}" ${attr('seconds')} type="text" inputmode="decimal" dir="ltr" value="${M.esc(trial.seconds)}"></div>${trial.task === 'smr' ? `<div class="field wide"><label for="trial-cycle-${trial.id}">${t(pair('Syllables per complete cycle — verify the target', 'المقاطع في كل دورة كاملة — تحقق من الهدف'))}</label><input id="trial-cycle-${trial.id}" ${attr('syllablesPerCycle')} type="text" inputmode="numeric" dir="ltr" value="${M.esc(trial.syllablesPerCycle)}"></div>` : ''}<p class="metric-note wide" id="trial-rate-${trial.id}" role="status">${M.esc(rateText)}</p>` : ''}<div class="field wide"><label for="trial-note-${trial.id}">${t(pair('Supporting note / assistance / limitations', 'ملاحظة داعمة / المساعدة / القيود'))}</label><textarea id="trial-note-${trial.id}" ${attr('note')} dir="auto">${M.esc(trial.note)}</textarea></div></div><p id="trial-error-${trial.id}" class="error" role="status"></p></article>`;
  }
  function renderSamples() { $('samplesWorkspace').innerHTML = sampleContentHTML(); updateCompletion(); }
  function sampleAction(event) {
    const match = selector => event.target.closest(selector);
    const languageButton = match('[data-example-language]'), add = match('[data-add-sample]'), remove = match('[data-remove-sample]'), undo = match('[data-undo-sample]'), condition = match('[data-clear-condition]');
    if (!languageButton && !add && !remove && !undo && !condition) return false;
    if (languageButton) answers.exampleLanguage = languageButton.dataset.exampleLanguage;
    if (add) {
      const task = T.taskById(add.dataset.addSample), sampleLanguage = add.dataset.promptLanguage;
      const target = add.dataset.promptIndex !== undefined ? task.prompts[sampleLanguage][Number(add.dataset.promptIndex)] : '';
      const id = Math.max(0, ...answers.trials.map(trial => trial.id), removedTrial?.trial.id || 0) + 1;
      answers.trials.push(T.createTrial(id, task.id, sampleLanguage, target));
    }
    if (remove) {
      const index = answers.trials.findIndex(trial => trial.id === Number(remove.dataset.removeSample));
      if (index >= 0) removedTrial = { trial: answers.trials.splice(index, 1)[0], index };
    }
    if (undo && removedTrial) { answers.trials.splice(removedTrial.index, 0, removedTrial.trial); removedTrial = null; }
    if (condition) { const trial = answers.trials.find(trial => trial.id === Number(condition.dataset.clearCondition)); if (trial) trial.condition = ''; }
    dirty = true; renderSamples(); save();
    if (add) $('trial-target-' + answers.trials.at(-1).id).focus();
    if (messageState === 'dates') validateAll();
    return true;
  }
  function updateTrial(input) {
    const trial = answers.trials.find(trial => trial.id === Number(input.dataset.trial)), part = input.dataset.trialPart;
    if (!trial) return;
    if (part === 'flags') {
      trial.flags = T.flags.filter(([key]) => key === input.value ? input.checked : trial.flags.includes(key)).map(([key]) => key);
    } else if (/^attempt-[012]$/.test(part)) trial.repetitions[Number(part.at(-1))] = input.value;
    else if (['target', 'language', 'status', 'condition', 'response', 'count', 'seconds', 'syllablesPerCycle', 'note'].includes(part)) trial[part] = input.value;
    if (['radio', 'checkbox'].includes(input.type)) {
      $('trial-' + trial.id).querySelectorAll('input[type="radio"],input[type="checkbox"]').forEach(node => {
        const key = node.dataset.trialPart;
        const checked = key === 'flags' ? trial.flags.includes(node.value) : trial[key] === node.value;
        node.checked = checked; node.closest('label').classList.toggle('selected', checked);
      });
    }
    if (['amr', 'smr'].includes(trial.task)) {
      const rate = T.rate(trial);
      $('trial-rate-' + trial.id).textContent = rate ? t(trial.task === 'smr' ? pair(`${rate.perSecond.toFixed(2)} complete cycles/s · ${rate.syllablesPerSecond.toFixed(2)} syllables/s (${rate.syllablesPerCycle} per cycle)`, `${rate.perSecond.toFixed(2)} دورة كاملة/ث · ${rate.syllablesPerSecond.toFixed(2)} مقطع/ث (${rate.syllablesPerCycle} في الدورة)`) : pair(`${rate.perSecond.toFixed(2)} syllables/s`, `${rate.perSecond.toFixed(2)} مقطع/ث`)) : t(pair('No rate calculated.', 'لم يُحسب معدل.'));
    }
    dirty = true; save(); updateCompletion();
    if (messageState === 'dates') { if (!validateAll()) { messageState = ''; updateStatus(); } }
  }

  function fieldHTML(field) {
    const { id, type, options } = field, value = answers[id], label = M.esc(t(field.label));
    const hint = field.hint ? `<p class="hint" id="${id}-hint">${M.esc(t(field.hint))}</p>` : '';
    let control;
    if (type === 'date') {
      control = `<fieldset id="group-${id}" class="datefield"><legend>${label}</legend><div class="dateparts">${['day', 'month', 'year'].map((part, i) => `<label for="${id}-${part}">${t([pair('Day', 'اليوم'), pair('Month', 'الشهر'), pair('Year', 'السنة')][i])}<input id="${id}-${part}" data-field="${id}" data-part="${part}" type="text" inputmode="numeric" maxlength="${part === 'year' ? 4 : 2}" placeholder="${part === 'year' ? 'YYYY' : part === 'day' ? 'DD' : 'MM'}" value="${M.esc(value?.[part] || '')}" aria-describedby="${id}-hint ${id}-error"></label>`).join('')}</div><p class="hint" id="${id}-hint">${t(pair('Complete all three parts, or leave blank if unknown. Arabic digits are supported.', 'أكمل الأجزاء الثلاثة أو اتركها فارغة إذا كان التاريخ غير معروف. الأرقام العربية مدعومة.'))}</p><div id="${id}-error" class="error" aria-live="polite"></div></fieldset>`;
    } else if (options) {
      const multiple = type === 'checklist', note = answers[id + 'Note'] || '', expanded = openNotes.has(id);
      control = `<fieldset><legend>${label}</legend><p class="hint choice-hint">${t(multiple ? pair('Select all that apply.', 'اختر كل ما ينطبق.') : pair('Choose one answer.', 'اختر إجابة واحدة.'))}</p>${hint}<div class="choices">${options.map(option => `<label class="choice${(multiple ? Array.isArray(value) && value.includes(option.key) : value === option.key) ? ' selected' : ''}" for="${id}-${option.key}"><input id="${id}-${option.key}" name="${id}" data-field="${id}" type="${multiple ? 'checkbox' : 'radio'}" value="${option.key}" ${(multiple ? Array.isArray(value) && value.includes(option.key) : value === option.key) ? 'checked' : ''}><span>${M.esc(t(option.label))}</span></label>`).join('')}</div><div class="field-actions"><button type="button" id="note-button-${id}" data-note-toggle="${id}" aria-controls="note-panel-${id}" aria-expanded="${expanded}">${t(expanded ? pair('Hide note', 'إخفاء الملاحظة') : pair('Add note', 'إضافة ملاحظة'))}</button><button type="button" data-clear-choice="${id}">${t(pair('Clear choices', 'مسح الخيارات'))}</button></div><div id="note-panel-${id}" class="note-panel" ${expanded ? '' : 'hidden'}><label for="${id}-note">${t(pair('Additional note', 'ملاحظة إضافية'))} — ${label}</label><textarea id="${id}-note" data-field="${id}Note" dir="auto">${M.esc(note)}</textarea></div></fieldset>`;
    } else {
      control = `<label for="${id}">${label}</label>${hint}${type === 'textarea' ? `<textarea id="${id}" data-field="${id}" dir="auto"${hint ? ` aria-describedby="${id}-hint"` : ''}>${M.esc(value || '')}</textarea>` : `<input id="${id}" data-field="${id}" type="${type === 'number' ? 'text' : type}" ${type === 'number' ? 'inputmode="numeric"' : ''} dir="${type === 'number' ? 'ltr' : 'auto'}" value="${M.esc(value || '')}">`}`;
    }
    return `<div class="field ${options || type === 'textarea' ? 'wide field-panel' : ''}">${control}${field.refs?.length ? `<p class="field-references">${t(pair('Evidence: ', 'الأدلة: '))}${field.refs.map(id => `<a href="#source-${id}" data-source="${id}">[${id}]</a>`).join(' ')}</p>` : ''}</div>`;
  }
  function updateStatus() {
    $('saveStatus').textContent = saveState ? t(messages[saveState]) : '';
    $('message').textContent = messageState ? t(messages[messageState]) : '';
    $('clearError').textContent = clearFailed ? t(messages.clearError) : '';
  }
  function updateCompletion() {
    const count = M.countAnswers(answers);
    $('completion').textContent = t(pair(`${count} of ${M.fields.length} fields recorded · optional answers`, `${count} من ${M.fields.length} حقلاً مسجلاً · الإجابات اختيارية`));
    sections.forEach((section, i) => {
      const node = $('count-' + i);
      if (node) node.textContent = section.id === 'samples' ? `${answers.trials.filter(trial => ['completed', 'limited'].includes(trial.status)).length}/${answers.trials.length}` : section.id === 'evidence' ? String(sources.length) : `${section.fields.filter(field => M.valueText(field, answers)).length}/${section.fields.length}`;
    });
    const age = !M.dateError('dob', answers) && !M.dateError('assessmentDate', answers) ? M.ageLabel(answers) : null;
    $('age').textContent = age ? t(pair('Age: ', 'العمر: ')) + t(age) : t(pair('Age is calculated from birth and assessment dates.', 'يُحسب العمر من تاريخ الميلاد وتاريخ التقييم.'));
    if ($('intelligibilityMetric')) {
      const value = M.intelligibility(answers);
      $('intelligibilityMetric').textContent = value === null ? t(pair('A descriptive percentage appears after valid word counts are recorded. No diagnostic threshold is applied.', 'تظهر نسبة وصفية بعد تسجيل أعداد كلمات صحيحة. لا يُطبق حد تشخيصي.')) : t(pair(`${value.toFixed(1)}% understood in this recorded sample — descriptive only.`, `${value.toFixed(1)}٪ مفهومة في هذه العينة المسجلة — نسبة وصفية فقط.`));
    }
  }
  function validateDates() {
    let first = null;
    sections.forEach((section, i) => section.fields.filter(field => field.type === 'date').forEach(field => {
      const error = M.dateError(field.id, answers), group = $('group-' + field.id);
      $(field.id + '-error').textContent = error ? t(error) : '';
      group.classList.toggle('invalid', !!error);
      group.querySelectorAll('input').forEach(input => input.setAttribute('aria-invalid', String(!!error)));
      if (error && !first) first = { step: i, id: field.id };
    }));
    return first;
  }
  function validateAll() {
    let first = validateDates();
    const measurement = M.measurementError(answers);
    $('measurementError').textContent = measurement ? t(measurement) : '';
    if (measurement && !first) first = { step: 6, focus: 'understoodWords' };
    answers.trials.forEach(trial => {
      const error = T.trialError(trial);
      $('trial-error-' + trial.id).textContent = error ? t(error) : '';
      if (error && !first) first = { step: 4, focus: 'trial-target-' + trial.id };
    });
    return first;
  }
  function reportSettings() { return { lang, bilingual: $('bilingual').checked, includeEmpty: $('includeEmpty').checked, references: $('includeReferences').checked }; }
  function updateReport() {
    for (const id of ['reportPreview', 'printArea']) { $(id).dir = lang ? 'rtl' : 'ltr'; $(id).lang = lang ? 'ar' : 'en'; }
    $('reportPreview').innerHTML = M.reportHTML(answers, reportSettings());
  }
  function render() {
    document.documentElement.lang = lang ? 'ar' : 'en'; document.documentElement.dir = lang ? 'rtl' : 'ltr';
    document.title = t(pair('Acquired AOS Assessment · Ahmad Ghanem', 'تقييم تعذر الأداء النطقي المكتسب · أحمد غانم'));
    Object.entries(translations).forEach(([id, labels]) => { $(id).textContent = t(labels); });
    $('language').textContent = lang ? 'English' : 'العربية';
    $('language').setAttribute('aria-label', t(pair('Switch to Arabic', 'التبديل إلى الإنجليزية')));
    $('nav').setAttribute('aria-label', t(pair('Assessment sections', 'أقسام التقييم')));
    $('nav').innerHTML = sections.map((section, i) => `<button type="button" data-step="${i}" ${i === step ? 'aria-current="step"' : ''}><span>${String(i + 1).padStart(2, '0')}. ${M.esc(t(section.title))}</span><small id="count-${i}" dir="ltr"></small></button>`).join('');
    $('sections').innerHTML = sections.map((section, i) => `<section class="card" ${i !== step ? 'hidden' : ''} aria-labelledby="title-${i}"><div class="intro"><div class="eyebrow">${t(pair('Acquired AOS assessment', 'تقييم تعذر الأداء النطقي المكتسب'))} · ${i + 1} / ${sections.length}</div><h2 id="title-${i}" tabindex="-1">${M.esc(t(section.title))}</h2>${section.description ? `<p class="muted">${M.esc(t(section.description))}</p>` : ''}${i === 0 ? '<p id="age" class="age-chip"></p>' : ''}</div><div class="grid">${section.fields.map(fieldHTML).join('')}</div>${section.id === 'samples' ? samplingHTML() : section.id === 'evidence' ? sourcesHTML() : section.id === 'function' ? '<p id="measurementError" class="error" role="status"></p><p id="intelligibilityMetric" class="metric-note"></p>' : ''}</section>`).join('');
    $('stepStatus').textContent = t(pair(`Section ${step + 1} of ${sections.length}`, `القسم ${step + 1} من ${sections.length}`));
    $('progress').style.width = ((step + 1) / sections.length * 100) + '%';
    $('sectionProgress').setAttribute('aria-valuenow', String(step + 1));
    $('sectionProgress').setAttribute('aria-label', t(pair('Current section', 'القسم الحالي')));
    $('printArea').setAttribute('aria-label', t(pair('Printable report', 'التقرير القابل للطباعة')));
    $('previous').disabled = step === 0; $('next').disabled = step === sections.length - 1;
    $('remember').checked = storageEnabled;
    updateCompletion(); updateStatus();
    if (messageState === 'dates') validateAll();
    if ($('reportDialog').open) updateReport();
  }
  function save() {
    if (!storageEnabled) return;
    try {
      localStorage.setItem(KEY, JSON.stringify({ version: 1, answers, lang, step }));
      storedDraft = true; dirty = false; saveState = 'saved';
    } catch { dirty = true; saveState = 'saveError'; }
    updateStatus();
  }
  function toggleNote(id, forceOpen = false) {
    const panel = $('note-panel-' + id), button = $('note-button-' + id), expanded = forceOpen || panel.hidden;
    panel.hidden = !expanded; button.setAttribute('aria-expanded', String(expanded));
    button.textContent = t(expanded ? pair('Hide note', 'إخفاء الملاحظة') : pair('Add note', 'إضافة ملاحظة'));
    if (expanded) { openNotes.add(id); $(id + '-note').focus(); } else openNotes.delete(id);
  }
  function syncChoices(field) {
    field.options.forEach(option => {
      const input = $(field.id + '-' + option.key), checked = field.type === 'checklist' ? answers[field.id].includes(option.key) : answers[field.id] === option.key;
      input.checked = checked;
      input.closest('label').classList.toggle('selected', checked);
    });
  }
  function updateAnswer(input) {
    if (input.dataset.trial) { updateTrial(input); return; }
    const id = input.dataset.field, field = fieldMap.get(id);
    if (!id || !field && !(id.endsWith('Note') && fieldMap.get(id.slice(0, -4))?.options)) return;
    if (input.dataset.part && field?.type === 'date') answers[id] = { ...(answers[id] || {}), [input.dataset.part]: input.value };
    else if (field?.options) {
      answers[id] = M.choiceChange(field, answers[id], input.value, input.checked); syncChoices(field);
      if (input.checked && input.value === 'other') toggleNote(id, true);
    } else answers[id] = input.value;
    dirty = true; save(); updateCompletion();
    if (messageState === 'dates' && !validateAll()) { messageState = ''; updateStatus(); }
  }
  function go(nextStep) {
    step = Math.max(0, Math.min(sections.length - 1, nextStep)); render(); save();
    $('title-' + step).focus({ preventScroll: true });
    $('main').scrollIntoView({ block: 'start', behavior: 'auto' });
  }
  function ensureValidReport() {
    const invalid = validateAll();
    if (!invalid) { messageState = ''; updateStatus(); return true; }
    messageState = 'dates';
    if ($('reportDialog').open) closeDialog('reportDialog');
    go(invalid.step); validateAll(); $(invalid.focus || invalid.id + '-day').focus(); updateStatus();
    return false;
  }
  function openDialog(id) {
    const dialog = $(id);
    if (typeof dialog.showModal === 'function') dialog.showModal();
    else { dialog.setAttribute('open', ''); dialog.open = true; dialog.scrollIntoView({ block: 'start' }); }
  }
  function closeDialog(id) {
    const dialog = $(id);
    if (typeof dialog.close === 'function') dialog.close();
    else { dialog.removeAttribute('open'); dialog.open = false; }
  }
  $('history').addEventListener('input', event => { if (!['checkbox', 'radio'].includes(event.target.type)) updateAnswer(event.target); });
  $('history').addEventListener('change', event => { if (['checkbox', 'radio'].includes(event.target.type)) updateAnswer(event.target); });
  $('history').addEventListener('focusout', event => { if (event.target.dataset.part || event.target.dataset.trial || ['understoodWords', 'totalWords'].includes(event.target.dataset.field)) validateAll(); });
  $('history').addEventListener('submit', event => event.preventDefault());
  $('history').addEventListener('click', event => {
    const sourceLink = event.target.closest('[data-source]');
    if (sourceLink) { event.preventDefault(); go(8); $('source-' + sourceLink.dataset.source).focus(); return; }
    if (sampleAction(event)) return;
    const noteButton = event.target.closest('[data-note-toggle]'), clearButton = event.target.closest('[data-clear-choice]');
    if (noteButton) toggleNote(noteButton.dataset.noteToggle);
    if (clearButton) {
      const field = fieldMap.get(clearButton.dataset.clearChoice);
      answers[field.id] = field.type === 'checklist' ? [] : ''; syncChoices(field);
      dirty = true; save(); updateCompletion();
    }
  });
  $('nav').addEventListener('click', event => { const button = event.target.closest('[data-step]'); if (button) go(Number(button.dataset.step)); });
  $('previous').onclick = () => go(step - 1); $('next').onclick = () => go(step + 1);
  $('language').onclick = () => { lang = 1 - lang; render(); save(); };
  $('remember').onchange = () => {
    if ($('remember').checked) { storageEnabled = true; save(); return; }
    try { localStorage.removeItem(KEY); storageEnabled = false; storedDraft = false; dirty = true; saveState = 'removed'; }
    catch { storageEnabled = true; $('remember').checked = true; saveState = 'removeError'; }
    updateStatus();
  };
  $('clear').onclick = () => { clearFailed = false; updateStatus(); openDialog('clearDialog'); };
  $('cancelClear').onclick = () => closeDialog('clearDialog');
  $('confirmClear').onclick = () => {
    if (storedDraft || storageEnabled) {
      try { localStorage.removeItem(KEY); }
      catch { clearFailed = true; updateStatus(); return; }
    }
    answers = initialAnswers(); storageEnabled = false; storedDraft = false; dirty = false; saveState = ''; messageState = ''; clearFailed = false;
    openNotes.clear(); removedTrial = null; step = 0; $('reportPreview').innerHTML = ''; $('printArea').innerHTML = '';
    $('bilingual').checked = false; $('includeEmpty').checked = false;
    $('includeReferences').checked = true;
    closeDialog('clearDialog'); render(); $('title-0').focus();
  };
  $('review').onclick = () => { if (ensureValidReport()) { updateReport(); openDialog('reportDialog'); } };
  $('closeReport').onclick = () => { closeDialog('reportDialog'); $('review').focus(); };
  $('bilingual').onchange = updateReport; $('includeEmpty').onchange = updateReport; $('includeReferences').onchange = updateReport;
  $('textExport').onclick = () => {
    if (!ensureValidReport()) return;
    const blob = new Blob(['\ufeff' + M.reportText(answers, reportSettings())], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob), link = document.createElement('a');
    const name = (answers.patientName || 'aos').replace(/[<>:"/\\|?*\u0000-\u001f\u202a-\u202e\u2066-\u2069]/g, '_').slice(0, 70);
    link.href = url; link.download = name + '-aos-assessment.txt'; document.body.append(link); link.click(); link.remove();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  };
  function preparePrint() {
    $('printArea').dir = lang ? 'rtl' : 'ltr'; $('printArea').lang = lang ? 'ar' : 'en';
    const errors = [...M.fields.filter(field => field.type === 'date').map(field => M.dateError(field.id, answers)), M.measurementError(answers), ...answers.trials.map(T.trialError)].filter(Boolean);
    $('printArea').innerHTML = errors.length ? `<h1>${M.esc(t(translations.appTitle))}</h1><p>${M.esc(t(messages.dates))}</p>` : M.reportHTML(answers, reportSettings());
  }
  $('pdfExport').onclick = () => { if (ensureValidReport()) { preparePrint(); window.print(); } };
  window.addEventListener('beforeprint', preparePrint);
  window.addEventListener('afterprint', () => { $('printArea').innerHTML = ''; });
  window.addEventListener('beforeunload', event => { if (dirty) { event.preventDefault(); event.returnValue = ''; } });
  render();
  if ('serviceWorker' in navigator && ['https:', 'http:'].includes(location.protocol)) {
    navigator.serviceWorker.register('./sw.js', { scope: './' }).catch(() => { /* The form remains usable without offline installation. */ });
  }
})();
