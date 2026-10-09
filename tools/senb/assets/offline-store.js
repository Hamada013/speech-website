// Shared by the page and service worker. Only complete, verified media is saved.
globalThis.SENBOffline = (() => {
    function names(base) {
        const prefix = `senb:${encodeURIComponent(new URL(base).pathname)}:`;
        return { media: `${prefix}media:v1`, shellPrefix: `${prefix}shell:` };
    }
    function key(entry, base) {
        const url = new URL(entry.url, base);
        url.searchParams.set('__senb_revision', entry.revision);
        return url.href;
    }
    async function inspect(catalog, base) {
        const cache = await caches.open(names(base).media);
        const saved = new Set((await cache.keys()).map(request => request.url));
        const entries = catalog.assets.filter(entry => saved.has(key(entry, base)));
        return { count: entries.length, bytes: entries.reduce((sum, entry) => sum + entry.bytes, 0), total: catalog.assets.length, totalBytes: catalog.totalBytes };
    }
    async function fetchAndStore(entry, cache, base, signal) {
        const response = await fetch(key(entry, base), {
            cache: 'no-store', credentials: 'same-origin', signal,
            headers: { 'X-SENB-Download': '1' }
        });
        if (response.status !== 200) throw new Error(`HTTP ${response.status}: ${entry.url}`);
        const body = await response.arrayBuffer();
        const digest = await crypto.subtle.digest('SHA-256', body);
        const revision = Array.from(new Uint8Array(digest), byte => byte.toString(16).padStart(2, '0')).join('');
        if (body.byteLength !== entry.bytes || revision !== entry.revision) throw new Error(`File changed: ${entry.url}`);
        if (signal?.aborted) throw new DOMException('Paused', 'AbortError');
        const headers = new Headers(response.headers);
        for (const name of ['content-encoding', 'transfer-encoding', 'content-range']) headers.delete(name);
        headers.set('Content-Length', String(body.byteLength));
        headers.set('Accept-Ranges', 'bytes');
        const complete = new Response(body, { status: 200, headers });
        await cache.put(key(entry, base), complete.clone());
        return complete;
    }
    async function download(catalog, base, { signal, onProgress = () => {}, concurrency = 4 } = {}) {
        const cache = await caches.open(names(base).media);
        const saved = new Set((await cache.keys()).map(request => request.url));
        const missing = catalog.assets.filter(entry => !saved.has(key(entry, base)));
        const progress = await inspect(catalog, base);
        const controller = new AbortController();
        const pause = () => controller.abort();
        signal?.addEventListener('abort', pause, { once: true });
        if (signal?.aborted) pause();
        let cursor = 0, failure;
        onProgress({ ...progress });
        async function worker() {
            while (!controller.signal.aborted && cursor < missing.length) {
                const entry = missing[cursor++];
                try {
                    await fetchAndStore(entry, cache, base, controller.signal);
                    progress.count++; progress.bytes += entry.bytes;
                    onProgress({ ...progress });
                } catch (error) {
                    if (!controller.signal.aborted) { failure = error; controller.abort(); }
                }
            }
        }
        try { await Promise.all(Array.from({ length: Math.min(concurrency, missing.length) }, worker)); }
        finally { signal?.removeEventListener('abort', pause); }
        if (failure) throw failure;
        return { ...progress, paused: Boolean(signal?.aborted) };
    }
    async function rangeResponse(request, response) {
        const range = request.headers.get('Range');
        if (!range) return response;
        const body = await response.arrayBuffer();
        const size = body.byteLength;
        const match = /^bytes=(\d*)-(\d*)$/.exec(range.trim());
        const headers = new Headers(response.headers);
        headers.set('Accept-Ranges', 'bytes');
        const invalid = () => {
            headers.set('Content-Range', `bytes */${size}`);
            headers.set('Content-Length', '0');
            return new Response(null, { status: 416, headers });
        };
        if (!match || (!match[1] && !match[2])) return invalid();
        const suffix = !match[1];
        const start = suffix ? Math.max(0, size - Number(match[2])) : Number(match[1]);
        const end = suffix || !match[2] ? size - 1 : Math.min(Number(match[2]), size - 1);
        if (start >= size || start > end || (suffix && !Number(match[2]))) return invalid();
        headers.set('Content-Range', `bytes ${start}-${end}/${size}`);
        headers.set('Content-Length', String(end - start + 1));
        return new Response(body.slice(start, end + 1), { status: 206, headers });
    }
    return { names, key, inspect, fetchAndStore, download, rangeResponse };
})();
