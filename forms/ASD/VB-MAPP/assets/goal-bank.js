/* Searchable templates; template availability never establishes a child skill. */
(function(root){
  'use strict';
  const M=root.VBModel,I=root.VBIEP;
  let cachedData,cachedEntries;
  const clean=t=>String(t||'').replace(/\s*\((?:T|O|E|TO:[^)]*)\)\s*$/, '').trim();
  function entries(D){
    if(cachedData===D)return cachedEntries;
    cachedData=D;
    const milestones=M.allMilestones(D);
    cachedEntries=[...root.VB_GOAL_EXAMPLES.items,
      ...milestones.map(i=>({id:'milestone-'+i.id,itemId:i.id,level:i.level,category:i.category,kind:'milestone',text:{en:clean(i.text.en),ar:clean(i.text.ar)},sourceId:'milestones'})),
      ...(D.tasks||[]).map(i=>({id:'skill-'+i.id,itemId:i.milestoneId,taskId:i.id,level:i.level,category:i.category,kind:'skill',text:{en:clean(i.text.en),ar:clean(i.text.ar)},sourceId:'task-analysis',sourcePage:i.sourcePage}))];
    return cachedEntries;
  }
  function filter(D,{query='',level=0,category='all',kind='all'}={}){
    const q=query.trim().toLocaleLowerCase();
    return entries(D).filter(e=>(!level||e.level===level)&&(category==='all'||e.category===category)&&(kind==='all'||e.kind===kind)&&(!q||[e.id,e.category,D.arabicLabels[e.category],e.text.en,e.text.ar].join(' ').toLocaleLowerCase().includes(q)));
  }
  function goalText(entry,lang,name=''){
    const value=clean(entry.text[lang]||entry.text.en);
    if(lang==='ar')return 'خلال 12 شهراً، '+value;
    const writtenGoal=/^The child will\s+/i.test(value);
    let phrase=value.replace(/^The child will\s+/i,'').replace(/^The child\s+/i,'').replace(/^Will\s+/,'');
    const verbs={emits:'produce',tacts:'name',selects:'select',demonstrates:'demonstrate',has:'have',responds:'respond',completes:'complete',follows:'follow',imitates:'imitate',matches:'match',engages:'engage',draws:'draw',writes:'write',reads:'read',counts:'count',mands:'request',identifies:'identify',copies:'copy',traces:'trace',sits:'sit',works:'work',acquires:'acquire',places:'place',stacks:'stack',grasps:'grasp',attends:'attend',performs:'perform',uses:'use',repeats:'repeat',searches:'search',generalizes:'generalize',takes:'take',transitions:'transition',answers:'answer',discriminates:'discriminate',spells:'spell',combines:'combine',says:'say',points:'point',touches:'touch',orients:'orient',looks:'look',turns:'turn',manipulates:'manipulate',shows:'show',tracks:'track',initiates:'initiate',vocalizes:'vocalize',provides:'provide',sorts:'sort',echoes:'echo',puts:'put',allows:'allow',accepts:'accept',adjusts:'adjust',approaches:'approach',arranges:'arrange',asks:'ask',assembles:'assemble',assists:'assist',attempts:'attempt',brings:'bring',carries:'carry',chases:'chase',colors:'color',comes:'come',connects:'connect',constructs:'construct',continues:'continue',cooperates:'cooperate',describes:'describe',distinguishes:'distinguish',does:'do',drops:'drop',dumps:'dump',enjoys:'enjoy',enters:'enter',focuses:'focus',gets:'get',gives:'give',glances:'glance',goes:'go',helps:'help',holds:'hold',improvises:'improvise',indicates:'indicate',interrupts:'interrupt',joins:'join',keeps:'keep',kicks:'kick',laughs:'laugh',leads:'lead',learns:'learn',lines:'line',maintains:'maintain',makes:'make',meets:'meet',moves:'move',narrates:'narrate',navigates:'navigate',negotiates:'negotiate',nests:'nest',nods:'nod',observes:'observe',offers:'offer',opens:'open',participates:'participate',plays:'play',pretends:'pretend',pulls:'pull',pushes:'push',raises:'raise',reaches:'reach',reacts:'react',recalls:'recall',recites:'recite',scores:'score',scribbles:'scribble',seeks:'seek',sets:'set',sings:'sing',smiles:'smile',speaks:'speak',splashes:'splash',stays:'stay',strings:'string',suggests:'suggest',summarizes:'summarize',transfers:'transfer',waits:'wait'};
    if(!writtenGoal){
      const match=phrase.match(/^((?:(?:spontaneously|independently|visually|correctly|appropriately|consistently|politely|legibly|repeatedly|successfully|intraverbally|verbally|rote)\s+)*)([a-z]+)(.*)$/i);
      if(!match||!verbs[match[2].toLowerCase()])return `Within 12 months: ${value}`;
      phrase=match[1].toLowerCase()+verbs[match[2].toLowerCase()]+match[3];
    }
    phrase=phrase.charAt(0).toLowerCase()+phrase.slice(1);
    return `Within 12 months, ${name.trim()||'the child'} will ${phrase}`;
  }
  function itemFor(s,D,entry){
    const all=M.allMilestones(D);
    if(entry.itemId)return all.find(i=>i.id===entry.itemId);
    const group=all.filter(i=>i.category===entry.category&&i.level===entry.level).sort((a,b)=>a.milestone-b.milestone);
    return group.find(i=>!M.hasScore(s,'milestones',i)||s.scores.milestones[i.id]<1)||group.at(-1);
  }
  function fromEntry(s,D,entry,lang=s.lang){
    const item=itemFor(s,D,entry);if(!item)return null;
    return {selected:true,goal:goalText(entry,lang,s.child.name),criterion:entry.text[lang]||entry.text.en,support:`${entry.sourceId}${entry.sourcePage?' · '+(lang==='ar'?'صفحة ':'page ')+entry.sourcePage:''} · ${entry.id}`,review:'',criteriaReview:'',itemId:item.id,bankId:entry.id,sourceId:entry.sourceId};
  }
  function childGoals(s,D){
    const all=M.allMilestones(D),result=[];
    for(const [key,plan]of Object.entries(s.goals)){
      const item=all.find(i=>i.id===(plan.itemId||key));
      if(item&&plan.goal.trim())result.push({key,item,plan,generated:false});
    }
    for(const profile of I.build(s,D).profiles){
      if(!['draft','source-pending'].includes(profile.status)||s.iepExcluded?.includes(profile.item.id)||result.some(g=>g.item.id===profile.item.id))continue;
      const item=profile.item,entry=entries(D).find(e=>e.id==='milestone-'+item.id);
      const plan=I.draft(s,D,item.id,s.lang)||fromEntry(s,D,entry,s.lang);
      if(!plan)continue;
      // Suggestions are derived from current evidence; reading never saves a case.
      plan.goal=goalText(entry,s.lang,s.child.name);plan.itemId=item.id;
      result.push({key:item.id,item,plan,generated:true});
    }
    return result;
  }
  root.VBGoalBank={entries,filter,goalText,itemFor,fromEntry,childGoals};
})(window);
