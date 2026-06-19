/**
 * main.js —— 应用入口
 *
 * 职责：
 *   1) 启动时加载默认城市天气并渲染整页
 *   2) 绑定搜索栏 / 定位按钮事件
 *   3) 管理主题（根据天气 type 切换背景色）
 *   4) 数字动画（简单的 roll 效果）
 *   5) 背景粒子（简易 canvas，制造科技感氛围）
 */

import { getWeatherByCity, getWeatherByLocation } from './js/services/WeatherService.js';
import { createIcon, injectStyle as injectIconStyle } from './js/components/WeatherIcon.js';
import { WEATHER_THEMES, DEFAULT_CITY } from './js/config/config.js';

// 为图标动画注入 keyframes
injectIconStyle();

/* ============================================================
 * DOM 引用 —— 在 DOMContentLoaded 之后再获取
 * ============================================================ */
const el = {};

function queryDOM() {
  el.heroCity = document.getElementById('hero-city');
  el.heroDate = document.getElementById('hero-date');
  el.heroTemp = document.getElementById('hero-temp');
  el.heroDesc = document.getElementById('hero-desc');
  el.heroRange = document.getElementById('hero-range');
  el.heroFeels = document.getElementById('hero-feels');
  el.heroIcon = document.getElementById('hero-icon');

  el.metricHumidity = document.getElementById('metric-humidity');
  el.metricWind = document.getElementById('metric-wind');
  el.metricPressure = document.getElementById('metric-pressure');
  el.metricVisibility = document.getElementById('metric-visibility');
  el.metricUV = document.getElementById('metric-uv');

  el.hourly = document.getElementById('hourly');
  el.daily = document.getElementById('daily');
  el.sunrise = document.getElementById('sunrise');
  el.sunset = document.getElementById('sunset');

  el.searchInput = document.getElementById('search-input');
  el.searchBtn = document.getElementById('search-btn');
  el.geoBtn = document.getElementById('geo-btn');

  el.error = document.getElementById('error');
  el.headerDate = document.getElementById('header-date');
}

/* ============================================================
 * 数字滚动：从 0 平滑到目标值
 * ============================================================ */
function animateNumber(node, target, { suffix = '', duration = 600, decimals = 0 } = {}) {
  if (!node) return;
  const startTs = performance.now();
  const tick = (ts) => {
    const p = Math.min(1, (ts - startTs) / duration);
    // easeOutCubic
    const eased = 1 - Math.pow(1 - p, 3);
    const value = target * eased;
    node.textContent =
      decimals > 0 ? `${value.toFixed(decimals)}${suffix}` : `${Math.round(value)}${suffix}`;
    if (p < 1) requestAnimationFrame(tick);
  };
  requestAnimationFrame(tick);
}

/* ============================================================
 * 风向度数 → 中文描述
 * ============================================================ */
function windDirText(deg) {
  if (deg === null || deg === undefined || Number.isNaN(deg)) return '--';
  const dirs = ['北', '东北', '东', '东南', '南', '西南', '西', '西北'];
  return dirs[Math.round(deg / 45) % 8];
}

/* ============================================================
 * 渲染逻辑
 * ============================================================ */

function setTheme(type) {
  const theme = WEATHER_THEMES[type] || WEATHER_THEMES.cloudy;
  document.documentElement.style.setProperty('--theme-bg-1', theme.bg1);
  document.documentElement.style.setProperty('--theme-bg-2', theme.bg2);
  document.documentElement.style.setProperty('--theme-accent', theme.accent);
}

function renderHero(data) {
  if (el.heroCity) el.heroCity.textContent = data.city;
  if (el.heroDate) el.heroDate.textContent = data.dateText;
  if (el.heroDesc) el.heroDesc.textContent = data.desc;
  if (el.heroRange) el.heroRange.textContent = `${data.temp.min}° ~ ${data.temp.max}°`;
  if (el.heroFeels) el.heroFeels.textContent = `体感 ${data.temp.feels}°`;

  if (el.heroTemp) {
    animateNumber(el.heroTemp, data.temp.now, { suffix: '°', duration: 900 });
  }

  if (el.heroIcon) {
    el.heroIcon.innerHTML = createIcon(data.type, { size: 220 });
  }
}

function renderMetrics(data) {
  if (el.metricHumidity) animateNumber(el.metricHumidity, data.humidity, { suffix: '%', duration: 700 });
  if (el.metricWind) animateNumber(el.metricWind, data.wind.speed, { suffix: ' km/h', duration: 700 });
  if (el.metricPressure) animateNumber(el.metricPressure, data.pressure, { suffix: ' hPa', duration: 700 });
  if (el.metricVisibility) animateNumber(el.metricVisibility, data.visibility, { suffix: ' km', duration: 700, decimals: 1 });
  if (el.metricUV) animateNumber(el.metricUV, data.uv, { duration: 700, decimals: 1 });

  // 风向+阵风的文字说明
  const windText = document.querySelector('[data-metric-wind]');
  if (windText) windText.textContent = `${windDirText(data.wind.dir)}风 · 阵风 ${data.wind.gust}`;
}

function renderHourly(data) {
  if (!el.hourly) return;
  el.hourly.innerHTML = data.hourly
    .map(
      (h, i) => `
    <div class="hourly-item" style="animation-delay:${i * 40}ms">
      <span class="hourly-hour">${h.hour}</span>
      <span class="hourly-icon">${createIcon(h.type, { size: 44 })}</span>
      <span class="hourly-temp">${h.temp}°</span>
      <span class="hourly-pop">${h.pop}%</span>
    </div>
  `,
    )
    .join('');
}

function renderDaily(data) {
  if (!el.daily) return;
  el.daily.innerHTML = data.daily
    .map(
      (d, i) => `
    <div class="daily-row" style="animation-delay:${i * 40}ms">
      <span class="daily-day">${d.day}</span>
      <span class="daily-icon">${createIcon(d.type, { size: 40 })}</span>
      <span class="daily-desc">${d.desc}</span>
      <span class="daily-temp">
        <span class="daily-min">${d.tempMin}°</span>
        <span class="daily-bar"><span style="width:100%"></span></span>
        <span class="daily-max">${d.tempMax}°</span>
      </span>
      <span class="daily-pop">${d.pop}mm</span>
    </div>
  `,
    )
    .join('');
}

function renderSunrise(data) {
  if (el.sunrise) el.sunrise.textContent = data.sunrise || '--:--';
  if (el.sunset) el.sunset.textContent = data.sunset || '--:--';
}

function renderHeaderDate() {
  if (!el.headerDate) return;
  const now = new Date();
  const weekdays = ['周日', '周一', '周二', '周三', '周四', '周五', '周六'];
  el.headerDate.textContent = `${weekdays[now.getDay()]} · ${
    String(now.getMonth() + 1).padStart(2, '0')
  }月${String(now.getDate()).padStart(2, '0')}日 · ${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
}

function showError(msg) {
  if (!el.error) return;
  el.error.textContent = msg || '';
  el.error.classList.toggle('visible', !!msg);
}

/* ============================================================
 * 主流程
 * ============================================================ */

async function load(query) {
  showError('');
  document.body.classList.add('is-loading');
  try {
    const data = await getWeatherByCity(query);
    setTheme(data.type);
    renderHero(data);
    renderMetrics(data);
    renderHourly(data);
    renderDaily(data);
    renderSunrise(data);
  } catch (err) {
    console.error('[WeatherVision]', err);
    showError(`⚠ ${err.message}`);
  } finally {
    document.body.classList.remove('is-loading');
  }
}

async function loadByLocation() {
  showError('');
  document.body.classList.add('is-loading');
  try {
    const data = await getWeatherByLocation();
    setTheme(data.type);
    renderHero(data);
    renderMetrics(data);
    renderHourly(data);
    renderDaily(data);
    renderSunrise(data);
  } catch (err) {
    console.error('[WeatherVision][geo]', err);
    showError(`⚠ 无法使用定位：${err.message}`);
  } finally {
    document.body.classList.remove('is-loading');
  }
}

/* ============================================================
 * 背景粒子（轻量化，仅制造氛围；无外部依赖）
 * ============================================================ */
function initParticles() {
  const canvas = document.getElementById('bg-particles');
  if (!canvas || !canvas.getContext) return;
  const ctx = canvas.getContext('2d');
  let particles = [];
  let w = 0;
  let h = 0;

  function resize() {
    w = canvas.width = window.innerWidth * window.devicePixelRatio;
    h = canvas.height = window.innerHeight * window.devicePixelRatio;
    canvas.style.width = window.innerWidth + 'px';
    canvas.style.height = window.innerHeight + 'px';
    const count = Math.min(90, Math.floor((window.innerWidth * window.innerHeight) / 16000));
    particles = new Array(count).fill(0).map(() => ({
      x: Math.random() * w,
      y: Math.random() * h,
      r: Math.random() * 1.4 + 0.6,
      vx: (Math.random() - 0.5) * 0.15,
      vy: -Math.random() * 0.25 - 0.05,
      alpha: Math.random() * 0.5 + 0.1,
    }));
  }

  function tick() {
    ctx.clearRect(0, 0, w, h);
    for (let i = 0; i < particles.length; i++) {
      const p = particles[i];
      p.x += p.vx;
      p.y += p.vy;
      if (p.y < -10) {
        p.y = h + 10;
        p.x = Math.random() * w;
      }
      if (p.x < -10) p.x = w + 10;
      if (p.x > w + 10) p.x = -10;

      ctx.beginPath();
      ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(180, 200, 255, ${p.alpha})`;
      ctx.fill();
    }
    requestAnimationFrame(tick);
  }

  resize();
  window.addEventListener('resize', resize);
  tick();
}

/* ============================================================
 * 事件绑定
 * ============================================================ */

function bindEvents() {
  if (el.searchBtn) {
    el.searchBtn.addEventListener('click', () => {
      const val = (el.searchInput?.value || '').trim();
      if (val) load(val);
    });
  }
  if (el.searchInput) {
    el.searchInput.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') {
        const val = e.target.value.trim();
        if (val) load(val);
      }
    });
  }
  if (el.geoBtn) {
    el.geoBtn.addEventListener('click', loadByLocation);
  }
}

/* ============================================================
 * 启动
 * ============================================================ */

document.addEventListener('DOMContentLoaded', () => {
  queryDOM();
  bindEvents();
  renderHeaderDate();
  initParticles();
  load(DEFAULT_CITY.name);

  // 每分钟更新 header 时间
  setInterval(renderHeaderDate, 60 * 1000);
});
