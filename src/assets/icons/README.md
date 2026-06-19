# assets/icons

静态图标资源目录。

该目录用于存放非动态生成的图标文件（如导航图标、主题切换图标等）。
- 推荐使用 SVG 格式，体积小且不失真
- 天气图标（太阳 / 云朵 / 雨雪等）由 `js/components/WeatherIcon.js`
  动态生成，不存放在此目录
- 需要新的静态图标时直接添加 SVG 即可，建议命名语义化
  （例如 `icon-location.svg`、`icon-wind.svg`）
