// ВЕРСІЯ 5 - Фінальна для GitHub
const CACHE_NAME = 'it-alias-v5-github';

// Повний список файлів.
// Крапка-слеш (./) означає "у цій же папці", це найнадійніший шлях.
const urlsToCache = [
  './', // Це закешує головну сторінку
  './index.html',
  './style.css',
  './script.js',
  './manifest.json',
  './icons/icon-192x192.png',
  './icons/icon-512x512.png',
  'https://fonts.googleapis.com/css2?family=Montserrat:wght@400;600;700&display=swap'
];

// 1. Подія "install"
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        console.log('Відкрито кеш v5 (GitHub)');
        return cache.addAll(urlsToCache);
      })
      .catch(err => {
        console.error('Помилка cache.addAll у v5:', err);
      })
  );
});

// 2. Подія "fetch" (Стратегія "Cache-First")
self.addEventListener('fetch', event => {
  event.respondWith(
    caches.match(event.request)
      .then(response => {
        // Якщо є в кеші - віддаємо, інакше йдемо в мережу
        return response || fetch(event.request); 
      })
  );
});

// 3. Подія "activate" (Видаляє всі старі кеші: v1, v2, v3, v4)
self.addEventListener('activate', event => {
  const cacheWhitelist = [CACHE_NAME]; // Залишити тільки v5
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
        console.log('Service Worker v5 активовано і перехоплює контроль!');
        return self.clients.claim(); // Взяти контроль негайно
    })
  );
});