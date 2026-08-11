// AsistPro Service Worker
// Su trabajo: que ningún teléfono quede pegado con una versión vieja.
// Cada vez que publiques cambios en los HTML, subí el número de VERSION de abajo.
const VERSION = '2026.08.11';

// Al instalar el SW nuevo, activarlo de inmediato (no esperar a que cierren pestañas).
self.addEventListener('install', function (e) {
  self.skipWaiting();
});

// Al activar: borrar cualquier caché viejo y tomar control de las pestañas abiertas.
self.addEventListener('activate', function (e) {
  e.waitUntil((async function () {
    const keys = await caches.keys();
    await Promise.all(keys.map(function (k) { return caches.delete(k); }));
    await self.clients.claim();
  })());
});

// Permitir que la página pida activación inmediata.
self.addEventListener('message', function (e) {
  if (e.data && e.data.type === 'SKIP_WAITING') self.skipWaiting();
});

// Mostrar notificación push recibida (Web Push nativo para iOS)
self.addEventListener('push', function(event) {
  if (!event.data) return;
  let data;
  try { data = event.data.json(); } catch(e) { data = {title:'AsistPro', body: event.data.text()}; }
  const title = data.title || 'AsistPro';
  const options = {
    body: data.body || '',
    icon: '/icono-192.png',
    badge: '/icono-192.png',
    tag: 'asistpro-notif',
    renotify: true
  };
  event.waitUntil(self.registration.showNotification(title, options));
});

// Estrategia de red:
// - Navegaciones (cuando se abre/recarga el HTML): SIEMPRE traer de la red ignorando
//   el caché del navegador (cache:'reload'). Así nunca queda pegada una versión vieja.
//   Si no hay internet, usa la última copia disponible.
// - Otros recursos: intentar red primero, caché como respaldo.
self.addEventListener('fetch', function (e) {
  const req = e.request;
  if (req.mode === 'navigate') {
    e.respondWith(
      fetch(req, { cache: 'reload' }).catch(function () { return caches.match(req); })
    );
    return;
  }
  e.respondWith(
    fetch(req).catch(function () { return caches.match(req); })
  );
});
