/* 신흥부동산 장부 — 앱 설치·오프라인용
   ─ 장부 화면은 항상 인터넷에서 최신 것을 먼저 받고, 끊겼을 때만 저장해 둔 화면을 씁니다.
   ─ 로그인·장부 데이터(구글/Firebase)는 여기서 건드리지 않습니다. */
const CACHE = "sinheung-v1";
const SHELL = ["./", "index.html", "manifest.webmanifest", "firebase-config.js",
  "icons/icon-192.png", "icons/icon-512.png", "icons/apple-touch-icon.png", "icons/favicon-32.png", "icons/favicon-64.png"];

self.addEventListener("install", (e) => {
  e.waitUntil(caches.open(CACHE).then((c) => Promise.all(SHELL.map((u) => c.add(u).catch(() => {})))));
  self.skipWaiting();
});
self.addEventListener("activate", (e) => {
  e.waitUntil(caches.keys().then((ks) => Promise.all(ks.filter((k) => k !== CACHE).map((k) => caches.delete(k))))
    .then(() => self.clients.claim()));
});
self.addEventListener("fetch", (e) => {
  const req = e.request;
  if (req.method !== "GET") return;
  const url = new URL(req.url);
  if (url.origin !== location.origin) return;          // 구글·Firebase·글꼴은 그대로 통과
  if (url.pathname.startsWith("/__/")) return;          // Firebase 로그인 경로
  e.respondWith(
    fetch(req).then((res) => {
      if (res.ok) { const copy = res.clone(); caches.open(CACHE).then((c) => c.put(req, copy)); }
      return res;
    }).catch(() => caches.match(req).then((hit) => hit || (req.mode === "navigate" ? caches.match("index.html") : undefined)))
  );
});
