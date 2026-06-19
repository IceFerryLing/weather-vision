/**
 * main.js — 应用入口
 *
 * 串联：
 *   - 天气数据服务
 *   - 图标组件
 *   - 图表组件
 *   - DOM 渲染
 *   - 主题切换
 *   - 背景粒子氛围
 */

import { getWeatherByCity, getWeatherByLocation, DEFAULT_CITY } from './js/services/WeatherService.js';
import { createIcon } from './js/components/WeatherIcon.js';
import { drawHourlyChart } from './js/components/chart.js';
import { WEATHER_THEMES } from './js/config/config.js';

/* ============================================================
 * 1. DOM 引用
 * ============================================================ */
const $ = (id) => document.getElementById(id);
const el = {};

function queryDOM() {
  el.heroCity = $('hero-city');
  el.heroDate = $('hero-date');
  el.heroTemp = $('hero-temp');
  el.heroDesc = $('hero-desc');
  el.heroIcon = $('hero-icon');
  el.heroFeels = $('hero-feels');
  el.heroRange = $('hero-range');
  el.sunrise = $('sunrise');
  el.sunset = $('sunset');

  el.metricHumidity = $('metric-humidity');
  el.metricWind = $('metric-wind');
  el.metricPressure = $('metric-pressure');
  el.metricVisibility = $('metric-visibility');
  el.metricUV = $('metric-uv');
  el.metricCloud = $('metric-cloud');
  el.metricUVLevel = $('metric-uv-level');
  el.metricWindSub = document.querySelector('[data-metric-wind]');

  el.barHumidity = $('bar-humidity');
  el.barPressure = $('bar-pressure');
  el.barVisibility = $('bar-visibility');
  el.barCloud = $('bar-cloud');

  el.hourly = $('hourly');
  el.daily = $('daily');

  el.searchInput = $('search-input');
  el.searchBtn = $('search-btn');
  el.geoBtn = $('geo-btn');
  el.error = $('error');

  el.headerDate = $('header-date');
  el.chartCanvas = $('chart-hourly');

  el.app = document.querySelector('.app');
}

/* ============================================================
 * 2. 工具
 * ============================================================ */
function windDirText(deg) {
  if (deg === null || deg === undefined || Number.isNaN(deg)) return '--';
  const dirs = ['北', '东北', '东', '东南', '南', '西南', '西', '西北'];
  return dirs[Math.round(deg / 45) % 8];
}
function uvLevelText(uv) {
  if (uv < 3) return '低';
  if (uv < 6) return '中';
  if (uv < 8) return '高';
  if (uv < 11) return '甚高';
  return '极高';
}

function animateNumber(node, target, { duration = 600 } = {}) {
  if (!node) return;
  const startTs = performance.now();
  const startVal = parseFloat(node.textContent) || 0;
  const tick = (ts) => {
    const p = Math.min(1, (ts - startTs) / duration);
    const eased = 1 - Math.pow(1 - p, 3);
    const v = startVal + (target - startVal) * eased;
    node.textContent = Math.round(v);
    if (p < 1) requestAnimationFrame(tick);
  };
  requestAnimationFrame(tick);
}

/* ============================================================
 * 3. 主题
 * ============================================================ */
function setTheme(type) {
  const theme = WEATHER_THEMES[type] || WEATHER_THEMES.cloudy;
  const root = document.documentElement;
  root.style.setProperty('--theme-accent', theme.accent);
  root.style.setProperty('--accent', theme.accent);
  root.style.setProperty('--accent-strong', theme.accentStrong);
  root.style.setProperty('--status-sun', theme.accent);   // 曲线色呼应主题
  root.style.setProperty('--theme-bg-1', theme.bg1);
  root.style.setProperty('--theme-bg-2', theme.bg2);
  root.style.setProperty('--theme-bg-3', theme.bg3);
}

/* ============================================================
 * 4. 渲染
 * ============================================================ */

function renderHero(data) {
  if (el.heroCity) el.heroCity.textContent = data.city + (data.country ? ` · ${data.country}` : '');
  if (el.heroDate) el.heroDate.textContent = data.dateText;
  if (el.heroDesc) el.heroDesc.textContent = data.desc;
  if (el.heroFeels) el.heroFeels.textContent = `体感 ${data.temp.feels}°`;
  if (el.heroRange) el.heroRange.textContent = `${data.temp.min}° ~ ${data.temp.max}°`;

  if (el.heroTemp) animateNumber(el.heroTemp, data.temp.now, { duration: 900 });
  if (el.heroIcon) el.heroIcon.innerHTML = createIcon(data.type, { size: 180 });

  if (el.sunrise) el.sunrise.textContent = data.sunrise || '--:--';
  if (el.sunset) el.sunset.textContent = data.sunset || '--:--';
}

function renderMetrics(data) {
  if (el.metricHumidity) animateNumber(el.metricHumidity, data.humidity);
  if (el.metricWind) animateNumber(el.metricWind, data.wind.speed);
  if (el.metricPressure) animateNumber(el.metricPressure, data.pressure);
  if (el.metricVisibility) {
    if (el.metricVisibility) el.metricVisibility.textContent = data.visibility.toFixed(1);
  }
  if (el.metricUV) el.metricUV.textContent = data.uv.toFixed(1);
  if (el.metricCloud) animateNumber(el.metricCloud, data.cloud);
  if (el.metricUVLevel) el.metricUVLevel.textContent = `等级：${uvLevelText(data.uv)}`;
  if (el.metricWindSub) el.metricWindSub.textContent = `${windDirText(data.wind.dir)}风 · 阵风 ${data.wind.gust} km/h`;

  // 进度条
  if (el.barHumidity) el.barHumidity.style.width = `${Math.min(100, data.humidity)}%`;
  if (el.barPressure) {
    const pct = Math.min(100, Math.max(20, ((data.pressure - 980) / 60) * 100));
    el.barPressure.style.width = `${pct}%`;
  }
  if (el.barVisibility) {
    const pct = Math.min(100, (data.visibility / 20) * 100);
    el.barVisibility.style.width = `${pct}%`;
  }
  if (el.barCloud) el.barCloud.style.width = `${Math.min(100, data.cloud)}%`;
}

function renderHourly(data) {
  if (!el.hourly) return;
  el.hourly.innerHTML = data.hourly
    .map(
      (h, i) => `
    <div class="hourly-cell">
      <span class="hourly-hour">${h.hour}</span>
      <span class="hourly-icon">${createIcon(h.type, { size: 30 })}</span>
      <span class="hourly-temp">${h.temp}°</span>
      ${h.pop > 0 ? `<span class="hourly-pop">${h.pop}%</span>` : ''}
    </div>`,
    )
    .join('');
}

function renderDaily(data) {
  if (!el.daily) return;
  el.daily.innerHTML = data.daily
    .map(
      (d) => `
    <div class="daily-row">
      <span class="daily-day">${d.day}</span>
      <span class="daily-icon">${createIcon(d.type, { size: 36 })}</span>
      <span class="daily-desc">${d.desc}</span>
      <span class="daily-temp-range">
        <span class="daily-temp-min">${d.tempMin}°</span>
        <span class="daily-temp-bar">
          <span class="daily-temp-bar-fill"></span>
        </span>
        <span class="daily-temp-max">${d.tempMax}°</span>
      </span>
      <span class="daily-pop">${d.pop}mm</span>
    </div>`,
    )
    .join('');
}

function renderChart(data) {
  if (!el.chartCanvas || !data || !data.hourly || data.hourly.length < 2) return;
  const temps = data.hourly.map((h) => h.temp);
  const pops = data.hourly.map((h) => h.pop);
  const labels = data.hourly.map((h) => h.label);
  drawHourlyChart(el.chartCanvas, {
    temperatures: temps,
    precipitations: pops,
    labels,
  });
}

function renderHeaderTime() {
  if (!el.headerDate) return;
  const now = new Date();
  const weekdays = ['周日', '周一', '周二', '周三', '周四', '周五', '周六'];
  el.headerDate.textContent = `${weekdays[now.getDay()]} · ${
    String(now.getMonth() + 1).padStart(2, '0')
  }/${String(now.getDate()).padStart(2, '0')} · ${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
}

function showError(msg) {
  if (!el.error) return;
  el.error.textContent = msg || '';
  el.error.classList.toggle('visible', !!msg);
  if (msg) {
    clearTimeout(showError._t);
    showError._t = setTimeout(() => el.error.classList.remove('visible'), 5000);
  }
}

/* ============================================================
 * 5. 主流程
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
    renderChart(data);

    renderHeaderTime();
  } catch (err) {
    console.error('[WeatherVision]', err);
    showError(`⚠ ${err.message || err}`);
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
    renderChart(data);
    renderHeaderTime();
  } catch (err) {
    console.error('[WeatherVision][geo]', err);
    showError(`⚠ 定位失败：${err.message || err}`);
  } finally {
    document.body.classList.remove('is-loading');
  }
}

/* ============================================================
 * 6. 背景粒子 — 极轻量
 * ============================================================ */
function initParticles() {
  const canvas = document.getElementById('bg-particles');
  if (!canvas || !canvas.getContext) return;
  const ctx = canvas.getContext('2d');
  let particles = [];
  let raf = 0;

  function resize() {
    canvas.width = window.innerWidth * (window.devicePixelRatio || 1);
    canvas.height = window.innerHeight * (window.devicePixelRatio || 1);
    canvas.style.width = window.innerWidth + 'px';
    canvas.style.height = window.innerHeight + 'px';

    const count = Math.min(60, Math.floor((window.innerWidth * window.innerHeight) / 24000));
    particles = new Array(count).fill(0).map(() => ({
      x: Math.random() * canvas.width,
      y: Math.random() * canvas.height,
      r: Math.random() * 1.5 + 0.5,
      vx: (Math.random() - 0.5) * 0.18,
      vy: -Math.random() * 0.3 - 0.05,
      alpha: Math.random() * 0.35 + 0.1,
    }));
  }

  function tick() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    for (let i = 0; i < particles.length; i++) {
      const p = particles[i];
      p.x += p.vx;
      p.y += p.vy;
      if (p.y < -10) { p.y = canvas.height + 10; p.x = Math.random() * canvas.width; }
      if (p.x < -10) p.x = canvas.width + 10;
      if (p.x > canvas.width + 10) p.x = -10;

      ctx.beginPath();
      ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(180, 200, 255, ${p.alpha})`;
      ctx.fill();
    }
    raf = requestAnimationFrame(tick);
  }

  resize();
  window.addEventListener('resize', resize);
  tick();
}

/* ============================================================
 * 7. 事件绑定
 * ============================================================ */
function bindEvents() {
  // 搜索按钮
  el.searchBtn?.addEventListener('click', () => {
    const v = (el.searchInput?.value || '').trim();
    if (v) load(v);
  });

  // 输入框回车
  el.searchInput?.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') {
      const v = e.target.value.trim();
      if (v) load(v);
    }
  });

  // 定位按钮
  el.geoBtn?.addEventListener('click', loadByLocation);

  // 浅色模式切换
  document.querySelectorAll('[data-mode]').forEach((btn) => {
    btn.addEventListener('click', () => {
      const mode = btn.getAttribute('data-mode');
      if (mode === 'light') {
        document.body.setAttribute('data-theme', 'light');
      } else {
        document.body.removeAttribute('data-theme');
      }
      document.querySelectorAll('[data-mode]').forEach((b) => b.classList.toggle('is-active', b === btn));
    });
  });

  // 窗口变化 — 重绘图表
  let resizeTimer = 0;
  window.addEventListener('resize', () => {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(() => {
      if (window._lastWeatherData) renderChart(window._lastWeatherData);
    }, 200);
  });
}

/* ============================================================
 * 8. 启动
 * ============================================================ */
document.addEventListener('DOMContentLoaded', () => {
  queryDOM();
  bindEvents();
  initParticles();
  renderHeaderTime();
  setInterval(renderHeaderTime, 60 * 1000);

  // 初始加载默认城市
  load(DEFAULT_CITY.name);
});
