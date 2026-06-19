/**
 * WeatherIcon.js
 *
 * 生成极简风格 SVG 天气图标：
 *   - 线性描边 + 极简填充
 *   - 通过 class 挂钩 CSS keyframes 动画
 *
 * 用法：
 *   createIcon('sunny', { size: 44 });
 *   // => 返回 SVG 字符串
 *
 * 天气类型：sunny | clear-night | partly-cloudy | cloudy
 *           | rain | heavy-rain | snow | heavy-snow | thunder | fog
 */

// 极简线条色：使用 CSS 变量，自动适配深色/浅色主题
const STROKE = 'currentColor';
const FILL = 'currentColor';

/**
 * 统一的 SVG 外壳
 */
function wrap(inner, type, size) {
  const s = size || 44;
  return (
    `<svg class="weather-icon weather-icon--${type}" ` +
    `viewBox="0 0 100 100" width="${s}" height="${s}" ` +
    `xmlns="http://www.w3.org/2000/svg">${inner}</svg>`
  );
}

/* ---------- 晴（白天） ---------- */
function sunny() {
  return (
    `<g fill="none" stroke="${STROKE}" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
       <g class="sun-rays">
         <line x1="50" y1="10" x2="50" y2="22"/>
         <line x1="50" y1="78" x2="50" y2="90"/>
         <line x1="10" y1="50" x2="22" y2="50"/>
         <line x1="78" y1="50" x2="90" y2="50"/>
         <line x1="22" y1="22" x2="30" y2="30"/>
         <line x1="70" y1="70" x2="78" y2="78"/>
         <line x1="22" y1="78" x2="30" y2="70"/>
         <line x1="70" y1="30" x2="78" y2="22"/>
       </g>
       <circle class="sun-core" cx="50" cy="50" r="18" fill="${FILL}" fill-opacity="0.15" stroke-width="2"/>
       <circle class="sun-core" cx="50" cy="50" r="12" fill="${FILL}" fill-opacity="0.25" stroke="none"/>
     </g>`
  );
}

/* ---------- 晴（夜晚） ---------- */
function clearNight() {
  return (
    `<g fill="none" stroke="${STROKE}" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
       <path class="moon" d="M62 28 a 22 22 0 1 0 10 38 a 18 18 0 0 1 -10 -38 z"
             fill="${FILL}" fill-opacity="0.12"/>
       <circle class="moon" cx="32" cy="28" r="1.5" fill="${FILL}" stroke="none" fill-opacity="0.5"/>
       <circle cx="22" cy="48" r="1.2" fill="${FILL}" stroke="none" fill-opacity="0.4"/>
       <circle cx="78" cy="58" r="1.2" fill="${FILL}" stroke="none" fill-opacity="0.35"/>
       <circle cx="72" cy="24" r="1" fill="${FILL}" stroke="none" fill-opacity="0.3"/>
     </g>`
  );
}

/* ---------- 多云 ---------- */
function partlyCloudy() {
  return (
    `<g fill="none" stroke="${STROKE}" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
       <g class="sun-rays" style="opacity:0.8">
         <line x1="35" y1="18" x2="35" y2="26"/>
         <line x1="18" y1="35" x2="26" y2="35"/>
         <line x1="22" y1="22" x2="28" y2="28"/>
         <line x1="44" y1="22" x2="38" y2="28"/>
       </g>
       <circle cx="32" cy="36" r="10" fill="${FILL}" fill-opacity="0.12" stroke-width="1.8"/>
       <path class="cloud" d="M28 62 q -2 -12 8 -18 q 4 -10 18 -8 q 6 -6 14 -2 q 8 -2 12 8
                               q 12 0 12 12 q 0 10 -12 10 h -50 q -12 0 -12 -10 z"
             fill="${FILL}" fill-opacity="0.1"/>
     </g>`
  );
}

/* ---------- 阴（全云） ---------- */
function cloudy() {
  return (
    `<g fill="none" stroke="${STROKE}" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
       <path class="cloud" d="M26 64 q -2 -14 10 -20 q 4 -10 18 -8 q 8 -6 16 -1 q 10 -4 18 6
                               q 14 0 14 14 q 0 12 -14 12 l -60 0 q -12 0 -12 -10 z"
             fill="${FILL}" fill-opacity="0.1"/>
       <path class="cloud" d="M18 82 q -2 -8 8 -12 q 2 -4 6 -4 l 40 0 q 8 0 8 8 q 0 8 -8 8 l -54 0 z"
             fill="${FILL}" fill-opacity="0.08" stroke-width="1.6" style="opacity:0.7"/>
     </g>`
  );
}

/* ---------- 雨 ---------- */
function rain() {
  return (
    `<g fill="none" stroke="${STROKE}" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
       <path class="cloud" d="M26 44 q -2 -14 10 -20 q 4 -10 18 -8 q 8 -6 16 -1 q 10 -4 18 6
                               q 14 0 14 14 q 0 12 -14 12 l -60 0 q -12 0 -12 -10 z"
             fill="${FILL}" fill-opacity="0.1"/>
       <line class="drop" x1="30" y1="62" x2="26" y2="74" stroke-width="2.2"/>
       <line class="drop" x1="46" y1="62" x2="42" y2="76" stroke-width="2.2"/>
       <line class="drop" x1="62" y1="62" x2="58" y2="74" stroke-width="2.2"/>
       <line class="drop" x1="78" y1="62" x2="74" y2="76" stroke-width="2.2"/>
     </g>`
  );
}

/* ---------- 大雨 ---------- */
function heavyRain() {
  return (
    `<g fill="none" stroke="${STROKE}" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
       <path class="cloud" d="M26 40 q -2 -14 10 -20 q 4 -10 18 -8 q 8 -6 16 -1 q 10 -4 18 6
                               q 14 0 14 14 q 0 12 -14 12 l -60 0 q -12 0 -12 -10 z"
             fill="${FILL}" fill-opacity="0.12"/>
       <line class="drop" x1="26" y1="58" x2="22" y2="70" stroke-width="2.2"/>
       <line class="drop" x1="40" y1="58" x2="36" y2="72" stroke-width="2.2"/>
       <line class="drop" x1="54" y1="58" x2="50" y2="72" stroke-width="2.2"/>
       <line class="drop" x1="68" y1="58" x2="64" y2="72" stroke-width="2.2"/>
       <line class="drop" x1="82" y1="58" x2="78" y2="70" stroke-width="2.2"/>
       <line class="drop" x1="34" y1="72" x2="30" y2="84" stroke-width="1.8" style="opacity:0.55"/>
       <line class="drop" x1="50" y1="72" x2="46" y2="84" stroke-width="1.8" style="opacity:0.55"/>
       <line class="drop" x1="66" y1="72" x2="62" y2="86" stroke-width="1.8" style="opacity:0.55"/>
     </g>`
  );
}

/* ---------- 雪 ---------- */
function snow() {
  return (
    `<g fill="none" stroke="${STROKE}" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
       <path class="cloud" d="M26 44 q -2 -14 10 -20 q 4 -10 18 -8 q 8 -6 16 -1 q 10 -4 18 6
                               q 14 0 14 14 q 0 12 -14 12 l -60 0 q -12 0 -12 -10 z"
             fill="${FILL}" fill-opacity="0.1"/>
       <g class="flake" fill="${FILL}" stroke="none" fill-opacity="0.85">
         <path d="M30 64 l0 -4 M30 62 l2 2 M28 62 l2 -2 M26 60 l4 0"/>
       </g>
       <g class="flake" fill="${FILL}" stroke="none" fill-opacity="0.7">
         <path d="M50 70 l0 -4 M50 68 l2 2 M48 68 l2 -2 M46 66 l4 0"/>
       </g>
       <g class="flake" fill="${FILL}" stroke="none" fill-opacity="0.85">
         <path d="M70 66 l0 -4 M70 64 l2 2 M68 64 l2 -2 M66 62 l4 0"/>
       </g>
     </g>`
  );
}

/* ---------- 大雪 ---------- */
function heavySnow() {
  return (
    `<g fill="none" stroke="${STROKE}" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
       <path class="cloud" d="M26 40 q -2 -14 10 -20 q 4 -10 18 -8 q 8 -6 16 -1 q 10 -4 18 6
                               q 14 0 14 14 q 0 12 -14 12 l -60 0 q -12 0 -12 -10 z"
             fill="${FILL}" fill-opacity="0.12"/>
       <g class="flake" stroke="${FILL}" stroke-width="1.5">
         <line x1="26" y1="56" x2="26" y2="62"/>
         <line x1="23" y1="59" x2="29" y2="59"/>
         <line x1="24" y1="57" x2="28" y2="61"/>
         <line x1="24" y1="61" x2="28" y2="57"/>
       </g>
       <g class="flake" stroke="${FILL}" stroke-width="1.5">
         <line x1="46" y1="60" x2="46" y2="66"/>
         <line x1="43" y1="63" x2="49" y2="63"/>
         <line x1="44" y1="61" x2="48" y2="65"/>
         <line x1="44" y1="65" x2="48" y2="61"/>
       </g>
       <g class="flake" stroke="${FILL}" stroke-width="1.5">
         <line x1="66" y1="58" x2="66" y2="64"/>
         <line x1="63" y1="61" x2="69" y2="61"/>
         <line x1="64" y1="59" x2="68" y2="63"/>
         <line x1="64" y1="63" x2="68" y2="59"/>
       </g>
       <g class="flake" stroke="${FILL}" stroke-width="1.5">
         <line x1="82" y1="62" x2="82" y2="68"/>
         <line x1="79" y1="65" x2="85" y2="65"/>
       </g>
     </g>`
  );
}

/* ---------- 雷暴 ---------- */
function thunder() {
  return (
    `<g fill="none" stroke="${STROKE}" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
       <path class="cloud" d="M26 40 q -2 -14 10 -20 q 4 -10 18 -8 q 8 -6 16 -1 q 10 -4 18 6
                               q 14 0 14 14 q 0 12 -14 12 l -60 0 q -12 0 -12 -10 z"
             fill="${FILL}" fill-opacity="0.1"/>
       <polygon class="bolt" points="50,58 42,76 50,76 44,92 60,72 52,72 58,58"
                fill="${FILL}" fill-opacity="0.85" stroke="none"/>
       <polygon class="bolt" points="70,62 64,76 72,76 68,88 80,70 74,70 78,62"
                fill="${FILL}" fill-opacity="0.7" stroke="none" style="animation-delay:0.4s"/>
     </g>`
  );
}

/* ---------- 雾 ---------- */
function fog() {
  return (
    `<g fill="none" stroke="${STROKE}" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
       <path class="cloud" d="M26 44 q -2 -14 10 -20 q 4 -10 18 -8 q 8 -6 16 -1 q 10 -4 18 6
                               q 14 0 14 14 q 0 12 -14 12 l -60 0 q -12 0 -12 -10 z"
             fill="${FILL}" fill-opacity="0.08"/>
       <line x1="18" y1="66" x2="84" y2="66" stroke-width="2" stroke-linecap="round" style="opacity:0.7"/>
       <line x1="22" y1="74" x2="80" y2="74" stroke-width="1.8" stroke-linecap="round" style="opacity:0.55"/>
       <line x1="18" y1="82" x2="82" y2="82" stroke-width="1.6" stroke-linecap="round" style="opacity:0.45"/>
     </g>`
  );
}

/* ---------- 注册表 ---------- */
const TYPES = {
  'sunny': sunny,
  'clear-night': clearNight,
  'partly-cloudy': partlyCloudy,
  'cloudy': cloudy,
  'rain': rain,
  'heavy-rain': heavyRain,
  'snow': snow,
  'heavy-snow': heavySnow,
  'thunder': thunder,
  'fog': fog,
};

/**
 * 对外 API
 * @param {string} type 天气类型 key
 * @param {{size?:number}} opts
 */
export function createIcon(type, opts = {}) {
  const builder = TYPES[type] || cloudy;
  return wrap(builder(), type, opts.size || 44);
}

/**
 * 兼容旧 API — 将天气 code 映射为 type
 * （主应用应直接传精确类型；这里做一个兜底桥接）
 */
export function mapCodeToType(code, isDay = true) {
  if (code <= 1) return isDay ? 'sunny' : 'clear-night';
  if (code <= 2) return isDay ? 'partly-cloudy' : 'cloudy';
  if (code <= 45) return 'fog';
  if (code <= 57) return 'rain';
  if (code <= 67) return 'heavy-rain';
  if (code <= 77) return 'snow';
  if (code <= 82) return 'heavy-rain';
  if (code <= 86) return 'heavy-snow';
  if (code <= 99) return 'thunder';
  return 'cloudy';
}
