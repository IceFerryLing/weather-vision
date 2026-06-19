/**
 * tests/placeholder.test.js
 * ------------------------------------------------------------------
 * 测试骨架文件（使用 Vitest）。
 * 用于确保测试环境可用，后续可以基于此模式添加更多单元测试，
 * 例如：utils/format.js、services/WeatherService.js 的纯函数部分。
 *
 * 运行方式：
 *   npm test
 *   npm run test -- --watch
 * ------------------------------------------------------------------
 */

import { describe, it, expect } from 'vitest'

describe('placeholder', () => {
  it('true 应为 true', () => {
    expect(true).toBe(true)
  })

  it('数组求和示例：[1, 2, 3] => 6', () => {
    const sum = (arr) => arr.reduce((acc, n) => acc + n, 0)
    expect(sum([1, 2, 3])).toBe(6)
  })
})
