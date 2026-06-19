/**
 * chart.js
 *
 * 极简折线图：绘制 24h 温度曲线 + 降水概率区域
 * 特点：
 *   - 纯 Canvas 2D，无任何依赖
 *   - DPR 自适应，高清屏不糊
 *   - 柔和渐变填充曲线下方区域
 *   - 弱化网格，仅显示关键刻度
 *   - 支持 hover 显示 tooltip
 *
 * 用法：
 *   drawHourlyChart(canvasEl, {
 *     temperatures: [12, 13, 14, ...],  // °C
 *     precipitations: [0, 0, 12, ...],   // %
 *     labels: ['00','01',...],           // 时间标签
 *   });
 */

export function drawHourlyChart(canvas, data) {
  if (!canvas || !data || !data.temperatures || data.temperatures.length === 0) {
    return;
  }

  // 清理旧 tooltip
  const oldTip = canvas.parentNode?.querySelector('.chart-tooltip');
  if (oldTip) oldTip.remove();

  const dpr = window.devicePixelRatio || 1;
  const rect = canvas.getBoundingClientRect();
  const width = rect.width;
  const height = rect.height;
  canvas.width = Math.floor(width * dpr);
  canvas.height = Math.floor(height * dpr);

  const ctx = canvas.getContext('2d');
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

  // 读取主题色（与 CSS tokens 对齐）
  const styles = getComputedStyle(document.documentElement);
  const accent = styles.getPropertyValue('--accent').trim() || '#7a9bb8';
  const accentStrong = styles.getPropertyValue('--accent-strong').trim() || '#5a8bb0';
  const statusSun = styles.getPropertyValue('--state-sunny').trim() || '#e8c887';
  const textPri = styles.getPropertyValue('--text-primary').trim() || 'rgba(255,255,255,0.88)';
  const textTer = styles.getPropertyValue('--text-tertiary').trim() || 'rgba(255,255,255,0.38)';
  const border = styles.getPropertyValue('--border-card').trim() || 'rgba(255,255,255,0.08)';

  // 内边距
  const padX = 16;
  const padTop = 16;
  const padBottom = 32;
  const chartW = Math.max(width - padX * 2, 1);
  const chartH = Math.max(height - padTop - padBottom, 1);

  // 准备数据
  const temps = data.temperatures;
  const pops = data.precipitations || new Array(temps.length).fill(0);
  const labels = data.labels || new Array(temps.length).fill('');

  // y 轴范围
  let tMin = Math.min(...temps);
  let tMax = Math.max(...temps);
  if (tMin === tMax) { tMin -= 1; tMax += 1; }
  const tRange = (tMax - tMin) || 1;
  const yMin = tMin - tRange * 0.25;
  const yMax = tMax + tRange * 0.25;
  const ySpan = yMax - yMin;

  const n = temps.length;
  const xAt = (i) => padX + (chartW * i) / (n - 1);
  const yAt = (t) => padTop + chartH - ((t - yMin) / ySpan) * chartH;

  // === 1. 网格线（3 条，极弱化）===
  ctx.strokeStyle = border;
  ctx.lineWidth = 1;
  ctx.setLineDash([4, 6]);
  const gridLines = 3;
  for (let i = 0; i <= gridLines; i++) {
    const y = padTop + (chartH * i) / gridLines;
    ctx.beginPath();
    ctx.moveTo(padX, y);
    ctx.lineTo(width - padX, y);
    ctx.stroke();
  }
  ctx.setLineDash([]);

  // === 2. 降水概率柱（底部半透明）===
  const barMaxH = chartH * 0.35;
  const barW = Math.max(2, chartW / n * 0.45);
  for (let i = 0; i < n; i++) {
    if (!pops[i]) continue;
    const h = (pops[i] / 100) * barMaxH;
    if (h < 0.5) continue;
    const x = xAt(i);
    const y = height - padBottom - h;
    ctx.fillStyle = withAlpha(accent, 0.18);
    ctx.fillRect(x - barW / 2, y, barW, h);
    ctx.fillStyle = withAlpha(accentStrong, 0.55);
    ctx.fillRect(x - barW / 2, y, barW, 1);
  }

  // === 3. 温度曲线 — 渐变填充 + 主线 + 描点 ===
  const grad = ctx.createLinearGradient(0, padTop, 0, padTop + chartH);
  grad.addColorStop(0, withAlpha(statusSun, 0.28));
  grad.addColorStop(0.5, withAlpha(accent, 0.16));
  grad.addColorStop(1, withAlpha(accent, 0.02));

  // 平滑路径
  function buildPath() {
    ctx.beginPath();
    ctx.moveTo(xAt(0), yAt(temps[0]));
    for (let i = 0; i < n - 1; i++) {
      const p0 = { x: xAt(Math.max(0, i - 1)), y: yAt(temps[Math.max(0, i - 1)]) };
      const p1 = { x: xAt(i), y: yAt(temps[i]) };
      const p2 = { x: xAt(i + 1), y: yAt(temps[i + 1]) };
      const p3 = { x: xAt(Math.min(n - 1, i + 2)), y: yAt(temps[Math.min(n - 1, i + 2)]) };
      const c1x = p1.x + (p2.x - p0.x) / 6;
      const c1y = p1.y + (p2.y - p0.y) / 6;
      const c2x = p2.x - (p3.x - p1.x) / 6;
      const c2y = p2.y - (p3.y - p1.y) / 6;
      ctx.bezierCurveTo(c1x, c1y, c2x, c2y, p2.x, p2.y);
    }
  }

  // 填充
  buildPath();
  ctx.lineTo(xAt(n - 1), padTop + chartH);
  ctx.lineTo(xAt(0), padTop + chartH);
  ctx.closePath();
  ctx.fillStyle = grad;
  ctx.fill();

  // 主线
  buildPath();
  ctx.strokeStyle = statusSun;
  ctx.lineWidth = 2.2;
  ctx.lineJoin = 'round';
  ctx.lineCap = 'round';
  ctx.shadowColor = withAlpha(statusSun, 0.35);
  ctx.shadowBlur = 10;
  ctx.stroke();
  ctx.shadowColor = 'transparent';
  ctx.shadowBlur = 0;

  // 每隔几小时描一个圆点
  for (let i = 0; i < n; i += 3) {
    const x = xAt(i);
    const y = yAt(temps[i]);
    ctx.beginPath();
    ctx.arc(x, y, 3.2, 0, Math.PI * 2);
    ctx.fillStyle = textPri;
    ctx.fill();
    ctx.beginPath();
    ctx.arc(x, y, 5.5, 0, Math.PI * 2);
    ctx.strokeStyle = withAlpha(statusSun, 0.35);
    ctx.lineWidth = 1;
    ctx.stroke();
  }

  // === 4. 温度标签（每 6 小时显示一次）===
  ctx.font = "11px 'JetBrains Mono', monospace";
  ctx.textAlign = 'center';
  ctx.textBaseline = 'bottom';
  ctx.fillStyle = textPri;
  for (let i = 0; i < n; i += 6) {
    const x = xAt(i);
    const y = yAt(temps[i]);
    ctx.fillText(`${Math.round(temps[i])}°`, x, y - 10);
  }

  // === 5. 底部时间标签 ===
  ctx.font = "11px 'Inter', sans-serif";
  ctx.fillStyle = textTer;
  ctx.textBaseline = 'top';
  for (let i = 0; i < n; i += 6) {
    const x = xAt(i);
    ctx.fillText(labels[i] || '', x, height - padBottom + 8);
  }

  // === 6. hover 交互：高亮点 + tooltip ===
  const wrap = canvas.parentNode;
  if (!wrap) return;

  // 先清理旧的 hover 指示点 canvas
  let hoverDot = wrap.querySelector('.chart-hover-dot');
  if (!hoverDot) {
    hoverDot = document.createElement('div');
    hoverDot.className = 'chart-hover-dot';
    wrap.appendChild(hoverDot);
  }

  let tip = wrap.querySelector('.chart-tooltip');
  if (!tip) {
    tip = document.createElement('div');
    tip.className = 'chart-tooltip';
    wrap.appendChild(tip);
  }

  function onMove(e) {
    const r = canvas.getBoundingClientRect();
    const x = e.clientX - r.left;
    if (x < padX || x > width - padX) {
      tip.classList.remove('visible');
      hoverDot.classList.remove('visible');
      return;
    }
    const i = Math.min(n - 1, Math.max(0, Math.round(((x - padX) / chartW) * (n - 1))));
    const tx = xAt(i);
    const ty = yAt(temps[i]);
    const label = labels[i] || `#${i}`;
    const popV = pops[i] || 0;

    hoverDot.style.transform = `translate(${tx}px, ${ty}px) translate(-50%, -50%)`;
    hoverDot.classList.add('visible');

    tip.style.left = `${tx}px`;
    tip.style.top = `${ty - 10}px`;
    tip.innerHTML = `<small>${label}</small>${Math.round(temps[i])}°C · 降水 ${popV}%`;
    tip.classList.add('visible');
  }

  function onLeave() {
    tip.classList.remove('visible');
    hoverDot.classList.remove('visible');
  }

  // 每次重绘时重新绑定，避免重复
  canvas._onmove && canvas.removeEventListener('mousemove', canvas._onmove);
  canvas._onleave && canvas.removeEventListener('mouseleave', canvas._onleave);
  canvas._onmove = onMove;
  canvas._onleave = onLeave;
  canvas.addEventListener('mousemove', onMove);
  canvas.addEventListener('mouseleave', onLeave);
}

/** 将 hex / rgba 色 + alpha 转为统一 rgba */
function withAlpha(color, alpha) {
  const c = (color || '').trim();
  if (c.startsWith('#')) {
    let hex = c.slice(1);
    if (hex.length === 3) hex = hex.split('').map((x) => x + x).join('');
    const r = parseInt(hex.slice(0, 2), 16);
    const g = parseInt(hex.slice(2, 4), 16);
    const b = parseInt(hex.slice(4, 6), 16);
    return `rgba(${r},${g},${b},${alpha})`;
  }
  if (c.startsWith('rgb')) {
    const parts = c.match(/\(([^)]+)\)/);
    if (!parts) return c;
    const vals = parts[1].split(',').map((x) => x.trim());
    return `rgba(${vals[0]},${vals[1]},${vals[2]},${alpha})`;
  }
  return c;
}
