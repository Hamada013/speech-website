/* Original informal elicitation examples, not standardized or equated test items. */
(function (root) {
  'use strict';
  const pair = (en, ar) => [en, ar];
  const tasks = [
    { id: 'conversation', label: pair('Connected / spontaneous speech', 'الكلام المتصل / العفوي'), prompts: { en: ['Describe your usual morning.', 'Tell me about an activity you enjoy.'], ar: ['احكِ لي عن روتينك في الصباح.', 'احكِ لي عن نشاط تحبّه.'] }, guide: pair('Sample a familiar topic. Record the amount of speech and any partner assistance.', 'خذ عينة عن موضوع مألوف. سجّل كمية الكلام وأي مساعدة من الشريك.') },
    { id: 'automatic', label: pair('Familiar automatic sequences', 'سلاسل كلامية تلقائية مألوفة'), prompts: { en: ['Count from one to ten.', 'Say the days of the week.'], ar: ['عدّ من واحد إلى عشرة.', 'اذكر أيام الأسبوع.'] }, guide: pair('Use only a sequence the patient knows. Compare with generative speech without assuming automatic speech will be preserved.', 'استخدم سلسلة يعرفها المريض فقط. قارن بالكلام المُنشأ دون افتراض أن الكلام التلقائي محفوظ.') },
    { id: 'word', label: pair('Familiar word repetition', 'تكرار كلمات مألوفة'), prompts: { en: ['tea', 'book', 'window', 'banana'], ar: ['باب', 'بيت', 'قهوة', 'موزة'] }, guide: pair('Check familiarity and the intended pronunciation. Adjust the target to the patient’s language and dialect.', 'تحقق من الألفة والنطق المقصود. عدّل الهدف وفق لغة المريض ولهجته.') },
    { id: 'repeated', label: pair('Same target, three attempts', 'الهدف نفسه، ثلاث محاولات'), prompts: { en: ['banana', 'telephone', 'hospital'], ar: ['سيّارة', 'مدرسة', 'برتقال'] }, guide: pair('Elicit the same target three times under the same conditions. Record each production separately; changing errors are descriptive, not a diagnostic cutoff.', 'استثر الهدف نفسه ثلاث مرات بالشروط نفسها. سجّل كل إنتاج بصورة منفصلة؛ تغير الأخطاء وصف وليس حداً تشخيصياً.') },
    { id: 'complex', label: pair('Increasing length / speech demand', 'زيادة الطول / متطلبات الكلام'), prompts: { en: ['tea → teacup → My tea is hot.', 'book → bookshelf → Put the book on the shelf.'], ar: ['باب ← باب البيت ← افتح باب البيت.', 'ماء ← كوب ماء ← أريد كوب ماء.'] }, guide: pair('Document each chosen target and compare its demands. These sets are not matched across languages or controlled for familiarity, syntax or phonotactics.', 'وثّق كل هدف مختار وقارن متطلباته. ليست هذه المجموعات متكافئة بين اللغات أو مضبوطة للألفة أو النحو أو البنية الصوتية.') },
    { id: 'reading', label: pair('Oral reading when appropriate', 'القراءة الجهرية عند الملاءمة'), prompts: { en: ['The family sat in the garden and talked about their day.'], ar: ['جلست الأسرة في الحديقة وتحدثت عن يومها.'] }, guide: pair('Use only if reading and visual access are adequate. Record literacy / language constraints; a reading failure is not proof of AOS.', 'استخدمها إذا كانت القدرة القرائية والوصول البصري مناسبين. وثّق قيود القراءة / اللغة؛ لا يثبت فشل القراءة تعذر الأداء النطقي.') },
    { id: 'amr', label: pair('AMR — repeat one syllable', 'AMR — تكرار مقطع واحد'), prompts: { en: ['/pa/', '/ta/', '/ka/'], ar: ['/ba/', '/ta/', '/ka/'] }, guide: pair('Use a familiar syllable and document its phonemes and vowel. /p/ is not required for Arabic speakers. Count the syllable repetitions actually included in the measured interval; note errors and cueing.', 'استخدم مقطعاً مألوفاً ووثّق أصواته وصائته. لا يُشترط /p/ للناطقين بالعربية. عدّ تكرارات المقطع المشمولة فعلياً في الفترة المقاسة؛ وسجّل الأخطاء والتلقين.') },
    { id: 'smr', label: pair('SMR — repeat the syllable sequence', 'SMR — تكرار سلسلة المقاطع'), prompts: { en: ['/pa-ta-ka/'], ar: ['/ba-ta-ka/'] }, guide: pair('Record sequence accuracy and rhythm as well as pace. The count below means complete three-syllable cycles, excluding incomplete cycles; it is not a diagnostic score.', 'سجّل دقة السلسلة وإيقاعها إضافة إلى السرعة. يعني العدد أدناه دورات كاملة من ثلاثة مقاطع مع استبعاد الدورات الناقصة؛ وليس درجة تشخيصية.') }
  ];
  const statusOptions = [ ['not-assessed', pair('Not assessed yet', 'لم تُقيّم بعد')], ['completed', pair('Sample completed', 'اكتملت العينة')], ['limited', pair('Limited / partly elicited', 'محدودة / استثيرت جزئياً')], ['not-elicited', pair('Could not elicit', 'تعذرت الاستثارة')] ];
  const conditions = [['independent', pair('Independent / no model', 'مستقل / دون نموذج')], ['model', pair('After a spoken model', 'بعد نموذج منطوق')], ['together', pair('Together with clinician', 'مع الفاحص')], ['cued', pair('Additional cues — specify', 'تلقين إضافي — حدد')]];
  const flags = [['distortion', pair('Sound distortion', 'تشوه صوتي')], ['sound-change', pair('Sound changes / omissions', 'تغييرات أصوات / حذف')], ['timing', pair('Timing / segmentation', 'التوقيت / تقطيع المقاطع')], ['stress', pair('Stress / prominence change', 'تغير النبر / البروز')], ['search', pair('Searching / repeated attempts', 'بحث / محاولات متكررة')]];
  const taskById = id => tasks.find(task => task.id === id);
  const digits = value => String(value ?? '').replace(/[٠-٩]/g, c => String(c.charCodeAt(0) - 1632)).replace(/[۰-۹]/g, c => String(c.charCodeAt(0) - 1776)).replace('٫', '.');
  const number = value => { const text = digits(value).trim(), parsed = Number(text); return /^\d+(?:\.\d+)?$/.test(text) && Number.isFinite(parsed) ? parsed : null; };
  function createTrial(id, task, language, target = '') {
    return { id, task, language, target, status: 'not-assessed', condition: '', response: '', repetitions: ['', '', ''], flags: [], count: '', seconds: '', syllablesPerCycle: task === 'smr' ? '3' : '', note: '' };
  }
  function sanitizeTrials(value) {
    if (!Array.isArray(value)) return [];
    return value.filter(trial => trial && typeof trial === 'object' && taskById(trial.task)).map((trial, index) => {
      const clean = createTrial(index + 1, trial.task, ['en', 'ar', 'other'].includes(trial.language) ? trial.language : 'other');
      for (const key of ['target', 'response', 'count', 'seconds', 'syllablesPerCycle', 'note']) if (typeof trial[key] === 'string') clean[key] = trial[key];
      if (statusOptions.some(([key]) => key === trial.status)) clean.status = trial.status;
      if (conditions.some(([key]) => key === trial.condition)) clean.condition = trial.condition;
      clean.repetitions = [0, 1, 2].map(index => typeof trial.repetitions?.[index] === 'string' ? trial.repetitions[index] : '');
      clean.flags = flags.filter(([key]) => Array.isArray(trial.flags) && trial.flags.includes(key)).map(([key]) => key);
      return clean;
    });
  }
  function trialError(trial) {
    if (!trial.target.trim()) return pair('Enter the exact target / sample instruction, or remove this row.', 'أدخل الهدف / تعليمات العينة بدقة، أو احذف هذه العينة.');
    const sampled = ['completed', 'limited'].includes(trial.status);
    if (!sampled && (trial.flags.length || trial.response.trim() || trial.repetitions.some(value => value.trim()) || trial.count.trim() || trial.seconds.trim())) return pair('Select Completed or Limited for a sample with recorded speech results. If it could not be elicited, put the explanation in the note.', 'اختر «اكتملت» أو «محدودة» لعينة ذات نتائج كلام مسجلة. إذا تعذرت استثارتها، ضع التوضيح في الملاحظة.');
    if (trial.task === 'repeated' && trial.status === 'completed' && trial.repetitions.some(value => !value.trim())) return pair('Record all three productions for a completed repeated-word sample, or select Limited.', 'سجّل الإنتاجات الثلاثة لعينة تكرار كلمة مكتملة، أو اختر «محدودة».');
    if (['amr', 'smr'].includes(trial.task) && (trial.count.trim() || trial.seconds.trim())) {
      const count = number(trial.count), seconds = number(trial.seconds);
      if (count === null || !Number.isInteger(count) || count < 0 || seconds === null || seconds <= 0) return pair('Enter a whole-number count (zero or above) and a measured duration greater than zero, or leave both blank.', 'أدخل عدداً صحيحاً (صفراً أو أكثر) وزمناً مقاساً أكبر من الصفر، أو اترك الحقلين فارغين.');
      if (trial.task === 'smr' && (!Number.isInteger(number(trial.syllablesPerCycle)) || number(trial.syllablesPerCycle) <= 0)) return pair('Record the positive whole-number syllable count per complete SMR cycle for the target used.', 'سجّل عدد المقاطع الصحيح الموجب في كل دورة SMR كاملة للهدف المستخدم.');
    }
    return null;
  }
  function rate(trial) {
    if (!['amr', 'smr'].includes(trial.task) || !['completed', 'limited'].includes(trial.status) || trialError(trial)) return null;
    const count = number(trial.count), seconds = number(trial.seconds);
    if (count === null || seconds === null) return null;
    const syllablesPerCycle = trial.task === 'smr' ? number(trial.syllablesPerCycle) : 1;
    return { count, seconds, syllablesPerCycle, perSecond: count / seconds, syllablesPerSecond: count * syllablesPerCycle / seconds };
  }
  const data = { tasks, statusOptions, conditions, flags, taskById, number, createTrial, sanitizeTrials, trialError, rate };
  if (typeof module === 'object' && module.exports) module.exports = data;
  else root.AOSTasks = data;
})(typeof globalThis !== 'undefined' ? globalThis : this);
