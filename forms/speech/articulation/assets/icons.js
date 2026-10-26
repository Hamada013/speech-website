'use strict';
const APP_ICONS = {
 cloud:'<path d="M7 18H6a5 5 0 0 1-1-10 7 7 0 0 1 13-1 6 6 0 0 1 1 11h-2M12 12v10m-4-4 4 4 4-4"/>',
 google:'<path d="M21 12h-9m9 0a9 9 0 1 1-3-7m3 7c0 6-4 9-9 9"/>',
 logout:'<path d="M9 3H3v18h6m4-15 6 6-6 6m-6-6h14"/>',
 share:'<circle cx="18" cy="5" r="3"/><circle cx="6" cy="12" r="3"/><circle cx="18" cy="19" r="3"/><path d="m9 11 6-4m-6 6 6 4"/>',
 home:'<path d="m3 10 9-7 9 7v10H5V10M9 21v-8h6v8"/>',
 accounts:'<circle cx="9" cy="8" r="4"/><path d="M2 21v-3a7 7 0 0 1 14 0v3M17 4a4 4 0 0 1 0 8m2 3a6 6 0 0 1 3 6"/>',
 plus:'<path d="M12 5v14M5 12h14"/>',
 close:'<path d="m6 6 12 12M18 6 6 18"/>',
 check:'<path d="m4 12 5 5L20 6"/>',
 swap:'<path d="M4 7h16m-4-4 4 4-4 4M20 17H4m4-4-4 4 4 4"/>',
 minus:'<path d="M5 12h14"/>',
 wave:'<path d="M2 12c3-13 5 13 8 0s5 13 8 0 3 0 4 0"/>',
 dialect:'<path d="M21 11a9 9 0 1 0-15 7l-3 3 7-1a9 9 0 0 0 11-9Z"/><path d="m8 11 3 3 5-6"/>',
 question:'<circle cx="12" cy="12" r="9"/><path d="M9 8a3 3 0 0 1 6 1c0 2-3 2-3 5m0 3h.01"/>',
 skip:'<path d="m4 5 11 7L4 19ZM19 5v14"/>',
 naming:'<path d="M20 11a8 8 0 1 0-14 5l-3 5 7-2a8 8 0 0 0 10-8Z"/><path d="M8 10h8m-8 4h5"/>',
 imitation:'<rect x="3" y="3" width="12" height="12" rx="3"/><path d="M9 19v2h12V9h-2M7 9h4m-2-2v4"/>',
 context:'<path d="M9 18h6m-5 3h4M8 14a7 7 0 1 1 8 0c-1 1-1 2-1 2H9s0-1-1-2Z"/>',
 note:'<path d="M12 4H4v16h16v-8M9 15l1-4L19 2l3 3-9 9-4 1Z"/>',
 trash:'<path d="M3 6h18M9 6V3h6v3M6 6l1 15h10l1-15M10 10v7m4-7v7"/>',
 report:'<path d="M14 2H4v20h16V8ZM14 2v6h6M8 17v-4m4 4V9m4 8v-6"/>',
 compare:'<path d="M12 3v18M4 20V10h4v10m8 0V5h4v15"/>',
 download:'<path d="M12 3v12m-5-5 5 5 5-5M4 16v5h16v-5"/>',
 info:'<circle cx="12" cy="12" r="9"/><path d="M12 11v6m0-10h.01"/>',
 expand:'<path d="M8 3H3v5m13-5h5v5M3 16v5h5m13-5v5h-5"/>',
 shrink:'<path d="M3 8h5V3m13 5h-5V3M8 21v-5H3m13 5v-5h5"/>',
 back:'<path d="m14 5-7 7 7 7M7 12h14"/>',
 next:'<path d="m10 5 7 7-7 7M3 12h14"/>',
 calendar:'<rect x="3" y="5" width="18" height="16" rx="3"/><path d="M7 2v6m10-6v6M3 11h18m-13 4h2m4 0h2"/>',
 edit:'<path d="m4 16 1 5 5-1L21 9l-6-6ZM12 6l6 6"/>',
 refresh:'<path d="M20 8a9 9 0 1 0 1 7M20 3v6h-6"/>',
 eye:'<path d="M2 12s4-7 10-7 10 7 10 7-4 7-10 7S2 12 2 12Z"/><circle cx="12" cy="12" r="3"/>',
 leaf:'<path d="M4 20C-1 4 14 2 21 3c1 14-6 20-17 17Zm0 0L16 8"/>',
 star:'<path d="m12 2 3 6 7 1-5 5 1 7-6-3-6 3 1-7-5-5 7-1Z"/>',
 heart:'<path d="M12 21 3 12C-3 4 6-1 12 6c6-7 15-2 9 6Z"/>',
 flower:'<path d="M12 8C4-2-2 9 7 12c-9 3-3 14 5 4 8 10 14-1 5-4 9-3 3-14-5-4Z"/><circle cx="12" cy="12" r="3"/>',
 mail:'<rect x="2" y="4" width="20" height="16" rx="3"/><path d="m2 6 10 8L22 6"/>',
 phone:'<path d="M21 11a9 9 0 1 0-15 7l-3 3 7-1a9 9 0 0 0 11-9Z"/><path d="M8 7c0 5 2 7 7 8l2-2-3-2-1 1-2-2 1-1-2-3Z"/>'
};
const RESULT_ICONS={correct:'check',substitution:'swap',omission:'minus',distortion:'wave',addition:'plus',dialect:'dialect',unelicited:'question',skipped:'skip'};
function appIcon(name){return `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${APP_ICONS[name]||APP_ICONS.info}</svg>`;}
function iconButton(name,label,attributes='',classes=''){return `<button type="button" class="icon-button ${classes}" aria-label="${escapeHTML(label)}" title="${escapeHTML(label)}" ${attributes}>${appIcon(name)}</button>`;}
function setButtonIcon(button,name,label){if(!button)return;button.classList.add('icon-button');button.setAttribute('aria-label',label);button.title=label;button.innerHTML=appIcon(name);}
function contactLinks(){return '<a href="mailto:slp.ahmadghanem@gmail.com">slp.ahmadghanem@gmail.com</a><a href="https://wa.me/963988451245" target="_blank" rel="noopener" dir="ltr">WhatsApp +963 988 451 245</a>';}
