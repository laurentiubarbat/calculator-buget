const CACHE_NAME = 'buget-pwa-v2';

const ASSETS = [
  './',
  './index.html',
  './manifest.webmanifest',
  './icons/icon-192.png',
  './icons/icon-512.png'
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return Promise.all(
        ASSETS.map((url) =>
          fetch(url, { cache: 'no-cache' })
            .then((response) => {
              if (!response.ok) {
                throw new Error('HTTP ' + response.status);
              }
              return cache.put(url, response.clone());
            })
            .catch((err) => {
              console.warn('[SW] Nu pot cache-ui', url, err);
              // NU mai aruncăm eroarea mai departe – instalarea continuă
            })
        )
      );
    })
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(
        keys
          .filter((key) => key !== CACHE_NAME)
          .map((key) => caches.delete(key))
      )
    )
  );
});

self.addEventListener('fetch', (event) => {
  if (event.request.method !== 'GET') return;

  event.respondWith(
    caches.match(event.request).then((cached) => {
      if (cached) return cached;

      return fetch(event.request).catch(() => {
        // dacă suntem offline și cererea este de navigare, servim index.html
        if (event.request.mode === 'navigate') {
          return caches.match('./');
        }
      });
    })
  );
});
