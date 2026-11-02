/* Bilingual placement summaries and annual examples from the supplied Level 2/3
   chapters. Indices correspond to the target milestone, not a new scoring rule. */
(function(root){
  'use strict';
  const p=(en,ar)=>({en,ar}),sections={2:{},3:{}};
  function add(level,category,focus,annual,choices=[0,0,0,1,1]){
    sections[level][category]={focus:focus.map(v=>p(...v)),annual:annual.map(v=>p(...v)),choices};
  }
  add(2,'Mand',[
    ['Develop requests for missing items when there is a genuine reason to obtain them.','نمِّ طلب الأشياء الناقصة عند وجود دافع فعلي للحصول عليها.'],
    ['Expand requests from missing objects to actions needed in play and daily routines.','وسّع الطلب من الأشياء الناقصة إلى الأفعال اللازمة في اللعب والروتين اليومي.'],
    ['Combine meaningful words in requests; avoid counting a memorized carrier phrase as new content.','ادمج كلمات ذات معنى في الطلب، ولا تعدّ العبارة الافتتاحية المحفوظة محتوى جديداً.'],
    ['Increase spontaneous, varied requests across people and natural settings.','زد الطلبات التلقائية والمتنوعة عبر الأشخاص والبيئات الطبيعية.'],
    ['Encourage novel requests without specific teaching and introduce genuine requests for information.','شجّع طلبات جديدة دون تعليم مباشر وابدأ بطلب المعلومات عند الحاجة الفعلية.']
  ],[
    ['Spontaneously request at least 25 different items in natural settings.','يطلب تلقائياً 25 شيئاً مختلفاً على الأقل في بيئات طبيعية.'],
    ['Spontaneously request 3 different actions from others an average of 5 times per day.','يطلب تلقائياً 3 أفعال مختلفة من الآخرين بمتوسط 5 مرات يومياً.'],
    ['Spontaneously request at least 50 times per day using sentences of at least 3 words.','يطلب تلقائياً 50 مرة يومياً على الأقل بجمل من 3 كلمات على الأقل.']
  ],[0,1,2,2,2]);
  add(2,'Tact',[
    ['Expand familiar noun labels while checking listener responses for the same items.','وسّع تسمية الأسماء المألوفة مع التحقق من الاستجابة الاستقبالية للأشياء نفسها.'],
    ['Generalize labels across different examples, people and contexts.','عمّم التسمية عبر أمثلة وأشخاص وسياقات مختلفة.'],
    ['Teach action labels using real movement and varied everyday activities.','علّم تسمية الأفعال باستخدام حركة حقيقية وأنشطة يومية متنوعة.'],
    ['Combine established nouns and verbs, then introduce modifiers carefully.','ادمج الأسماء والأفعال الراسخة ثم أدخل المعدّلات بتدرج.'],
    ['Expand vocabulary while maintaining balance with requests, listener and intraverbal skills.','وسّع المفردات مع الحفاظ على التوازن مع الطلب والاستجابة الاستقبالية والحوار.']
  ],[
    ['Name at least 150 nouns or verbs.','يسمّي 150 اسماً أو فعلاً على الأقل.'],
    ['Name at least 50 two-component noun–verb or verb–noun combinations.','يسمّي 50 تركيباً من اسم وفعل أو فعل واسم على الأقل.'],
    ['Name 20 different adjectives.','يسمّي 20 صفة مختلفة.']
  ],[0,0,1,1,2]);
  add(2,'Listener',[
    ['Expand item identification in varied arrays and functional daily activities.','وسّع تمييز الأشياء ضمن مصفوفات متنوعة وأنشطة يومية وظيفية.'],
    ['Generalize listener responses across examples and increasingly similar alternatives.','عمّم الاستجابات الاستقبالية عبر أمثلة وبدائل تزداد تشابهاً.'],
    ['Develop responses to action instructions using actual actions before relying on static pictures.','نمِّ الاستجابة لتعليمات الأفعال باستخدام أفعال حقيقية قبل الاعتماد على الصور الثابتة.'],
    ['Combine known nouns and verbs in instructions with two meaningful components.','ادمج الأسماء والأفعال المعروفة في تعليمات ذات مكوّنين دالّين.'],
    ['Expand listener vocabulary into scenes and daily settings; review balance with other language skills.','وسّع المفردات الاستقبالية إلى المشاهد والبيئات اليومية وراجع توازنها مع المهارات اللغوية الأخرى.']
  ],[
    ['Perform at least 20 specific actions on request.','ينفّذ 20 فعلاً محدداً على الأقل عند الطلب.'],
    ['Follow at least 100 two-component noun–verb or verb–noun instructions.','يتبع 100 تعليمة ذات مكوّنين من اسم وفعل أو فعل واسم على الأقل.'],
    ['Identify at least 250 items in books, scenes or natural settings when named.','يميّز 250 عنصراً على الأقل في الكتب أو المشاهد أو البيئة الطبيعية عند تسميتها.']
  ],[2,2,0,1,2]);
  add(2,'VP/MTS',[
    ['Build careful visual scanning while increasing identical matching array size.','نمِّ المسح البصري الدقيق مع زيادة حجم مصفوفة المطابقة المتطابقة.'],
    ['Develop sorting by color and shape using models and varied materials.','نمِّ الفرز بحسب اللون والشكل باستخدام نماذج ومواد متنوعة.'],
    ['Practice discrimination among similar alternatives before increasing matching complexity.','درّب التمييز بين بدائل متشابهة قبل زيادة تعقيد المطابقة.'],
    ['Generalize matching to non-identical examples and natural scenes.','عمّم المطابقة إلى أمثلة غير متطابقة ومشاهد طبيعية.'],
    ['Extend matching between objects and pictures in both directions and varied arrays.','وسّع المطابقة بين الأشياء والصور في الاتجاهين وضمن مصفوفات متنوعة.']
  ],[
    ['Match at least 200 non-identical objects or pictures in arrays of 10 with 3 similar alternatives.','يطابق 200 شيء أو صورة غير متطابقة على الأقل ضمن مصفوفة من 10 فيها 3 بدائل متشابهة.'],
    ['Match at least 200 non-identical objects to pictures or vice versa in arrays of 10 with 4 similar alternatives.','يطابق 200 شيء غير متطابق على الأقل بصوره أو العكس ضمن مصفوفة من 10 فيها 4 بدائل متشابهة.']
  ]);
  add(2,'Play',[
    ['Encourage searching for missing toy parts within enjoyable play.','شجّع البحث عن أجزاء الألعاب الناقصة ضمن لعب ممتع.'],
    ['Model functional toy use and gradually fade adult support.','قدّم نموذجاً للاستخدام الوظيفي للألعاب وخفّف دعم الراشد تدريجياً.'],
    ['Expand creative uses of everyday materials and varied play routines.','وسّع الاستخدام الإبداعي للمواد اليومية وروتينات اللعب المتنوعة.'],
    ['Develop enjoyable independent movement and playground activities.','نمِّ الحركة المستقلة الممتعة وأنشطة الملعب.'],
    ['Increase constructive play with multipart toys and persistence to complete sets.','زد اللعب البنائي بالألعاب متعددة الأجزاء والمثابرة لإكمال المجموعات.']
  ],[
    ['Assemble multipart toys for 10 different sets of materials.','يركّب ألعاباً متعددة الأجزاء لعشر مجموعات مختلفة من المواد.'],
    ['Engage in arts and crafts activities for at least 5 minutes.','ينخرط في أنشطة فنية وأشغال يدوية لمدة 5 دقائق على الأقل.'],
    ['Spontaneously engage in pretend play at least 10 times in one week.','ينخرط تلقائياً في اللعب التخيلي 10 مرات على الأقل في أسبوع واحد.']
  ],[0,0,2,1,0]);
  add(2,'Social',[
    ['Support enjoyable, child-initiated physical play with peers.','ادعم مبادرة الطفل للعب الحركي الممتع مع الأقران.'],
    ['Develop functional requests to peers during shared play.','نمِّ الطلب الوظيفي من الأقران أثناء اللعب المشترك.'],
    ['Extend sustained social play and shared constructive or movement activities.','وسّع اللعب الاجتماعي المستمر والأنشطة البنائية أو الحركية المشتركة.'],
    ['Teach meaningful responses to peer requests and reciprocal exchanges.','علّم الاستجابة ذات المعنى لطلبات الأقران والتبادلات المتبادلة.'],
    ['Connect spontaneous peer requests with simple instructions, questions and turn taking.','اربط الطلبات التلقائية من الأقران بتعليمات وأسئلة بسيطة وتبادل الأدوار.']
  ],[
    ['Spontaneously request from peers at least 25 times per day.','يطلب تلقائياً من الأقران 25 مرة يومياً على الأقل.'],
    ['Respond spontaneously to requests from peers 25 times in one day.','يستجيب تلقائياً لطلبات الأقران 25 مرة في يوم واحد.'],
    ['Engage in cooperative, constructive or physical play with peers for at least 5 minutes.','ينخرط في لعب تعاوني أو بنائي أو حركي مع الأقران لمدة 5 دقائق على الأقل.']
  ],[0,0,2,1,0]);
  add(2,'Imitation',[
    ['Imitate object actions while selecting the relevant object from alternatives.','قلّد الأفعال باستخدام الأشياء مع اختيار الشيء المناسب من بين بدائل.'],
    ['Expand fine motor imitation in useful daily and play activities.','وسّع التقليد الحركي الدقيق ضمن أنشطة يومية ولعب وظيفي.'],
    ['Develop longer action sequences and fade verbal prompts.','نمِّ تسلسلات أطول للأفعال وخفّف التلقين اللفظي.'],
    ['Encourage spontaneous imitation of functional skills in everyday settings.','شجّع التقليد التلقائي للمهارات الوظيفية في البيئات اليومية.'],
    ['Provide novel actions to assess generalized imitation on the first trial.','قدّم أفعالاً جديدة لتقييم التقليد المعمم من المحاولة الأولى.']
  ],[
    ['Imitate at least 25 three-step activity sequences.','يقلّد 25 تسلسلاً من الأنشطة مؤلفاً من ثلاث خطوات على الأقل.'],
    ['Imitate 25 new movements on the first trial.','يقلّد 25 حركة جديدة من المحاولة الأولى.']
  ]);
  add(2,'Echoic',[
    ['Expand multisyllabic sound imitation and transfer known words into functional language.','وسّع تقليد الأصوات متعددة المقاطع وانقل الكلمات المعروفة إلى لغة وظيفية.'],
    ['Strengthen clear sound approximations within requesting and naming activities.','عزّز التقريبات الصوتية الواضحة ضمن أنشطة الطلب والتسمية.'],
    ['Use efficient imitation to learn new functional words, with individualized articulation support.','استخدم التقليد الفعال لتعلم كلمات وظيفية جديدة مع دعم فردي للنطق.'],
    ['Generalize imitation to novel words and gently shape clearer responses.','عمّم التقليد إلى كلمات جديدة وشكّل استجابات أوضح بتدرج.'],
    ['Extend generalized imitation to short phrases and everyday communication.','وسّع التقليد المعمم إلى عبارات قصيرة وتواصل يومي.']
  ],[
    ['Echo at least 50 sound combinations of 2 or more syllables or two-word phrases on request.','يقلّد صوتياً 50 تركيباً صوتياً من مقطعين أو أكثر أو عبارة من كلمتين على الأقل عند الطلب.'],
    ['Echo at least 100 sound combinations of 3 or more syllables on request.','يقلّد صوتياً 100 تركيب صوتي من ثلاثة مقاطع أو أكثر على الأقل عند الطلب.']
  ]);
  add(2,'LRFFC',[
    ['Build early function, feature and class listener responses using familiar items and sounds.','ابنِ استجابات استقبالية مبكرة للوظيفة والصفة والفئة باستخدام أشياء وأصوات مألوفة.'],
    ['Develop familiar food and drink classifications using established noun and verb skills.','نمِّ تصنيف الأطعمة والمشروبات المألوفة باستخدام مهارات الأسماء والأفعال الراسخة.'],
    ['Expand fill-in listener tasks using known labels and actions; avoid rote selections.','وسّع مهام الإكمال الاستقبالي باستخدام تسميات وأفعال معروفة وتجنب الاختيار الآلي.'],
    ['Move familiar fill-in relations toward WH questions and varied arrays.','انقل علاقات الإكمال المألوفة إلى أسئلة الاستفهام ومصفوفات متنوعة.'],
    ['Rotate different questions about the same item and check control by each verbal component.','نوّع الأسئلة عن الشيء نفسه وتحقق من تأثير كل مكوّن لفظي في الاستجابة.']
  ],[
    ['Select the correct item from arrays of at least 8 for 25 song, sound or food/drink fill-ins.','يختار العنصر الصحيح من مصفوفة من 8 على الأقل في 25 مهمة إكمال لأغانٍ أو أصوات أو تصنيفات الطعام والشراب.'],
    ['Select the correct item from arrays of at least 8 for 100 function, feature or class questions or fill-ins.','يختار العنصر الصحيح من مصفوفة من 8 على الأقل في 100 سؤال أو إكمال عن الوظيفة أو الصفة أو الفئة.']
  ],[0,0,1,1,1]);
  add(2,'Intraverbal',[
    ['Start with familiar, enjoyable verbal fill-ins rather than complex questions.','ابدأ بإكمالات لفظية مألوفة وممتعة بدلاً من الأسئلة المعقدة.'],
    ['Develop answers to the child’s name and distinguish names of familiar people.','نمِّ الإجابة عن اسم الطفل والتمييز بين أسماء الأشخاص المألوفين.'],
    ['Expand non-song fill-ins using established labels and listener relations.','وسّع الإكمالات غير الغنائية باستخدام التسميات والعلاقات الاستقبالية الراسخة.'],
    ['Transfer known fill-ins to what questions across people and contexts.','انقل الإكمالات المعروفة إلى أسئلة ماذا عبر الأشخاص والسياقات.'],
    ['Expand who and where questions; vary questions and answers to avoid rote responding.','وسّع أسئلة من وأين، ونوّع الأسئلة والإجابات لتجنب الاستجابة المحفوظة.']
  ],[
    ['Provide correct verbal responses to 100 different noun–verb fill-in questions.','يقدم استجابات لفظية صحيحة لمئة سؤال إكمال مختلف يتضمن أسماء وأفعالاً.'],
    ['Answer at least 100 different what questions.','يجيب عن 100 سؤال مختلف باستخدام ماذا على الأقل.']
  ]);
  add(2,'Classroom',[
    ['Develop daily classroom routines with clear, gradually reduced support.','نمِّ الروتينات الصفية اليومية بدعم واضح يتناقص تدريجياً.'],
    ['Build independence with personal items, meals and routine classroom activities.','نمِّ الاستقلال مع الأغراض الشخصية والوجبات والأنشطة الصفية الروتينية.'],
    ['Support transitions between activities while fading individual prompts.','ادعم الانتقال بين الأنشطة مع تلاشي التلقين الفردي.'],
    ['Build comfortable participation in small groups using familiar enjoyable tasks.','نمِّ المشاركة المريحة في مجموعات صغيرة باستخدام مهام مألوفة وممتعة.'],
    ['Increase attending and responding in groups before introducing unfamiliar learning tasks.','زد الانتباه والاستجابة في المجموعات قبل إدخال مهام تعلم غير مألوفة.']
  ],[
    ['Put away personal items, line up and come to a table with only 1 verbal prompt.','يرتب أغراضه الشخصية ويصطف ويأتي إلى الطاولة بتلقين لفظي واحد فقط.'],
    ['Participate in a small group for 10 minutes, attend for 50% of the period and respond to 5 teacher cues.','يشارك في مجموعة صغيرة لمدة 10 دقائق وينتبه خلال 50% من الفترة ويستجيب لخمس إشارات من المعلم.']
  ]);
  add(2,'Linguistics',[
    ['Monitor intelligibility in meaningful speech without an echoic model.','راقب وضوح الكلام ذي المعنى دون نموذج صوتي للتقليد.'],
    ['Expand listener vocabulary alongside expressive labels, checking each separately.','وسّع المفردات الاستقبالية مع التسميات التعبيرية وتحقق من كل منهما بصورة مستقلة.'],
    ['Develop meaningful two-word combinations rather than memorized carrier phrases.','نمِّ تراكيب ذات معنى من كلمتين بدلاً من العبارات الافتتاحية المحفوظة.'],
    ['Support functional variation in stress, rhythm and intonation.','ادعم التنوع الوظيفي في النبر والإيقاع والتنغيم.'],
    ['Expand functional vocabulary across requests, labels and intraverbal responses.','وسّع المفردات الوظيفية عبر الطلب والتسمية والاستجابات الحوارية.']
  ],[
    ['Produce at least 25 different two-word utterances per day.','ينتج 25 عبارة مختلفة من كلمتين على الأقل يومياً.'],
    ['Use phrases and sentences averaging 3 words.','يستخدم عبارات وجملاً بمتوسط ثلاث كلمات.']
  ]);
  add(3,'Mand',[
    ['Develop genuine information-seeking questions and generalize question forms.','نمِّ أسئلة طلب المعلومات عند الحاجة الفعلية وعمّم صيغ الأسئلة.'],
    ['Support effective requests to stop or remove unwanted events across natural situations.','ادعم الطلب الفعال لإيقاف الأحداث غير المرغوبة أو إزالتها عبر مواقف طبيعية.'],
    ['Expand requests with modifiers that reflect the child’s actual motivation.','وسّع الطلب باستخدام معدّلات تعكس دافعية الطفل الفعلية.'],
    ['Develop meaningful directions and explanations during shared activities.','نمِّ التوجيهات والشروح ذات المعنى أثناء الأنشطة المشتركة.'],
    ['Support requests for attention to the child’s own stories and experiences.','ادعم طلب الانتباه إلى قصص الطفل وخبراته الخاصة.']
  ],[
    ['Spontaneously request information 50 times per day using at least 4 different question words.','يطلب المعلومات تلقائياً 50 مرة يومياً باستخدام 4 أدوات استفهام مختلفة على الأقل.'],
    ['Spontaneously tell others how to do things or participate in activities at least 25 times per day.','يشرح تلقائياً للآخرين كيفية فعل الأشياء أو المشاركة في الأنشطة 25 مرة يومياً على الأقل.'],
    ['Spontaneously request attention to stories or descriptions at least 10 times per day.','يطلب تلقائياً الانتباه إلى قصصه أو أوصافه 10 مرات يومياً على الأقل.']
  ],[0,0,1,1,2]);
  add(3,'Tact',[
    ['Rotate questions about visible properties and function; check that the child attends to the question.','نوّع الأسئلة عن الخصائص المرئية والوظيفة وتحقق من انتباه الطفل إلى السؤال.'],
    ['Generalize spatial relations and pronouns across real situations.','عمّم العلاقات المكانية والضمائر عبر مواقف حقيقية.'],
    ['Develop adjectives and adverbs in relation to established nouns, actions and comparisons.','نمِّ الصفات والظروف بالارتباط بأسماء وأفعال ومقارنات راسخة.'],
    ['Expand meaningful sentence-level descriptions across daily experiences.','وسّع الأوصاف ذات المعنى على مستوى الجملة عبر الخبرات اليومية.'],
    ['Expand descriptive vocabulary and transfer new labels into requests and conversation.','وسّع المفردات الوصفية وانقل التسميات الجديدة إلى الطلب والمحادثة.']
  ],[
    ['Describe 25 different items while answering 4 varied questions about each.','يصف 25 عنصراً مختلفاً مع الإجابة عن 4 أسئلة متنوعة عن كل منها.'],
    ['Name 20 adjectives excluding colors and shapes, and 10 adverbs in structured and natural settings.','يسمّي 20 صفة باستثناء الألوان والأشكال و10 ظروف في بيئات منظمة وطبيعية.'],
    ['Describe using sentences of at least 4 words 20 times per day.','يصف بجمل من 4 كلمات على الأقل 20 مرة يومياً.']
  ],[0,0,1,2,1]);
  add(3,'Listener',[
    ['Develop responses to increasingly complex instructions using known language.','نمِّ الاستجابة لتعليمات تزداد تعقيداً باستخدام لغة معروفة.'],
    ['Generalize listener discrimination of prepositions and pronouns across contexts.','عمّم التمييز الاستقبالي لحروف الجر والضمائر عبر السياقات.'],
    ['Teach relative adjectives and adverbs with meaningful comparisons.','علّم الصفات النسبية والظروف باستخدام مقارنات ذات معنى.'],
    ['Attend to each component of longer instructions and generalize across people and settings.','انتبه إلى كل مكوّن في التعليمات الأطول وعمّم عبر الأشخاص والبيئات.'],
    ['Expand listener vocabulary while checking functional comprehension and domain balance.','وسّع المفردات الاستقبالية مع التحقق من الفهم الوظيفي والتوازن بين المجالات.']
  ],[
    ['Discriminate as a listener among 100 four-component combinations.','يميّز استقباليّاً 100 تركيب من أربعة مكوّنات.'],
    ['Discriminate as a listener among 20 adjectives excluding colors and shapes, and 10 adverbs.','يميّز استقباليّاً 20 صفة باستثناء الألوان والأشكال و10 ظروف.'],
    ['Identify at least 1000 words as a listener.','يميّز استقباليّاً 1000 كلمة على الأقل.']
  ],[0,1,1,0,2]);
  add(3,'VP/MTS',[
    ['Use another person’s visual product as a model during arts and crafts.','استخدم النتاج البصري لشخص آخر نموذجاً أثناء الفنون والأشغال.'],
    ['Check novel non-identical matching on first trials; move beyond repeated picture drills.','تحقق من مطابقة أمثلة جديدة غير متطابقة من المحاولة الأولى وتجاوز تدريبات الصور المتكررة.'],
    ['Develop abstract visual construction with designs and multipart puzzles.','نمِّ البناء البصري المجرد باستخدام التصاميم والألغاز متعددة الأجزاء.'],
    ['Develop categorical sorting without a model and generalize categories.','نمِّ الفرز الفئوي دون نموذج وعمّم الفئات.'],
    ['Expand patterns, sequences and part-to-whole relations.','وسّع الأنماط والتسلسلات وعلاقات الجزء بالكل.']
  ],[
    ['Complete 100 designs or puzzles containing at least 8 pieces.','يكمل 100 تصميم أو لغز يحتوي كل منها على 8 قطع على الأقل.'],
    ['Sort at least 5 related items from 10 categories without a sample.','يفرز 5 عناصر مترابطة على الأقل من 10 فئات دون نموذج.'],
    ['Complete or continue 25 patterns with at least 3 parts.','يكمل أو يتابع 25 نمطاً يتألف من 3 أجزاء على الأقل.']
  ],[0,0,0,1,2]);
  add(3,'Play',[
    ['Encourage age-appropriate pretend play with varied props and flexible scripts.','شجّع اللعب التخيلي المناسب للعمر باستخدام أدوات وسيناريوهات مرنة ومتنوعة.'],
    ['Offer movement games where practice produces a more enjoyable effect.','وفّر ألعاباً حركية ينتج عن ممارستها أثر أكثر متعة.'],
    ['Build sustained independent arts and crafts with varied materials.','نمِّ الاستمرار المستقل في الفنون والأشغال باستخدام مواد متنوعة.'],
    ['Gradually extend independent leisure play without continuous adult prompts.','زد اللعب الترفيهي المستقل تدريجياً دون تلقين مستمر من الراشد.'],
    ['Introduce enjoyable independent pre-academic books and drawing activities.','أدخل كتباً تمهيدية وأنشطة رسم ممتعة ومستقلة.']
  ],[
    ['Independently engage in arts and crafts for 15 minutes.','ينخرط مستقلاً في الفنون والأشغال لمدة 15 دقيقة.'],
    ['Independently sustain play for 15 minutes without adult prompts or reinforcement.','يستمر مستقلاً في اللعب لمدة 15 دقيقة دون تلقين أو تعزيز من الراشد.'],
    ['Independently draw or write in pre-academic activity books for 10 minutes.','يرسم أو يكتب مستقلاً في كتب الأنشطة التمهيدية لمدة 10 دقائق.']
  ],[1,1,0,1,2]);
  add(3,'Social',[
    ['Support cooperation toward a shared outcome and expand peer play opportunities.','ادعم التعاون لتحقيق نتيجة مشتركة ووسّع فرص اللعب مع الأقران.'],
    ['Encourage genuine information-seeking questions directed to peers.','شجّع أسئلة طلب المعلومات الموجهة إلى الأقران عند الحاجة الفعلية.'],
    ['Develop relevant responses to peers’ questions and comments.','نمِّ الاستجابات المناسبة لأسئلة الأقران وتعليقاتهم.'],
    ['Expand flexible pretend play with peers and fade adult direction.','وسّع اللعب التخيلي المرن مع الأقران وخفّف توجيه الراشد.'],
    ['Develop reciprocal conversation, topic maintenance and turn taking.','نمِّ المحادثة المتبادلة والحفاظ على الموضوع وتبادل الأدوار.']
  ],[
    ['Engage in cooperative, constructive or physical play with peers for at least 15 minutes.','ينخرط في لعب تعاوني أو بنائي أو حركي مع الأقران لمدة 15 دقيقة على الأقل.'],
    ['Respond to questions from peers at least 20 times per day.','يستجيب لأسئلة الأقران 20 مرة يومياً على الأقل.'],
    ['Spontaneously exchange at least 4 conversational turns with a peer an average of 10 times per day.','يتبادل تلقائياً 4 أدوار حوارية على الأقل مع قرين بمتوسط 10 مرات يومياً.']
  ],[0,2,1,0,2]);
  add(3,'Reading',[
    ['Build interest in shared stories and connect spoken text with print.','نمِّ الاهتمام بالقصص المشتركة واربط النص المنطوق بالمطبوع.'],
    ['Develop letter identification across fonts and contexts in the assessed writing system.','نمِّ تمييز الحروف عبر الخطوط والسياقات ضمن نظام الكتابة المقيم.'],
    ['Distinguish letter names from sounds and generalize both.','ميّز أسماء الحروف من أصواتها وعمّم كليهما.'],
    ['Develop recognition of the child’s written name in varied contexts.','نمِّ تعرف اسم الطفل المكتوب في سياقات متنوعة.'],
    ['Connect written words with objects and pictures to check meaning, not just decoding.','اربط الكلمات المكتوبة بالأشياء والصور للتحقق من المعنى لا من فك الرموز فقط.']
  ],[
    ['Name and identify as a listener all 26 English uppercase and lowercase letters.','يسمّي ويميّز استقباليّاً الحروف الإنجليزية الستة والعشرين بحالتيها الكبيرة والصغيرة.'],
    ['Read and identify as a listener at least 25 written words.','يقرأ ويميّز استقباليّاً 25 كلمة مكتوبة على الأقل.'],
    ['Match at least 25 written words to their pictures and vice versa.','يطابق 25 كلمة مكتوبة بصورها على الأقل وبالعكس.']
  ],[0,0,0,1,2]);
  add(3,'Writing',[
    ['Develop imitation of meaningful writing and drawing actions with suitable tools.','نمِّ تقليد أفعال كتابة ورسم ذات معنى باستخدام أدوات مناسبة.'],
    ['Build controlled tracing of simple shapes before smaller letter forms.','نمِّ التتبع المضبوط للأشكال البسيطة قبل أشكال الحروف الأصغر.'],
    ['Develop copying of letters and numbers, generalizing across models.','نمِّ نسخ الحروف والأرقام وعمّم عبر النماذج.'],
    ['Develop legible writing of the child’s name and meaningful familiar words.','نمِّ كتابة اسم الطفل وكلمات مألوفة ذات معنى بخط مقروء.'],
    ['Generalize legible copying and gradually reduce size while maintaining control.','عمّم النسخ المقروء وقلّل الحجم تدريجياً مع الحفاظ على الضبط.']
  ],[
    ['Independently trace 6 geometric shapes within 1/4 inch of the lines.','يتتبع مستقلاً 6 أشكال هندسية ضمن ربع بوصة من الخطوط.'],
    ['Legibly copy numbers 1–20.','ينسخ الأرقام من 1 إلى 20 بخط مقروء.'],
    ['Legibly write the child’s own name without copying.','يكتب اسمه بخط مقروء دون نسخ.']
  ],[0,0,1,2,2]);
  add(3,'LRFFC',[
    ['Discriminate among similar alternatives while attending to the whole question.','ميّز بين البدائل المتشابهة مع الانتباه إلى السؤال كاملاً.'],
    ['Use two verbal components to find items in books and scenes.','استخدم مكوّنين لفظيين لإيجاد أشياء في الكتب والمشاهد.'],
    ['Respond to three-component questions in natural settings and scenes.','استجب لأسئلة من ثلاثة مكوّنات في البيئات الطبيعية والمشاهد.'],
    ['Rotate different questions about one topic and check each changing verbal relation.','نوّع الأسئلة عن موضوع واحد وتحقق من كل علاقة لفظية متغيرة.'],
    ['Expand functional question comprehension and transfer known relations into conversation.','وسّع فهم الأسئلة الوظيفي وانقل العلاقات المعروفة إلى المحادثة.']
  ],[
    ['Select the correct item in scenes or natural settings for 500 different function, feature or class WH questions.','يختار العنصر الصحيح في المشاهد أو البيئة الطبيعية في 500 سؤال استفهامي مختلف عن الوظيفة أو الصفة أو الفئة.'],
    ['Select the correct item for 200 four-component function, feature or class WH questions in arrays of at least 10 or scenes.','يختار العنصر الصحيح في 200 سؤال استفهامي من أربعة مكوّنات عن الوظيفة أو الصفة أو الفئة ضمن مصفوفة من 10 على الأقل أو مشاهد.'],
    ['Select the correct item for 1000 different function, feature or class WH questions in scenes or natural settings.','يختار العنصر الصحيح في 1000 سؤال استفهامي مختلف عن الوظيفة أو الصفة أو الفئة في المشاهد أو البيئة الطبيعية.']
  ],[0,0,1,1,2]);
  add(3,'Intraverbal',[
    ['Encourage relevant spontaneous comments in meaningful everyday interactions.','شجّع التعليقات التلقائية المناسبة ضمن تفاعلات يومية ذات معنى.'],
    ['Expand conversational content across stories, events and experiences.','وسّع محتوى المحادثة عبر القصص والأحداث والخبرات.'],
    ['Build listening to short passages and answering questions about their meaning.','نمِّ الاستماع إلى مقاطع قصيرة والإجابة عن أسئلة عن معناها.'],
    ['Describe events with varied meaningful language rather than memorized scripts.','صف الأحداث بلغة متنوعة ذات معنى بدلاً من نصوص محفوظة.'],
    ['Rotate WH questions on one topic and attend to each changing word.','نوّع أسئلة الاستفهام عن موضوع واحد وانتبه إلى كل كلمة متغيرة.']
  ],[
    ['Describe 50 events, videos or stories using at least 8 words.','يصف 50 حدثاً أو مقطع فيديو أو قصة باستخدام 8 كلمات على الأقل.'],
    ['Answer 3 questions after each of 50 short book passages.','يجيب عن 3 أسئلة بعد كل من 50 مقطعاً قصيراً من كتاب.'],
    ['Answer 4 different WH questions about one topic for 25 topics.','يجيب عن 4 أسئلة استفهامية مختلفة عن الموضوع نفسه في 25 موضوعاً.']
  ],[0,0,1,0,2]);
  add(3,'Classroom',[
    ['Develop independence in toileting and hand washing with individualized supports.','نمِّ الاستقلال في استخدام الحمام وغسل اليدين بدعم فردي مناسب.'],
    ['Respond to group instructions without relying on the child’s name or direct individual prompts.','استجب لتعليمات المجموعة دون الاعتماد على اسم الطفل أو التلقين الفردي المباشر.'],
    ['Increase independent work in a group with meaningful tasks.','زد العمل المستقل ضمن مجموعة باستخدام مهام ذات معنى.'],
    ['Teach new skills in group activities and check actual learning.','علّم مهارات جديدة في أنشطة المجموعة وتحقق من التعلم الفعلي.'],
    ['Extend group participation and relevant answers while retaining needed individual support.','وسّع المشاركة الجماعية والإجابات المناسبة مع الإبقاء على الدعم الفردي اللازم.']
  ],[
    ['Respond to 10 group instructions or questions without direct prompts in a group of at least 5 children.','يستجيب لعشر تعليمات أو أسئلة جماعية دون تلقين مباشر ضمن مجموعة من 5 أطفال على الأقل.'],
    ['Work independently for 15 minutes in a group and remain on task for 75% of the period.','يعمل مستقلاً لمدة 15 دقيقة في مجموعة ويبقى منشغلاً بالمهمة خلال 75% من الفترة.'],
    ['Participate in a 20-minute group with 5 children and answer 10 intraverbal questions.','يشارك في مجموعة من 5 أطفال لمدة 20 دقيقة ويجيب عن 10 أسئلة حوارية.']
  ],[0,0,1,1,2]);
  add(3,'Linguistics',[
    ['Generalize plural and possessive forms across meaningful language contexts.','عمّم صيغ الجمع والملكية عبر سياقات لغوية ذات معنى.'],
    ['Develop past and future forms in functional contexts, including irregular forms where relevant.','نمِّ صيغ الماضي والمستقبل في سياقات وظيفية، بما فيها الصيغ غير المنتظمة عند ملاءمتها.'],
    ['Expand noun phrases with independently meaningful modifiers.','وسّع العبارات الاسمية باستخدام معدّلات ذات معنى مستقل.'],
    ['Expand verb phrases and generalize modifiers across activities.','وسّع العبارات الفعلية وعمّم المعدّلات عبر الأنشطة.'],
    ['Combine noun and verb phrases into meaningful grammatical sentences.','ادمج العبارات الاسمية والفعلية في جمل نحوية ذات معنى.']
  ],[
    ['Use utterances averaging 4 words with mostly correct word order.','يستخدم عبارات بمتوسط 4 كلمات وبترتيب كلمات صحيح في معظمها.'],
    ['Produce 50 noun phrases of at least 3 words with 2 modifiers.','ينتج 50 عبارة اسمية من 3 كلمات على الأقل مع معدّلين.'],
    ['Produce 50 verb phrases of at least 3 words with 2 modifiers.','ينتج 50 عبارة فعلية من 3 كلمات على الأقل مع معدّلين.'],
    ['Combine noun and verb phrases into 10 grammatical sentences of at least 5 words.','يدمج العبارات الاسمية والفعلية في 10 جمل نحوية من 5 كلمات على الأقل.']
  ],[0,0,1,2,3]);
  add(3,'Math',[
    ['Develop number identification and generalize fonts and everyday number contexts.','نمِّ تمييز الأرقام وعمّم الخطوط والسياقات العددية اليومية.'],
    ['Connect number names and symbols, then extend beyond the first five numbers.','اربط أسماء الأعداد برموزها ثم توسّع بعد الأعداد الخمسة الأولى.'],
    ['Count out requested quantities from larger sets with one-to-one correspondence.','عُدّ الكميات المطلوبة من مجموعات أكبر مع تناظر واحد لواحد.'],
    ['Develop functional comparisons of quantity, size, length and other measurement concepts.','نمِّ المقارنات الوظيفية للكمية والحجم والطول ومفاهيم القياس الأخرى.'],
    ['Connect written numbers to quantities in both directions and generalize to daily tasks.','اربط الأرقام المكتوبة بالكميات في الاتجاهين وعمّم إلى المهام اليومية.']
  ],[
    ['Name and identify as a listener the numbers 1–10.','يسمّي ويميّز استقباليّاً الأرقام من 1 إلى 10.'],
    ['Count to 10 with one-to-one correspondence.','يعدّ حتى 10 بتناظر واحد لواحد.'],
    ['Match numbers to quantities and quantities to numbers for 1–10.','يطابق الأرقام بالكميات والكميات بالأرقام من 1 إلى 10.'],
    ['Respond to listener tasks involving 10 different mathematical comparison concepts.','يستجيب لمهام استقبالية تتضمن 10 مفاهيم مختلفة للمقارنة الرياضية.']
  ],[0,0,1,3,2]);
  root.VBIEPCurriculum={revision:'2026-10-29-v1',sections,sources:[
    {id:'level2-text-2',level:2,revision:'2026-10-29-v1',sha256:'791dc700ffeeeb249be322a5fab8a8d2975c04365fd5549ae5fd53696d9c05e8',title:p('Interpreting the Level 2 Assessment: Curriculum Placement and Writing IEP Goals','تفسير تقييم المستوى الثاني: تحديد المنهج وكتابة أهداف الخطة التربوية الفردية')},
    {id:'level3-text-3',level:3,revision:'2026-10-29-v1',title:p('Interpreting the Level 3 Assessment: Curriculum Placement and Writing IEP Goals','تفسير تقييم المستوى الثالث: تحديد المنهج وكتابة أهداف الخطة التربوية الفردية'),sha256:'a9803f3a3021e2c8f8e8f3014ab5b14ba91cb96ef2a7a7e003ec3ed982c91f7f'}
  ]};
})(typeof window!=='undefined'?window:globalThis);
