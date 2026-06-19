/**
 * js/utils/format.js
 * ------------------------------------------------------------------
 * 数据格式化工具。
 * 提供温度、风速、时间、百分比等常见展示格式。
 * 所有函数都保持纯函数、无副作用，便于单元测试。
 * ------------------------------------------------------------------
 */

/**
 * 温度格式化，保留一位小数并附带单位。
 * @param {number} value   摄氏度数值
 * @param {object} [options]
 * @param {string} [options.unit='°C']
 * @param {number} [options.fractionDigits=1]
 * @returns {string} 如 "23.5°C"
 */
export function formatTemperature(value, options = {}) {
  if (!Number.isFinite(value)) return '--°C'
  const { unit = '°C', fractionDigits = 1 } = options
  return `${value.toFixed(fractionDigits)}${unit}`
}

/**
 * 风速格式化。
 * @param {number} value  km/h
 * @returns {string}
 */
export function formatWindSpeed(value) {
  if (!Number.isFinite(value)) return '-- km/h'
  return `${value.toFixed(1)} km/h`
}

/**
 * 将相对湿度百分比格式化成可显示字符串。
 * @param {number} value
 * @returns {string}
 */
export function formatHumidity(value) {
  if (!Number.isFinite(value)) return '--%'
  return `${Math.round(value)}%`
}

/**
 * 格式化 ISO 时间字符串为本地友好格式。
 * @param {string} iso    如 "2024-01-02T08:00"
 * @param {object} [options]
 * @param {string} [options.locale='zh-CN']
 * @param {boolean} [options.showTime=true]
 * @returns {string}
 */
export function formatDate(iso, options = {}) {
  if (!iso) return '--'
  const { locale = 'zh-CN', showTime = true } = options
  const date = new Date(iso)
  if (Number.isNaN(date.getTime())) return String(iso)

  return date.toLocaleString(locale, {
    month: 'short',
    day: 'numeric',
    hour: showTime ? '2-digit' : undefined,
    minute: showTime ? '2-digit' : undefined,
    weekday: 'short',
  })
}

/**
 * 以卡片形式友好展示「体感温度 / 湿度 / 风速」文本行。
 * @param {object} data   由 WeatherService 归一化后的 current 对象
 * @returns {string}
 */
export function describeCurrent(data) {
  if (!data) return '暂无数据'
  const parts = [
    `体感 ${formatTemperature(data.apparentTemperature)}`,
    `湿度 ${formatHumidity(data.humidity)}`,
    `风速 ${formatWindSpeed(data.windSpeed)}`,
  ]
  return parts.join(' · ')
}
