/**
 * chart.js
 *
 * 极简折线图：绘制 24h 温度曲线 + 降水概率区域
 * 特点：
 *   - 纯 Canvas 2D，无任何依赖
 *   - DPR 自适应，高清屏不糊
 *   - 柔和渐变填充曲线下方区域
 *   - 弱化网格，仅显示关键刻度
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

  const dpr = window.devicePixelRatio || 1;
  const rect = canvas.getBoundingClientRect();
  const width = rect.width;
  const height = rect.height;
  canvas.width = Math.floor(width * dpr);
  canvas.height = Math.floor(height * dpr);

  const ctx = canvas.getContext('2d');
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

  // 读取主题色（如果 body 设置了主题变量则使用；否则回退默认）
  const styles = getComputedStyle(document.documentElement);
  const accent = styles.getPropertyValue('--accent').trim() || '#7ab8d9';
  const accentStrong = styles.getPropertyValue('--accent-strong').trim() || '#4a9cc7';
  const statusSun = styles.getPropertyValue('--status-sun').trim() || '#e8c887';
  const textPri = styles.getPropertyValue('--text-primary').trim() || 'rgba(255,255,255,0.92)';
  const textTer = styles.getPropertyValue('--text-tertiary').trim() || 'rgba(255,255,255,0.4)';
  const border = styles.getPropertyValue('--border-1').trim() || 'rgba(255,255,255,0.06)';

  // 内边距（为轴标签和图标留出空间）
  const padX = 16;
  const padTop = 16;
  const padBottom = 32;  // 底部留给 label
  const chartW = Math.max(width - padX * 2, 1);
  const chartH = Math.max(height - padTop - padBottom, 1);

  // 准备数据
  const temps = data.temperatures;
  const precs = data.precipitations || new Array(temps.length).fill(0);
  const labels = data.labels || new Array(temps.length).fill('');

  // 温度范围（y 轴）
  let tMin = Math.min(...temps);
  let tMax = Math.max(...temps);
  if (tMin === tMax) { tMin -= 1; tMax += 1; }
  const tRange = (tMax - tMin) || 1;
  // 给顶部留一点余量，曲线不要贴边
  const yMin = tMin - tRange * 0.25;
  const yMax = tMax + tRange * 0.25;
  const ySpan = yMax - yMin;

  const n = temps.length;
  // 每小时对应的 x 坐标
  const xAt = (i) => padX + (chartW * i) / (n - 1);
  const yAt = (t) => padTop + chartH - ((t - yMin) / ySpan) * chartH;

  // --- 清空画布 ---
  ctx.clearRect(0, 0, width, height);

  // ============================================================
  // 1. 网格线（仅 3 条水平参考线，非常弱化）
  // ============================================================
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

  // ============================================================
  // 2. 降水概率（柱状 / 区域底部，半透明）
  // ============================================================
  const barMaxH = chartH * 0.35;  // 降水最多占底部 35%
  const barW = Math.max(2, chartW / n * 0.45);

  for (let i = 0; i < n; i++) {
    if (!precs[i]) continue;
    const h = (precs[i] / 100) * barMaxH;
    if (h < 0.5) continue;
    const x = xAt(i);
    const y = height - padBottom - h;

    ctx.fillStyle = withAlpha(accent, 0.18);
    ctx.fillRect(x - barW / 2, y, barW, h);

    // 顶部微高亮
    ctx.fillStyle = withAlpha(accent, 0.5);
    ctx.fillRect(x - barW / 2, y, barW, 1);
  }

  // ============================================================
  // 3. 温度曲线 — 渐变填充 + 主曲线 + 描点
  // ============================================================

  // --- 曲线下方填充（柔和渐变）---
  const grad = ctx.createLinearGradient(0, padTop, 0, padTop + chartH);
  grad.addColorStop(0, withAlpha(statusSun, 0.28));
  grad.addColorStop(0.5, withAlpha(accent, 0.18));
  grad.addColorStop(1, withAlpha(accent, 0.02));

  ctx.beginPath();
  ctx.moveTo(xAt(0), yAt(temps[0]));
  // 用 Catmull-Rom -> Bezier 做平滑曲线
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
  // 闭合到底部
  ctx.lineTo(xAt(n - 1), padTop + chartH);
  ctx.lineTo(xAt(0), padTop + chartH);
  ctx.closePath();
  ctx.fillStyle = grad;
  ctx.fill();

  // --- 主曲线描边（粗一点，实线）---
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
  ctx.strokeStyle = statusSun;
  ctx.lineWidth = 2.2;
  ctx.lineJoin = 'round';
  ctx.lineCap = 'round';
  ctx.shadowColor = withAlpha(statusSun, 0.4);
  ctx.shadowBlur = 8;
  ctx.stroke();
  ctx.shadowColor = 'transparent';
  ctx.shadowBlur = 0;

  // --- 每隔 3 小时描一个圆点（突出关键点，避免过于密集）---
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

  // ============================================================
  // 4. 温度标签（最高点 / 最低点 / 每隔几小时）
  // ============================================================
  ctx.font = "11px 'JetBrains Mono', monospace";
  ctx.textAlign = 'center';
  ctx.textBaseline = 'bottom';
  ctx.fillStyle = textPri;

  for (let i = 0; i < n; i += 6) {
    const x = xAt(i);
    const y = yAt(temps[i]);
    ctx.fillText(`${Math.round(temps[i])}°`, x, y - 10);
  }

  // ============================================================
  // 5. 底部时间标签
  // ============================================================
  ctx.font = "11px 'Inter', sans-serif";
  ctx.fillStyle = textTer;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'top';
  for (let i = 0; i < n; i += 6) {
    const x = xAt(i);
    ctx.fillText(labels[i] || '', x, height - padBottom + 8);
  }
}

/** 将 hex/#rgb/rgba 色 + alpha 转 rgba */
function withAlpha(color, alpha) {
  const c = color.trim();
  if (c.startsWith('#')) {
    let hex = c.slice(1);
    if (hex.length === 3) hex = hex.split('').map(x => x + x).join('');
    const r = parseInt(hex.slice(0, 2), 16);
    const g = parseInt(hex.slice(2, 4), 16);
    const b = parseInt(hex.slice(4, 6), 16);
    return `rgba(${r},${g},${b},${alpha})`;
  }
  if (c.startsWith('rgb')) {
    const parts = c.match(/\(([^)]+)\)/);
    if (!parts) return c;
    const vals = parts[1].split(',').map(x => x.trim());
    return `rgba(${vals[0]},${vals[1]},${vals[2]},${alpha})`;
  }
  return c;
}
