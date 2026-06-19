/**
 * config.js
 *
 * 全局配置：
 *   - 默认城市
 *   - Open-Meteo 天气代码 → 描述/图标类型/主题色
 *   - 主题色配置（配合 CSS 变量 --theme-accent 等）
 *
 * 天气代码参考：https://open-meteo.com/en/docs
 */

export const DEFAULT_CITY = {
  name: 'Beijing',
  displayName: '北京',
};

/**
 * 天气主题色 — 每个 type 对应一组强调色
 * 主应用会在 setTheme(type) 时把这些值写入 CSS 变量：
 *   --accent / --accent-strong / --status-sun / --theme-bg-1..3
 */
export const WEATHER_THEMES = {
  sunny: {
    accent: '#e8c887',      // 暖柔黄
    accentStrong: '#cfa45c',
    bg1: '#141826',
    bg2: '#1c1a24',
    bg3: '#2b2628',
    desc: '晴',
  },
  'clear-night': {
    accent: '#b8a8d9',      // 柔紫
    accentStrong: '#8d78b8',
    bg1: '#0a0a18',
    bg2: '#14142a',
    bg3: '#221f3a',
    desc: '晴夜',
  },
  'partly-cloudy': {
    accent: '#a8c3d9',      // 柔蓝
    accentStrong: '#6d93b8',
    bg1: '#0e151f',
    bg2: '#182030',
    bg3: '#232f43',
    desc: '多云',
  },
  cloudy: {
    accent: '#aab4bf',      // 冷灰
    accentStrong: '#77818f',
    bg1: '#0c1118',
    bg2: '#151b24',
    bg3: '#212a36',
    desc: '阴',
  },
  fog: {
    accent: '#b9b8b0',      // 雾灰
    accentStrong: '#7f7f75',
    bg1: '#0e1114',
    bg2: '#181c20',
    bg3: '#24282c',
    desc: '雾',
  },
  rain: {
    accent: '#8ab0cf',      // 冷蓝
    accentStrong: '#5a8bb8',
    bg1: '#0a1018',
    bg2: '#121c2a',
    bg3: '#1e2e42',
    desc: '小雨',
  },
  'heavy-rain': {
    accent: '#6fa8cf',      // 更冷的蓝
    accentStrong: '#4078a8',
    bg1: '#080f18',
    bg2: '#0f1a28',
    bg3: '#17263a',
    desc: '大雨',
  },
  snow: {
    accent: '#cfd8e3',      // 冷青白
    accentStrong: '#94a4b8',
    bg1: '#0c1118',
    bg2: '#151c26',
    bg3: '#222b3a',
    desc: '雪',
  },
  'heavy-snow': {
    accent: '#c8d4e0',
    accentStrong: '#8a9bb0',
    bg1: '#0a0f18',
    bg2: '#131822',
    bg3: '#1e2430',
    desc: '大雪',
  },
  thunder: {
    accent: '#c5b0d8',      // 柔紫
    accentStrong: '#8f7bb0',
    bg1: '#0b0a18',
    bg2: '#151326',
    bg3: '#242244',
    desc: '雷暴',
  },
};

/**
 * Open-Meteo weather code → 统一类型
 * type 用于：图标选择 + 主题切换
 */
export function codeToType(code, isDay = true) {
  if (code === undefined || code === null) return 'cloudy';

  if (code === 0) return isDay ? 'sunny' : 'clear-night';

  if (code <= 2) return isDay ? 'partly-cloudy' : 'cloudy';
  if (code <= 3) return 'cloudy';

  if (code <= 48) return 'fog';

  // 毛毛雨 / 雨
  if (code <= 57) return 'rain';
  if (code <= 67) return 'heavy-rain';

  // 雪
  if (code <= 77) return 'snow';
  if (code <= 82) return 'heavy-rain';
  if (code <= 86) return 'heavy-snow';

  // 雷暴
  if (code <= 99) return 'thunder';

  return 'cloudy';
}

/** 简短中文描述 */
export function codeToDesc(code) {
  if (code === undefined || code === null) return '多云';
  const table = {
    0: '晴朗', 1: '大部晴朗', 2: '局部多云', 3: '阴',
    45: '雾', 48: '雾凇',
    51: '小毛毛雨', 53: '中毛毛雨', 55: '大毛毛雨',
    56: '冻毛毛雨', 57: '强冻毛毛雨',
    61: '小雨', 63: '中雨', 65: '大雨',
    66: '冻雨', 67: '强冻雨',
    71: '小雪', 73: '中雪', 75: '大雪', 77: '雪粒',
    80: '阵雨', 81: '强阵雨', 82: '暴阵雨',
    85: '阵雪', 86: '强阵雪',
    95: '雷暴', 96: '雷暴伴冰雹', 99: '强雷暴伴冰雹',
  };
  return table[code] || '多云';
}
