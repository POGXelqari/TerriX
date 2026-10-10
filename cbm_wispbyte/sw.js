const CACHE_NAME = "cbm-core-v1";
const ASSETS = [
  "/cbm.html",
  "/vault.html",
  "/donations.html",
  "/election.html",
  "/login.html",
  "/register.html",
  "/rulebook.html",
  "/developer.html",
  "/cbm-logo-new.png",
  "/cbm-logo.png",
  "/total-vault-assets-icon.png",
  "/unencumbered-reserves-icon.png",
  "/member-liabilities-icon.png",
  "/solvency-ratio-icon.png",
  "/painsel-pointing-left.png",
  "/manifest.webmanifest"
];

self.addEventListener("install", (e) => {
  e.waitUntil(
    caches.open(CACHE_NAME)
      .then((c) => c.addAll(ASSETS))
      .then(() => self.skipWaiting())
  );
});

self.addEventListener("activate", (e) => {
  e.waitUntil(
    caches.keys().then((k) => Promise.all(
      k.filter((n) => n !== CACHE_NAME).map((n) => caches.delete(n))
    )).then(() => self.clients.claim())
  );
});

self.addEventListener("fetch", (e) => {
  const u = new URL(e.request.url);
  if (e.request.method !== "GET") return;

  // Real-time API telemetry: network-first with cache fallback
  if (u.pathname.startsWith("/api/")) {
    e.respondWith(
      fetch(e.request).catch(() => caches.match(e.request))
    );
    return;
  }

  // Static shell and assets: cache-first with background network revalidation
  e.respondWith(
    caches.match(e.request).then((cached) => {
      const networkFetch = fetch(e.request).then((res) => {
        if (res && res.status === 200 && res.type === "basic") {
          const clone = res.clone();
          caches.open(CACHE_NAME).then((c) => c.put(e.request, clone));
        }
        return res;
      }).catch(() => cached || caches.match("/cbm.html"));

      return cached || networkFetch;
    })
  );
});
