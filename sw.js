// AsistPro Service Worker
// Su trabajo: que ningún teléfono quede pegado con una versión vieja.
// Cada vez que publiques cambios en los HTML, subí el número de VERSION de abajo.
const VERSION = '2026.09.23';

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

// ── Mostrar la notificación que llega por Web Push (el camino del iPhone) ──
// La Cloud Function manda un JSON con {title, body, link, tag}. El 'tag' viene
// distinto según de qué se trate ("wa-595…" para un mensaje de WhatsApp,
// "marca-…" para una entrada o salida), así un aviso no pisa al otro.
self.addEventListener('push', function (event) {
  if (!event.data) return;
  let data;
  try { data = event.data.json(); } catch (e) { data = {title: 'Papa Oso', body: event.data.text()}; }
  const title = data.title || 'Papa Oso';
  const options = {
    body: data.body || '',
    icon: '/icono-192.png',
    badge: '/icono-192.png',
    tag: data.tag || 'papaoso-notif',
    renotify: true,
    // Se guarda acá para saber qué abrir cuando toquen la notificación.
    data: {link: data.link || '/admin-papaoso.html'}
  };
  event.waitUntil(self.registration.showNotification(title, options));
});

// ── Tocar la notificación abre lo que corresponda ──
// Un aviso de WhatsApp abre el chat de ese cliente; uno de entrada/salida abre
// el panel. Si ya hay una ventana del sitio abierta, se reutiliza esa.
self.addEventListener('notificationclick', function (event) {
  event.notification.close();
  const destino = (event.notification.data && event.notification.data.link) || '/admin-papaoso.html';
  event.waitUntil((async function () {
    const lista = await self.clients.matchAll({type: 'window', includeUncontrolled: true});
    for (const c of lista) {
      if (c.url === destino && 'focus' in c) return c.focus();
    }
    if (self.clients.openWindow) return self.clients.openWindow(destino);
  })());
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
