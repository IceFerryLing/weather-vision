/**
 * api/weather.js —— Open-Meteo API HTTP 层
 *
 * 职责：
 *   1. 按城市名搜索地理坐标（geocoding）
 *   2. 按经纬度查询天气（current / hourly / daily）
 *   3. 使用 AbortController 实现超时
 *
 * 返回原始 JSON 数据，由上层 services 负责归一化。
 */

import { API, FORECAST_PARAMS } from '../config/config.js';

/**
 * 带超时的 fetch。超时后 AbortController 会 reject。
 *
 * @param {string} url
 * @param {object} [opts] 额外 fetch 选项
 * @param {number} [timeoutMs=API.TIMEOUT]
 * @returns {Promise<any>} JSON 响应
 */
async function fetchJSON(url, opts = {}, timeoutMs = API.TIMEOUT) {
  const hasAbort = typeof AbortController !== 'undefined';
  const controller = hasAbort ? new AbortController() : null;
  const signal = controller?.signal;
  const timer = setTimeout(() => controller && controller.abort(), timeoutMs);
  try {
    const res = await fetch(url, {
      ...opts,
      ...(signal ? { signal } : {}),
      headers: { Accept: 'application/json', ...(opts.headers || {}) },
    });
    if (!res.ok) {
      throw new Error(`HTTP ${res.status} ${res.statusText}`);
    }
    return await res.json();
  } finally {
    clearTimeout(timer);
  }
}

/**
 * 搜索城市坐标。
 *
 * @param {string} query 城市名（中英文都可）
 * @returns {Promise<{name:string, country:string, lat:number, lon:number}|null>}
 */
export async function searchCity(query) {
  const q = (query || '').trim();
  if (!q) return null;

  const url = new URL(API.GEOCODE);
  url.searchParams.set('name', q);
  url.searchParams.set('count', '1');
  url.searchParams.set('language', 'zh');
  url.searchParams.set('format', 'json');

  try {
    const data = await fetchJSON(url.toString());
    if (!data?.results || data.results.length === 0) return null;
    const r = data.results[0];
    return {
      name: r.name || q,
      country: r.country || '',
      lat: r.latitude,
      lon: r.longitude,
    };
  } catch (e) {
    console.warn('[weather] geocoding failed:', e.message);
    return null;
  }
}

/**
 * 获取天气数据（current + hourly + daily）。
 *
 * @param {number} lat
 * @param {number} lon
 * @returns {Promise<object>} Open-Meteo 响应
 */
export async function fetchWeather(lat, lon) {
  const url = new URL(API.FORECAST);
  url.searchParams.set('latitude', String(lat));
  url.searchParams.set('longitude', String(lon));
  FORECAST_PARAMS.current.forEach((p) => url.searchParams.append('current', p));
  FORECAST_PARAMS.hourly.forEach((p) => url.searchParams.append('hourly', p));
  FORECAST_PARAMS.daily.forEach((p) => url.searchParams.append('daily', p));
  url.searchParams.set('timezone', FORECAST_PARAMS.timezone);
  url.searchParams.set('forecast_days', String(FORECAST_PARAMS.forecast_days));

  try {
    return await fetchJSON(url.toString());
  } catch (e) {
    console.warn('[weather] forecast failed:', e.message);
    throw e;
  }
}

/**
 * 浏览器地理定位
 * @returns {Promise<{lat:number, lon:number}>}
 */
export function getBrowserLocation() {
  return new Promise((resolve, reject) => {
    if (!navigator.geolocation) {
      reject(new Error('Geolocation not supported'));
      return;
    }
    navigator.geolocation.getCurrentPosition(
      (pos) => resolve({ lat: pos.coords.latitude, lon: pos.coords.longitude }),
      (err) => reject(err),
      { timeout: 10000, enableHighAccuracy: false },
    );
  });
}
