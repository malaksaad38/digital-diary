const CACHE_NAME = "digital-diary-v1";
const RUNTIME_CACHE = "digital-diary-runtime";

// Assets to cache on install
const PRECACHE_ASSETS = [
    "/",
    "/login",
    "/dashboard",
    "/offline",
    "/manifest.json",
    "/icons/icon-192x192.png",
    "/icons/icon-512x512.png"
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
// FETCH HANDLING
// MOST IMPORTANT PART
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
        return;
    }

});

async function syncPrayers() {
    try {
        const response = await fetch("/api/prayers/sync", {method: "POST"});
        return response;
    } catch (err) {
        console.error("Sync failed:", err);
        throw err;
    }
}


// ------------------------
// PUSH NOTIFICATIONS
// ------------------------
self.addEventListener("push", (event) => {
    const data = event.data ? event.data.json() : {};

    const options = {
        body: data.body || "Time for prayer",
        icon: "/icons/icon-192x192.png",
        badge: "/icons/icon-72x72.png",
        vibrate: [200, 100, 200],
        data,
        actions: [
            {action: "mark-prayed", title: "Mark as Prayed"},
            {action: "snooze", title: "Remind Later"}
        ]
    };

    event.waitUntil(
        self.registration.showNotification(data.title || "Prayer Time", options)
    );
});


// ------------------------
// NOTIFICATION CLICK
// ------------------------
self.addEventListener("notificationclick", (event) => {
    event.notification.close();

    if (event.action === "mark-prayed") {
        event.waitUntil(clients.openWindow("/dashboard?action=mark-prayed"));
    } else if (event.action === "snooze") {
        // handle snooze later
    } else {
        event.waitUntil(clients.openWindow("/dashboard"));
    }
});
