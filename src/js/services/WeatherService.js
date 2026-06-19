/**
 * WeatherService.js
 *
 * 从 Open-Meteo 获取天气数据并归一化：
 *   - 当前天气 + 关键指标
 *   - 未来 24h 逐时
 *   - 未来 7 天每日
 *   - 日出日落
 *
 * 所有数据字段都来自 Open-Meteo 免费 API。
 * 缓存策略：
 *   - 城市坐标：内存缓存 1h
 *   - 天气数据：内存缓存 10min
 */

import { codeToType, codeToDesc, DEFAULT_CITY } from '../config/config.js';

/* ---------- API 地址 ---------- */
const GEOCODE_API = 'https://geocoding-api.open-meteo.com/v1/search';
const FORECAST_API = 'https://api.open-meteo.com/v1/forecast';

/* ---------- 缓存 ---------- */
const CACHE_TTL = {
  city: 60 * 60 * 1000,           // 1h
  weather: 10 * 60 * 1000,        // 10min
};

const cityCache = new Map();
const weatherCache = new Map();

function getCache(map, key, ttl) {
  const item = map.get(key);
  if (!item) return null;
  if (Date.now() - item.ts > ttl) {
    map.delete(key);
    return null;
  }
  return item.value;
}
function setCache(map, key, value) {
  map.set(key, { value, ts: Date.now() });
}

/* ---------- 请求（带超时 + 重试）---------- */
async function fetchJSON(url, { method = 'GET', headers = {} } = {}, timeoutMs = 10000) {
  let lastErr;
  for (let attempt = 0; attempt < 2; attempt++) {
    try {
      const controller = new AbortController();
      const timer = setTimeout(() => controller.abort(), timeoutMs);
      const res = await fetch(url, {
        method,
        headers: { 'Accept': 'application/json', ...headers },
        signal: controller.signal,
      });
      clearTimeout(timer);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      return await res.json();
    } catch (err) {
      lastErr = err;
      // 简单退避
      await new Promise(r => setTimeout(r, 200));
    }
  }
  throw lastErr || new Error('请求失败');
}

/* ---------- 城市坐标查询 ---------- */
async function searchCity(query) {
  const url = `${GEOCODE_API}?name=${encodeURIComponent(query)}&count=5&language=zh&format=json`;
  const data = await fetchJSON(url);
  if (!data || !data.results || data.results.length === 0) return null;
  // 优先选人口最多的条目
  const sorted = [...data.results].sort((a, b) => (b.population || 0) - (a.population || 0));
  const r = sorted[0];
  return {
    name: r.name,
    country: r.country || '',
    lat: r.latitude,
    lon: r.longitude,
  };
}

/* ---------- 天气数据查询 ---------- */
async function fetchWeather(lat, lon) {
  const params = [
    `latitude=${lat}`,
    `longitude=${lon}`,
    `current=temperature_2m,apparent_temperature,relative_humidity_2m,pressure_msl,wind_speed_10m,wind_direction_10m,wind_gusts_10m,visibility,cloud_cover,uv_index,is_day,weather_code`,
    `hourly=temperature_2m,precipitation_probability,weather_code,uv_index,is_day`,
    `daily=weather_code,temperature_2m_max,temperature_2m_min,precipitation_sum,sunrise,sunset,wind_speed_10m_max`,
    `timezone=auto`,
    `forecast_days=7`,
    `temperature_unit=celsius`,
    `wind_speed_unit=kmh`,
    `precipitation_unit=mm`,
  ].join('&');
  return await fetchJSON(`${FORECAST_API}?${params}`);
}

/* ---------- 工具：HH:MM from ISO ---------- */
function formatTime(iso) {
  if (!iso) return '--:--';
  const d = new Date(iso);
  return `${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`;
}

/* ---------- 归一化 ---------- */
function normalize(raw, city) {
  if (!raw || !raw.current) throw new Error('天气数据为空');

  const code = raw.current.weather_code;
  const isDay = raw.current.is_day === 1;
  const type = codeToType(code, isDay);
  const desc = codeToDesc(code);

  const now = new Date();
  const weekdays = ['周日', '周一', '周二', '周三', '周四', '周五', '周六'];
  const todayStr = `${weekdays[now.getDay()]} · ${String(now.getMonth() + 1).padStart(2, '0')}/${String(now.getDate()).padStart(2, '0')}`;

  // 逐时 — 从当前小时起取 24 小时
  const hours = raw.hourly?.time || [];
  let startIdx = 0;
  for (let i = 0; i < hours.length; i++) {
    const t = new Date(hours[i]).getTime();
    if (t >= now.getTime() - 30 * 60 * 1000) { startIdx = i; break; }
  }

  const hourly = [];
  for (let i = 0; i < 24; i++) {
    const idx = startIdx + i;
    if (idx >= hours.length) break;
    const hCode = raw.hourly.weather_code[idx];
    const isDayH = raw.hourly.is_day[idx] === 1;
    const h = new Date(hours[idx]).getHours();
    hourly.push({
      hour: i === 0 ? '现在' : `${h}时`,
      label: String(h).padStart(2, '0'),
      temp: Math.round(raw.hourly.temperature_2m[idx]),
      pop: raw.hourly.precipitation_probability[idx] || 0,
      type: codeToType(hCode, isDayH),
    });
  }

  // 逐日 — 7 天
  const daily = [];
  if (raw.daily?.time) {
    for (let i = 0; i < raw.daily.time.length; i++) {
      const d = new Date(raw.daily.time[i]);
      const dayName = i === 0 ? '今天' : i === 1 ? '明天' : weekdays[d.getDay()];
      const dCode = raw.daily.weather_code[i];
      daily.push({
        day: dayName,
        type: codeToType(dCode, true),
        desc: codeToDesc(dCode),
        tempMin: Math.round(raw.daily.temperature_2m_min[i]),
        tempMax: Math.round(raw.daily.temperature_2m_max[i]),
        pop: raw.daily.precipitation_sum ? Math.round(raw.daily.precipitation_sum[i] * 10) / 10 : 0,
      });
    }
  }

  return {
    city: city.name,
    country: city.country || '',
    updatedAt: new Date().toISOString(),
    type,
    desc,
    dateText: todayStr,
    temp: {
      now: Math.round(raw.current.temperature_2m),
      feels: Math.round(raw.current.apparent_temperature),
      min: Math.round(raw.daily?.temperature_2m_min?.[0] ?? raw.current.temperature_2m),
      max: Math.round(raw.daily?.temperature_2m_max?.[0] ?? raw.current.temperature_2m),
    },
    humidity: raw.current.relative_humidity_2m,
    pressure: Math.round(raw.current.pressure_msl),
    wind: {
      speed: Math.round(raw.current.wind_speed_10m),
      dir: raw.current.wind_direction_10m,
      gust: Math.round(raw.current.wind_gusts_10m || 0),
    },
    visibility: Math.round(((raw.current.visibility ?? 10000) / 1000) * 10) / 10,
    uv: Math.round((raw.current.uv_index || 0) * 10) / 10,
    cloud: raw.current.cloud_cover,
    isDay,
    hourly,
    daily,
    sunrise: formatTime(raw.daily?.sunrise?.[0]),
    sunset: formatTime(raw.daily?.sunset?.[0]),
  };
}

/* ---------- 对外主 API ---------- */

export async function getWeatherByCity(query) {
  if (!query) throw new Error('缺少城市名');
  const cityKey = query.trim().toLowerCase();

  let city = getCache(cityCache, cityKey, CACHE_TTL.city);
  if (!city) {
    city = await searchCity(query);
    if (city) setCache(cityCache, cityKey, city);
  }
  if (!city) throw new Error(`找不到城市：${query}`);

  const wKey = `${city.lat.toFixed(2)},${city.lon.toFixed(2)}`;
  let weather = getCache(weatherCache, wKey, CACHE_TTL.weather);
  if (!weather) {
    const raw = await fetchWeather(city.lat, city.lon);
    weather = normalize(raw, city);
    setCache(weatherCache, wKey, weather);
  }
  return weather;
}

export async function getWeatherByLocation() {
  if (!navigator.geolocation) throw new Error('浏览器不支持定位');

  const pos = await new Promise((resolve, reject) => {
    navigator.geolocation.getCurrentPosition(resolve, reject, { timeout: 8000, maximumAge: 60000 });
  });
  const city = {
    name: '当前位置',
    country: '',
    lat: pos.coords.latitude,
    lon: pos.coords.longitude,
  };
  const wKey = `${city.lat.toFixed(2)},${city.lon.toFixed(2)}`;
  let weather = getCache(weatherCache, wKey, CACHE_TTL.weather);
  if (!weather) {
    const raw = await fetchWeather(city.lat, city.lon);
    weather = normalize(raw, city);
    setCache(weatherCache, wKey, weather);
  }
  return weather;
}

/* 导出默认城市，方便首屏默认加载 */
export { DEFAULT_CITY };
