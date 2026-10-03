// Service worker: guarda una copia de la app para que abra sin internet.
const VERSION = "mi-diario-v1";
const ARCHIVOS = ["./", "./index.html", "./manifest.json", "./icon-192.png", "./icon-512.png"];

// Al instalarse: guarda los archivos en la caché
self.addEventListener("install", function (e) {
  e.waitUntil(caches.open(VERSION).then(function (c) { return c.addAll(ARCHIVOS); }));
  self.skipWaiting();
});

// Al activarse: borra cachés viejas
self.addEventListener("activate", function (e) {
  e.waitUntil(caches.keys().then(function (claves) {
    return Promise.all(claves.filter(function (k) { return k !== VERSION; }).map(function (k) { return caches.delete(k); }));
  }));
  self.clients.claim();
});

// Al pedir un archivo: primero internet (para tener la última versión); si no hay, la copia guardada
self.addEventListener("fetch", function (e) {
  if (e.request.method !== "GET") return;
  e.respondWith(
    fetch(e.request).then(function (res) {
      const copia = res.clone();
      caches.open(VERSION).then(function (c) { c.put(e.request, copia); });
      return res;
    }).catch(function () { return caches.match(e.request); })
  );
});
