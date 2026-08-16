const CACHE_NAME = "runroutine-v3"; // ← バージョンを上げると古いキャッシュが消える

self.addEventListener("install", (event) => {
  console.log("Service Worker installed");

  // 新しいキャッシュを作成
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll([
        "/run-routine/",
        "/run-routine/index.html",
        "/run-routine/style.css",
        "/run-routine/main.js",
        "/run-routine/manifest.json",
        "/run-routine/icons/icon-192.png",
        "/run-routine/icons/icon-512.png"
      ]);
    })
  );
});

self.addEventListener("activate", (event) => {
  console.log("Service Worker activated");

  // 古いキャッシュを削除
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(
        keys.map((key) => {
          if (key !== CACHE_NAME) {
            return caches.delete(key);
          }
        })
      )
    )
  );
});

// ====== fetch（常に最新を取得しつつキャッシュも更新） ======
self.addEventListener("fetch", (event) => {
  event.respondWith(
    caches.match(event.request).then((cached) => {
      const networkFetch = fetch(event.request)
        .then((response) => {
          // 新しいデータでキャッシュを更新
          caches.open(CACHE_NAME).then((cache) => {
            cache.put(event.request, response.clone());
          });
          return response;
        })
        .catch(() => cached); // オフライン時はキャッシュを返す

      return cached || networkFetch;
    })
  );
});

// ====== 通知を表示する関数 ======
async function showNotification(title, body) {
  self.registration.showNotification(title, {
    body: body,
    icon: "/run-routine/icons/icon-192.png"
  });
}

// ====== Periodic Sync（毎日1回） ======
self.addEventListener("periodicsync", async (event) => {
  if (event.tag === "daily-run-check") {

    const res = await fetch("https://www.jma.go.jp/bosai/forecast/data/forecast/110000.json");
    const data = await res.json();

    const today = data[0].timeSeries[0].areas[0];
    const weatherText = today.weathers[0];
    const weatherCode = today.weatherCodes[0];

    let plan = "";
    if (weatherCode >= 300) plan = "今日は雨なので休養。ストレッチだけでOK。";
    else if (weatherCode >= 200) plan = "曇りなのでゆるジョグ30〜40分。";
    else plan = "晴れなのでロング走12〜18km。";

    await showNotification("今日のランニングプラン", `${weatherText}｜${plan}`);
  }
});
