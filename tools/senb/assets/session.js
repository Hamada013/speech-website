/* Guided workplace assessment followed by a finite, resumable practice plan. */
(() => {
    'use strict';
    const P = window.SenbProgress, M = window.SenbSessionModel;
    const $ = selector => document.querySelector(selector);
    let run = null, token = 0, audioBusy = false;
    const delays = new Map();
    const icons = {
        play: '<path d="m8 5 11 7-11 7z"/>', pause: '<path d="M8 5v14M16 5v14"/>',
        repeat: '<path d="M3 10a9 9 0 1 1 2 8M3 4v6h6"/>',
        close: '<path d="m6 6 12 12M18 6 6 18"/>', next: '<path d="m15 5-7 7 7 7"/>',
        check: '<path d="m5 12 4 4L19 6"/>', test: '<path d="M8 5H6a2 2 0 0 0-2 2v13h16V7a2 2 0 0 0-2-2h-2M9 3h6v4H9zM8 12h8M8 16h5"/>',
        home: '<path d="m3 11 9-8 9 8M5 10v11h5v-7h4v7h5V10"/>',
        parents: '<circle cx="7" cy="6" r="3"/><circle cx="17" cy="6" r="3"/><path d="M1 21v-6a6 6 0 0 1 10-4M23 21v-6a6 6 0 0 0-10-4"/><circle cx="12" cy="14" r="2"/><path d="M8 22v-3a4 4 0 0 1 8 0v3"/>',
        report: '<path d="M5 3h14v18H5zM9 16v-3M12 16V9M15 16v-5"/>'
    };
    const svg = name => `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${icons[name] || icons.play}</svg>`;
    const button = (id, name, label) => `<button type="button" class="senb-session-icon" id="${id}" aria-label="${label}" title="${label}">${svg(name)}</button>`;
    const view = document.createElement('main'); view.id = 'sessionView'; view.className = 'senb-session-view'; view.hidden = true;
    view.innerHTML = `<div class="senb-session-bar"><h2 id="sessionHeading" tabindex="-1">جلسة الجمل</h2><div>${button('sessionReplay','play','أعد الاستماع')}${button('sessionPause','pause','إيقاف مؤقت')}${button('sessionStop','close','إنهاء المسار')}</div></div><progress id="senbSessionProgress" aria-label="تقدم المرحلة" max="1" value="0"></progress><p id="sessionStatus" role="status" aria-live="polite"></p><section id="sessionBoard" class="senb-session-board" aria-label="بطاقات الجلسة"></section><div id="sessionActions" class="senb-session-actions"></div>`;
    document.body.append(view);
    const curtain = document.createElement('div'); curtain.className = 'senb-session-curtain'; curtain.hidden = true; curtain.setAttribute('role','status'); curtain.setAttribute('aria-live','assertive'); document.body.append(curtain);
    function status(message, error = false) { $('#sessionStatus').textContent = message; $('#sessionStatus').classList.toggle('error',error); }
    function wait(ms, ticket = token) { return new Promise(resolve => { const timer = setTimeout(() => { delays.delete(timer); resolve(ticket === token); },ms); delays.set(timer,resolve); }); }
    function cancel() {
        token++; for (const [timer,resolve] of delays) { clearTimeout(timer); resolve(false); } delays.clear();
        stopAllPlayback(); audioBusy = false; curtain.hidden = true;
        document.querySelectorAll('.session-demo-hand,.session-drag-copy').forEach(el=>el.remove());
        document.querySelectorAll('.session-beat.lit,.session-glow,.expression-card-playing').forEach(el=>el.classList.remove('lit','session-glow','expression-card-playing'));
    }
    function save() { if (run) P.saveDraft(JSON.parse(JSON.stringify(run))); updateResume(); }
    function stage() { return M.stages(run.worked)[run.stageIndex]; }
    function sentence() { return run.phase === 'automation' ? run.worked[stage().indices[run.stagePosition]] : run.current; }
    function setProgress(value,max) { $('#senbSessionProgress').max = Math.max(1,max); $('#senbSessionProgress').value = value; }
    const originalNavigate = navigateTo;
    navigateTo = function(name) {
        if (state.currentView === 'session' && name !== 'session' && run && !['finished','paused','selecting'].includes(run.phase)) pause();
        view.hidden = name !== 'session'; document.body.classList.toggle('senb-session-active',name === 'session');
        originalNavigate(name);
    };
    function enter() { navigateTo('session'); view.hidden = false; $('#sessionHeading').focus({preventScroll:true}); }
    function image(src, label) {
        const img = document.createElement('img'); img.src = src || 'assets/image-fallback.svg'; img.alt = label; img.decoding = 'async';
        img.onerror = () => { img.onerror = null; img.src = 'assets/image-fallback.svg'; }; return img;
    }
    function card(src, label, action, className='') {
        const element = document.createElement('button'); element.type = 'button'; element.className = `senb-session-card ${className}`; element.setAttribute('aria-label',label);
        element.append(image(src,label)); if (action) element.onclick = action; return element;
    }
    function base(title) {
        $('#sessionHeading').textContent = title; $('#sessionBoard').replaceChildren(); $('#sessionBoard').className = 'senb-session-board';
        $('#sessionActions').replaceChildren();$('#sessionActions').classList.remove('suite-text-actions'); status(''); $('#sessionReplay').hidden = false; $('#sessionPause').hidden = false; $('#sessionStop').hidden = false;
    }
    async function segments(list,ticket=token) {
        for (const segment of list) {
            if (ticket !== token) return false;
            if (!await playAudioFilePath(segment.path,segment.text) || ticket !== token) {
                if (ticket === token) status('تعذّر إكمال الصوت. اضغط زر التشغيل للمحاولة مجدداً.',true);
                return false;
            }
        }
        return ticket === token;
    }
    function slotSegments(s,index) { return s.slotContexts?.[index]?.segments || SENBActivities.slotSegments(s,s.slots[index],index); }
    function wholeSegments(s) { return s.soundPath ? [{path:s.soundPath,text:s.title}] : s.slots.flatMap((_,i)=>slotSegments(s,i)); }
    function fillTargetImages(s) { run.targets = M.targets(s).map(target => ({...target,image:target.image || SENBActivities.imagePath(s.slots[target.index])})); }
    function targetBoard() {
        const board = $('#sessionBoard'); board.classList.add('dynamic-board');
        const words = document.createElement('div'); words.className = 'session-target-words';
        for (const [index,target] of run.targets.entries()) {
            const el = card(target.image,run.phase === 'guide' ? target.title : `البطاقة ${index+1}`,()=>answerTarget(index),target.entity === 'sentence' ? 'session-advanced' : '');
            el.dataset.target = index; el.disabled = true; (target.entity === 'sentence' ? board : words).append(el);
            if (run.phase === 'guide' && run.practiced.includes(target.id)) markPracticed(el);
        }
        board.append(words);
    }
    function markPracticed(el) { el.classList.add('session-practiced'); if (!el.querySelector('.session-small-tick')) { const tick=document.createElement('span');tick.className='session-small-tick';tick.innerHTML=svg('check');el.append(tick); } }
    async function guided() {
        if (audioBusy) return;
        const ticket = token; audioBusy = true; $('#sessionReplay').disabled = true;
        while (run.guideIndex < run.targets.length && ticket === token) {
            status('');
            const target = run.targets[run.guideIndex];
            const el = $(`[data-target="${run.guideIndex}"]`);
            if (!await segments(target.segments,ticket)) { audioBusy=false;$('#sessionReplay').disabled=false;return; }
            if (ticket !== token) return;
            el.classList.add('session-glow');
            const finger = document.createElement('span'); finger.className='session-finger'; finger.innerHTML='<svg viewBox="0 0 60 70" aria-hidden="true"><path d="M22 39V9c0-8 10-8 10 0v21c4-8 11-3 11 2 5-5 12-1 12 5v14c0 11-9 17-20 17-7 0-11-4-15-10L8 41c-5-8 3-13 9-6l5 4Z" fill="white" stroke="#64748b" stroke-width="2"/></svg>';el.append(finger);
            if (!await wait(650,ticket)) return;
            finger.remove(); markPracticed(el); run.practiced.push(target.id);
            el.classList.remove('session-glow');run.guideIndex++;save();
            if (run.guideIndex < run.targets.length && !await wait(1000,ticket)) return;
        }
        if (ticket !== token) return;
        audioBusy=false;run.phase='countdown';save();void countdown();
    }
    async function countdown() {
        const ticket=token; $('#sessionReplay').hidden=true;
        for (const value of [1,2,3]) { curtain.innerHTML=`<span class="session-count" data-count="${value}">${value}</span>`;curtain.hidden=false;if(!await wait(700,ticket))return; }
        curtain.hidden=true;run.phase='dynamic-test';run.targetIndex=0;run.testOrder=SENBActivities.shuffle(run.targets.map((_,index)=>index));run.dynamicRecords=[];run.targetWrong=false;save();render();
    }
    function render() {
        if (!run) return;
        $('#sessionReplay').disabled=false;
        if (run.phase === 'selecting') { navigateTo('workplace'); return; }
        if (run.phase === 'paused') return renderPaused();
        if (run.pendingTransition === 'dynamic') return finishDynamicTrial();
        if (run.pendingTransition === 'trial') return nextTrial();
        if (run.phase === 'another') return renderAnother();
        if (run.phase === 'finished') return renderFinished();
        if (run.phase === 'automation') return renderAutomation();
        base(run.phase === 'guide' ? 'نجرب معاً' : 'استمع واختر');targetBoard();
        setProgress(run.phase === 'guide' ? run.guideIndex : run.targetIndex,run.targets.length);
        if (run.phase === 'guide') void guided();
        else if (run.phase === 'countdown') void countdown();
        else void playTarget();
    }
    function targetAt() { return run.targets[run.testOrder?.[run.targetIndex] ?? run.targetIndex]; }
    async function playTarget() {
        if(audioBusy)return;const ticket=token;audioBusy=true;run.answerReady=false;$('#sessionReplay').disabled=true;
        $('#sessionBoard').querySelectorAll('button').forEach(el=>el.disabled=true);
        const played=await segments(targetAt().segments,ticket);
        if(ticket!==token)return;audioBusy=false;$('#sessionReplay').disabled=false;run.answerReady=played;
        $('#sessionBoard').querySelectorAll('button').forEach(el=>el.disabled=!played);
        if(played)status('');
    }
    async function flash(correct,ticket=token) {
        $('#sessionReplay').disabled=true;
        curtain.innerHTML=`<span class="session-answer ${correct?'yes':'no'}">${svg(correct?'check':'close')}</span>`;curtain.hidden=false;
        const completed=await wait(700,ticket);if(ticket===token){curtain.hidden=true;$('#sessionReplay').disabled=false;}return completed;
    }
    async function answerTarget(index) {
        if(run.phase!=='dynamic-test'||!run.answerReady||audioBusy)return;
        run.answerReady=false;$('#sessionBoard').querySelectorAll('button').forEach(el=>el.disabled=true);
        const ticket=token,target=targetAt(),correct=run.targets[index].key===target.key && run.targets[index].entity===target.entity;
        if(!correct){run.targetWrong=true;save();if(await flash(false,ticket))void playTarget();return;}
        run.dynamicRecords.push({key:target.key,title:target.title,entity:target.entity,domain:'receptive',presentation:target.entity==='sentence'?'advanced':'slots',correct:Number(!run.targetWrong),total:1});
        run.targetIndex++;run.targetWrong=false;run.pendingTransition='dynamic';save();
        if(await flash(true,ticket))finishDynamicTrial();
    }
    function finishDynamicTrial() {
        run.pendingTransition=null;
        if(run.targetIndex===run.targets.length){
            log('dynamic','assessment',run.dynamicRecords);
            if(!run.worked.some(s=>s.key===run.current.key&&s.presentation===run.current.presentation))run.worked.push(run.current);
            run.phase='another';save();render();
        }else {save();render();}
    }
    function log(source,kind,records,partial=false) {
        const id=`${run.id}-${source}-${run.logIndex++}`;
        const ended=new Date().toISOString();
        P.logSession({id,date:ended,started:run.stageStartedAt||run.startedAt||ended,durationMs:Math.max(0,Date.parse(ended)-Date.parse(run.stageStartedAt||run.startedAt||ended)),source,kind,partial,records});run.sessionIds.push(id);return id;
    }
    function beginDynamic(snapshot) {
        cancel();run.current=snapshot;fillTargetImages(snapshot);run.phase='guide';run.guideIndex=0;run.practiced=[];run.targetIndex=0;run.dynamicRecords=[];run.targetWrong=false;run.pendingTransition=null;run.stageStartedAt=new Date().toISOString();
        save();enter();render();
    }
    function start() {
        const snapshot=getWorkplaceSentence();
        if(!snapshot?.slots?.length){showAudioStatus('أضف بطاقات للجملة أولاً.');return;}
        if(!run){const draft=P.draft();if(draft?.phase==='selecting')run=draft;}
        if(!run||['finished','paused'].includes(run.phase))run={id:`senb-${Date.now()}-${Math.random().toString(36).slice(2)}`,startedAt:new Date().toISOString(),worked:[],sessionIds:[],logIndex:0};
        beginDynamic(snapshot);
    }
    function renderAnother() {
        base('نكمل التدريب؟');$('#sessionReplay').hidden=true;$('#sessionPause').hidden=true;$('#sessionStop').hidden=true;
        const p=document.createElement('p');p.className='session-question';p.textContent=`تدرّبنا على ${run.worked.length} ${run.worked.length===1?'جملة':'جمل'}.`;$('#sessionBoard').append(p);
        $('#sessionActions').classList.add('suite-text-actions');
        $('#sessionActions').innerHTML='<button type="button" id="sessionStartAutomation">يلا نلعب</button><button type="button" id="sessionChooseMore">عودة للتدريب</button>';
        $('#sessionStartAutomation').classList.add('session-confirm');
        $('#sessionStartAutomation').onclick=()=>{cancel();run.phase='automation';run.stageIndex=0;run.stagePosition=0;run.repeatIndex=0;run.stageRecords=[];run.trialWrong=false;run.stageStartedAt=new Date().toISOString();save();render();};
        $('#sessionChooseMore').onclick=()=>{cancel();run.phase='selecting';save();navigateTo('workplace');};
    }
    const stageNames={'repetition':'نكرّر الجملة','missing':'الكلمة الناقصة','receptive-advanced':'فهم · صورة الجملة','receptive-slots':'فهم · بطاقات الكلمات','expressive-advanced':'تعبير · صورة الجملة','expressive-slots':'تعبير · بطاقات الكلمات'};
    function showSentence(s,presentation,container,interactive=false) {
        if(presentation==='advanced'&&s.imgPath){const el=card(s.imgPath,'صورة الجملة',interactive?()=>void playSentenceModel(s):null,'session-advanced');if(!interactive)el.disabled=true;container.append(el);}
        else {const row=document.createElement('div');row.className='session-word-row';row.style.setProperty('--words',s.slots.length);s.slots.forEach((slot,i)=>{const el=card(SENBActivities.imagePath(slot),`الكلمة ${i+1}`,interactive?()=>void segments(slotSegments(s,i)):null);if(!interactive)el.disabled=true;row.append(el);});container.append(row);}
    }
    function expressionFrame(s,container) {
        const frame=document.createElement('div');frame.className='session-word-row session-expression-frame';frame.style.setProperty('--words',s.slots.length);
        frame.tabIndex=0;frame.setAttribute('role','group');frame.setAttribute('aria-label','استمع إلى كلمات الجملة من اليمين إلى اليسار');
        frame.onclick=()=>{if(run.trialPhase==='test')void expressionModel(s,'slots');};
        frame.onkeydown=event=>{if(event.target===frame&&['Enter',' '].includes(event.key)){event.preventDefault();frame.click();}};
        s.slots.forEach((slot,i)=>{const el=card(SENBActivities.imagePath(slot),s.slotContexts?.[i]?.title||SENBActivities.slotTitle(s,slot,i),event=>{event.stopPropagation();if(run.trialPhase==='test')void expressionModel(s,'slots',i);});frame.append(el);});
        container.append(frame);
    }
    function lockTrial(locked) {
        $('#sessionBoard').querySelectorAll('button').forEach(el=>el.disabled=locked);
        const next=$('#sessionExpressionNext');if(next)next.disabled=locked;
    }
    async function trialCountdown(ticket) {
        run.trialPhase='countdown';save();$('#sessionReplay').hidden=true;
        for(const value of [1,2,3]){curtain.innerHTML=`<span class="session-count" data-count="${value}">${value}</span>`;curtain.hidden=false;if(!await wait(700,ticket))return false;}
        curtain.hidden=true;run.trialPhase='test';save();return true;
    }
    async function demonstrateChoice(source,destination,ticket) {
        const finger=document.createElement('span');finger.className='session-finger session-demo-hand';finger.setAttribute('aria-hidden','true');
        finger.innerHTML='<svg viewBox="0 0 60 70"><path d="M22 39V9c0-8 10-8 10 0v21c4-8 11-3 11 2 5-5 12-1 12 5v14c0 11-9 17-20 17-7 0-11-4-15-10L8 41c-5-8 3-13 9-6l5 4Z" fill="white" stroke="#64748b" stroke-width="2"/></svg>';
        source.append(finger);source.classList.add('session-glow');
        if(!await wait(650,ticket))return false;
        if(destination){
            const from=source.getBoundingClientRect(),to=destination.getBoundingClientRect();
            const copy=source.cloneNode(true);copy.setAttribute('aria-hidden','true');copy.tabIndex=-1;copy.removeAttribute('data-missing-choice');copy.className='senb-session-card session-drag-copy';copy.style.cssText=`left:${from.left}px;top:${from.top}px;width:${from.width}px;height:${from.height}px`;document.body.append(copy);finger.remove();
            if(!await wait(30,ticket))return false;
            copy.style.transform=`translate(${to.left+to.width/2-from.left-from.width/2}px,${to.top+to.height/2-from.top-from.height/2}px)`;
            if(!await wait(850,ticket))return false;
            destination.replaceChildren(image(source.querySelector('img').src,'البطاقة الناقصة'));destination.classList.add('session-glow');copy.remove();
            if(!await wait(650,ticket))return false;
            destination.textContent='؟';destination.classList.remove('session-glow');
        }else if(!await wait(450,ticket))return false;
        finger.remove();source.classList.remove('session-glow');return true;
    }
    async function choiceFlow(kind) {
        if(audioBusy)return;
        const ticket=token,s=sentence();audioBusy=true;status('');run.answerReady=false;lockTrial(true);$('#sessionReplay').disabled=true;
        const played=await segments(kind==='missing'?slotSegments(s,run.missing.index):wholeSegments(s),ticket);
        if(ticket!==token)return;
        if(!played){audioBusy=false;$('#sessionReplay').disabled=false;return;}
        if(run.trialPhase!=='test'){
            const index=kind==='missing'?run.missing.choices.findIndex(slot=>M.wordKey(slot)===run.missing.wanted):run.currentChoices.findIndex(option=>M.sentenceKey(option)===M.sentenceKey(s));
            const source=$(`[data-${kind==='missing'?'missing':'sentence'}-choice="${index}"]`);
            if(!await demonstrateChoice(source,kind==='missing'?$('.session-gap'):null,ticket))return;
            if(!await trialCountdown(ticket))return;
            // Replay the prompt without the demonstration for the child's own turn.
            if(!await segments(kind==='missing'?slotSegments(s,run.missing.index):wholeSegments(s),ticket)){
                if(ticket===token){audioBusy=false;$('#sessionReplay').hidden=false;$('#sessionReplay').disabled=false;}return;
            }
        }
        if(ticket!==token)return;
        audioBusy=false;run.answerReady=true;$('#sessionReplay').hidden=false;$('#sessionReplay').disabled=false;lockTrial(false);status('');
    }
    async function expressionModel(s,presentation,index) {
        if(audioBusy||run.expressionBusy)return;
        const ticket=token;audioBusy=true;status('');lockTrial(true);$('#sessionReplay').disabled=true;
        const cards=[...$('#sessionBoard').querySelectorAll(presentation==='slots'?'.session-expression-frame button':'.session-advanced')];
        const units=presentation==='slots'?(index===undefined?s.slots.map((_,i)=>i):[index]):[null];
        for(const i of units){
            const el=cards[i??0];el?.classList.add('session-glow');if(presentation==='slots')el?.classList.add('expression-card-playing');
            const played=await segments(i===null?wholeSegments(s):slotSegments(s,i),ticket);
            el?.classList.remove('session-glow','expression-card-playing');
            if(ticket!==token)return;
            if(!played){audioBusy=false;$('#sessionReplay').disabled=false;return;}
        }
        if(index===undefined){
            if(!await wait(400,ticket))return;
            for(const circle of $('#sessionBoard').querySelectorAll('.session-beat')){
                circle.classList.add('lit');const played=await segments([{path:getMetronomeAudioPath(),text:''}],ticket);
                if(ticket!==token)return;
                if(!played){circle.classList.remove('lit');audioBusy=false;$('#sessionReplay').disabled=false;return;}
                if(!await wait(500,ticket))return;circle.classList.remove('lit');
            }
        }
        if(run.trialPhase!=='test'&&!await trialCountdown(ticket))return;
        if(ticket!==token)return;
        audioBusy=false;$('#sessionReplay').hidden=false;$('#sessionReplay').disabled=false;lockTrial(false);
    }
    async function playSentenceModel(s) { if(audioBusy)return;audioBusy=true;await segments(wholeSegments(s));audioBusy=false; }
    function renderAutomation() {
        const currentStage=stage();if(!currentStage)return complete();
        if(run.stagePosition>=currentStage.indices.length)return advanceStage();
        const s=sentence();base(stageNames[currentStage.id]);
        setProgress(currentStage.id==='repetition'?run.stagePosition*10+run.repeatIndex:run.stagePosition,currentStage.indices.length*(currentStage.id==='repetition'?10:1));
        if(currentStage.id==='repetition'){showSentence(s,s.imgPath?'advanced':'slots',$('#sessionBoard'));status(`${run.repeatIndex+1} / 10`);void repetition();}
        else if(currentStage.id==='missing'){run.trialPhase ||= 'guide';renderMissing(s);void choiceFlow('missing');}
        else if(currentStage.domain==='receptive'){run.trialPhase ||= 'guide';renderComprehension(s,currentStage);}
        else {run.trialPhase ||= 'guide';renderExpression(s,currentStage);if(run.trialPhase!=='test')void expressionModel(s,currentStage.presentation);}
    }
    async function repetition() {
        if(audioBusy)return;const ticket=token,s=sentence();audioBusy=true;$('#sessionReplay').disabled=true;
        const list=[...wholeSegments(s),...(s.soundPath?s.slots.flatMap((_,i)=>slotSegments(s,i)):[])];
        if(!await segments(list,ticket)){if(ticket===token){audioBusy=false;$('#sessionReplay').disabled=false;}return;}
        if(!await wait(350,ticket))return;audioBusy=false;run.repeatIndex++;
        if(run.repeatIndex===10){run.repeatIndex=0;log('repetition','practice',[]);run.stagePosition++;}
        save();if(run.stagePosition===stage().indices.length)advanceStage();else render();
    }
    function renderMissing(s) {
        run.missing ||= makeMissing(s);const missing=run.missing;
        const row=document.createElement('div');row.className='session-word-row';row.style.setProperty('--words',s.slots.length);
        s.slots.forEach((slot,i)=>{const el=i===missing.index?document.createElement('div'):card(SENBActivities.imagePath(slot),`الكلمة ${i+1}`,null);if(i===missing.index){el.className='session-gap';el.textContent='؟';el.setAttribute('aria-label','الخانة الناقصة');}row.append(el);});$('#sessionBoard').append(row);
        const choices=document.createElement('div');choices.className='session-missing-options';
        missing.choices.forEach((slot,i)=>{const el=card(SENBActivities.imagePath(slot),`البطاقة ${i+1}`,()=>void answerMissing(i));el.dataset.missingChoice=i;el.disabled=true;enableMissingDrag(el,i);choices.append(el);});$('#sessionBoard').append(choices);
    }
    function enableMissingDrag(el,index) {
        let drag=null,suppressClick=false;
        const cleanup=()=>{drag?.copy?.remove();drag=null;};
        el.onclick=()=>{if(suppressClick){suppressClick=false;return;}void answerMissing(index);};
        el.onpointerdown=event=>{
            if(el.disabled||!run.answerReady||event.button!==0)return;
            drag={x:event.clientX,y:event.clientY};el.setPointerCapture(event.pointerId);
        };
        el.onpointermove=event=>{
            if(!drag)return;
            if(!drag.copy&&Math.hypot(event.clientX-drag.x,event.clientY-drag.y)>8){
                const box=el.getBoundingClientRect();drag.copy=el.cloneNode(true);drag.copy.setAttribute('aria-hidden','true');drag.copy.tabIndex=-1;drag.copy.removeAttribute('data-missing-choice');drag.copy.className='senb-session-card session-drag-copy';drag.copy.style.cssText=`left:${box.left}px;top:${box.top}px;width:${box.width}px;height:${box.height}px;transition:none`;document.body.append(drag.copy);
            }
            if(drag.copy)drag.copy.style.transform=`translate(${event.clientX-drag.x}px,${event.clientY-drag.y}px)`;
        };
        el.onpointerup=event=>{
            if(!drag)return;
            const moved=Boolean(drag.copy),gap=$('.session-gap').getBoundingClientRect();cleanup();
            if(moved){suppressClick=true;if(event.clientX>=gap.left&&event.clientX<=gap.right&&event.clientY>=gap.top&&event.clientY<=gap.bottom)void answerMissing(index);}
        };
        el.onpointercancel=cleanup;el.onlostpointercapture=cleanup;
    }
    function makeMissing(s) {
        const indices=s.slots.map((slot,i)=>SENBActivities.hasMappedCard(slot)?i:-1).filter(i=>i>=0);const index=indices[Math.floor(Math.random()*indices.length)]??0;
        const wanted=SENBActivities.normalizeSlot(s.slots[index]);
        const others=SENBActivities.shuffle(ITEMS_DATABASE[wanted.categoryId]||[]).filter(slot=>slot.id!==wanted.id).slice(0,2).map(slot=>({...slot,categoryId:wanted.categoryId}));
        return {index,choices:SENBActivities.shuffle([wanted,...others]),wanted:M.wordKey(wanted)};
    }
    async function answerMissing(index) {
        if(audioBusy||!run.answerReady||run.trialPhase!=='test')return;run.answerReady=false;audioBusy=true;lockTrial(true);const ticket=token,correct=M.wordKey(run.missing.choices[index])===run.missing.wanted;
        if(!await flash(correct,ticket))return;audioBusy=false;
        if(!correct){void choiceFlow('missing');return;}
        log('missing','practice',[]);run.missing=null;nextTrial();
    }
    function choicesFor(s,presentation) {
        let pool=run.worked.filter(other=>other.key!==s.key);
        if(s.folder&&s.subCatId)pool=pool.concat(SENBActivities.sentences(String(s.folder),s.subCatId));
        const signature=other=>presentation==='advanced'?other.imgPath:other.slots.map(SENBActivities.imagePath).join('|');
        const meanings=other=>SENBActivities.meaningSignatures(other);
        const seen=new Set([signature(s),...meanings(s)]),candidates=[];
        const include=candidate=>{
            const sig=signature(candidate),signatures=[sig,...meanings(candidate)];
            if(!sig||signatures.some(value=>seen.has(value)))return;
            signatures.forEach(value=>seen.add(value));candidates.push(candidate);
        };
        for(const candidate of SENBActivities.shuffle(pool)){include(candidate);if(candidates.length===3)break;}
        if(presentation==='slots'&&candidates.length<3){
            // Custom sentences have no preset pool. Replace one mapped card with a
            // distinct card from its own category, retaining all untouched cards.
            for(const [index,slot] of s.slots.entries()){
                const normalized=SENBActivities.normalizeSlot(slot);
                for(const replacement of SENBActivities.shuffle(ITEMS_DATABASE[normalized.categoryId]||[])){
                    if(replacement.id===normalized.id)continue;
                    const slots=s.slots.map((item,i)=>i===index?{...replacement,categoryId:normalized.categoryId}:item);
                    const title=slots.map(item=>item.title||item.titleMale||'').join(' ');
                    include({...s,key:`distractor:${s.key}:${index}:${replacement.id}`,title,slots,imgPath:null,soundPath:null});
                    if(candidates.length===3)break;
                }
                if(candidates.length===3)break;
            }
        }
        return SENBActivities.shuffle([s,...candidates]);
    }
    function renderComprehension(s,currentStage) {
        run.currentChoices ||= choicesFor(s,currentStage.presentation);run.answerReady=false;
        $('#sessionBoard').classList.add('session-choice-grid');
        run.currentChoices.forEach((option,i)=>{const choice=document.createElement('button');choice.type='button';choice.className='senb-session-card session-sentence-choice';choice.dataset.sentenceChoice=i;choice.setAttribute('aria-label',`الخيار ${i+1}`);choice.disabled=true;
            if(currentStage.presentation==='advanced')choice.append(image(option.imgPath,`الخيار ${i+1}`));
            else {const row=document.createElement('span');row.className='session-word-row';row.style.setProperty('--words',option.slots.length);option.slots.forEach(slot=>row.append(image(SENBActivities.imagePath(slot),'بطاقة الكلمة')));choice.append(row);}
            choice.onclick=()=>void answerSentence(i);$('#sessionBoard').append(choice);});
        save();void choiceFlow('sentence');
    }
    async function promptSentence() { return choiceFlow('sentence'); }
    async function answerSentence(index) {
        if(audioBusy||!run.answerReady)return;run.answerReady=false;$('#sessionBoard').querySelectorAll('button').forEach(el=>el.disabled=true);
        const ticket=token,s=sentence(),correct=M.sentenceKey(run.currentChoices[index])===M.sentenceKey(s);
        if(!correct){run.trialWrong=true;save();if(await flash(false,ticket))void promptSentence();return;}
        const currentStage=stage();run.stageRecords.push(M.record(s,'receptive',currentStage.presentation,!run.trialWrong));run.pendingTransition='trial';save();
        if(await flash(true,ticket))nextTrial();
    }
    function renderExpression(s,currentStage) {
        $('#sessionReplay').hidden=false;
        if(currentStage.presentation==='slots')expressionFrame(s,$('#sessionBoard'));else {showSentence(s,currentStage.presentation,$('#sessionBoard'));const scene=$('.session-advanced');if(scene){scene.disabled=false;scene.onclick=()=>{if(run.trialPhase==='test')void expressionModel(s,'advanced');};}}
        run.marks ||= s.slots.map(()=>false);
        const marks=document.createElement('div');marks.className='session-expression-marks';
        run.marks.forEach((marked,i)=>{const el=document.createElement('button');el.type='button';el.className='session-word-mark session-beat';el.setAttribute('aria-label',`قال الكلمة ${i+1}`);el.setAttribute('aria-pressed',String(marked));el.style.setProperty('--mark-color',getSlotColorConfig(i,s.slots.length));el.disabled=run.trialPhase!=='test';el.onclick=()=>{if(audioBusy||run.trialPhase!=='test')return;run.marks[i]=!run.marks[i];el.setAttribute('aria-pressed',String(run.marks[i]));save();};marks.append(el);});$('#sessionBoard').append(marks);
        $('#sessionActions').innerHTML=button('sessionExpressionNext','next','سجّل الاستجابة وتابع');
        $('#sessionExpressionNext').disabled=run.trialPhase!=='test';
        $('#sessionExpressionNext').onclick=async()=>{
            if(run.expressionBusy||audioBusy||run.trialPhase!=='test')return;run.expressionBusy=true;$('#sessionExpressionNext').disabled=true;const ticket=token;
            const marks=[...run.marks];run.stageRecords.push(M.record(s,'expressive',currentStage.presentation,marks.filter(Boolean).length,marks.length));
            s.slots.forEach((slot,i)=>run.stageRecords.push({key:M.wordKey(SENBActivities.normalizeSlot(slot)),title:s.slotContexts?.[i]?.title||SENBActivities.slotTitle(s,slot,i),entity:'word',domain:'expressive',presentation:currentStage.presentation,correct:Number(marks[i]),total:1}));
            run.pendingTransition='trial';save();
            if(await wait(250,ticket)){run.expressionBusy=false;nextTrial();}
        };
    }
    function nextTrial() {
        cancel();run.pendingTransition=null;run.trialPhase=null;run.answerReady=false;run.expressionBusy=false;run.currentChoices=null;run.marks=null;run.trialWrong=false;run.stagePosition++;save();
        if(run.stagePosition===stage().indices.length)advanceStage();else render();
    }
    function advanceStage() {
        cancel();const currentStage=stage();if(currentStage.kind==='assessment')log(currentStage.id,'assessment',run.stageRecords);
        run.stageIndex++;run.trialPhase=null;run.answerReady=false;run.stagePosition=0;run.repeatIndex=0;run.stageRecords=[];run.missing=null;run.currentChoices=null;run.marks=null;run.trialWrong=false;run.stageStartedAt=new Date().toISOString();save();render();
    }
    function complete() {
        cancel();run.phase='finished';save();P.saveDraft(null);updateResume();
        window.SenbSessionReports?.prepareLesson?.({sentences:run.worked,sessionIds:run.sessionIds});
        renderFinished();
    }
    function renderFinished() {
        base('أحسنت! انتهت الجلسة');$('#sessionReplay').hidden=true;$('#sessionPause').hidden=true;$('#sessionStop').hidden=true;setProgress(1,1);
        const p=document.createElement('p');p.className='session-question';p.textContent=`${run.worked.length} ${run.worked.length===1?'جملة':'جمل'} · اكتمل التدريب`;$('#sessionBoard').append(p);
        $('#sessionActions').innerHTML=button('sessionReport','report','تقرير التقدم PDF')+button('sessionFamily','parents','درس البيت للأهل')+button('sessionHome','home','الرئيسية');
        $('#sessionReport').onclick=()=>window.SenbSessionReports?.openReport();$('#sessionFamily').onclick=()=>window.SenbSessionReports?.openLesson({sentences:run.worked,sessionIds:run.sessionIds});$('#sessionHome').onclick=()=>navigateTo('home');
    }
    function pause() {
        if(!run||['paused','finished'].includes(run.phase))return;
        if(run.phase==='selecting'){cancel();save();return;}
        run.resumePhase=run.phase;run.phase='paused';cancel();save();if(state.currentView==='session')renderPaused();
    }
    function renderPaused() {
        run.expressionBusy=false;
        base('استراحة قصيرة');$('#sessionReplay').hidden=true;$('#sessionPause').hidden=true;
        $('#sessionActions').innerHTML=button('sessionContinue','play','متابعة الجلسة')+button('sessionExit','home','العودة للرئيسية');
        $('#sessionContinue').onclick=()=>{cancel();run.phase=run.resumePhase||'guide';save();render();};$('#sessionExit').onclick=()=>navigateTo('home');
    }
    function stop() {
        if(!run)return;
        const effectivePhase=run.phase==='paused'?run.resumePhase:run.phase;
        const records=effectivePhase==='automation'&&stage()?.kind==='assessment'?run.stageRecords:effectivePhase==='dynamic-test'?run.dynamicRecords:[];
        if(records?.length)log('interrupted','assessment',records,true);
        cancel();P.saveDraft(null);run=null;updateResume();navigateTo('workplace');
    }
    $('#sessionPause').onclick=pause;$('#sessionStop').onclick=stop;
    $('#sessionReplay').onclick=()=>{
        if(!run||audioBusy)return;
        if(run.phase==='guide')void guided();else if(run.phase==='dynamic-test')void playTarget();
        else if(run.phase==='automation'){const currentStage=stage();if(currentStage.id==='repetition')void repetition();else if(currentStage.id==='missing')void choiceFlow('missing');else if(currentStage.domain==='receptive')void promptSentence();else void expressionModel(sentence(),currentStage.presentation);}
    };
    const startButton=document.createElement('button');startButton.type='button';startButton.id='workplaceDynamicTest';startButton.className='senb-session-icon';startButton.setAttribute('aria-label','تدريب واختبار الجملة');startButton.title='تدريب واختبار الجملة';startButton.innerHTML=svg('test');startButton.onclick=start;$('#workplaceHeaderToolbar').append(startButton);
    const resume=document.createElement('button');resume.id='resumeSenbSession';resume.type='button';resume.className='senb-session-icon';resume.setAttribute('aria-label','متابعة الجلسة المحفوظة');resume.title='متابعة الجلسة المحفوظة';resume.innerHTML=svg('play');$('#homeHeaderTools').append(resume);
    function updateResume(){resume.hidden=!P.draft();}
    resume.onclick=()=>{cancel();run=P.draft();if(!run)return;if(run.phase==='selecting'){navigateTo('workplace');return;}run.resumePhase=run.phase==='paused'?run.resumePhase:run.phase;run.phase='paused';enter();render();};updateResume();
    window.addEventListener('senb-profile-memorychange',()=>{cancel();run=null;state.basicLearnedFilter=null;state.advancedLearnedFilter=null;document.querySelectorAll('.picker-learned-button').forEach(button=>button.setAttribute('aria-pressed','false'));initializeWorkplace();renderWorkplace();updateResume();navigateTo('home');});
    document.addEventListener('visibilitychange',()=>{if(document.hidden)pause();});window.addEventListener('pagehide',pause);window.addEventListener('senb-profile-open',pause);window.addEventListener('senb-profile-beforechange',()=>{pause();cancel();});
    document.addEventListener('keydown',event=>{if(state.currentView==='session'&&event.key==='Escape'&&!document.querySelector('dialog[open]')){event.preventDefault();pause();}});
    window.SenbSession={start,pause,stop,state:()=>run,resume:()=>resume.click()};
})();
