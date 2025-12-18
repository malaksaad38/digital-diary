const CACHE_VERSION = "v3";
const STATIC_CACHE = `digital-diary-static-${CACHE_VERSION}`;
const RUNTIME_CACHE = `digital-diary-runtime-${CACHE_VERSION}`;

// ------------------------
// PRECACHE (only app shell)
// ------------------------
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
        caches.open(STATIC_CACHE).then((cache) => cache.addAll(PRECACHE_ASSETS))
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
                    .filter(
                        (key) => key !== STATIC_CACHE && key !== RUNTIME_CACHE
                    )
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
    const { request } = event;

    if (request.method !== "GET") return;
    if (!request.url.startsWith(self.location.origin)) return;

    const url = new URL(request.url);

    // ------------------------
    // API → STALE WHILE REVALIDATE
    // ------------------------
    if (url.pathname.startsWith("/api/")) {
        event.respondWith(staleWhileRevalidate(request));
        return;
    }

    // ------------------------
    // Navigation → NETWORK FIRST
    // ------------------------
    if (request.mode === "navigate") {
        event.respondWith(networkFirst(request));
        return;
    }

    // ------------------------
    // Static Assets → CACHE FIRST
    // ------------------------
    event.respondWith(cacheFirst(request));
});

// ========================
// STRATEGIES
// ========================

// 🔁 Stale While Revalidate (BEST for prayer times & diary)
async function staleWhileRevalidate(request) {
    const cache = await caches.open(RUNTIME_CACHE);
    const cached = await cache.match(request);

    const networkFetch = fetch(request)
        .then((response) => {
            // Only update cache if response is valid
            if (response && response.status === 200) {
                cache.put(request, response.clone());
            }
            return response;
        })
        .catch(() => cached);

    return cached || networkFetch;
}

// 🌐 Network First (HTML pages)
async function networkFirst(request) {
    const cache = await caches.open(RUNTIME_CACHE);

    try {
        const response = await fetch(request);
        cache.put(request, response.clone());
        return response;
    } catch {
        return cache.match(request) || cache.match("/");
    }
}

// 📦 Cache First (CSS, JS, Images)
async function cacheFirst(request) {
    const cache = await caches.open(STATIC_CACHE);
    const cached = await cache.match(request);

    if (cached) return cached;

    const response = await fetch(request);
    cache.put(request, response.clone());
    return response;
}
