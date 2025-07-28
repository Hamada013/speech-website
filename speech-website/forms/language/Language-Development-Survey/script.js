// ====== TRANSLATIONS ======
const translations = {
  en: {
    formTitle: "Language Development Survey",
    basicInfo: "Basic Information",
    selectAgeGroup: "Select Age Group",
    childName: "Child's Name",
    parentName: "Parent's Name",
    dob: "Date of Birth",
    date: "Assessment Date",
    examinerName: "Examiner's Name",
    instructions: "Instructions",
    instructionsText: "For each skill listed below, please select the skill if your child demonstrates it spontaneously. If the skill is not present, leave it unselected. When you complete the checklist for the selected age group, a summary will list the skills that are missing. You may then choose to evaluate another age group or export the findings.",
    generateSummary: "Generate Summary",
    findingsSummary: "Findings Summary",
    missingSkills: "Missing Skills",
    evaluateAnother: "Would you like to evaluate another age group?",
    yes: "Yes",
    no: "No",
    changeAge: "Change Age Group",
    noSkillsMissing: "All skills are present for this age group.",
    exportTxt: "Export as TXT",
    reportTitle: "Language Development Assessment Report",
    reportChild: "Child",
    reportParent: "Parent",
    reportDob: "Date of Birth",
    reportDate: "Assessment Date",
    reportExaminer: "Examiner",
    reportGenerated: "Report generated on",
    ageGroups: {
      "0-6": "0-6 Months",
      "7-12": "7-12 Months",
      "13-18": "13-18 Months",
      "19-24": "19-24 Months",
      "2-3": "2-3 Years",
      "3-4": "3-4 Years",
      "4-5": "4-5 Years",
      "5-6": "5-6 Years",
      "6-7": "6-7 Years"
    }
  },
  ar: {
    formTitle: "استبيان تطور اللغة",
    basicInfo: "المعلومات الأساسية",
    selectAgeGroup: "اختر الفئة العمرية",
    childName: "اسم الطفل",
    parentName: "اسم الوالد",
    dob: "تاريخ الميلاد",
    date: "تاريخ التقييم",
    examinerName: "اسم الفاحص",
    instructions: "التعليمات",
    instructionsText: "لكل مهارة مدرجة أدناه، يرجى تحديد المهارة إذا كان طفلك يظهرها تلقائيًا. إذا لم تكن المهارة موجودة، اتركها غير محددة. عند الانتهاء من قائمة المراجعة للفئة العمرية المحددة، سيعرض الملخص المهارات المفقودة. يمكنك بعد ذلك اختيار تقييم فئة عمرية أخرى أو تصدير النتائج.",
    generateSummary: "إنشاء الملخص",
    findingsSummary: "ملخص النتائج",
    missingSkills: "المهارات المفقودة",
    evaluateAnother: "هل ترغب في تقييم فئة عمرية أخرى؟",
    yes: "نعم",
    no: "لا",
    changeAge: "تغيير الفئة العمرية",
    noSkillsMissing: "جميع المهارات موجودة في هذه الفئة العمرية.",
    exportTxt: "تصدير كملف TXT",
    reportTitle: "تقرير تقييم تطور اللغة",
    reportChild: "الطفل",
    reportParent: "الوالد",
    reportDob: "تاريخ الميلاد",
    reportDate: "تاريخ التقييم",
    reportExaminer: "الفاحص",
    reportGenerated: "تم إنشاء التقرير في",
    ageGroups: {
      "0-6": "0-6 أشهر",
      "7-12": "7-12 شهرًا",
      "13-18": "13-18 شهرًا",
      "19-24": "19-24 شهرًا",
      "2-3": "2-3 سنوات",
      "3-4": "3-4 سنوات",
      "4-5": "4-5 سنوات",
      "5-6": "5-6 سنوات",
      "6-7": "6-7 سنوات"
    }
  }
};

// Skills database
const skillsData = {
  en: {
    "0-6": [
      "Frequently coos, gurgles, and makes pleasure sounds",
      "Uses a different cry to express different needs",
      "Smiles when spoken to",
      "Recognizes voices",
      "Localizes to sound",
      "Listens to speech",
      "Uses the phonemes /b/, /p/, and /m/ in babbling",
      "Uses sounds or gestures to indicate wants",
      "Responds to 'no' and changes in tone of voice"
    ],
    "7-12": [
      "Understands 'no' and 'hot'",
      "Responds to simple requests",
      "Understands and responds to his/her own name",
      "Recognizes words for common items (e.g., cup, shoe, juice)",
      "Babbles using long and short groups of sounds",
      "Uses a large variety of sounds in babbling",
      "Imitates some adult speech sounds and intonation patterns",
      "Uses speech sounds rather than only crying to get attention",
      "Listens when spoken to",
      "Uses sound approximations",
      "Begins to change babbling to jargon",
      "Uses speech intentionally for the first time",
      "Uses nouns almost exclusively",
      "Has an expressive vocabulary of one to three words",
      "Uses characteristic gestures or vocalizations to express wants"
    ],
    "13-18": [
      "Imitates individual words",
      "Uses adult-like intonation patterns",
      "Uses echolalia and jargon",
      "Omits some initial consonants and almost all final consonants",
      "Produces mostly unintelligible speech",
      "Follows simple commands",
      "Receptively identifies one to three body parts",
      "Has an expressive vocabulary of 3 to 20 or more words (mostly nouns)",
      "Combines gestures and vocalization",
      "Makes requests for more of desired items"
    ],
    "19-24": [
      "Uses words more frequently than jargon",
      "Has an expressive vocabulary of 50 to 100 or more words",
      "Has a receptive vocabulary of 300 or more words",
      "Starts to combine nouns with verbs and nouns with adjectives",
      "Begins to use pronouns",
      "Maintains unstable voice control",
      "Uses appropriate intonation for questions",
      "Is approximately 25% to 50% intelligible to strangers",
      "Asks and answers 'What's that?' questions",
      "Enjoys listening to stories",
      "Knows five body parts",
      "Accurately names a few familiar objects",
      "Understands basic categories (e.g., toys, food)",
      "Points to pictures in a book when named"
    ],
    "2-3": [
      "Speech is 50% to 75% intelligible",
      "Understands one and all",
      "Verbalizes toilet needs (before, during, or after act)",
      "Requests items by name",
      "Identifies several body parts",
      "Follows two-part commands",
      "Asks one- to two-word questions",
      "Uses two- to four-word phrases",
      "Uses words that are general in context",
      "Continues use of echolalia when difficulties in speech are encountered",
      "Has a receptive vocabulary of 500 to 900 or more words",
      "Has an expressive vocabulary of 50 to 250 or more words",
      "Exhibits multiple grammatical errors",
      "Understands most things said to him or her",
      "Frequently exhibits repetitions—especially starters, 'I,' and first syllables",
      "Increases range of pitch",
      "Uses vowels correctly",
      "Consistently uses initial consonants (although some are misarticulated)",
      "Frequently omits medial consonants",
      "Frequently omits or substitutes final consonants",
      "Uses auxiliary 'is' including the contracted form (e.g., isn't, he's)",
      "Uses some regular past-tense verbs, possessive morphemes, pronouns, and imperatives",
      "Maintains topic over several conversational turns"
    ],
    "3-4": [
      "Understands object functions",
      "Understands opposites (e.g., stop-go, in-out, big-little)",
      "Follows two- and three-part commands",
      "Produces simple verbal analogies",
      "Uses language to express emotion",
      "Uses four to five words in sentences",
      "Repeats 6- to 13-syllable sentences accurately",
      "May continue to use echolalia",
      "Uses nouns and verbs most frequently"
    ],
    "4-5": [
      "Is conscious of past and future",
      "Has a receptive vocabulary of 1,200 to 2,000 or more words",
      "Has an expressive vocabulary of 800 to 1,500 or more words",
      "Increases speech rate",
      "Speech is approximately 80% intelligible",
      "Appropriately uses 'is,' 'are,' and 'am' in sentences",
      "Tells two events in chronological order",
      "Engages in long conversations",
      "Sentence grammar improves, although some errors persist",
      "Uses some contractions, irregular plurals, future-tense verbs, and conjunctions",
      "Consistently uses regular plurals, possessives, and simple past-tense verbs",
      "Uses an increasing number of compound or complex sentences",
      "Continues understanding of spatial concepts",
      "Has an expressive vocabulary of 900 to 2,000 or more words",
      "Has a receptive vocabulary of 10,000 or more words",
      "Counts to 10 by rote",
      "Listens to short, simple stories and can answer questions about them",
      "Answers questions about function",
      "Uses adult-like grammar most of the time",
      "Grammatical errors primarily in irregular forms, reflexive pronouns, adverbial suffixes, and comparative/superlative inflections",
      "Uses sentences of four to eight words",
      "Answers complex two-part questions",
      "Asks for word definitions",
      "Speaks at a rate of approximately 186 words per minute",
      "Reduces total number of repetitions",
      "Significantly reduces number of persistent sound omissions and substitutions",
      "Speech is usually intelligible to strangers even though some articulation errors may persist",
      "Accurately tells about experiences at school, at friends' homes, etc."
    ],
    "5-6": [
      "Follows instructions given to a group",
      "Asks 'how' questions",
      "Uses past tense and future tense appropriately",
      "Uses conjunctions",
      "Has a receptive vocabulary of approximately 13,000 words",
      "Sequentially names days of the week",
      "Counts to 30 by rote",
      "Continues to rapidly increase vocabulary",
      "Uses sentence length of four to six words",
      "Reverses sounds occasionally",
      "Exchanges information and asks questions",
      "Uses sentences with details",
      "Accurately relays a story",
      "Sings entire songs and recites nursery rhymes",
      "Communicates easily with adults and other children",
      "Uses appropriate grammar in most cases"
    ],
    "6-7": [
      "Understands left and right",
      "Uses increasingly more complex descriptions",
      "Engages in conversations",
      "Has a receptive vocabulary of approximately 20,000 words",
      "Uses a sentence length of approximately six words",
      "Understands most concepts of time",
      "Counts to 100 by rote",
      "Uses most morphological markers appropriately",
      "Uses passive voice appropriately"
    ]
  },
  ar: {
    "0-6": [
      "يصدر صوت التمتمة والخرخرة وسواء أصوات الفرح",
      "يستخدم بكاء مختلف للتعبير عن احتياجات مختلفة",
      "يبتسم عندما يُخاطب",
      "يتعرف على الأصوات",
      "يحدد مصدر الصوت",
      "يستمع للكلام",
      "يستخدم الأصوات /b/ و/p/ و/m/ في الثرثرة",
      "يستخدم الأصوات أو الإيماءات للإشارة إلى الرغبات",
      "يستجيب لـ'لا' ولتغيير النبرة الصوتية"
    ],
    "7-12": [
      "يفهم كلمة 'لا' و'حار'",
      "يستجيب للطلبات البسيطة",
      "يفهم ويستجيب لاسمه/ها",
      "يتعرف على كلمات الأشياء الشائعة مثل: الكوب، الحذاء، العصير",
      "يثرثر باستخدام مجموعات صوتية طويلة وقصيرة",
      "يستخدم مجموعة واسعة من الأصوات في الثرثرة",
      "يقلد بعض أصوات الكلام ونغمات الكلام البالغين",
      "يستخدم أصوات الكلام بدلاً من البكاء فقط لجذب الانتباه",
      "يستمع عند مخاطبته",
      "يستخدم تقريبات صوتية",
      "يبدأ بتحويل الثرثرة إلى كلام شبيه بالهذيان",
      "يستخدم الكلام بشكل هادف لأول مرة",
      "يستخدم الأسماء بصورة رئيسية",
      "يمتلك مفردات تعبيرية من كلمة إلى ثلاث كلمات",
      "يستخدم إيماءات أو أصواتاً مميزة للتعبير عن الرغبات"
    ],
    "13-18": [
      "يقلد كلمات مفردة",
      "يستخدم أنماط النبرة مثل البالغين",
      "يستخدم الصدى والثرثرة غير المفهومة",
      "يحذف بعض الحروف الساكنة في البداية ومعظم الحروف النهائية",
      "ينتج خطاباً غير مفهوم في الغالب",
      "يتبع التعليمات البسيطة",
      "يسمي من الناحية الفهمية من واحد إلى ثلاثة أجزاء من الجسم",
      "يمتلك مفردات تعبيرية من 3 إلى 20 كلمة أو أكثر، ومعظمها أسماء",
      "يجمع بين الإيماءات واللفظ",
      "يطلب المزيد من الأشياء المطلوبة"
    ],
    "19-24": [
      "يستخدم الكلمات بشكل أكثر من الثرثرة",
      "يمتلك مفردات تعبيرية من 50 إلى 100 كلمة أو أكثر",
      "يمتلك مفردات فهمية من 300 كلمة أو أكثر",
      "يبدأ بدمج الأسماء مع الأفعال والأسماء مع الصفات",
      "يبدأ باستخدام الضمائر",
      "يحافظ على تحكم صوتي غير مستقر",
      "يستخدم النبرة المناسبة للأسئلة",
      "يكون مفهومًا بنسبة تقريبية تتراوح بين 25% و50% للغرباء",
      "يسأل ويجيب على أسئلة 'ما هذا؟'",
      "يستمتع بالاستماع للقصص",
      "يعرف خمسة أجزاء من الجسم",
      "يسمي بعض الأشياء المألوفة بدقة",
      "يفهم الفئات الأساسية مثل: الألعاب، الطعام",
      "يشير إلى الصور في الكتاب عند تسميتها"
    ],
    "2-3": [
      "الكلام مفهوم بنسبة 50% إلى 75%",
      "يفهم الجميع",
      "يعبر عن احتياجات التواليت قبل/أثناء/بعد العملية",
      "يطلب الأشياء بالاسم",
      "يسمي عدة أجزاء من الجسم",
      "يتبع تعليمات ذات جزأين",
      "يسأل أسئلة من كلمة إلى كلمتين",
      "يستخدم عبارات من كلمتين إلى أربع كلمات",
      "يستخدم كلمات عامة في السياق",
      "يستمر باستخدام الصدى عند مواجهة صعوبات في الكلام",
      "يمتلك مفردات فهمية من 500 إلى 900 كلمة أو أكثر",
      "يمتلك مفردات تعبيرية من 50 إلى 250 كلمة أو أكثر",
      "يظهر أخطاء نحو متعددة",
      "يفهم معظم ما يُقال له/ها",
      "يعرض تكرارًا للكلمات—خصوصا الكلمة 'أنا' والمقاطع الأولى",
      "يزيد من نطاق النبرة",
      "يستخدم الحروف المتحركة بشكل صحيح",
      "يستخدم الحروف الظاهرة في البداية بشكل منتظم، رغم وجود أخطاء لفظية",
      "يحذف الحروف الوسطى بشكل متكرر",
      "يحذف أو يستبدل الحروف النهائية بشكل متكرر",
      "يستخدم أفعال المساعدة مثل 'is' بما في ذلك الصيغ المختصرة مثل 'isn't، he’s'",
      "يستخدم بعض أفعال الماضي الاعتيادية وأدوات الملكية والضمائر والأوامر",
      "يحافظ على موضوع النقاش عبر عدة متابعات"
    ],
    "3-4": [
      "يفهم وظائف الأشياء",
      "يفهم الأشياء المتناقضة مثل توقف-انطلاق، داخل-خارج، كبير-صغير",
      "يتبع تعليمات من جزأين وثلاثة أجزاء",
      "ينتج تشبيهات لفظية بسيطة",
      "يستخدم اللغة للتعبير عن المشاعر",
      "يستخدم من أربع إلى خمس كلمات في الجمل",
      "يعيد جملًا مكونة من 6 إلى 13 مقطعًا صوتيًا بدقة",
      "قد يستمر باستخدام الصدى",
      "يستخدم الأسماء والأفعال بشكل أساسي"
    ],
    "4-5": [
      "يدرك الماضي والمستقبل",
      "يمتلك مفردات فهمية من 1,200 إلى 2,000 كلمة أو أكثر",
      "يمتلك مفردات تعبيرية من 800 إلى 1,500 كلمة أو أكثر",
      "يزيد من معدل الكلام",
      "الكلام مفهوم بنسبة حوالي 80%",
      "يستخدم 'is، are، am' بشكل مناسب في الجمل",
      "يروي حدثين بترتيب زمني",
      "يشارك في محادثات طويلة",
      "قواعد الجمل تتحسن مع استمرار بعض الأخطاء",
      "يستخدم بعض الاختصارات والجمع غير النظامي والأفعال المستقبلية وحروف العطف",
      "يستخدم الجمع النظامي وضمائر الملكية وأفعال الماضي البسيطة بشكل منتظم",
      "يستخدم جمل مركبة أو معقدة متزايدة",
      "يستمر بفهم المفاهيم المكانية",
      "يمتلك مفردات تعبيرية من 900 إلى 2,000 كلمة أو أكثر",
      "يمتلك مفردات فهمية من 10,000 كلمة أو أكثر",
      "يعد حتى 10 عن ظهر قلب",
      "يستمع إلى قصص قصيرة وبسيطة ويستطيع الإجابة على أسئلتها",
      "يجاوب على أسئلة عن وظائف الأشياء",
      "يستخدم قواعد النحو البالغة معظم الوقت",
      "تظهر الأخطاء النحوية في الصيغ غير النظامية والضمائر العاكسة واللواحق الظرفية والتصريفات المقارنة/التفضيلية",
      "يستخدم جمل من أربع إلى ثماني كلمات",
      "يجاوب على أسئلة مركبة من جزءين",
      "يسأل عن تعريف الكلمات",
      "يتحدث بمعدل حوالي 186 كلمة في الدقيقة",
      "يقلل عدد التكرارات",
      "يقلل بشكل ملحوظ عدد حذف واستبدال الأصوات المستمرة",
      "الكلام مفهوم لغير المألوفين على الرغم من استمرار بعض أخطاء النطق",
      "يروي بدقة عن التجارب في المدرسة وبيوت الأصدقاء"
    ],
    "5-6": [
      "يتبع التعليمات المقدمة للجماعة",
      "يسأل أسئلة 'كيف'",
      "يستخدم الزمن الماضي والمستقبلي بشكل مناسب",
      "يستخدم حروف العطف",
      "يمتلك مفردات فهمية حوالي 13,000 كلمة",
      "يسرد أيام الأسبوع بالترتيب",
      "يعد حتى 30 عن ظهر قلب",
      "يستمر في زيادة المفردات بسرعة",
      "يستخدم جمل تتكون من أربع إلى ست كلمات",
      "يعكس الأصوات أحيانًا",
      "يتبادل المعلومات ويسأل أسئلة",
      "يستخدم جملًا تشمل تفاصيل",
      "يروي قصة بدقة",
      "يغني أغاني كاملة ويرتل القوافي",
      "يتواصل بسهولة مع البالغين والأطفال",
      "يستخدم القواعد النحوية المناسبة في معظم الأحيان"
    ],
    "6-7": [
      "يفهم اليمين واليسار",
      "يستخدم أوصافًا أكثر تعقيدًا مع الوقت",
      "يشارك في المحادثات",
      "يمتلك مفردات فهمية حوالي 20,000 كلمة",
      "يستخدم جملًا تتكون حوالي ست كلمات",
      "يفهم معظم مفاهيم الوقت",
      "يعد حتى 100 عن ظهر قلب",
      "يستخدم معظم العلامات الصرفية بشكل مناسب",
      "يستخدم المبني للمجهول بشكل مناسب"
    ]
  }
};

// DOM elements
const formTitleEl = document.getElementById('form-title');
const langEnBtn = document.getElementById('lang-en-btn');
const langArBtn = document.getElementById('lang-ar-btn');
const basicInfoHeader = document.getElementById('basic-info-header');
const selectAgeHeader = document.getElementById('select-age-header');
const childNameLabel = document.getElementById('child-name-label');
const parentNameLabel = document.getElementById('parent-name-label');
const dobLabel = document.getElementById('dob-label');
const dateLabel = document.getElementById('date-label');
const examinerNameLabel = document.getElementById('examiner-name-label');
const ageGroupSelect = document.getElementById('age-group-select');
const instructionsBtn = document.getElementById('instructions-btn');
const currentEvaluation = document.getElementById('current-evaluation');
const evaluationTitle = document.getElementById('evaluation-title');
const skillsContainer = document.getElementById('skills-container');
const generateSummaryBtn = document.getElementById('generate-summary-btn');
const findingsSummary = document.getElementById('findings-summary');
const findingsHeader = document.getElementById('findings-header');
const summaryContent = document.getElementById('summary-content');
const evaluateYesBtn = document.getElementById('evaluate-yes-btn');
const evaluateNoBtn = document.getElementById('evaluate-no-btn');
const changeAgeBtn = document.getElementById('change-age-btn');
const evaluatePrompt = document.getElementById('evaluate-prompt');
const instructionsModal = document.getElementById('instructions-modal');
const closeModal = document.querySelector('.close');
const modalText = document.getElementById('modal-text');
const allEvaluations = document.getElementById('all-evaluations');

let currentLang = 'en';
let currentAgeGroup = null;
let selectedSkills = [];
let allEvaluationsData = [];

// Set language
function setLanguage(lang) {
  currentLang = lang;
  
  // Update UI direction
  document.body.dir = lang === 'ar' ? 'rtl' : 'ltr';
  
  // Update button states
  langEnBtn.classList.toggle('active', lang === 'en');
  langArBtn.classList.toggle('active', lang === 'ar');
  
  // Update all text in the UI
  updateUIText();
  
  // Refresh current evaluation if exists
  if (currentAgeGroup) {
    renderSkills(currentAgeGroup);
  }
  
  // Update all saved evaluations
  renderAllEvaluations();
}

// Update all text in the UI
function updateUIText() {
  const t = translations[currentLang];
  
  // Update header and titles
  formTitleEl.textContent = t.formTitle;
  basicInfoHeader.textContent = t.basicInfo;
  selectAgeHeader.textContent = t.selectAgeGroup;
  
  // Update form labels
  childNameLabel.textContent = t.childName;
  parentNameLabel.textContent = t.parentName;
  dobLabel.textContent = t.dob;
  dateLabel.textContent = t.date;
  examinerNameLabel.textContent = t.examinerName;
  
  // Update buttons
  instructionsBtn.textContent = t.instructions;
  changeAgeBtn.textContent = t.changeAge;
  generateSummaryBtn.textContent = t.generateSummary;
  
  // Update modal
  modalText.textContent = t.instructionsText;
  
  // Update findings section
  if (findingsSummary.style.display !== 'none') {
    findingsHeader.textContent = t.findingsSummary;
    evaluatePrompt.textContent = t.evaluateAnother;
    evaluateYesBtn.textContent = t.yes;
    evaluateNoBtn.textContent = t.no;
  }
  
  // Update age group options
  const options = ageGroupSelect.querySelectorAll('option');
  options[0].textContent = `-- ${t.selectAgeGroup} --`;
  options[1].textContent = t.ageGroups["0-6"];
  options[2].textContent = t.ageGroups["7-12"];
  options[3].textContent = t.ageGroups["13-18"];
  options[4].textContent = t.ageGroups["19-24"];
  options[5].textContent = t.ageGroups["2-3"];
  options[6].textContent = t.ageGroups["3-4"];
  options[7].textContent = t.ageGroups["4-5"];
  options[8].textContent = t.ageGroups["5-6"];
  options[9].textContent = t.ageGroups["6-7"];
}

// Show current evaluation
function showEvaluation(ageGroupKey) {
  currentAgeGroup = ageGroupKey;
  
  // Set title
  evaluationTitle.textContent = translations[currentLang].ageGroups[ageGroupKey];
  
  // Render skills
  renderSkills(ageGroupKey);
  
  // Show section
  currentEvaluation.style.display = 'block';
  currentEvaluation.scrollIntoView({ behavior: 'smooth' });
}

// Render skills for current language
function renderSkills(ageGroupKey) {
  skillsContainer.innerHTML = '';
  selectedSkills = [];
  
  const skills = skillsData[currentLang][ageGroupKey] || [];
  
  skills.forEach((skill, index) => {
    const skillItem = document.createElement('div');
    skillItem.className = 'skill-item';
    skillItem.textContent = skill;
    
    skillItem.addEventListener('click', () => {
      // Toggle selection
      if (skillItem.classList.contains('selected')) {
        skillItem.classList.remove('selected');
        selectedSkills = selectedSkills.filter(i => i !== index);
      } else {
        skillItem.classList.add('selected');
        selectedSkills.push(index);
      }
    });
    
    skillsContainer.appendChild(skillItem);
  });
}

// Generate findings summary
function generateSummary() {
  if (selectedSkills.length === 0) {
    alert(translations[currentLang].instructionsText);
    return;
  }
  
  // Save current evaluation
  saveEvaluation();
  
  // Show findings summary
  const t = translations[currentLang];
  findingsSummary.style.display = 'block';
  findingsHeader.textContent = t.findingsSummary;
  summaryContent.innerHTML = '';
  
  const skills = skillsData[currentLang][currentAgeGroup] || [];
  const missingSkills = [];
  
  // Find missing skills
  skills.forEach((skill, index) => {
    if (!selectedSkills.includes(index)) {
      missingSkills.push(skill);
    }
  });
  
  // Add to summary
  const header = document.createElement('h3');
  header.textContent = t.missingSkills;
  summaryContent.appendChild(header);
  
  if (missingSkills.length === 0) {
    const noSkills = document.createElement('div');
    noSkills.className = 'no-skills';
    noSkills.textContent = t.noSkillsMissing;
    summaryContent.appendChild(noSkills);
  } else {
    missingSkills.forEach(skill => {
      const skillEl = document.createElement('div');
      skillEl.className = 'missing-skill';
      skillEl.textContent = skill;
      summaryContent.appendChild(skillEl);
    });
  }
  
  // Update evaluate another section
  evaluatePrompt.textContent = t.evaluateAnother;
  evaluateYesBtn.textContent = t.yes;
  evaluateNoBtn.textContent = t.no;
  
  // Scroll to findings
  findingsSummary.scrollIntoView({ behavior: 'smooth' });
  
  // Hide current evaluation
  currentEvaluation.style.display = 'none';
}

// Save current evaluation to all evaluations
function saveEvaluation() {
  const skills = skillsData[currentLang][currentAgeGroup] || [];
  
  const selected = [];
  const missing = [];
  
  skills.forEach((skill, index) => {
    if (selectedSkills.includes(index)) {
      selected.push(skill);
    } else {
      missing.push(skill);
    }
  });
  
  allEvaluationsData.push({
    ageGroup: currentAgeGroup,
    selected,
    missing,
    lang: currentLang
  });
  
  // Add to all evaluations display
  addToAllEvaluations(currentAgeGroup, selected, missing);
}

// Add evaluation to all evaluations container
function addToAllEvaluations(ageGroupKey, selected, missing) {
  const t = translations[currentLang];
  const ageGroupLabel = t.ageGroups[ageGroupKey];
  
  const evaluationDiv = document.createElement('div');
  evaluationDiv.className = 'saved-evaluation';
  
  evaluationDiv.innerHTML = `
    <h3>${ageGroupLabel}</h3>
    <h4>${t.missingSkills}</h4>
    <div class="missing-skills">
      ${missing.length > 0 ? 
        missing.map(skill => `<div class="missing-skill">${skill}</div>`).join('') : 
        `<div class="no-skills">${t.noSkillsMissing}</div>`
      }
    </div>
  `;
  
  allEvaluations.appendChild(evaluationDiv);
  allEvaluations.scrollIntoView({ behavior: 'smooth', block: 'end' });
}

// Render all saved evaluations
function renderAllEvaluations() {
  allEvaluations.innerHTML = '';
  allEvaluationsData.forEach(evalData => {
    // Use current language for rendering
    const t = translations[currentLang];
    const ageGroupLabel = t.ageGroups[evalData.ageGroup];
    
    const evaluationDiv = document.createElement('div');
    evaluationDiv.className = 'saved-evaluation';
    
    evaluationDiv.innerHTML = `
      <h3>${ageGroupLabel}</h3>
      <h4>${t.missingSkills}</h4>
      <div class="missing-skills">
        ${evalData.missing.length > 0 ? 
          evalData.missing.map(skill => `<div class="missing-skill">${skill}</div>`).join('') : 
          `<div class="no-skills">${t.noSkillsMissing}</div>`
        }
      </div>
    `;
    
    allEvaluations.appendChild(evaluationDiv);
  });
}

// Reset for new evaluation
function resetForNewEvaluation() {
  findingsSummary.style.display = 'none';
  currentEvaluation.style.display = 'none';
  currentAgeGroup = null;
  selectedSkills = [];
}

// Export report
function exportReport() {
  const childName = document.getElementById('child-name').value || translations[currentLang].reportChild;
  const dob = document.getElementById('dob').value || 'Unknown';
  
  const t = translations[currentLang];
  let content = `${t.reportTitle}\n`;
  content += '================================\n\n';
  
  // Basic info
  content += `${t.reportChild}: ${childName}\n`;
  content += `${t.reportParent}: ${document.getElementById('parent-name').value || 'Unknown'}\n`;
  content += `${t.reportDob}: ${dob}\n`;
  content += `${t.reportDate}: ${document.getElementById('date').value || 'Unknown'}\n`;
  content += `${t.reportExaminer}: ${document.getElementById('examiner-name').value || 'Unknown'}\n\n`;
  
  content += `${t.findingsSummary}\n`;
  content += '================================\n\n';
  
  // Add each evaluation
  allEvaluationsData.forEach(evalData => {
    const ageGroupLabel = t.ageGroups[evalData.ageGroup];
    
    content += `${ageGroupLabel}\n`;
    content += '--------------------------------\n';
    content += `${t.missingSkills}:\n`;
    
    if (evalData.missing.length === 0) {
      content += `  ${t.noSkillsMissing}\n`;
    } else {
      evalData.missing.forEach((skill, index) => {
        content += `  ${index + 1}. ${skill}\n`;
      });
    }
    
    content += '\n';
  });
  
  content += `\n${t.reportGenerated}: ${new Date().toLocaleDateString()}`;
  
  // Create and download file
  const filename = `Language_Assessment_${childName.replace(/\s+/g, '_')}.txt`;
  const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
  const link = document.createElement('a');
  link.href = URL.createObjectURL(blob);
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

// Event Listeners
langEnBtn.addEventListener('click', () => setLanguage('en'));
langArBtn.addEventListener('click', () => setLanguage('ar'));

ageGroupSelect.addEventListener('change', (e) => {
  if (e.target.value) {
    showEvaluation(e.target.value);
  }
});

instructionsBtn.addEventListener('click', () => {
  instructionsModal.style.display = 'block';
});

closeModal.addEventListener('click', () => {
  instructionsModal.style.display = 'none';
});

window.addEventListener('click', (e) => {
  if (e.target === instructionsModal) {
    instructionsModal.style.display = 'none';
  }
});

generateSummaryBtn.addEventListener('click', generateSummary);

evaluateYesBtn.addEventListener('click', () => {
  resetForNewEvaluation();
});

evaluateNoBtn.addEventListener('click', () => {
  exportReport();
});

changeAgeBtn.addEventListener('click', () => {
  currentEvaluation.style.display = 'none';
  currentAgeGroup = null;
});

// Initialize
setLanguage('en');
