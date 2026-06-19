/**
 * js/components/SearchBar.js
 * ------------------------------------------------------------------
 * 搜索栏组件。
 * 负责：
 *   - 渲染一个输入框 + 搜索按钮
 *   - 监听表单提交 / Enter 键
 *   - 通过 props.onSearch 把用户输入回传给调用方
 *
 * 用法示例：
 *   const bar = SearchBar({
 *     placeholder: '输入城市名，如 上海 / Tokyo',
 *     onSearch: (query) => console.log(query),
 *   })
 *   document.getElementById('search-container').appendChild(bar)
 * ------------------------------------------------------------------
 */

/**
 * @param {object} props
 * @param {string} [props.placeholder]
 * @param {(query: string) => void} props.onSearch
 * @returns {HTMLElement}
 */
export function SearchBar(props = {}) {
  const { placeholder = '搜索城市名 / Search city', onSearch } = props

  const container = document.createElement('form')
  container.className = 'search-bar glass'
  container.setAttribute('role', 'search')
  container.noValidate = true

  const input = document.createElement('input')
  input.type = 'search'
  input.placeholder = placeholder
  input.autocomplete = 'off'
  input.setAttribute('aria-label', placeholder)

  const button = document.createElement('button')
  button.type = 'submit'
  button.textContent = '搜索'

  container.appendChild(input)
  container.appendChild(button)

  container.addEventListener('submit', (e) => {
    e.preventDefault()
    const query = input.value.trim()
    if (!query) return
    if (typeof onSearch === 'function') {
      onSearch(query)
    }
  })

  return container
}
