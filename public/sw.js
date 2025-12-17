const CACHE_NAME = "digital-diary-v1";
const RUNTIME_CACHE = "digital-diary-runtime";

// Assets to cache on install
const PRECACHE_ASSETS = [
    "/",
    "/login",
    "/dashboard",
    "/offline",
    "/manifest.json",
    "/icons/icon-192x192.png"
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
                    .filter((k) => k !== CACHE_NAME && k !== RUNTIME_CACHE)
                    .map((k) => caches.delete(k))
            )
        )
    );
    self.clients.claim();
});


// ------------------------
self.addEventListener("fetch", (event) => {
    const {request} = event;
    const url = new URL(request.url);

    // Ignore cross-origin
    if (url.origin !== self.location.origin) return;

    // API → network only
    if (url.pathname.startsWith("/api/")) {
        event.respondWith(
            fetch(request).catch(() => {
                return new Response(
                    JSON.stringify({error: "Offline", offline: true}),
                    {headers: {"Content-Type": "application/json"}}
                );
            })
        );
        return;
    }

    // ------------------------------------------------------------
    // NAVIGATION REQUESTS (Fixes Next.js Server Error when offline)
    // ------------------------------------------------------------
    if (request.mode === "navigate") {
        event.respondWith(
            (async () => {
                try {
                    // Try network first
                    const networkResponse = await fetch(request);

                    // Save fresh version in background
                    const cache = await caches.open(RUNTIME_CACHE);
                    cache.put(request, networkResponse.clone());

                    return networkResponse;
                } catch (err) {
                    // If offline → return offline page
                    const offlinePage = await caches.match("/offline");
                    if (offlinePage) return offlinePage;

                    // Safety fallback
                    return new Response(
                        "<h1>You Are Offline</h1><p>No cached version available.</p>",
                        {headers: {"Content-Type": "text/html"}}
                    );
                }
            })()
        );
    }

});
// ------------------------------------------------------------
// OTHER STATIC FILES → Cache First
// ------------------------------------------------------------
event.respondWith(
    caches.match(request).then((cached) => {
        if (cached) return cached;

        return fetch(request)
            .then((response) => {
                const clone = response.clone();
                caches.open(RUNTIME_CACHE).then((cache) => cache.put(request, clone));
                return response;
            })
            .catch(() => {
                // Image placeholder if offline
                if (request.destination === "image") {
                    return new Response(
                        `<svg xmlns="http://www.w3.org/2000/svg" width="200" height="200">
                                <rect width="200" height="200" fill="#e5e7eb"/>
                             </svg>`,
                        { headers: { "Content-Type": "image/svg+xml" } }
                    );
                }
            });
    })
)

// ------------------------
// BACKGROUND SYNC
// ------------------------
self.addEventListener("sync", (event) => {
    if (event.tag === "sync-prayers") {
        event.waitUntil(syncPrayers());
    }
});

async function syncPrayers() {
    try {
        const response = await fetch("/api/prayers/sync", { method: "POST" });
        return response;
    } catch (err) {
        console.error("Sync failed:", err);
        throw err;
    }
}
