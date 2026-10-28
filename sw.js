/* Service Worker: hält App, Bibliotheken und Haltestellen-Daten offline vor. */
const VERSION = "wh-pruefung-v1";
const SHELL = ["./","index.html","data.json","manifest.webmanifest","icons/icon-192.png","icons/icon-512.png",
  "lib/pdfmake.min.js","lib/vfs_fonts.js","lib/xlsx.full.min.js","lib/jszip.min.js"];
self.addEventListener("install", e => { e.waitUntil(caches.open(VERSION).then(c => c.addAll(SHELL)).then(() => self.skipWaiting())); });
self.addEventListener("activate", e => { e.waitUntil(caches.keys().then(ks => Promise.all(ks.filter(k => k !== VERSION).map(k => caches.delete(k)))).then(() => self.clients.claim())); });
self.addEventListener("fetch", e => {
  const req = e.request; if (req.method !== "GET") return;
  const url = new URL(req.url);
  // Google Fonts: zur Laufzeit cachen
  if (url.host.includes("fonts.googleapis.com") || url.host.includes("fonts.gstatic.com")) {
    e.respondWith(caches.open(VERSION + "-fonts").then(async c => { const hit = await c.match(req); if (hit) return hit;
      try { const res = await fetch(req); c.put(req, res.clone()); return res; } catch (err) { return new Response("", {status: 504}); } }));
    return;
  }
  if (url.origin !== location.origin) return;
  // App-Shell: Cache zuerst, im Hintergrund aktualisieren
  e.respondWith(caches.open(VERSION).then(async c => {
    const hit = await c.match(req, {ignoreSearch: true});
    const net = fetch(req).then(res => { if (res.ok) c.put(req, res.clone()); return res; }).catch(() => null);
    if (hit) { e.waitUntil(net); return hit; }
    const res = await net; if (res) return res;
    if (req.mode === "navigate") return c.match("index.html");
    return new Response("offline", {status: 503});
  }));
});
