/**
 * services/WeatherService.js —— 业务逻辑层
 *
 * 对外提供：getWeatherByCity / getWeatherByLocation / clearCache
 * 封装：城市搜索 → 坐标查询 → 天气 API → 归一化 → 简单的内存缓存
 */

import { searchCity, fetchWeather, getBrowserLocation } from '../api/weather.js';
import { WEATHER_CODES, CACHE } from '../config/config.js';

// -------- 缓存 --------
const cityCache = new Map();
const weatherCache = new Map();
const now = () => Date.now();

const getCache = (map, key, ttl) => {
  const hit = map.get(key);
  if (!hit) return undefined;
  if (now() - hit.ts > ttl) {
    map.delete(key);
    return undefined;
  }
  return hit.value;
};
const setCache = (map, key, value) => map.set(key, { ts: now(), value });

// -------- 归一化工具 --------
const weekdays = ['周日', '周一', '周二', '周三', '周四', '周五', '周六'];

function pad2(n) {
  return String(n).padStart(2, '0');
}

function formatTimeFromISO(iso) {
  // iso: "2025-06-20T06:12" → 提取小时:分钟
  if (!iso) return '--:--';
  const parts = iso.split('T');
  if (parts.length < 2) return '--:--';
  return parts[1].slice(0, 5);
}

/**
 * 将 Open-Meteo 响应规整为应用需要的结构。
 */
function normalize(raw, city) {
  const code = raw.current.weather_code;
  const meta = WEATHER_CODES[code] || { desc: '多云', type: 'cloudy', nightType: 'cloudy' };
  const isDay = raw.current.is_day === 1;
  const type = isDay ? meta.type : meta.nightType;

  const todayDate = new Date();
  const today = weekdays[todayDate.getDay()];
  const currentHour = todayDate.getHours();

  // ---- 小时预报 ----
  const hourly = [];
  for (let i = 0; i < 24; i++) {
    const idx = currentHour + i;
    if (idx >= raw.hourly.time.length) break;
    const hCode = raw.hourly.weather_code[idx];
    const isDayH = raw.hourly.is_day[idx] === 1;
    const hMeta = WEATHER_CODES[hCode] || meta;
    const hType = isDayH ? hMeta.type : hMeta.nightType;
    hourly.push({
      hour: i === 0 ? '现在' : `${new Date(raw.hourly.time[idx]).getHours()}时`,
      temp: Math.round(raw.hourly.temperature_2m[idx]),
      type: hType,
      desc: hMeta.desc,
      pop: raw.hourly.precipitation_probability[idx] || 0,
    });
  }

  // ---- 7天预报 ----
  const daily = raw.daily.time.map((t, i) => {
    const d = new Date(t);
    const dCode = raw.daily.weather_code[i];
    const dMeta = WEATHER_CODES[dCode] || meta;
    return {
      day: i === 0 ? '今天' : weekdays[d.getDay()],
      date: `${pad2(d.getMonth() + 1)}/${pad2(d.getDate())}`,
      type: dMeta.type,
      desc: dMeta.desc,
      tempMin: Math.round(raw.daily.temperature_2m_min[i]),
      tempMax: Math.round(raw.daily.temperature_2m_max[i]),
      pop: raw.daily.precipitation_sum ? Math.round(raw.daily.precipitation_sum[i] * 10) / 10 : 0,
    };
  });

  return {
    city: city.name,
    country: city.country,
    updatedAt: new Date().toISOString(),
    type,
    desc: meta.desc,
    dateText: `${today} · ${pad2(todayDate.getMonth() + 1)}月${pad2(todayDate.getDate())}日`,
    temp: {
      now: Math.round(raw.current.temperature_2m),
      feels: Math.round(raw.current.apparent_temperature),
      min: Math.round(raw.daily.temperature_2m_min[0]),
      max: Math.round(raw.daily.temperature_2m_max[0]),
    },
    humidity: raw.current.relative_humidity_2m,
    pressure: Math.round(raw.current.pressure_msl),
    wind: {
      speed: Math.round(raw.current.wind_speed_10m),
      dir: raw.current.wind_direction_10m,
      gust: Math.round(raw.current.wind_gusts_10m || 0),
    },
    visibility: Math.round((raw.current.visibility / 1000) * 10) / 10,
    uv: Math.round((raw.current.uv_index || 0) * 10) / 10,
    cloud: raw.current.cloud_cover,
    hourly,
    daily,
    sunrise: formatTimeFromISO(raw.daily.sunrise ? raw.daily.sunrise[0] : null),
    sunset: formatTimeFromISO(raw.daily.sunset ? raw.daily.sunset[0] : null),
  };
}

// -------- 公共 API --------

export async function getWeatherByCity(query) {
  if (!query) throw new Error('缺少城市');
  const cityKey = query.trim().toLowerCase();

  let city = getCache(cityCache, cityKey, CACHE.CITY_TTL);
  if (!city) {
    city = await searchCity(query);
    if (city) setCache(cityCache, cityKey, city);
  }
  if (!city) throw new Error('找不到城市: ' + query);

  const wKey = `${city.lat.toFixed(2)},${city.lon.toFixed(2)}`;
  let weather = getCache(weatherCache, wKey, CACHE.WEATHER_TTL);
  if (!weather) {
    const raw = await fetchWeather(city.lat, city.lon);
    weather = normalize(raw, city);
    setCache(weatherCache, wKey, weather);
  }
  return weather;
}

export async function getWeatherByLocation() {
  const pos = await getBrowserLocation();
  const city = { name: '当前位置', country: '', lat: pos.lat, lon: pos.lon };
  const wKey = `${pos.lat.toFixed(2)},${pos.lon.toFixed(2)}`;

  let weather = getCache(weatherCache, wKey, CACHE.WEATHER_TTL);
  if (!weather) {
    const raw = await fetchWeather(pos.lat, pos.lon);
    weather = normalize(raw, city);
    setCache(weatherCache, wKey, weather);
  }
  return weather;
}

export function clearCache() {
  cityCache.clear();
  weatherCache.clear();
}
