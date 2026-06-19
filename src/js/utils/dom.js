/**
 * js/utils/dom.js
 * ------------------------------------------------------------------
 * DOM 操作相关的工具函数。
 * 封装常见的：创建元素、查询元素、清空内容、事件委托等。
 * ------------------------------------------------------------------
 */

/**
 * 简化版 hyperscript：创建一个带属性、带子元素的 DOM 元素。
 * @param {string} tag      标签名，如 'div'
 * @param {object} [props]  属性对象，如 { class: 'foo', id: 'bar' }
 * @param {Array<Node|string>|Node|string} [children]
 * @returns {HTMLElement}
 *
 * 示例：
 *   el('button', { class: 'btn', type: 'button' }, 'Hello')
 */
export function el(tag, props = {}, children = []) {
  const node = document.createElement(tag)

  Object.entries(props).forEach(([key, value]) => {
    if (value === undefined || value === null || value === false) return
    if (key === 'class') {
      node.className = value
    } else if (key === 'style' && typeof value === 'object') {
      Object.assign(node.style, value)
    } else if (key.startsWith('on') && typeof value === 'function') {
      node.addEventListener(key.slice(2).toLowerCase(), value)
    } else if (key === 'dataset' && typeof value === 'object') {
      Object.entries(value).forEach(([k, v]) => {
        node.dataset[k] = v
      })
    } else {
      node.setAttribute(key, value)
    }
  })

  const list = Array.isArray(children) ? children : [children]
  list.forEach((child) => {
    if (child === null || child === undefined || child === false) return
    if (typeof child === 'string' || typeof child === 'number') {
      node.appendChild(document.createTextNode(String(child)))
    } else if (child instanceof Node) {
      node.appendChild(child)
    }
  })

  return node
}

/**
 * 清空一个元素的所有子节点。
 * @param {Node} node
 */
export function clear(node) {
  while (node.firstChild) {
    node.removeChild(node.firstChild)
  }
}

/**
 * document.querySelector 的别名，加上必填断言。
 * @param {string} selector
 * @param {ParentNode} [parent=document]
 * @returns {HTMLElement}
 */
export function qs(selector, parent = document) {
  return parent.querySelector(selector)
}

/**
 * document.querySelectorAll 的别名（返回真正的数组）。
 * @param {string} selector
 * @param {ParentNode} [parent=document]
 * @returns {HTMLElement[]}
 */
export function qsa(selector, parent = document) {
  return Array.from(parent.querySelectorAll(selector))
}
