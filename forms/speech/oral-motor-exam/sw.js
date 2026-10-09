/* Cache the app shell only. Patient answers never pass through this worker. */
const CACHE = 'ag-oral-motor-shell-v2';
const SHELL = ['./', './index.html', './assets/index-C16yvhKC.css', './assets/index-CO8PlA9M.js', './manifest.webmanifest', './assets/icon.svg', './assets/icon-192.png', './assets/icon-512.png'];
self.addEventListener('install', event => {
  event.waitUntil(caches.open(CACHE).then(cache => cache.addAll(SHELL)).then(() => self.skipWaiting()));
});
self.addEventListener('activate', event => {
  event.waitUntil(caches.keys().then(keys => Promise.all(keys.filter(key => key.startsWith('ag-oral-motor-shell-') && key !== CACHE).map(key => caches.delete(key)))).then(() => self.clients.claim()));
});
self.addEventListener('fetch', event => {
  const request = event.request, url = new URL(request.url);
  if (request.method !== 'GET' || url.origin !== self.location.origin || !url.href.startsWith(self.registration.scope)) return;
  // Only serve explicitly listed shell resources; do not cache exports or other forms.
  const shellUrls = SHELL.map(path => new URL(path, self.registration.scope).pathname);
  if (!shellUrls.includes(url.pathname)) return;
  event.respondWith((async () => {
    const cache = await caches.open(CACHE);
    if (request.mode === 'navigate') {
      try { return await fetch(request); }
      catch { return (await cache.match(request, { ignoreSearch: true })) || await cache.match('./index.html'); }
    }
    return (await cache.match(request, { ignoreSearch: true })) || fetch(request);
  })());
});
