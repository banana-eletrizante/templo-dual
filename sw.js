const CACHE = "templo-dual-v1";
const ASSETS = [
  "./",
  "./index.html",
  "./css/live.css",
  "./js/live.js",
  "./js/pwa.js",
  "./manifest.webmanifest",
  "./icon.svg",
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
      ),
  ),
);
self.addEventListener("fetch", (event) => {
  if (
    event.request.method !== "GET" ||
    new URL(event.request.url).origin !== self.location.origin
  )
    return;
  event.respondWith(
    fetch(event.request).catch(() =>
      caches
        .match(event.request)
        .then(
          (response) =>
            response ||
            (event.request.mode === "navigate"
              ? caches.match("./index.html")
              : Response.error()),
        ),
    ),
  );
});
