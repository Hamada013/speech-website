/* Deterministic, provisional curriculum mapping from the three user-supplied interpretation texts.
   Source prose supplies recommendations, never app instructions or individual findings. */
(function(root){
  'use strict';
  const M=root.VBModel;
  const pair=(en,ar)=>({en,ar});
  const source={id:'level1-text-1',revision:'2026-10-29-v2',title:pair('Interpreting the Level 1 Assessment: Curriculum Placement and Writing IEP Goals','تفسير تقييم المستوى الأول: تحديد المنهج وكتابة أهداف الخطة التربوية الفردية'),level:1,received:3,expected:3};
  const rules={
    Mand:[
      pair('Identify preferred activities and a usable communication response; establish early requests with planned prompting and fading.','حدّد الأنشطة المفضلة واستجابة تواصل مناسبة، وابدأ بالطلبات المبكرة مع تخطيط التلقين وتلاشيه.'),
      pair('Fade prompts and expand the range of different requests.','خفّف التلقين ووسّع عدد الطلبات المختلفة.'),
      pair('Generalize requests across people, places and materials; increase daily spontaneous requests without removing the desired item too quickly.','عمّم الطلبات عبر الأشخاص والأماكن والمواد، وزد الطلبات التلقائية اليومية دون إخفاء الشيء المرغوب بسرعة.')
    ],
    Tact:[
      pair('Begin naming familiar, motivating items; review requesting first when both repertoires are absent.','ابدأ بتسمية أشياء مألوفة ومحببة، وراجع أولوية الطلب عندما تكون المهارتان غائبتين.'),
      pair('Expand names for familiar, preferred real objects.','وسّع تسمية الأشياء الحقيقية المألوفة والمفضلة.'),
      pair('Expand naming across people, settings, exemplars, objects and pictures.','وسّع التسمية عبر الأشخاص والبيئات والأمثلة والأشياء والصور.'),
      pair('Expand the naming repertoire and occasionally fade the verbal question to promote spontaneous naming.','وسّع حصيلة التسمية وخفّف السؤال اللفظي أحياناً لدعم التسمية التلقائية.'),
      pair('Strengthen appropriate spontaneous naming in everyday activities.','عزّز التسمية التلقائية المناسبة ضمن الأنشطة اليومية.'),
      pair('Expand naming, generalization and fluency; introduce actions and compare progress with listener skills.','وسّع التسمية والتعميم والطلاقة، وابدأ بالأفعال وقارن التقدم بمهارات المستمع.')
    ],
    Listener:[
      pair('Build meaningful attending to speech through preferred activities and differentiated responses.','نمِّ الانتباه الوظيفي للكلام ضمن أنشطة مفضلة واستجابات متمايزة.'),
      pair('Develop responses to the child’s name and familiar people or favorite items.','نمِّ الاستجابة لاسم الطفل والأشخاص المألوفين والأشياء المفضلة.'),
      pair('Expand listener discriminations, initially using a small array of two motivating items.','وسّع التمييز الاستقبالي، وابدأ بمصفوفة صغيرة من شيئين محببين.'),
      pair('Expand identified items, people and settings; introduce actions on request and larger arrays.','وسّع العناصر المميزة والأشخاص والبيئات، وأدخل الأفعال عند الطلب والمصفوفات الأكبر.'),
      pair('Expand listener items, pictures and actions; generalize within natural social activities.','وسّع العناصر والصور والأفعال الاستقبالية، وعمّم ضمن أنشطة اجتماعية طبيعية.'),
      pair('Continue expanding listener skills, including body parts and natural social contexts.','واصل توسيع مهارات المستمع، بما فيها أعضاء الجسم والسياقات الاجتماعية الطبيعية.')
    ],
    'VP/MTS':[
      pair('Review visual access and build tracking with preferred moving objects.','راجع إمكانية الوصول البصري، ونمِّ التتبع باستخدام أشياء متحركة محببة.'),
      pair('Develop reaching, grasping and eye–hand coordination during play.','نمِّ الوصول والإمساك والتآزر البصري الحركي أثناء اللعب.'),
      pair('Provide varied manipulatives to develop fine motor coordination and early play.','وفّر مواد متنوعة للمناولة لتنمية التآزر الحركي الدقيق واللعب المبكر.'),
      pair('Develop object manipulation that produces a meaningful effect.','نمِّ مناولة الأشياء لإحداث أثر وظيفي.'),
      pair('Expand visual-motor and cause-and-effect play; begin systematic identical matching with varied materials.','وسّع اللعب البصري الحركي والسبب والنتيجة، وابدأ المطابقة المتطابقة المنظمة بمواد متنوعة.'),
      pair('Increase matching opportunities and array size, then introduce non-identical exemplars and everyday sorting.','زد فرص المطابقة وحجم المصفوفة، ثم أدخل أمثلة غير متطابقة والفرز اليومي.')
    ],
    Play:[
      pair('Build interest in objects and actions through enjoyable shared experiences and gradual approximations to play.','نمِّ الاهتمام بالأشياء والأفعال عبر خبرات مشتركة ممتعة وخطوات تدريجية نحو اللعب.'),
      pair('Increase enjoyable object exploration and introduce varied movement activities.','زد الاستكشاف الممتع للأشياء وأدخل أنشطة حركية متنوعة.'),
      pair('Increase independent play opportunities with varied objects and cause-and-effect toys.','زد فرص اللعب المستقل بأشياء متنوعة وألعاب السبب والنتيجة.'),
      pair('Offer novel toys and settings to expand play, fine motor skills and problem solving.','قدّم ألعاباً وبيئات جديدة لتوسيع اللعب والمهارات الدقيقة وحل المشكلات.'),
      pair('Expand enjoyable movement, social play opportunities and varied cause-and-effect events.','وسّع الحركة الممتعة وفرص اللعب الاجتماعي وأنشطة السبب والنتيجة المتنوعة.'),
      pair('Increase complexity and duration with toys that have multiple parts and can be assembled.','زد تعقيد اللعب ومدته بألعاب متعددة الأجزاء قابلة للتركيب.')
    ],
    Social:[
      pair('Review what makes interaction comfortable or aversive; build enjoyable social contact through preferred shared activities.','راجع ما يجعل التفاعل مريحاً أو منفّراً، وابنِ تواصلاً اجتماعياً ممتعاً عبر أنشطة مشتركة مفضلة.'),
      pair('Increase enjoyable interaction with familiar people and reduce aversive features of the interaction.','زد التفاعل الممتع مع الأشخاص المألوفين وخفّف الجوانب المنفّرة في التفاعل.'),
      pair('Develop requests for enjoyable social interaction, attention to peers and comfortable play near peers.','نمِّ طلب التفاعل الاجتماعي الممتع والانتباه للأقران واللعب المريح بقربهم.'),
      pair('Build enjoyable peer proximity and parallel play before expecting verbal interaction.','نمِّ القرب الممتع من الأقران واللعب المتوازي قبل توقع التفاعل اللفظي.'),
      pair('Develop peer imitation, following and simple exchanges during shared play; fade adult prompts.','نمِّ تقليد الأقران ومتابعتهم والتبادلات البسيطة أثناء اللعب المشترك، وخفّف تلقين الراشد.'),
      pair('Support child-initiated peer interaction, starting with nonverbal play and progressing to requests to peers.','ادعم مبادرة الطفل للتفاعل مع الأقران بدءاً من اللعب غير اللفظي وصولاً إلى الطلب منهم.')
    ],
    Imitation:[
      pair('Develop early motor imitation through enjoyable modeled actions with planned support and fading.','نمِّ التقليد الحركي المبكر عبر نماذج لأفعال ممتعة مع تخطيط الدعم وتلاشيه.'),
      pair('Expand enjoyable motor imitation and compare its development with the other skill areas.','وسّع التقليد الحركي الممتع وقارن تطوره ببقية مجالات المهارات.'),
      pair('Expand imitation with and without objects; generalize across people and settings.','وسّع التقليد باستخدام الأشياء ودونها، وعمّم عبر الأشخاص والبيئات.'),
      pair('Introduce finer movements, novel actions and spontaneous peer imitation.','أدخل حركات أدق وأفعالاً جديدة وتقليد الأقران التلقائي.'),
      pair('Use spontaneous imitation in functional daily activities and as a strength for teaching other skills.','استخدم التقليد التلقائي في الأنشطة اليومية الوظيفية وبوصفه نقطة قوة لتعليم مهارات أخرى.'),
      pair('Develop functional two-component actions and two-step chains in play, self-help and peer activities.','نمِّ أفعالاً وظيفية من مكوّنين وسلاسل من خطوتين في اللعب والعناية الذاتية وأنشطة الأقران.')
    ],
    Echoic:[
      pair('Develop early sound imitation through enjoyable sound play, requesting opportunities and individualized communication support.','نمِّ تقليد الأصوات المبكر عبر اللعب الصوتي الممتع وفرص الطلب ودعم التواصل الفردي.'),
      pair('Strengthen available sound imitations and explore their transfer to functional requests.','عزّز تقليد الأصوات المتاح واستكشف نقله إلى طلبات وظيفية.'),
      pair('Increase varied sound imitations and daily opportunities, linking available responses to meaningful requests.','زد تنوع تقليد الأصوات وفرصه اليومية واربط الاستجابات المتاحة بطلبات ذات معنى.'),
      pair('Compare echoic skills with requesting and naming; use relative echoic strengths to teach functional language.','قارن التقليد الصوتي بالطلب والتسمية، واستخدم قوته النسبية لتعليم لغة وظيفية.'),
      pair('Expand sound imitation and functional language transfer; use an individualized speech evaluation to guide articulation targets.','وسّع التقليد الصوتي ونقله إلى اللغة الوظيفية، واستعن بتقييم نطق فردي لتوجيه أهداف مخارج الأصوات.'),
      pair('Continue echoic development while balancing requesting and naming; do not infer functional language from repetition alone.','واصل تنمية التقليد الصوتي مع موازنة الطلب والتسمية، ولا تستنتج وجود لغة وظيفية من الترديد وحده.')
    ],
    Vocal:[
      pair('Increase enjoyable spontaneous sound production through varied play and communication opportunities.','زد إنتاج الأصوات التلقائي الممتع عبر فرص متنوعة للعب والتواصل.'),
      pair('Increase sound variety and variation in intonation, pitch and volume during enjoyable vocal play.','زد تنوع الأصوات والتنغيم وطبقة الصوت وشدته أثناء اللعب الصوتي الممتع.'),
      pair('Encourage novel sounds, blends and varied intonation while maintaining spontaneous production.','شجّع أصواتاً ومزائج جديدة وتنغيماً متنوعاً مع الحفاظ على الإنتاج التلقائي.'),
      pair('Encourage blended sounds and whole-word approximations in meaningful contexts.','شجّع مزج الأصوات وتقريبات الكلمات الكاملة في سياقات ذات معنى.'),
      pair('Connect spontaneous word approximations with sound imitation, requesting and naming rather than automatically adding a separate vocal-output program.','اربط تقريبات الكلمات التلقائية بالتقليد الصوتي والطلب والتسمية بدلاً من إضافة برنامج مستقل للإنتاج الصوتي آلياً.'),
      pair('Support transfer of varied words and phrases into functional requests and naming.','ادعم نقل الكلمات والعبارات المتنوعة إلى الطلب والتسمية الوظيفيين.')
    ]

  };
  function annual(category,stage){
    if(category==='Mand')return pair('Use 10 different requests without echoic prompts, with or without the desired item present.','يستخدم 10 طلبات مختلفة دون تلقين صوتي، مع وجود الشيء المرغوب أو غيابه.');
    if(category==='Tact'){const n=stage<2?10:stage<3?20:50;return pair(`Name at least ${n} objects, people or pictures.`,`يسمّي ${n} على الأقل من الأشياء أو الأشخاص أو الصور.`);}
    if(category==='Listener')return stage<2?pair('Identify at least 10 familiar people, pets or preferred objects when named.','يميّز 10 على الأقل من الأشخاص المألوفين أو الحيوانات الأليفة أو الأشياء المفضلة عند تسميتها.'):pair('Select, point to or look differentially at at least 25 named objects, pictures, people or body parts.','يختار أو يشير أو ينظر بصورة مميزة إلى 25 على الأقل من الأشياء أو الصور أو الأشخاص أو أعضاء الجسم عند تسميتها.');
    if(category==='VP/MTS')return stage<4?pair('Complete at least 10 different visual-motor activities using containers, blocks or rings.','ينفّذ 10 أنشطة بصرية حركية مختلفة على الأقل باستخدام الأوعية أو المكعبات أو الحلقات.'):pair('Match at least 10 identical objects or pictures in an array of at least 3 items.','يطابق 10 أشياء أو صور متطابقة على الأقل ضمن مصفوفة من 3 عناصر على الأقل.');
    if(category==='Social')return pair('Spontaneously follow or imitate a peer’s motor behavior at least 10 times per day.','يتابع أو يقلّد تلقائياً السلوك الحركي لقرين 10 مرات يومياً على الأقل.');
    if(category==='Imitation')return stage<2?pair('Imitate at least 8 motor movements and 6 actions involving objects on request.','يقلّد 8 حركات على الأقل و6 أفعال باستخدام الأشياء عند الطلب.'):pair('Imitate at least 25 motor movements of varied types on request.','يقلّد 25 حركة على الأقل من أنواع مختلفة عند الطلب.');
    if(category==='Echoic'){const n=stage<2?5:stage<3?10:25;return stage<3?pair(`Echo at least ${n} vowels, diphthongs or consonants on request.`,`يقلّد صوتياً ${n} على الأقل من أصوات الحركات أو الحركات المركبة أو الصوامت عند الطلب.`):pair('Echo at least 25 vowel–consonant combinations on request.','يقلّد صوتياً 25 تركيباً من الحركات والصوامت على الأقل عند الطلب.');}
    if(category==='Vocal')return stage<3?pair('Spontaneously produce at least 10 different sounds, averaging at least 30 total sounds per hour.','يصدر تلقائياً 10 أصوات مختلفة على الأقل بمتوسط 30 صوتاً إجمالاً في الساعة على الأقل.'):pair('Spontaneously produce word approximations including multisyllabic utterances on at least 10 occasions per day.','يصدر تلقائياً تقريبات كلمات تتضمن مقاطع متعددة في 10 مناسبات يومياً على الأقل.');
    return stage<3?pair('Spontaneously engage in cause-and-effect play for at least 2 minutes.','ينخرط تلقائياً في لعب السبب والنتيجة لمدة دقيقتين على الأقل.'):pair('Spontaneously engage in object play with toys, puzzles or a sand tray for at least 5 minutes.','ينخرط تلقائياً في اللعب بالأشياء أو الألعاب أو الألغاز أو صينية الرمل لمدة 5 دقائق على الأقل.');
  }
  const curriculum=root.VBIEPCurriculum;
  if(!curriculum)throw Error('IEP curriculum data must load before the mapping engine.');
  const sources=[source,...curriculum.sources];
  const registry={id:'vb-mapp-iep-sources',revision:'2026-10-29-v3',received:3,expected:3,title:pair('VB-MAPP interpretation and IEP sources · Levels 1–3','مصادر تفسير VB-MAPP والخطة التربوية الفردية · المستويات 1–3')};
  const formats={
    1:pair('Combine structured teaching with enjoyable daily play and communication opportunities.','ادمج التعليم المنظم مع فرص ممتعة للعب والتواصل اليومي.'),
    2:pair('Combine structured teaching with increased natural practice, peer interaction and generalization.','ادمج التعليم المنظم مع زيادة الممارسة الطبيعية والتفاعل مع الأقران والتعميم.'),
    3:pair('Use natural, peer and group opportunities alongside individual teaching where needed; measure actual learning and functional use.','استخدم فرصاً طبيعية ومع الأقران والمجموعات إلى جانب التعليم الفردي عند الحاجة، وقِس التعلم الفعلي والاستخدام الوظيفي.')
  };
  function build(s,D,{level=0}={}){
    const all=M.allMilestones(D),profiles=D.categories.map(category=>{
      const domainItems=all.filter(i=>i.category===category).sort((a,b)=>a.milestone-b.milestone);
      const items=level?domainItems.filter(i=>i.level===level):domainItems;
      if(!items.length)return null;
      const value=item=>M.hasScore(s,'milestones',item)?s.scores.milestones[item.id]:null;
      const evidence=items.map(item=>({id:item.id,number:item.milestone,level:item.level,value:value(item)}));
      const next=items.find(i=>value(i)!==1),item=next,activeLevel=item?.level||items.at(-1).level;
      const currentSource=sources.find(src=>src.level===activeLevel);
      const stage=next?next.milestone-1-(activeLevel-1)*5:5;
      const previous=next?domainItems.filter(i=>i.milestone<next.milestone):[];
      const blockers=previous.filter(i=>value(i)!==1).map(i=>({id:i.id,value:value(i),level:i.level}));
      const section=curriculum.sections[activeLevel]?.[category];
      const guidance=activeLevel===1?rules[category]?.[stage]:section?.focus[stage];
      const annualGoal=activeLevel===1?annual(category,stage):section?.annual[section.choices[stage]];
      const status=!next?'complete':blockers.length?'prerequisites':value(next)===null?'assess':guidance&&annualGoal?'draft':'source-pending';
      const skills=(D.tasks||[]).filter(i=>i.milestoneId===item?.id&&M.hasScore(s,'tasks',i));
      const notes=[];
      if(['LRFFC','Intraverbal','Linguistics'].includes(category))notes.push(pair('Check the relevant noun, verb and listener relations directly; a high vocabulary total alone does not establish these prerequisites.','تحقق مباشرة من علاقات الأسماء والأفعال والاستجابة الاستقبالية المعنية؛ لا يثبت مجموع المفردات المرتفع وحده تحقق هذه المهارات السابقة.'));
      if(activeLevel===3&&['Reading','Writing','Linguistics'].includes(category))notes.push(pair('Adapt targets to the child’s assessed language and writing system. English letter and inflection examples are not Arabic norms.','كيّف الأهداف مع لغة الطفل ونظام الكتابة المقيم. أمثلة الحروف والتصريف الإنجليزية ليست معايير عربية.'));
      return {category,level:activeLevel,stage,evidence,item,status,blockers,notes,source:currentSource,ruleId:activeLevel===1?`${currentSource.id}:${category}:${stage}`:`${currentSource.id}:${category}:target-${item?.milestone||'complete'}`,guidance:guidance||null,annual:annualGoal||null,skills:skills.map(i=>({id:i.id,code:i.code,value:s.scores.tasks[i.id]}))};
    }).filter(Boolean);
    const domainStats=(category,lv)=>M.stats(s,all.filter(i=>i.category===category&&i.level===lv),'milestones');
    const zero=category=>{const st=domainStats(category,1);return st.assessed===st.total&&st.total>0&&st.zero===st.total;};
    const mandAbsent=zero('Mand');
    profiles.forEach(p=>{p.sequenceReview=p.category==='Tact'&&p.level===1&&mandAbsent&&zero('Tact');});
    const domains=[1,2,3].flatMap(lv=>D.categories.map(category=>({category,level:lv,...domainStats(category,lv)})).filter(d=>d.total));
    const patterns=[];
    if(mandAbsent&&domainStats('Echoic',1).score>0)patterns.push(pair('Recorded echoic responses may support early requesting through transfer of stimulus control; verify the transfer directly.','قد تدعم استجابات التقليد الصوتي المسجلة الطلب المبكر عبر نقل التحكم بالمثير؛ تحقّق من النقل بالملاحظة المباشرة.'));
    for(const lv of [1,2,3]){
      const tact=domainStats('Tact',lv),listener=domainStats('Listener',lv),mand=domainStats('Mand',lv);
      const known=st=>st.total>0&&st.assessed===st.total;
      if(known(tact)&&known(listener)&&tact.score!==listener.score)patterns.push(tact.score<listener.score?pair(`Level ${lv}: listener scores exceed naming scores; review naming as a relative priority.`,`المستوى ${lv}: درجات المستمع أعلى من التسمية؛ راجع التسمية كأولوية نسبية.`):pair(`Level ${lv}: naming scores exceed listener scores; review listener discrimination and recorded barriers.`,`المستوى ${lv}: درجات التسمية أعلى من المستمع؛ راجع التمييز الاستقبالي والعوائق المسجلة.`));
      if(known(mand)&&known(tact)&&mand.score<tact.score)patterns.push(pair(`Level ${lv}: naming exceeds requesting; check functional requests in real motivating situations.`,`المستوى ${lv}: التسمية أعلى من الطلب؛ تحقق من الطلب الوظيفي في مواقف دافعية فعلية.`));
      const lrffc=domainStats('LRFFC',lv),iv=domainStats('Intraverbal',lv);
      if(known(lrffc)&&known(iv)&&lrffc.score>iv.score)patterns.push(pair(`Level ${lv}: use established LRFFC relations to explore intraverbal transfer; selecting a picture does not establish an unprompted verbal answer.`,`المستوى ${lv}: استخدم علاقات الوظيفة والصفة والفئة الراسخة لاستكشاف النقل إلى الحوار؛ لا يثبت اختيار الصورة وجود إجابة لفظية دون تلقين.`));
    }
    const barriers=(D.barriers||[]).filter(i=>M.hasScore(s,'barriers',i)&&s.scores.barriers[i.id]>0).map(i=>({item:i,value:s.scores.barriers[i.id]}));
    const transitions=(D.transitions||[]).filter(i=>M.hasScore(s,'transitions',i)).map(i=>({item:i,value:s.scores.transitions[i.id]}));
    return {source:registry,sources,profiles,domains,patterns,barriers,transitions,formats,selectedLevel:level,levels:[1,2,3].map(lv=>({level:lv,...M.stats(s,all.filter(i=>i.level===lv),'milestones')})),coverage:{milestones:M.stats(s,all,'milestones'),barriers:M.stats(s,D.barriers||[],'barriers'),transitions:M.stats(s,D.transitions||[],'transitions')},mandAbsent};
  }
  function draft(s,D,id,lang){
    const item=M.allMilestones(D).find(i=>i.id===id);
    if(!item)return null;
    const p=build(s,D,{level:item.level}).profiles.find(p=>p.item?.id===id&&p.status==='draft');
    if(!p||s.goals[id])return null;
    const ar=lang==='ar',year=ar?'خلال 12 شهراً، ':'Within 12 months, ';
    return {selected:false,goal:year+M.itemText(p.item,s,lang),criterion:(ar?'الهدف المرحلي: ':'Short-term objective: ')+M.itemText(p.item,s,lang)+'\n'+(ar?'معيار البند: ':'Item criterion: ')+M.itemScoring(p.item,s,lang)+'\n'+(ar?'يحدد الفريق معيار إتقان الهدف السنوي وفرص القياس والتعميم بعد مراجعة خط الأساس.':'The team specifies annual mastery, measurement opportunities and generalization after reviewing baseline.'),support:p.guidance[lang]+'\n'+(ar?'مثال سنوي من المصدر للتكييف: ':'Source annual example to adapt: ')+p.annual[lang]+'\n'+formats[p.level][lang]+'\n'+p.notes.map(n=>n[lang]).join('\n')+'\n'+(ar?'خط الأساس: ':'Baseline: ')+id+' = '+s.scores.milestones[id]+' · '+s.date+'\n'+(ar?'المصدر: ':'Source: ')+p.ruleId+' @ '+p.source.revision,review:'',criteriaReview:''};
  }
  root.VBIEP={source:registry,sources,rules,curriculum,build,draft};
})(typeof window!=='undefined'?window:globalThis);
