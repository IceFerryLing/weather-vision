/**
 * config.js —— 应用级配置
 *
 * 集中管理：
 *   - API 端点 & 默认查询参数
 *   - 天气类型与 WMO code 的映射
 *   - 动画与缓存的超时
 *   - 主题渐变的十六进制颜色
 *
 * 所有模块都从此处读取配置，以便未来可按需扩展。
 */

// -------------- API --------------
export const API = {
  GEOCODE: 'https://geocoding-api.open-meteo.com/v1/search',
  FORECAST: 'https://api.open-meteo.com/v1/forecast',
  // 为避免请求失败时无限重试，设置合理的超时（ms）
  TIMEOUT: 8000,
};

// Open-Meteo 默认查询参数
export const FORECAST_PARAMS = {
  current: [
    'temperature_2m',
    'apparent_temperature',
    'relative_humidity_2m',
    'dew_point_2m',
    'is_day',
    'precipitation',
    'rain',
    'showers',
    'snowfall',
    'weather_code',
    'cloud_cover',
    'pressure_msl',
    'surface_pressure',
    'wind_speed_10m',
    'wind_direction_10m',
    'wind_gusts_10m',
    'visibility',
    'uv_index',
  ],
  hourly: [
    'temperature_2m',
    'weather_code',
    'precipitation_probability',
    'cloud_cover',
    'is_day',
  ],
  daily: [
    'weather_code',
    'temperature_2m_max',
    'temperature_2m_min',
    'apparent_temperature_max',
    'apparent_temperature_min',
    'sunrise',
    'sunset',
    'precipitation_sum',
    'precipitation_hours',
    'wind_speed_10m_max',
    'uv_index_max',
  ],
  timezone: 'auto',
  forecast_days: 7,
};

// -------------- 天气类型映射 --------------
// Open-Meteo WMO weather interpretation codes
// key: code, value: { desc, type, nightType }
export const WEATHER_CODES = {
  0: { desc: '晴朗', type: 'sunny', nightType: 'clear_night' },
  1: { desc: '大部晴朗', type: 'sunny', nightType: 'clear_night' },
  2: { desc: '局部多云', type: 'partly_cloudy', nightType: 'cloudy_night' },
  3: { desc: '阴', type: 'cloudy', nightType: 'cloudy' },
  45: { desc: '雾', type: 'fog', nightType: 'fog' },
  48: { desc: '雾凇', type: 'fog', nightType: 'fog' },
  51: { desc: '小毛毛雨', type: 'drizzle', nightType: 'drizzle' },
  53: { desc: '毛毛雨', type: 'drizzle', nightType: 'drizzle' },
  55: { desc: '强毛毛雨', type: 'drizzle', nightType: 'drizzle' },
  56: { desc: '冻毛毛雨', type: 'snow', nightType: 'snow' },
  57: { desc: '强冻毛毛雨', type: 'snow', nightType: 'snow' },
  61: { desc: '小雨', type: 'rain', nightType: 'rain' },
  63: { desc: '中雨', type: 'rain', nightType: 'rain' },
  65: { desc: '大雨', type: 'heavy_rain', nightType: 'heavy_rain' },
  66: { desc: '冻雨', type: 'snow', nightType: 'snow' },
  67: { desc: '强冻雨', type: 'snow', nightType: 'snow' },
  71: { desc: '小雪', type: 'snow', nightType: 'snow' },
  73: { desc: '中雪', type: 'snow', nightType: 'snow' },
  75: { desc: '大雪', type: 'heavy_snow', nightType: 'heavy_snow' },
  77: { desc: '雪粒', type: 'snow', nightType: 'snow' },
  80: { desc: '阵雨', type: 'rain', nightType: 'rain' },
  81: { desc: '中阵雨', type: 'rain', nightType: 'rain' },
  82: { desc: '强阵雨', type: 'heavy_rain', nightType: 'heavy_rain' },
  85: { desc: '阵雪', type: 'snow', nightType: 'snow' },
  86: { desc: '强阵雪', type: 'heavy_snow', nightType: 'heavy_snow' },
  95: { desc: '雷暴', type: 'thunder', nightType: 'thunder' },
  96: { desc: '雷暴伴小冰雹', type: 'thunder', nightType: 'thunder' },
  99: { desc: '强雷暴伴冰雹', type: 'thunder', nightType: 'thunder' },
};

// 类型 → 中文描述（用于 UI 上显示大标题）
export const WEATHER_TYPES = {
  sunny: '晴朗',
  clear_night: '晴夜',
  partly_cloudy: '局部多云',
  cloudy_night: '夜间多云',
  cloudy: '阴',
  fog: '雾',
  drizzle: '毛毛雨',
  rain: '小雨',
  heavy_rain: '大雨',
  snow: '雪',
  heavy_snow: '大雪',
  thunder: '雷暴',
};

// -------------- 主题颜色 --------------
// 每种天气类型对应一套：背景渐变 & 主色
export const WEATHER_THEMES = {
  sunny: {
    bg1: '#ff914d',
    bg2: '#ffb347',
    accent: '#ffcf68',
  },
  clear_night: {
    bg1: '#0d1b48',
    bg2: '#2d1b69',
    accent: '#c4a6ff',
  },
  partly_cloudy: {
    bg1: '#3d7fd8',
    bg2: '#8ab4f8',
    accent: '#bcdcff',
  },
  cloudy_night: {
    bg1: '#1a2456',
    bg2: '#2c3a78',
    accent: '#9aa8ff',
  },
  cloudy: {
    bg1: '#5c7a9e',
    bg2: '#8aa5c6',
    accent: '#cfd8e3',
  },
  fog: {
    bg1: '#6b7a8a',
    bg2: '#a4b3c3',
    accent: '#e0e6ed',
  },
  drizzle: {
    bg1: '#4c6a9c',
    bg2: '#8aa5c9',
    accent: '#c6d5eb',
  },
  rain: {
    bg1: '#27416b',
    bg2: '#3c5a8c',
    accent: '#9db6d8',
  },
  heavy_rain: {
    bg1: '#1b2c4a',
    bg2: '#2f4566',
    accent: '#6f8db0',
  },
  snow: {
    bg1: '#6fa8c8',
    bg2: '#a8cde0',
    accent: '#e8f2f8',
  },
  heavy_snow: {
    bg1: '#3e6b86',
    bg2: '#6b95af',
    accent: '#c4dae5',
  },
  thunder: {
    bg1: '#1e1c4a',
    bg2: '#2a2a5e',
    accent: '#ffe066',
  },
};

// -------------- 动画 & 缓存 --------------
export const ANIM = {
  NUMBER_ROLL_MS: 900,
  FADE_IN_MS: 420,
  STAGGER_MS: 60,
};

export const CACHE = {
  // 城市坐标缓存：24h
  CITY_TTL: 1000 * 60 * 60 * 24,
  // 天气数据缓存：10min
  WEATHER_TTL: 1000 * 60 * 10,
};

// 默认城市（用户首次进入时）
export const DEFAULT_CITY = {
  name: '北京',
  country: 'China',
  lat: 39.9042,
  lon: 116.4074,
};
