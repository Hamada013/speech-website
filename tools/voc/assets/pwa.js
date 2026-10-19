/* Shared by every app page. The visible page drives short worker batches;
 * Cache Storage is the source of truth after navigation or worker termination. */
(() => {
    'use strict';
    const card = document.querySelector('[data-offline-card]');
    const statusText = card?.querySelector('[data-offline-status]');
    const progress = card?.querySelector('progress');
    const button = card?.querySelector('[data-offline-download]');
    const downloadToggle = document.querySelector('[data-open-download]');
    const dialog = document.querySelector('[data-offline-dialog]');
    const errorText = card?.querySelector('[data-offline-error]');
    downloadToggle?.addEventListener('click', () => { if (!dialog.open) dialog.showModal(); void sync(); });
    dialog?.addEventListener('click', event => { if (event.target === dialog && (event.clientX < dialog.getBoundingClientRect().left || event.clientX > dialog.getBoundingClientRect().right || event.clientY < dialog.getBoundingClientRect().top || event.clientY > dialog.getBoundingClientRect().bottom)) dialog.close(); });
    let registration;
    let status;
    let running = false;
    let fault = false;

    function showError(message) {
        fault = true;
        if (!card) return;
        card.dataset.state = 'error';
        errorText.textContent = message;
        errorText.hidden = false;
        button.disabled = false;
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
        errorText.hidden = true;
        const percent = status.total ? Math.min(100, Math.floor(status.done / status.total * 100)) : 0;
        progress.max = 100;
        progress.value = percent;
        progress.setAttribute('aria-valuetext', `${percent}%`);
        statusText.textContent = `${percent}%`;
        card.dataset.state = status.ready ? 'ready' : status.wanted ? 'downloading' : 'idle';
        button.disabled = status.ready || running || (status.wanted && navigator.onLine);
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
        window.AppUpdates.setBusy(true);
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
            window.AppUpdates.setBusy(false);
            if (button) button.disabled = !fault && !!status?.ready;
        }
    }

    async function sync() {
        if (!worker() || running) return;
        try { render(await send('VOC_STATUS')); void pump(); }
        catch { showError('تعذر التحقق من الملفات. اضغط إعادة المحاولة.'); }
    }

    window.addEventListener('beforeinstallprompt', event => event.preventDefault());
    button?.addEventListener('click', async () => {
        if (running) return;
        button.disabled = true;
        try {
            if (!registration?.active) await initialize();
            if (!registration?.active) return;
            try { void navigator.storage?.persist?.()?.catch(() => {}); } catch {}
            render(await send('VOC_START'));
            void pump();
        } catch {
            showError('تعذر بدء التنزيل. تحقق من الاتصال ثم أعد المحاولة.');
        }
    });

    async function initialize() {
        if (!('serviceWorker' in navigator) || !window.isSecureContext) {
            showError('يتطلب التنزيل دون اتصال فتح التطبيق عبر HTTPS أو localhost.');
            if (button) button.disabled = true;
            return;
        }
        try {
            registration = await navigator.serviceWorker.register('./sw.js', { scope: './', updateViaCache: 'none' });
            window.AppUpdates.watch(registration);
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
