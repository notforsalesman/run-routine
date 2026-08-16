// ====== 気象庁API（埼玉県南部：110000） ======
const JMA_URL = "https://www.jma.go.jp/bosai/forecast/data/forecast/110000.json";

// ====== 今日の天気を取得 ======
async function getWeatherJMA() {
  const res = await fetch(JMA_URL);
  const data = await res.json();

  // 今日の天気（timeSeries[0]）
  const today = data[0].timeSeries[0].areas[0];
  const weatherText = today.weathers[0];      // 日本語の天気
  const weatherCode = today.weatherCodes[0];  // 数値コード（100=晴れ、200=曇り、300=雨）

  // 気温（timeSeries[2]）
  const temps = data[0].timeSeries[2].areas[0].temps;
  const tempToday = temps[0]; // 今日の最高気温

  return {
    weatherText,
    weatherCode,
    temp: tempToday
  };
}

// ====== 今日のプランを判定 ======
function decidePlanJMA(temp, weatherCode, weatherText) {
  if (weatherCode >= 300) {
    return "今日は雨なので休養。ストレッチだけでOK。";
  }

  if (temp >= 30) {
    return "暑いので、坂道ウォーク＋短時間ジョグ（20〜25分）。";
  }

  if (weatherCode >= 200) {
    return "曇りなので、ゆるジョグ30〜40分。心拍120〜135で疲労ゼロ。";
  }

  if (weatherCode < 200) {
    return "晴れなので、ロング走12〜18km。ペースは6'30〜7'00/km。";
  }

  return "軽めのジョグ30分。";
}

// ====== 画面に表示 ======
async function showTodayPlan() {
  const result = document.getElementById("result");

  try {
    const { weatherText, weatherCode, temp } = await getWeatherJMA();
    const plan = decidePlanJMA(temp, weatherCode, weatherText);

    result.style.display = "block";
    result.innerHTML = `
      <h3>今日の天気</h3>
      <p>${weatherText}（最高気温 ${temp}℃）</p>

      <h3>今日のランニングプラン</h3>
      <p>${plan}</p>
    `;
  } catch (err) {
    result.style.display = "block";
    result.innerHTML = "<p>天気情報の取得に失敗しました。</p>";
  }
}

// ====== ボタンに紐付け ======
document.getElementById("checkBtn").addEventListener("click", showTodayPlan);

// ====== Periodic Sync（毎日1回通知） ======
if ("serviceWorker" in navigator && "PeriodicSyncManager" in window) {
  navigator.serviceWorker.ready.then(async (reg) => {
    try {
      await reg.periodicSync.register("daily-run-check", {
        minInterval: 24 * 60 * 60 * 1000 // 1日
      });
      console.log("Periodic Sync registered");
    } catch (e) {
      console.log("Periodic Sync not allowed", e);
    }
  });
}
