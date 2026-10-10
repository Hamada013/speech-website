// App installation and complete-release updates.
(() => {
    const base = new URL('./', document.baseURI).href;
    const node = id => document.getElementById(id);
    const supported = window.isSecureContext && 'serviceWorker' in navigator && 'caches' in window;
    let registration, installPrompt, lastUpdateCheck = 0;
    let activatingUpdate = false;
    let installedThisSession = false;
    let downloadController, offlineCatalog;
    const bootReady = new Promise(resolve => { window.addEventListener('senb-pwa-ready', resolve, { once: true }); });
    async function getOfflineCatalog() {
        if (!offlineCatalog) {
            const response = await fetch(new URL('assets/offline-assets.json', base));
            if (!response.ok) throw new Error('Catalog unavailable');
            offlineCatalog = await response.json();
        }
        return offlineCatalog;
    }
    function showOfflineProgress(progress) {
        node('offlineProgress').max = progress.total;
        node('offlineProgress').value = progress.completed;
        node('offlineStatus').textContent = `${progress.completed} / ${progress.total} ملف · ${(progress.bytes / 1e6).toFixed(1)} / ${(progress.totalBytes / 1e6).toFixed(1)} MB`;
        if (progress.completed === progress.total) node('offlineStatus').textContent += ' · جاهز للاستخدام دون إنترنت';
    }
    function closeOfflinePanel() {
        node('offlinePanel').hidden = true;
        node('pwaDownloadToggle').setAttribute('aria-expanded', 'false');
    }
    node('pwaDownloadToggle').addEventListener('click', async () => {
        const show = node('offlinePanel').hidden;
        node('offlinePanel').hidden = !show;
        node('pwaDownloadToggle').setAttribute('aria-expanded', String(show));
        if (!show || downloadController) return;
        if (!supported) { node('offlineStatus').textContent = 'التنزيل غير متاح في هذا المتصفح. افتح التطبيق عبر HTTPS.'; return; }
        try { showOfflineProgress(await SENBOffline.inspect(await getOfflineCatalog(), base)); }
        catch { node('offlineStatus').textContent = 'تعذر قراءة قائمة الملفات. اتصل بالإنترنت وحاول مجدداً.'; }
    });
    node('offlineCloseBtn').addEventListener('click', closeOfflinePanel);
    node('offlinePauseBtn').addEventListener('click', () => downloadController?.abort());
    node('offlineDownloadBtn').disabled = !supported;
    node('offlineDownloadBtn').addEventListener('click', async () => {
        if (downloadController || !supported) return;
        downloadController = new AbortController();
        node('offlineDownloadBtn').disabled = true;
        node('offlinePauseBtn').hidden = false;
        node('pwaUpdateBtn').disabled = true;
        try {
            node('offlineStatus').textContent = 'جارٍ تجهيز التطبيق للتنزيل…';
            let readyTimeout;
            try {
                await Promise.race([bootReady, new Promise((_, reject) => { readyTimeout = setTimeout(() => reject(new Error('Service worker timeout')), 30000); })]);
            } finally { clearTimeout(readyTimeout); }
            if (!registration?.active || !navigator.serviceWorker.controller) throw new Error('Service worker not ready');
            // Persistence is best effort; browsers may still reclaim device storage.
            navigator.storage?.persist?.().catch(() => {});
            await SENBOffline.download(await getOfflineCatalog(), base, { signal: downloadController.signal, onProgress: showOfflineProgress });
        } catch (error) {
            node('offlineStatus').textContent = error.name === 'AbortError' ? 'تم الإيقاف مؤقتاً. يمكنك استكمال الملفات المتبقية.'
                : error.name === 'QuotaExceededError' ? 'المساحة غير كافية. حرّر مساحة ثم استكمل التنزيل.'
                : 'توقف التنزيل. تحقق من الاتصال ثم استكمل؛ الملفات المحفوظة لن تُنزّل مجدداً.';
        } finally {
            downloadController = null;
            node('offlineDownloadBtn').disabled = false;
            node('offlinePauseBtn').hidden = true;
            node('pwaUpdateBtn').disabled = false;
        }
    });
    function updateAvailable() {
        node('pwaUpdateBtn').hidden = !registration?.waiting;
    }
    function showInstallHelp(show) {
        node('pwaInstallHelp').hidden = !show;
        node('pwaInstallBtn').setAttribute('aria-expanded', String(show));
    }
    function syncInstalled() {
        const installed = installedThisSession || window.matchMedia('(display-mode: standalone)').matches || navigator.standalone === true;
        const button = node('pwaInstallBtn');
        button.disabled = installed;
        const label = installed ? 'التطبيق مثبت' : 'تثبيت التطبيق';
        button.setAttribute('aria-label', label);
        button.title = label;
        if (installed) showInstallHelp(false);
    }
    async function boot() {
        if (!supported) return;
        try {
            registration = await navigator.serviceWorker.getRegistration(base);
            if (registration?.scope !== base || !registration.active) {
                registration = await navigator.serviceWorker.register(new URL('sw.js', base), { scope: base, updateViaCache: 'none' });
            } else if (navigator.onLine) {
                // Reopening cached SENB must not depend on a registration fetch.
                registration.update().catch(() => {});
            }
            updateAvailable();
            registration.addEventListener('updatefound', () => {
                const worker = registration.installing;
                worker?.addEventListener('statechange', () => { if (worker.state === 'installed') updateAvailable(); });
            });
            await navigator.serviceWorker.ready;
            if (!navigator.serviceWorker.controller) await new Promise(resolve => navigator.serviceWorker.addEventListener('controllerchange', resolve, { once: true }));
        } catch { /* Installation instructions remain available. */ }
        finally { window.dispatchEvent(new Event('senb-pwa-ready')); }
    }
    node('pwaInstallBtn').addEventListener('click', async () => {
        if (installPrompt) {
            const prompt = installPrompt;
            installPrompt = null;
            showInstallHelp(false);
            try {
                await prompt.prompt();
                await prompt.userChoice;
            } catch { showInstallHelp(true); }
        } else {
            showInstallHelp(node('pwaInstallHelp').hidden);
        }
    });
    document.addEventListener('click', event => {
        if (!event.target.closest('.pwa-install-control')) showInstallHelp(false);
    });
    document.addEventListener('keydown', event => {
        if (event.key === 'Escape' && !node('pwaInstallHelp').hidden) {
            showInstallHelp(false);
            node('pwaInstallBtn').focus();
        }
    });
    node('pwaUpdateBtn').addEventListener('click', () => {
        if (!registration?.waiting) return;
        activatingUpdate = true;
        registration.waiting.postMessage({ type: 'ACTIVATE_UPDATE' });
    });
    window.addEventListener('beforeinstallprompt', event => { event.preventDefault(); installPrompt = event; });
    window.addEventListener('appinstalled', () => { installPrompt = null; installedThisSession = true; syncInstalled(); });
    navigator.serviceWorker?.addEventListener('controllerchange', () => {
        if (activatingUpdate) location.reload();
        else updateAvailable();
    });
    async function checkUpdates() {
        if (navigator.onLine && registration && Date.now() - lastUpdateCheck > 60000) {
            lastUpdateCheck = Date.now();
            try { await registration.update(); updateAvailable(); } catch { /* Offline shell remains usable. */ }
        }
    }
    window.addEventListener('online', checkUpdates);
    document.addEventListener('visibilitychange', () => { if (!document.hidden) checkUpdates(); });
    syncInstalled();
    boot();
})();
