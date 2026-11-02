/* Ersetzt den Service Worker der alten Flutter-Version: löscht deren Cache und meldet sich ab,
   damit Geräte, die die alte App kannten, sofort die neue Version laden. */
self.addEventListener("install", () => self.skipWaiting());
self.addEventListener("activate", e => {
  e.waitUntil((async () => {
    for (const k of await caches.keys()) if (!k.startsWith("wh-pruefung")) await caches.delete(k);
    await self.registration.unregister();
    for (const c of await self.clients.matchAll({type: "window"})) c.navigate(c.url);
  })());
});
