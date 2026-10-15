// Local SVG icons keep controls readable offline, with no icon font/CDN.
const paths={
 library:'<rect x="3" y="3" width="7" height="7" rx="1.5"/><rect x="14" y="3" width="7" height="7" rx="1.5"/><rect x="3" y="14" width="7" height="7" rx="1.5"/><rect x="14" y="14" width="7" height="7" rx="1.5"/>',
 microphone:'<rect x="9" y="2" width="6" height="13" rx="3"/><path d="M5 10v2a7 7 0 0 0 14 0v-2M12 19v3M8 22h8"/>',
 download:'<path d="M12 3v12m-5-5 5 5 5-5M4 16v4a1 1 0 0 0 1 1h14a1 1 0 0 0 1-1v-4"/>',
 speaker:'<path d="m11 4-6 5H2v6h3l6 5zM15 8a6 6 0 0 1 0 8m3-11a10 10 0 0 1 0 14"/>',
 next:'<path d="m14 5-7 7 7 7"/>',previous:'<path d="m10 5 7 7-7 7"/>',
 shuffle:'<path d="M3 5h3c5 0 7 14 12 14h3m-4-4 4 4-4 4M3 19h3c2 0 4-3 6-7 2-4 4-7 6-7h3m-4-4 4 4-4 4"/>',
 sequence:'<path d="m9 5 11 7-11 7zM3 5v14"/>',stop:'<rect x="5" y="5" width="14" height="14" rx="2"/>',
 close:'<path d="m6 6 12 12M6 18 18 6"/>',check:'<path d="m4 12 5 5L20 6"/>'
};
export function icon(name){return`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${paths[name]||''}</svg>`;}
export function applyIcons(){for(const node of document.querySelectorAll('[data-icon]'))node.innerHTML=icon(node.dataset.icon);}
