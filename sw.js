self.addEventListener("install", () => {
  console.log("Service Worker installed");
});

self.addEventListener("activate", () => {
  console.log("Service Worker activated");
});

// ====== 通知を表示する関数 ======
async function showNotification(title, body) {
  self.registration.showNotification(title, {
    body: body,
    icon: "/icons/icon-192.png"
  });
}

// ====== Periodic Sync（毎日1回） ======
self.addEventListener("periodicsync", async (event) => {
  if (event.tag === "daily-run-check") {

    // 気象庁API
    const res = await fetch("https://www.jma.go.jp/bosai/forecast/data/forecast/110000.json");
    const data = await res.json();

    const today = data[0].timeSeries[0].areas[0];
    const weatherText = today.weathers[0];
    const weatherCode = today.weatherCodes[0];

    // プラン判定
    let plan = "";
    if (weatherCode >= 300) plan = "今日は雨なので休養。ストレッチだけでOK。";
    else if (weatherCode >= 200) plan = "曇りなのでゆるジョグ30〜40分。";
    else plan = "晴れなのでロング走12〜18km。";

    // 通知送信
    await showNotification("今日のランニングプラン", `${weatherText}｜${plan}`);
  }
});
