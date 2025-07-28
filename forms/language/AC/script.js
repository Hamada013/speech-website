// قائمة المهارات الـ65 موزعة حسب المجموعات العمرية
const skillGroups = [
  {
    label: "العمر 0:0 - 0:2 و 0:3 - 0:5",
    items: [
      {
        number: 1,
        text: "وجود منعكس المص والبلع",
        instruction: "زجاجة رضاعة بحلمة أو لهاية يقدّمها المُعتني\nالتقييم : يُظهر تسلسلاً منسقًا بين المصّ والبلع؛ دون سعال أو اختناق أو سكب"
      },
      {
        number: 2,
        text: "يُصدر أصواتًا من الحنجرة",
        instruction: "ضع الطفل مستلقياً على ظهره وتحدث إليه.\nالتقييم : يُصدر أصواتًا رخوة، حنجريّة، غَرغَرية"
      },
      {
        number: 3,
        text: "يستجيب للأصوات البيئية غير الأصوات البشرية",
        instruction: "المواد: كتيب الصور الصفحات 1–5\nاصدر أصوات بيئية كجرس أو صفارة وانتظر استجابة الطفل\nدرجة الأداء: 1 = يحرك رأسه أو يتفاعل بطريقة ما"
      },
      {
        number: 4,
        text: "يحرك رأسه لتحديد مصدر الصوت",
        instruction: "المواد: كتيب الصور الصفحات 1–5\nاصدر صوتاً من جهة معينة وراقب حركة رأس الطفل\nدرجة الأداء: 1 = يحرك رأسه باتجاه الصوت"
      },
      {
        number: 5,
        text: "يستجيب لصوت جديد",
        instruction: "المواد: كتيب الصور الصفحات 1–5\nاستخدم صوتًا غير مألوف لجذب انتباه الطفل\nدرجة الأداء: 1 = يظهر استجابة فورية كالتوقف عن اللعب أو النظر نحو الصوت"
      }
    ]
  },
  {
    label: "العمر 0:6 - 0:8 و 0:9 - 0:11",
    items: [
      {
        number: 6,
        text: "يبحث بنشاط عن المتحدث",
        instruction: "المواد: كتيب الصور الصفحات 6–10\nنادي الطفل بصوت معتدل وراقب رد فعله\nدرجة الأداء: 1 = يحرك عينيه أو رأسه نحو المتحدث"
      },
      {
        number: 7,
        text: "يضع الأشياء في فمه",
        instruction: "المواد: كتيب الصور الصفحات 6–10\nقدّم ألعابًا أو أشياء آمنة وراقب سلوك الطفل\nدرجة الأداء: 1 = يضع الشيء في فمه"
      },
      {
        number: 8,
        text: "يهز ويضرب الأشياء أثناء اللعب",
        instruction: "المواد: كتيب الصور الصفحات 6–10\nقدم ألعابًا خفيفة وراقب رد فعل الطفل\nدرجة الأداء: 1 = يهز أو يضرب الشيء"
      },
      {
        number: 9,
        text: "يتوقع ما سيحدث لاحقًا",
        instruction: "المواد: كتيب الصور الصفحات 6–10\nكرر نشاطًا معينًا مثل رفع الطفل ثم إنزاله\nدرجة الأداء: 1 = يظهر علامات التوقع كالابتسامة أو الاستعداد"
      },
      {
        number: 10,
        text: "يبحث عن الأشياء التي سقطت",
        instruction: "المواد: كتيب الصور الصفحات 6–10\nأسقط لعبة أمام الطفل وراقب ردة فعله\nدرجة الأداء: 1 = ينظر أو يحاول العثور على اللعبة"
      },
      {
        number: 11,
        text: "يفهم الطلب عندما تمد يدك وتقول \"تعال هنا\"",
        instruction: "المواد: لا توجد\nمدّ يديك وراحتيك إلى الأعلى وقل \"تعال إلى هنا\"\nدرجة الأداء: 1 = يستجيب بالتقدّم نحوك أو بالتعلّق بمقدّم الرعاية"
      }
    ]
  },
  {
    label: "العمر 1:0 - 1:5",
    items: [
      {
        number: 12,
        text: "يوقف نشاطه عندما يناديه باسمه",
        instruction: "المواد: كتيب الصور الصفحات 11–15\nنادِ الطفل باسمه وانتظر استجابته\nدرجة الأداء: 1 = يتوقف أو يلتفت"
      },
      {
        number: 13,
        text: "ينظر إلى الأشياء أو الأشخاص المشار إليهم والمسماة من قبل مقدم الرعاية",
        instruction: "المواد: كتيب الصور الصفحات 11–15\nأشر إلى شيء أو شخص وسمّه بصوت واضح\nدرجة الأداء: 1 = ينظر إلى الشيء أو الشخص المشار إليه"
      },
      {
        number: 14,
        text: "يستجيب لكلمة تحذيرية (مثل \"لا\")",
        instruction: "المواد: كتيب الصور الصفحات 11–15\nاستخدم كلمة \"لا\" بنبرة حازمة مع مناسبة\nدرجة الأداء: 1 = يظهر استجابة توقف أو حذر"
      },
      {
        number: 15,
        text: "يفهم كلمة أو عبارة بدون إشارات",
        instruction: "المواد: كتيب الصور الصفحات 11–15\nقل كلمة أو عبارة بسيطة وانتظر استجابة الطفل\nدرجة الأداء: 1 = يستجيب بطريقة مناسبة (نظرة، حركة)"
      }
    ]
  },
  {
    label: "العمر 1:6 - 1:11",
    items: [
      {
        number: 16,
        text: "يظهر لعبًا وظيفيًا",
        instruction: "المواد: كتيب الصور الصفحات 16–20\nقدم ألعابًا شائعة وشاهد كيفية اللعب بها\nدرجة الأداء: 1 = يستخدم اللعبة بالطريقة المتوقعة"
      },
      {
        number: 17,
        text: "يظهر لعبًا علاقاتيًا",
        instruction: "المواد: كتيب الصور الصفحات 16–20\nراقب تفاعل الطفل مع شخص أو لعبة\nدرجة الأداء: 1 = يتبادل اللعب مع الآخرين"
      },
      {
        number: 18,
        text: "يظهر لعبًا موجهًا ذاتيًا",
        instruction: "المواد: كتيب الصور الصفحات 16–20\nراقب سلوك اللعب المستقل للطفل\nدرجة الأداء: 1 = يلعب بشكل مستقل ومنظم"
      }
    ]
  },
  {
    label: "العمر 2:0 - 2:5",
    items: [
      {
        number: 19,
        text: "يتبع تعليمات روتينية مألوفة مع الإشارات",
        instruction: "المواد: كتيب الصور الصفحات 21–25\nاعطِ تعليمات مع إشارات وتحقق من تنفيذها\nدرجة الأداء: 1 = ينفذ التعليمات بدقة"
      },
      {
        number: 20,
        text: "يميز الأشياء المألوفة بين مجموعة بدون إشارات",
        instruction: "المواد: كتيب الصور الصفحات 21–25\nاطلب من الطفل اختيار شيء من بين عدة أشياء\nدرجة الأداء: 1 = يختار الشيء الصحيح"
      },
      {
        number: 21,
        text: "يحدد صور الأشياء المألوفة",
        instruction: "المواد: كتيب الصور الصفحات 21–25\nاعرض صورًا لأشياء معروفة واطلب تسمية أو الإشارة إليها\nدرجة الأداء: 1 = يحدد الصورة الصحيحة"
      },
      {
        number: 22,
        text: "يتبع التعليمات مع الإشارات",
        instruction: "المواد: كتيب الصور الصفحات 21–25\nاعطِ تعليمات مع إشارات وانتظر التنفيذ\nدرجة الأداء: 1 = ينفذ التعليمات كما هو مطلوب"
      }
    ]
  },
  {
    label: "العمر 2:6 - 2:11",
    items: [
      {
        number: 23,
        text: "يحدد أجزاء الجسم الأساسية",
        instruction: "المواد: كتيب الصور الصفحات 26–30\nاطلب من الطفل الإشارة إلى أجزاء جسده أو صورها\nدرجة الأداء: 1 = يشير بشكل صحيح"
      },
      {
        number: 24,
        text: "يحدد الملابس",
        instruction: "المواد: كتيب الصور الصفحات 26–30\nعرض صور أو ملابس حقيقية واطلب تحديدها\nدرجة الأداء: 1 = يميز الملابس بشكل صحيح"
      },
      {
        number: 25,
        text: "يفهم أفعال \"يأكل\"، \"يشرب\"، و\"ينام\" في السياق",
        instruction: "المواد: كتيب الصور الصفحات 26–30\nاستخدم صورًا أو أشياء توضح الأفعال واطلب تحديدها\nدرجة الأداء: 1 = يربط الفعل بالصورة أو الشيء الصحيح"
      },
      {
        number: 26,
        text: "يشارك في اللعب التخيلي",
        instruction: "المواد: كتيب الصور الصفحات 26–30\nشجع الطفل على اللعب الخيالي مثل إطعام دمية\nدرجة الأداء: 1 = يشارك في اللعب التخيلي"
      }
    ]
  },
  {
    label: "العمر 3:0 - 3:5",
    items: [
      {
        number: 27,
        text: "يفهم الضمائر (أنا، لي، أنت)",
        instruction: "المواد: كتيب الصور الصفحات 31–35\nاستخدم جملًا بسيطة مع الضمائر واطلب الفهم أو التفاعل\nدرجة الأداء: 1 = يميز الضمائر بشكل صحيح"
      },
      {
        number: 28,
        text: "يتبع الأوامر بدون إشارات",
        instruction: "المواد: كتيب الصور الصفحات 31–35\nاعطِ أوامر بسيطة شفهيًا وانتظر التنفيذ\nدرجة الأداء: 1 = ينفذ الأمر بدون إشارة"
      },
      {
        number: 29,
        text: "يشارك في اللعب الرمزي",
        instruction: "المواد: كتيب الصور الصفحات 31–35\nراقب الطفل أثناء اللعب بأشياء تمثل أشياء أخرى\nدرجة الأداء: 1 = يظهر اللعب الرمزي"
      },
      {
        number: 30,
        text: "يفهم التسلسل البسيط (قبل وبعد)",
        instruction: "المواد: كتيب الصور الصفحات 31–35\nاستخدم أنشطة مع تسلسل خطوات واطلب الفهم\nدرجة الأداء: 1 = يتبع التسلسل بشكل صحيح"
      }
    ]
  },
  {
    label: "العمر 3:6 - 3:11",
    items: [
      {
        number: 31,
        text: "يفهم الأسئلة البسيطة (ماذا؟ أين؟ من؟)",
        instruction: "المواد: كتيب الصور الصفحات 36–40\nاطرح أسئلة بسيطة وانتظر إجابة الطفل\nدرجة الأداء: 1 = يجيب بشكل صحيح"
      },
      {
        number: 32,
        text: "يستخدم الجمل البسيطة لفهم التعليمات",
        instruction: "المواد: كتيب الصور الصفحات 36–40\nاعطِ تعليمات مع جمل بسيطة وانتظر التنفيذ\nدرجة الأداء: 1 = ينفذ التعليمات بدقة"
      },
      {
        number: 33,
        text: "يفهم المفردات المتعلقة بالأشياء اليومية",
        instruction: "المواد: كتيب الصور الصفحات 36–40\nاختبر المفردات بالصور أو الأجسام الحقيقية\nدرجة الأداء: 1 = يميز المفردات بشكل جيد"
      }
    ]
  },
  {
    label: "العمر 4:0 - 4:11",
    items: [
      {
        number: 34,
        text: "يفهم المفاهيم الزمنية (اليوم، غدًا، أمس)",
        instruction: "المواد: كتيب الصور الصفحات 41–45\nناقش المفاهيم الزمنية باستخدام الأمثلة اليومية\nدرجة الأداء: 1 = يميز ويفهم المفاهيم"
      },
      {
        number: 35,
        text: "يتبع تعليمات معقدة متسلسلة",
        instruction: "المواد: كتيب الصور الصفحات 41–45\nاعطِ تعليمات متسلسلة معقدة\nدرجة الأداء: 1 = ينفذ التعليمات كاملة"
      },
      {
        number: 36,
        text: "يفهم العلاقات السببية البسيطة",
        instruction: "المواد: كتيب الصور الصفحات 41–45\nناقش أمثلة لعلاقات سببية بسيطة\nدرجة الأداء: 1 = يفهم العلاقة"
      }
    ]
  },
  {
    label: "العمر 5:0 - 5:11",
    items: [
      {
        number: 37,
        text: "يفهم القصص القصيرة",
        instruction: "المواد: قصص بسيطة\nاقرأ قصة قصيرة واطرح أسئلة\nدرجة الأداء: 1 = يجيب على الأسئلة"
      },
      {
        number: 38,
        text: "يستطيع إعادة سرد قصة بسيطة",
        instruction: "المواد: قصص بسيطة\nاطلب من الطفل إعادة سرد قصة\nدرجة الأداء: 1 = يعيد السرد بشكل منطقي"
      },
      {
        number: 39,
        text: "يفهم المفردات المجردة",
        instruction: "المواد: مفردات متنوعة\nاختبر فهم المفردات المجردة\nدرجة الأداء: 1 = يميز المفردات"
      }
    ]
  },
  {
    label: "العمر 6:0 - 6:11",
    items: [
      {
        number: 40,
        text: "يفهم الأفكار المجردة",
        instruction: "المواد: نصوص مبسطة\nناقش أفكارًا مجردة مع الطفل\nدرجة الأداء: 1 = يفهم ويشرح"
      },
      {
        number: 41,
        text: "يحلل ويقارن المعلومات",
        instruction: "المواد: أنشطة تحليلية\nقدم أنشطة للمقارنة والتحليل\nدرجة الأداء: 1 = يقوم بالمقارنة بشكل صحيح"
      },
      {
        number: 42,
        text: "يفهم النكات البسيطة والفكاهة",
        instruction: "المواد: نكات بسيطة\nاقرأ نكات وناقش معناها\nدرجة الأداء: 1 = يفهم النكات"
      }
    ]
  },
  {
    label: "العمر 7:0 - 7:11",
    items: [
      {
        number: 43,
        text: "يفهم النصوص المطولة",
        instruction: "المواد: نصوص طويلة\nاقرأ نصًا واطرح أسئلة\nدرجة الأداء: 1 = يجيب بدقة"
      },
      {
        number: 44,
        text: "يحلل ويستنتج المعاني الضمنية",
        instruction: "المواد: نصوص وفيديوهات\nناقش المعاني الضمنية\nدرجة الأداء: 1 = يستنتج بشكل جيد"
      },
      {
        number: 45,
        text: "يستخدم مهارات التفكير النقدي",
        instruction: "المواد: أسئلة مناقشة\nشجع الطفل على التفكير النقدي\nدرجة الأداء: 1 = يشارك بآراء نقدية"
      }
    ]
  },
  {
    label: "العمر 8:0 - 8:11",
    items: [
      {
        number: 46,
        text: "يفهم المعاني المجازية",
        instruction: "المواد: أمثلة مجازية\nناقش معاني الاستعارات والتشبيهات\nدرجة الأداء: 1 = يفهم المعاني"
      },
      {
        number: 47,
        text: "يفهم نصوص الأدب",
        instruction: "المواد: نصوص أدبية\nاقرأ نصوص أدبية وناقشها\nدرجة الأداء: 1 = يشرح النصوص"
      },
      {
        number: 48,
        text: "يستخدم مهارات التلخيص",
        instruction: "المواد: نصوص مختلفة\nاطلب تلخيص نص\nدرجة الأداء: 1 = يلخص بوضوح"
      }
    ]
  },
  {
    label: "العمر 9:0 - 9:11",
    items: [
      {
        number: 49,
        text: "يفهم النصوص العلمية",
        instruction: "المواد: نصوص علمية مبسطة\nناقش المعلومات العلمية\nدرجة الأداء: 1 = يفهم المصطلحات"
      },
      {
        number: 50,
        text: "يستخدم مهارات الاستدلال",
        instruction: "المواد: أنشطة استدلال\nقدم مسائل تستدلالية\nدرجة الأداء: 1 = يحلها بشكل صحيح"
      },
      {
        number: 51,
        text: "يحلل النصوص المعقدة",
        instruction: "المواد: نصوص معقدة\nناقش نصوصًا معقدة\nدرجة الأداء: 1 = يفهم النصوص"
      }
    ]
  },
  {
    label: "العمر 10:0 - 10:11",
    items: [
      {
        number: 52,
        text: "يفهم المصطلحات التقنية",
        instruction: "المواد: نصوص تقنية\nاقرأ وناقش مصطلحات تقنية\nدرجة الأداء: 1 = يفهم المصطلحات"
      },
      {
        number: 53,
        text: "يستخدم مهارات التفكير التحليلي",
        instruction: "المواد: أنشطة تحليلية متقدمة\nقدم أنشطة تحليلية\nدرجة الأداء: 1 = يشارك بفعالية"
      },
      {
        number: 54,
        text: "يفسر النصوص الأدبية",
        instruction: "المواد: نصوص أدبية متقدمة\nناقش التفسيرات\nدرجة الأداء: 1 = يفسر بشكل جيد"
      }
    ]
  },
  {
    label: "العمر 11:0 - 11:11",
    items: [
      {
        number: 55,
        text: "يستخدم مهارات التفكير النقدي المتقدم",
        instruction: "المواد: نقاشات متقدمة\nشارك في نقاشات نقدية\nدرجة الأداء: 1 = يعبر عن آرائه بوضوح"
      },
      {
        number: 56,
        text: "يفهم المواضيع العلمية المعقدة",
        instruction: "المواد: نصوص علمية متقدمة\nاقرأ وناقش\nدرجة الأداء: 1 = يفهم بعمق"
      },
      {
        number: 57,
        text: "يحلل المعلومات متعددة المصادر",
        instruction: "المواد: مشاريع بحثية\nشارك في التحليل\nدرجة الأداء: 1 = يحلل بشكل متكامل"
      }
    ]
  },
  {
    label: "العمر 12:0 - 12:11",
    items: [
      {
        number: 58,
        text: "يستخدم مهارات البحث العلمي",
        instruction: "المواد: مشاريع بحث\nشارك في بحث علمي\nدرجة الأداء: 1 = يجمع ويحلل البيانات"
      },
      {
        number: 59,
        text: "يفسر النصوص التقنية المعقدة",
        instruction: "المواد: نصوص تقنية متقدمة\nاقرأ وفسر\nدرجة الأداء: 1 = يفهم ويشرح"
      },
      {
        number: 60,
        text: "يقدم عروضًا شفوية فعالة",
        instruction: "المواد: عروض تقديمية\nقدم عرضًا شفهيًا\nدرجة الأداء: 1 = يتحدث بثقة"
      }
    ]
  },
  {
    label: "العمر 13:0 - 13:11",
    items: [
      {
        number: 61,
        text: "يستخدم مهارات الكتابة التحليلية",
        instruction: "المواد: كتابة مقالات\nكتب مقالًا تحليليًا\nدرجة الأداء: 1 = يعبر بوضوح"
      },
      {
        number: 62,
        text: "يفهم النصوص القانونية",
        instruction: "المواد: نصوص قانونية\nاقرأ وناقش\nدرجة الأداء: 1 = يفهم المصطلحات"
      },
      {
        number: 63,
        text: "يحلل نصوصًا أدبية معقدة",
        instruction: "المواد: نصوص أدبية\nناقش\nدرجة الأداء: 1 = يقدم تحليلاً نقديًا"
      }
    ]
  },
  {
    label: "العمر 14:0 - 14:11",
    items: [
      {
        number: 64,
        text: "يستخدم مهارات التفاوض والإقناع",
        instruction: "المواد: أنشطة نقاش\nشارك في التفاوض\nدرجة الأداء: 1 = يستخدم الحجج بفعالية"
      },
      {
        number: 65,
        text: "يكتب تقارير بحثية مفصلة",
        instruction: "المواد: كتابة تقارير\nكتب تقريرًا بحثيًا\nدرجة الأداء: 1 = يعبر عن الأفكار بوضوح ودقة"
      }
    ]
  }
];


// متغيرات التحكم
const responses = {};
const showInstructions = {};
const showImages = {};
const hideImageButtonFor = [1,2,3];


const skillsContainer = document.getElementById("skills-container");

function renderSkills() {
  skillsContainer.innerHTML = "";

  skillGroups.forEach((group) => {
    const groupCard = document.createElement("div");
    groupCard.className = "group-card";

    const groupHeader = document.createElement("h3");
    groupHeader.className = "group-header";
    groupHeader.textContent = group.label;
    groupCard.appendChild(groupHeader);

    group.items.forEach((item) => {
      const skillItem = document.createElement("div");
      skillItem.className = "skill-item";

      // نستخدم flex لتقسيم العنصر إلى قسمين
      const skillMain = document.createElement("div");
      skillMain.className = "skill-main"; // النص والتعليمات
      const skillControls = document.createElement("div");
      skillControls.className = "skill-controls"; // الأزرار

      // النص الرئيسي
      const skillHeader = document.createElement("p");
      skillHeader.textContent = `${item.number}. ${item.text}`;
      skillHeader.className = "skill-text";
      skillMain.appendChild(skillHeader);

      // إذا التعليمات مفعلة، عرض نص التعليمات
      if (showInstructions[item.number]) {
        const instrText = document.createElement("pre");
        instrText.className = "instructions-text";
        instrText.textContent = item.instruction;
        skillMain.appendChild(instrText);
      }

      // داخل دالة renderSkills()
function renderSkills() {
  skillsContainer.innerHTML = "";

  skillGroups.forEach((group) => {
    const groupCard = document.createElement("div");
    groupCard.className = "group-card";

    const groupTitle = document.createElement("h3");
    groupTitle.textContent = group.label;
    groupCard.appendChild(groupTitle);

    group.items.forEach((item) => {
      const skillItem = document.createElement("div");
      skillItem.className = "skill-item";

      const skillMain = document.createElement("div");
      skillMain.className = "skill-main";

      const skillNumber = document.createElement("span");
      skillNumber.className = "skill-number";
      skillNumber.textContent = `${item.number}.`;
      skillMain.appendChild(skillNumber);

      const skillText = document.createElement("span");
      skillText.className = "skill-text";
      skillText.textContent = item.text;
      skillMain.appendChild(skillText);

      // ===== الأزرار الجانبية (تعليمات - صورة - ملاحظة) =====
      const skillControls = document.createElement("div");
      skillControls.className = "skill-controls";

      const controlButtonsLeft = document.createElement("div");
      controlButtonsLeft.className = "control-buttons-left";

      // زر تعليمات
      const instrBtn = document.createElement("button");
      instrBtn.className = "instructions-btn";
      instrBtn.textContent = showInstructions[item.number] ? "إخفاء التعليمات" : "تعليمات";
      instrBtn.addEventListener("click", () => {
        showInstructions[item.number] = !showInstructions[item.number];
        renderSkills();
      });

      // زر عرض صورة (إذا كانت موجودة وغير مخفية)
      let imageBtn = null;
      if (!hideImageButtonFor.includes(item.number)) {
        imageBtn = document.createElement("button");
        imageBtn.className = "instructions-btn";
        imageBtn.textContent = showImages[item.number] ? "إخفاء الصورة" : "عرض صورة";
        imageBtn.style.marginTop = "5px";
        imageBtn.addEventListener("click", () => {
          showImages[item.number] = !showImages[item.number];
          renderSkills();
        });
      }

      // زر الملاحظة
      const noteBtn = document.createElement("button");
      noteBtn.className = "instructions-btn";
      noteBtn.textContent = "ملاحظة";
      noteBtn.addEventListener("click", () => {
        const currentNote = notes[item.number] || "";
        const userNote = prompt(`أدخل ملاحظة للبند ${item.number}:`, currentNote);
        if (userNote !== null) {
          notes[item.number] = userNote;
        }
      });

      // ترتيب الأزرار: تعليمات -> صورة -> ملاحظة
      controlButtonsLeft.appendChild(instrBtn);
      if (imageBtn) controlButtonsLeft.appendChild(imageBtn);
      controlButtonsLeft.appendChild(noteBtn);

      skillControls.appendChild(controlButtonsLeft);

      // ===== أزرار الإجابة =====
      const answerButtonsDiv = document.createElement("div");
      answerButtonsDiv.className = "answer-buttons";

      ["يوجد", "لايوجد", "غير محدد"].forEach((option) => {
        const btn = document.createElement("button");
        btn.type = "button";
        btn.className = "answer-button";
        if (responses[item.number] === option) {
          btn.classList.add("selected");
        }
        btn.textContent = option;
        btn.addEventListener("click", () => {
          responses[item.number] = option;
          renderSkills();
        });
        answerButtonsDiv.appendChild(btn);
      });

      skillControls.appendChild(answerButtonsDiv);

      // تجميع المكونات
      skillItem.appendChild(skillMain);
      skillItem.appendChild(skillControls);

      // عرض الصورة أسفل البند إن كانت مفعّلة
      if (showImages[item.number]) {
        const img = document.createElement("img");
        img.src = `images/skill${item.number}.png`;
        img.alt = `صورة مهارة رقم ${item.number}`;
        img.className = "skill-image";
        skillItem.appendChild(img);
      }

      groupCard.appendChild(skillItem);
    });

    skillsContainer.appendChild(groupCard);
  });
}

// كود تصدير التقرير (نفسه كما عندك)
document.getElementById("export-btn").addEventListener("click", () => {
  const childName = document.getElementById("childName").value.trim();
  const parentName = document.getElementById("parentName").value.trim();
  const dob = document.getElementById("dob").value;
  const surveyDate = document.getElementById("surveyDate").value;

  if (!childName || !parentName || !dob || !surveyDate) {
    alert("يرجى ملء جميع المعلومات الأساسية قبل التصدير.");
    return;
  }

  const groupedAnswers = {
    يوجد: [],
    لايوجد: [],
    "غير محدد": [],
  };

  skillGroups.forEach((group) => {
    group.items.forEach((item) => {
      const answer = responses[item.number];
      if (answer) {
        groupedAnswers[answer].push(`${item.number}. ${item.text}`);
      }
    });
  });

  let reportText = `===============================\n`;
  reportText += `تقرير نتائج استبيان مهارات الفهم السمعي\n`;
  reportText += `===============================\n\n`;
  reportText += `اسم الطفل: ${childName}\n`;
  reportText += `اسم ولي الأمر: ${parentName}\n`;
  reportText += `تاريخ الميلاد: ${dob}\n`;
  reportText += `تاريخ تعبئة الاستبيان: ${surveyDate}\n\n`;

  Object.entries(groupedAnswers).forEach(([key, items]) => {
    if (items.length > 0) {
      reportText += `${key}:\n`;
      items.forEach((text) => {
        reportText += `${text}\n`;
      });
      reportText += `\n`;
    }
  });

  const reportSection = document.getElementById("report-section");
  const reportOutput = document.getElementById("report-output");
  reportOutput.textContent = reportText;
  reportSection.style.display = "block";

  const blob = new Blob([reportText], { type: "text/plain;charset=utf-8" });
  const link = document.createElement("a");
  link.href = URL.createObjectURL(blob);
  link.download = `تقرير_مهارات_الفهم_${childName || "child"}.txt`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
});

renderSkills();