// قائمة المهارات الـ65 موزعة حسب المجموعات العمرية
const skillGroups = [
  {
    label: "العمر 0:0-0:2",
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
        text: "يُغيّر نغمة أو مدة أو شدة البكاء",
        instruction: "هل يبكي طفلك أحيانًا بقوة وأحيانًا برقة؟\nالتقييم : يُصدر أصواتًا أو يبكي مع تنوّع في النغمة أو المدة أو الشدة"
      },
    ]
  },
  {
    label: "العمر 0:3-0:5",
    items: [
      {
        number: 4,
        text: "يستجيب للمتحدث بالابتسام",
        instruction: "هل يبتسم طفلك للأشخاص عندما يتحدثون إليه؟\nالتقييم : يبتسم استجابةً لاقتراب المتحدث منه أو حمله أو التحدث إليه"
      },
      {
        number: 5,
        text: "يُصدر أصواتًا تُعبّر عن المتعة والانزعاج",
        instruction: "هل يصدر طفلك أصواتًا عندما يكون سعيدًا \nومرتاحًا تختلف عن الأصوات التي يصدرها عندما يكون متعبًا أو منزعجًا أو غير سعيد؟\nالتقييم : يُصدر صوتين صحيحين (واحد للتعبير عن المتعة وآخر للتعبير عن الانزعاج)"
      },
      {
        number: 6,
        text: "يُصدر أصواتًا عند التحدث إليه، مع تحريك الذراعين والساقين أثناء إصدار الأصوات",
        instruction: "هل يصدر طفلك أصواتًا ويحرك ذراعيه ورجليه عندما يتحدث إليه أحدهم؟\nالتقييم :  تُرافق الأصوات حركات لا إرادية مثل خفق الذراعين أو تحريك الساقين"
      },
    ]
  },
  {
    label: "العمر 0:6-0:8",
    items: [
      {
        number: 7,
        text: "يضع الأشياء في فمه",
        instruction: "يُعبّر عن الرفض بالإشارة أو الصوت\nأمثلة على سلوكيات الاعتراض\nالتمدد نحو الشيء، دفع الشخص بعيدًا، هز الرأس بمعنى لا\nتحريك الرأس أو الجسم بعيدًا عن الوصي، الإمساك باللعبة بإحكام،البكاء\nالتقييم : يظهر الطفل سلوك اعتراض واحد على الأقل أو يصدر صوت اعتراض"
      },
      {
        number: 8,
        text: "يُحاول تقليد تعبيرات الوجه والحركات",
        instruction: "هل يحرك طفلك شفتيه أو لسانه عندما تصنع وجوهًا مضحكة أو تحرك شفتيك ولسانك؟\nالتقييم: يُحاول تحريك وجهه أو لسانه استجابةً لتعبيرات وحركات وجه المُعتني."
      },
      {
        number: 9,
        text: "يُصدر صوتين مختلفين من أصوات الصوامت",
        instruction: "هل يصدر طفلك أصواتًا مختلفة مثل /ب/ و /م/؟\nالتقييم: يُنتج صوتين مختلفين واضحين من أصوات الصامتة."
      },
      {
        number: 10,
        text: "يُصدر صوتين مختلفين من أصوات الصوائت",
        instruction: "هل يصدر طفلك أصواتًا مختلفة مثل /ا/ و /و/؟\nالتقييم: يُنتج صوتين مختلفين واضحين من أصوات الصوائت."
      },  
    ]
  },
  {
    label: "0:11-0:9 العمر",
    items: [
      {
        number: 11,
        text: "يدمج بين الأصوات",
        instruction: "هل يصدر طفلك صوتين معًا، مثل \"با\" أو \"با\"؟\nالتقييم: يُصدر تركيبة صوتية أو مقطعًا لفظيًا (V-V, C-V, or V-C)\nأمثلة على استجابات صحيحة:\n- متحرك-متحرك (V-V): آه-إي، أو-أوه\n- حرف ساكن-حرف متحرك (C-V): با، ما، دا، دو، تي\n- حرف متحرك-حرف ساكن (V-C): آخ، أب، أم\nأمثلة على استجابات غير صحيحة:\n- تكرار الحروف الساكنة فقط: ب-ب-ب-ب (مثل إصدار صوت فرقعة الشفاه)\n- إطالة الصوت المتحرك: آآآآآه\n- إطالة الصوت الساكن: م-م-م-م"
      },
      {
        number: 12,
        text: "يسعى لجذب انتباه الآخرين",
        instruction: "هل يحاول طفلك لفت انتباهك؟\nالتقييم: الطفل يبذل جهدًا لجذب أو الحفاظ على الانتباه."
      },
      {
        number: 13,
        text: "يلعب ألعابًا بسيطة مع شخص آخر مع استخدام التواصل البصري المناسب",
        instruction: "شارك الطفل في نشاط لعب تفاعلي مثل وضع الأشياء داخل الصندوق وخارجه\nالتقييم: يشارك في اللعب مع شخص آخر مع الحفاظ على التواصل البصري المناسب\nأمثلة على استجابات صحيحة:\n- الطفل يلعب (peek-a-boo) مع استخدام التواصل البصري المناسب."
      }
    ]
  },
  {
    label: "1:5-1:0 العمر",
    items: [
      {
        number: 14,
        text: "يستخدم إيماءة تمثيلية (رمزية)",
        instruction: "هل يلوح طفلك بيده ليقول وداعًا (باي-باي)؟\nهل يصفق طفلك بيديه ليُظهر أنه سعيد أو فخور بشيء فعله، مثل رمي الكرة؟\nالتقييم: يستخدم إيماءة رمزية واحدة.\n(مثال: يلوّح للوداع، يصفق، يحرك جسده)"
      },
      {
        number: 15,
        text: "يُصدر الطفل مقاطع صوتية مكونة من مقطعين",
        instruction: "العب مع الطفل لاستثارة إنتاج تركيبات مكونة من مقطعين.\nإذا أظهر الطفل اهتمامًا بالفقاعات، انفخ الفقاعات.\nقل تراكيب من مقطعين مع انفجار كل فقاعة.\nالتقييم:\nيُصدر مقطعًا مكونًا من مقطعين (مثل: ماما، بابا)."
      },
      {
        number: 16,
        text: "يتبادل الأدوار الصوتية عدة مرات",
        instruction: "عندما تقلد صوتًا يصدره طفلك، هل يعيد الطفل الصوت الذي قمت به؟\nهل يتبادل معك الأدوار صوتيًا مرتين أو ثلاث مرات؟\n\nالتقييم:\nيأخذ الطفل على الأقل دورتين للتواصل الصوتي ردًا على تقليد الوصي لأصوات الطفل."
      },
      {
        number: 17,
        text: "يُنتج سلاسل صوتية (مقطعين إلى ثلاثة) بإيقاع يشبه كلام الكبار",
        instruction: "المواد: ألعاب وأشياء أبدى الطفل اهتمامًا بها مسبقًا\nالتقييم: يُنتج سلسلة مكونة من مقطعين إلى ثلاثة مقاطع بصوتية وإيقاع مشابه لكلام الكبار\nحرف ساكن - حرف متحرك (C-V) (لا)\nحرف ساكن - حرف متحرك - حرف ساكن (C-V-C) (مين)\nحرف ساكن - حرف متحرك - حرف ساكن - حرف متحرك (C-V-C-V) (بابا)\nأنواع أخرى"
      },
      {
        number: 18,
        text: "يُصدر خمس آصوات مختلفين من الاصوات الصامتة (?  b d m n )",
        instruction: "التقييم: يصدر الطفل خمس أصوات ساكنة مختلفة"
      },
      {
        number: 19,
        text: "يستخدم كلمة واحدة على الأقل",
        instruction: "المواد:\nألعاب وأشياء أبدى الطفل اهتمامًا بها مسبقًا.\n\nالتقييم:\nيُظهر استخدامًا ذا معنى لكلمة واحدة.\nلكي تُعتبر الكلمة ذات معنى، يجب أن تُستخدم تركيبة الصوت ككلمة بشكل متكرر.\nويجب أن تكون في سياق تواصلي مناسب.\nلا يشترط أن يكون النطق دقيقًا أو مطابقًا للكلمة."
      }
    ]
  },
  {
    label: "العمر 1:6-1:11",
    items: [
      {
        number: 20,
        text: "يستخدم الإيماءات والصوتيات لطلب الأشياء",
        instruction: "ضع اثنين أو ثلاثة أشياء بالقرب من الطفل ولكن بعيدًا عن متناوله.\nقل: \"انظر إلى هذه الأشياء\".\nراقب الطفل لترى إذا كان يشير إلى الشيء أو يحاول الوصول إليه ويصدر صوتًا لطلبه.\n\nالتقييم:\nيُظهر حالة يستخدم فيها الإيماءة والصوت لطلب شيء.\n\nأمثلة على الإجابات غير الصحيحة:\n- الطفل يشير أو يستخدم إيماءة بدون أصوات.\n- الطفل يصدر أصواتًا (مثل البكاء) بدون أن يشير أو يستخدم إيماءة لما يريد.\n- الطفل يصل إلى الشيء ويصدر صوتًا."
      },
      {
        number: 21,
        text: "يُشارك في نشاط لعب روتيني مع شخص آخر لمدة دقيقة واحدة على الأقل، مع الحفاظ على تواصل بصري مناسب",
        instruction: "المواد:\nساعة توقيت أو ساعة عقارب.\n\nالتقييم:\nيُشارك بانتباه ويحافظ على تواصل بصري لمدة دقيقة واحدة."
      },
      {
        number: 22,
        text: "يمد اللعبة أو يشير إلى شيء ليُظهره للآخرين",
        instruction: "هل يشير طفلك إلى الألعاب أو الأشياء الأخرى ليُظهرها لك؟\n\nضع الأشياء في متناول الطفل.\nاطلب من الوصي أن يُظهر للطفل أحد الأشياء.\nراقب إذا كان الطفل يشير إلى شيء آخر أو يُعطي شيئًا للوصي كما لو كان يُريه إياه.\n\nالتقييم:\nيجذب الطفل الانتباه إلى شيء ما عن طريق الإشارة أو العرض."
      },
      {
        number: 23,
        text: "يستخدم خمس كلمات على الأقل",
        instruction: "أثناء اللعب مع الطفل، أشر إلى الأشياء واسأله: \"ما هذا؟\"\n\nالكلمات التي نطقها الطفل:\n\nالتقييم:\nيُنتج خمس كلمات أو أكثر."
      }
    ]
  },
  {
    label: "العمر 2:0-2:5",
    items: [
      {
        number: 24,
        text: "يبدأ بلعبة تبادل الأدوار أو روتين اجتماعي",
        instruction: "اسأل الوصي إذا كان الطفل يلعب لعبة أو لديه روتين لعب باستخدام كرة، بطانية، أو دبدوب في المنزل.\n\nإذا كان الأمر كذلك، اطلب من الوصي اختيار واحدة وبدء اللعب بها.\n\nالتقييم:\nوجود مثال واحد على نشاط يبدأه الطفل معك أو مع الوصي أو شخص آخر."
      },
      {
        number: 25,
        text: "يستخدم الكلمات لأداء وظائف برغماتية متعددة",
        instruction: "ضع وجبة خفيفة مقدمة من الوصي أو لعبة صغيرة داخل كيس بلاستيكي شفاف وأغلقه.\nقدم الكيس للطفل وانتظر لترى ما إذا كان يستخدم الكلمات ليطلب منك فتح الكيس.\n\nاختياريًا، قم بتشغيل لعبة اللف، وعندما تتوقف.\nانتظر لترى ما إذا كان الطفل يستخدم الكلمات ليطلب منك إعادة لف اللعبة.\n\nأمثلة على الوظائف البرغماتية:\n a. يطلب أفعالًا أو أشياء: \"أعطني\"\n b. يذكر أسماء أشياء أو أفعال: \"كرة\"\n c. يطلب التكرار: \"مزيد\"\n d. يطلب المساعدة: \"ساعدني\"\n e. يجيب عن أسئلة بنعم/لا: يهز رأسه بـ\"لا\" أو يومئ بـ\"نعم\"\n f. يستخدم كلمة لجذب الانتباه: \"ماما!\"\n\nالتقييم:\nيستخدم الكلمات للتعبير عن خمس وظائف برغماتية مختلفة."
      }
    ]
  },
  {
  label: "العمر 2:6-2:11",
    items: [
      {
        number: 26,
        text: "يستخدم الكلمات أكثر من الإيماءات للتواصل",
        instruction: "سؤال مراقبة:\nعندما يرغب طفلك في شيء ما، كيف يعبر عن ذلك؟ هل يستخدم الكلمات أكثر من الإشارات مثل الإشارة، محاولة الوصول إلى الشيء، أو سحب الملابس؟\n\nخيارات الإجابة:\na. لا يستخدم لا كلمات ولا إيماءات\nb. يستخدم الإيماءات فقط\nc. يستخدم الإيماءات أكثر من الكلمات في التواصل\nd. يستخدم الإيماءات والكلمات بنفس المعدل\ne. يستخدم الكلمات أكثر من الإيماءات في التواصل\n\nالتقييم:\nيستخدم الكلمات أكثر من الإيماءات في التواصل (اختيار e)"
      },
      {
        number: 27,
        text: "يُسمي أشياء في الصور",
        instruction: "أشر إلى كل صورة وقل: \"انظر إلى هذه الصورة. ما هذا؟\"\n\nأمثلة الصور:\na. كرة\nb. طفل\nc. طائر\nd. حذاء\ne. كلب\nf. بالون\ng. ملعقة\nh. تفاحة\ni. قطة\n\nالتقييم:\nيُسمي خمس صور بشكل صحيح\n\nملاحظة:\nلا تُحاسب الطفل على النطق غير المكتمل أو غير الناضج.\nالكلمة تُعتبر صحيحة إذا أكد الوصي أنها الكلمة المعتادة التي يستخدمها الطفل للإشارة إلى الشيء \n(مثلًا: \"مياو\" للقطة، \"غو غو\" للكلب)."
      }
    ]
  },
  {
  label: "العمر 3:0 - 3:5",
    items: [
      {
        number: 28,
        text: "يستخدم تراكيب لفظية مختلفة",
        instruction: "التراكيب اللفظية التي ينتجها الطفل:\na. اسم/ضمير + فعل (مثل: \"أنا آكل\")\nb. فعل + اسم/ضمير (مثل: \"آكل تفاحة\")\nc. اسم/ضمير + فعل + مكان (مثل: \"ماما بدي باي\")\nd. اسم/ضمير + فعل + صفة (مثل: \"بدي طابة حمرا\")\ne. تراكيب أخرى (مثل: اسم + اسم، ملكية + اسم، مثل: \"هذا لي\")\n\nالتقييم:\nيُنتج الطفل ثلاث تراكيب لفظية مختلفة"
      },
      {
        number: 29,
        text: "يكوّن تراكيب لغوية من ثلاثة أو أربعة كلمات في الكلام التلقائي",
        instruction: "قدّم للطفل عدة ألعاب وأشياء وضعها أمامه وشجّعه على اللعب.\nخلال اللعب، تحدّث مع الطفل ودوّن تراكيبه التلقائية.\n\nأمثلة على إجابات صحيحة:\n• أين هو الجرو؟\n• مامي تذهب\n• أعطني الدب\n• ماذا تفعل؟\n• أين أخي؟\n• لا أحب العصير\n\nالتقييم:\nيُكوّن الطفل تركيبًا لغويًا مكوّنًا من ثلاث أو أربع كلمات"
      },
      {
        number: 30,
        text: "يستخدم صيغة فعل المضارع",
        instruction: "الصفحة: ——\n\nتدريب:\n• بنت تلعب\n• بنت تأكل\n• ولد يأكل\n• بنت تشرب\n\nالتقييم:\nإجابتان صحيحتان"
      }
    ]
  },
  {
    label: "العمر 3:6 - 3:11",
    items: [
      {
        number: 31,
        text: "يستخدم صيغة جمع",
        instruction: "التعليمات:\nالتدريب:\n• تفاحات\n• سيارات\n• طابات\n• بالونات\n• شجرات\n• سمكات\n• طيارات\n\nالتقييم:\nأربع إجابات صحيحة"
      },
      {
        number: 32,
        text: "يستخدم صيغة جمع تكسير",
        instruction: "التدريب:\n• قطط\n• كلاب\n• أصابع\n• موز\n• ألوان\n• عيون\n\nالتقييم:\nأربع إجابات صحيحة"
      },
      {
        number: 33,
        text: "يستخدم أدوات الملكية",
        instruction: "التدريب:\n هي موزة الولد → هي موزتو\n هي موزة البنت → هي موزتها\n• طابتها / طابتو\n• طعامها / طعامو\n• كلبو / كلبها\n• قطتها \\n\nالتقييم:\nثلاث إجابات صحيحة"
      },
      {
        number: 34,
        text: "يصف كيفية استخدام الشيء",
        instruction: "تمرين: انظر إلى هذه الصورة. هذا قلم رصاص. ماذا تفعل بالقلم الرصاص؟ (تكتب به، ترسم به)\n\nاستخدم التنبيه عند الحاجة للتدريب فقط.\n\nالتقييم:\nإجابتان صحيحتان"
      }
    ]
  },
  {
    label: "العمر 4:0 - 4:11",
    items: [
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

const responses = {};
const showInstructions = {};
const showImages = {};
const hideImageButtonFor = [1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,17,18,19,20,21,22,23,24,25,26,28,29];

const container = document.getElementById("skills-container");

function renderSkills() {
  container.innerHTML = "";

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

      const skillMain = document.createElement("div");
      skillMain.className = "skill-main";

      const skillControls = document.createElement("div");
      skillControls.className = "skill-controls";

      // نص المهارة
      const skillHeader = document.createElement("p");
      skillHeader.textContent = `${item.number}. ${item.text}`;
      skillHeader.className = "skill-text";
      skillMain.appendChild(skillHeader);

      // عرض التعليمات
      if (showInstructions[item.number]) {
        const instrText = document.createElement("pre");
        instrText.className = "instructions-text";
        instrText.textContent = item.instruction;
        skillMain.appendChild(instrText);
      }

      // زر تعليمات
      const instrBtn = document.createElement("button");
      instrBtn.className = "instructions-btn";
      instrBtn.textContent = showInstructions[item.number] ? "إخفاء التعليمات" : "تعليمات";
      instrBtn.addEventListener("click", () => {
        showInstructions[item.number] = !showInstructions[item.number];
        renderSkills();
      });

      // أزرار الاختيار (يوجد، لايوجد، غير محدد)
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

       // زر عرض/إخفاء الصورة (إذا لم يكن ضمن المهارات المخفية)
       let imageBtn = null;
       if (!hideImageButtonFor.includes(item.number)) {
         imageBtn = document.createElement("button");
         imageBtn.type = "button";
         imageBtn.className = "instructions-btn";
         imageBtn.style.marginTop = "5px";
         imageBtn.textContent = showImages[item.number] ? "إخفاء الصورة" : "عرض صورة";
         imageBtn.addEventListener("click", () => {
           showImages[item.number] = !showImages[item.number];
           renderSkills();
         });
       }
      // زر الملاحظة
      const noteBtn = document.createElement("button");
      noteBtn.type = "button";
      noteBtn.textContent = "ملاحظة";
      noteBtn.className = "note-button";

          // إنشاء حاوية الأزرار اليسارية
       const controlButtonsLeft = document.createElement("div");
       controlButtonsLeft.className = "control-buttons-left";

       // إضافة الأزرار إلى الحاوية بالترتيب: تعليمات، عرض صورة، ملاحظة
       controlButtonsLeft.appendChild(instrBtn);
       if (imageBtn) controlButtonsLeft.appendChild(imageBtn); // الصورة فوق
       controlButtonsLeft.appendChild(noteBtn);                // الملاحظة تحت


      // مربع النص الخاص بالملاحظة (مخفي افتراضياً)
      const noteInput = document.createElement("textarea");
      noteInput.className = "note-input";
      noteInput.placeholder = "أدخل ملاحظة...";
      noteInput.style.display = "none";

      noteBtn.addEventListener("click", () => {
        noteInput.style.display = noteInput.style.display === "none" ? "block" : "none";
      });

      // تجميع الأزرار في القسم الخاص بها
      skillControls.appendChild(instrBtn);
      skillControls.appendChild(answerButtonsDiv);
      if (imageBtn) skillControls.appendChild(imageBtn);
      skillControls.appendChild(noteBtn);

      skillItem.appendChild(skillMain);
      skillItem.appendChild(skillControls);
      skillItem.appendChild(noteInput);

      // عرض الصورة إن تم تفعيلها
      if (showImages[item.number]) {
        const img = document.createElement("img");
        img.src = `images/skill${item.number}.png`; // تأكد من وجود الصور في هذا المسار
        img.alt = `صورة مهارة رقم ${item.number}`;
        img.className = "skill-image";
        skillItem.appendChild(img);
      }

      groupCard.appendChild(skillItem);
    });

    container.appendChild(groupCard);
  });
}

document.addEventListener("DOMContentLoaded", () => {
  renderSkills();
});

document.getElementById("export-btn").addEventListener("click", () => {
  const childName = document.getElementById("childName").value.trim();
  const parentName = document.getElementById("parentName").value.trim();
  const dob = document.getElementById("dob").value;
  const surveyDate = document.getElementById("surveyDate").value;
  const therapistInput = document.getElementById("therapistName");
  const therapistName = therapistInput ? therapistInput.value.trim() : "";

  const groupedAnswers = {
    يوجد: [],
    لايوجد: [],
    "غير محدد": [],
  };

  skillGroups.forEach(group => {
    group.items.forEach(item => {
      const answer = responses[item.number];
      const skillElements = [...document.querySelectorAll(".skill-item")];
      const skillElement = skillElements.find(el => el.querySelector(".skill-text").textContent.startsWith(item.number + "."));
      const noteInput = skillElement ? skillElement.querySelector(".note-input") : null;
      const noteText = noteInput ? noteInput.value.trim() : "";

      if (answer) {
        if (noteText) {
          groupedAnswers[answer].push(`${item.number}. ${item.text}\nملاحظة: ${noteText}`);
        } else {
          groupedAnswers[answer].push(`${item.number}. ${item.text}`);
        }
      }
    });
  });

  let reportText = `===============================\n`;
  reportText += `مهارات التواصل \n`;
  reportText += `===============================\n\n`;
  reportText += `اسم الطفل: ${childName}\n`;
  reportText += `اسم ولي الأمر: ${parentName}\n`;
  reportText += `تاريخ الميلاد: ${dob}\n`;
  reportText += `تاريخ التقرير: ${surveyDate}\n\n`;
  reportText += `اسم الاختصاصي: ${therapistName}\n\n`;

  Object.entries(groupedAnswers).forEach(([key, items]) => {
    if (items.length > 0) {
      reportText += `${key}:\n`;
      items.forEach(text => {
        reportText += `${text}\n`;
      });
      reportText += `\n`;
    }
  });

  const reportWindow = window.open("", "_blank", "width=700,height=700,scrollbars=yes,resizable=yes");
  if (!reportWindow) {
    alert("يرجى السماح للنوافذ المنبثقة في المتصفح لعرض التقرير.");
    return;
  }

  const escapedReport = reportText.replace(/</g, "&lt;").replace(/>/g, "&gt;");

  reportWindow.document.write(`
    <html lang="ar" dir="rtl">
      <head>
        <title>مهارات التواصل التعبيري - تقرير</title>
        <style>
          body { font-family: "Noto Sans Arabic", sans-serif; margin: 20px; background: #f9f9f9; }
          pre { white-space: pre-wrap; word-wrap: break-word; background: #fff; border: 1px solid #ccc; padding: 15px; font-size: 16px; }
          button { margin-top: 15px; padding: 10px 15px; font-size: 16px; cursor: pointer; }
        </style>
      </head>
      <body>
        <h1>مهارات التعبير التعبيري  - تقرير</h1>
        <pre id="report-text">${escapedReport}</pre>
        <button id="download-btn">تحميل التقرير</button>
        <script>
          document.getElementById("download-btn").addEventListener("click", () => {
            const text = document.getElementById("report-text").textContent;
            const blob = new Blob([text], { type: "text/plain;charset=utf-8" });
            const link = document.createElement("a");
            link.href = URL.createObjectURL(blob);
            link.download = "تقرير_مهارات_التعبير_${childName || "child"}.txt";
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
          });
        <\/script>
      </body>
    </html>
  `);

  reportWindow.document.close();
});
