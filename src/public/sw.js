importScripts(
  "https://storage.googleapis.com/workbox-cdn/releases/6.5.4/workbox-sw.js"
);

workbox.core.setCacheNameDetails({
  prefix: "dicoding-story",
});

const CACHE_NAME = "intermediate-v2";

const APP_SHELL = [
  { url: "/", revision: "1" },
  { url: "/index.html", revision: "1" },
  { url: "/styles/styles.css", revision: "1" },
  { url: "/favicon.png", revision: "1" },
  { url: "/manifest.json", revision: "1" },
  { url: "/images/logo.png", revision: "1" },
  { url: "/images/logo-384.png", revision: "1" },
  { url: "/images/logo-192.png", revision: "1" },
  { url: "/images/logo-144.png", revision: "1" },
  { url: "/images/logo-96.png", revision: "1" },
  { url: "/images/logo-48.png", revision: "1" },
  { url: "/images/desktop.png", revision: "1" },
  { url: "/images/mobile.png", revision: "1" },
  { url: "/images/tablet.png", revision: "1" },
  { url: "/scripts/index.js", revision: "1" },
  { url: "/scripts/skip-link.js", revision: "1" },
  { url: "https://unpkg.com/leaflet@1.9.3/dist/leaflet.css", revision: null },
  { url: "https://unpkg.com/leaflet@1.9.3/dist/leaflet.js", revision: null },
  {
    url: "https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0-beta3/css/all.min.css",
    revision: null,
  },
];

workbox.precaching.precacheAndRoute(APP_SHELL, {
  ignoreURLParametersMatching: [/.*/],
  directoryIndex: "/",
});

workbox.routing.registerRoute(
  ({ request }) => request.mode === "navigate",
  new workbox.strategies.StaleWhileRevalidate({
    cacheName: "pages",
    plugins: [
      new workbox.cacheableResponse.CacheableResponsePlugin({
        statuses: [0, 200],
      }),
    ],
  })
);

// Fallback navigasi SPA agar semua route diarahkan ke /index.html jika offline atau tidak ditemukan
workbox.routing.registerRoute(
  ({ request }) => request.mode === "navigate",
  async () => await caches.match("/index.html")
);

workbox.routing.setCatchHandler(async ({ event }) => {
  if (event.request.mode === "navigate") {
    const cachedResponse = await caches.match("/index.html");
    return cachedResponse || Response.error();
  }
  return Response.error();
});

workbox.routing.registerRoute(
  ({ url }) => url.origin === "https://story-api.dicoding.dev",
  new workbox.strategies.NetworkFirst({
    cacheName: "api-responses",
    plugins: [
      new workbox.expiration.ExpirationPlugin({
        maxEntries: 50,
        maxAgeSeconds: 7 * 24 * 60 * 60,
      }),
      new workbox.cacheableResponse.CacheableResponsePlugin({
        statuses: [0, 200],
      }),
    ],
  })
);

workbox.routing.registerRoute(
  ({ request }) => request.destination === "image",
  new workbox.strategies.CacheFirst({
    cacheName: "images",
    plugins: [
      new workbox.expiration.ExpirationPlugin({
        maxEntries: 60,
        maxAgeSeconds: 30 * 24 * 60 * 60,
      }),
      new workbox.cacheableResponse.CacheableResponsePlugin({
        statuses: [0, 200],
      }),
    ],
  })
);

workbox.routing.registerRoute(
  ({ request }) => ["script", "style"].includes(request.destination),
  new workbox.strategies.StaleWhileRevalidate({
    cacheName: "assets",
    plugins: [
      new workbox.cacheableResponse.CacheableResponsePlugin({
        statuses: [0, 200],
      }),
    ],
  })
);

// Cache eksternal Leaflet JS & CSS agar bisa offline
workbox.routing.registerRoute(
  ({ url }) => url.href.startsWith("https://unpkg.com/leaflet@1.9.3/dist/"),
  new workbox.strategies.CacheFirst({
    cacheName: "leaflet-cdn",
    plugins: [
      new workbox.expiration.ExpirationPlugin({
        maxEntries: 5,
        maxAgeSeconds: 60 * 60 * 24 * 365, // 1 tahun
      }),
      new workbox.cacheableResponse.CacheableResponsePlugin({
        statuses: [0, 200],
      }),
    ],
  })
);

// Tambahkan strategi cache untuk gambar lokal agar tetap tersedia offline
workbox.routing.registerRoute(
  ({ url }) => url.pathname.startsWith("/images/"),
  new workbox.strategies.CacheFirst({
    cacheName: "local-images",
    plugins: [
      new workbox.expiration.ExpirationPlugin({
        maxEntries: 20,
        maxAgeSeconds: 60 * 60 * 24 * 30, // 30 hari
      }),
      new workbox.cacheableResponse.CacheableResponsePlugin({
        statuses: [0, 200],
      }),
    ],
  })
);

self.addEventListener("push", (event) => {
  let data = { title: "Dicoding Story", body: "New story added!" };
  if (event.data) {
    try {
      data = event.data.json();
    } catch {
      data.body = event.data.text();
    }
  }

  const options = {
    body: data.options?.body || data.body,
    icon: "/favicon.png",
    badge: "/favicon.png",
    vibrate: [100, 50, 100],
    data: {
      dateOfArrival: Date.now(),
      primaryKey: 1,
      url: data.url || "/",
    },
  };

  event.waitUntil(self.registration.showNotification(data.title, options));
});

self.addEventListener("notificationclick", (event) => {
  event.notification.close();
  event.waitUntil(clients.openWindow(event.notification.data.url || "/"));
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames
          .filter(
            (cacheName) =>
              cacheName.startsWith("dicoding-story-") &&
              cacheName !== CACHE_NAME
          )
          .map((cacheName) => caches.delete(cacheName))
      );
    })
  );
});

self.addEventListener("message", (event) => {
  if (event.data && event.data.type === "SKIP_WAITING") {
    self.skipWaiting();
  }
});
