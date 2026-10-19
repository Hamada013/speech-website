/* Local copy shared by VOC, SENB and Taffaha. Updates are offered only after
   the complete new shell has installed; the current release keeps working. */
(() => {
    let registration, settings, dialog, accept, later, offeredWorker;
    let busy = false, reloading = false, controlled = false, lastCheck = 0;
    function showAvailable() {
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
            if (controlled && !reloading) { reloading = true; location.reload(); }
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
    window.AppUpdates = { watch, setBusy(value) { busy = value; if (accept) accept.disabled = value; } };
})();
