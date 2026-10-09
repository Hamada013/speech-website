// Service-worker media cache. Only complete, verified responses are saved.
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
    async function fetchAndStore(entry, cache, base) {
        const response = await fetch(key(entry, base), {
            cache: 'no-store', credentials: 'same-origin'
        });
        if (response.status !== 200) throw new Error(`HTTP ${response.status}: ${entry.url}`);
        const body = await response.arrayBuffer();
        const digest = await crypto.subtle.digest('SHA-256', body);
        const revision = Array.from(new Uint8Array(digest), byte => byte.toString(16).padStart(2, '0')).join('');
        if (body.byteLength !== entry.bytes || revision !== entry.revision) throw new Error(`File changed: ${entry.url}`);
        const headers = new Headers(response.headers);
        for (const name of ['content-encoding', 'transfer-encoding', 'content-range']) headers.delete(name);
        headers.set('Content-Length', String(body.byteLength));
        headers.set('Accept-Ranges', 'bytes');
        const complete = new Response(body, { status: 200, headers });
        await cache.put(key(entry, base), complete.clone());
        return complete;
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
    return { names, key, fetchAndStore, rangeResponse };
})();
