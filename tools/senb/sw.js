/* SENB only: atomic shell updates, revisioned media, and offline audio ranges. */
importScripts('assets/pwa-release.js', 'assets/offline-store.js');
const BASE = self.registration.scope;
const NAMES = SENBOffline.names(BASE);
const SHELL = `${NAMES.shellPrefix}${SENB_RELEASE.version}`;
let catalogPromise;
async function catalog() {
    if (!catalogPromise) catalogPromise = (async () => {
        const cache = await caches.open(SHELL);
        const response = await cache.match(new URL('assets/offline-assets.json', BASE));
        if (!response) throw new Error('Offline catalog unavailable');
        const data = await response.json();
        return new Map(data.assets.map(entry => [new URL(entry.url, BASE).href, entry]));
    })().catch(error => { catalogPromise = null; throw error; });
    return catalogPromise;
}
self.addEventListener('install', event => {
    event.waitUntil((async () => {
        const cache = await caches.open(SHELL);
        try {
            // A failed release never replaces the working offline shell.
            await cache.addAll(SENB_RELEASE.shell.map(path => new Request(new URL(path, BASE), { cache: 'reload', integrity: SENB_RELEASE.integrity[path] })));
        } catch (error) { await caches.delete(SHELL); throw error; }
    })());
});
self.addEventListener('activate', event => {
    event.waitUntil((async () => {
        const current = await catalog();
        const media = await caches.open(NAMES.media);
        const valid = new Set([...current.values()].map(entry => SENBOffline.key(entry, BASE)));
        for (const request of await media.keys()) if (!valid.has(request.url)) await media.delete(request);
        for (const name of await caches.keys()) if (name.startsWith(NAMES.shellPrefix) && name !== SHELL) await caches.delete(name);
        await self.clients.claim();
    })());
});
self.addEventListener('message', event => {
    if (event.data?.type === 'ACTIVATE_UPDATE') self.skipWaiting();
});
async function serve(request) {
    const url = new URL(request.url);
    const shell = await caches.open(SHELL);
    if (request.mode === 'navigate' && (url.pathname === new URL(BASE).pathname || url.pathname === new URL('index.html', BASE).pathname)) {
        return (await shell.match(new URL('index.html', BASE))) || fetch(request);
    }
    const shellResponse = await shell.match(request, { ignoreSearch: true });
    if (shellResponse) return shellResponse;
    const entry = (await catalog()).get(`${url.origin}${url.pathname}`);
    if (!entry) return fetch(request);
    const media = await caches.open(NAMES.media);
    const cached = await media.match(SENBOffline.key(entry, BASE));
    if (cached) return SENBOffline.rangeResponse(request, cached);
    try {
        const complete = await SENBOffline.fetchAndStore(entry, media, BASE);
        return SENBOffline.rangeResponse(request, complete);
    } catch {
        // Online playback can continue even if device storage is full or a
        // server is midway through deployment. Never cache partial/HTML bodies.
        return fetch(request);
    }
}
self.addEventListener('fetch', event => {
    const url = new URL(event.request.url);
    if (event.request.method !== 'GET' || url.origin !== self.location.origin || !url.href.startsWith(BASE)) return;
    // Offline misses are network failures, not uncaught worker errors.
    // The page handles unavailable media.
    event.respondWith(serve(event.request).catch(() => Response.error()));
});
