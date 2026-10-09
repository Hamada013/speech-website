import { Y as React, u } from './vendor.js';

export function Dialog({ children, onClose, label, className }) {
  const ref = React.useRef(null);
  const closeRef = React.useRef(onClose);
  closeRef.current = onClose;
  React.useEffect(() => {
    const previousFocus = document.activeElement;
    const node = ref.current;
    const surfaces = [...document.querySelectorAll('header, main, footer, #pwa-panel, .ff-status')];
    const priorInert = surfaces.map(surface => surface.inert);
    surfaces.forEach(surface => { surface.inert = true; });
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    const focusables = () => [...node.querySelectorAll('button:not(:disabled), input:not(:disabled), a[href], [tabindex="0"]')].filter(el => el.getClientRects().length);
    (focusables()[0] || node).focus({ preventScroll: true });
    function onKey(event) {
      if (event.key === 'Escape') { event.preventDefault(); closeRef.current(); }
      if (event.key !== 'Tab') return;
      const items = focusables();
      const first = items[0], last = items.at(-1);
      if (!first) { event.preventDefault(); node.focus(); return; }
      if (event.shiftKey && (document.activeElement === first || document.activeElement === node)) { event.preventDefault(); last.focus(); }
      else if (!event.shiftKey && (document.activeElement === last || document.activeElement === node)) { event.preventDefault(); first.focus(); }
    }
    node.addEventListener('keydown', onKey);
    return () => {
      node.removeEventListener('keydown', onKey);
      surfaces.forEach((surface, i) => { surface.inert = priorInert[i]; });
      document.body.style.overflow = previousOverflow;
      if (previousFocus?.isConnected) previousFocus.focus({ preventScroll: true });
    };
  }, []);
  return u.jsx('div', {
    ref, role: 'dialog', 'aria-modal': true, 'aria-label': label, tabIndex: -1,
    className: `ff-dialog ${className || ''}`,
    onClick: event => { if (event.target === event.currentTarget) closeRef.current(); },
    children
  });
}
