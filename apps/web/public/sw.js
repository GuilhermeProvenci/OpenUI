const CACHE_NAME = "sandbox-deps-v1";

const CDN_HOSTS = ["https://unpkg.com", "https://cdn.jsdelivr.net"];

const CACHE_EXPIRY_MS = 7 * 24 * 60 * 60 * 1000;

self.addEventListener("install", (event) => {
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(clients.claim());
});

self.addEventListener("fetch", (event) => {
  const url = new URL(event.request.url);

  const isCdnRequest = CDN_HOSTS.some((host) => url.href.startsWith(host));

  if (!isCdnRequest) {
    return;
  }

  const isScriptOrStyle =
    url.pathname.endsWith(".js") ||
    url.pathname.endsWith(".css") ||
    url.pathname.includes("/umd/") ||
    url.pathname.includes("/standalone/");

  if (!isScriptOrStyle) {
    return;
  }

  event.respondWith(
    caches.open(CACHE_NAME).then(async (cache) => {
      const cachedResponse = await cache.match(event.request);

      if (cachedResponse) {
        return cachedResponse;
      }

      try {
        const response = await fetch(event.request);

        if (response.ok) {
          const responseToCache = response.clone();
          cache.put(event.request, responseToCache);
        }

        return response;
      } catch (error) {
        console.error("[SW] Fetch failed:", error);
        return new Response("", { status: 408 });
      }
    }),
  );
});
