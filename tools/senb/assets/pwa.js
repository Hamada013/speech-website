// One download action and opt-in updates for the complete cached release.
(() => {
    const base = new URL('./', document.baseURI).href;
    const node = id => document.getElementById(id);
    const supported = window.isSecureContext && 'serviceWorker' in navigator && 'caches' in window;
    let registration, downloadController, offlineCatalog;
    const bootReady = new Promise(resolve => window.addEventListener('senb-pwa-ready', resolve, { once: true }));
    async function getOfflineCatalog() {
        if (!offlineCatalog) {
            const response = await fetch(new URL('assets/offline-assets.json', base));
            if (!response.ok) throw new Error('Catalog unavailable');
            offlineCatalog = await response.json();
        }
        return offlineCatalog;
    }
    function showError(message) {
        node('offlineError').textContent = message;
        node('offlineError').hidden = false;
    }
    function showOfflineProgress(progress) {
        const percent = progress.total ? Math.min(100, Math.floor(progress.completed / progress.total * 100)) : 0;
        node('offlineProgress').max = 100;
        node('offlineProgress').value = percent;
        node('offlineStatus').textContent = `${percent}%`;
        node('offlineError').hidden = true;
    }
    node('pwaDownloadToggle').addEventListener('click', async () => {
        if (!node('offlinePanel').open) node('offlinePanel').showModal();
        if (downloadController) return;
        if (!supported) { showError('التنزيل غير متاح في هذا المتصفح. افتح التطبيق عبر HTTPS.'); return; }
        try { showOfflineProgress(await SENBOffline.inspect(await getOfflineCatalog(), base)); }
        catch { showError('تعذر قراءة قائمة الملفات. اتصل بالإنترنت وحاول مجدداً.'); }
    });
    node('offlinePanel').addEventListener('click', event => {
        const panel = node('offlinePanel'), box = panel.getBoundingClientRect();
        if (event.target === panel && (event.clientX < box.left || event.clientX > box.right || event.clientY < box.top || event.clientY > box.bottom)) panel.close();
    });
    node('offlineDownloadBtn').disabled = !supported;
    node('offlineDownloadBtn').addEventListener('click', async () => {
        if (downloadController || !supported) return;
        downloadController = new AbortController();
        node('offlineDownloadBtn').disabled = true;
        node('offlineError').hidden = true;
        window.AppUpdates.setBusy(true);
        try {
            let readyTimeout;
            try {
                await Promise.race([bootReady, new Promise((_, reject) => { readyTimeout = setTimeout(() => reject(new Error('Service worker timeout')), 30000); })]);
            } finally { clearTimeout(readyTimeout); }
            if (!registration?.active || !navigator.serviceWorker.controller) throw new Error('Service worker not ready');
            navigator.storage?.persist?.().catch(() => {});
            await SENBOffline.download(await getOfflineCatalog(), base, { signal: downloadController.signal, onProgress: showOfflineProgress });
        } catch (error) {
            showError(error.name === 'QuotaExceededError' ? 'المساحة غير كافية. حرّر مساحة ثم استكمل التنزيل.' : 'توقف التنزيل. تحقق من الاتصال ثم حاول مجدداً.');
        } finally {
            downloadController = null;
            node('offlineDownloadBtn').disabled = false;
            window.AppUpdates.setBusy(false);
        }
    });
    async function boot() {
        if (!supported) return;
        try {
            registration = await navigator.serviceWorker.getRegistration(base);
            if (registration?.scope !== base || !registration.active) {
                registration = await navigator.serviceWorker.register(new URL('sw.js', base), { scope: base, updateViaCache: 'none' });
            }
            window.AppUpdates.watch(registration, { buttonId: 'pwaUpdateBtn' });
            await navigator.serviceWorker.ready;
            if (!navigator.serviceWorker.controller) await new Promise(resolve => navigator.serviceWorker.addEventListener('controllerchange', resolve, { once: true }));
        } catch { /* The current cached app remains usable. */ }
        finally { window.dispatchEvent(new Event('senb-pwa-ready')); }
    }
    window.addEventListener('beforeinstallprompt', event => event.preventDefault());
    void boot();
})();
