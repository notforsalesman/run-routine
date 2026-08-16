// ====== 設定 ======
const API_KEY = "YOUR_OPENWEATHER_API_KEY"; // ← 後で入れる
const CITY = "Asaka"; // 朝霞市
const COUNTRY = "JP";

// ====== 今日の天気を取得 ======
async function getWeather() {
  const url = `https://api.openweathermap.org/data/2.5/weather?q=${CITY},${COUNTRY}&appid=${API_KEY}&units=metric&lang=ja`;

  const res = await fetch(url);
  const data = await res.json();

  return {
    temp: data.main.temp,
    weather: data.weather[0].main,
    description: data.weather[0].description
  };
}

// ====== 今日のプランを判定 ======
function decidePlan(temp, weather) {
  if (weather === "Rain") {
    return "今日は雨なので、完全休養。ストレッチだけでOK。";
  }

  if (temp >= 30) {
    return "暑いので、坂道ウォーク＋短時間ジョグ（20〜25分）。";
  }

  if (weather === "Clouds") {
    return "曇りなので、ゆるジョグ30〜40分。心拍120〜135で疲労ゼロ。";
  }

  if (weather === "Clear") {
    return "晴れなので、ロング走12〜18km。ペースは6'30〜7'00/km。";
  }

  return "軽めのジョグ30分。";
}

// ====== 画面に表示 ======
async function showTodayPlan() {
  const result = document.getElementById("result");

  try {
    const { temp, weather, description } = await getWeather();
    const plan = decidePlan(temp, weather);

    result.style.display = "block";
    result.innerHTML = `
      <h3>今日の天気</h3>
      <p>${description}（${temp}℃）</p>

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

