/* Local copy shared by VOC, SENB and Taffaha. Updates are offered only after
   the complete new shell has installed; the current release keeps working. */
(() => {
    let registration, settings, dialog, accept, later, offeredWorker;
    let busy = false, reloading = false, controlled = false, lastCheck = 0;
    let preparing;
    // Wait for this app's worker, including a first install. Unlike the global
    // serviceWorker.ready promise, a failed shell install rejects and can retry.
    async function ready(options = {}) {
        if (preparing) return preparing;
        preparing = (async () => {
            const base = new URL('./', document.baseURI);
            const next = await navigator.serviceWorker.register(new URL('sw.js', base), { scope: base.href, updateViaCache: 'none' });
            await new Promise((resolve, reject) => {
                const workers = new Set();
                const finish = error => {
                    clearTimeout(timer);
                    next.removeEventListener('updatefound', check);
                    navigator.serviceWorker.removeEventListener('controllerchange', check);
                    for (const worker of workers) worker.removeEventListener('statechange', check);
                    error ? reject(error) : resolve();
                };
                const check = () => {
                    for (const worker of [next.installing, next.waiting, next.active].filter(Boolean)) {
                        if (!workers.has(worker)) { workers.add(worker); worker.addEventListener('statechange', check); }
                    }
                    // Safari can keep the claimed worker in "activating" while
                    // its new page opens. It can already serve requests then.
                    const active=next.active,claimed=active?.state==='activating'&&navigator.serviceWorker.controller===active;
                    if (active?.state === 'activated' || claimed) finish();
                    else if ([...workers].some(worker => worker.state === 'redundant') && (!next.installing || next.installing.state === 'redundant')) finish(new Error('Offline installation failed'));
                };
                const timer = setTimeout(() => finish(new Error('Offline installation timed out')), 45000);
                next.addEventListener('updatefound', check);
                navigator.serviceWorker.addEventListener('controllerchange', check);
                check();
            });
            watch(next, options);
            return next;
        })();
        try { return await preparing; }
        catch { throw new Error('تعذر تجهيز التطبيق دون اتصال. تحقق من الاتصال ثم أعد المحاولة.'); }
        finally { preparing = null; }
    }
    function showAvailable() {
        if (window.SuiteWelcome?.pending) return;
        const waiting = registration?.waiting;
        if (!controlled || !registration.active || !waiting || waiting === registration.active || waiting === offeredWorker) return;
        offeredWorker = waiting;
        dialog.hidden = false;
        if (!dialog.open) dialog.showModal();
    }
    async function check() {
        if (!registration || document.hidden || !navigator.onLine || Date.now() - lastCheck < 60000) return;
        lastCheck = Date.now();
        try { await registration.update(); showAvailable(); } catch { /* Keep the cached app usable offline. */ }
    }
    function watchWorker(worker) {
        worker?.addEventListener('statechange', () => {
            if (worker.state === 'installed') setTimeout(showAvailable, 0);
        });
    }
    function watch(next, options = {}) {
        if (registration) return;
        registration = next;
        settings = options;
        controlled = !!navigator.serviceWorker.controller && navigator.serviceWorker.controller.scriptURL === new URL('sw.js', document.baseURI).href;
        dialog = document.createElement('dialog');
        dialog.className = 'app-update-dialog';
        dialog.id = options.dialogId || 'app-update-dialog';
        dialog.hidden = true;
        dialog.setAttribute('aria-labelledby', 'app-update-title');
        dialog.setAttribute('aria-describedby', 'app-update-message');
        dialog.innerHTML = '<h2 id="app-update-title">تحديث جديد</h2><p id="app-update-message">يتوفر إصدار جديد من التطبيق. هل تريد التحديث الآن؟</p><div class="app-update-actions"><button type="button" data-update-accept>تحديث الآن</button><button type="button" data-update-later>لاحقًا</button></div>';
        document.body.append(dialog);
        accept = dialog.querySelector('[data-update-accept]');
        accept.id = options.buttonId || 'apply-app-update';
        later = dialog.querySelector('[data-update-later]');
        accept.disabled = busy;
        later.addEventListener('click', () => dialog.close());
        dialog.addEventListener('close', () => { dialog.hidden = true; });
        accept.addEventListener('click', () => {
            if (busy || !registration.waiting) return;
            accept.disabled = true;
            later.disabled = true;
            registration.waiting.postMessage({ type: settings.command || 'ACTIVATE_UPDATE' });
        });
        navigator.serviceWorker.addEventListener('controllerchange', () => {
            const ours = navigator.serviceWorker.controller?.scriptURL === new URL('sw.js', document.baseURI).href;
            if (!ours) return;
            // Every open window reloads together after one accepts the update.
            if (controlled && !reloading) { reloading = true; window.SuiteWelcome?.skipNextLoad(); location.reload(); }
            else { controlled = true; options.onFirstControl?.(); showAvailable(); }
        });
        registration.addEventListener('updatefound', () => watchWorker(registration.installing));
        watchWorker(registration.installing);
        showAvailable();
        window.addEventListener('online', check);
        window.addEventListener('pageshow', check);
        document.addEventListener('visibilitychange', () => { if (!document.hidden) void check(); });
        setInterval(check, 5 * 60 * 1000);
        if (controlled) void check();
    }
    window.addEventListener('suite-welcome-done', showAvailable);
    window.AppUpdates = { watch, ready, setBusy(value) { busy = value; if (accept) accept.disabled = value; } };
})();
