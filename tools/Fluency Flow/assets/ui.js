// The application interface. Timing rules live in practice.js and content in app.js.
import { Y, Gn, Uf, q6, xa, Fs, Ui, cf, Vo, Ps, Hi, $s, Oo, nS, pd, Of, Vf, gT, sT, af, al, va, fr, Bf } from './vendor.js';
import {
  categoriesByScreen, screenDefaults, breathingPresets, breathingLimits, breathingCycles, cancellationPause,
  singleItemCategories, practiceItems, practiceTokens, buildCues, syllablesPerMinute, lettersForScreen,
  parentScreen, readLanguage
} from './practice.js';
import { useRecording } from './recording.js';
import { Dialog } from './dialog.js';
import { pictureItems } from './pictures.js';
import { PwaPanel } from './pwa.js';

const h = Y.createElement;
const LOGO = './assets/icons/logo.webp';
const FLUENCY = ['slower-rate-practice', 'easy-onset-practice', 'light-contact-practice'];
const MOD_STEPS = {
  'cancellation-practice': [['stutter', va], ['pause', Ui], ['repeat', cf]],
  'pull-out-practice': [['stutter', va], ['transition', fr]],
  'prep-set-practice': [['prepare', al], ['smooth', Gn]]
};
const clamp = (value, [min, max]) => Math.min(max, Math.max(min, value));

function IconButton({ label, icon: Icon, className = '', flip, iconClass, ...props }) {
  return h('button', { type: 'button', 'aria-label': label, title: label, className: `ff-icon-button ${className}`, ...props },
    h(Icon, { 'aria-hidden': true, className: `${flip ? 'ff-flip ' : ''}${iconClass || ''}` }));
}
function ActionCard({ title, icon: Icon, onClick }) {
  return h('button', { type: 'button', className: 'ff-action', onClick, 'aria-label': title },
    h(Icon, { 'aria-hidden': true }), h('span', null, title));
}
function Stepper({ value, label, moreLabel, lessLabel, onMore, onLess, atMax, atMin }) {
  return h('div', { className: 'ff-stepper', role: 'group', 'aria-label': label },
    h(IconButton, { label: lessLabel, icon: Hi, onClick: onLess, disabled: atMin }),
    h('output', { 'aria-live': 'polite' }, value),
    h(IconButton, { label: moreLabel, icon: Ps, onClick: onMore, disabled: atMax }));
}

function InfoDialog({ info, lang, onClose }) {
  const [sound, setSound] = Y.useState(null);
  const ar = lang === 'ar';
  const list = (title, items) => items && h('section', null, h('h3', null, title), h('ul', null, items.map((item, i) => h('li', { key: i }, item))));
  return h(Dialog, { onClose, label: info.title },
    h('div', { className: 'ff-dialog-card' },
      h('div', { className: 'ff-dialog-head' },
        h('h2', null, info.title),
        h(IconButton, { label: ar ? 'إغلاق' : 'Close', icon: pd, onClick: onClose })),
      h('div', { className: 'ff-dialog-body' },
        h('p', null, info.purpose),
        info.howItWorks && h('section', null, h('h3', null, ar ? 'كيفية العمل' : 'How it Works'), h('p', null, info.howItWorks)),
        info.targetSounds && h('section', null, h('h3', null, ar ? 'الأصوات المستهدفة' : 'Target Sounds'), h('p', null, info.targetSounds)),
        info.plosiveDetails && h('section', null,
          h('h3', null, ar ? 'اختر صوتاً للتعلم' : 'Select a sound to learn'),
          h('div', { className: 'ff-sounds' }, Object.keys(info.plosiveDetails).map(key => h('button', {
            key, type: 'button', 'aria-pressed': sound === key, onClick: () => setSound(sound === key ? null : key)
          }, `/${key}/`))),
          sound && h('p', { className: 'ff-sound-detail' }, info.plosiveDetails[sound])),
        info.howToUse && h('section', null, h('h3', null, ar ? 'كيفية الاستخدام' : 'How to Use'),
          info.howToUse.map((step, i) => h('div', { key: i, className: 'ff-step' }, h('h4', null, step.title), h('p', null, step.content)))),
        info.techniques && info.techniques.map((technique, i) => h('section', { key: i }, h('h3', null, technique.name),
          h('ol', null, technique.steps.map((step, j) => h('li', { key: j }, step))))),
        list(ar ? 'نصائح التدريب' : 'Practice Tips', info.practiceTips),
        list(ar ? 'نصائح للنجاح' : 'Tips for Success', info.tips))));
}

function LetterDialog({ letters, title, closeLabel, onChoose, onClose }) {
  return h(Dialog, { onClose, label: title },
    h('div', { className: 'ff-dialog-card' },
      h('div', { className: 'ff-dialog-head' }, h('h2', null, title), h(IconButton, { label: closeLabel, icon: pd, onClick: onClose })),
      h('div', { className: 'ff-dialog-body' },
        h('div', { className: 'ff-letters' }, letters.map(letter => h('button', { key: letter, type: 'button', onClick: () => onChoose(letter) }, letter))))));
}

function BreathMark({ active, progress }) {
  return h('span', { className: `ff-breath-mark${active ? ' is-active' : ''}`, 'aria-hidden': true },
    h(Gn, null), h('span', { className: 'ff-breath-bar' }, h('i', { style: { width: `${active ? progress : 0}%` } })));
}

function ModSteps({ steps, phase, t }) {
  return h('ol', { className: 'ff-steps', 'aria-hidden': true }, steps.map(([key, Icon]) => h('li', { key, className: phase === key ? 'is-active' : '', 'data-step': key },
    h('span', { className: 'ff-step-icon' }, h(Icon, null)), h('span', null, key === 'pause' ? t.pausePhase : t[key]))));
}

function WordGuide({ screen, category, items, tokens, pageIndex, itemCount, usePictures, activeIndex, phase, breathProgress }) {
  const easy = screen === 'easy-onset-practice';
  const stateOf = index => index === activeIndex && !['rest', 'idle', 'breath'].includes(phase) ? ' is-active' : '';
  const breathing = index => index === activeIndex && phase === 'breath';
  if (singleItemCategories.has(category)) {
    return h('div', { className: 'ff-items' }, items.slice(pageIndex, pageIndex + itemCount).map((item, index) => h('div', {
      key: `${pageIndex}-${index}`, className: `ff-item${stateOf(index)}`, 'data-phase': index === activeIndex ? phase : undefined
    },
      easy && h(BreathMark, { active: breathing(index), progress: breathProgress }),
      h('div', {
        className: `ff-item-word ${usePictures ? 'ff-picture-word' : ''}`,
        role: usePictures ? 'img' : undefined, 'aria-label': usePictures ? item.text : undefined,
        'data-picture-word': usePictures ? item.text : undefined
      },
        item.icon && h('div', { className: usePictures ? 'ff-word-picture' : 'ff-item-icon' }, Y.cloneElement(item.icon, { 'aria-hidden': true })),
        !usePictures && h('span', { className: 'ff-word' }, item.text)))));
  }
  const showTargets = Boolean(MOD_STEPS[screen]);
  return h('div', { className: `ff-flow ff-flow-${category}` }, tokens.map((token, index) => h(Y.Fragment, { key: index },
    easy && token.breath && h(BreathMark, { active: breathing(index), progress: breathProgress }),
    h('span', {
      className: `ff-word${stateOf(index)}${showTargets && token.target ? ' is-target' : ''}`,
      'data-phase': index === activeIndex ? phase : undefined
    }, token.text))));
}

function BreathingGuide({ t, phase, label, progress, scale, cycle, cycles, inhale, hold, exhale, setBreath, setCycles }) {
  const slider = (key, title, value) => h('label', { className: 'ff-breath-slider', 'data-step': key },
    h('span', null, title),
    h('input', {
      type: 'range', min: breathingLimits[key][0], max: breathingLimits[key][1], value,
      onChange: event => setBreath(key, parseInt(event.target.value, 10))
    }),
    h('output', null, `${value} ${t.seconds}`));
  return h(Y.Fragment, null,
    h('div', { className: `ff-breath-circle${phase === 'idle' ? '' : ' is-running'}`, 'data-phase': phase },
      h('div', { className: 'ff-breath-core', style: { transform: `scale(${scale})` } }, phase === 'idle' ? h(Gn, { 'aria-hidden': true }) : h('span', { 'aria-hidden': true }, label)),
      h('svg', { viewBox: '0 0 100 100', 'aria-hidden': true }, h('circle', { cx: 50, cy: 50, r: 47, pathLength: 100, strokeDasharray: `${progress} 100` }))),
    h('p', { className: 'ff-breath-count' }, `${t.cycles}: ${Math.min(cycle, cycles)} / ${cycles} · ${t.duration}: ${inhale + hold + exhale} ${t.seconds}`),
    h('div', { className: 'ff-breath-settings' },
      slider('inhale', t.inhale, inhale), slider('hold', t.hold, hold), slider('exhale', t.exhale, exhale),
      h('div', { className: 'ff-breath-slider' }, h('span', null, t.cycles),
        h(Stepper, {
          value: cycles, label: t.cycles, moreLabel: t.moreCycles, lessLabel: t.fewerCycles,
          atMax: cycles >= breathingCycles.max, atMin: cycles <= breathingCycles.min,
          onMore: () => setCycles(value => Math.min(breathingCycles.max, value + 1)),
          onLess: () => setCycles(value => Math.max(breathingCycles.min, value - 1))
        }))));
}

export function App({ translations }) {
  const [screen, updateScreen] = Y.useState('home');
  const [lang, setLang] = Y.useState(readLanguage);
  const [category, setCategory] = Y.useState('words');
  const [speeds, setSpeeds] = Y.useState({});
  const [itemCount, updateItemCount] = Y.useState(1);
  const [playing, setPlaying] = Y.useState(false);
  const [completed, setCompleted] = Y.useState(false);
  const [activeIndex, setActiveIndex] = Y.useState(-1);
  const [pageIndex, setPageIndex] = Y.useState(0);
  const [showInfo, setShowInfo] = Y.useState(false);
  const [showAbout, setShowAbout] = Y.useState(false);
  const [phase, setPhase] = Y.useState('idle');
  const [phaseProgress, setPhaseProgress] = Y.useState(0);
  const [breathProgress, setBreathProgress] = Y.useState(0);
  const [breathScale, setBreathScale] = Y.useState(.72);
  const [breathCycle, setBreathCycle] = Y.useState(0);
  const [breathingPreset, setBreathingPreset] = Y.useState(0);
  const [breath, setBreath] = Y.useState(breathingPresets[0]);
  const [cycles, setCycles] = Y.useState(breathingCycles.initial);
  const [pauseSeconds, setPauseSeconds] = Y.useState(cancellationPause.initial);
  const [pictureMode, setPictureMode] = Y.useState(false);
  const [letter, setLetter] = Y.useState(null);
  const [showLetters, setShowLetters] = Y.useState(false);
  const [autoNext, setAutoNext] = Y.useState(false);
  const elapsedRef = Y.useRef(0);
  const t = translations[lang];
  const isArabic = lang === 'ar';
  const { recording, recordingPending, recordingUrl, recordingError, startRecording, stopRecording, playRecording, clearRecording, discardRecording } = useRecording(lang);
  const isBreathing = screen === 'breathing-practice';
  const isPractice = screen.endsWith('-practice');
  const defaults = screenDefaults[screen];
  const speed = speeds[screen] ?? defaults?.speed ?? 5;
  const listed = practiceItems(t.practiceData, category, letter, screen);
  const usePictures = category === 'practice' && !!letter && pictureMode;
  const items = usePictures ? pictureItems(listed.map(item => item.text)) : listed;
  const pageStep = singleItemCategories.has(category) ? itemCount : 1;
  const pageCount = Math.ceil(items.length / pageStep);
  const pageNumber = Math.floor(pageIndex / pageStep) + 1;
  const tokens = practiceTokens(items, category, pageIndex, itemCount);
  const screenTitle = {
    home: t.title, 'fluency-shaping': t.fluencyShaping,
    'stuttering-modification': t.stutteringMod, 'breathing-techniques': t.breathingTech,
    'slower-rate-practice': t.slowerRate, 'easy-onset-practice': t.easyOnsets,
    'light-contact-practice': t.lightContacts, 'cancellation-practice': t.cancellations,
    'pull-out-practice': t.pullOuts, 'prep-set-practice': t.prepSets,
    'breathing-practice': t.breathingInfo.techniques[breathingPreset]?.name || t.breathingTech
  }[screen] || t.title;
  const intro = {
    'slower-rate-practice': t.slowerRateIntro, 'easy-onset-practice': t.easyOnsetIntro, 'light-contact-practice': t.lightContactIntro,
    'cancellation-practice': t.cancellationIntro, 'pull-out-practice': t.pullOutIntro,
    'prep-set-practice': t.prepSetIntro, 'breathing-practice': t.breathingIntro,
    'fluency-shaping': t.fluencyIntro, 'stuttering-modification': t.stutteringIntro, 'breathing-techniques': t.breathingIntro
  }[screen];
  const info = {
    'easy-onset-practice': t.easyOnsetInfo, 'light-contact-practice': t.lightContactInfo, 'slower-rate-practice': t.slowerRateInfo,
    'cancellation-practice': t.cancellationInfo, 'pull-out-practice': t.pullOutInfo, 'prep-set-practice': t.prepSetInfo, 'breathing-practice': t.breathingInfo
  }[screen];

  function resetPractice() {
    elapsedRef.current = 0;
    setPlaying(false);
    setCompleted(false);
    setActiveIndex(-1);
    setPhase('idle');
    setPhaseProgress(0);
    setBreathProgress(0);
    setBreathScale(.72);
    setBreathCycle(0);
    stopRecording();
  }
  function setScreen(next) {
    resetPractice();
    discardRecording();
    setShowInfo(false);
    setPageIndex(0);
    setLetter(null);
    setPictureMode(false);
    const entry = screenDefaults[next];
    if (entry) { setCategory(entry.category); updateItemCount(entry.itemCount); }
    updateScreen(next);
  }
  function openBreathing(preset) {
    setScreen('breathing-practice');
    setBreathingPreset(preset);
    setBreath(breathingPresets[preset]);
  }
  function setSpeed(value) { setSpeeds(previous => ({ ...previous, [screen]: clamp(value, [1, 10]) })); }
  function setItemCount(value) {
    resetPractice();
    updateItemCount(value);
    setPageIndex(0);
  }
  function chooseCategory(next, event) {
    if (next === 'practice') { event.currentTarget.focus(); setShowLetters(true); return; }
    setCategory(next); resetPractice(); setPageIndex(0);
  }
  function chooseLetter(next) {
    setLetter(next); setCategory('practice'); setPageIndex(0); resetPractice(); setShowLetters(false);
  }
  function toggleLanguage() {
    resetPractice();
    discardRecording();
    setLetter(null);
    setPictureMode(false);
    setPageIndex(0);
    if (category === 'practice') setCategory(defaults?.category || 'words');
    setLang(previous => previous === 'ar' ? 'en' : 'ar');
  }
  function togglePractice() {
    if (playing) { setPlaying(false); setCompleted(false); return; }
    if (completed) elapsedRef.current = 0;
    setCompleted(false);
    setPlaying(true);
  }
  function nextPage() {
    if (pageIndex + pageStep < items.length) { resetPractice(); setPageIndex(pageIndex + pageStep); }
  }
  function previousPage() {
    if (pageIndex > 0) { resetPractice(); setPageIndex(Math.max(0, pageIndex - pageStep)); }
  }
  Y.useEffect(() => {
    document.documentElement.lang = lang;
    document.documentElement.dir = isArabic ? 'rtl' : 'ltr';
    try { localStorage.setItem('fluency-flow-language', lang); } catch { /* Private browsing can block storage. */ }
  }, [lang, isArabic]);
  Y.useEffect(() => {
    document.title = screen === 'home' ? t.title : `${screenTitle} · ${t.title}`;
    window.scrollTo({ top: 0, behavior: 'instant' });
    document.querySelector('h1')?.focus({ preventScroll: true });
  }, [screen, lang]);
  Y.useEffect(() => {
    if (showInfo || showAbout || showLetters) { setPlaying(false); setCompleted(false); }
  }, [showInfo, showAbout, showLetters]);
  const backgroundStopRef = Y.useRef(stopRecording);
  backgroundStopRef.current = stopRecording;
  Y.useEffect(() => {
    function pauseForBackground() {
      if (document.hidden) { setPlaying(false); setCompleted(false); backgroundStopRef.current(); }
    }
    function leavePage() { setPlaying(false); setCompleted(false); backgroundStopRef.current(); }
    document.addEventListener('visibilitychange', pauseForBackground);
    window.addEventListener('pagehide', leavePage);
    return () => {
      document.removeEventListener('visibilitychange', pauseForBackground);
      window.removeEventListener('pagehide', leavePage);
    };
  }, []);
  // Long stories: keep the active word on screen, clear of the fixed controls.
  Y.useEffect(() => {
    if (!playing || activeIndex < 0) return;
    document.querySelector('.ff-word.is-active')?.scrollIntoView({ block: 'nearest' });
  }, [playing, activeIndex, phase]);
  // Auto-advance owns one cancellable timeout. Navigation, pause, dialogs and
  // changing a category all invalidate it before another exercise can start.
  Y.useEffect(() => {
    if (!completed || !autoNext || isBreathing || showInfo || showAbout || showLetters || document.hidden || pageIndex + pageStep >= items.length) return;
    const timeout = setTimeout(() => {
      elapsedRef.current = 0;
      setCompleted(false);
      setActiveIndex(-1);
      setPageIndex(index => index + pageStep);
      setPlaying(true);
    }, 1500);
    return () => clearTimeout(timeout);
  }, [completed, autoNext, screen, category, lang, letter, pageIndex, pageStep, items.length, showInfo, showAbout, showLetters]);
  // Use elapsed time instead of interval counts, and retain it while paused.
  // Ten updates per second keep the cue responsive without rendering at 20 Hz.
  Y.useEffect(() => {
    if (!playing || showInfo || showAbout || showLetters) return;
    if (!isBreathing && !tokens.length) { setPlaying(false); return; }
    const cues = isBreathing ? [] : buildCues(screen, tokens, { speed, pauseSeconds });
    function finish() {
      elapsedRef.current = 0;
      setPlaying(false);
      setCompleted(true);
      setActiveIndex(-1);
      setPhase('idle');
      setBreathScale(.72);
    }
    let last = performance.now();
    function tick() {
      const now = performance.now();
      elapsedRef.current += now - last;
      last = now;
      let elapsed = elapsedRef.current;
      if (isBreathing) {
        const { inhale, hold, exhale } = breath;
        const total = (inhale + hold + exhale) * 1000;
        if (elapsed >= total * cycles) { setBreathProgress(100); finish(); return; }
        setBreathCycle(Math.floor(elapsed / total) + 1);
        const within = elapsed % total;
        setBreathProgress(within / total * 100);
        if (within < inhale * 1000) { setPhase('inhale'); setBreathScale(.72 + .28 * within / (inhale * 1000)); }
        else if (within < (inhale + hold) * 1000) { setPhase('hold'); setBreathScale(1); }
        else { setPhase('exhale'); setBreathScale(1 - .28 * (within - (inhale + hold) * 1000) / (exhale * 1000)); }
        return;
      }
      for (const cue of cues) {
        if (elapsed < cue.duration) {
          setActiveIndex(cue.index);
          setPhase(cue.phase);
          setPhaseProgress(elapsed / cue.duration * 100);
          return;
        }
        elapsed -= cue.duration;
      }
      finish();
    }
    tick();
    const interval = setInterval(tick, 100);
    return () => clearInterval(interval);
  }, [playing, screen, category, lang, pageIndex, itemCount, letter, usePictures, speed, pauseSeconds, breath, cycles, showInfo, showAbout, showLetters]);

  const exhaleLabel = [t.exhale, t.exhaleSpeak, t.exhaleSound][breathingPreset];
  const phaseLabel = {
    inhale: t.inhale, hold: t.hold, exhale: isBreathing ? exhaleLabel : t.exhale, breath: t.inhale, vocalize: t.speak,
    word: screen === 'light-contact-practice' ? t.light : t.speak, rest: t.pausePhase, pause: t.pausePhase,
    stutter: t.stutter, repeat: t.repeat, transition: t.transition, prepare: t.prepare, smooth: t.smooth
  }[phase] || '';
  const statusText = playing ? phaseLabel : completed ? t.finished : elapsedRef.current > 0 ? t.paused : '';
  // The circle and step icons already show the phase, so screen readers alone get this copy.
  const phaseShownElsewhere = playing && (isBreathing || MOD_STEPS[screen]?.some(([key]) => key === phase));
  const singleCategory = singleItemCategories.has(category);
  const recordingText = recordingError || (recordingPending ? t.recordingPending : recording ? t.recording : recordingUrl ? t.recordingReady : '');

  return h('div', { className: 'ff-app', dir: isArabic ? 'rtl' : 'ltr', 'data-screen': screen, 'data-playing': playing },
    h('header', { className: 'ff-header' },
      h('div', { className: 'ff-brand' },
        screen !== 'home'
          ? h(IconButton, { label: t.back, icon: $s, flip: true, onClick: () => setScreen(parentScreen(screen)) })
          : h('img', { src: LOGO, width: 40, height: 40, alt: '' }),
        h('h1', { tabIndex: -1 }, screenTitle)),
      h('div', { className: 'ff-header-actions' },
        isPractice && h(IconButton, { label: t.info, icon: xa, onClick: event => { event.currentTarget.focus(); setShowInfo(true); } }),
        h('button', {
          type: 'button', className: 'ff-language', onClick: toggleLanguage, lang: isArabic ? 'en' : 'ar',
          'aria-label': isArabic ? 'Switch to English' : 'التبديل إلى العربية'
        }, h(nS, { 'aria-hidden': true }), h('span', null, isArabic ? 'English' : 'العربية')))),
    h('main', { id: 'practice-main', className: 'ff-main' },
      screen === 'home' && h('section', { className: 'ff-home' },
        h('img', { className: 'ff-home-logo', src: LOGO, width: 180, height: 180, alt: '' }),
        h('h2', null, t.title),
        h('p', null, t.subtitle),
        h('div', { className: 'ff-actions' },
          h(ActionCard, { title: t.fluencyShaping, icon: Uf, onClick: () => setScreen('fluency-shaping') }),
          h(ActionCard, { title: t.stutteringMod, icon: q6, onClick: () => setScreen('stuttering-modification') }),
          h(ActionCard, { title: t.breathingTech, icon: Gn, onClick: () => setScreen('breathing-techniques') }),
          h(ActionCard, { title: t.info, icon: xa, onClick: event => { event.currentTarget.focus(); setShowAbout(true); } }))),
      ['fluency-shaping', 'stuttering-modification', 'breathing-techniques'].includes(screen) && h('section', { className: 'ff-menu' },
        h('p', { className: 'ff-intro' }, intro),
        h('div', { className: 'ff-actions' },
          screen === 'fluency-shaping' && [
            h(ActionCard, { key: 1, title: t.slowerRate, icon: Gn, onClick: () => setScreen('slower-rate-practice') }),
            h(ActionCard, { key: 2, title: t.easyOnsets, icon: al, onClick: () => setScreen('easy-onset-practice') }),
            h(ActionCard, { key: 3, title: t.lightContacts, icon: va, onClick: () => setScreen('light-contact-practice') })
          ],
          screen === 'stuttering-modification' && [
            h(ActionCard, { key: 1, title: t.cancellations, icon: cf, onClick: () => setScreen('cancellation-practice') }),
            h(ActionCard, { key: 2, title: t.pullOuts, icon: fr, onClick: () => setScreen('pull-out-practice') }),
            h(ActionCard, { key: 3, title: t.prepSets, icon: Bf, onClick: () => setScreen('prep-set-practice') })
          ],
          screen === 'breathing-techniques' && t.breathingInfo.techniques.map((technique, index) =>
            h(ActionCard, { key: index, title: technique.name, icon: Gn, onClick: () => openBreathing(index) })))),
      isPractice && h('section', { className: 'ff-practice' },
        intro && h('p', { className: 'ff-intro' }, intro),
        !isBreathing && h('div', { className: 'ff-categories' }, categoriesByScreen[screen].map(key => h('button', {
          key, type: 'button', 'aria-pressed': category === key, onClick: event => chooseCategory(key, event)
        }, t[key]))),
        h('div', { className: 'ff-practice-card' },
          !isBreathing && h('div', { className: 'ff-pagination' },
            h(IconButton, { label: t.prev, icon: $s, flip: true, onClick: previousPage, disabled: pageIndex === 0 }),
            h('span', null, `${pageNumber} / ${pageCount}`),
            h(IconButton, { label: t.next, icon: Oo, flip: true, onClick: nextPage, disabled: pageIndex + pageStep >= items.length })),
          isBreathing
            ? h(BreathingGuide, {
              t, phase, label: phaseLabel, progress: breathProgress, scale: breathScale, cycle: breathCycle, cycles, ...breath, setCycles,
              setBreath: (key, value) => setBreath(previous => ({ ...previous, [key]: clamp(value, breathingLimits[key]) }))
            })
            : h('div', { className: 'ff-guide' },
              MOD_STEPS[screen] && h(ModSteps, { steps: MOD_STEPS[screen], phase, t }),
              h(WordGuide, { screen, category, items, tokens, pageIndex, itemCount, usePictures, activeIndex, phase, breathProgress: phaseProgress })),
          h('section', { className: 'ff-status', 'aria-label': t.sessionStatus },
            h('p', { role: 'status', className: phaseShownElsewhere ? 'ff-sr-only' : undefined }, statusText),
            recordingUrl && h('audio', { controls: true, src: recordingUrl, preload: 'metadata', 'aria-label': t.playRecording }))),
        !isBreathing && h('div', { className: 'ff-speed' },
          h(IconButton, { label: t.slower, icon: Hi, onClick: () => setSpeed(speed - 1), disabled: speed <= 1 }),
          h('label', null,
            h('span', null, `${t.speed}: ${syllablesPerMinute(speed)} ${t.syllablesPerMinute}`),
            h('input', { type: 'range', min: 1, max: 10, value: speed, 'aria-label': t.speed, onChange: event => setSpeed(parseInt(event.target.value, 10)) })),
          h(IconButton, { label: t.faster, icon: Ps, onClick: () => setSpeed(speed + 1), disabled: speed >= 10 })),
        screen === 'cancellation-practice' && h('div', { className: 'ff-setting' },
          h('span', null, t.pauseLength),
          h(Stepper, {
            value: `${pauseSeconds} ${t.seconds}`, label: t.pauseLength, moreLabel: t.longerPause, lessLabel: t.shorterPause,
            atMax: pauseSeconds >= cancellationPause.max, atMin: pauseSeconds <= cancellationPause.min,
            onMore: () => setPauseSeconds(value => Math.min(cancellationPause.max, value + 1)),
            onLess: () => setPauseSeconds(value => Math.max(cancellationPause.min, value - 1))
          })),
        h('div', { className: 'ff-toolbar' },
          h(IconButton, { label: playing ? t.pause : t.play, icon: playing ? Ui : Fs, className: 'ff-play', onClick: togglePractice }),
          h(IconButton, { label: t.reset, icon: cf, onClick: resetPractice }),
          !isBreathing && h(IconButton, { label: t.autoAdvance, icon: Vo, 'aria-pressed': autoNext, onClick: () => setAutoNext(!autoNext) }),
          recording
            ? h(IconButton, { label: t.stop, icon: Vf, className: 'ff-recording', onClick: stopRecording })
            : h(IconButton, { label: recordingPending ? t.recordingPending : t.record, icon: Of, disabled: recordingPending, onClick: startRecording }),
          recordingUrl && h(IconButton, { label: t.playRecording, icon: gT, onClick: playRecording }),
          recordingUrl && h(IconButton, { label: t.clear, icon: sT, onClick: clearRecording }),
          category === 'practice' && letter && !isBreathing && h('button', {
            type: 'button', className: 'ff-picture-switch', 'aria-pressed': pictureMode,
            'aria-label': isArabic ? 'عرض رموز الكلمات' : 'Show word pictures',
            title: isArabic ? (pictureMode ? 'عرض الكلمات' : 'عرض رموز الكلمات') : (pictureMode ? 'Show words' : 'Show word pictures'),
            onClick: () => { resetPractice(); setPageIndex(0); setPictureMode(value => !value); }
          }, pictureMode ? h('span', { 'aria-hidden': true, className: 'ff-text-symbol' }, isArabic ? 'أ' : 'Aa') : h(af, { 'aria-hidden': true })),
          !isBreathing && singleCategory && h(Stepper, {
            value: itemCount, label: t.moreItems, moreLabel: t.moreItems, lessLabel: t.lessItems,
            atMax: itemCount >= 3, atMin: itemCount <= 1,
            onMore: () => setItemCount(value => Math.min(3, value + 1)),
            onLess: () => setItemCount(value => Math.max(1, value - 1))
          }),
          recordingText && h('p', { className: 'ff-recording-feedback', role: recordingError ? 'alert' : 'status' }, recordingText)))),
    showInfo && info && h(InfoDialog, { info, lang, onClose: () => setShowInfo(false) }),
    showAbout && h(InfoDialog, { info: t.appInfo, lang, onClose: () => setShowAbout(false) }),
    showLetters && h(LetterDialog, {
      letters: lettersForScreen(screen, t.practiceData.letterWords), title: t.chooseLetter, closeLabel: t.close,
      onChoose: chooseLetter, onClose: () => setShowLetters(false)
    }),
    h(PwaPanel, { lang, home: screen === 'home', busy: playing || recording || recordingPending }),
    !isPractice && h('footer', { className: 'ff-footer' },
      h('p', { lang: 'en', dir: 'ltr' }, 'SPEECH AND LANGUAGE PATHOLOGY'),
      h('p', { lang: 'en', dir: 'ltr' }, 'Ahmad Ghanem'),
      h('p', { lang: 'en', dir: 'ltr' }, 'Latakia - Syria'),
      h('a', { href: 'mailto:slp.ahmadghanem@gmail.com', dir: 'ltr' }, 'slp.ahmadghanem@gmail.com')));
}
