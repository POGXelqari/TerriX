const CACHE_NAME = "cbm-core-v2";
const ASSETS = [
  "/cbm.html",
  "/vault.html",
  "/donations.html",
  "/election.html",
  "/rulebook.html",
  "/developer.html",
  "/download.html",
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

  // Never intercept cross-origin requests (e.g. Cloudflare Turnstile, CDNs, external webfonts).
  // Native browser fetches execute directly against document CSP without worker mediation.
  if (u.origin !== self.location.origin) return;

  // Ignore Cloudflare challenge/analytics paths if ever routed through domain
  if (u.pathname.startsWith("/cdn-cgi/") || u.pathname.startsWith("/turnstile/")) return;

  // Real-time API endpoints and dynamic auth portals: network-first with cache fallback
  const isAuthOrApi = u.pathname.startsWith("/api/") ||
    u.pathname === "/login.html" ||
    u.pathname === "/register.html" ||
    u.pathname === "/login" ||
    u.pathname === "/register";

  if (isAuthOrApi) {
    e.respondWith(
      fetch(e.request).then((res) => {
        if (res && res.status === 200 && res.type === "basic") {
          const clone = res.clone();
          caches.open(CACHE_NAME).then((c) => c.put(e.request, clone));
        }
        return res;
      }).catch(() => caches.match(e.request))
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
      }).catch(() => {
        if (cached) return cached;
        // Never return HTML fallback for scripts, styles, images, or non-HTML requests
        const isHtmlNavigation = e.request.mode === "navigate" ||
          (e.request.headers.get("accept") || "").includes("text/html");
        if (isHtmlNavigation) {
          return caches.match("/cbm.html");
        }
        return undefined;
      });

      return cached || networkFetch;
    })
  );
});
