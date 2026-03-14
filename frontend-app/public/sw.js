// Service Worker — Travel App
// Strategie: Network First, besuchte Navigationsseiten werden gecacht.
// API-Calls und Uploads werden immer vom Netzwerk abgerufen (kein Cache).
// Offline: zuletzt besuchte Seiten sind abrufbar.

// Bei jedem Deployment hochzählen (v2, v3, …) — erzwingt Cache-Leerung beim nächsten Start.
const CACHE_NAME = 'travel-app-v1'

self.addEventListener('install', () => {
  self.skipWaiting()
})

self.addEventListener('activate', (event) => {
  // Alte Cache-Versionen aufräumen
  event.waitUntil(
    caches.keys()
      .then((keys) =>
        Promise.all(keys.filter((k) => k !== CACHE_NAME).map((k) => caches.delete(k)))
      )
      .then(() => clients.claim()),
  )
})

self.addEventListener('fetch', (event) => {
  const { request } = event
  const url = new URL(request.url)

  // Nur GET-Requests cachen
  if (request.method !== 'GET') return
  // API-Calls und Uploads immer zum Netzwerk — kein Cache
  if (url.pathname.startsWith('/api') || url.pathname.startsWith('/uploads')) return
  // Nur gleicher Origin
  if (url.origin !== self.location.origin) return

  event.respondWith(
    fetch(request)
      .then((response) => {
        // Erfolgreiche Navigationsanfragen im Cache speichern
        if (response.ok) {
          const clone = response.clone()
          caches.open(CACHE_NAME).then((cache) => cache.put(request, clone))
        }
        return response
      })
      .catch(() => {
        // Offline: gecachte Version ausliefern (falls vorhanden)
        return caches.match(request)
      }),
  )
})
