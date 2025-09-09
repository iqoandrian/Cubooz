// === Service Worker untuk PWA ===
// Cache nama unik biar kalau update bisa refresh cache lama
const CACHE_NAME = "kubus3d-cache-v1";

// File-file yang dicache (offline support)
const urlsToCache = [
  "/",
  "/index.html",
  "/manifest.json",
  "/js/main.js",
  "/js/gameCore.js",
  "/js/gameLogic.js",
  "/js/gameObjects.js",
  "/js/cubeLogic.js",
  "/js/controls.js",
  "/js/firebase.js",
  "https://cdn.tailwindcss.com",
  "https://cdnjs.cloudflare.com/ajax/libs/three.js/r128/three.min.js"
];

// === Install event ===
self.addEventListener("install", event => {
  console.log("[ServiceWorker] Install");
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => {
      console.log("[ServiceWorker] Caching files");
      return cache.addAll(urlsToCache);
    })
  );
});

// === Activate event ===
self.addEventListener("activate", event => {
  console.log("[ServiceWorker] Activate");
  event.waitUntil(
    caches.keys().then(cacheNames =>
      Promise.all(
        cacheNames.map(cacheName => {
          if (cacheName !== CACHE_NAME) {
            console.log("[ServiceWorker] Hapus cache lama:", cacheName);
            return caches.delete(cacheName);
          }
        })
      )
    )
  );
});

// === Fetch event ===
self.addEventListener("fetch", event => {
  event.respondWith(
    caches.match(event.request).then(response => {
      // Jika ada di cache → pakai
      if (response) return response;
      // Kalau tidak ada → fetch ke network
      return fetch(event.request);
    })
  );
});
