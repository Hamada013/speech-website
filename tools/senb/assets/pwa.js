// App installation and complete-release updates.
(() => {
    const base = new URL('./', document.baseURI).href;
    const node = id => document.getElementById(id);
    const supported = window.isSecureContext && 'serviceWorker' in navigator && 'caches' in window;
    let registration, installPrompt, lastUpdateCheck = 0;
    let activatingUpdate = false;
    let installedThisSession = false;
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
        } catch { /* Installation instructions remain available. */ }
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
