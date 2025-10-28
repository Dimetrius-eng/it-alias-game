// ВЕРСІЯ 6 - Додано кешування words.json
const CACHE_NAME = 'it-alias-v6-with-words';

// Оновлений список файлів
const urlsToCache = [
  './',
  './index.html',
  './style.css',
  './script.js',
  './manifest.json',
  './words.json', // <-- НАШ НОВИЙ ФАЙЛ
  './icons/icon-192x192.png',
  './icons/icon-512x512.png',
  'https://fonts.googleapis.com/css2?family=Montserrat:wght@400;600;700&display=swap'
];

// 1. Подія "install"
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        console.log('Відкрито кеш v6');
        return cache.addAll(urlsToCache);
      })
      .catch(err => {
        console.error('Помилка cache.addAll у v6:', err);
      })
  );
});

// 2. Подія "fetch" (Стратегія "Cache-First")
self.addEventListener('fetch', event => {
  event.respondWith(
    caches.match(event.request)
      .then(response => {
        return response || fetch(event.request); 
      })
  );
});

// 3. Подія "activate" (Видаляє всі старі кеші)
self.addEventListener('activate', event => {
  const cacheWhitelist = [CACHE_NAME]; // Залишити тільки v6
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cacheName => {
          if (cacheWhitelist.indexOf(cacheName) === -1) {
            console.log('Видалення старого кешу:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    })
    .then(() => {
        console.log('Service Worker v6 активовано і перехоплює контроль!');
        return self.clients.claim();
    })
  );
});
