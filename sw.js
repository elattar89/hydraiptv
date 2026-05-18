const CACHE = 'iptv-v3';
const STATIC = ['/manifest.json', '/icon-192.png', '/icon-512.png'];

self.addEventListener('install', e => {
  e.waitUntil(caches.open(CACHE).then(c => c.addAll(STATIC)));
  self.skipWaiting();
});

self.addEventListener('activate', e => {
  e.waitUntil(caches.keys().then(keys =>
    Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k)))
  ));
  self.clients.claim();
});

self.addEventListener('fetch', e => {
  const url = e.request.url;

  // Firebase و Google دايماً من النت
  if (url.includes('firebase') || url.includes('google') || url.includes('gstatic')) {
    return;
  }

  // index.html دايماً من النت عشان التحديثات تظهر فوراً
  if (url.endsWith('/') || url.includes('index.html')) {
    e.respondWith(
      fetch(e.request).catch(() => caches.match(e.request))
    );
    return;
  }

  // باقي الملفات من الـ cache
  e.respondWith(
    caches.match(e.request).then(r => r || fetch(e.request))
  );
});

