// One download action and opt-in updates for the complete cached release.
(() => {
    const base = new URL('./', document.baseURI).href;
    const node = id => document.getElementById(id);
    const supported = window.isSecureContext && 'serviceWorker' in navigator && 'caches' in window;
    let registration, downloadController, offlineCatalog;
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
        node('offlineDownloadBtn').setAttribute('aria-busy', 'true');
        node('offlineError').hidden = true;
        window.AppUpdates.setBusy(true);
        try {
            if (!await boot()) throw new Error('Service worker not ready');
            navigator.storage?.persist?.().catch(() => {});
            await SENBOffline.download(await getOfflineCatalog(), base, { signal: downloadController.signal, onProgress: showOfflineProgress });
        } catch (error) {
            showError(error.name === 'QuotaExceededError' ? 'المساحة غير كافية. حرّر مساحة ثم استكمل التنزيل.' : 'توقف التنزيل. تحقق من الاتصال ثم حاول مجدداً.');
        } finally {
            downloadController = null;
            node('offlineDownloadBtn').disabled = false;
            node('offlineDownloadBtn').setAttribute('aria-busy', 'false');
            window.AppUpdates.setBusy(false);
        }
    });
    async function boot() {
        if (!supported) return false;
        try {
            if (registration?.active?.state !== 'activated') registration = await window.AppUpdates.ready({ buttonId: 'pwaUpdateBtn' });
            return true;
        } catch { showError('تعذر تجهيز التطبيق دون اتصال. تحقق من الاتصال ثم أعد المحاولة.'); return false; }
        finally { window.dispatchEvent(new Event('senb-pwa-ready')); }
    }
    window.addEventListener('beforeinstallprompt', event => event.preventDefault());
    void boot();
})();
