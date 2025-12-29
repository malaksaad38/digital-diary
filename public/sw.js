const CACHE_NAME = "digital-diary-v2"; // Increment version to update old caches

// Files to pre-cache
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
                keys
                    .filter((key) => key !== CACHE_NAME)
                    .map((key) => caches.delete(key))
            )
        )
    );
    self.clients.claim();
});

// ------------------------
// FETCH
// ------------------------
self.addEventListener("fetch", (event) => {
    const {request} = event;

    // Only handle GET requests
    if (request.method !== "GET") return;

    // Only handle same-origin requests
    if (!request.url.startsWith(self.location.origin)) return;

    const url = new URL(request.url);

    // ------------------------
    // API requests (dynamic data)
    // Network first → update cache → fallback
    // ------------------------
    if (url.pathname.startsWith("/api/")) {
        event.respondWith(
            fetch(request)
                .then((response) => {
                    // Update cache
                    const clone = response.clone();
                    caches.open(CACHE_NAME).then((cache) => cache.put(request, clone));
                    return response;
                })
                .catch(() => caches.match(request))
        );
        return;
    }

    // ------------------------
    // Navigation requests (HTML pages)
    // Network first → cache → fallback to home page
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
    // Static assets
    // Cache first → network fallback → update cache
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
