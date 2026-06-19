/**
 * js/components/SkeletonLoader.js
 * ------------------------------------------------------------------
 * 骨架屏（Skeleton Screen）组件。
 * 在数据请求期间展示占位动画，避免布局跳动并提供更好的感知速度。
 * 通过 options.lines 控制占位行数，options.height 控制整体样式。
 * ------------------------------------------------------------------
 */

/**
 * @param {object} [options]
 * @param {number} [options.lines=4]    内部占位行数量
 * @param {string} [options.className]  追加的自定义类名
 * @returns {HTMLElement}
 */
export function SkeletonLoader(options = {}) {
  const { lines = 4, className = '' } = options

  const root = document.createElement('div')
  root.className = `skeleton-loader glass ${className}`.trim()
  root.setAttribute('aria-busy', 'true')
  root.setAttribute('aria-live', 'polite')
  root.style.padding = 'var(--space-xl)'

  for (let i = 0; i < lines; i += 1) {
    const line = document.createElement('div')
    line.className = 'skeleton-line skeleton-shimmer'
    // 每行宽度变化，模拟真实内容布局
    const widths = ['100%', '70%', '85%', '55%', '90%']
    line.style.width = widths[i % widths.length]
    line.style.height = i === 0 ? '2rem' : '1rem'
    root.appendChild(line)
  }

  return root
}
