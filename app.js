/**
 * Weather Vision - 现代天气应用
 * 使用 Open-Meteo API，提供精美的玻璃拟态界面和动画效果
 */

// ============ 天气类型配置 ============
const WEATHER_TYPES = {
    sunny: {
        hue: 35,
        label: '晴朗',
        emoji: '☀️'
    },
    partlyCloudy: {
        hue: 200,
        label: '多云',
        emoji: '⛅'
    },
    cloudy: {
        hue: 210,
        label: '阴天',
        emoji: '☁️'
    },
    rainy: {
        hue: 190,
        label: '小雨',
        emoji: '🌧️'
    },
    heavyRain: {
        hue: 220,
        label: '大雨',
        emoji: '⛈️'
    },
    snowy: {
        hue: 180,
        label: '雪',
        emoji: '❄️'
    },
    thunder: {
        hue: 260,
        label: '雷暴',
        emoji: '⛈️'
    },
    foggy: {
        hue: 40,
        label: '雾',
        emoji: '🌫️'
    },
    night: {
        hue: 240,
        label: '晴夜',
        emoji: '🌙'
    },
    nightCloudy: {
        hue: 220,
        label: '多云夜',
        emoji: '☁️'
    }
};

// ============ WMO 天气代码映射 ============
const WEATHER_CODES = {
    0: { desc: '晴朗无云', type: 'sunny', nightType: 'night' },
    1: { desc: '大部晴朗', type: 'sunny', nightType: 'night' },
    2: { desc: '局部多云', type: 'partlyCloudy', nightType: 'nightCloudy' },
    3: { desc: '阴天', type: 'cloudy', nightType: 'cloudy' },
    45: { desc: '雾', type: 'foggy', nightType: 'foggy' },
    48: { desc: '雾凇', type: 'foggy', nightType: 'foggy' },
    51: { desc: '毛毛雨', type: 'rainy', nightType: 'rainy' },
    53: { desc: '中雨', type: 'rainy', nightType: 'rainy' },
    55: { desc: '大雨', type: 'rainy', nightType: 'rainy' },
    56: { desc: '冻雨', type: 'snowy', nightType: 'snowy' },
    57: { desc: '强冻雨', type: 'snowy', nightType: 'snowy' },
    61: { desc: '小雨', type: 'rainy', nightType: 'rainy' },
    63: { desc: '中雨', type: 'rainy', nightType: 'rainy' },
    65: { desc: '大雨', type: 'heavyRain', nightType: 'heavyRain' },
    66: { desc: '冻雨', type: 'snowy', nightType: 'snowy' },
    67: { desc: '强冻雨', type: 'snowy', nightType: 'snowy' },
    71: { desc: '小雪', type: 'snowy', nightType: 'snowy' },
    73: { desc: '中雪', type: 'snowy', nightType: 'snowy' },
    75: { desc: '大雪', type: 'snowy', nightType: 'snowy' },
    77: { desc: '雪粒', type: 'snowy', nightType: 'snowy' },
    80: { desc: '阵雨', type: 'rainy', nightType: 'rainy' },
    81: { desc: '强阵雨', type: 'heavyRain', nightType: 'heavyRain' },
    82: { desc: '暴雨', type: 'heavyRain', nightType: 'heavyRain' },
    85: { desc: '阵雪', type: 'snowy', nightType: 'snowy' },
    86: { desc: '强阵雪', type: 'snowy', nightType: 'snowy' },
    95: { desc: '雷暴', type: 'thunder', nightType: 'thunder' },
    96: { desc: '雷暴伴冰雹', type: 'thunder', nightType: 'thunder' },
    99: { desc: '强雷暴伴冰雹', type: 'thunder', nightType: 'thunder' }
};

// ============ 全局状态 ============
let state = {
    currentCity: '',
    isDay: true,
    unit: 'C',
    currentWeather: null
};

// ============ SVG 图标生成器 ============
function createWeatherIcon(type, size = 'large') {
    const icons = {
        sunny: `
            <svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
                <defs>
                    <radialGradient id="sunGrad" cx="50%" cy="50%" r="50%">
                        <stop offset="0%" stop-color="#FFE564" stop-opacity="1"/>
                        <stop offset="60%" stop-color="#FFB84D" stop-opacity="1"/>
                        <stop offset="100%" stop-color="#FF9F1C" stop-opacity="0.8"/>
                    </radialGradient>
                    <filter id="sunGlow">
                        <feGaussianBlur stdDeviation="3"/>
                    </filter>
                </defs>
                <circle cx="50" cy="50" r="35" fill="url(#sunGrad)" opacity="0.3" filter="url(#sunGlow)"/>
                <g class="sun-rays">
                    <line x1="50" y1="8" x2="50" y2="20" stroke="#FFB84D" stroke-width="3" stroke-linecap="round"/>
                    <line x1="50" y1="80" x2="50" y2="92" stroke="#FFB84D" stroke-width="3" stroke-linecap="round"/>
                    <line x1="8" y1="50" x2="20" y2="50" stroke="#FFB84D" stroke-width="3" stroke-linecap="round"/>
                    <line x1="80" y1="50" x2="92" y2="50" stroke="#FFB84D" stroke-width="3" stroke-linecap="round"/>
                    <line x1="20" y1="20" x2="28" y2="28" stroke="#FFB84D" stroke-width="3" stroke-linecap="round"/>
                    <line x1="72" y1="72" x2="80" y2="80" stroke="#FFB84D" stroke-width="3" stroke-linecap="round"/>
                    <line x1="20" y1="80" x2="28" y2="72" stroke="#FFB84D" stroke-width="3" stroke-linecap="round"/>
                    <line x1="72" y1="28" x2="80" y2="20" stroke="#FFB84D" stroke-width="3" stroke-linecap="round"/>
                </g>
                <circle class="sun-core" cx="50" cy="50" r="25" fill="url(#sunGrad)"/>
            </svg>
        `,
        partlyCloudy: `
            <svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
                <defs>
                    <radialGradient id="sunGrad2" cx="50%" cy="50%" r="50%">
                        <stop offset="0%" stop-color="#FFE564" stop-opacity="1"/>
                        <stop offset="60%" stop-color="#FFB84D" stop-opacity="1"/>
                        <stop offset="100%" stop-color="#FF9F1C" stop-opacity="0.8"/>
                    </radialGradient>
                    <linearGradient id="cloudGrad" x1="0%" y1="0%" x2="0%" y2="100%">
                        <stop offset="0%" stop-color="#FFFFFF" stop-opacity="0.95"/>
                        <stop offset="100%" stop-color="#D4E4F7" stop-opacity="0.85"/>
                    </linearGradient>
                </defs>
                <circle cx="35" cy="35" r="18" fill="url(#sunGrad2)" opacity="0.4"/>
                <g class="sun-rays">
                    <line x1="35" y1="10" x2="35" y2="18" stroke="#FFB84D" stroke-width="2.5" stroke-linecap="round"/>
                    <line x1="35" y1="52" x2="35" y2="60" stroke="#FFB84D" stroke-width="2.5" stroke-linecap="round"/>
                    <line x1="10" y1="35" x2="18" y2="35" stroke="#FFB84D" stroke-width="2.5" stroke-linecap="round"/>
                    <line x1="52" y1="35" x2="60" y2="35" stroke="#FFB84D" stroke-width="2.5" stroke-linecap="round"/>
                </g>
                <circle cx="35" cy="35" r="14" fill="url(#sunGrad2)"/>
                <g class="cloud-svg-part">
                    <ellipse cx="55" cy="60" rx="28" ry="18" fill="url(#cloudGrad)"/>
                    <ellipse cx="42" cy="55" rx="18" ry="14" fill="url(#cloudGrad)"/>
                    <ellipse cx="70" cy="55" rx="16" ry="12" fill="url(#cloudGrad)"/>
                </g>
            </svg>
        `,
        cloudy: `
            <svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
                <defs>
                    <linearGradient id="cloudGrad2" x1="0%" y1="0%" x2="0%" y2="100%">
                        <stop offset="0%" stop-color="#F8FAFC" stop-opacity="0.95"/>
                        <stop offset="100%" stop-color="#CBD5E1" stop-opacity="0.85"/>
                    </linearGradient>
                </defs>
                <g class="cloud-svg-part">
                    <ellipse cx="50" cy="50" rx="35" ry="22" fill="url(#cloudGrad2)"/>
                    <ellipse cx="32" cy="55" rx="22" ry="18" fill="url(#cloudGrad2)"/>
                    <ellipse cx="68" cy="55" rx="20" ry="16" fill="url(#cloudGrad2)"/>
                </g>
                <g class="cloud-svg-part" style="animation-delay: 0.5s">
                    <ellipse cx="40" cy="35" rx="20" ry="14" fill="url(#cloudGrad2)" opacity="0.7"/>
                    <ellipse cx="60" cy="38" rx="18" ry="12" fill="url(#cloudGrad2)" opacity="0.7"/>
                </g>
            </svg>
        `,
        rainy: `
            <svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
                <defs>
                    <linearGradient id="cloudGrad3" x1="0%" y1="0%" x2="0%" y2="100%">
                        <stop offset="0%" stop-color="#94A3B8" stop-opacity="0.95"/>
                        <stop offset="100%" stop-color="#64748B" stop-opacity="0.85"/>
                    </linearGradient>
                    <linearGradient id="rainGrad" x1="0%" y1="0%" x2="0%" y2="100%">
                        <stop offset="0%" stop-color="#60A5FA" stop-opacity="0"/>
                        <stop offset="100%" stop-color="#3B82F6" stop-opacity="0.9"/>
                    </linearGradient>
                </defs>
                <g class="cloud-svg-part">
                    <ellipse cx="50" cy="40" rx="35" ry="22" fill="url(#cloudGrad3)"/>
                    <ellipse cx="32" cy="45" rx="22" ry="18" fill="url(#cloudGrad3)"/>
                    <ellipse cx="68" cy="45" rx="20" ry="16" fill="url(#cloudGrad3)"/>
                </g>
                <line class="raindrop-svg" x1="35" y1="65" x2="32" y2="80" stroke="url(#rainGrad)" stroke-width="3" stroke-linecap="round"/>
                <line class="raindrop-svg" x1="50" y1="65" x2="47" y2="82" stroke="url(#rainGrad)" stroke-width="3" stroke-linecap="round" style="animation-delay: 0.3s"/>
                <line class="raindrop-svg" x1="65" y1="65" x2="62" y2="80" stroke="url(#rainGrad)" stroke-width="3" stroke-linecap="round" style="animation-delay: 0.6s"/>
                <line class="raindrop-svg" x1="42" y1="72" x2="39" y2="85" stroke="url(#rainGrad)" stroke-width="2.5" stroke-linecap="round" style="animation-delay: 0.9s"/>
                <line class="raindrop-svg" x1="58" y1="72" x2="55" y2="85" stroke="url(#rainGrad)" stroke-width="2.5" stroke-linecap="round" style="animation-delay: 0.2s"/>
            </svg>
        `,
        heavyRain: `
            <svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
                <defs>
                    <linearGradient id="cloudGrad4" x1="0%" y1="0%" x2="0%" y2="100%">
                        <stop offset="0%" stop-color="#6B7280" stop-opacity="1"/>
                        <stop offset="100%" stop-color="#374151" stop-opacity="0.9"/>
                    </linearGradient>
                    <linearGradient id="rainGrad2" x1="0%" y1="0%" x2="0%" y2="100%">
                        <stop offset="0%" stop-color="#60A5FA" stop-opacity="0.3"/>
                        <stop offset="100%" stop-color="#2563EB" stop-opacity="1"/>
                    </linearGradient>
                </defs>
                <g class="cloud-svg-part">
                    <ellipse cx="50" cy="35" rx="38" ry="24" fill="url(#cloudGrad4)"/>
                    <ellipse cx="30" cy="40" rx="24" ry="20" fill="url(#cloudGrad4)"/>
                    <ellipse cx="70" cy="40" rx="22" ry="18" fill="url(#cloudGrad4)"/>
                </g>
                <line class="raindrop-svg" x1="25" y1="60" x2="20" y2="82" stroke="url(#rainGrad2)" stroke-width="3.5" stroke-linecap="round"/>
                <line class="raindrop-svg" x1="40" y1="60" x2="35" y2="85" stroke="url(#rainGrad2)" stroke-width="3.5" stroke-linecap="round" style="animation-delay: 0.2s"/>
                <line class="raindrop-svg" x1="55" y1="60" x2="50" y2="82" stroke="url(#rainGrad2)" stroke-width="3.5" stroke-linecap="round" style="animation-delay: 0.4s"/>
                <line class="raindrop-svg" x1="70" y1="60" x2="65" y2="85" stroke="url(#rainGrad2)" stroke-width="3.5" stroke-linecap="round" style="animation-delay: 0.6s"/>
                <line class="raindrop-svg" x1="32" y1="70" x2="28" y2="90" stroke="url(#rainGrad2)" stroke-width="3" stroke-linecap="round" style="animation-delay: 0.8s"/>
                <line class="raindrop-svg" x1="48" y1="70" x2="44" y2="90" stroke="url(#rainGrad2)" stroke-width="3" stroke-linecap="round" style="animation-delay: 0.1s"/>
                <line class="raindrop-svg" x1="63" y1="70" x2="59" y2="88" stroke="url(#rainGrad2)" stroke-width="3" stroke-linecap="round" style="animation-delay: 0.5s"/>
            </svg>
        `,
        snowy: `
            <svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
                <defs>
                    <linearGradient id="cloudGrad5" x1="0%" y1="0%" x2="0%" y2="100%">
                        <stop offset="0%" stop-color="#E2E8F0" stop-opacity="0.95"/>
                        <stop offset="100%" stop-color="#94A3B8" stop-opacity="0.85"/>
                    </linearGradient>
                </defs>
                <g class="cloud-svg-part">
                    <ellipse cx="50" cy="40" rx="35" ry="22" fill="url(#cloudGrad5)"/>
                    <ellipse cx="32" cy="45" rx="22" ry="18" fill="url(#cloudGrad5)"/>
                    <ellipse cx="68" cy="45" rx="20" ry="16" fill="url(#cloudGrad5)"/>
                </g>
                <g class="snow-svg" style="animation-delay: 0s">
                    <circle cx="35" cy="70" r="3" fill="#F8FAFC"/>
                </g>
                <g class="snow-svg" style="animation-delay: 0.5s">
                    <circle cx="50" cy="72" r="3" fill="#FFFFFF"/>
                </g>
                <g class="snow-svg" style="animation-delay: 1s">
                    <circle cx="65" cy="70" r="3" fill="#F8FAFC"/>
                </g>
                <g class="snow-svg" style="animation-delay: 1.5s">
                    <circle cx="42" cy="80" r="2.5" fill="#FFFFFF"/>
                </g>
                <g class="snow-svg" style="animation-delay: 0.3s">
                    <circle cx="58" cy="82" r="2.5" fill="#F8FAFC"/>
                </g>
                <g class="snow-svg" style="animation-delay: 0.8s">
                    <circle cx="30" cy="85" r="2" fill="#FFFFFF"/>
                </g>
                <g class="snow-svg" style="animation-delay: 1.2s">
                    <circle cx="70" cy="85" r="2" fill="#F8FAFC"/>
                </g>
            </svg>
        `,
        thunder: `
            <svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
                <defs>
                    <linearGradient id="cloudGrad6" x1="0%" y1="0%" x2="0%" y2="100%">
                        <stop offset="0%" stop-color="#475569" stop-opacity="1"/>
                        <stop offset="100%" stop-color="#1E293B" stop-opacity="0.95"/>
                    </linearGradient>
                    <linearGradient id="boltGrad" x1="0%" y1="0%" x2="0%" y2="100%">
                        <stop offset="0%" stop-color="#FDE047" stop-opacity="1"/>
                        <stop offset="100%" stop-color="#F59E0B" stop-opacity="1"/>
                    </linearGradient>
                </defs>
                <g class="cloud-svg-part">
                    <ellipse cx="50" cy="35" rx="38" ry="24" fill="url(#cloudGrad6)"/>
                    <ellipse cx="30" cy="40" rx="24" ry="20" fill="url(#cloudGrad6)"/>
                    <ellipse cx="70" cy="40" rx="22" ry="18" fill="url(#cloudGrad6)"/>
                </g>
                <g class="lightning-svg">
                    <path d="M48 50 L42 65 L52 65 L45 85 L58 62 L50 62 L55 50 Z" fill="url(#boltGrad)" opacity="0.95"/>
                </g>
            </svg>
        `,
        foggy: `
            <svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
                <defs>
                    <linearGradient id="fogGrad" x1="0%" y1="0%" x2="0%" y2="100%">
                        <stop offset="0%" stop-color="#E2E8F0" stop-opacity="0.7"/>
                        <stop offset="100%" stop-color="#94A3B8" stop-opacity="0.5"/>
                    </linearGradient>
                </defs>
                <ellipse cx="50" cy="35" rx="30" ry="18" fill="url(#fogGrad)"/>
                <ellipse cx="35" cy="40" rx="20" ry="12" fill="url(#fogGrad)" opacity="0.8"/>
                <ellipse cx="65" cy="40" rx="18" ry="11" fill="url(#fogGrad)" opacity="0.8"/>
                <ellipse cx="50" cy="55" rx="35" ry="8" fill="url(#fogGrad)" opacity="0.6"/>
                <ellipse cx="30" cy="68" rx="25" ry="7" fill="url(#fogGrad)" opacity="0.5"/>
                <ellipse cx="65" cy="70" rx="22" ry="6" fill="url(#fogGrad)" opacity="0.5"/>
                <ellipse cx="50" cy="82" rx="30" ry="6" fill="url(#fogGrad)" opacity="0.4"/>
            </svg>
        `,
        night: `
            <svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
                <defs>
                    <radialGradient id="moonGrad" cx="40%" cy="40%" r="60%">
                        <stop offset="0%" stop-color="#FFFFFF" stop-opacity="1"/>
                        <stop offset="70%" stop-color="#E2E8F0" stop-opacity="1"/>
                        <stop offset="100%" stop-color="#CBD5E1" stop-opacity="0.9"/>
                    </radialGradient>
                    <filter id="moonGlow">
                        <feGaussianBlur stdDeviation="4"/>
                    </filter>
                </defs>
                <circle cx="50" cy="48" r="32" fill="#FFFFFF" opacity="0.15" filter="url(#moonGlow)"/>
                <path class="moon-glow" d="M65 48 A28 28 0 1 1 65 48 Z" fill="url(#moonGrad)"/>
                <circle cx="40" cy="45" r="3" fill="#CBD5E1" opacity="0.5"/>
                <circle cx="35" cy="55" r="2" fill="#CBD5E1" opacity="0.4"/>
                <circle cx="50" cy="40" r="1.5" fill="#CBD5E1" opacity="0.3"/>
                <g fill="#F8FAFC" opacity="0.6">
                    <circle cx="20" cy="25" r="1.5"/>
                    <circle cx="80" cy="30" r="1"/>
                    <circle cx="85" cy="65" r="1.5"/>
                    <circle cx="15" cy="70" r="1"/>
                    <circle cx="30" cy="80" r="0.8"/>
                </g>
            </svg>
        `,
        nightCloudy: `
            <svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
                <defs>
                    <radialGradient id="moonGrad2" cx="40%" cy="40%" r="60%">
                        <stop offset="0%" stop-color="#FFFFFF" stop-opacity="1"/>
                        <stop offset="70%" stop-color="#E2E8F0" stop-opacity="1"/>
                        <stop offset="100%" stop-color="#CBD5E1" stop-opacity="0.9"/>
                    </radialGradient>
                    <linearGradient id="nightCloudGrad" x1="0%" y1="0%" x2="0%" y2="100%">
                        <stop offset="0%" stop-color="#64748B" stop-opacity="0.8"/>
                        <stop offset="100%" stop-color="#475569" stop-opacity="0.7"/>
                    </linearGradient>
                </defs>
                <path d="M30 35 A18 18 0 1 1 30 35 Z" fill="url(#moonGrad2)"/>
                <circle cx="18" cy="32" r="2" fill="#CBD5E1" opacity="0.4"/>
                <g class="cloud-svg-part">
                    <ellipse cx="55" cy="65" rx="32" ry="20" fill="url(#nightCloudGrad)"/>
                    <ellipse cx="38" cy="70" rx="20" ry="16" fill="url(#nightCloudGrad)"/>
                    <ellipse cx="72" cy="68" rx="18" ry="14" fill="url(#nightCloudGrad)"/>
                </g>
            </svg>
        `
    };
    return icons[type] || icons.sunny;
}

// ============ DOM 元素引用 ============
const elements = {
    weatherAnimations: document.getElementById('weatherAnimations'),
    weatherIcon: document.getElementById('weatherIcon'),
    cityName: document.getElementById('cityName'),
    currentDate: document.getElementById('currentDate'),
    tempValue: document.getElementById('tempValue'),
    tempUnit: document.getElementById('tempUnit'),
    tempMin: document.getElementById('tempMin'),
    tempMax: document.getElementById('tempMax'),
    feelsLike: document.getElementById('feelsLike'),
    weatherDesc: document.getElementById('weatherDesc'),
    humidity: document.getElementById('humidity'),
    humidityCircle: document.getElementById('humidityCircle'),
    humidityDesc: document.getElementById('humidityDesc'),
    windSpeed: document.getElementById('windSpeed'),
    windDirection: document.getElementById('windDirection'),
    windArrow: document.getElementById('windArrow'),
    pressure: document.getElementById('pressure'),
    pressureTrend: document.getElementById('pressureTrend'),
    visibility: document.getElementById('visibility'),
    visibilityBar: document.getElementById('visibilityBar'),
    visibilityDesc: document.getElementById('visibilityDesc'),
    uvValue: document.getElementById('uvValue'),
    uvDesc: document.getElementById('uvDesc'),
    uvSegments: document.querySelector('.uv-segments'),
    sunrise: document.getElementById('sunrise'),
    sunset: document.getElementById('sunset'),
    hourlyScroll: document.getElementById('hourlyScroll'),
    forecastList: document.getElementById('forecastList'),
    cityInput: document.getElementById('cityInput'),
    locationBtn: document.getElementById('locationBtn'),
    unitToggle: document.getElementById('unitToggle'),
    loadingOverlay: document.getElementById('loadingOverlay'),
    tempChart: document.getElementById('tempChart')
};

// ============ 温度单位转换 ============
function convertTemp(celsius) {
    if (state.unit === 'F') {
        return Math.round(celsius * 9 / 5 + 32);
    }
    return Math.round(celsius);
}

function getUnitSymbol() {
    return state.unit === 'F' ? '°F' : '°C';
}

// ============ 主题颜色更新 ============
function updateTheme(weatherType) {
    const type = WEATHER_TYPES[weatherType];
    if (!type) return;
    
    const root = document.documentElement;
    const hue = type.hue;
    
    // 背景渐变
    const bg1 = `hsla(${hue}, 60%, 20%, 1)`;
    const bg2 = `hsla(${hue + 30}, 50%, 30%, 1)`;
    const bg3 = `hsla(${hue + 60}, 40%, 25%, 1)`;
    
    root.style.setProperty('--color-primary', `hsl(${hue}, 70%, 65%)`);
    root.style.setProperty('--color-secondary', `hsl(${hue + 30}, 65%, 55%)`);
    root.style.setProperty('--color-accent', `hsl(${hue + 60}, 75%, 60%)`);
    
    // 更新 body 背景
    document.body.style.background = `linear-gradient(135deg, ${bg1}, ${bg2}, ${bg3})`;
    document.body.style.backgroundSize = '400% 400%';
}

// ============ 天气动画生成 ============
function createWeatherAnimations(weatherType) {
    const container = elements.weatherAnimations;
    container.innerHTML = '';
    
    if (weatherType === 'rainy' || weatherType === 'heavyRain' || weatherType === 'thunder') {
        // 雨滴
        const dropCount = weatherType === 'heavyRain' ? 50 : 30;
        for (let i = 0; i < dropCount; i++) {
            const drop = document.createElement('div');
            drop.className = 'raindrop';
            drop.style.left = `${Math.random() * 100}%`;
            drop.style.animationDuration = `${0.5 + Math.random() * 0.5}s`;
            drop.style.animationDelay = `${Math.random() * 2}s`;
            container.appendChild(drop);
        }
    }
    
    if (weatherType === 'snowy') {
        // 雪花
        for (let i = 0; i < 40; i++) {
            const flake = document.createElement('div');
            flake.className = 'snowflake';
            flake.textContent = '❄';
            flake.style.left = `${Math.random() * 100}%`;
            flake.style.fontSize = `${10 + Math.random() * 14}px`;
            flake.style.animationDuration = `${5 + Math.random() * 7}s`;
            flake.style.animationDelay = `${Math.random() * 5}s`;
            flake.style.opacity = 0.4 + Math.random() * 0.4;
            container.appendChild(flake);
        }
    }
    
    if (weatherType === 'cloudy' || weatherType === 'partlyCloudy') {
        // 云朵
        for (let i = 0; i < 3; i++) {
            const cloud = document.createElement('div');
            cloud.className = 'cloud-anim';
            cloud.style.top = `${10 + i * 15}%`;
            cloud.style.animationDuration = `${30 + i * 15}s`;
            cloud.style.animationDelay = `-${i * 10}s`;
            cloud.style.opacity = 0.15 + Math.random() * 0.1;
            container.appendChild(cloud);
        }
    }
    
    if (weatherType === 'foggy') {
        // 雾气层
        for (let i = 0; i < 4; i++) {
            const fog = document.createElement('div');
            fog.className = 'fog-layer';
            fog.style.top = `${i * 25}%`;
            fog.style.animationDuration = `${25 + i * 8}s`;
            fog.style.animationDelay = `-${i * 5}s`;
            fog.style.opacity = 0.15 + i * 0.05;
            container.appendChild(fog);
        }
    }
    
    if (weatherType === 'thunder') {
        // 闪电效果 - 通过 CSS animation 控制
        const lightning = document.createElement('div');
        lightning.className = 'lightning-flash';
        container.appendChild(lightning);
    }
}

// ============ 格式化函数 ============
function formatDate(date) {
    const options = {
        weekday: 'long',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    };
    return date.toLocaleDateString('zh-CN', options);
}

function getWeekday(date) {
    const weekdays = ['周日', '周一', '周二', '周三', '周四', '周五', '周六'];
    return weekdays[date.getDay()];
}

function formatTime(hours24) {
    // 从 24 小时制字符串如 "07:35" 转换为显示时间
    return hours24;
}

function getWindDirection(deg) {
    const dirs = ['北', '东北', '东', '东南', '南', '西南', '西', '西北'];
    const idx = Math.round(deg / 45) % 8;
    return dirs[idx];
}

function getHumidityDesc(humidity) {
    if (humidity < 30) return '干燥';
    if (humidity < 60) return '舒适';
    if (humidity < 80) return '较湿润';
    return '潮湿';
}

function getVisibilityDesc(km) {
    if (km >= 10) return '非常清晰';
    if (km >= 5) return '良好';
    if (km >= 2) return '一般';
    return '较差';
}

function getUVDesc(uv) {
    if (uv < 3) return '低';
    if (uv < 6) return '中等';
    if (uv < 8) return '高';
    if (uv < 11) return '极高';
    return '危险';
}

function getPressureTrend(current) {
    if (current > 1020) return '稳定 · 高气压';
    if (current > 1000) return '正常';
    return '偏低 · 可能有变化';
}

// ============ 紫外线显示更新 ============
function updateUVIndicator(uv) {
    if (!elements.uvSegments) return;
    const segments = elements.uvSegments.querySelectorAll('div');
    const activeCount = Math.min(Math.ceil(uv / 2), segments.length);
    segments.forEach((seg, i) => {
        if (i < activeCount) {
            seg.classList.add('active');
        } else {
            seg.classList.remove('active');
        }
    });
}

// ============ 温度曲线图 ============
function drawTempChart(temps) {
    const chart = elements.tempChart;
    if (!chart) return;
    
    const width = 800;
    const height = 120;
    const padding = 20;
    
    const minTemp = Math.min(...temps) - 2;
    const maxTemp = Math.max(...temps) + 2;
    const range = maxTemp - minTemp || 1;
    
    // 计算每个点的坐标
    const points = temps.map((temp, i) => {
        const x = padding + (i / (temps.length - 1)) * (width - 2 * padding);
        const y = height - padding - ((temp - minTemp) / range) * (height - 2 * padding);
        return { x, y };
    });
    
    // 创建 SVG 路径
    let pathD = `M ${points[0].x} ${points[0].y}`;
    for (let i = 1; i < points.length; i++) {
        const prev = points[i - 1];
        const curr = points[i];
        const cpx = (prev.x + curr.x) / 2;
        pathD += ` Q ${prev.x + (curr.x - prev.x) * 0.4} ${prev.y} ${cpx} ${(prev.y + curr.y) / 2} T ${curr.x} ${curr.y}`;
    }
    
    // 面积路径
    const areaD = pathD + ` L ${points[points.length - 1].x} ${height - padding} L ${points[0].x} ${height - padding} Z`;
    
    chart.innerHTML = `
        <defs>
            <linearGradient id="tempGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stop-color="hsl(${getComputedStyle(document.documentElement).getPropertyValue('--primary-hue')}, 80%, 70%)"/>
                <stop offset="100%" stop-color="hsl(${parseInt(getComputedStyle(document.documentElement).getPropertyValue('--primary-hue')) + 60}, 80%, 65%)"/>
            </linearGradient>
            <linearGradient id="tempAreaGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" stop-color="hsl(${getComputedStyle(document.documentElement).getPropertyValue('--primary-hue')}, 80%, 70%)" stop-opacity="0.4"/>
                <stop offset="100%" stop-color="hsl(${getComputedStyle(document.documentElement).getPropertyValue('--primary-hue')}, 80%, 70%)" stop-opacity="0"/>
            </linearGradient>
        </defs>
        <path class="temp-area" d="${areaD}"/>
        <path class="temp-line" d="${pathD}"/>
        ${points.map((p, i) => i % 3 === 0 ? `<circle cx="${p.x}" cy="${p.y}" r="3" class="temp-dot"/>` : '').join('')}
    `;
}

// ============ 小时预报生成 ============
function renderHourlyForecast(hourlyData, startHour) {
    if (!elements.hourlyScroll) return;
    elements.hourlyScroll.innerHTML = '';
    
    const hoursToShow = 24;
    
    for (let i = 0; i < hoursToShow; i++) {
        const hourIndex = startHour + i;
        if (hourIndex >= hourlyData.time.length) break;
        
        const time = new Date(hourlyData.time[hourIndex]);
        const hour = time.getHours();
        const isNow = i === 0;
        const isDay = hour >= 6 && hour < 18;
        
        const code = hourlyData.weather_code[hourIndex];
        const weatherInfo = WEATHER_CODES[code] || WEATHER_CODES[0];
        const weatherType = isDay ? weatherInfo.type : weatherInfo.nightType;
        const temp = hourlyData.temperature_2m[hourIndex];
        
        const item = document.createElement('div');
        item.className = 'hourly-item' + (isNow ? ' now' : '');
        item.innerHTML = `
            <div class="hour-time">${isNow ? '现在' : hour + ':00'}</div>
            <div class="hour-icon">${createWeatherIcon(weatherType)}</div>
            <div class="hour-temp">${convertTemp(temp)}°</div>
        `;
        elements.hourlyScroll.appendChild(item);
    }
}

// ============ 7天预报生成 ============
function renderForecast(dailyData) {
    if (!elements.forecastList) return;
    elements.forecastList.innerHTML = '';
    
    const minTempOverall = Math.min(...dailyData.temperature_2m_min);
    const maxTempOverall = Math.max(...dailyData.temperature_2m_max);
    const range = maxTempOverall - minTempOverall || 1;
    
    for (let i = 0; i < 7; i++) {
        if (!dailyData.time[i]) continue;
        
        const date = new Date(dailyData.time[i]);
        const code = dailyData.weather_code[i];
        const weatherInfo = WEATHER_CODES[code] || WEATHER_CODES[0];
        const weatherType = weatherInfo.type;
        const maxTemp = dailyData.temperature_2m_max[i];
        const minTemp = dailyData.temperature_2m_min[i];
        
        const leftPct = ((minTemp - minTempOverall) / range) * 100;
        const widthPct = ((maxTemp - minTemp) / range) * 100;
        
        const row = document.createElement('div');
        row.className = 'forecast-row';
        row.innerHTML = `
            <div class="forecast-day ${i === 0 ? 'today' : ''}">${i === 0 ? '今天' : getWeekday(date)}</div>
            <div class="forecast-icon-sm">${createWeatherIcon(weatherType)}</div>
            <div class="forecast-low">${convertTemp(minTemp)}°</div>
            <div class="forecast-bar">
                <div class="forecast-bar-fill" style="left: ${leftPct}%; width: ${widthPct}%;"></div>
            </div>
            <div class="forecast-high">${convertTemp(maxTemp)}°</div>
            <div class="forecast-desc-sm">${weatherInfo.desc}</div>
        `;
        elements.forecastList.appendChild(row);
    }
}

// ============ 主天气显示更新 ============
function updateWeatherDisplay(data, cityInfo, isDay) {
    const current = data.current;
    const code = current.weather_code;
    const weatherInfo = WEATHER_CODES[code] || WEATHER_CODES[0];
    const weatherType = isDay ? weatherInfo.type : weatherInfo.nightType;
    
    // 更新主题
    updateTheme(weatherType);
    
    // 更新图标
    if (elements.weatherIcon) {
        elements.weatherIcon.innerHTML = createWeatherIcon(weatherType);
    }
    
    // 更新天气动画
    createWeatherAnimations(weatherType);
    
    // 更新基础信息
    if (elements.cityName) elements.cityName.textContent = cityInfo.name;
    if (elements.currentDate) elements.currentDate.textContent = formatDate(new Date());
    
    // 温度
    if (elements.tempValue) elements.tempValue.textContent = convertTemp(current.temperature_2m);
    if (elements.tempUnit) elements.tempUnit.textContent = getUnitSymbol();
    
    // 今日最高最低
    const todayMax = data.daily?.temperature_2m_max?.[0];
    const todayMin = data.daily?.temperature_2m_min?.[0];
    if (elements.tempMax && todayMax !== undefined) elements.tempMax.textContent = `${convertTemp(todayMax)}°`;
    if (elements.tempMin && todayMin !== undefined) elements.tempMin.textContent = `${convertTemp(todayMin)}°`;
    
    // 体感温度
    if (elements.feelsLike) elements.feelsLike.textContent = `${convertTemp(current.apparent_temperature)}°`;
    
    // 描述
    if (elements.weatherDesc) elements.weatherDesc.textContent = weatherInfo.desc;
    
    // 湿度
    const humidity = current.relative_humidity_2m;
    if (elements.humidity) elements.humidity.textContent = `${humidity}%`;
    if (elements.humidityDesc) elements.humidityDesc.textContent = getHumidityDesc(humidity);
    
    // 湿度圆环
    if (elements.humidityCircle) {
        const circumference = 2 * Math.PI * 40;
        elements.humidityCircle.style.strokeDasharray = circumference;
        elements.humidityCircle.style.strokeDashoffset = circumference - (humidity / 100) * circumference;
    }
    
    // 风速
    if (elements.windSpeed) elements.windSpeed.textContent = `${current.wind_speed_10m} km/h`;
    if (elements.windDirection) elements.windDirection.textContent = getWindDirection(current.wind_direction_10m);
    if (elements.windArrow) {
        elements.windArrow.setAttribute('transform', `rotate(${current.wind_direction_10m} 50 50)`);
    }
    
    // 气压
    const pressure = Math.round(current.pressure_msl);
    if (elements.pressure) elements.pressure.textContent = `${pressure} hPa`;
    if (elements.pressureTrend) elements.pressureTrend.textContent = getPressureTrend(pressure);
    
    // 能见度
    const visKm = Math.round(current.visibility / 100) / 10;
    if (elements.visibility) elements.visibility.textContent = `${visKm} km`;
    if (elements.visibilityDesc) elements.visibilityDesc.textContent = getVisibilityDesc(visKm);
    if (elements.visibilityBar) elements.visibilityBar.style.width = `${Math.min(visKm / 15 * 100, 100)}%`;
    
    // 紫外线指数 (简化：根据 cloud cover 估算)
    const uvIndex = isDay ? Math.max(0, Math.round((100 - current.cloud_cover) / 20) + 1) : 0;
    if (elements.uvValue) elements.uvValue.textContent = uvIndex;
    if (elements.uvDesc) elements.uvDesc.textContent = getUVDesc(uvIndex);
    updateUVIndicator(uvIndex);
    
    // 日出日落 (简化: 根据纬度估算)
    const now = new Date();
    const dayOfYear = Math.floor((now - new Date(now.getFullYear(), 0, 0)) / (1000 * 60 * 60 * 24));
    const lat = cityInfo.lat || 35;
    const declination = 23.45 * Math.sin((360 / 365) * (dayOfYear - 81) * Math.PI / 180);
    const latRad = lat * Math.PI / 180;
    const hourAngle = Math.acos(-Math.tan(latRad) * Math.tan(declination * Math.PI / 180)) * 180 / Math.PI;
    
    let sunriseHour = 12 - hourAngle / 15;
    let sunsetHour = 12 + hourAngle / 15;
    
    // 边界情况处理
    if (isNaN(sunriseHour)) {
        sunriseHour = lat > 0 ? (dayOfYear > 172 && dayOfYear < 266 ? 4 : 7) : 7;
        sunsetHour = lat > 0 ? (dayOfYear > 172 && dayOfYear < 266 ? 20 : 17) : 17;
    }
    
    const sunriseMin = Math.round((sunriseHour - Math.floor(sunriseHour)) * 60);
    const sunsetMin = Math.round((sunsetHour - Math.floor(sunsetHour)) * 60);
    
    if (elements.sunrise) elements.sunrise.textContent = `${String(Math.floor(sunriseHour)).padStart(2, '0')}:${String(sunriseMin).padStart(2, '0')}`;
    if (elements.sunset) elements.sunset.textContent = `${String(Math.floor(sunsetHour)).padStart(2, '0')}:${String(sunsetMin).padStart(2, '0')}`;
    
    // 小时预报和温度曲线
    if (data.hourly) {
        const currentHour = new Date().getHours();
        const temps24h = [];
        for (let i = 0; i < 24; i++) {
            if (data.hourly.temperature_2m[currentHour + i] !== undefined) {
                temps24h.push(data.hourly.temperature_2m[currentHour + i]);
            }
        }
        if (temps24h.length > 5) {
            drawTempChart(temps24h);
        }
        renderHourlyForecast(data.hourly, currentHour);
    }
    
    // 7天预报
    if (data.daily) {
        renderForecast(data.daily);
    }
    
    state.currentWeather = weatherType;
}

// ============ API 调用 ============
async function getCityCoordinates(city) {
    const response = await fetch(
        `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(city)}&count=1&language=zh&format=json`
    );
    const data = await response.json();
    
    if (!data.results || data.results.length === 0) {
        throw new Error('未找到该城市');
    }
    
    return {
        lat: data.results[0].latitude,
        lon: data.results[0].longitude,
        name: data.results[0].name,
        country: data.results[0].country || ''
    };
}

async function getWeatherData(lat, lon) {
    const response = await fetch(
        `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}` +
        `&current=temperature_2m,apparent_temperature,is_day,precipitation,rain,showers,snowfall,weather_code,cloud_cover,pressure_msl,surface_pressure,wind_speed_10m,wind_direction_10m,visibility,relative_humidity_2m` +
        `&hourly=temperature_2m,weather_code,precipitation_probability,cloud_cover` +
        `&daily=weather_code,temperature_2m_max,temperature_2m_min,sunrise,sunset,precipitation_sum,wind_speed_10m_max` +
        `&timezone=auto&forecast_days=7`
    );
    return await response.json();
}

async function searchWeather(city) {
    showLoading(true);
    
    try {
        const cityInfo = await getCityCoordinates(city);
        const weatherData = await getWeatherData(cityInfo.lat, cityInfo.lon);
        
        const isDay = weatherData.current.is_day === 1;
        state.currentCity = cityInfo.name;
        state.isDay = isDay;
        
        updateWeatherDisplay(weatherData, cityInfo, isDay);
        
    } catch (error) {
        console.error('获取天气数据失败:', error);
        alert('无法获取该城市的天气数据，请尝试其他城市名称');
    } finally {
        showLoading(false);
    }
}

// ============ 定位功能 ============
function useCurrentLocation() {
    if (!navigator.geolocation) {
        alert('您的浏览器不支持地理定位');
        return;
    }
    
    showLoading(true);
    
    navigator.geolocation.getCurrentPosition(
        async (position) => {
            try {
                const { latitude, longitude } = position.coords;
                const weatherData = await getWeatherData(latitude, longitude);
                
                const isDay = weatherData.current.is_day === 1;
                const cityInfo = {
                    name: '当前位置',
                    lat: latitude,
                    lon: longitude
                };
                
                state.currentCity = '当前位置';
                state.isDay = isDay;
                
                updateWeatherDisplay(weatherData, cityInfo, isDay);
                
            } catch (error) {
                alert('获取天气数据失败');
            } finally {
                showLoading(false);
            }
        },
        (error) => {
            showLoading(false);
            if (error.code === 1) {
                alert('请允许浏览器访问您的位置');
            } else {
                alert('获取位置失败');
            }
        },
        { timeout: 10000, enableHighAccuracy: true }
    );
}

// ============ 加载状态 ============
function showLoading(show) {
    if (show) {
        elements.loadingOverlay?.classList.add('active');
    } else {
        elements.loadingOverlay?.classList.remove('active');
    }
}

// ============ 温度单位切换 ============
function toggleUnit() {
    state.unit = state.unit === 'C' ? 'F' : 'C';
    elements.unitToggle.textContent = `°${state.unit}`;
    
    // 如果已有数据，重新渲染
    if (state.currentCity) {
        searchWeather(state.currentCity);
    }
}

// ============ 初始化 ============
function init() {
    // 搜索框事件
    elements.cityInput?.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            const city = elements.cityInput.value.trim();
            if (city) {
                searchWeather(city);
            }
        }
    });
    
    // 定位按钮
    elements.locationBtn?.addEventListener('click', useCurrentLocation);
    
    // 单位切换
    elements.unitToggle?.addEventListener('click', toggleUnit);
    
    // 默认搜索北京
    searchWeather('北京');
}

// 启动应用
document.addEventListener('DOMContentLoaded', init);
