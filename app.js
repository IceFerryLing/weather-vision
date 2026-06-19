/**
 * 天气视窗 - Weather Vision
 * 动态天气应用，根据天气类型改变页面视觉效果
 */

// 天气代码映射 (Open-Meteo WMO Weather interpretation codes)
const WEATHER_CODES = {
    0: { desc: '晴朗', icon: '☀️', type: 'sunny' },
    1: { desc: ' mainly clear', icon: '🌤️', type: 'sunny' },
    2: { desc: '多云', icon: '⛅', type: 'cloudy' },
    3: { desc: '阴天', icon: '☁️', type: 'cloudy' },
    45: { desc: '雾', icon: '🌫️', type: 'foggy' },
    48: { desc: '雾凇', icon: '🌫️', type: 'foggy' },
    51: { desc: '毛毛雨', icon: '🌦️', type: 'rainy' },
    53: { desc: '中雨', icon: '🌧️', type: 'rainy' },
    55: { desc: '大雨', icon: '🌧️', type: 'rainy' },
    56: { desc: '冻雨', icon: '🌨️', type: 'snowy' },
    57: { desc: '强冻雨', icon: '🌨️', type: 'snowy' },
    61: { desc: '小雨', icon: '🌦️', type: 'rainy' },
    63: { desc: '中雨', icon: '🌧️', type: 'rainy' },
    65: { desc: '暴雨', icon: '⛈️', type: 'rainy' },
    66: { desc: '冻雨', icon: '🌨️', type: 'snowy' },
    67: { desc: '强冻雨', icon: '🌨️', type: 'snowy' },
    71: { desc: '小雪', icon: '🌨️', type: 'snowy' },
    73: { desc: '中雪', icon: '❄️', type: 'snowy' },
    75: { desc: '大雪', icon: '❄️', type: 'snowy' },
    77: { desc: '雪粒', icon: '❄️', type: 'snowy' },
    80: { desc: '阵雨', icon: '🌦️', type: 'rainy' },
    81: { desc: '强阵雨', icon: '🌧️', type: 'rainy' },
    82: { desc: '暴雨', icon: '⛈️', type: 'rainy' },
    85: { desc: '阵雪', icon: '🌨️', type: 'snowy' },
    86: { desc: '强阵雪', icon: '❄️', type: 'snowy' },
    95: { desc: '雷雨', icon: '⛈️', type: 'thunder' },
    96: { desc: '雷雨伴冰雹', icon: '⛈️', type: 'thunder' },
    99: { desc: '强雷雨伴冰雹', icon: '⛈️', type: 'thunder' }
};

// DOM 元素
const elements = {
    cityInput: document.getElementById('cityInput'),
    searchBtn: document.getElementById('searchBtn'),
    locationBtn: document.getElementById('locationBtn'),
    loading: document.getElementById('loading'),
    bgLayer: document.getElementById('bgLayer'),
    cityName: document.getElementById('cityName'),
    currentDate: document.getElementById('currentDate'),
    tempValue: document.getElementById('tempValue'),
    weatherDesc: document.getElementById('weatherDesc'),
    humidity: document.getElementById('humidity'),
    windSpeed: document.getElementById('windSpeed'),
    pressure: document.getElementById('pressure'),
    visibility: document.getElementById('visibility'),
    forecastContainer: document.getElementById('forecastContainer'),
    hourlyContainer: document.getElementById('hourlyContainer'),
    sun: document.getElementById('sun'),
    moon: document.getElementById('moon'),
    cloudsContainer: document.getElementById('cloudsContainer'),
    rainContainer: document.getElementById('rainContainer'),
    snowContainer: document.getElementById('snowContainer'),
    lightningContainer: document.getElementById('lightningContainer'),
    fogContainer: document.getElementById('fogContainer')
};

// 当前天气状态
let currentWeatherType = '';
let lightningInterval = null;

/**
 * 显示加载状态
 */
function showLoading() {
    elements.loading.classList.add('active');
}

/**
 * 隐藏加载状态
 */
function hideLoading() {
    elements.loading.classList.remove('active');
}

/**
 * 获取城市坐标
 */
async function getCityCoordinates(city) {
    try {
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
            country: data.results[0].country
        };
    } catch (error) {
        throw new Error('获取城市信息失败: ' + error.message);
    }
}

/**
 * 获取天气数据
 */
async function getWeatherData(lat, lon) {
    try {
        const response = await fetch(
            `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current=temperature_2m,relative_humidity_2m,apparent_temperature,is_day,precipitation,rain,showers,snowfall,weather_code,cloud_cover,pressure_msl,surface_pressure,wind_speed_10m,wind_direction_10m,visibility&hourly=temperature_2m,weather_code,precipitation_probability&daily=weather_code,temperature_2m_max,temperature_2m_min,precipitation_sum&timezone=auto&forecast_days=7`
        );
        return await response.json();
    } catch (error) {
        throw new Error('获取天气数据失败: ' + error.message);
    }
}

/**
 * 获取天气信息
 */
function getWeatherInfo(code) {
    return WEATHER_CODES[code] || { desc: '未知', icon: '❓', type: 'cloudy' };
}

/**
 * 更新背景效果
 */
function updateBackground(weatherType, isDay) {
    // 清除所有背景类
    elements.bgLayer.className = 'bg-layer';
    
    // 根据天气类型和时间设置背景
    if (!isDay && weatherType !== 'thunder') {
        elements.bgLayer.classList.add('bg-night');
    } else {
        elements.bgLayer.classList.add(`bg-${weatherType}`);
    }
    
    // 更新太阳/月亮
    elements.sun.classList.toggle('active', isDay && (weatherType === 'sunny' || weatherType === 'cloudy'));
    elements.moon.classList.toggle('active', !isDay && weatherType !== 'thunder');
}

/**
 * 清除天气效果
 */
function clearWeatherEffects() {
    elements.cloudsContainer.innerHTML = '';
    elements.rainContainer.innerHTML = '';
    elements.snowContainer.innerHTML = '';
    elements.fogContainer.innerHTML = '';
    
    if (lightningInterval) {
        clearInterval(lightningInterval);
        lightningInterval = null;
    }
}

/**
 * 创建云朵效果
 */
function createClouds() {
    for (let i = 1; i <= 3; i++) {
        const cloud = document.createElement('div');
        cloud.className = `cloud cloud${i} active`;
        elements.cloudsContainer.appendChild(cloud);
    }
}

/**
 * 创建雨滴效果
 */
function createRain() {
    const rainCount = 100;
    for (let i = 0; i < rainCount; i++) {
        const drop = document.createElement('div');
        drop.className = 'rain-drop active';
        drop.style.left = `${Math.random() * 100}%`;
        drop.style.animationDuration = `${0.5 + Math.random() * 0.5}s`;
        drop.style.animationDelay = `${Math.random() * 2}s`;
        elements.rainContainer.appendChild(drop);
    }
}

/**
 * 创建雪花效果
 */
function createSnow() {
    const snowCount = 50;
    const snowflakes = ['❄', '❅', '❆'];
    for (let i = 0; i < snowCount; i++) {
        const flake = document.createElement('div');
        flake.className = 'snowflake active';
        flake.textContent = snowflakes[Math.floor(Math.random() * snowflakes.length)];
        flake.style.left = `${Math.random() * 100}%`;
        flake.style.fontSize = `${0.5 + Math.random() * 1}em`;
        flake.style.animationDuration = `${3 + Math.random() * 5}s`;
        flake.style.animationDelay = `${Math.random() * 5}s`;
        elements.snowContainer.appendChild(flake);
    }
}

/**
 * 创建闪电效果
 */
function createLightning() {
    lightningInterval = setInterval(() => {
        const lightning = document.createElement('div');
        lightning.className = 'lightning flash';
        elements.lightningContainer.appendChild(lightning);
        
        setTimeout(() => {
            lightning.remove();
        }, 300);
    }, 3000 + Math.random() * 5000);
}

/**
 * 创建雾气效果
 */
function createFog() {
    for (let i = 0; i < 3; i++) {
        const fog = document.createElement('div');
        fog.className = 'fog active';
        fog.style.top = `${20 + i * 30}%`;
        fog.style.animationDelay = `${i * 3}s`;
        elements.fogContainer.appendChild(fog);
    }
}

/**
 * 更新天气效果
 */
function updateWeatherEffects(weatherType) {
    clearWeatherEffects();
    
    switch (weatherType) {
        case 'cloudy':
            createClouds();
            break;
        case 'rainy':
            createRain();
            createClouds();
            break;
        case 'snowy':
            createSnow();
            createClouds();
            break;
        case 'thunder':
            createRain();
            createLightning();
            createClouds();
            break;
        case 'foggy':
            createFog();
            break;
    }
}

/**
 * 格式化日期
 */
function formatDate(date) {
    const options = { 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric', 
        weekday: 'long',
        hour: '2-digit',
        minute: '2-digit'
    };
    return date.toLocaleDateString('zh-CN', options);
}

/**
 * 获取星期几
 */
function getWeekday(date) {
    const weekdays = ['周日', '周一', '周二', '周三', '周四', '周五', '周六'];
    return weekdays[date.getDay()];
}

/**
 * 更新当前天气显示
 */
function updateCurrentWeather(data, cityInfo) {
    const current = data.current;
    const weatherInfo = getWeatherInfo(current.weather_code);
    
    elements.cityName.textContent = cityInfo.name;
    elements.currentDate.textContent = formatDate(new Date());
    elements.tempValue.textContent = Math.round(current.temperature_2m);
    elements.weatherDesc.textContent = weatherInfo.desc;
    elements.humidity.textContent = `${current.relative_humidity_2m}%`;
    elements.windSpeed.textContent = `${current.wind_speed_10m} km/h`;
    elements.pressure.textContent = `${Math.round(current.pressure_msl)} hPa`;
    elements.visibility.textContent = `${(current.visibility / 1000).toFixed(1)} km`;
    
    // 更新背景和效果
    const isDay = current.is_day === 1;
    updateBackground(weatherInfo.type, isDay);
    updateWeatherEffects(weatherInfo.type);
    
    currentWeatherType = weatherInfo.type;
}

/**
 * 更新未来预报
 */
function updateForecast(data) {
    const daily = data.daily;
    elements.forecastContainer.innerHTML = '';
    
    for (let i = 0; i < 7; i++) {
        const date = new Date(daily.time[i]);
        const weatherInfo = getWeatherInfo(daily.weather_code[i]);
        const maxTemp = Math.round(daily.temperature_2m_max[i]);
        const minTemp = Math.round(daily.temperature_2m_min[i]);
        
        const item = document.createElement('div');
        item.className = 'forecast-item';
        item.innerHTML = `
            <div class="day">${i === 0 ? '今天' : getWeekday(date)}</div>
            <div class="forecast-icon">${weatherInfo.icon}</div>
            <div class="forecast-temp">${maxTemp}° / ${minTemp}°</div>
            <div class="forecast-desc">${weatherInfo.desc}</div>
        `;
        elements.forecastContainer.appendChild(item);
    }
}

/**
 * 更新小时预报
 */
function updateHourly(data) {
    const hourly = data.hourly;
    elements.hourlyContainer.innerHTML = '';
    
    const currentHour = new Date().getHours();
    
    for (let i = currentHour; i < currentHour + 24; i++) {
        if (i >= hourly.time.length) break;
        
        const time = new Date(hourly.time[i]);
        const hour = time.getHours();
        const weatherInfo = getWeatherInfo(hourly.weather_code[i]);
        const temp = Math.round(hourly.temperature_2m[i]);
        
        const item = document.createElement('div');
        item.className = 'hourly-item';
        item.innerHTML = `
            <div class="hour">${hour}:00</div>
            <div class="hourly-icon">${weatherInfo.icon}</div>
            <div class="hourly-temp">${temp}°</div>
        `;
        elements.hourlyContainer.appendChild(item);
    }
}

/**
 * 搜索城市天气
 */
async function searchWeather(city) {
    showLoading();
    
    try {
        const cityInfo = await getCityCoordinates(city);
        const weatherData = await getWeatherData(cityInfo.lat, cityInfo.lon);
        
        updateCurrentWeather(weatherData, cityInfo);
        updateForecast(weatherData);
        updateHourly(weatherData);
        
    } catch (error) {
        alert(error.message);
    } finally {
        hideLoading();
    }
}

/**
 * 使用当前位置
 */
function useCurrentLocation() {
    if (!navigator.geolocation) {
        alert('您的浏览器不支持地理定位');
        return;
    }
    
    showLoading();
    
    navigator.geolocation.getCurrentPosition(
        async (position) => {
            try {
                const { latitude, longitude } = position.coords;
                const weatherData = await getWeatherData(latitude, longitude);
                
                // 反向获取城市名称
                const cityInfo = {
                    name: '当前位置',
                    lat: latitude,
                    lon: longitude
                };
                
                updateCurrentWeather(weatherData, cityInfo);
                updateForecast(weatherData);
                updateHourly(weatherData);
                
            } catch (error) {
                alert('获取天气数据失败: ' + error.message);
            } finally {
                hideLoading();
            }
        },
        (error) => {
            hideLoading();
            alert('获取位置失败: ' + error.message);
        }
    );
}

/**
 * 初始化应用
 */
function init() {
    // 绑定搜索事件
    elements.searchBtn.addEventListener('click', () => {
        const city = elements.cityInput.value.trim();
        if (city) {
            searchWeather(city);
        }
    });
    
    elements.cityInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            const city = elements.cityInput.value.trim();
            if (city) {
                searchWeather(city);
            }
        }
    });
    
    // 绑定定位事件
    elements.locationBtn.addEventListener('click', useCurrentLocation);
    
    // 默认搜索北京
    searchWeather('北京');
}

// 启动应用
document.addEventListener('DOMContentLoaded', init);
