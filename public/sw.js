const CACHE_NAME = 'digital-diary-v1';
const RUNTIME_CACHE = 'digital-diary-runtime';

// Assets to cache on install
const PRECACHE_ASSETS = [
    '/',
    '/login',
    '/dashboard',
    '/offline',
    '/manifest.json',
    '/icons/icon-192x192.png',
    '/icons/icon-512x512.png',
];

// Install event - cache essential assets
self.addEventListener('install', (event) => {
    event.waitUntil(
        caches.open(CACHE_NAME).then((cache) => {
            return cache.addAll(PRECACHE_ASSETS);
        })
    );
    self.skipWaiting();
});

// Activate event - clean up old caches
self.addEventListener('activate', (event) => {
    event.waitUntil(
        caches.keys().then((cacheNames) => {
            return Promise.all(
                cacheNames
                    .filter((name) => name !== CACHE_NAME && name !== RUNTIME_CACHE)
                    .map((name) => caches.delete(name))
            );
        })
    );
    self.clients.claim();
});

// Fetch event - network first, fallback to cache
self.addEventListener('fetch', (event) => {
    const { request } = event;
    const url = new URL(request.url);

    // Skip cross-origin requests
    if (url.origin !== self.location.origin) {
        return;
    }

    // API requests - network only
    if (url.pathname.startsWith('/api/')) {
        event.respondWith(
            fetch(request).catch(() => {
                return new Response(
                    JSON.stringify({ error: 'Offline', offline: true }),
                    { headers: { 'Content-Type': 'application/json' } }
                );
            })
        );
        return;
    }

    // For navigation requests
    if (request.mode === 'navigate') {
        event.respondWith(
            fetch(request)
                .then((response) => {
                    // Clone and cache the response
                    const responseClone = response.clone();
                    caches.open(RUNTIME_CACHE).then((cache) => {
                        cache.put(request, responseClone);
                    });
                    return response;
                })
                .catch(() => {
                    // Try to get from cache
                    caches.match('/offline');
                    // return caches.match(request).then((cachedResponse) => {
                    //     if (cachedResponse) {
                    //         return cachedResponse;
                    //     }
                    //     // Fallback to offline page
                    //     return caches.match('/offline');
                    // });
                })
        );
        return;
    }

    // For all other requests - cache first, then network
    event.respondWith(
        caches.match(request).then((cachedResponse) => {
            if (cachedResponse) {
                // Return cached version and update in background
                event.waitUntil(
                    fetch(request).then((response) => {
                        caches.open(RUNTIME_CACHE).then((cache) => {
                            cache.put(request, response);
                        });
                    })
                );
                return cachedResponse;
            }

            // Not in cache, fetch from network
            return fetch(request)
                .then((response) => {
                    // Cache the new response
                    const responseClone = response.clone();
                    caches.open(RUNTIME_CACHE).then((cache) => {
                        cache.put(request, responseClone);
                    });
                    return response;
                })
                .catch(() => {
                    // If it's an image, return a placeholder
                    if (request.destination === 'image') {
                        return new Response(
                            '<svg xmlns="http://www.w3.org/2000/svg" width="200" height="200"><rect width="200" height="200" fill="#e5e7eb"/></svg>',
                            { headers: { 'Content-Type': 'image/svg+xml' } }
                        );
                    }
                });
        })
    );
});

// Background sync for prayer entries
self.addEventListener('sync', (event) => {
    if (event.tag === 'sync-prayers') {
        event.waitUntil(syncPrayers());
    }
});

async function syncPrayers() {
    try {
        // Get pending prayers from IndexedDB and sync
        const response = await fetch('/api/prayers/sync', {
            method: 'POST',
        });
        return response;
    } catch (error) {
        console.error('Sync failed:', error);
        throw error;
    }
}

// Push notifications
self.addEventListener('push', (event) => {
    const data = event.data ? event.data.json() : {};
    const options = {
        body: data.body || 'Time for prayer',
        icon: '/icons/icon-192x192.png',
        badge: '/icons/icon-72x72.png',
        vibrate: [200, 100, 200],
        data: data,
        actions: [
            { action: 'mark-prayed', title: 'Mark as Prayed' },
            { action: 'snooze', title: 'Remind Later' },
        ],
    };

    event.waitUntil(
        self.registration.showNotification(data.title || 'Prayer Time', options)
    );
});

// Notification click handler
self.addEventListener('notificationclick', (event) => {
    event.notification.close();

    if (event.action === 'mark-prayed') {
        event.waitUntil(
            clients.openWindow('/dashboard?action=mark-prayed')
        );
    } else if (event.action === 'snooze') {
        // Handle snooze
    } else {
        event.waitUntil(
            clients.openWindow('/dashboard')
        );
    }
});