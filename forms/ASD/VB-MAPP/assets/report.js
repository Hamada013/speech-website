(function (root) {
  'use strict';
  const M = root.VBModel;
  const esc = value => String(value ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const pick = (lang, en, ar) => lang === 'ar' ? ar : en;
  const levelColors = {
    1: { fill:'#f7cfa8', tint:'#fff7ee', line:'#e8bb90', ink:'#744315' },
    2: { fill:'#c5e5c9', tint:'#f2faf3', line:'#abd5b2', ink:'#2d5937' },
    3: { fill:'#c6ddf6', tint:'#f2f7fe', line:'#aac8e9', ink:'#284f79' }
  };
  function levelStyle(level) {
    const c=levelColors[level] || levelColors[1];
    return `--score-color:${c.fill};--level-tint:${c.tint};--level-line:${c.line};--score-ink:${c.ink}`;
  }
  function label(data, category, lang) { return lang === 'ar' ? data.arabicLabels[category] || data.categoryLabels[category]?.ar || category : data.categoryLabels[category]?.en || category; }
  const gridLabelsAr = { Mand: 'طلب', Tact: 'تسمية', Listener: 'استماع', 'VP/MTS': 'بصري / مطابقة', Play: 'لعب', Social: 'اجتماعي', Imitation: 'تقليد حركي', Echoic: 'تقليد صوتي', Vocal: 'أصوات تلقائية', LRFFC: 'وظيفة / صفة / فئة', Intraverbal: 'حوار', Classroom: 'مجموعة', Linguistics: 'بنية لغوية', Reading: 'قراءة', Writing: 'كتابة', Math: 'حساب' };
  const gridLabelsEn = { Listener: 'Listener', 'VP/MTS': 'VP/MTS', Intraverbal: 'IV', Classroom: 'Group', Linguistics: 'Lang.', Imitation: 'Imitation', Vocal: 'Vocal', LRFFC: 'LRFFC' };
  function gridLabel(category, lang) { return lang === 'ar' ? gridLabelsAr[category] : gridLabelsEn[category] || category; }
  function scoreName(value, lang) { return value === null ? pick(lang, 'Not assessed', 'غير مقيم') : value === 1 ? pick(lang, 'Met (1)', 'متحقق (1)') : value === .5 ? pick(lang, 'Emerging (0.5)', 'ناشئ (0.5)') : pick(lang, 'Not met (0)', 'غير متحقق (0)'); }
  function grid(s, data, lang, interactive = false, options = {}) {
    const all = M.allMilestones(data), old = options.raw ? null : M.previous(s);
    const tables = [];
    for (const level of [3, 2, 1]) {
      const categories = data.categories.filter(cat => all.some(i => i.level === level && i.category === cat));
      const rows = [5, 4, 3, 2, 1].map(n => n + (level - 1) * 5);
      const title = pick(lang, `Level ${level}`, `المستوى ${level}`);
      let html = `<section class="milestone-level level-${level}" data-milestone-level="${level}" style="${levelStyle(level)}"><h3>${title} <span class="age-band" dir="auto">${['', '0-18', '18-30', '30-48'][level]} ${pick(lang, 'months (reference)', 'شهراً (مرجعي)')}</span></h3>`;
      html += `<div class="grid-table-scroll"><table class="milestone-grid" dir="ltr"><caption class="sr-only">${title}</caption><thead><tr><th scope="col">#</th>${categories.map(cat => `<th scope="col" dir="auto" title="${esc(label(data, cat, lang))}">${esc(gridLabel(cat, lang))}</th>`).join('')}</tr></thead><tbody>`;
      for (const number of rows) {
        html += `<tr><th scope="row">${number}</th>`;
        for (const category of categories) {
          const item = all.find(i => i.category === category && i.milestone === number);
          if (!item) { html += '<td class="cell-na">-</td>'; continue; }
          const value = (options.raw ? M.validScore('milestones', item, s.scores.milestones[item.id]) : M.hasScore(s, 'milestones', item)) ? s.scores.milestones[item.id] : null;
          const c = old ? M.comparison(s,'milestones',item) : null;
          const cls = (value === null ? c?.before !== null && c?.before !== undefined ? 'cell-previous' : 'cell-unassessed' : value === 1 ? 'cell-full' : value === .5 ? 'cell-half' : 'cell-zero') + (c?.status === 'lower' ? ' cell-lower' : '');
          const content = value === null ? '·' : value === .5 ? '½' : value;
          const rawBefore = old && M.own(old.scores.milestones,item.id) ? old.scores.milestones[item.id] : null;
          const previousMark = old ? `<small class="grid-before" dir="ltr">P: ${c.before === null ? rawBefore === null ? '-' : rawBefore + '!' : c.before}</small>` : '';
          const name = `${label(data, category, lang)} ${number}: ${scoreName(value, lang)}${old ? '; ' + pick(lang,'Previous score','الدرجة السابقة') + ': ' + (rawBefore === null ? '-' : rawBefore) : ''}`;
          if(options.report) {html+=`<td>${marks(s,'milestones',item,lang)}</td>`;continue;}
          html += `<td class="${cls}${old ? ' has-previous' : ''}">${interactive ? `<button type="button" ${options.raw ? 'data-import-score' : 'data-edit'}="${item.id}" aria-label="${esc(name)}"><span class="grid-value">${content}</span>${previousMark}</button>` : `<span aria-label="${esc(name)}"><span class="grid-value">${content}</span>${previousMark}</span>`}</td>`;
        }
        html += '</tr>';
      }
      html += '</tbody></table></div></section>';
      tables.push(html);
    }
    return tables;
  }
  function legend(lang) {
    return `<div class="grid-legend" style="${levelStyle(3)}">${[['cell-full', '1', 'Met', 'متحقق'], ['cell-half', '½', 'Emerging', 'ناشئ'], ['cell-zero', '0', 'Not met', 'غير متحقق'], ['cell-unassessed', '·', 'Not assessed', 'غير مقيم']].map(([cls, symbol, en, ar]) => `<span><i class="${cls}">${symbol}</i>${pick(lang, en, ar)}</span>`).join('')}</div>`;
  }
  function visits(s) { return [...(s.history||[]),s]; }
  function colorMark(state,type,item,lang) {
    const valid=M.hasScore(state,type,item),value=valid?state.scores[type][item.id]:null;
    const pending=!valid&&M.own(state.scores[type],item.id);
    const max={milestones:1,tasks:1,eesa:1,barriers:4,transitions:5}[type];
    const title=pick(lang,'Assessment','التقييم')+' '+state.number+' · '+state.date+' · '+(value===null?pick(lang,pending?'Needs review':'Not assessed',pending?'تحتاج مراجعة':'غير مقيم'):value);
    return `<span class="report-color-mark ${valid?'mark-assessed':''} ${value===0?'mark-zero':''} ${pending?'mark-pending':''}" role="img" aria-label="${esc(title)}" title="${esc(title)}" style="--visit-fill:${M.validColor(state.color)};--mark-fill:${value===null?0:value/max*100}%"></span>`;
  }
  function marks(s,type,item,lang) { return `<span class="report-visit-marks" dir="ltr">${visits(s).map(v=>colorMark(v,type,item,lang)).join('')}</span>`; }
  function visitKey(s,lang) {
    return `<div class="report-visit-key">${visits(s).map(v=>`<span><i style="background:${M.validColor(v.color)}"></i>${pick(lang,'Assessment','التقييم')} ${esc(v.number)} · <bdi dir="ltr">${esc(v.date)}</bdi></span>`).join('')}<span>${pick(lang,'Fill = score · dotted = not assessed · diagonal = zero · ! = needs review','التعبئة = الدرجة · منقط = غير مقيم · قطري = صفر · ! = تحتاج مراجعة')}</span></div>`;
  }
  function milestoneSheet(s, data) {
    const lang=s.reportLang, tr=(en,ar)=>pick(lang,en,ar), old=M.previous(s), all=M.allMilestones(data);
    let result;
    const add=(html,text)=>{result={html:`<div class="report-block milestone-sheet-block" data-report-section="milestones">${html}</div>`,text,pageBreakAfter:true};};
    const child = `${tr('Child','الطفل')}: ${s.child.name || tr('Not recorded','غير مسجل')}`;
    const visit = `${tr('Date','التاريخ')}: ${s.date} · ${tr('Assessment','التقييم')}: ${s.number}`;
    const age=M.ageOn(s.child.dob,s.date);
    const caseLine=[s.child.dob ? `${tr('Birth','الميلاد')}: ${s.child.dob}` : '',age===null?'':tr(`Age: ${Math.floor(age/12)}y ${age%12}m`,`العمر: ${Math.floor(age/12)} سنة و${age%12} شهر`),s.child.tester ? `${tr('Assessor','الفاحص')}: ${s.child.tester}` : ''].filter(Boolean).join(' · ');
    const caseHTML=[
      s.child.dob ? `<span>${tr('Birth','الميلاد')}: <bdi dir="ltr">${esc(s.child.dob)}</bdi></span>` : '',
      age===null ? '' : `<span>${tr('Age','العمر')}: <bdi dir="ltr">${Math.floor(age/12)}</bdi> ${tr('y','سنة')} <bdi dir="ltr">${age%12}</bdi> ${tr('m','شهر')}</span>`,
      s.child.tester ? `<span>${tr('Assessor','الفاحص')}: <bdi dir="auto">${esc(s.child.tester)}</bdi></span>` : ''
    ].filter(Boolean).join('');
      const st=M.stats(s,all,'milestones'), p=old ? M.progress(s,data) : null;
      const summary=tr(`Score: ${st.assessed ? st.score : '-'} / 170 · Assessed: ${st.assessed}/170`,`الدرجة: ${st.assessed ? st.score : '-'} / 170 · المقيم: ${st.assessed}/170`);
      const comparison=old ? tr(`Previous: ${old.date} · P = previous; large mark = current; ! = review needed.`,`السابق: ${old.date} · P = السابق؛ العلامة الكبيرة = الحالي؛ ! = يحتاج إلى مراجعة.`) : '';
      const changes=old ? tr(`Higher ${p.higher} · Lower ${p.lower} · Same ${p.same} · New ${p.new} · Awaiting retest ${p.retest}`,`أعلى ${p.higher} · أدنى ${p.lower} · ثابتة ${p.same} · جديدة ${p.new} · بانتظار إعادة التقييم ${p.retest}`) : '';
      const text=[tr('VB-MAPP milestones','معالم VB-MAPP'),child,visit,caseLine,summary,comparison,changes,...all.map(item=>`${item.id} ${label(data,item.category,lang)} ${item.milestone}: ${M.hasScore(s,'milestones',item) ? s.scores.milestones[item.id] : '-'}${old ? ' / P: '+(M.hasScore(old,'milestones',item)?old.scores.milestones[item.id]:'-') : ''}`)].filter(Boolean).join('\n');
      add(`<section class="milestone-sheet" aria-label="${tr('All milestone levels','جميع مستويات المعالم')}"><header class="sheet-header"><h1><span dir="ltr">VB-MAPP</span><span dir="${lang==='ar'?'rtl':'ltr'}">${tr('Milestones','المعالم النمائية')}</span></h1><div class="sheet-case"><strong dir="auto">${esc(child)}</strong><span>${tr('Date','التاريخ')}: <bdi dir="ltr">${esc(s.date)}</bdi> · ${tr('Assessment','التقييم')}: <bdi dir="ltr">${esc(s.number)}</bdi></span></div>${caseHTML?`<div class="sheet-meta">${caseHTML}</div>`:''}<p class="sheet-score"><span>${tr('Score','الدرجة')}:</span> <bdi dir="ltr">${st.assessed ? st.score : '-'} / 170</bdi><span>${tr('Assessed','المقيم')}:</span> <bdi dir="ltr">${st.assessed} / 170</bdi></p>${old?`<p class="comparison-key"><span>${tr('Previous','السابق')}: <bdi dir="ltr">${esc(old.date)}</bdi></span></p>`:''}</header>${visitKey(s,lang)}${grid(s,data,lang,false,{report:true}).join('')}${old?`<p class="sheet-changes">${[['Higher','أعلى',p.higher],['Lower','أدنى',p.lower],['Same','ثابتة',p.same],['New','جديدة',p.new],['Awaiting retest','بانتظار إعادة التقييم',p.retest]].map(([en,ar,value])=>`<span>${tr(en,ar)} <bdi dir="ltr">${value}</bdi></span>`).join('')}</p>`:''}${st.pending?`<p class="sheet-changes"><span>${tr('Saved scores requiring re-scoring','درجات محفوظة تحتاج إلى إعادة التسجيل')}: <bdi dir="ltr">${st.pending}</bdi></span></p>`:''}<div class="sheet-contact" dir="ltr">Ahmad Ghanem · SLP · Latakia - Syria · slp.ahmadghanem@gmail.com · +963 988 451 245</div></section>`,text,true);
    return result;
  }
  function make(s, data) {
    // Keep visit columns readable as the child's assessment history grows.
    // Every group stays in the same report and PDF attachment retains the full history.
    if((s.history||[]).length>3) {
      const records=visits(s),blocks=[];
      const preferences=Object.fromEntries(['lang','reportLang','reportScope','reportLayout','reportLayouts','reportDetails','includeUnassessed'].map(key=>[key,s[key]]));
      for(let at=0;at<records.length;at+=4) {
        const group=records.slice(at,at+4),last=group.at(-1);
        const state=M.normalize({...last,...preferences,history:group.slice(0,-1),baselineId:group.at(-2)?.assessmentId||''});
        blocks.push(...make(state,data).blocks);
      }
      blocks.forEach((block,index)=>{block.pageBreakAfter=index<blocks.length-1;});
      return {blocks,html:blocks.map(b=>b.html).join(''),text:blocks.map(b=>b.text).join('\n\n')};
    }
    const lang=s.reportLang, tr=(en,ar)=>pick(lang,en,ar), old=M.previous(s), blocks=[];
    let layout=s.reportLayout==='tasks'?'tasks':'tables';
    const names={milestones:['Milestones','المعالم'],barriers:['Barriers','العوائق'],transitions:['Transition','الانتقال'],eesa:['EESA','التقليد الصوتي المبكر'],tasks:['Task Analysis','تحليل المهام']};
    const types=Object.keys(names).filter(type=>s.reportScope[type]);
    const summary=type=>{
      const st=M.stats(s,M.records(data,type),type),max={milestones:1,barriers:4,transitions:5,eesa:1,tasks:1}[type];
      return tr(`Score: ${st.assessed?st.score:'—'} / ${st.total*max} · Assessed: ${st.assessed}/${st.total}`,`الدرجة: ${st.assessed?st.score:'—'} / ${st.total*max} · المقيم: ${st.assessed}/${st.total}`);
    };
    function header(title,type) {
      const meta=[s.child.tester?`${tr('Assessor','الفاحص')}: ${s.child.tester}`:'',s.child.dob?`${tr('Birth','الميلاد')}: ${s.child.dob}`:'',s.child.language?`${tr('Language / communication','اللغة / التواصل')}: ${s.child.language}`:''].filter(Boolean);
      return `<header class="sheet-header"><h1><span dir="ltr">VB-MAPP</span><span>${esc(title)}</span></h1><div class="sheet-case"><strong><bdi dir="auto">${esc(s.child.name||tr('Not recorded','غير مسجل'))}</bdi></strong><span>${tr('Date','التاريخ')}: <bdi dir="ltr">${esc(s.date)}</bdi> · ${tr('Assessment','التقييم')}: <bdi dir="ltr">${esc(s.number)}</bdi></span></div>${meta.length?`<div class="sheet-meta">${meta.map(t=>`<span><bdi dir="auto">${esc(t)}</bdi></span>`).join('')}</div>`:''}${type?`<p class="sheet-score">${esc(summary(type))}</p>`:''}</header>`;
    }
    function addSheet(type,title,content,text,cls='') {
      blocks.push({html:`<div class="report-block assessment-sheet-block" data-report-section="${type}" data-report-format="${layout}"><section class="assessment-sheet ${cls}">${header(title,names[type]?type:null)}${content}</section></div>`,text:[title,s.child.name,s.date,names[type]?summary(type):'',text].filter(Boolean).join('\n'),pageBreakAfter:true});
    }
    const score=(state,type,item)=>M.hasScore(state,type,item)?String(state.scores[type][item.id]):M.own(state.scores[type],item.id)?`${state.scores[type][item.id]}!`:'—';
    const scoreHeads=()=>`<th class="result-score">${tr('Assessments','التقييمات')}</th>`;
    const scoreCells=(type,item)=>`<td class="result-score">${marks(s,type,item,lang)}</td>`;
    const key=visitKey(s,lang);
    // Limit each row's text so even long user-entered notes can continue on A4.
    function chunks(value) { return String(value||'').match(/[\s\S]{1,420}(?:\s|$)|[\s\S]{1,420}/g)||['']; }
    function details(type,items,title,cards=false) {
      const rows=[],text=[];
      for(const item of items) {
        const titleText=type==='milestones'||type==='tasks'?`${label(data,item.category,lang)} ${item.code||item.milestone}`:item.id;
        const parts=[M.itemText(item,s,lang)];
        if(s.reportDetails) {
          const criteria=M.itemScoring(item,s,lang);if(criteria)parts.push(`${tr('Criterion','المعيار')}: ${criteria}`);
          if(s.comments[item.id])parts.push(`${tr('Response note','ملاحظة الاستجابة')}: ${s.comments[item.id]}`);
        }
        const value=parts.join('\n');text.push(`${titleText}: ${value} | ${old?score(old,type,item)+' → ':''}${score(s,type,item)}`);
        chunks(value).forEach((part,index)=>rows.push(cards?`<article class="report-task-card" data-report-item="${esc(item.id)}"><header><h3>${esc(titleText)}${index?' '+tr('(continued)','(تابع)'):''}</h3>${marks(s,type,item,lang)}</header><p dir="auto">${esc(part)}</p></article>`:`<tr data-report-item="${esc(item.id)}"><td class="result-code"><bdi dir="auto">${esc(titleText)}${index?' '+tr('(continued)','(تابع)'):''}</bdi></td><td class="result-description" dir="auto">${esc(part)}</td>${scoreCells(type,item)}</tr>`));
      }
      const content=cards?`<div class="report-task-cards" data-page-rows>${rows.join('')}</div>`:rows.length?`<table class="report-table results-table"><thead><tr><th class="result-code">${tr('Item','البند')}</th><th>${tr('Task','المهمة')}</th>${scoreHeads()}</tr></thead><tbody data-page-rows>${rows.join('')}</tbody></table>`:`<p class="report-empty">${tr('No recorded items.','لا توجد بنود مقيمة.')}</p>`;
      addSheet(type,title,key+content,text.join('\n'),'item-results');
    }
    for(const type of types) {
      layout=s.reportLayouts?.[type]||s.reportLayout||'tables';
      const items=M.records(data,type),title=tr(...names[type]);
      const detailItems=items.filter(item=>s.includeUnassessed||M.own(s.scores[type],item.id)||s.comments[item.id]||(old&&M.own(old.scores[type],item.id)));
      if(layout==='tasks') { details(type,items,title,true);continue; }
      if(type==='milestones') {
        const sheet=milestoneSheet(s,data);
        if(s.child.language){sheet.html=sheet.html.replace('</header>',`<div class="sheet-meta"><bdi dir="auto">${esc(s.child.language)}</bdi></div></header>`);sheet.text+='\n'+s.child.language;}
        blocks.push(sheet);
      } else if(type==='tasks') {
        for(const level of [1,2,3]) {
          const levelItems=items.filter(item=>item.level===level),cats=data.categories.filter(cat=>levelItems.some(i=>i.category===cat));
          const rows=[];
          for(let number=(level-1)*5+1;number<=level*5;number++) {
            const bands=cats.map(cat=>levelItems.filter(i=>i.category===cat&&i.milestone===number));
            for(let at=0;at<Math.max(...bands.map(b=>b.length));at++) rows.push(`<tr><th class="task-band" scope="row">${at===0?number:''}</th>${bands.map(b=>b[at]?`<td data-report-item="${esc(b[at].id)}"><small>${esc(b[at].code)}</small>${marks(s,type,b[at],lang)}</td>`:'<td class="task-na"></td>').join('')}</tr>`);
          }
          const table=`<table class="report-table task-score-table" dir="ltr" style="${levelStyle(level)}"><thead><tr><th class="task-band">#</th>${cats.map(cat=>`<th scope="col" dir="auto">${esc(gridLabel(cat,lang))}</th>`).join('')}</tr></thead><tbody data-page-rows>${rows.join('')}</tbody></table>`;
          addSheet(type,`${title} · ${tr('Level','المستوى')} ${level}`,key+table,levelItems.map(i=>`${label(data,i.category,lang)} ${i.code}: ${score(s,type,i)}${old?' / P: '+score(old,type,i):''}`).join('\n'),'task-score-sheet');
        }
      } else if(type==='eesa') {
        const groups=[1,2,3,4,5].map(group=>{
          const list=items.filter(i=>i.group===group),st=M.stats(s,list,type);
          return `<section class="eesa-score-group"><h3>${esc(data.eesaGroups[group][lang])}<span dir="ltr">${st.assessed?st.score:'—'} / ${st.total}</span></h3><div class="eesa-score-cells">${list.map(i=>`<div data-report-item="${esc(i.id)}"><small>${esc(i.id.replace(/^eesa-/,''))}</small>${marks(s,type,i,lang)}</div>`).join('')}</div></section>`;
        });
        addSheet(type,title,key+`<div data-page-rows>${groups.join('')}</div>`,items.map(i=>`${i.id}: ${score(s,type,i)}${old?' / P: '+score(old,type,i):''}`).join('\n'),'eesa-score-sheet');
      } else {
        const levels=type==='barriers'?[4,3,2,1]:[5,4,3,2,1];
        const charts=items.map(item=>`<section class="report-rating-chart" data-report-item="${esc(item.id)}"><h3>${esc(item.id.replace(/^(bar|tr)-/,''))}. ${esc(pick(lang,item.name.en,item.name.ar))}</h3><div class="report-rating-plot" dir="ltr"><div class="report-rating-axis">${levels.map(n=>`<span>${n}</span>`).join('')}</div>${visits(s).map(v=>{const value=M.hasScore(v,type,item)?v.scores[type][item.id]:null;return `<div class="report-rating-visit"><div class="report-rating-column" role="img" aria-label="${esc(v.date+' · '+score(v,type,item))}" style="--visit-fill:${M.validColor(v.color)}">${levels.map(n=>`<span class="${value!==null&&value>=n?'filled':''}"></span>`).join('')}</div>${colorMark(v,type,item,lang)}</div>`;}).join('')}</div></section>`);
        const rows=[];for(let at=0;at<charts.length;at+=6)rows.push(`<div class="report-rating-row">${charts.slice(at,at+6).join('')}</div>`);
        addSheet(type,title,key+`<div class="report-rating-grid" data-page-rows>${rows.join('')}</div>`,items.map(i=>`${M.itemText(i,s,lang)}: ${score(s,type,i)}`).join('\n'));
      }
      if(s.reportDetails||s.includeUnassessed)details(type,detailItems,`${title} · ${tr('Item details','تفاصيل البنود')}`);
    }
    const plans=s.reportScope.goals!==false?(root.VBGoalBank?root.VBGoalBank.childGoals({...s,lang},data):Object.entries(s.goals).map(([key,plan])=>({key,plan,item:M.allMilestones(data).find(i=>i.id===(plan.itemId||key)),generated:false})).filter(g=>g.item)).filter(g=>g.generated||g.plan.selected):[];
    if(s.reportScope.goals!==false) {
      layout='tables';
      const rows=[],text=[];
      for(const {key:id,item,plan,generated} of plans) {
        const title=`${label(data,item.category,lang)} ${item.milestone}`;
        const value=plan.goal;
        text.push(title+' · '+value);chunks(value).forEach((part,index)=>rows.push(`<tr data-report-goal="${esc(id)}"><td class="result-code">${esc(title)}${index?' '+tr('(continued)','(تابع)'):''}</td><td class="result-description" dir="auto">${esc(part)}</td></tr>`));
      }
      addSheet('goals',tr('IEP goals','أهداف الخطة التربوية الفردية'),rows.length?`<table class="report-table results-table"><thead><tr><th class="result-code">${tr('Skill','المهارة')}</th><th>${tr('Goal','الهدف')}</th></tr></thead><tbody data-page-rows>${rows.join('')}</tbody></table>`:`<p class="report-empty">${tr('No goals selected or suggested yet.','لا توجد أهداف مختارة أو مقترحة بعد.')}</p>`,text.join('\n'));
    }
    if(!blocks.length)addSheet('empty',tr('Assessment','التقييم'),`<p>${tr('No sections selected.','لم يُحدد أي قسم.')}</p>`,'');
    blocks[blocks.length-1].pageBreakAfter=false;
    return {blocks,html:blocks.map(b=>b.html).join(''),text:blocks.map(b=>b.text).join('\n\n')};
  }
  root.VBReport = { esc, label, grid, legend, make, levelStyle, levelColors };
})(window);
