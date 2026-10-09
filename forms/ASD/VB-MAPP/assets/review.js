/* Online content audit. Original records remain available through VB_SUPPLIED_DATA.
 * Public sources establish task identities; they do not supply every scoring condition.
 * Corrections with incomplete full/half criteria require the assessor's guide before scoring.
 * Persistent item IDs and image numbers are retained to protect existing case data.
 */
(function () {
  'use strict';
  const D = window.VB_DATA;
  window.VB_SUPPLIED_DATA = JSON.parse(JSON.stringify(D));
  const sources = {
    publisher: { title: 'Mark Sundberg — VB-MAPP', url: 'https://marksundberg.com/vb-mapp/' },
    protocol: { title: 'PaTTAN — published protocol extract', url: 'https://www.pattan.net/getmedia/fd334130-2873-4085-a266-86ebf981a4de/vb_mapp_docs' },
    alignment: { title: 'PaTTAN — milestone alignment', url: 'https://storage.outreach.psu.edu/autism/46Handout10.pdf' },
    tasks: { title: 'Kansas TASN — assessment data sheets', url: 'https://ksdetasn.org/resources/4157' },
    scoring: { title: 'Kansas TASN — scoring guidance', url: 'https://ksdetasn.org/resources/2330' },
    eesa: { title: 'Ensora — EESA scoring workflow', url: 'https://experience.ensorahealth.com/vb-mapp-92/eesa-section-workflow-6301' }
  };
  const pair = (en, ar) => ({ en, ar });
  const corrections = {
    'l2-9': ['25 noun/verb directions', '25 تعليمة تجمع اسماً وفعلاً', 'protocol'],
    'vp2-6': ['Identical matching: 25 items, array 6', 'مطابقة متماثلة: 25 عنصراً، مصفوفة 6', 'protocol'],
    'vp2-7': ['Model-based color/shape sorting: 10 colors or shapes', 'تصنيف حسب نموذج: 10 ألوان أو أشكال', 'alignment'],
    'vp2-8': ['Identical matching: array 8 with similar distractors', 'مطابقة متماثلة: مصفوفة 8 مع مشتتات متشابهة', 'tasks'],
    'vp2-9': ['Non-identical matching: array 10', 'مطابقة غير متماثلة: مصفوفة 10', 'tasks'],
    'vp2-10': ['Object/picture matching with similar distractors', 'مطابقة الأشياء بالصور مع مشتتات متشابهة', 'tasks'],
    'p2-7': ['Functional toy use: 5 items', 'استخدام وظيفي للألعاب: 5 عناصر', 'alignment'],
    'p2-8': ['Creative use of everyday objects: 2 occasions', 'استخدام إبداعي للأشياء اليومية: مناسبتان', 'alignment'],
    'p2-9': ['Independent playground activity: 5 minutes', 'نشاط مستقل على تجهيزات الملعب: 5 دقائق', 'alignment'],
    'p2-10': ['Assembling multipart toys: 5 material sets', 'تركيب ألعاب متعددة الأجزاء: 5 مجموعات مواد', 'alignment'],
    'lr2-6': ['Food/drink selection: array 5', 'اختيار طعام أو شراب: مصفوفة 5', 'tasks'],
    'lr2-7': ['Selection from verbal associations: array 8', 'اختيار وفق علاقة لفظية: مصفوفة 8', 'tasks'],
    'li2-6': ['Intelligibility of 10 labels to a familiar listener who cannot see the items', 'وضوح 10 تسميات لمستمع مألوف لا يرى الأشياء', 'alignment'],
    'li2-7': ['Receptive vocabulary: 100 words', 'مفردات استقبالية: 100 كلمة', 'alignment'],
    'li2-8': ['10 different two-word utterances/day; exclude echoing', '10 عبارات مختلفة من كلمتين يومياً؛ باستثناء الترديد', 'alignment'],
    'li2-9': ['Functional prosody: 5 occasions/day', 'تنغيم وظيفي: 5 مناسبات يومياً', 'alignment'],
    'li2-10': ['Expressive vocabulary: 300 words; exclude echoing', 'مفردات تعبيرية: 300 كلمة؛ باستثناء الترديد', 'alignment'],
    's2-8': ['Sustained peer play; verify the conflicting duration criterion', 'لعب اجتماعي مستمر؛ تحقق من تعارض معيار المدة', 'scoring']
  };
  const instructions = pair('Use the item-specific administration conditions and full/half-point criteria from your guide. The previous description and criteria are retained below for comparison.', 'استخدم شروط التطبيق ومعايير النقطة الكاملة ونصف النقطة الخاصة بالبند من دليلك. احتُفظ بالوصف والمعايير السابقة أدناه للمقارنة.');
  // Assessor-facing task explanations. These are practical instructions, not a
  // replacement for the guide's item-specific full/half-point scoring rules.
  const administration = {
    'l2-9': pair('Prepare objects that support different actions. Give a spoken noun-and-action instruction, such as "push the car", without demonstrating it. Record which combinations the child completes and any prompts used.', 'جهّز أشياء يمكن تنفيذ أفعال مختلفة بها. أعطِ تعليمة لفظية تجمع الاسم والفعل، مثل «ادفع السيارة»، دون عرض نموذج للحركة. سجّل التركيبات التي ينفذها الطفل وأي مساعدة قُدمت.'),
    'vp2-6': pair('Prepare identical object or picture pairs. Place six comparison items in varying positions, present a matching sample, and ask the child to find its identical match. Keep a record across 25 target items.', 'جهّز أزواجاً متطابقة من الأشياء أو الصور. ضع ستة عناصر مقارنة في مواضع متغيرة، ثم قدّم النموذج واطلب من الطفل إيجاد مطابقه. احتفظ بسجل للاستجابات عبر 25 عنصراً مستهدفاً.'),
    'vp2-7': pair('Set out a sorting model and items that vary in color or shape. Have the child sort by the modeled property, rather than by an unrelated object category. Record the colors or shapes sorted and any assistance.', 'اعرض نموذجاً للتصنيف وعناصر تختلف في اللون أو الشكل. اطلب من الطفل التصنيف وفق الخاصية المعروضة، لا وفق فئة الأشياء. سجّل الألوان أو الأشكال المصنفة وأي مساعدة.'),
    'vp2-8': pair('Present an identical matching sample with eight comparison items, including visually similar distractors. Vary item positions and record selections, errors and prompts.', 'قدّم نموذج مطابقة متماثلة مع ثمانية عناصر مقارنة تتضمن مشتتات متشابهة بصرياً. غيّر مواضع العناصر وسجّل الاختيارات والأخطاء والتلميحات.'),
    'vp2-9': pair('Use different examples of the same item, such as two different cups. Present a sample with ten comparison items. Record whether the child matches by identity despite the changed appearance.', 'استخدم أمثلة مختلفة للشيء نفسه، مثل كوبين مختلفين. قدّم نموذجاً مع عشرة عناصر مقارنة. سجّل قدرة الطفل على المطابقة رغم اختلاف المظهر.'),
    'vp2-10': pair('Prepare objects, corresponding pictures, and similar distractors. Test object-to-picture and picture-to-object matching using the arrangements in the scoring guide. Record each direction separately.', 'جهّز أشياء وصورها المقابلة ومشتتات متشابهة. افحص مطابقة الشيء بالصورة والصورة بالشيء وفق ترتيب دليل التسجيل. سجّل كل اتجاه على حدة.'),
    'p2-7': pair('Provide five familiar toys or play materials. Observe whether the child uses each for its usual purpose without being shown how. Record the independent action and any help.', 'قدّم خمس ألعاب أو مواد لعب مألوفة. لاحظ استخدام الطفل كلّاً منها لوظيفتها المعتادة دون عرض طريقة الاستخدام. سجّل الفعل المستقل وأي مساعدة.'),
    'p2-8': pair('Observe free play with safe everyday materials. Look for two occasions of creative use or substitution, such as using a box as a pretend vehicle. Do not count actions copied immediately from an adult model.', 'راقب اللعب الحر بمواد يومية آمنة. ابحث عن مناسبتين لاستخدام إبداعي أو رمزي، مثل استخدام صندوق كمركبة في اللعب التخيلي. لا تخلط ذلك مع تقليد نموذج بالغ فوراً.'),
    'p2-9': pair('Observe the child using suitable playground equipment. Time independent participation, noting interruptions and help. Supervise safety without counting adult-directed movement as independent play.', 'راقب الطفل أثناء استخدام تجهيزات ملعب مناسبة. قِس مدة المشاركة المستقلة وسجّل الانقطاعات والمساعدة. وفّر إشراف السلامة، مع التمييز بين اللعب المستقل والحركة التي يوجّهها البالغ.'),
    'p2-10': pair('Offer five sets of toys with parts that fit together. Observe how the child connects and assembles them. Record each completed set and the help provided.', 'قدّم خمس مجموعات من الألعاب ذات الأجزاء القابلة للتركيب. لاحظ كيفية وصل الأجزاء وتجميعها. سجّل كل مجموعة مكتملة والمساعدة المقدمة.'),
    'lr2-6': pair('Arrange five items or pictures, including food and drink choices. Use the guide\'s verbal food/drink cues without pointing to the answer. Record selections and rotate positions.', 'رتّب خمسة أشياء أو صور تتضمن خيارات طعام وشراب. استخدم المثيرات اللفظية الخاصة بالطعام والشراب في الدليل دون الإشارة إلى الإجابة. سجّل الاختيارات وغيّر مواضعها.'),
    'lr2-7': pair('Arrange eight items or pictures. Present verbal associations or sentence fill-ins without naming the target, then record which item the child selects. Vary positions and association types.', 'رتّب ثمانية أشياء أو صور. قدّم علاقات لفظية أو جملاً لإكمالها دون تسمية الإجابة المستهدفة، ثم سجّل العنصر الذي يختاره الطفل. نوّع المواضع وأنواع العلاقات.'),
    'li2-6': pair('Have the child name ten familiar items. A familiar listener must identify the spoken labels without seeing the item or picture. Record the listener\'s interpretation and the child\'s exact production.', 'اطلب من الطفل تسمية عشرة أشياء مألوفة. يحدد مستمع مألوف التسميات المسموعة دون رؤية الشيء أو الصورة. سجّل ما فهمه المستمع والإنتاج الفعلي للطفل.'),
    'li2-7': pair('Compile receptive words across observations and direct probes. Ask the child to select or act on spoken words without a visual cue to the answer. Count distinct understood words, not repeated trials of the same word.', 'اجمع المفردات الاستقبالية من الملاحظة والفحص المباشر. اطلب من الطفل الاختيار أو تنفيذ الاستجابة للكلمة المسموعة دون تلميح بصري للإجابة. احسب الكلمات المختلفة المفهومة، لا تكرار محاولات الكلمة نفسها.'),
    'li2-8': pair('Collect a daily language sample during routines and play. Write down different spontaneous two-word utterances and their contexts. Exclude immediate echoing; do not use a picture board to prompt the sample.', 'اجمع عينة لغوية يومية أثناء الروتين واللعب. دوّن العبارات التلقائية المختلفة المؤلفة من كلمتين وسياقها. استبعد الترديد الفوري، ولا تستخدم لوحة صور لاستثارة العينة.'),
    'li2-9': pair('Observe speech in natural interactions during the day. Record occasions when pitch, stress or rhythm serves a communicative purpose, such as a question or emphasis, with the utterance and context.', 'راقب الكلام في التفاعلات الطبيعية خلال اليوم. سجّل المناسبات التي تخدم فيها طبقة الصوت أو النبر أو الإيقاع غرضاً تواصلياً، مثل السؤال أو التأكيد، مع العبارة وسياقها.'),
    'li2-10': pair('Compile distinct words the child uses meaningfully across people and routines. Record examples and information sources. Count each word once and exclude immediate echoing.', 'اجمع الكلمات المختلفة التي يستخدمها الطفل استخداماً ذا معنى عبر الأشخاص والأنشطة اليومية. سجّل الأمثلة ومصادر المعلومات. احسب كل كلمة مرة واحدة واستبعد الترديد الفوري.'),
    's2-8': pair('Observe play with another child during a naturally available activity. Time sustained engagement and record reciprocal actions, interruptions and adult help. Use the duration and full/half-point rules in your scoring guide.', 'راقب اللعب مع طفل آخر في نشاط طبيعي متاح. قِس مدة الاستمرار وسجّل التبادلات والانقطاعات ومساعدة البالغ. استخدم المدة وشروط النقطة الكاملة ونصف النقطة المحددة في دليل التسجيل.')
  };
  const scoringSetup = pair('Record the observed examples, counts or duration and any prompts. Enter this item\'s full and half-point conditions in the scoring field, then select the observed result. A blank score means not assessed.', 'وثّق الأمثلة الملحوظة والأعداد أو المدة وأي تلميحات. أدخل شروط النقطة الكاملة ونصف النقطة الخاصة بهذا البند في حقل التسجيل، ثم اختر النتيجة الملحوظة. الدرجة الفارغة تعني أن البند لم يُقيّم.');
  D.milestones = D.milestones.map(item => {
    const change = corrections[item.id];
    if (!change) return item;
    const summary = item.id === 's2-8' ? item.text : pair(change[0], change[1]);
    return { ...item, text: summary, objective: undefined,
      application: instructions, scoring: instructions, requiresCriteria: true,
      guide: { text: summary, objective: item.id === 's2-8' ? pair('Assess sustained social play with a peer.', 'تقييم استمرار اللعب الاجتماعي مع طفل آخر.') : pair('Assess this skill: ' + summary.en + '.', 'تقييم المهارة التالية: ' + summary.ar + '.'), application: administration[item.id], scoring: scoringSetup },
      revision: 'online-2026-10-08', original: item, source: sources[change[2]] };
  });
  const imitation = [
    [6, 'Imitate 10 object actions after selecting the matching object', 'تقليد 10 أفعال بالأشياء بعد اختيار الشيء المطابق',
      'Model an action with an object; offer the child three objects and ask them to copy it. Note both the selected object and the action.', 'اعرض فعلاً باستخدام شيء، وقدّم للطفل ثلاثة أشياء واطلب منه التقليد. سجّل الشيء المختار والفعل الذي نفذه.'],
    [7, 'Imitate 20 different fine-motor actions', 'تقليد 20 حركة حركية دقيقة مختلفة',
      'Model varied finger and hand movements and ask the child to copy them. Record distinct movements and any physical or verbal help.', 'اعرض حركات متنوعة للأصابع واليدين واطلب من الطفل تقليدها. سجّل الحركات المختلفة وأي مساعدة جسدية أو لفظية.'],
    [8, 'Imitate 10 different three-action sequences', 'تقليد 10 تسلسلات مختلفة من ثلاثة أفعال',
      'Model three actions in order, then ask the child to copy the complete sequence. Record the actions performed, their order and any help.', 'اعرض ثلاثة أفعال بالترتيب، ثم اطلب من الطفل تقليد التسلسل كاملاً. سجّل الأفعال المنفذة وترتيبها وأي مساعدة.'],
    [9, 'Spontaneously imitate five functional skills', 'تقليد خمس مهارات وظيفية بصورة تلقائية',
      'Observe ordinary routines after another person performs a useful action. Record spontaneous copies, such as using a utensil or putting on clothing, separately from prompted copies.', 'راقب الأنشطة اليومية بعد أداء شخص آخر فعلاً وظيفياً. سجّل التقليد التلقائي، مثل استخدام أداة أو ارتداء الملابس، بصورة منفصلة عن التقليد المستثار بالتلميح.'],
    [10, 'Generalize imitation to new actions with and without objects', 'تعميم التقليد إلى أفعال جديدة باستخدام الأشياء وبدونها',
      'Model safe actions that have not been directly taught, with and without objects. Record accurate copies and approximations separately from previously trained actions.', 'اعرض أفعالاً آمنة لم تُدرّس مباشرة، باستخدام الأشياء وبدونها. سجّل التقليد الدقيق والمحاولات التقريبية بصورة منفصلة عن الأفعال المدربة سابقاً.']
  ];
  D.additionalMilestones = imitation.map(([milestone, en, ar, howEn, howAr]) => {
    const text = pair(en, ar);
    return { id: `i2-${milestone}`, category: 'Imitation', level: 2, milestone, missing: true,
      text, guide: { text, objective: pair('Assess this skill: ' + en + '.', 'تقييم قدرة الطفل على ' + ar + '.'), application: pair(howEn, howAr), scoring: scoringSetup },
      source: { title: 'Sundberg — motor-imitation examples and scoring extract', url: 'https://storage.outreach.psu.edu/autism/18%20and%2030%20Handout%204_0.pdf' } };
  });
  // Keep the conflicting original transition scale as historical text only.
  D.transitions = D.transitions.map(item => item.id !== 'tr-6' ? item : {
    ...item, scoring: instructions, requiresCriteria: true,
    revision: 'online-2026-10-08', original: item, source: sources.scoring
  });
  D.reviewAudit = { date: '2026-10-08', sources, changedMilestones: Object.keys(corrections),
    note: pair('Public-source review identified mismatched tasks and incomplete criteria. Enter verified guide criteria for flagged records. Other supplied criteria are retained, not certified against the complete guide.', 'كشفت مراجعة المصادر العامة عن بنود غير مطابقة ومعايير غير مكتملة. أدخل معايير الدليل المتحقق منها للبنود المحددة. احتُفظ ببقية المعايير المرفقة دون اعتماد مطابقتها للدليل الكامل.') };
  D.eesaScoringGuidance = {
    common: pair('Follow the administration procedure in your EESA guide. Record the actual stimulus language; Arabic translations are not interchangeable phonological stimuli.', 'اتبع طريقة التطبيق في دليل EESA. سجّل لغة المثير الفعلية؛ الترجمات العربية ليست مثيرات صوتية مكافئة تلقائياً.'),
    1: pair('1: correct sounds and syllable count. 0.5: recognizable with consonant errors or extra syllables. 0: no response, wrong vowels, or missing syllables.', '1: أصوات وعدد مقاطع صحيحان. 0.5: استجابة مفهومة مع أخطاء صامتة أو مقاطع زائدة. 0: غياب الاستجابة أو أخطاء الحركات أو نقص المقاطع.'),
    4: pair('Use the prosody criteria in your guide. Preserve the target stress shown by capital letters in the English stimulus.', 'استخدم معايير التنغيم في دليلك. حافظ على النبر المستهدف الذي تحدده الأحرف الإنجليزية الكبيرة.'),
    5: pair('Use the guide criteria for pitch, loudness, and duration. This group has no half-point option.', 'استخدم معايير الدليل لطبقة الصوت وشدته ومدته. لا تتوفر نصف نقطة لهذه المجموعة.')
  };
  for (const [id, entry] of Object.entries(window.VB_STIMULI)) {
    const item = D.milestones.find(record => record.id === id);
    if (!item?.revision) continue;
    entry.originalTask = entry.task; entry.task = item.text;
    entry.instruction = pair('Prepare stimuli for the corrected skill above, using the array, distractors, and trials specified in your guide. The numbered path is unchanged; an old board may assess the wrong task.', 'جهّز المثيرات للمهارة المصححة أعلاه وفق المصفوفة والمشتتات والمحاولات المحددة في دليلك. بقي المسار الرقمي نفسه؛ وقد تقيس اللوحة القديمة بنداً مختلفاً.');
    if (id === 'li2-6') entry.instruction = pair('Prepare naming stimuli for the corrected intelligibility task. A familiar listener must judge the response without seeing the item or picture; follow your guide for trials and criteria.', 'جهّز مثيرات تسمية لبند وضوح الكلام المصحح. يجب أن يحكم مستمع مألوف على الاستجابة دون أن يرى الشيء أو الصورة؛ اتبع دليلك للمحاولات والمعايير.');
    // Utterance/prosody samples do not require a picture board. Intelligibility
    // does permit a naming stimulus, hidden from the judging listener.
    if (['li2-8', 'li2-9'].includes(id)) entry.assessorOnly = true;
  }
})();
