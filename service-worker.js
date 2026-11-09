const CACHE_PREFIX = "pokedex-pwa-";
const CACHE_VERSION = `${CACHE_PREFIX}v2`;
const STATIC_CACHE = `${CACHE_VERSION}-static`;
const API_CACHE = `${CACHE_VERSION}-api`;
const IMAGE_CACHE = `${CACHE_VERSION}-images`;

const APP_SHELL = [
  "./",
  "./index.html",
  "./manifest.json",
  "./css/style.css",
  "./js/script.js",
  "./assets/icons/icon-192.png",
  "./assets/icons/icon-512.png",
  "./assets/icons/icon-512-maskable.png"
];

self.addEventListener("install", event => {
  event.waitUntil(
    caches.open(STATIC_CACHE)
      .then(cache => cache.addAll(APP_SHELL))
      .then(() => self.skipWaiting())
  );
});

self.addEventListener("activate", event => {
  event.waitUntil(
    caches.keys()
      .then(keys => Promise.all(
        keys.filter(key => key.startsWith(CACHE_PREFIX) && !key.startsWith(CACHE_VERSION))
          .map(key => caches.delete(key))
      ))
      .then(() => self.clients.claim())
  );
});

async function trimCache(cacheName, maxEntries) {
  const cache = await caches.open(cacheName);
  const keys = await cache.keys();
  if (keys.length > maxEntries) {
    await Promise.all(keys.slice(0, keys.length - maxEntries).map(key => cache.delete(key)));
  }
}

async function networkFirst(request, cacheName, maxEntries = 120) {
  const cache = await caches.open(cacheName);
  try {
    const response = await fetch(request);
    if (response && response.ok) {
      await cache.put(request, response.clone());
      await trimCache(cacheName, maxEntries);
    } else {
      const cached = await cache.match(request);
      if (cached) return cached;
    }
    return response;
  } catch (error) {
    const cached = await cache.match(request);
    if (cached) return cached;
    throw error;
  }
}

async function cacheFirst(request, cacheName, maxEntries = 160) {
  const cache = await caches.open(cacheName);
  const cached = await cache.match(request);
  if (cached) return cached;
  const response = await fetch(request);
  if (response && response.ok && response.type !== "opaque") {
    await cache.put(request, response.clone());
    await trimCache(cacheName, maxEntries);
  }
  return response;
}

self.addEventListener("fetch", event => {
  const request = event.request;
  if (request.method !== "GET") return;

  const url = new URL(request.url);

  if (request.mode === "navigate") {
    event.respondWith(
      fetch(request)
        .then(async response => {
          if (response.ok) {
            const cache = await caches.open(STATIC_CACHE);
            await cache.put("./index.html", response.clone());
          }
          return response;
        })
        .catch(async () => {
          const cachedPage = await caches.match("./index.html");
          return cachedPage || new Response(
            "<!doctype html><html lang=\"pt-BR\"><meta charset=\"utf-8\"><meta name=\"viewport\" content=\"width=device-width,initial-scale=1\"><title>Pokédex offline</title><body style=\"font-family:sans-serif;background:#10131b;color:#f4f6fb;padding:2rem\"><h1>Pokédex</h1><p>Não foi possível abrir a aplicação. Conecte-se à internet uma vez e tente novamente.</p></body></html>",
            { headers: { "Content-Type": "text/html; charset=utf-8" }, status: 503 }
          );
        })
    );
    return;
  }

  if (url.origin === "https://pokeapi.co") {
    event.respondWith(networkFirst(request, API_CACHE));
    return;
  }

  if (request.destination === "image" && url.origin !== self.location.origin) {
    event.respondWith(cacheFirst(request, IMAGE_CACHE));
    return;
  }

  if (url.origin === self.location.origin) {
    event.respondWith(cacheFirst(request, STATIC_CACHE, 80));
  }
});
