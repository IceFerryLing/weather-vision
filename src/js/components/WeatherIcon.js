/**
 * components/WeatherIcon.js —— 动态 SVG 天气图标
 *
 * 为每种 type 生成一份有层次感的 SVG，包含：
 *   - 阳光：核心发光 + 旋转光线
 *   - 云：2 层，带渐变 + 微浮
 *   - 雨滴：3~4 颗带尾迹
 *   - 雪花：6 角星
 *   - 雷暴：黄色闪电
 *   - 雾：水平条纹
 *   - 月亮 + 星光
 *
 * 使用：WeatherIcon.create(type, size)
 */

/** 生成一个天气图标字符串；可设置外层 icon-size。 */
export function createIcon(type, opts = {}) {
  const size = opts.size || 120;
  const builder = ICONS[type] || ICONS.cloudy;
  const inner = builder();
  return `
    <svg class="weather-icon" viewBox="0 0 100 100" width="${size}" height="${size}" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <radialGradient id="glow-${type}" cx="50%" cy="40%" r="60%">
          <stop offset="0%" stop-color="#ffffff" stop-opacity="0.9"/>
          <stop offset="60%" stop-color="#ffffff" stop-opacity="0.2"/>
          <stop offset="100%" stop-color="#ffffff" stop-opacity="0"/>
        </radialGradient>
        <linearGradient id="sunGrad-${type}" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stop-color="#ffd36a"/>
          <stop offset="60%" stop-color="#ffb347"/>
          <stop offset="100%" stop-color="#ff7f3f"/>
        </linearGradient>
        <linearGradient id="cloudGrad-${type}" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stop-color="#f3f7ff" stop-opacity="0.98"/>
          <stop offset="100%" stop-color="#9fb5d6" stop-opacity="0.95"/>
        </linearGradient>
        <linearGradient id="cloudDarkGrad-${type}" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stop-color="#7a8aa5" stop-opacity="0.9"/>
          <stop offset="100%" stop-color="#3a4763" stop-opacity="0.95"/>
        </linearGradient>
        <linearGradient id="rainGrad-${type}" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stop-color="#a6d8ff" stop-opacity="0"/>
          <stop offset="100%" stop-color="#3b82f6" stop-opacity="0.95"/>
        </linearGradient>
        <linearGradient id="moonGrad-${type}" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stop-color="#ffffff" stop-opacity="1"/>
          <stop offset="60%" stop-color="#e8ecff" stop-opacity="0.95"/>
          <stop offset="100%" stop-color="#b9c2e6" stop-opacity="0.85"/>
        </linearGradient>
      </defs>
      ${inner}
    </svg>
  `;
}

/* -------------------- icon builders -------------------- */

const sunCore = (cx, cy, r, gradientKey) => `
  <g class="sun-rays" style="transform-origin:${cx}px ${cy}px; animation: spin 22s linear infinite;">
    ${[0, 30, 60, 90, 120, 150, 180, 210, 240, 270, 300, 330]
      .map(
        (deg) =>
          `<line x1="${cx}" y1="${cy - r - 3}" x2="${cx}" y2="${cy - r - 10}"
            stroke="${gradientKey === 'sun' ? '#ffb347' : '#c0cbe0'}" stroke-width="2.2" stroke-linecap="round"
            transform="rotate(${deg} ${cx} ${cy})" opacity="0.7"/>`,
      )
      .join('')}
  </g>
  <circle cx="${cx}" cy="${cy}" r="${r + 4}" fill="url(#glow-sunny)" opacity="0.5"/>
  <circle cx="${cx}" cy="${cy}" r="${r}" fill="${gradientKey === 'sun' ? 'url(#sunGrad-sunny)' : '#ffffff'}" stroke="rgba(255,255,255,0.9)" stroke-width="1.5"/>
`;

const cloud = (cx, cy, scale = 1, dark = false) => {
  const grad = dark ? `url(#cloudDarkGrad-sunny)` : `url(#cloudGrad-sunny)`;
  return `
    <g class="cloud" style="transform-origin:${cx}px ${cy}px; animation: float 6s ease-in-out infinite;">
      <ellipse cx="${cx - 10 * scale}" cy="${cy + 2}" rx="${14 * scale}" ry="${10 * scale}" fill="${grad}" />
      <ellipse cx="${cx + 8 * scale}" cy="${cy}" rx="${12 * scale}" ry="${9 * scale}" fill="${grad}" />
      <ellipse cx="${cx}" cy="${cy - 6 * scale}" rx="${12 * scale}" ry="${9 * scale}" fill="${grad}" />
      <ellipse cx="${cx + 2 * scale}" cy="${cy + 4 * scale}" rx="${16 * scale}" ry="${8 * scale}" fill="${grad}" />
    </g>
  `;
};

const rainDrops = (cx, cy) =>
  [0, 10, -10, 18, -18]
    .map(
      (offset, i) => `
    <line class="drop drop-${i}" x1="${cx + offset}" y1="${cy}" x2="${cx + offset - 3}" y2="${cy + 14}"
      stroke="url(#rainGrad-sunny)" stroke-width="2.2" stroke-linecap="round"/>
  `,
    )
    .join('');

const snowFlakes = (cx, cy) =>
  [0, 12, -12, 20, -20]
    .map(
      (offset, i) => `
    <g class="flake flake-${i}" style="animation: snow-fall 3.5s ease-in ${i * 0.3}s infinite; transform-origin:${cx + offset}px ${cy}px;">
      <circle cx="${cx + offset}" cy="${cy}" r="2.2" fill="#ffffff" opacity="0.95"/>
    </g>
  `,
    )
    .join('');

const lightning = (cx, cy) => `
  <g class="bolt" style="animation: bolt 1.6s ease-in-out infinite;">
    <path d="M${cx - 2} ${cy - 10} L${cx + 3} ${cy - 2} L${cx - 3} ${cy + 2} L${cx + 5} ${cy + 14}
      L${cx} ${cy + 4} L${cx + 4} ${cy - 2} Z" fill="#ffd84d" stroke="#fff5a0" stroke-width="0.8"/>
  </g>
`;

const fogLines = (cx, cy) => {
  const lines = [];
  for (let i = 0; i < 4; i++) {
    lines.push(
      `<rect x="${cx - 18}" y="${cy + i * 6}" width="36" height="3.5" rx="1.75"
        fill="rgba(255,255,255,0.4)" opacity="${0.6 - i * 0.12}"/>`,
    );
  }
  return lines.join('');
};

/* -------------------- 每种天气类型 -------------------- */

const ICONS = {
  // 晴
  sunny: () => `
    ${sunCore(50, 48, 18, 'sun')}
  `,
  clear_night: () => `
    <g>
      <circle cx="52" cy="48" r="18" fill="url(#moonGrad-sunny)" stroke="rgba(255,255,255,0.5)" stroke-width="1"/>
      <circle cx="60" cy="42" r="14" fill="#0b1020" opacity="0.95"/>
    </g>
    <g opacity="0.9">
      <circle cx="22" cy="30" r="1.2" fill="#ffffff"/>
      <circle cx="80" cy="70" r="1.2" fill="#ffffff"/>
      <circle cx="30" cy="75" r="0.8" fill="#ffffff" opacity="0.7"/>
      <circle cx="72" cy="22" r="0.8" fill="#ffffff" opacity="0.7"/>
    </g>
  `,
  // 多云
  partly_cloudy: () => `
    ${sunCore(38, 40, 12, 'sun')}
    ${cloud(60, 60, 1.0)}
  `,
  cloudy_night: () => `
    <g>
      <circle cx="35" cy="38" r="13" fill="url(#moonGrad-sunny)" stroke="rgba(255,255,255,0.4)" stroke-width="1"/>
      <circle cx="41" cy="33" r="10" fill="#0b1020" opacity="0.95"/>
    </g>
    ${cloud(62, 62, 1.05, false)}
  `,
  cloudy: () => `
    ${cloud(50, 50, 1.2, false)}
    ${cloud(40, 60, 0.7, false)}
  `,
  // 毛毛雨 / 雨
  drizzle: () => `
    ${cloud(50, 42, 1.0, false)}
    ${rainDrops(40, 58)}
    ${rainDrops(65, 58)}
  `,
  rain: () => `
    ${cloud(50, 40, 1.1, true)}
    ${rainDrops(35, 58)}
    ${rainDrops(55, 58)}
    ${rainDrops(75, 58)}
  `,
  heavy_rain: () => `
    ${cloud(50, 38, 1.2, true)}
    ${rainDrops(28, 58)}
    ${rainDrops(48, 58)}
    ${rainDrops(68, 58)}
    ${rainDrops(82, 58)}
  `,
  // 雪
  snow: () => `
    ${cloud(50, 40, 1.1, false)}
    ${snowFlakes(40, 60)}
    ${snowFlakes(70, 60)}
  `,
  heavy_snow: () => `
    ${cloud(50, 38, 1.15, true)}
    ${snowFlakes(30, 60)}
    ${snowFlakes(50, 60)}
    ${snowFlakes(70, 60)}
  `,
  // 雷暴
  thunder: () => `
    ${cloud(50, 40, 1.1, true)}
    ${lightning(50, 60)}
    ${rainDrops(30, 68)}
    ${rainDrops(70, 68)}
  `,
  // 雾
  fog: () => `
    ${fogLines(50, 48)}
    ${cloud(50, 68, 0.9, false)}
  `,
};

/* -------------------- CSS keyframes（内联到 <style>） -------------------- */

export const ICON_STYLE = `
@keyframes spin { from { transform: rotate(0); } to { transform: rotate(360deg); } }
@keyframes float {
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(-3px); }
}
@keyframes drop {
  0% { transform: translateY(0); opacity: 0; }
  20% { opacity: 1; }
  100% { transform: translateY(22px); opacity: 0; }
}
@keyframes snow-fall {
  0% { transform: translate(0, 0); opacity: 0; }
  20% { opacity: 1; }
  100% { transform: translate(-3px, 28px); opacity: 0; }
}
@keyframes bolt {
  0%, 70%, 100% { opacity: 0.85; transform: scale(1); filter: drop-shadow(0 0 0 rgba(255,216,77,0)); }
  75% { opacity: 1; transform: scale(1.12); filter: drop-shadow(0 0 10px rgba(255,216,77,0.9)); }
}
.drop-0 { animation: drop 1.2s ease-in infinite; }
.drop-1 { animation: drop 1.2s ease-in 0.15s infinite; }
.drop-2 { animation: drop 1.2s ease-in 0.3s infinite; }
.drop-3 { animation: drop 1.2s ease-in 0.45s infinite; }
.drop-4 { animation: drop 1.2s ease-in 0.6s infinite; }
`;

/** 将 <style> 注入到 <head>（只执行一次）。 */
let _injected = false;
export function injectStyle() {
  if (_injected || typeof document === 'undefined') return;
  const style = document.createElement('style');
  style.textContent = ICON_STYLE;
  document.head.appendChild(style);
  _injected = true;
}

export default { createIcon, injectStyle };
