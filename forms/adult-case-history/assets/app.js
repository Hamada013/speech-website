/* Adult case history: native controls, bilingual UI, private drafts and reports. */
(function () {
  'use strict';
  const { sections, pair } = window.AdultHistoryData;
  const M = window.AdultHistoryModel;
  const $ = id => document.getElementById(id);
  const KEY = 'aghanem-adult-history-v1';
  const initialAnswers = () => ({ assessmentDate: M.today(), examiner: 'Ahmad Ghanem' });
  let answers = initialAnswers(), lang = 0, step = 0, storageEnabled = false, storedDraft = false, dirty = false;
  let saveState = '', messageState = '', clearFailed = false;
  const openNotes = new Set(), fieldMap = new Map(M.fields.map(field => [field.id, field]));
  const t = labels => labels[lang];
  const translations = {
    skipLink: pair('Skip to form', 'الانتقال إلى النموذج'),
    branding: pair('Ahmad Ghanem · Speech and Language Pathology', 'أحمد غانم · اختصاص النطق واللغة'),
    appTitle: pair('Adult case history', 'تاريخ حالة البالغين'),
    subtitle: pair('Initial assessment · Patient interview & clinical notes', 'التقييم الأولي · مقابلة المريض والملاحظات السريرية'),
    previous: pair('← Previous', 'السابق →'), next: pair('Next →', '← التالي'), review: pair('Review & export report', 'مراجعة وتصدير التقرير'),
    rememberLabel: pair('Save draft on this device', 'حفظ المسودة على هذا الجهاز'),
    privacyText: pair('Saving is off by default. Answers stay in this browser and are not sent to a server. Enable saving only on a private device; clear the draft after use.', 'الحفظ معطل افتراضياً. تبقى الإجابات في هذا المتصفح ولا تُرسل إلى خادم. فعّل الحفظ على جهاز خاص فقط وامسح المسودة بعد الاستخدام.'),
    clear: pair('New / clear form', 'جديد / مسح النموذج'), reportTitle: pair('Review & export', 'المراجعة والتصدير'), closeReport: pair('Close', 'إغلاق'),
    exportHelp: pair('Review the report before exporting. PDF opens the browser print dialog; choose Save as PDF. On iPad, use the print preview’s Share option to save to Files. You can also select both languages below.', 'راجع التقرير قبل تصديره. يفتح خيار PDF نافذة الطباعة؛ اختر حفظ كـ PDF. على آيباد استخدم خيار المشاركة في معاينة الطباعة للحفظ في الملفات. ويمكنك اختيار اللغتين أدناه.'),
    pdfExport: pair('Print / Save as PDF', 'طباعة / حفظ كـ PDF'), textExport: pair('Download text (.txt)', 'تنزيل نص (.txt)'),
    bilingualLabel: pair('Bilingual report (English + Arabic)', 'تقرير باللغتين (العربية + الإنجليزية)'), emptyLabel: pair('Include unanswered fields', 'تضمين الحقول غير المجاب عنها'),
    clearTitle: pair('Start a new history?', 'بدء تاريخ جديد؟'), clearHelp: pair('This clears all current answers and this form’s saved draft on this device. Export the report first if needed.', 'يمسح هذا جميع الإجابات الحالية والمسودة المحفوظة لهذا النموذج على الجهاز. صدّر التقرير أولاً إذا كنت تحتاجه.'),
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
    dates: pair('Correct the highlighted date before exporting the report.', 'صحح التاريخ المحدد قبل تصدير التقرير.'),
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
  M.fields.filter(field => field.options && answers[field.id + 'Note']).forEach(field => openNotes.add(field.id));

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
      control = `<label for="${id}">${label}</label>${hint}${type === 'textarea' ? `<textarea id="${id}" data-field="${id}" dir="auto"${hint ? ` aria-describedby="${id}-hint"` : ''}>${M.esc(value || '')}</textarea>` : `<input id="${id}" data-field="${id}" type="${type}" dir="${type === 'tel' || type === 'email' ? 'ltr' : 'auto'}" value="${M.esc(value || '')}">`}`;
    }
    return `<div class="field ${options || type === 'textarea' ? 'wide field-panel' : ''}">${control}</div>`;
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
      if (node) node.textContent = `${section.fields.filter(field => M.valueText(field, answers)).length}/${section.fields.length}`;
    });
    const age = !M.dateError('dob', answers) && !M.dateError('assessmentDate', answers) ? M.ageLabel(answers) : null;
    $('age').textContent = age ? t(pair('Age: ', 'العمر: ')) + t(age) : t(pair('Age is calculated from birth and assessment dates.', 'يُحسب العمر من تاريخ الميلاد وتاريخ التقييم.'));
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
  function reportSettings() { return { lang, bilingual: $('bilingual').checked, includeEmpty: $('includeEmpty').checked }; }
  function updateReport() {
    for (const id of ['reportPreview', 'printArea']) { $(id).dir = lang ? 'rtl' : 'ltr'; $(id).lang = lang ? 'ar' : 'en'; }
    $('reportPreview').innerHTML = M.reportHTML(answers, reportSettings());
  }
  function render() {
    document.documentElement.lang = lang ? 'ar' : 'en'; document.documentElement.dir = lang ? 'rtl' : 'ltr';
    document.title = t(pair('Adult Case History · Ahmad Ghanem', 'تاريخ حالة البالغين · أحمد غانم'));
    Object.entries(translations).forEach(([id, labels]) => { $(id).textContent = t(labels); });
    $('language').textContent = lang ? 'English' : 'العربية';
    $('language').setAttribute('aria-label', t(pair('Switch to Arabic', 'التبديل إلى الإنجليزية')));
    $('nav').setAttribute('aria-label', t(pair('Case history sections', 'أقسام تاريخ الحالة')));
    $('nav').innerHTML = sections.map((section, i) => `<button type="button" data-step="${i}" ${i === step ? 'aria-current="step"' : ''}><span>${String(i + 1).padStart(2, '0')}. ${M.esc(t(section.title))}</span><small id="count-${i}" dir="ltr"></small></button>`).join('');
    $('sections').innerHTML = sections.map((section, i) => `<section class="card" ${i !== step ? 'hidden' : ''} aria-labelledby="title-${i}"><div class="intro"><div class="eyebrow">${t(pair('Adult case history', 'تاريخ حالة البالغين'))} · ${i + 1} / ${sections.length}</div><h2 id="title-${i}" tabindex="-1">${M.esc(t(section.title))}</h2>${section.description ? `<p class="muted">${M.esc(t(section.description))}</p>` : ''}${i === 0 ? '<p id="age" class="age-chip"></p>' : ''}</div><div class="grid">${section.fields.map(fieldHTML).join('')}</div></section>`).join('');
    $('stepStatus').textContent = t(pair(`Section ${step + 1} of ${sections.length}`, `القسم ${step + 1} من ${sections.length}`));
    $('progress').style.width = ((step + 1) / sections.length * 100) + '%';
    $('sectionProgress').setAttribute('aria-valuenow', String(step + 1));
    $('sectionProgress').setAttribute('aria-label', t(pair('Current section', 'القسم الحالي')));
    $('printArea').setAttribute('aria-label', t(pair('Printable report', 'التقرير القابل للطباعة')));
    $('previous').disabled = step === 0; $('next').disabled = step === sections.length - 1;
    $('remember').checked = storageEnabled;
    updateCompletion(); updateStatus();
    if (messageState === 'dates') validateDates();
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
    const id = input.dataset.field, field = fieldMap.get(id);
    if (!id || !field && !(id.endsWith('Note') && fieldMap.get(id.slice(0, -4))?.options)) return;
    if (input.dataset.part && field?.type === 'date') answers[id] = { ...(answers[id] || {}), [input.dataset.part]: input.value };
    else if (field?.options) {
      answers[id] = M.choiceChange(field, answers[id], input.value, input.checked); syncChoices(field);
      if (input.checked && input.value === 'other') toggleNote(id, true);
    } else answers[id] = input.value;
    dirty = true; save(); updateCompletion();
    if (messageState === 'dates' && !validateDates()) { messageState = ''; updateStatus(); }
  }
  function go(nextStep) {
    step = Math.max(0, Math.min(sections.length - 1, nextStep)); render(); save();
    $('title-' + step).focus({ preventScroll: true });
    $('main').scrollIntoView({ block: 'start', behavior: 'auto' });
  }
  function ensureValidReport() {
    const invalid = validateDates();
    if (!invalid) { messageState = ''; updateStatus(); return true; }
    messageState = 'dates';
    if ($('reportDialog').open) closeDialog('reportDialog');
    go(invalid.step); validateDates(); $(invalid.id + '-day').focus(); updateStatus();
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
  $('history').addEventListener('focusout', event => { if (event.target.dataset.part) validateDates(); });
  $('history').addEventListener('submit', event => event.preventDefault());
  $('history').addEventListener('click', event => {
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
    openNotes.clear(); step = 0; $('reportPreview').innerHTML = ''; $('printArea').innerHTML = '';
    $('bilingual').checked = false; $('includeEmpty').checked = false;
    closeDialog('clearDialog'); render(); $('title-0').focus();
  };
  $('review').onclick = () => { if (ensureValidReport()) { updateReport(); openDialog('reportDialog'); } };
  $('closeReport').onclick = () => { closeDialog('reportDialog'); $('review').focus(); };
  $('bilingual').onchange = updateReport; $('includeEmpty').onchange = updateReport;
  $('textExport').onclick = () => {
    if (!ensureValidReport()) return;
    const blob = new Blob(['\ufeff' + M.reportText(answers, reportSettings())], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob), link = document.createElement('a');
    const name = (answers.patientName || 'adult').replace(/[<>:"/\\|?*\u0000-\u001f\u202a-\u202e\u2066-\u2069]/g, '_').slice(0, 70);
    link.href = url; link.download = name + '-case-history.txt'; document.body.append(link); link.click(); link.remove();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  };
  function preparePrint() {
    $('printArea').dir = lang ? 'rtl' : 'ltr'; $('printArea').lang = lang ? 'ar' : 'en';
    const errors = M.fields.filter(field => field.type === 'date').map(field => M.dateError(field.id, answers)).filter(Boolean);
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
