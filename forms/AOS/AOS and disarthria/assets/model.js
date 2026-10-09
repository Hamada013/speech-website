/* Pure dates, observations, informal samples and bilingual report helpers. */
(function (root, factory) {
  if (typeof module === 'object' && module.exports) module.exports = factory(require('./data.js'), require('./tasks.js'));
  else root.AOSModel = factory(root.AOSData, root.AOSTasks);
})(typeof globalThis !== 'undefined' ? globalThis : this, function (data, T) {
  'use strict';
  const { sections, sources, scopeNote, pair } = data;
  const fields = sections.flatMap(section => section.fields);
  const esc = value => String(value ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const digits = value => String(value ?? '').replace(/[٠-٩]/g, c => String(c.charCodeAt(0) - 1632)).replace(/[۰-۹]/g, c => String(c.charCodeAt(0) - 1776));
  function today(now = new Date()) { return { day: String(now.getDate()).padStart(2, '0'), month: String(now.getMonth() + 1).padStart(2, '0'), year: String(now.getFullYear()) }; }
  function parseDate(value) {
    if (!value || typeof value !== 'object' || Array.isArray(value)) return value ? { error: true } : { empty: true };
    const parts = ['day', 'month', 'year'].map(part => digits(value[part]).trim());
    if (parts.every(part => !part)) return { empty: true };
    const [day, month, year] = parts.map(Number);
    if (!/^\d{1,2}$/.test(parts[0]) || !/^\d{1,2}$/.test(parts[1]) || !/^\d{4}$/.test(parts[2]) || year < 1900 || year > 2199) return { error: true };
    const date = new Date(Date.UTC(year, month - 1, day));
    if (date.getUTCFullYear() !== year || date.getUTCMonth() !== month - 1 || date.getUTCDate() !== day) return { error: true };
    return { date, iso: `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`, day, month, year };
  }
  function dateError(id, answers, now = new Date()) {
    const result = parseDate(answers[id]);
    if (result.error) return pair('Enter a complete, valid date with a year from 1900 to 2199, or leave all three parts blank.', 'أدخل تاريخاً كاملاً وصحيحاً بسنة بين 1900 و2199، أو اترك الأجزاء الثلاثة فارغة.');
    if (result.empty) return null;
    const birth = parseDate(answers.dob), assessment = parseDate(answers.assessmentDate), current = parseDate(today(now));
    if (id === 'dob' && (result.iso > current.iso || assessment.iso && result.iso > assessment.iso)) return pair('Birth date must not be after today or the assessment date.', 'يجب ألا يتجاوز تاريخ الميلاد اليوم أو تاريخ التقييم.');
    if (id === 'assessmentDate' && result.iso > current.iso) return pair('The interview / assessment date must not be in the future.', 'يجب ألا يكون تاريخ المقابلة / التقييم في المستقبل.');
    if (['assessmentDate', 'onsetDate', 'hearingDate'].includes(id) && birth.iso && result.iso < birth.iso) return pair('This date must not be before the date of birth.', 'يجب ألا يسبق هذا التاريخ تاريخ الميلاد.');
    if (['onsetDate', 'hearingDate'].includes(id) && result.iso > (assessment.iso || current.iso)) return pair('This history date must not be after the assessment date (or today if no assessment date is recorded).', 'يجب ألا يتجاوز تاريخ هذه المعلومة تاريخ التقييم (أو اليوم إذا لم يُسجّل تاريخ التقييم).');
    if (id === 'followup' && assessment.iso && result.iso < assessment.iso) return pair('Follow-up must not be before the assessment date.', 'يجب ألا يسبق تاريخ المتابعة تاريخ التقييم.');
    return null;
  }
  function ageAt(answers) {
    const birth = parseDate(answers.dob), assessment = parseDate(answers.assessmentDate);
    if (!birth.iso || !assessment.iso || birth.iso > assessment.iso) return null;
    let months = (assessment.year - birth.year) * 12 + assessment.month - birth.month;
    const monthEnd = new Date(Date.UTC(assessment.year, assessment.month, 0)).getUTCDate();
    if (assessment.day < Math.min(birth.day, monthEnd)) months--;
    return { years: Math.floor(months / 12), months: months % 12 };
  }
  function ageLabel(answers) {
    const age = ageAt(answers);
    return age ? pair(`${age.years} years, ${age.months} months at assessment`, `${age.years} سنة و${age.months} شهر عند التقييم`) : null;
  }
  function choiceChange(field, current, key, checked) {
    if (!field.options.some(o => o.key === key)) return current;
    if (field.type === 'radio') return checked ? key : '';
    let selected = Array.isArray(current) ? current.filter(v => v !== key) : [];
    if (checked) {
      const option = field.options.find(o => o.key === key);
      selected = option.exclusive ? [key] : [...selected.filter(v => !field.options.find(o => o.key === v)?.exclusive), key];
    }
    return field.options.filter(o => selected.includes(o.key)).map(o => o.key);
  }
  function sanitizeAnswers(input) {
    const output = {};
    if (!input || typeof input !== 'object' || Array.isArray(input)) return output;
    for (const field of fields) {
      const value = input[field.id];
      if (field.options) {
        if (field.type === 'radio' && typeof value === 'string' && field.options.some(o => o.key === value)) output[field.id] = value;
        if (field.type === 'checklist' && Array.isArray(value)) {
          const valid = field.options.filter(o => value.includes(o.key));
          const exclusive = valid.find(o => o.exclusive);
          output[field.id] = exclusive ? [exclusive.key] : valid.map(o => o.key);
        }
        if (typeof input[field.id + 'Note'] === 'string') output[field.id + 'Note'] = input[field.id + 'Note'];
      } else if (field.type === 'date' && value && typeof value === 'object' && !Array.isArray(value)) {
        output[field.id] = Object.fromEntries(['day', 'month', 'year'].map(part => [part, typeof value[part] === 'string' ? value[part] : '']));
      } else if (typeof value === 'string') output[field.id] = value;
    }
    output.trials = T.sanitizeTrials(input.trials);
    if (['ar', 'en'].includes(input.exampleLanguage)) output.exampleLanguage = input.exampleLanguage;
    return output;
  }
  function valueText(field, answers, lang = 0) {
    const value = answers[field.id];
    if (field.type === 'date') return parseDate(value).iso || '';
    if (field.options) {
      const keys = field.type === 'checklist' ? (Array.isArray(value) ? value : []) : [value];
      const choices = field.options.filter(o => keys.includes(o.key)).map(o => o.label[lang]).join('; ');
      const note = typeof answers[field.id + 'Note'] === 'string' ? answers[field.id + 'Note'].trim() : '';
      return [choices, note ? pair('Note: ', 'ملاحظة: ')[lang] + note : ''].filter(Boolean).join('\n');
    }
    return typeof value === 'string' ? value.trim() : '';
  }
  function countAnswers(answers) { return fields.filter(field => !!valueText(field, answers)).length; }
  const reportTitle = pair('Acquired apraxia of speech assessment', 'تقييم تعذر الأداء النطقي المكتسب');
  const reportNote = pair('Descriptive adult acquired-AOS assessment. The clinician enters all findings and the working impression. Blank, untested, and uninterpretable items do not establish absence of a feature. No diagnostic total, severity classification, ASRS score, or Arabic norms are generated.', 'تقييم وصفي لتعذر الأداء النطقي المكتسب لدى البالغين. يدخل الفاحص جميع النتائج والانطباع الأولي. لا تثبت البنود الفارغة أو غير المقيمة أو غير القابلة للتفسير غياب العلامة. لا تُنتج درجة تشخيصية إجمالية أو تصنيف شدة أو درجة ASRS أو معايير عربية.');
  const notRecorded = pair('Not recorded', 'غير مسجل');
  const footer = [pair('SPEECH AND LANGUAGE PATHOLOGY', 'اختصاص النطق واللغة'), pair('Ahmad Ghanem', 'أحمد غانم'), pair('Latakia - Syria', 'اللاذقية - سوريا')];
  function reportHTML(answers, settings = {}) {
    const lang = settings.lang === 1 ? 1 : 0, both = !!settings.bilingual;
    const translated = labels => `<span class="translation" lang="${lang ? 'ar' : 'en'}" dir="${lang ? 'rtl' : 'ltr'}">${esc(labels[lang])}</span>${both ? `<span class="translation secondary" lang="${lang ? 'en' : 'ar'}" dir="${lang ? 'ltr' : 'rtl'}">${esc(labels[1 - lang])}</span>` : ''}`;
    const valueHTML = field => {
      if (!field.options) return valueText(field, answers, lang) ? `<span class="user-value" dir="auto">${esc(valueText(field, answers, lang))}</span>` : translated(notRecorded);
      const keys = field.type === 'checklist' ? (Array.isArray(answers[field.id]) ? answers[field.id] : []) : [answers[field.id]];
      const selected = field.options.filter(o => keys.includes(o.key));
      const note = typeof answers[field.id + 'Note'] === 'string' ? answers[field.id + 'Note'].trim() : '';
      return `${selected.length ? `<ul class="report-choices">${selected.map(o => `<li>${translated(o.label)}</li>`).join('')}</ul>` : !note ? translated(notRecorded) : ''}${note ? `<div class="report-detail">${translated(pair('Note', 'ملاحظة'))}<span class="user-value" dir="auto">${esc(note)}</span></div>` : ''}`;
    };
    const name = typeof answers.patientName === 'string' && answers.patientName.trim() ? `<span dir="auto">${esc(answers.patientName.trim())}</span>` : translated(pair('Patient name not recorded', 'اسم المريض غير مسجل'));
    const age = ageLabel(answers);
    const missing = fields.length - countAnswers(answers);
    let html = `<div class="report-heading"><div class="eyebrow">${translated(pair('Adult motor speech · Clinical worksheet', 'الكلام الحركي للبالغين · ورقة سريرية'))}</div><h1>${translated(reportTitle)}</h1><p class="patient-name"><strong>${name}</strong></p>${age ? `<p>${translated(age)}</p>` : ''}</div><div class="report-note">${translated(reportNote)}<p>${translated(pair(`${missing} fields not recorded.`, `${missing} حقلاً غير مسجل.`))}</p></div>`;
    for (const section of sections) {
      if (section.id === 'evidence') continue;
      if (section.id === 'samples') { html += `<section class="report-section"><h3>${translated(section.title)}</h3>${trialReportHTML(answers, translated, lang, both)}</section>`; continue; }
      const recorded = section.fields.filter(field => valueText(field, answers, lang));
      const rows = settings.includeEmpty ? section.fields : recorded;
      html += `<section class="report-section"><h3>${translated(section.title)}</h3>${rows.length ? `<dl>${rows.map(field => `<div class="report-row${field.type === 'textarea' || valueText(field, answers, lang).length > 500 ? ' long-row' : ''}"><dt>${translated(field.label)}</dt><dd${valueText(field, answers, lang) ? '' : ' class="no-data"'}>${valueHTML(field)}</dd></div>`).join('')}</dl>` : `<p class="no-data">${translated(pair('No information recorded in this section.', 'لم تُسجّل معلومات في هذا القسم.'))}</p>`}</section>`;
      if (section.id === 'function' && intelligibility(answers) !== null) html += `<p class="metric-note">${translated(pair(`Listener word intelligibility: ${intelligibility(answers).toFixed(1)}% in the recorded sample. This is a descriptive proportion, not an AOS diagnostic score.`, `وضوح الكلمات للمستمع: ${intelligibility(answers).toFixed(1)}٪ في العينة المسجلة. هذه نسبة وصفية وليست درجة تشخيصية لتعذر الأداء النطقي.`))}</p>`;
    }
    if (settings.references !== false) html += `<section class="report-section report-references"><h3>${translated(pair('Research basis & adaptation limits', 'الأساس البحثي وحدود التكييف'))}</h3><p>${translated(scopeNote)}</p><ol>${sources.map(source => `<li><a href="${esc(source.url)}" dir="ltr">[${source.id}] ${esc(source.citation)}</a>${source.doi ? `<span dir="ltr"> DOI: ${esc(source.doi)}</span>` : ''}</li>`).join('')}</ol></section>`;
    return html + `<footer class="signature">${footer.map(labels => `<div>${translated(labels)}</div>`).join('')}<a href="mailto:slp.ahmadghanem@gmail.com" dir="ltr">slp.ahmadghanem@gmail.com</a></footer>`;
  }
  function reportText(answers, settings = {}) {
    const lang = settings.lang === 1 ? 1 : 0;
    const translated = labels => settings.bilingual ? `${labels[lang]} / ${labels[1 - lang]}` : labels[lang];
    const age = ageLabel(answers);
    const parts = [translated(reportTitle), age ? translated(age) : '', translated(reportNote)];
    for (const section of sections) {
      if (section.id === 'evidence') continue;
      const rows = section.fields.filter(field => settings.includeEmpty || valueText(field, answers, lang));
      parts.push(`\n${translated(section.title)}\n${'─'.repeat(36)}`);
      if (section.id === 'samples') { parts.push(trialReportText(answers, translated, lang)); continue; }
      if (!rows.length) parts.push(translated(pair('No information recorded in this section.', 'لم تُسجّل معلومات في هذا القسم.')));
      for (const field of rows) {
        let value;
        if (settings.bilingual && field.options) {
          const keys = field.type === 'checklist' ? (Array.isArray(answers[field.id]) ? answers[field.id] : []) : [answers[field.id]];
          const selected = field.options.filter(o => keys.includes(o.key));
          const note = typeof answers[field.id + 'Note'] === 'string' ? answers[field.id + 'Note'].trim() : '';
          value = [selected.map(o => translated(o.label)).join('; '), note ? `${translated(pair('Note', 'ملاحظة'))}: ${note}` : ''].filter(Boolean).join('\n');
        } else value = valueText(field, answers, lang);
        parts.push(`${translated(field.label)}: ${value || translated(notRecorded)}`);
      }
      if (section.id === 'function' && intelligibility(answers) !== null) parts.push(translated(pair(`Listener word intelligibility: ${intelligibility(answers).toFixed(1)}% in the recorded sample; descriptive only.`, `وضوح الكلمات للمستمع: ${intelligibility(answers).toFixed(1)}٪ في العينة المسجلة؛ نسبة وصفية فقط.`)));
    }
    if (settings.references !== false) parts.push(translated(pair('Research basis & adaptation limits', 'الأساس البحثي وحدود التكييف')), translated(scopeNote), ...sources.map(source => `[${source.id}] ${source.citation}\n${source.url}${source.doi ? '\nDOI: ' + source.doi : ''}`));
    parts.push('\n' + footer.map(translated).join('\n') + '\nslp.ahmadghanem@gmail.com');
    return parts.filter(Boolean).join('\n\n');
  }
  function measurementError(answers) {
    const understood = String(answers.understoodWords || '').trim(), total = String(answers.totalWords || '').trim();
    if (!understood && !total) return null;
    const numerator = T.number(understood), denominator = T.number(total);
    if (numerator === null || denominator === null || !Number.isInteger(numerator) || !Number.isInteger(denominator) || numerator < 0 || denominator <= 0 || numerator > denominator) return pair('Enter both whole-number word counts: total must exceed zero and understood words must not exceed the total.', 'أدخل العددين الصحيحين للكلمات: يجب أن يتجاوز الإجمالي الصفر وألا تتجاوز الكلمات المفهومة الإجمالي.');
    if (answers.listener === 'not-sampled') return pair('Word counts require a sampled listener. Correct the listener answer or clear both counts.', 'تتطلب أعداد الكلمات عينة لمستمع. صحح إجابة المستمع أو امسح العددين.');
    return null;
  }
  function intelligibility(answers) {
    if (measurementError(answers)) return null;
    const numerator = T.number(answers.understoodWords), denominator = T.number(answers.totalWords);
    return numerator !== null && denominator !== null && denominator > 0 ? numerator / denominator * 100 : null;
  }
  function trialRows(trial, lang, translated) {
    const rows = [
      [pair('Target / instruction', 'الهدف / التعليمات'), trial.target],
      [pair('Sample language', 'لغة العينة'), translated(pair(trial.language === 'ar' ? 'Arabic' : trial.language === 'en' ? 'English' : 'Other (see note)', trial.language === 'ar' ? 'العربية' : trial.language === 'en' ? 'الإنجليزية' : 'أخرى (راجع الملاحظة)'))],
      [pair('Task status', 'حالة المهمة'), translated(T.statusOptions.find(([key]) => key === trial.status)?.[1] || notRecorded)],
      [pair('Elicitation condition', 'شرط الاستثارة'), trial.condition ? translated(T.conditions.find(([key]) => key === trial.condition)?.[1] || notRecorded) : ''],
      [pair('Observed response / transcription', 'الاستجابة الملحوظة / النسخ الصوتي'), trial.response]
    ];
    if (trial.task === 'repeated') trial.repetitions.forEach((value, i) => rows.push([pair(`Attempt ${i + 1}`, `المحاولة ${i + 1}`), value || translated(notRecorded)]));
    if (trial.flags.length) rows.push([pair('Sample annotations', 'تعليقات العينة'), T.flags.filter(([key]) => trial.flags.includes(key)).map(([, labels]) => translated(labels)).join('; ')]);
    const calculated = T.rate(trial);
    if (calculated) {
      rows.push([trial.task === 'smr' ? pair('Complete cycles / seconds', 'دورات كاملة / الثواني') : pair('Syllable repetitions / seconds', 'تكرارات المقطع / الثواني'), `${calculated.count} / ${calculated.seconds}`]);
      rows.push([pair('Descriptive DDK rate', 'معدل DDK الوصفي'), trial.task === 'smr' ? translated(pair(`${calculated.perSecond.toFixed(2)} complete cycles/s; ${calculated.syllablesPerSecond.toFixed(2)} syllables/s (${calculated.syllablesPerCycle} per cycle).`, `${calculated.perSecond.toFixed(2)} دورة كاملة/ث؛ ${calculated.syllablesPerSecond.toFixed(2)} مقطع/ث (${calculated.syllablesPerCycle} في الدورة).`)) : translated(pair(`${calculated.perSecond.toFixed(2)} syllables/s.`, `${calculated.perSecond.toFixed(2)} مقطع/ث.`))]);
    }
    if (trial.note) rows.push([pair('Supporting note / limitations', 'ملاحظة داعمة / القيود'), trial.note]);
    return rows.filter(([, value]) => value);
  }
  function trialReportHTML(answers, translated, lang, both) {
    const trials = T.sanitizeTrials(answers.trials);
    if (!trials.length) return `<p class="no-data">${translated(pair('No speech samples recorded.', 'لم تُسجّل عينات كلام.'))}</p>`;
    return trials.map((trial, index) => `<div class="report-trial"><h4>${index + 1}. ${translated(T.taskById(trial.task).label)}</h4><dl>${trialRows(trial, lang, labels => both ? labels[lang] + '\n' + labels[1 - lang] : labels[lang]).map(([label, value]) => `<div class="report-row${value.length > 500 ? ' long-row' : ''}"><dt>${translated(label)}</dt><dd><span class="user-value" dir="auto">${esc(value)}</span></dd></div>`).join('')}</dl></div>`).join('');
  }
  function trialReportText(answers, translated, lang) {
    const trials = T.sanitizeTrials(answers.trials);
    return trials.length ? trials.map((trial, i) => `${i + 1}. ${translated(T.taskById(trial.task).label)}\n${trialRows(trial, lang, translated).map(([label, value]) => `${translated(label)}: ${value}`).join('\n')}`).join('\n\n') : translated(pair('No speech samples recorded.', 'لم تُسجّل عينات كلام.'));
  }
  return { fields, esc, digits, today, parseDate, dateError, ageAt, ageLabel, choiceChange, sanitizeAnswers, valueText, countAnswers, reportHTML, reportText, measurementError, intelligibility };
});
