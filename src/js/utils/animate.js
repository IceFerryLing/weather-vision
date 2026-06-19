/**
 * js/utils/animate.js
 * ------------------------------------------------------------------
 * 动画相关工具：为元素挂载 / 移除动画类、渐入过渡、节流渲染等。
 * 与 styles/animations.css 中定义的关键帧配合使用。
 * ------------------------------------------------------------------
 */

/**
 * 给元素附加一个一次性的渐入动画。
 * @param {HTMLElement} element
 * @param {string} [className='animate-fade-in'] 可替换为 styles/animations.css 中任意动画类
 * @returns {Promise<void>} 动画结束时 resolve
 */
export function fadeIn(element, className = 'animate-fade-in') {
  return new Promise((resolve) => {
    if (!element || !element.classList) {
      resolve()
      return
    }
    element.classList.add(className)
    const handler = () => {
      element.removeEventListener('animationend', handler)
      element.classList.remove(className)
      resolve()
    }
    element.addEventListener('animationend', handler)
  })
}

/**
 * 使用 Web Animations API 做一个简单的淡入 + 上升动画。
 * 适用于快速过渡而不需要额外写 CSS class。
 * @param {Element} element
 * @param {number} [duration=400]
 * @param {number} [delay=0]
 * @returns {Animation}
 */
export function playFadeUp(element, duration = 400, delay = 0) {
  if (!element || typeof element.animate !== 'function') {
    return null
  }
  return element.animate(
    [
      { opacity: 0, transform: 'translateY(10px)' },
      { opacity: 1, transform: 'translateY(0)' },
    ],
    {
      duration,
      delay,
      easing: 'cubic-bezier(0.4, 0, 0.2, 1)',
      fill: 'both',
    }
  )
}

/**
 * requestAnimationFrame 包装的节流器，常用于频繁触发的场景。
 * @param {(...args: any[]) => void} fn
 * @returns {(...args: any[]) => void}
 */
export function rafThrottle(fn) {
  let rafId = null
  let lastArgs = null
  return function throttled(...args) {
    lastArgs = args
    if (rafId !== null) return
    rafId = requestAnimationFrame(() => {
      fn.apply(this, lastArgs)
      rafId = null
    })
  }
}
