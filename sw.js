// Each version is an atomic app shell. Updates wait until old game tabs close.
const CACHE = "templo-dual-v2.1";
const ASSETS = [
  "./",
  "./index.html",
  "./css/live.css",
  "./css/premium.css",
  "./js/live.js",
  "./js/presentation.js",
  "./js/pwa.js",
  "./manifest.webmanifest",
  "./icon.svg",
  "./assets/guardians.webp",
  "./assets/characters.webp",
  "./assets/cinzel-bold.ttf",
  "./assets/source-sans.ttf",
  "./assets/source-sans-bold.ttf",
  "./assets/icon-192.png",
  "./assets/icon-512.png",
];
self.addEventListener("install", (event) =>
  event.waitUntil(caches.open(CACHE).then((cache) => cache.addAll(ASSETS))),
);
self.addEventListener("activate", (event) =>
  event.waitUntil(
    caches
      .keys()
      .then((keys) =>
        Promise.all(
          keys
            .filter((key) => key.startsWith("templo-dual-") && key !== CACHE)
            .map((key) => caches.delete(key)),
        ),
      )
      .then(() => self.clients.claim()),
  ),
);
self.addEventListener("fetch", (event) => {
  if (
    event.request.method !== "GET" ||
    new URL(event.request.url).origin !== self.location.origin
  )
    return;
  event.respondWith(
    caches.open(CACHE).then(async (cache) => {
      const cached = await cache.match(event.request);
      if (cached) return cached;
      try {
        return await fetch(event.request);
      } catch {
        return event.request.mode === "navigate"
          ? (await cache.match("./")) || Response.error()
          : Response.error();
      }
    }),
  );
});
