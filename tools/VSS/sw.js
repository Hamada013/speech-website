/* Small, page-driven batches keep mobile service-worker events short. Media
 * never downloads in install. Cache entries, not localStorage flags, prove readiness.
 * Rebuild assets/pwa-release.js after changing this file or any app/media file. */
importScripts('./assets/pwa-release.js');
const { version, shell, integrity, media } = self.VSS_RELEASE;
const BASE = self.registration.scope;
const PREFIX = `vss:${new URL(BASE).pathname}:`;
const SHELL_CACHE = `${PREFIX}shell:${version}`;
const MEDIA_CACHE = `${PREFIX}media`; // Revisioned keys reuse unchanged assets between releases.
const STATE_CACHE = `${PREFIX}state`;
const STATE_URL = new URL('__offline_state__', BASE).href;
const absolute = path => new URL(path, BASE).href;

// All three activity catalogs share this scope and download state.
const assets = media.map(asset => ({
    ...asset,
    href: absolute(asset.url),
    key: `${absolute(asset.url)}?vss-rev=${asset.revision}`
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
        try {
            for (const url of shell) await cacheFile(cache, absolute(url), absolute(url), integrity[url]);
        } catch (error) { await caches.delete(SHELL_CACHE); throw error; }
        // Updates wait for existing app windows to close, avoiding mixed releases.
    })());
});

self.addEventListener('activate', event => {
    event.waitUntil((async () => {
        for (const name of await caches.keys()) {
            if (name.startsWith(PREFIX + 'shell:') && name !== SHELL_CACHE) await caches.delete(name);
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
        if (client.url.startsWith(BASE)) client.postMessage({ type: 'VSS_OFFLINE_PROGRESS', ...status });
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
    if (command === 'ACTIVATE_UPDATE' && event.source?.url?.startsWith(BASE)) { event.waitUntil(self.skipWaiting()); return; }
    if (!['VSS_STATUS', 'VSS_START', 'VSS_PAUSE', 'VSS_BATCH'].includes(command)) return;
    // Only this app's own windows can initiate a download.
    if (!event.source?.url?.startsWith(BASE)) return;
    event.waitUntil((async () => {
        let result;
        try {
            if (command === 'VSS_START') await setWanted(true);
            if (command === 'VSS_PAUSE') await setWanted(false);
            if (command === 'VSS_BATCH') {
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
    if (url.pathname.endsWith('/')) url.pathname += 'index.html';
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
