/**
 * Vite 配置 —— 同时适配本地开发 & GitHub Pages 部署
 *
 * 如果你的仓库名为 weather-app（默认），且部署在
 *   https://<user>.github.io/weather-app/
 * 那么 Vite 需要把静态资源 base 设为 "/weather-app/"。
 *
 * 通过环境变量 VITE_BASE 覆盖：
 *   VITE_BASE=/my-repo/ npm run build
 * 留空字符串 "" 则使用相对路径 "./"，对任何层级 Pages 都通用。
 */

import { defineConfig } from 'vite';

const base = process.env.VITE_BASE ?? './';

export default defineConfig({
  root: 'src',
  publicDir: '../public',
  base,
  build: {
    outDir: '../dist',
    emptyOutDir: true,
    sourcemap: false,
    cssMinify: true,
    rollupOptions: {
      output: {
        manualChunks: {},
      },
    },
  },
  server: {
    port: 3000,
    host: true,
    open: false,
  },
});
