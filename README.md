# Weather Vision · 天气视窗

> 一款科技感十足的天气仪表盘 — 玻璃拟态 · SVG 动态图标 · 粒子背景 · 主题自适应。

## ✨ 特性

- 🌍 **全球城市搜索** — 基于 Open-Meteo Geocoding API，无需 Key
- 📍 **地理定位** — 一键定位当前位置的实时天气
- 🎨 **主题自适应** — 晴天 / 多云 / 阴雨 / 雪 / 雷 / 雾 / 夜间各有独特配色
- 🌤 **动态 SVG 图标** — 阳光旋转、月亮发光、云朵飘动、雨滴下落…
- 🔢 **数字滚动动画** — easeOutCubic 缓动，数据变化有节奏感
- ✨ **粒子背景** — Canvas 轻量级氛围粒子
- 📊 **24h 小时级 + 7 天预报** — 温度曲线、降雨概率一目了然
- ⚡ **轻量** — 纯原生 ES Module + Vite，无框架依赖，Gzip 约 14KB

## 🛠 开发

```bash
npm install       # 安装依赖
npm run dev       # 启动开发服务器 http://localhost:3000
npm run build     # 生产构建 → dist/
npm run preview   # 本地预览生产构建
npm run lint      # 代码质量检查
npm run format    # Prettier 格式化
```

## 🌐 部署

### GitHub Pages（推荐，自动）

1. 把代码 push 到 GitHub 仓库（例如 `your-name/weather-app`）
2. 进入仓库 **Settings → Pages**，Source 选择 **GitHub Actions**
3. 每次 push 到 `main` 分支会自动触发 `.github/workflows/deploy.yml`
4. 部署完成后访问 `https://<your-name>.github.io/weather-app/`

### 任意静态托管

`dist/` 目录是纯静态产物，直接上传到 Netlify / Vercel / Cloudflare Pages / Nginx 均可。

## 📁 项目结构

```
weather-app/
├── src/
│   ├── index.html
│   ├── main.js                 # 应用入口
│   ├── styles/                 # CSS 变量 / 基础 / 动画 / 组件
│   └── js/
│       ├── config/config.js    # 主题 & 代码映射
│       ├── api/weather.js      # fetch 封装
│       ├── services/WeatherService.js # 业务层
│       ├── components/         # WeatherIcon / SearchBar / SkeletonLoader
│       └── utils/              # format / cache
├── public/                     # 静态资源（favicon 等）
├── vite.config.js
└── .github/workflows/deploy.yml
```

## 🔌 数据来源

- **Open-Meteo Forecast API** — 免费、无需注册、支持全球
- **Open-Meteo Geocoding API** — 城市坐标解析

## 📄 License

MIT
