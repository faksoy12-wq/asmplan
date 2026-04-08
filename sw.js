const CACHE_NAME = 'asm-plan-v13';
const urlsToCache = [
  './',
  './index.html',
  './app.js',
  './style.css',
  './icon.svg'
];

self.addEventListener('install', event => {
  self.skipWaiting(); // Yeni versiyon yüklendiği an beklemeden eskisini devreden çıkar
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        return cache.addAll(urlsToCache);
      })
  );
});

self.addEventListener('activate', event => {
  event.waitUntil(clients.claim()); // Tüm açık sekmelerde kontrolü anında ele al
  const cacheWhitelist = [CACHE_NAME];
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cacheName => {
          if (cacheWhitelist.indexOf(cacheName) === -1) {
            return caches.delete(cacheName); // Eski önbelleği (v1) komple sil
          }
        })
      );
    })
  );
});

// Network First, Fallback to Cache Stratejisi
self.addEventListener('fetch', event => {
  event.respondWith(
    fetch(event.request)
      .then(response => {
        // İnternet varsa ve başarılıysa ağdan (Vercel/Github) taze veriyi ver ve önbelleğe kopyala
        if(!response || response.status !== 200 || response.type !== 'basic') {
          return response;
        }
        let responseToCache = response.clone();
        caches.open(CACHE_NAME)
          .then(cache => {
            cache.put(event.request, responseToCache);
          });
        return response;
      })
      .catch(() => {
        // Sadece internet (network) çöktüğünde önbellekten (offline pwa) cevap dön
        return caches.match(event.request);
      })
  );
});
