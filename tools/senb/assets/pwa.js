// Installation and a resumable, foreground download of the supplied media.
(() => {
    const base = new URL('./', document.baseURI).href;
    const node = id => document.getElementById(id);
    const supported = window.isSecureContext && 'serviceWorker' in navigator && 'caches' in window;
    let registration, catalog, installPrompt, downloadController, ready, progress, lastUpdateCheck = 0;
    let activatingUpdate = false;
    let installedThisSession = false;
    const mb = bytes => `${(bytes / 1e6).toFixed(1)} MB`;
    const status = message => { node('offlineStatus').textContent = message; };
    function showProgress(value) {
        progress = value;
        node('offlineProgress').max = value.totalBytes || 1;
        node('offlineProgress').value = value.bytes;
        node('offlineProgress').setAttribute('aria-valuetext', `${value.count} من ${value.total}`);
        node('offlineCounts').textContent = `${value.count} / ${value.total} ملف · ${mb(value.bytes)} / ${mb(value.totalBytes)}`;
        const complete = value.count === value.total;
        node('offlineBadge').textContent = complete ? 'الصور والأصوات محفوظة على الجهاز ✓' : value.count ? `${value.count} ملف محفوظ على الجهاز` : 'احفظ الصور والأصوات لاستخدامها دون اتصال';
        if (!downloadController) {
            node('offlineDownloadBtn').disabled = complete;
            node('offlineDownloadBtn').textContent = complete ? 'اكتمل الحفظ ✓' : value.count ? 'استكمال التنزيل' : 'تنزيل الصور والأصوات';
        }
    }
    function updateAvailable() {
        node('pwaUpdateBtn').hidden = !registration?.waiting;
    }
    function syncInstalled() {
        const installed = installedThisSession || window.matchMedia('(display-mode: standalone)').matches || navigator.standalone === true;
        node('pwaInstallBtn').disabled = installed;
        node('pwaInstallBtn').querySelector('span').textContent = installed ? 'التطبيق مثبت ✓' : 'تثبيت التطبيق';
    }
    async function boot() {
        if (!supported) {
            node('offlineDownloadBtn').disabled = true;
            status('التنزيل على الجهاز يحتاج فتح الموقع عبر HTTPS في متصفح يدعم هذه الميزة.');
            return false;
        }
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
            await Promise.race([
                navigator.serviceWorker.ready,
                new Promise((_, reject) => setTimeout(() => reject(new Error('Service worker timeout')), 15000))
            ]);
            const response = await fetch(new URL('assets/offline-assets.json', base));
            if (!response.ok) throw new Error('Catalog unavailable');
            catalog = await response.json();
            node('offlineSize').textContent = `${catalog.assets.length} ملف · حوالي ${mb(catalog.totalBytes)}`;
            showProgress(await SENBOffline.inspect(catalog, base));
            status(progress.count === progress.total ? 'جاهز. يمكنك استخدام الملفات المحفوظة دون اتصال.' : 'يمكنك إيقاف التنزيل واستكماله لاحقاً. اترك التطبيق مفتوحاً حتى يكتمل.');
            node('offlineDownloadBtn').disabled = progress.count === progress.total;
            return true;
        } catch {
            status('تعذر تجهيز الحفظ على الجهاز. تحقق من الاتصال واضغط للمحاولة مجدداً.');
            node('offlineDownloadBtn').disabled = false;
            return false;
        }
    }
    async function download() {
        if (downloadController) { downloadController.abort(); return; }
        // Lock immediately while initialization awaits, including rapid taps.
        node('offlineDownloadBtn').disabled = true;
        if (!await ready) {
            ready = boot();
            if (!await ready) return;
        }
        if (!navigator.onLine) {
            status('اتصل بالإنترنت لاستكمال تنزيل الملفات المتبقية.');
            node('offlineDownloadBtn').disabled = false;
            return;
        }
        downloadController = new AbortController();
        node('offlineDownloadBtn').disabled = false;
        node('offlineDownloadBtn').textContent = 'إيقاف التنزيل مؤقتاً';
        node('pwaUpdateBtn').disabled = true;
        status('جارٍ حفظ الصور والأصوات… اترك التطبيق مفتوحاً.');
        try {
            // Requested from the user's download action; the browser decides.
            navigator.storage?.persist?.().catch(() => {});
            const result = await SENBOffline.download(catalog, base, { signal: downloadController.signal, onProgress: showProgress });
            status(result.count === result.total ? 'اكتمل حفظ الصور والأصوات على هذا الجهاز ✓' : 'تم الإيقاف. الملفات المكتملة محفوظة ويمكن استكمال الباقي.');
        } catch (error) {
            status(error.name === 'QuotaExceededError'
                ? 'مساحة التخزين غير كافية. حرّر مساحة على الجهاز ثم استكمل التنزيل.'
                : 'توقف التنزيل بسبب الاتصال أو تحديث الملفات. الملفات المكتملة محفوظة؛ اضغط لاستكمال الباقي.');
        } finally {
            downloadController = null;
            node('pwaUpdateBtn').disabled = false;
            showProgress(await SENBOffline.inspect(catalog, base));
        }
    }
    node('pwaDownloadToggle').addEventListener('click', async () => {
        const panel = node('offlinePanel');
        panel.hidden = !panel.hidden;
        node('pwaDownloadToggle').setAttribute('aria-expanded', String(!panel.hidden));
        if (!panel.hidden) {
            node('offlineHeading').focus({ preventScroll: true });
            if (catalog && !downloadController) showProgress(await SENBOffline.inspect(catalog, base));
        }
    });
    node('offlineDownloadBtn').addEventListener('click', download);
    node('pwaInstallBtn').addEventListener('click', async () => {
        if (installPrompt) {
            const prompt = installPrompt;
            installPrompt = null;
            await prompt.prompt();
            await prompt.userChoice;
        } else {
            node('pwaInstallHelp').hidden = !node('pwaInstallHelp').hidden;
        }
    });
    node('pwaUpdateBtn').addEventListener('click', () => {
        if (!registration?.waiting || downloadController) return;
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
    ready = boot();
})();
