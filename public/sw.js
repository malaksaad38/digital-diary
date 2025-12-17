const CACHE_NAME = "digital-diary-v1";

// Files to cache
const PRECACHE_ASSETS = [
    "/",
    "/login",
    "/dashboard",
    "/manifest.json",
    "/icons/icon-192x192.png",
];

// ------------------------
// INSTALL
// ------------------------
self.addEventListener("install", (event) => {
    event.waitUntil(
        caches.open(CACHE_NAME).then((cache) => cache.addAll(PRECACHE_ASSETS))
    );
    self.skipWaiting();
});

// ------------------------
// ACTIVATE
// ------------------------
self.addEventListener("activate", (event) => {
    event.waitUntil(
        caches.keys().then((keys) =>
            Promise.all(
                keys.filter((key) => key !== CACHE_NAME).map((key) => caches.delete(key))
            )
        )
    );
    self.clients.claim();
});

// ------------------------
// FETCH
// ------------------------
self.addEventListener("fetch", (event) => {
    const { request } = event;

    // Ignore non-GET requests
    if (request.method !== "GET") return;

    // Ignore cross-origin
    if (!request.url.startsWith(self.location.origin)) return;

    // ------------------------
    // NAVIGATION (pages)
    // Network → Cache → Fallback
    // ------------------------
    if (request.mode === "navigate") {
        event.respondWith(
            fetch(request)
                .then((response) => {
                    const clone = response.clone();
                    caches.open(CACHE_NAME).then((cache) => cache.put(request, clone));
                    return response;
                })
                .catch(() => caches.match(request) || caches.match("/"))
        );
        return;
    }

    // ------------------------
    // STATIC FILES
    // Cache → Network
    // ------------------------
    event.respondWith(
        caches.match(request).then((cached) => {
            return (
                cached ||
                fetch(request).then((response) => {
                    const clone = response.clone();
                    caches.open(CACHE_NAME).then((cache) => cache.put(request, clone));
                    return response;
                })
            );
        })
    );
});
