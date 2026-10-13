# Hamada vocabulary PWA

Implemented directly in `tools/voc/`. Serve this directory with HTTPS (or use localhost for development). Deploy all HTML, `sw.js`, `manifest.json`, `assets/`, `icons/`, `images/`, and `sounds/` together; no server-side code is required.

The home screen opens immediately. Its Arabic offline card starts or pauses downloads, reports actual cached files, and shows “جاهز للاستخدام دون اتصال ✔” only after verification. The catalog currently contains **1,975 existing media files, 29.6 MB**, across folders 1–40. Folder sizes vary and contain gaps; the catalog includes existing filenames rather than guessing 19 per folder.

Downloads use three sequential files per message, eight-second per-file timeouts, SHA-256 verification, and revisioned Cache Storage keys. Navigating between app pages resumes an unfinished download; an explicit pause persists. Two windows share a batch and pending requests. Completed files are reused across revisits and unchanged media is reused across releases. Installation only saves the local app shell. All CSS, icon fonts, and Arabic fonts are local. Cached M4A responses implement 206 byte ranges and 416 errors for Safari audio.

Keep the app visible while downloading. The OS may suspend or terminate workers; saved files survive, and returning to the app resumes the remaining work. See [MDN’s service worker lifecycle guidance](https://developer.mozilla.org/en-US/docs/Web/API/ServiceWorkerGlobalScope). Storage persistence is requested as a best effort; storage clearing or browser eviction still requires downloading missing content again, as described in [WebKit’s storage policy](https://webkit.org/blog/14403/updates-to-storage-policy/). The readiness indicator is rechecked on load/return. Portrait orientation is requested in the manifest; platforms can ignore it, so existing landscape layouts remain usable ([orientation compatibility](https://developer.mozilla.org/en-US/docs/Web/Progressive_web_apps/Manifest/Reference/orientation)).

## Install and branding

Android/Chromium can expose the “تثبيت التطبيق” button when the browser offers installation. On iPhone/iPad, use Share → Add to Home Screen; on versions that offer it, enable Open as Web App. Installation and media download are separate actions. The manifest uses relative start/scope/id values so subpath hosting works.

Real PNG install icons were generated from `images/logo.webp`: 192px and 512px general icons, a 512px opaque maskable icon with safe padding, and a 180px Apple touch icon. These paths are the customization points for replacing branding; they are working assets rather than missing placeholders. Run `npm run build:icons` if the logo changes. The Apple status bar uses `black-translucent` with CSS safe-area padding; change it to `default` for an opaque status bar. Device-specific Apple splash images are optional and intentionally not linked to nonexistent files.

## Build and checks

From `tools/voc/`, run `npm install` once. After editing HTML/styles run `npm run build`. After adding, replacing, or removing media, changing icons, or editing the worker/client script, run `npm run build:pwa`. This refreshes the shared game vocabulary and regenerates `assets/pwa-release.js` with exact inventories, sizes, hashes, and shell version. Generated assets are included in the app directory, so production requires no Node runtime. See [GAMES.md](GAMES.md) for the four games, controls, scoring, and page generation.

Run `npm test` for catalog integrity and app-script checks. Install Google Chrome and run `npx playwright install webkit` once, then `VOC_USE_CHROME=1 npm run test:browser` for real offline tests on this workstation. Chrome supplies AAC/M4A decoding that Playwright's macOS headless shell lacks. The browser suite covers shell-only installation, failed downloads, shared batches, pause/reload, navigation resume, quota errors, full downloads, all six offline routes, actual M4A playback, byte ranges, and missing-cache repair. It writes phone/tablet screenshots to `/private/tmp/voc-*.png` on this workstation.

Updates activate after existing app windows close, avoiding mixed shell releases. Keep an offline installation open only if you want to retain its current app version; close and reopen it online to activate a successfully installed update. Do not rename or omit the generated release script: `sw.js` imports it.

## Existing source gaps

These referenced images were already absent from the converted assets: `images/7/11.webp`, `images/7/12.webp`, `images/16/4.webp`, `images/16/14.webp`, `images/33/30.webp`, and `images/33/88.webp` through `images/33/97.webp`. They display a local placeholder. Add the missing images and rebuild the catalog to restore the intended artwork. The downloader verifies all files actually supplied; it cannot recreate missing source images.

The existing Resources link targets `res/1.pdf`, which is absent from this project. It is not included in the offline catalog. Add that PDF and add its path to the shell list in `scripts/build-pwa.cjs` if it should be downloadable offline. `test.html` now runs the “استمع واختر” listening game. Games exclude items whose images or sounds are absent, instead of asking children to identify a placeholder.

## Requested code blocks

The following blocks show the installed source. The worker depends on the generated `assets/pwa-release.js`; use `scripts/build-pwa.cjs` to build it from the real folder contents. Supporting CSS, fonts, icons, and HTML are included in this directory.

### 1. manifest.json

```json
{
  "id": "./",
  "name": "المفاهيم مع حمادة",
  "short_name": "حمادة",
  "description": "تعلم المفاهيم والكلمات العربية مع صور وأصوات وألعاب تعمل دون اتصال بعد تنزيل المحتوى.",
  "lang": "ar",
  "dir": "rtl",
  "start_url": "./index.html",
  "scope": "./",
  "display": "standalone",
  "display_override": ["standalone"],
  "orientation": "portrait-primary",
  "background_color": "#F8FAFC",
  "theme_color": "#0284C7",
  "categories": ["education", "kids"],
  "icons": [
    { "src": "icons/icon-192.png", "sizes": "192x192", "type": "image/png", "purpose": "any" },
    { "src": "icons/icon-512.png", "sizes": "512x512", "type": "image/png", "purpose": "any" },
    { "src": "icons/maskable-512.png", "sizes": "512x512", "type": "image/png", "purpose": "maskable" }
  ],
  "shortcuts": [
    { "name": "الألعاب", "url": "./games.html" }
  ]
}
```

### 2. Head injection

```html
<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">
<!-- PWA: keep these relative URLs inside tools/voc on subpath hosting. -->
    <link rel="manifest" href="manifest.json">
    <meta name="theme-color" content="#0284C7">
    <meta name="mobile-web-app-capable" content="yes">
    <meta name="apple-mobile-web-app-capable" content="yes">
    <meta name="apple-mobile-web-app-title" content="حمادة">
    <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent">
    <meta name="format-detection" content="telephone=no">
    <link rel="apple-touch-icon" sizes="180x180" href="icons/apple-touch-icon.png">
    <link rel="icon" type="image/png" sizes="192x192" href="icons/icon-192.png">
    <link rel="stylesheet" href="assets/utilities.css">
    <link rel="stylesheet" href="assets/vendor/fontawesome.css">
    <link rel="stylesheet" href="assets/vendor/cairo.css">
    <link rel="stylesheet" href="assets/pwa.css">
    <script defer src="assets/pwa.js"></script>
```

### 3. sw.js

```javascript
/* Small, page-driven batches keep mobile service-worker events short. Media
 * never downloads in install. Cache entries, not localStorage flags, prove readiness.
 * Rebuild assets/pwa-release.js after changing this file or any app/media file. */
importScripts('./assets/pwa-release.js');
const { version, shell, integrity, media } = self.VOC_RELEASE;
const BASE = self.registration.scope;
const SHELL_CACHE = `voc-shell-${version}`;
const MEDIA_CACHE = 'voc-media-v1'; // Revisioned keys reuse unchanged assets between releases.
const STATE_CACHE = 'voc-state-v1';
const STATE_URL = new URL('__offline_state__', BASE).href;
const absolute = path => new URL(path, BASE).href;

// Map folders 1–40 using their actual inventories (including gaps and >19 items).
const assets = Array.from({ length: 40 }, (_, i) => media[i] || []).flat().map(asset => ({
    ...asset,
    href: absolute(asset.url),
    key: `${absolute(asset.url)}?voc-rev=${asset.revision}`
}));
const byURL = new Map(assets.map(asset => [asset.href, asset]));
const shellURLs = new Set(shell.map(absolute));
const inFlight = new Map();
let batchPromise = null;
let wanted;
let inventory = null;

// A timeout covers both headers AND writing the body into Cache Storage.
async function cacheFile(cache, url, key, fileIntegrity) {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 8000);
    try {
        const response = await fetch(url, {
            cache: 'reload', credentials: 'same-origin', signal: controller.signal,
            ...(fileIntegrity ? { integrity: fileIntegrity } : {})
        });
        // Never count 404s, redirects, partial audio, or opaque responses as saved.
        if (response.status !== 200 || response.redirected || response.type === 'opaque') {
            throw new Error(`HTTP ${response.status}: ${url}`);
        }
        await cache.put(key, response);
    } finally {
        clearTimeout(timeout);
    }
}

self.addEventListener('install', event => {
    event.waitUntil((async () => {
        const cache = await caches.open(SHELL_CACHE);
        // Only a small local shell, sequentially; no decoded Image/Audio objects.
        for (const url of shell) {
            await cacheFile(cache, absolute(url), absolute(url), integrity[url]);
        }
        // Updates wait for existing app windows to close, avoiding mixed releases.
    })());
});

self.addEventListener('activate', event => {
    event.waitUntil((async () => {
        for (const name of await caches.keys()) {
            if (name.startsWith('voc-shell-') && name !== SHELL_CACHE) await caches.delete(name);
        }
        const cache = await caches.open(MEDIA_CACHE);
        const current = new Set(assets.map(asset => asset.key));
        for (const request of await cache.keys()) {
            if (!current.has(request.url)) await cache.delete(request);
        }
        await self.clients.claim();
    })());
});

async function readWanted() {
    if (wanted === undefined) {
        const response = await (await caches.open(STATE_CACHE)).match(STATE_URL);
        wanted = response ? (await response.json()).wanted === true : false;
    }
    return wanted;
}

async function setWanted(value) {
    wanted = value;
    await (await caches.open(STATE_CACHE)).put(STATE_URL,
        new Response(JSON.stringify({ wanted }), { headers: { 'Content-Type': 'application/json' } }));
}

async function inspect(refresh = true) {
    if (!refresh && inventory) {
        inventory.wanted = await readWanted();
        return inventory;
    }
    const cache = await caches.open(MEDIA_CACHE);
    // keys() reads request metadata only, never thousands of response bodies.
    const keys = new Set((await cache.keys()).map(request => request.url));
    const shellCache = await caches.open(SHELL_CACHE);
    const shellKeys = new Set((await shellCache.keys()).map(request => request.url));
    const missingShell = shell.filter(url => !shellKeys.has(absolute(url)));
    const done = assets.reduce((count, asset) => count + Number(keys.has(asset.key)), 0);
    inventory = { keys, missingShell, done, total: assets.length,
        bytes: assets.reduce((sum, asset) => sum + asset.bytes, 0),
        ready: done === assets.length && missingShell.length === 0,
        wanted: await readWanted(), version };
    return inventory;
}

function publicStatus(status) {
    const { keys, missingShell, ...result } = status;
    return result;
}

async function broadcast(status) {
    for (const client of await self.clients.matchAll({ type: 'window' })) {
        if (client.url.startsWith(BASE)) client.postMessage({ type: 'VOC_OFFLINE_PROGRESS', ...status });
    }
}

async function saveMedia(asset) {
    // A second tab or a runtime audio/image request joins the same pending work.
    if (!inFlight.has(asset.key)) {
        const task = (async () => {
            const cache = await caches.open(MEDIA_CACHE);
            if (await cache.match(asset.key)) return;
            const digest = btoa(String.fromCharCode(...asset.revision.match(/../g).map(hex => parseInt(hex, 16))));
            await cacheFile(cache, asset.href, asset.key, `sha256-${digest}`);
        })();
        inFlight.set(asset.key, task);
    }
    try { await inFlight.get(asset.key); }
    finally { inFlight.delete(asset.key); }
}

async function runBatch() {
    let status = await inspect(false);
    if (!status.wanted) return publicStatus(status);
    // Three sequential files per message; the page schedules the next message.
    // Browser suspension can lose at most this short batch, never the saved files.
    let budget = 3;
    for (const url of [...status.missingShell]) {
        if (!(await readWanted()) || budget-- <= 0) break;
        await cacheFile(await caches.open(SHELL_CACHE), absolute(url), absolute(url), integrity[url]);
        status.missingShell = status.missingShell.filter(missing => missing !== url);
    }
    for (const asset of assets) {
        if (status.keys.has(asset.key)) continue;
        if (!(await readWanted()) || budget-- <= 0) break;
        await saveMedia(asset);
        // Runtime requests may have saved this file while the batch was pending.
        // Keep only request metadata in memory, never media response bodies.
        status = await inspect(false);
        if (!status.keys.has(asset.key)) { status.keys.add(asset.key); status.done++; }
        await broadcast({ ...publicStatus(status), ready: false, wanted });
    }
    // Avoid enumerating thousands of keys for every three-file batch. Refresh on
    // every STATUS/visit, on worker restart, and before ever declaring Ready.
    const verified = await inspect(status.done === assets.length);
    if (verified.ready) { await setWanted(false); verified.wanted = false; }
    return publicStatus(verified);
}

self.addEventListener('message', event => {
    const command = event.data?.type;
    if (!['VOC_STATUS', 'VOC_START', 'VOC_PAUSE', 'VOC_BATCH'].includes(command)) return;
    // Only this app's own windows can initiate a download.
    if (!event.source?.url?.startsWith(BASE)) return;
    event.waitUntil((async () => {
        let result;
        try {
            if (command === 'VOC_START') await setWanted(true);
            if (command === 'VOC_PAUSE') await setWanted(false);
            if (command === 'VOC_BATCH') {
                if (!batchPromise) batchPromise = runBatch().finally(() => { batchPromise = null; });
                result = await batchPromise;
            } else {
                const status = await inspect();
                if (status.ready && status.wanted) { await setWanted(false); status.wanted = false; }
                result = publicStatus(status);
            }
        } catch (error) {
            // Keep intent on network loss; another visit can resume. Quota/storage
            // errors require an explicit retry, so no endless background loop.
            const storageError = ['QuotaExceededError', 'SecurityError', 'InvalidStateError'].includes(error.name);
            if (storageError) { try { await setWanted(false); } catch {} }
            result = { error: storageError ? 'storage' : 'network', message: error.message };
        }
        event.ports[0]?.postMessage(result);
        await broadcast(result);
    })());
});

// Safari requests byte ranges even for short M4A clips. Slice just this one
// cached audio blob; never read the entire collection into memory.
async function rangeResponse(request, response) {
    const range = request.headers.get('Range');
    const match = /^bytes=(\d*)-(\d*)$/.exec(range || '');
    const blob = await response.blob();
    const size = blob.size;
    let start = match?.[1] ? Number(match[1]) : 0;
    let end = match?.[2] ? Number(match[2]) : size - 1;
    if (match && !match[1] && match[2]) { start = Math.max(0, size - Number(match[2])); end = size - 1; }
    const headers = new Headers(response.headers);
    headers.delete('Content-Encoding');
    headers.set('Accept-Ranges', 'bytes');
    if (!match || (!match[1] && !match[2]) || start >= size || start > end) {
        headers.set('Content-Range', `bytes */${size}`);
        headers.set('Content-Length', '0');
        return new Response(null, { status: 416, headers });
    }
    end = Math.min(end, size - 1);
    headers.set('Content-Range', `bytes ${start}-${end}/${size}`);
    headers.set('Content-Length', String(end - start + 1));
    return new Response(blob.slice(start, end + 1), { status: 206, headers });
}

self.addEventListener('fetch', event => {
    const { request } = event;
    const url = new URL(request.url);
    if (request.method !== 'GET' || !url.href.startsWith(BASE)) return;
    url.search = ''; // App links may carry category/search parameters.
    url.hash = '';
    if (url.href === BASE) url.pathname += 'index.html';
    const href = url.href;
    const asset = byURL.get(href);
    if (!asset && !shellURLs.has(href)) return; // Do not cache unrelated site pages.
    event.respondWith((async () => {
        try {
            const cache = await caches.open(asset ? MEDIA_CACHE : SHELL_CACHE);
            let response = await cache.match(asset ? asset.key : href);
            if (!response) {
                if (asset) await saveMedia(asset);
                else {
                    const relative = href.slice(BASE.length);
                    await cacheFile(cache, href, href, integrity[relative]);
                }
                response = await cache.match(asset ? asset.key : href);
            }
            if (!response) throw new Error('Cached file unavailable');
            return request.headers.has('Range') && asset?.url.endsWith('.m4a')
                ? rangeResponse(request, response) : response;
        } catch {
            // A full disk must not prevent normal online use.
            try { return await fetch(request); }
            catch { return new Response('هذا المحتوى غير متاح دون اتصال. عد للرئيسية لتنزيله.',
                { status: 503, headers: { 'Content-Type': 'text/plain; charset=utf-8' } }); }
        }
    })());
});
```

### 4. Downloader client (assets/pwa.js)

```javascript
/* Shared by every app page. The visible page drives short worker batches;
 * Cache Storage is the source of truth after navigation or worker termination. */
(() => {
    'use strict';
    const card = document.querySelector('[data-offline-card]');
    const statusText = card?.querySelector('[data-offline-status]');
    const progress = card?.querySelector('progress');
    const button = card?.querySelector('[data-offline-download]');
    const installButton = card?.querySelector('[data-offline-install]');
    let registration;
    let status;
    let running = false;
    let fault = false;
    let installPrompt;

    function showError(message) {
        fault = true;
        if (!card) return;
        card.dataset.state = 'error';
        statusText.textContent = message;
        button.disabled = false;
        button.textContent = 'إعادة المحاولة / استكمال التنزيل';
    }

    function render(next) {
        if (next.error) {
            showError(next.error === 'storage'
                ? 'تعذر حفظ المحتوى. وفر مساحة على الجهاز ثم أعد المحاولة؛ المحتوى المحفوظ سيُستخدم مجدداً.'
                : 'توقف التنزيل. تحقق من الاتصال ثم استكمل؛ الملفات المحفوظة لن تُنزّل مجدداً.');
            return;
        }
        status = next;
        fault = false;
        if (!card) return;
        progress.max = Math.max(1, status.total);
        progress.value = status.done;
        progress.setAttribute('aria-valuetext', `${status.done} / ${status.total}`);
        card.dataset.state = status.ready ? 'ready' : status.wanted ? 'downloading' : 'idle';
        if (status.ready) statusText.textContent = 'جاهز للاستخدام دون اتصال ✔';
        else if (status.wanted && !navigator.onLine) statusText.textContent = `بانتظار الاتصال — محفوظ ${status.done} من ${status.total}`;
        else if (status.wanted) statusText.textContent = `جاري تنزيل المحتوى ${status.done} من ${status.total}…`;
        else statusText.textContent = `محفوظ ${status.done} من ${status.total} — حجم المحتوى ${(status.bytes / 1e6).toFixed(1)} ميغابايت`;
        button.disabled = status.ready;
        button.textContent = status.ready ? 'تم تنزيل جميع الملفات' : status.wanted
            ? 'إيقاف التنزيل مؤقتاً' : status.done ? 'استكمال التنزيل دون اتصال' : 'تنزيل كل المحتوى دون اتصال';
    }

    function worker() {
        const controller = navigator.serviceWorker.controller;
        // Another PWA on this origin may control the initial page before claim().
        return controller?.scriptURL === new URL('sw.js', location.href).href
            ? controller : registration?.active;
    }

    function send(type) {
        return new Promise((resolve, reject) => {
            const target = worker();
            if (!target) { reject(new Error('Service worker not active')); return; }
            const channel = new MessageChannel();
            const timer = setTimeout(() => {
                channel.port1.close();
                reject(new Error('Worker timed out; cached files are preserved'));
            }, 45000);
            channel.port1.onmessage = event => {
                clearTimeout(timer);
                channel.port1.close();
                resolve(event.data);
            };
            // Normally target is navigator.serviceWorker.controller. The active
            // registration also handles the first visit before control is claimed.
            target.postMessage({ type }, [channel.port2]);
        });
    }

    async function pump() {
        if (running || fault || !status?.wanted || status.ready || !navigator.onLine || document.hidden) return;
        running = true;
        try {
            while (status?.wanted && !status.ready && navigator.onLine && !document.hidden) {
                const next = await send('VOC_BATCH');
                render(next);
                if (next.error) break;
                // Yield between batches so input and progress paint smoothly.
                await new Promise(resolve => setTimeout(resolve, 50));
            }
        } catch {
            showError('توقف التنزيل مؤقتاً. اضغط استكمال التنزيل؛ الملفات المحفوظة لن تضيع.');
        } finally {
            running = false;
        }
    }

    async function sync() {
        if (!worker() || running) return;
        try { render(await send('VOC_STATUS')); void pump(); }
        catch { showError('تعذر التحقق من الملفات. اضغط إعادة المحاولة.'); }
    }

    window.addEventListener('beforeinstallprompt', event => {
        event.preventDefault();
        installPrompt = event;
        if (installButton) installButton.hidden = false;
    });
    installButton?.addEventListener('click', async () => {
        if (!installPrompt) return;
        await installPrompt.prompt();
        await installPrompt.userChoice;
        installPrompt = null;
        installButton.hidden = true;
    });
    window.addEventListener('appinstalled', () => { if (installButton) installButton.hidden = true; });

    button?.addEventListener('click', async () => {
        button.disabled = true;
        try {
            if (!registration?.active) await initialize();
            if (!registration?.active) return;
            const pause = status?.wanted && !fault;
            if (!pause) {
                // Request in the click gesture, but never delay saving download
                // intent while a browser decides whether persistence is granted.
                // This also survives immediately navigating to a game after click.
                try { void navigator.storage?.persist?.()?.catch(() => {}); } catch {}
            }
            render(await send(pause ? 'VOC_PAUSE' : 'VOC_START'));
            void pump();
        } catch {
            showError('تعذر بدء التنزيل. تحقق من الاتصال ثم أعد المحاولة.');
        }
    });

    async function initialize() {
        if (!('serviceWorker' in navigator) || !window.isSecureContext) {
            if (statusText) statusText.textContent = 'يتطلب التنزيل دون اتصال فتح التطبيق عبر HTTPS أو localhost.';
            if (button) button.disabled = true;
            return;
        }
        try {
            registration = await navigator.serviceWorker.register('./sw.js', { scope: './', updateViaCache: 'none' });
            if (!registration.active) {
                // ready alone never rejects if shell installation fails (e.g. 404).
                await new Promise((resolve, reject) => {
                    const timer = setTimeout(() => reject(new Error('Installation timeout')), 45000);
                    const check = () => {
                        if (registration.active) { clearTimeout(timer); resolve(); }
                        else if (registration.installing?.state === 'redundant') { clearTimeout(timer); reject(new Error('Installation failed')); }
                    };
                    registration.installing?.addEventListener('statechange', check);
                    registration.addEventListener('updatefound', () => registration.installing?.addEventListener('statechange', check));
                    check();
                });
            }
            await sync();
        } catch {
            showError('تعذر تجهيز التطبيق دون اتصال. تحقق من الاتصال وأعد المحاولة.');
        }
    }

    if ('serviceWorker' in navigator) {
        navigator.serviceWorker.addEventListener('message', event => {
            if (event.source?.scriptURL !== new URL('sw.js', location.href).href) return;
            if (event.data?.type === 'VOC_OFFLINE_PROGRESS') render(event.data);
        });
        navigator.serviceWorker.addEventListener('controllerchange', () => { void sync(); });
    }
    window.addEventListener('online', () => { void sync(); });
    window.addEventListener('offline', () => { if (status) render(status); });
    window.addEventListener('pageshow', () => { void sync(); });
    document.addEventListener('visibilitychange', () => { if (!document.hidden) void sync(); });
    void initialize();
})();
```

The home-screen component used by this script:

```html
<section class="offline-card" data-offline-card data-state="idle" aria-labelledby="offline-title">
                <h2 id="offline-title">التطبيق دون اتصال</h2>
                <p data-offline-status role="status" aria-live="polite" aria-atomic="true">جاري التحقق من المحتوى المحفوظ…</p>
                <progress value="0" max="1" aria-label="تقدم تنزيل المحتوى"></progress>
                <div class="offline-actions">
                    <button type="button" data-offline-download disabled>تنزيل كل المحتوى دون اتصال</button>
                    <button type="button" data-offline-install hidden>تثبيت التطبيق</button>
                </div>
                <p>اترك التطبيق مفتوحاً أثناء التنزيل. إذا توقف أو أُغلق، سيستكمل الملفات المتبقية عند العودة.</p>
                <p>على iPhone وiPad: من قائمة المشاركة اختر «إضافة إلى الشاشة الرئيسية» ثم «فتح كتطبيق ويب» إن ظهر.</p>
            </section>
```
