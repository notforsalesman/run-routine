// ====== 気象庁APIのURLを作る関数 ======
function getJmaUrl(areaCode) {
  return `https://www.jma.go.jp/bosai/forecast/data/forecast/${areaCode}.json`;
}

// ====== 今日の天気を取得 ======
async function getWeatherJMA(areaCode) {
  const url = getJmaUrl(areaCode);
  const res = await fetch(url);
  const data = await res.json();

  const today = data[0].timeSeries[0].areas[0];
  const weatherText = today.weathers[0];
  const weatherCode = today.weatherCodes[0];

  const temps = data[0].timeSeries[2].areas[0].temps;
  const tempToday = temps[0];

  return {
    weatherText,
    weatherCode,
    temp: tempToday
  };
}

// ====== 今日のプランを判定 ======
function decidePlanJMA(temp, weatherCode) {
  if (weatherCode >= 300) {
    return "今日は雨なので休養。ストレッチだけでOK。";
  }
  if (temp >= 30) {
    return "暑いので、坂道ウォーク＋短時間ジョグ（20〜25分）。";
  }
  if (weatherCode >= 200) {
    return "曇りなので、ゆるジョグ30〜40分。心拍120〜135で疲労ゼロ。";
  }
  return "晴れなので、ロング走12〜18km。ペースは6'30〜7'00/km。";
}

// ====== 画面に表示 ======
async function showTodayPlan() {
  const result = document.getElementById("result");
  const areaCode = document.getElementById("areaSelect").value;

  try {
    const { weatherText, weatherCode, temp } = await getWeatherJMA(areaCode);
    const plan = decidePlanJMA(temp, weatherCode);

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
