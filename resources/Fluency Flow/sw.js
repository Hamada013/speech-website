// Retire the old Resources installation after its open sessions close.
// Do not interrupt a running practice or touch another app's cache.
self.addEventListener('activate', event => {
  event.waitUntil((async () => {
    const prefix = `fluency-flow:${self.registration.scope}:shell:`;
    for (const name of await caches.keys()) if (name.startsWith(prefix)) await caches.delete(name);
    await self.registration.unregister();
  })());
});
