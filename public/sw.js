const CACHE_NAME = 'allergy-alert-v1';
const ASSETS_TO_CACHE = [
  '/',
  '/index.html',
  '/logo_main.png',
  '/noentry.png',
  '/placeholder.svg',
  '/favicon.ico',
  '/manifest.json',
  '/allergens/milk.png',
  '/allergens/eggs.png',
  '/allergens/peanuts.png',
  '/allergens/treeNuts.png',
  '/allergens/fish.png',
  '/allergens/shellfish.png',
  '/allergens/wheat.png',
  '/allergens/soy.png',
  '/allergens/sesame.png'
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(ASSETS_TO_CACHE);
    })
  );
});

self.addEventListener('fetch', (event) => {
  // Skip cross-origin requests (like Google Translate API) when offline
  // unless we want to try and cache them (not recommended for this API)
  if (!event.request.url.startsWith(self.location.origin)) return;

  event.respondWith(
    caches.match(event.request).then((response) => {
      return response || fetch(event.request).then((fetchResponse) => {
        return caches.open(CACHE_NAME).then((cache) => {
          cache.put(event.request, fetchResponse.clone());
          return fetchResponse;
        });
      });
    }).catch(() => {
      // Fallback for navigation requests when offline
      if (event.request.mode === 'navigate') {
        return caches.match('/');
      }
    })
  );
});