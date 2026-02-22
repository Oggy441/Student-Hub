// Service Worker — network-first strategy for a Capacitor app.
// In a packaged APK, all assets come from the local bundle, so the SW
// should ALWAYS let the network (local bundle) win; never serve stale cache.

// Delete all old caches on activation so every new build starts fresh.
self.addEventListener('activate', event => {
    event.waitUntil(
        caches.keys().then(keys =>
            Promise.all(keys.map(key => caches.delete(key)))
        ).then(() => self.clients.claim())
    );
});

// Network-first: try the bundle / network, only fall back to cache if offline.
self.addEventListener('fetch', event => {
    event.respondWith(
        fetch(event.request)
            .catch(() => caches.match(event.request))
    );
});
