'use strict';

// Each card has its own identity: identical wording never merges two responses.
const responses = new Map();
const notes = {};
let items = [];
let previousFocus = null;
const sectionTitles = {
  0: 'البيانات الشخصية والطبية', 1: 'التوجه والوعي', 2: 'الفهم السمعي',
  3: 'الأسئلة الفكرية المعقدة', 4: 'حل المشكلات', 5: 'التسمية',
  6: 'تكرار الجمل', 7: 'المنطق والاستدلال والفهم', 8: 'تنظيم الأفكار',
  9: 'القراءة والمعالجة البصرية والكتابة', 10: 'الحساب',
  11: 'البراغماتية والتأثير الانفعالي', 12: 'الذاكرة', 13: 'خصائص الكلام'
};
const subsectionTitles = {
  '2subA': 'الأوامر البسيطة', '2subB': 'الأسئلة الشخصية البسيطة', '2subC': 'أسئلة نعم/لا', '2subD': 'الأوامر المتتابعة',
  '3subA': 'التفكير', '3subB': 'قصة ١', '3subC': 'قصة ٢',
  '6subA': 'الحروف', '6subB': 'الأرقام', '6subC': 'جمل قصيرة', '6subD': 'جمل متوسطة', '6subE': 'جمل طويلة',
  '7subA': 'تصحيح الجمل', '7subB': 'تفسير المعنى', '7subC': 'اللغة الدلالية',
  '9subA': 'استبعاد كلمة', '9subB': 'اتباع أوامر مكتوبة', '9subC': 'الفهم القرائي', '9subD': 'رسم الساعة', '9subE': 'الانتباه البصري', '9subF': 'الكتابة',
  '12sub1': 'الذاكرة الفورية', '12sub2': 'سرد قصة', '12sub3': 'الذاكرة الحديثة', '12sub4': 'الذاكرة طويلة المدى',
  '13sub1': 'البارافازيا', '13sub2': 'السرد ووصف الصور', '13sub3': 'الصوت'
};
const statusTitles = { correct: 'صحيح', incorrect: 'غير صحيح', dontknow: 'لا يعرف / لم يستجب', skip: 'لم يُطبّق / مستبعد', present: 'موجود', absent: 'غير ملاحظ', unanswered: 'لم يُقيّم' };
const patientFields = {
  name: 'الاسم', age: 'العمر', currentDate: 'تاريخ التقييم', incidentDate: 'تاريخ الحادث',
  treatingDoctor: 'الطبيب المعالج', medicalDiagnosis: 'التشخيص الطبي', preIncidentCondition: 'الحالة قبل الحادث',
  medications: 'الأدوية', examinerName: 'اسم الفاحص', results: 'النتائج / المعلومات السابقة'
};
const $ = id => document.getElementById(id);
const escapeHTML = value => String(value).replace(/[&<>"']/g, ch => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[ch]));

function summarize(list) {
  const s = { total: list.length, assessed: 0, correct: 0, incorrect: 0, dontknow: 0, skipped: 0, unanswered: 0, present: 0, absent: 0 };
  list.forEach(item => {
    const result = responses.get(item.id);
    if (!result) s.unanswered++;
    else if (result === 'skip') s.skipped++;
    else { s.assessed++; s[result]++; }
  });
  s.percent = s.assessed ? Math.round(100 * s.correct / s.assessed) : null;
  return s;
}

function score(group, type, button) {
  const item = items.find(item => item.id === button.closest('.card').dataset.itemId);
  if (!item) return;
  if (responses.get(item.id) === type) responses.delete(item.id);
  else responses.set(item.id, type);
  item.card.querySelectorAll('[data-result]').forEach(b => {
    const selected = b.dataset.result === responses.get(item.id);
    b.classList.toggle('selected', selected);
    b.setAttribute('aria-pressed', String(selected));
  });
  updateReport();
}

function addNote(section) {
  const area = $('note-' + section);
  if (!area) return;
  area.closest('details').open = true;
  area.focus();
}

const reportEnglishItems = {
  "2": "2",
  "13": "13",
  "165": "165",
  "1312": "1312",
  "ما هو اليوم؟": "What day is it?",
  "ما هو الشهر؟": "What month is it?",
  "ما هي السنة؟": "What year is it?",
  "ما هو الفصل من السنة؟": "What season is it?",
  "كم تظن أن الوقت الآن تقريبًا؟": "Approximately what time is it now?",
  "في أي مدينة نحن؟": "Which city are we in?",
  "في أي محافظة نحن؟": "Which governorate are we in?",
  "أين تسكن؟": "Where do you live?",
  "منذ متى وأنت تسكن هنا؟": "How long have you lived there?",
  "متى تعرضت للحادث؟": "When did the incident happen?",
  "ما نوع المشاكل التي تعاني منها بسبب الحادث؟": "What difficulties have you experienced because of the incident?",
  "ما اسمي؟": "What is my name?",
  "من هو طبيبك؟": "Who is your doctor?",
  "كم من الوقت تقريبًا مضى منذ بدأنا الحديث": "Approximately how long have we been talking?",
  "ماذا تفعل إذا أغلقت مفاتيحك داخل المنزل؟": "What would you do if you locked your keys inside the house?",
  "ماذا تفعل إذا لايوجد شحن بالموبايل؟": "What would you do if your mobile phone had no charge?",
  "ماذا تفعل إذا لم تجد رقم تلفون أحدهم؟": "What would you do if you could not find someone's phone number?",
  "ماذا تفعل إذا توقف التلفاز عن العمل؟": "What would you do if the television stopped working?",
  "ماذا تفعل إذا استيقظت صباحاً ولم تجد هاتفك؟": "What would you do if you woke up and could not find your phone?",
  "ماذا تفعل إذا لم تجد بون بون في سوبرماركت ؟": "What would you do if you could not find candy at the supermarket?",
  "كوب": "Cup",
  "ملعقة": "Spoon",
  "ساعة": "Clock / watch",
  "مفتاح": "Key",
  "كتاب": "Book",
  "كرسي": "Chair",
  "قلم": "Pen",
  "موبايل": "Mobile phone",
  "سيارة": "Car",
  "حذاء": "Shoe",
  "فيل": "Elephant",
  "وردة": "Flower",
  "يأكل": "Eating",
  "يكتب": "Writing",
  "ينام": "Sleeping",
  "يركض": "Running",
  "يشرب": "Drinking",
  "يغسل": "Washing",
  "ما معنى كلمة \"حنون\"؟": "What does the word 'hanoun' (affectionate) mean?",
  "ما معنى كلمة \"يُسلّم\"؟": "What does the word 'yusallim' mean?",
  "ما الخطوات التي تتبعها لغسل شعرك؟": "What steps do you follow to wash your hair?",
  "ما الخطوات التي تتبعها لترتيب سريرك؟": "What steps do you follow to make your bed?",
  "ما الخطوات التي تتبعها لشرب عصير برتقال؟": "What steps do you follow to drink orange juice?",
  "كيف تخطط لوجبة عشاء لضيوفين؟": "How would you plan dinner for two guests?",
  "إذا ذهبت إلى السوق وأنفقت 1500 في متجر و 1200 في متجر آخر، كم أنفقت بالمجموع؟": "You spend 1500 in one shop and 1200 in another. How much did you spend in total?",
  "إذا كان سعر الطماطم 150 للكيلو واشتريت 2 كيلو، كم أنفقت على الطماطم؟": "Tomatoes cost 150 per kilogram. You buy 2 kilograms. How much did you spend?",
  "إذا ذهبت إلى المتجر ومعك 3000 وعدت ومعك 1000، كم أنفقت؟": "You go to the shop with 3000 and return with 1000. How much did you spend?",
  "إذا معك تفاحة واعطيتك 12 تفاحة كم تفاحة معك الآن؟": "You have one apple and I give you 12 apples. How many apples do you have now?",
  "إذا كان سعر فرشاة الأسنان 5000 ولديك 1000، كم فرشاة أسنان يمكنك شراؤها؟": "A toothbrush costs 5000 and you have 1000. How many toothbrushes can you buy?",
  "إذا كان لديك موعد مع الطبيب الساعة 10:30 ويستغرق الوصول 30 دقيقة، متى يجب أن تغادر؟": "Your doctor's appointment is at 10:30 and the journey takes 30 minutes. When should you leave?",
  "قرب جسدي غير مناسب": "Inappropriate physical proximity",
  "تلامس جسدي غير مناسب": "Inappropriate physical contact",
  "إهمال النصف الأيسر من المجال البصري": "Neglect of the left half of the visual field",
  "ضعف التواصل البصري": "Reduced eye contact",
  "غياب تعابير الوجه": "Absent facial expressions",
  "إيماءات (غير مناسبة أو غائبة)": "Inappropriate or absent gestures",
  "غياب الخصائص النبرية في الكلام (الشدة، النغمة، الإيقاع)": "Absent prosodic features (loudness, pitch, rhythm)",
  "ضعف الحفاظ على موضوع الحديث": "Difficulty maintaining the topic",
  "غياب التبادل المناسب في الأدوار أثناء الحوار": "Inappropriate conversational turn-taking",
  "التكرار اللفظي أو السلوكي (Perseveration)": "Verbal or behavioral perseveration",
  "يسأل عن لون شيء لم يُذكر أو يعطي تفاصيل غير موجودة مسبقًا": "Asks about an unmentioned color or supplies details not previously provided",
  "الإسهاب غير المناسب": "Inappropriate verbosity",
  "غياب المبادرة في بدء التفاعل": "Lack of initiation of interaction",
  "سهولة التشتت": "Distractibility",
  "مقاطعات متكررة": "Frequent interruptions",
  "الاندفاعية": "Impulsivity",
  "ضعف التنظيم": "Poor organization",
  "عدم إكمال المهام": "Failure to complete tasks",
  "ما اسمك؟": "What is your name?",
  "كم عمرك؟": "How old are you?",
  "هل انت جالس على كرسي؟": "Are you sitting on a chair?",
  "هل أنا أرتدي قبعة؟": "Am I wearing a hat?",
  "هل السيارة نوع من الحيوانات؟": "Is a car a kind of animal?",
  "هل السماء زرقاء؟": "Is the sky blue?",
  "هل الفيل أصغر من القطة؟": "Is an elephant smaller than a cat?",
  "ارفع يدك": "Raise your hand",
  "المس أنفك": "Touch your nose",
  "انظر إلى الباب": "Look at the door",
  "المس القلم": "Touch the pen",
  "المس انفك ، ثم المس فمك": "Touch your nose, then touch your mouth",
  "المس القلم ، ثم المس شعرك": "Touch the pen, then touch your hair",
  "المس شعرك ، ثم انفك ، ثم انظر إلى الباب": "Touch your hair, then your nose, then look at the door",
  "اذكر اسمك ثم عدد أطفالك": "Say your name, then the number of children you have",
  "قل اسم فاكهتين ثم اسم حيوانين": "Name two fruits, then two animals",
  "صف لونين ثم صف طعامك المفضل": "Describe two colors, then describe your favorite food",
  "اذكر ثلاث أدوات في المطبخ ثم ثلاث حيوانات": "Name three kitchen utensils, then three animals",
  "أخبرني ما فعلت صباح اليوم ثم ما ستفعله بعد الظهر": "Tell me what you did this morning, then what you will do in the afternoon",
  "هل يطفو الخشب على الماء؟": "Does wood float on water?",
  "هل تستخدم المقص لقطع الورق؟": "Do you use scissors to cut paper?",
  "هل يغرق الحديد في الماء؟": "Does iron sink in water?",
  "هل تستخدم المقص لصنع الشاي؟": "Do you use scissors to make tea?",
  "لماذا نضع الثلج في الثلاجة؟": "Why do we put ice in the refrigerator?",
  "لماذا لاتسبح معظم البشر في الشتاء؟": "Why do most people not swim in winter?",
  "ماذا سوف تفعل إذا سيارتك لم يعد بها من البنزين؟": "What would you do if your car ran out of petrol?",
  "كيف سوف تتنقل وتذهب إلى المدينة في حال ليس لديك سيارة؟": "How would you travel to the city if you did not have a car?",
  "هل ذهب سامر إلى السوق؟": "Did Samer go to the market?",
  "هل اشترى سامر الحلوى؟": "Did Samer buy sweets?",
  "هل اشترى سامر خضروات؟": "Did Samer buy vegetables?",
  "هل بقي سامر في المنزل طوال اليوم؟": "Did Samer stay at home all day?",
  "هل دخلت ليلى المكتبة؟": "Did Layla enter the library?",
  "هل كانت ليلى مهتمة بالطيور؟": "Was Layla interested in birds?",
  "هل قرأت ليلى كتابًا عن الأسماك؟": "Did Layla read a book about fish?",
  "هل كانت ليلى مهتمة بالرياضة؟": "Was Layla interested in sports?",
  "ألف": "Alif (Arabic letter name)",
  "باء": "Baa (Arabic letter name)",
  "جيم": "Jeem (Arabic letter name)",
  "شين": "Sheen (Arabic letter name)",
  "الجو جميل اليوم": "The weather is lovely today",
  "أريد كوب ماء": "I want a glass of water",
  "ذهبتُ إلى السوق صباح اليوم": "I went to the market this morning",
  "يلعب الأطفال في الحديقة القريبة": "The children are playing in the nearby park",
  "عندما وصلت إلى المحطة، كان القطار قد غادر بالفعل": "When I arrived at the station, the train had already left",
  "الطبيب نصحني بأن أتناول الدواء قبل وجبة الفطور": "The doctor advised me to take the medicine before breakfast",
  "وضع الملح في قهوته": "He put salt in his coffee",
  "ستة زائد واحد تساوي ثمانية": "Six plus one equals eight",
  "ارتديت جواربي فوق حذائي": "I put my socks on over my shoes",
  "أغلق الهاتف عندما رن": "He hung up the phone when it rang",
  "الكلب يصدر صوت مواء": "The dog makes a meowing sound",
  "في الصيف ارتدي جاكيت": "I wear a jacket in summer",
  "التفاحة في اليوم تبعد الطبيب": "An apple a day keeps the doctor away",
  "راح عل البحر ورجع عطشان": "He went to the sea and came back thirsty (Arabic saying)",
  "هو نسخة طبق الأصل عن والده": "He is an exact copy of his father",
  "القرد بعين امه غزال": "In its mother's eyes, a monkey is a gazelle (Arabic saying)",
  "الحياة صعبة اول 100 سنة": "Life is hard for the first 100 years",
  "الجمال جمال الروح": "Beauty is the beauty of the soul",
  "ما الذي يُلبس على القدمين، يُحاك ويُستخدم للتدفئة؟": "What is worn on the feet, knitted, and used for warmth?",
  "ما الذي له ذيل كثيف، يتسلق الأشجار، ويخزن المكسرات؟": "What has a bushy tail, climbs trees, and stores nuts?",
  "ما الشيء الرقيق والخفيف، يُستخدم لمسح الدموع، ويُستخدم عند الإصابة بالزكام؟": "What is thin and light, used to wipe tears, and used when you have a cold?",
  "ما الشيء الذي لديه اربع ارجل ، ويستخدم للجلوس ؟": "What has four legs and is used for sitting?",
  "ما أوجه التشابه بين السترة، البنطال، والبلوزة؟": "What do a jacket, trousers, and a blouse have in common?",
  "ما أوجه التشابه بين عصير البرتقال، الصودا، والحليب؟": "What do orange juice, soda, and milk have in common?",
  "بقرة، تفاحة، جزر": "Cow, apple, carrot",
  "مكتب، كرسي، أزرق": "Desk, chair, blue",
  "جبن، سرير، موز": "Cheese, bed, banana",
  "بسكوتة، أريكة، طاولة": "Biscuit, sofa, table",
  "انظر إلى السقف": "Look at the ceiling",
  "أشر إلى الباب، ثم اغمض بعينيك": "Point to the door, then close your eyes",
  "ضع القلم على الورقة ،ثم انقر على الطاولة مرتين": "Put the pen on the paper, then tap the table twice",
  "غنِ أغنية \"عيد ميلاد سعيد\"": "Sing 'Happy Birthday'",
  "هل سامر وسمير أولاد عم؟": "Are Samer and Samir cousins?",
  "ما الرياضة التي لعباها؟": "What sport did they play?",
  "كم كانت قيمة الجائزة الكبرى؟": "How much was the grand prize?",
  "هل فاز أحدهما بالجائزة الكبرى؟": "Did either of them win the grand prize?",
  "انتاج الوقت": "Represent the requested time",
  "رسم الساعة": "Draw the clock",
  "مدى انتباهه للنصف الأيسر من الصفحة.": "Attention to the left half of the page",
  "اكتب اسمك": "Write your name",
  "اكتب تاريخ اليوم": "Write today's date",
  "7، 4، 2": "7, 4, 2",
  "6، 1، 8, 3": "6, 1, 8, 3",
  "9، 1، 4، 6، 5": "9, 1, 4, 6, 5",
  "سيارة، بطة، خاتم، حذاء": "Car, duck, ring, shoe",
  "مطر، مكتب، سلم، حصان، كعكة": "Rain, desk, ladder, horse, cake",
  "وُجدت المفاتيح تحت الطاولة": "The keys were found under the table",
  "هو دائمًا يقرأ الجريدة قبل الإفطار": "He always reads the newspaper before breakfast",
  "بعد انتصارهم، تناول فريق البيسبول البيتزا وشاهدوا فيلمًا": "After their victory, the baseball team ate pizza and watched a film",
  "احتفلت هيلين بعيد ميلادها في حديقة الحيوانات الأليفة. حضر عشرة من أصدقائها.ضحك جميع الأطفال عندما وجدوا ماعزًا يأكل الكعكة والآيس": "Helen celebrated her birthday at a petting zoo. Ten of her friends attended. All the children laughed when they found a goat eating the cake and the ice… [source prompt is incomplete]",
  "احتفلت ليلى بعيد ميلادها في حديقة الطيور الملونة. حضر اثنا عشر صديقًا. تعجب الأطفال عندما رأوا ببغاءً يسرق قطعة البيتزا من الطاولة!": "Layla celebrated her birthday in a colorful bird park. Twelve friends attended. The children were surprised when they saw a parrot stealing a piece of pizza from the table!",
  "ماذا تناولت على الإفطار؟": "What did you have for breakfast?",
  "ماذا فعلت بعد العشاء الليلة الماضية؟": "What did you do after dinner last night?",
  "ماذا فعلت بعد الإفطار هذا الصباح؟": "What did you do after breakfast this morning?",
  "ماذا فعلت أيضًا اليوم؟": "What else did you do today?",
  "هل زارك أحد اليوم أو أمس؟": "Did anyone visit you today or yesterday?",
  "ما العلاجات الأخرى التي تتلقاها؟": "What other treatments are you receiving?",
  "منذ متى وأنت هنا؟": "How long have you been here?",
  "أين وُلدت؟": "Where were you born?",
  "متى تاريخ ميلادك؟": "What is your date of birth?",
  "اسم زوجك/زوجتك؟": "What is your spouse's name?",
  "كم عدد أطفالك؟": "How many children do you have?",
  "كم عدد أحفادك؟": "How many grandchildren do you have?",
  "أين كنت تعمل سابقًا؟": "Where did you work previously?",
  "كم سنة عملت؟": "How many years did you work?",
  "أين نشأت؟": "Where did you grow up?",
  "كم عدد إخوتك وأخواتك؟": "How many brothers and sisters do you have?",
  "Phonemic (Literal)  صوتية (حرفية)": "Phonemic (literal) paraphasia",
  "Verbal (Semantic) لفظية (دلالية)": "Verbal (semantic) paraphasia",
  "Neologistic كلامية مبتكرة": "Neologistic paraphasia",
  "Mixed مختلطة": "Mixed paraphasia",
  "Remote Semantic دلالية بعيدة": "Remote semantic paraphasia",
  "Formal شكلية": "Formal paraphasia",
  "الفهم العام للصورة": "Overall understanding of the picture",
  "تسلسل الأحداث": "Sequence of events",
  "التسمية والكلمات": "Naming and word selection",
  "القواعد والنحو": "Grammar and syntax",
  "التفاصيل الدلالية": "Semantic details",
  "المنطق والاستدلال": "Logic and inference",
  "علو الصوت : عالي": "Loudness: high",
  "علو الصوت : منخفض": "Loudness: low",
  "نوعية الصوت : مهموس": "Voice quality: breathy",
  "نوعية الصوت : خشن": "Voice quality: rough",
  "معدل الكلام : بطيء": "Speech rate: slow",
  "معدل الكلام : سريع": "Speech rate: fast"
};

let reportLanguage = 'ar';
const reportEnglishSections = {
  0: 'Personal and medical information', 1: 'Orientation and awareness', 2: 'Auditory comprehension',
  3: 'Complex reasoning questions', 4: 'Problem solving', 5: 'Naming', 6: 'Repetition',
  7: 'Logic, inference and comprehension', 8: 'Organization of ideas',
  9: 'Reading, visual processing and writing', 10: 'Calculation',
  11: 'Pragmatics and emotional expression', 12: 'Memory', 13: 'Speech characteristics'
};
const reportEnglishSubsections = {
  '2subA': 'Simple commands', '2subB': 'Simple personal questions', '2subC': 'Yes/no questions', '2subD': 'Sequential commands',
  '3subA': 'Reasoning', '3subB': 'Story 1', '3subC': 'Story 2',
  '6subA': 'Letters', '6subB': 'Numbers', '6subC': 'Short sentences', '6subD': 'Medium-length sentences', '6subE': 'Long sentences',
  '7subA': 'Correcting illogical sentences', '7subB': 'Interpreting meaning', '7subC': 'Semantic language',
  '9subA': 'Odd word out', '9subB': 'Following written commands', '9subC': 'Reading comprehension', '9subD': 'Clock drawing', '9subE': 'Visual attention', '9subF': 'Writing',
  '12sub1': 'Immediate memory', '12sub2': 'Story recall', '12sub3': 'Recent memory', '12sub4': 'Long-term memory',
  '13sub1': 'Paraphasia', '13sub2': 'Narrative and picture description', '13sub3': 'Voice'
};
const reportEnglishStatuses = { correct: 'Correct', incorrect: 'Incorrect', dontknow: 'Does not know / no response', skip: 'Not administered / excluded', present: 'Present', absent: 'Not observed', unanswered: 'Not assessed' };
const reportEnglishPatientFields = {
  name: 'Name', age: 'Age', currentDate: 'Assessment date', incidentDate: 'Incident date',
  treatingDoctor: 'Treating doctor', medicalDiagnosis: 'Medical diagnosis', preIncidentCondition: 'Pre-incident status',
  medications: 'Medications', examinerName: 'Examiner', results: 'Previous results / information'
};
const rt = (ar, en, lang = reportLanguage) => lang === 'en' ? en : ar;

function setReportLanguage(language) {
  if (language !== 'ar' && language !== 'en') return;
  reportLanguage = language;
  $('reportStatus').textContent = '';
  updateReport({viewOnly:true});
}

function updateReportLanguageUI() {
  const english = reportLanguage === 'en';
  for (const id of ['reportPreview', 'report', 'printArea']) {
    $(id).lang = reportLanguage; $(id).dir = english ? 'ltr' : 'rtl';
  }
  document.querySelectorAll('[data-report-language]').forEach(button => {
    button.setAttribute('aria-pressed', String(button.dataset.reportLanguage === reportLanguage));
  });
  document.querySelectorAll('[data-report-ar][data-report-en]').forEach(node => {
    node.textContent = english ? node.dataset.reportEn : node.dataset.reportAr;
  });
  $('reportPreview').setAttribute('aria-label', rt('معاينة التقرير', 'Report preview'));
  $('report').setAttribute('aria-label', rt('التقرير النصي', 'Text report'));
}

function summaryText(s, observation = false, lang = 'ar') {
  if (lang === 'en') {
    if (observation) return `Documented: ${s.assessed} of ${s.total}; present: ${s.present}; not observed: ${s.absent}; excluded: ${s.skipped}; not assessed: ${s.unanswered}`;
    return `Accuracy: ${s.percent === null ? 'Not assessed' : s.percent + '%'} (${s.correct}/${s.assessed}); assessed: ${s.assessed} of ${s.total}; incorrect: ${s.incorrect}; does not know / no response: ${s.dontknow}; excluded: ${s.skipped}; not assessed: ${s.unanswered}`;
  }
  if (observation) return `موثق: ${s.assessed} من ${s.total}؛ موجود: ${s.present}؛ غير ملاحظ: ${s.absent}؛ مستبعد: ${s.skipped}؛ لم يُقيّم: ${s.unanswered}`;
  return `الدقة: ${s.percent === null ? 'لم يُقيّم' : s.percent + '%'} (${s.correct}/${s.assessed})؛ مُقيّم: ${s.assessed} من ${s.total}؛ غير صحيح: ${s.incorrect}؛ لا يعرف / لم يستجب: ${s.dontknow}؛ مستبعد: ${s.skipped}؛ لم يُقيّم: ${s.unanswered}`;
}

function buildReport() {
  const lang = reportLanguage;
  const sections = lang === 'en' ? reportEnglishSections : sectionTitles;
  const subsections = lang === 'en' ? reportEnglishSubsections : subsectionTitles;
  const statuses = lang === 'en' ? reportEnglishStatuses : statusTitles;
  const fields = lang === 'en' ? reportEnglishPatientFields : patientFields;
  const title = rt('تقرير التقييم المعرفي واللغوي', 'Language and Cognitive Assessment Report');
  const author = rt('أحمد غانم · اختصاص النطق واللغة', 'Ahmad Ghanem · Speech and Language Pathology');
  const text = [title, author, ''];
  const html = [`<header class="report-heading"><p>${author}</p><h1>${title}</h1></header>`];
  const paragraph = (label, value) => {
    const content = value || rt('غير مسجل', 'Not recorded');
    text.push(`${label}: ${content}`);
    html.push(`<p><strong>${escapeHTML(label)}:</strong> <bdi dir="auto">${escapeHTML(content)}</bdi></p>`);
  };
  const heading = value => { text.push('', value); html.push(`<h2>${escapeHTML(value)}</h2>`); };
  heading(sections[0]);
  Object.entries(fields).forEach(([id, label]) => paragraph(label, $(id).value.trim()));
  if (notes[0]) paragraph(rt('ملاحظات البيانات الشخصية والطبية', 'Personal and medical information notes'), notes[0]);
  heading(rt('سياق التقييم', 'Assessment context'));
  paragraph(rt('اللغة / اللهجة والخلفية التعليمية', 'Language / dialect and educational background'), $('languageContext').value.trim());
  paragraph(rt('ظروف التطبيق والدعم المستخدم', 'Administration conditions and support used'), $('assessmentConditions').value.trim());
  paragraph(rt('طريقة عرض النتائج', 'Scoring method'), rt(
    'الدقة = الإجابات الصحيحة ÷ البنود المُقيّمة. الإجابة غير الصحيحة وعدم معرفة الإجابة / عدم الاستجابة تُحسب ضمن البنود المُقيّمة. البنود المستبعدة والتي لم تُقيّم لا تدخل في المقام. الملاحظات السلوكية والصوتية وصفية.',
    'Accuracy = correct responses divided by assessed items. Incorrect responses and does not know / no response are assessed items. Excluded and unassessed items are not included in the denominator. Behavioral and voice observations are descriptive.'
  ));
  if (lang === 'en') paragraph('Report language', 'Fixed headings and item descriptions are translated from the Arabic form. Patient details, clinician notes and recorded responses remain as entered; prompts were not changed by this report-language selection.');
  const performance = items.filter(item => !item.observation);
  heading(rt('ملخص الأداء', 'Performance summary'));
  paragraph(rt('إجمالي البنود الأدائية', 'All performance items'), summaryText(summarize(performance), false, lang));
  const columns = lang === 'en' ? ['Domain', 'Correct / assessed', 'Accuracy', 'Excluded', 'Not assessed'] : ['المجال', 'صحيح / مُقيّم', 'الدقة', 'مستبعد', 'لم يُقيّم'];
  html.push('<table class="report-table"><thead><tr>' + columns.map(column => `<th scope="col">${column}</th>`).join('') + '</tr></thead><tbody>');
  for (let sec = 1; sec <= 13; sec++) {
    const list = performance.filter(item => item.section === sec);
    if (!list.length) continue;
    const s = summarize(list);
    const domain = sec === 13 ? subsections['13sub2'] : sections[sec];
    text.push(`${domain}: ${summaryText(s, false, lang)}`);
    html.push(`<tr><th scope="row">${escapeHTML(domain)}</th><td>${s.correct} / ${s.assessed}</td><td>${s.percent === null ? rt('لم يُقيّم', 'Not assessed') : s.percent + '%'}</td><td>${s.skipped}</td><td>${s.unanswered}</td></tr>`);
  }
  html.push('</tbody></table>');
  heading(rt('الخلاصة السريرية وخطة المتابعة', 'Clinical summary and follow-up plan'));
  paragraph(rt('انطباع الفاحص', 'Examiner impression'), $('clinicalImpression').value.trim());
  paragraph(rt('التوصيات والأهداف وخطة المتابعة', 'Recommendations, goals and follow-up plan'), $('recommendations').value.trim());
  for (let sec = 1; sec <= 13; sec++) {
    heading(`${sec}. ${sections[sec]}`);
    if (notes[sec]) paragraph(rt('ملاحظات القسم', 'Section notes'), notes[sec]);
    const groups = [...new Set(items.filter(item => item.section === sec).map(item => item.group))];
    for (const group of groups) {
      const list = items.filter(item => item.group === group);
      paragraph(subsections[group] || sections[sec], summaryText(summarize(list), list[0].observation, lang));
      const visible = list.filter(item => responses.has(item.id) || item.comment.value.trim() || $('includeUnanswered').checked);
      if (!visible.length) continue;
      html.push('<ul class="report-items">');
      visible.forEach(item => {
        const result = statuses[responses.get(item.id) || 'unanswered'];
        const label = lang === 'en' ? reportEnglishItems[item.label] || item.label : item.label;
        const comment = item.comment.value.trim();
        text.push(`  • ${label}: ${result}${comment ? ' — ' + comment : ''}`);
        html.push(`<li><span>${escapeHTML(label)}</span> — <strong>${result}</strong>${comment ? `<p class="item-comment">${rt('الاستجابة / الملاحظة', 'Response / note')}: <bdi dir="auto">${escapeHTML(comment)}</bdi></p>` : ''}</li>`);
      });
      html.push('</ul>');
    }
  }
  heading(rt('توضيح', 'Interpretation note'));
  paragraph(rt('نوع النتائج', 'Type of results'), rt(
    'النسب وصفية للبنود المسجلة في هذا النموذج وليست درجات معيارية. تُفسّر مع سياق التطبيق وملاحظات الفاحص.',
    'Percentages describe the items recorded in this form and are not standardized scores. Interpret them with the administration context and examiner observations.'
  ));
  if(window.AphasiaApp){const extra=window.AphasiaApp.reportSupplement(lang);html.push(extra.html);text.push(extra.text);}
  text.push('', 'SLP. AHMAD GHANEM');
  html.push('<footer class="report-signature">SLP. AHMAD GHANEM</footer>');
  return { text: text.join('\n'), html: html.join('') };
}


function updateReport(event) {
  updateReportLanguageUI();
  for (let sec = 1; sec <= 13; sec++) {
    const span = $('percent' + sec);
    if (!span) continue;
    const s = summarize(items.filter(item => item.section === sec && !item.observation));
    span.textContent = s.percent === null ? 'لم يُقيّم' : `${s.percent}% (${s.correct}/${s.assessed})`;
    span.title = summaryText(s);
  }
  const report = buildReport();
  $('report').value = report.text;
  $('reportPreview').innerHTML = report.html;
  window.dispatchEvent(new CustomEvent('aphasia-changed',{detail:{viewOnly:!!event?.viewOnly||event?.target?.id==='includeUnanswered'}}));
}

function downloadReport() {
  updateReport();
  const blob = new Blob(['\ufeff' + $('report').value], { type: 'text/plain;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  const name = $('name').value.trim().replace(/[\\/:*?"<>|\x00-\x1f]/g, '-').slice(0, 70) || rt('حالة', 'case');
  link.href = url;
  link.download = reportLanguage === 'en' ? `${name}-language-cognitive-assessment-en.txt` : `${name}-التقييم-المعرفي-اللغوي-ar.txt`;
  document.body.append(link);
  link.click();
  link.remove();
  setTimeout(() => URL.revokeObjectURL(url), 60000);
}

function preparePrint() { updateReportLanguageUI(); $('printArea').innerHTML = window.AphasiaApp?.currentDocument()?.html || buildReport().html; }
function printReport() { updateReport(); preparePrint(); window.print(); }
async function copyReport() {
  updateReport();
  try {
    await navigator.clipboard.writeText($('report').value);
    $('reportStatus').textContent = rt('تم نسخ التقرير.', 'Report copied.');
  } catch (error) {
    $('report').closest('details').open = true;
    $('report').focus(); $('report').select();
    $('reportStatus').textContent = rt('حددنا النص؛ استخدم أمر النسخ في جهازك.', 'The report text is selected. Use your device’s Copy command.');
  }
}

function openBox(content) {
  const box = $('floatingBox');
  if (!box.open) previousFocus = document.activeElement;
  box.innerHTML = '<button type="button" class="btn-close" aria-label="إغلاق" onclick="closeBox()">×</button>' + content;
  if(!box.open) box.showModal();
  box.classList.add('show');
  document.body.classList.add('modal-open');
  box.querySelector('button').focus();
}
function showInfo(text) { openBox(text); }
function showImage(src) {
  openBox(`<img src="${escapeHTML(src)}" alt="مثير التقييم"><p class="image-error" hidden>تعذر عرض الصورة. تحقق من وجود ملف المثير قبل تطبيق البند.</p>`);
  $('floatingBox').querySelector('img').addEventListener('error', event => {
    event.target.hidden = true;
    $('floatingBox').querySelector('.image-error').hidden = false;
  });
}
function closeBox() {
  $('floatingBox').classList.remove('show'); $('floatingBox').close();
  document.body.classList.remove('modal-open');
  if (previousFocus?.isConnected) previousFocus.focus();
}

function initialize() {
  document.querySelectorAll('button:not([type])').forEach(button => { button.type = 'button'; });
  for (let section = 0; section <= 13; section++) {
    const node = $('section' + section);
    if (!node) continue;
    const button = document.createElement('button');
    button.type = 'button'; button.className = 'section-button';
    button.textContent = sectionTitles[section];
    button.setAttribute('aria-controls', node.id);
    button.setAttribute('aria-pressed', 'false');
    button.addEventListener('click', () => {
      $('sectionButtons').querySelectorAll('button').forEach(choice => choice.setAttribute('aria-pressed', String(choice === button)));
      node.scrollIntoView({ behavior: 'smooth' });
      node.tabIndex = -1; node.focus({ preventScroll: true });
    });
    $('sectionButtons').append(button);
    const details = document.createElement('details'); details.className = 'section-notes';
    details.innerHTML = `<summary>ملاحظات القسم</summary><label for="note-${section}">ملاحظات ${sectionTitles[section]}</label><textarea id="note-${section}" rows="3"></textarea>`;
    node.append(details);
    $('note-' + section).addEventListener('input', event => { notes[section] = event.target.value.trim(); updateReport(); });
  }
  document.querySelectorAll('.card').forEach(card => {
    const existing = card.querySelector('button[onclick^="score("]');
    if (!existing) return;
    const match = existing.getAttribute('onclick').match(/^score\(\s*['"]?([\w]+)['"]?\s*,/);
    const label = card.querySelector('label')?.textContent.trim();
    if (!match || !label) throw new Error('Assessment card requires a group and label.');
    const group = match[1], section = Number(group.match(/^\d+/)[0]);
    const observation = group === '11' || group === '13sub1' || group === '13sub3';
    const id = `item-${group}-${items.filter(item => item.group === group).length + 1}`;
    card.dataset.itemId = id;
    const row = existing.parentElement;
    row.querySelectorAll('button[onclick^="score("]').forEach(button => button.remove());
    const types = observation ? ['present', 'absent', 'skip'] : ['correct', 'incorrect', 'dontknow', 'skip'];
    types.forEach(type => {
      const button = document.createElement('button'); button.type = 'button'; button.dataset.result = type;
      button.className = 'result-button result-' + type; button.textContent = statusTitles[type]; button.setAttribute('aria-pressed', 'false');
      button.addEventListener('click', () => score(group, type, button)); row.append(button);
    });
    const details = document.createElement('details'); details.className = 'item-notes';
    details.innerHTML = `<summary>استجابة / ملاحظة / تلميح</summary><label for="${id}-comment">الاستجابة والمساعدة المستخدمة</label><textarea id="${id}-comment" rows="2"></textarea>`;
    card.append(details);
    const comment = $(id + '-comment'); comment.addEventListener('input', updateReport);
    items.push({ id, group, section, observation, label, card, comment });
  });
  document.querySelectorAll('#assessmentStage input[id], #assessmentStage textarea[id], #assessmentStage select[id], #includeUnanswered').forEach(input => {
    if (input.id === 'report' || input.id.startsWith('note-') || input.id.startsWith('item-')) return;
    const label = input.closest('.card')?.querySelector('label');
    if (label) label.htmlFor = input.id;
    input.addEventListener(input.type === 'checkbox' || input.tagName==='SELECT' ? 'change' : 'input', updateReport);
  });
  document.querySelectorAll('.btn-info,.btn-note,.btn-show').forEach(button => {
    const title = button.classList.contains('btn-note') ? 'ملاحظات القسم' : button.classList.contains('btn-show') ? 'عرض المثير' : 'تعليمات ومعلومات';
    button.title = title; button.setAttribute('aria-label', title);
  });
  const date = new Date();
  if (!$('currentDate').value) $('currentDate').value = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
  document.addEventListener('keydown', event => {
    if (!$('floatingBox').open) return;
    if (event.key === 'Escape') closeBox();
    if (event.key === 'Tab') {
      const focusables = [...$('floatingBox').querySelectorAll('button,a[href],input,textarea,select,[tabindex="0"]')];
      const first = focusables[0], last = focusables[focusables.length - 1];
      if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last.focus(); }
      else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first.focus(); }
    }
  });
  window.addEventListener('beforeprint', preparePrint);
  updateReport();
}
initialize();
