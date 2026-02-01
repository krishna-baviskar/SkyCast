// ============================================
// WEATHER APP - ADVANCED 3D JAVASCRIPT
// ============================================

// ============================================
// CONFIGURATION & CONSTANTS
// ============================================

const CONFIG = {
    // IMPORTANT: Replace with your OpenWeatherMap API key
    API_KEY: '4de5ca5c357969b7379429be08a172d2', // Get your key from https://openweathermap.org/api
    
    // API Endpoints
    BASE_URL: 'https://api.openweathermap.org/data/2.5',
    GEO_URL: 'https://api.openweathermap.org/geo/1.0',
    
    // Default Settings
    UNITS: 'metric', // metric, imperial
    LANGUAGE: 'en',
    
    // Cache Settings
    CACHE_DURATION: 10 * 60 * 1000, // 10 minutes
    
    // LocalStorage Keys
    STORAGE_KEYS: {
        HISTORY: 'weatherHistory',
        FAVORITES: 'weatherFavorites',
        SETTINGS: 'weatherSettings',
        LAST_CITY: 'lastSearchedCity'
    }
};

// Weather Icon Mapping
const WEATHER_ICONS = {
    '01d': '☀️', '01n': '🌙',
    '02d': '⛅', '02n': '☁️',
    '03d': '☁️', '03n': '☁️',
    '04d': '☁️', '04n': '☁️',
    '09d': '🌧️', '09n': '🌧️',
    '10d': '🌦️', '10n': '🌧️',
    '11d': '⛈️', '11n': '⛈️',
    '13d': '❄️', '13n': '❄️',
    '50d': '🌫️', '50n': '🌫️'
};

// AQI Levels
const AQI_LEVELS = {
    1: { label: 'Good', color: '#10b981', description: 'Air quality is satisfactory' },
    2: { label: 'Fair', color: '#f59e0b', description: 'Air quality is acceptable' },
    3: { label: 'Moderate', color: '#ef4444', description: 'Sensitive groups may experience issues' },
    4: { label: 'Poor', color: '#8b5cf6', description: 'Everyone may experience health effects' },
    5: { label: 'Very Poor', color: '#7c3aed', description: 'Health alert: everyone may experience serious effects' }
};

// ============================================
// STATE MANAGEMENT
// ============================================

const state = {
    currentWeather: null,
    forecast: null,
    hourlyForecast: null,
    airQuality: null,
    currentCity: null,
    settings: {
        unit: 'metric',
        windUnit: 'm/s',
        timeFormat: '24',
        animations: true,
        autoRefresh: 10
    },
    compareData: {
        city1: null,
        city2: null
    }
};

// ============================================
// INITIALIZATION
// ============================================

document.addEventListener('DOMContentLoaded', () => {
    initializeApp();
});

function initializeApp() {
    console.log('🌦️ Initializing Weather App...');
    
    // Load settings
    loadSettings();
    
    // Setup event listeners
    setupEventListeners();
    
    // Initialize background animations
    initBackgroundAnimation();
    
    // Load last searched city
    loadLastSearch();
    
    // Initialize speech recognition
    initSpeechRecognition();
    
    // Hide preloader
    setTimeout(() => {
        document.getElementById('preloader').classList.add('hidden');
    }, 1500);
    
    // Auto-refresh weather data
    if (state.settings.autoRefresh > 0) {
        setInterval(() => {
            if (state.currentCity) {
                refreshWeatherData();
            }
        }, state.settings.autoRefresh * 60 * 1000);
    }
    
    console.log('✅ App initialized successfully!');
}

// ============================================
// EVENT LISTENERS
// ============================================

function setupEventListeners() {
    // Search functionality
    document.getElementById('searchBtn').addEventListener('click', handleSearch);
    document.getElementById('cityInput').addEventListener('keypress', (e) => {
        if (e.key === 'Enter') handleSearch();
    });
    
    // Location detection
    document.getElementById('locationBtn').addEventListener('click', getLocationWeather);
    
    // Voice search
    document.getElementById('voiceBtn').addEventListener('click', startVoiceSearch);
    
    // Navigation
    document.querySelectorAll('.nav-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const page = e.currentTarget.dataset.page;
            navigateToPage(page);
        });
    });
    
    // Quick city buttons
    document.querySelectorAll('.quick-city').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const city = e.currentTarget.dataset.city;
            searchCity(city);
        });
    });
    
    // Theme toggle
    document.getElementById('themeToggle').addEventListener('click', toggleTheme);
    
    // Settings
    document.getElementById('settingsBtn').addEventListener('click', () => {
        openModal('settingsModal');
    });
    
    // Clear history
    const clearHistoryBtn = document.getElementById('clearHistoryBtn');
    if (clearHistoryBtn) {
        clearHistoryBtn.addEventListener('click', clearHistory);
    }
    
    // City input suggestions
    const cityInput = document.getElementById('cityInput');
    let searchTimeout;
    cityInput.addEventListener('input', (e) => {
        clearTimeout(searchTimeout);
        const query = e.target.value.trim();
        if (query.length >= 3) {
            searchTimeout = setTimeout(() => fetchCitySuggestions(query), 300);
        } else {
            hideSuggestions();
        }
    });
}

// ============================================
// WEATHER API FUNCTIONS
// ============================================

async function searchCity(cityName) {
    if (!cityName || cityName.trim() === '') {
        showToast('Please enter a city name', 'error');
        return;
    }
    
    showLoading();
    
    try {
        // Fetch current weather
        const weatherData = await fetchCurrentWeather(cityName);
        state.currentWeather = weatherData;
        state.currentCity = cityName;
        
        // Save to history
        saveToHistory(weatherData);
        
        // Save last searched city
        localStorage.setItem(CONFIG.STORAGE_KEYS.LAST_CITY, cityName);
        
        // Display current weather
        displayCurrentWeather(weatherData);
        
        // Apply weather theme
        applyWeatherTheme(weatherData.weather[0].main);
        
        // Fetch additional data
        const { lat, lon } = weatherData.coord;
        
        // Fetch and display forecast
        fetchAndDisplayForecast(cityName);
        
        // Fetch and display hourly
        fetchAndDisplayHourly(cityName);
        
        // Fetch and display air quality
        fetchAndDisplayAirQuality(lat, lon);
        
        // Generate weather animations
        generateWeatherParticles(weatherData.weather[0].main);
        
        showToast(`Weather loaded for ${weatherData.name}`, 'success');
        
    } catch (error) {
        console.error('Error fetching weather:', error);
        showToast(error.message || 'Failed to fetch weather data', 'error');
        hideLoading();
    }
}

async function fetchCurrentWeather(city) {
    const url = `${CONFIG.BASE_URL}/weather?q=${encodeURIComponent(city)}&appid=${CONFIG.API_KEY}&units=${CONFIG.UNITS}`;
    
    const response = await fetch(url);
    
    if (!response.ok) {
        if (response.status === 404) {
            throw new Error('City not found. Please check the spelling.');
        } else if (response.status === 401) {
            throw new Error('Invalid API key. Please check your configuration.');
        }
        throw new Error('Failed to fetch weather data');
    }
    
    return await response.json();
}

async function fetchForecast(city) {
    const url = `${CONFIG.BASE_URL}/forecast?q=${encodeURIComponent(city)}&appid=${CONFIG.API_KEY}&units=${CONFIG.UNITS}`;
    
    const response = await fetch(url);
    if (!response.ok) throw new Error('Failed to fetch forecast data');
    
    return await response.json();
}

async function fetchAirQuality(lat, lon) {
    const url = `${CONFIG.BASE_URL}/air_pollution?lat=${lat}&lon=${lon}&appid=${CONFIG.API_KEY}`;
    
    const response = await fetch(url);
    if (!response.ok) throw new Error('Failed to fetch air quality data');
    
    return await response.json();
}

async function fetchWeatherByCoords(lat, lon) {
    const url = `${CONFIG.BASE_URL}/weather?lat=${lat}&lon=${lon}&appid=${CONFIG.API_KEY}&units=${CONFIG.UNITS}`;
    
    const response = await fetch(url);
    if (!response.ok) throw new Error('Failed to fetch weather data');
    
    return await response.json();
}

// ============================================
// DISPLAY FUNCTIONS
// ============================================

function displayCurrentWeather(data) {
    // Update location info
    document.getElementById('cityName').textContent = data.name;
    document.getElementById('countryName').textContent = data.sys.country;
    document.getElementById('timestamp').textContent = formatDateTime(new Date());
    
    // Update temperature
    document.getElementById('mainTemp').textContent = Math.round(data.main.temp);
    document.getElementById('feelsLike').textContent = Math.round(data.main.feels_like);
    document.getElementById('tempMax').textContent = Math.round(data.main.temp_max);
    document.getElementById('tempMin').textContent = Math.round(data.main.temp_min);
    
    // Update weather description
    document.getElementById('weatherDescription').textContent = 
        data.weather[0].description.charAt(0).toUpperCase() + data.weather[0].description.slice(1);
    
    // Update weather icon
    const iconCode = data.weather[0].icon;
    const weatherIcon = WEATHER_ICONS[iconCode] || '🌤️';
    document.getElementById('weatherIcon3D').innerHTML = `<i class="fas">${weatherIcon}</i>`;
    
    // Update stats
    updateWeatherStats(data);
    
    // Update sun times
    updateSunTimes(data);
    
    // Generate weather advice
    generateWeatherAdvice(data);
    
    hideLoading();
}

function updateWeatherStats(data) {
    // Humidity
    const humidity = data.main.humidity;
    document.getElementById('humidity').textContent = `${humidity}%`;
    document.getElementById('humidityBar').style.width = `${humidity}%`;
    
    // Wind
    const windSpeed = data.wind.speed;
    const windDeg = data.wind.deg || 0;
    document.getElementById('windSpeed').textContent = formatWindSpeed(windSpeed);
    document.getElementById('windDirection').style.transform = `rotate(${windDeg}deg)`;
    
    // Pressure
    const pressure = data.main.pressure;
    document.getElementById('pressure').textContent = `${pressure} hPa`;
    document.getElementById('pressureTrend').textContent = 
        pressure > 1013 ? '↑ High' : pressure < 1000 ? '↓ Low' : '→ Normal';
    
    // Visibility
    const visibility = (data.visibility / 1000).toFixed(1);
    document.getElementById('visibility').textContent = `${visibility} km`;
    const visibilityPercent = Math.min((data.visibility / 10000) * 100, 100);
    document.getElementById('visibilityBar').style.width = `${visibilityPercent}%`;
    
    // Cloudiness
    const cloudiness = data.clouds.all;
    document.getElementById('cloudiness').textContent = `${cloudiness}%`;
    document.getElementById('cloudinessBar').style.width = `${cloudiness}%`;
    
    // UV Index (simulated - would need additional API call for real data)
    const uvIndex = Math.floor(Math.random() * 11);
    document.getElementById('uvIndex').textContent = uvIndex;
    const uvBadge = document.getElementById('uvBadge');
    if (uvIndex <= 2) {
        uvBadge.textContent = 'Low';
        uvBadge.style.background = '#10b981';
    } else if (uvIndex <= 5) {
        uvBadge.textContent = 'Moderate';
        uvBadge.style.background = '#f59e0b';
    } else if (uvIndex <= 7) {
        uvBadge.textContent = 'High';
        uvBadge.style.background = '#ef4444';
    } else {
        uvBadge.textContent = 'Very High';
        uvBadge.style.background = '#7c3aed';
    }
}

function updateSunTimes(data) {
    const sunrise = new Date(data.sys.sunrise * 1000);
    const sunset = new Date(data.sys.sunset * 1000);
    
    document.getElementById('sunrise').textContent = formatTime(sunrise);
    document.getElementById('sunset').textContent = formatTime(sunset);
    
    // Calculate daylight hours
    const daylightMs = sunset - sunrise;
    const daylightHours = Math.floor(daylightMs / (1000 * 60 * 60));
    const daylightMinutes = Math.floor((daylightMs % (1000 * 60 * 60)) / (1000 * 60));
    document.getElementById('daylightHours').textContent = `${daylightHours}h ${daylightMinutes}m`;
    
    // Draw sun arc
    drawSunArc(sunrise, sunset);
}

function drawSunArc(sunrise, sunset) {
    const canvas = document.getElementById('sunCanvas');
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    const width = canvas.width = canvas.offsetWidth;
    const height = canvas.height = canvas.offsetHeight;
    
    ctx.clearRect(0, 0, width, height);
    
    // Draw arc
    ctx.beginPath();
    ctx.arc(width / 2, height - 20, width / 2 - 20, Math.PI, 0);
    ctx.strokeStyle = '#fbbf24';
    ctx.lineWidth = 3;
    ctx.stroke();
    
    // Calculate sun position
    const now = new Date();
    const totalDaylight = sunset - sunrise;
    const elapsed = now - sunrise;
    const progress = Math.max(0, Math.min(1, elapsed / totalDaylight));
    
    // Draw sun position
    const angle = Math.PI - (progress * Math.PI);
    const x = width / 2 + Math.cos(angle) * (width / 2 - 20);
    const y = height - 20 + Math.sin(angle) * (width / 2 - 20);
    
    ctx.beginPath();
    ctx.arc(x, y, 10, 0, 2 * Math.PI);
    ctx.fillStyle = '#fbbf24';
    ctx.fill();
    ctx.strokeStyle = '#fff';
    ctx.lineWidth = 2;
    ctx.stroke();
}

async function fetchAndDisplayForecast(city) {
    try {
        const forecastData = await fetchForecast(city);
        state.forecast = forecastData;
        displayForecast(forecastData);
    } catch (error) {
        console.error('Error fetching forecast:', error);
    }
}

function displayForecast(data) {
    const forecastGrid = document.getElementById('forecastGrid');
    if (!forecastGrid) return;
    
    // Group forecast by day
    const dailyData = {};
    data.list.forEach(item => {
        const date = new Date(item.dt * 1000).toDateString();
        if (!dailyData[date]) {
            dailyData[date] = {
                temps: [],
                weather: [],
                humidity: [],
                wind: [],
                item: item
            };
        }
        dailyData[date].temps.push(item.main.temp);
        dailyData[date].weather.push(item.weather[0]);
        dailyData[date].humidity.push(item.main.humidity);
        dailyData[date].wind.push(item.wind.speed);
    });
    
    // Get first 7 days
    const days = Object.keys(dailyData).slice(0, 7);
    
    forecastGrid.innerHTML = days.map(date => {
        const dayData = dailyData[date];
        const temps = dayData.temps;
        const maxTemp = Math.round(Math.max(...temps));
        const minTemp = Math.round(Math.min(...temps));
        const avgTemp = Math.round(temps.reduce((a, b) => a + b) / temps.length);
        
        // Most common weather
        const weatherCounts = {};
        dayData.weather.forEach(w => {
            weatherCounts[w.main] = (weatherCounts[w.main] || 0) + 1;
        });
        const dominantWeather = Object.keys(weatherCounts).reduce((a, b) => 
            weatherCounts[a] > weatherCounts[b] ? a : b
        );
        
        const icon = WEATHER_ICONS[dayData.item.weather[0].icon] || '🌤️';
        const dateObj = new Date(date);
        const dayName = dateObj.toLocaleDateString('en-US', { weekday: 'short' });
        const dateStr = dateObj.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
        
        const avgHumidity = Math.round(dayData.humidity.reduce((a, b) => a + b) / dayData.humidity.length);
        const avgWind = (dayData.wind.reduce((a, b) => a + b) / dayData.wind.length).toFixed(1);
        
        return `
            <div class="forecast-card">
                <div class="forecast-date">${dateStr}</div>
                <div class="forecast-day">${dayName}</div>
                <div class="forecast-icon">${icon}</div>
                <div class="forecast-temp">${avgTemp}°</div>
                <div class="forecast-condition">${dominantWeather}</div>
                <div class="forecast-details">
                    <div class="forecast-detail-item">
                        <i class="fas fa-arrow-up"></i>
                        <span>${maxTemp}°</span>
                    </div>
                    <div class="forecast-detail-item">
                        <i class="fas fa-arrow-down"></i>
                        <span>${minTemp}°</span>
                    </div>
                    <div class="forecast-detail-item">
                        <i class="fas fa-droplet"></i>
                        <span>${avgHumidity}%</span>
                    </div>
                </div>
            </div>
        `;
    }).join('');
    
    // Create temperature chart
    createTemperatureChart(days.map(d => {
        const temps = dailyData[d].temps;
        return {
            date: new Date(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
            max: Math.max(...temps),
            min: Math.min(...temps),
            avg: temps.reduce((a, b) => a + b) / temps.length
        };
    }));
}

async function fetchAndDisplayHourly(city) {
    try {
        const forecastData = await fetchForecast(city);
        state.hourlyForecast = forecastData;
        displayHourlyForecast(forecastData);
    } catch (error) {
        console.error('Error fetching hourly forecast:', error);
    }
}

function displayHourlyForecast(data) {
    const hourlyScroll = document.getElementById('hourlyScroll');
    if (!hourlyScroll) return;
    
    // Get next 48 hours (16 data points, 3-hour intervals)
    const hourlyData = data.list.slice(0, 16);
    
    hourlyScroll.innerHTML = hourlyData.map(item => {
        const date = new Date(item.dt * 1000);
        const time = formatTime(date);
        const icon = WEATHER_ICONS[item.weather[0].icon] || '🌤️';
        const temp = Math.round(item.main.temp);
        const feelsLike = Math.round(item.main.feels_like);
        const humidity = item.main.humidity;
        const windSpeed = item.wind.speed.toFixed(1);
        
        return `
            <div class="hourly-card">
                <div class="hourly-time">${time}</div>
                <div class="hourly-icon">${icon}</div>
                <div class="hourly-temp">${temp}°</div>
                <div class="hourly-details">
                    Feels ${feelsLike}°<br>
                    💧 ${humidity}%<br>
                    🌬️ ${windSpeed} m/s
                </div>
            </div>
        `;
    }).join('');
    
    // Create hourly charts
    createHourlyCharts(hourlyData);
}

async function fetchAndDisplayAirQuality(lat, lon) {
    try {
        const aqiData = await fetchAirQuality(lat, lon);
        state.airQuality = aqiData;
        displayAirQuality(aqiData);
    } catch (error) {
        console.error('Error fetching air quality:', error);
    }
}

function displayAirQuality(data) {
    const aqi = data.list[0].main.aqi;
    const components = data.list[0].components;
    
    const aqiInfo = AQI_LEVELS[aqi];
    
    document.getElementById('aqiValue').textContent = aqi;
    document.getElementById('aqiValue').style.background = aqiInfo.color;
    document.getElementById('aqiLabel').textContent = aqiInfo.label;
    document.getElementById('aqiDescription').textContent = aqiInfo.description;
    
    // Display pollutants
    const pollutantsGrid = document.getElementById('pollutantsGrid');
    pollutantsGrid.innerHTML = `
        <div class="pollutant-item">
            <div class="pollutant-name">CO</div>
            <div class="pollutant-value">${components.co.toFixed(1)}</div>
        </div>
        <div class="pollutant-item">
            <div class="pollutant-name">NO₂</div>
            <div class="pollutant-value">${components.no2.toFixed(1)}</div>
        </div>
        <div class="pollutant-item">
            <div class="pollutant-name">O₃</div>
            <div class="pollutant-value">${components.o3.toFixed(1)}</div>
        </div>
        <div class="pollutant-item">
            <div class="pollutant-name">PM2.5</div>
            <div class="pollutant-value">${components.pm2_5.toFixed(1)}</div>
        </div>
        <div class="pollutant-item">
            <div class="pollutant-name">PM10</div>
            <div class="pollutant-value">${components.pm10.toFixed(1)}</div>
        </div>
        <div class="pollutant-item">
            <div class="pollutant-name">SO₂</div>
            <div class="pollutant-value">${components.so2.toFixed(1)}</div>
        </div>
    `;
}

// ============================================
// WEATHER ADVICE GENERATOR
// ============================================

function generateWeatherAdvice(data) {
    const advice = [];
    const temp = data.main.temp;
    const weather = data.weather[0].main.toLowerCase();
    const humidity = data.main.humidity;
    const windSpeed = data.wind.speed;
    const visibility = data.visibility;
    
    // Temperature advice
    if (temp > 35) {
        advice.push({
            icon: '🥵',
            title: 'Extreme Heat',
            text: 'Stay hydrated and avoid prolonged sun exposure. Drink plenty of water.',
            priority: 'high'
        });
    } else if (temp > 30) {
        advice.push({
            icon: '☀️',
            title: 'Hot Weather',
            text: 'Apply sunscreen and stay in shaded areas. Light clothing recommended.',
            priority: 'medium'
        });
    } else if (temp < 0) {
        advice.push({
            icon: '🥶',
            title: 'Freezing Cold',
            text: 'Dress in layers and protect exposed skin. Risk of frostbite.',
            priority: 'high'
        });
    } else if (temp < 10) {
        advice.push({
            icon: '🧥',
            title: 'Cold Weather',
            text: 'Wear warm clothing and consider carrying a jacket.',
            priority: 'medium'
        });
    }
    
    // Weather condition advice
    if (weather.includes('rain') || weather.includes('drizzle')) {
        advice.push({
            icon: '☔',
            title: 'Rainy Weather',
            text: "Don't forget your umbrella and wear waterproof clothing.",
            priority: 'high'
        });
    } else if (weather.includes('snow')) {
        advice.push({
            icon: '❄️',
            title: 'Snowy Conditions',
            text: 'Drive carefully and allow extra time for travel. Watch for icy patches.',
            priority: 'high'
        });
    } else if (weather.includes('thunder')) {
        advice.push({
            icon: '⛈️',
            title: 'Thunderstorm Alert',
            text: 'Stay indoors and avoid open areas. Unplug electronics.',
            priority: 'high'
        });
    } else if (weather.includes('clear')) {
        advice.push({
            icon: '🌞',
            title: 'Perfect Weather',
            text: 'Great day for outdoor activities! Enjoy the sunshine.',
            priority: 'low'
        });
    }
    
    // Humidity advice
    if (humidity > 80) {
        advice.push({
            icon: '💧',
            title: 'High Humidity',
            text: 'Air conditioning recommended. Stay cool and comfortable.',
            priority: 'medium'
        });
    } else if (humidity < 30) {
        advice.push({
            icon: '🏜️',
            title: 'Low Humidity',
            text: 'Use moisturizer and stay hydrated. Dry air conditions.',
            priority: 'medium'
        });
    }
    
    // Wind advice
    if (windSpeed > 15) {
        advice.push({
            icon: '🌬️',
            title: 'Strong Winds',
            text: 'Secure loose objects and be cautious when driving.',
            priority: 'medium'
        });
    }
    
    // Visibility advice
    if (visibility < 1000) {
        advice.push({
            icon: '🌫️',
            title: 'Poor Visibility',
            text: 'Drive slowly and use headlights. Foggy conditions.',
            priority: 'high'
        });
    }
    
    // Default advice if none triggered
    if (advice.length === 0) {
        advice.push({
            icon: '😊',
            title: 'Pleasant Conditions',
            text: 'Weather conditions are comfortable. Have a great day!',
            priority: 'low'
        });
    }
    
    // Display advice
    const advisorContent = document.getElementById('advisorContent');
    advisorContent.innerHTML = advice.map(item => `
        <div class="advice-item">
            <div class="advice-icon">${item.icon}</div>
            <div class="advice-text">
                <h4>${item.title}</h4>
                <p>${item.text}</p>
                <span class="advice-priority ${item.priority}">${item.priority}</span>
            </div>
        </div>
    `).join('');
}

// ============================================
// CHART FUNCTIONS
// ============================================

function createTemperatureChart(data) {
    const canvas = document.getElementById('temperatureChart');
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    
    // Destroy existing chart if it exists
    if (window.tempChart) {
        window.tempChart.destroy();
    }
    
    window.tempChart = new Chart(ctx, {
        type: 'line',
        data: {
            labels: data.map(d => d.date),
            datasets: [
                {
                    label: 'Max Temp',
                    data: data.map(d => d.max),
                    borderColor: '#ef4444',
                    backgroundColor: 'rgba(239, 68, 68, 0.1)',
                    tension: 0.4,
                    fill: true
                },
                {
                    label: 'Avg Temp',
                    data: data.map(d => d.avg),
                    borderColor: '#3b82f6',
                    backgroundColor: 'rgba(59, 130, 246, 0.1)',
                    tension: 0.4,
                    fill: true
                },
                {
                    label: 'Min Temp',
                    data: data.map(d => d.min),
                    borderColor: '#10b981',
                    backgroundColor: 'rgba(16, 185, 129, 0.1)',
                    tension: 0.4,
                    fill: true
                }
            ]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    display: true,
                    position: 'top',
                    labels: {
                        color: '#94a3b8',
                        font: {
                            size: 12
                        }
                    }
                },
                tooltip: {
                    mode: 'index',
                    intersect: false
                }
            },
            scales: {
                y: {
                    beginAtZero: false,
                    ticks: {
                        color: '#94a3b8',
                        callback: function(value) {
                            return value + '°C';
                        }
                    },
                    grid: {
                        color: 'rgba(148, 163, 184, 0.1)'
                    }
                },
                x: {
                    ticks: {
                        color: '#94a3b8'
                    },
                    grid: {
                        color: 'rgba(148, 163, 184, 0.1)'
                    }
                }
            }
        }
    });
}

function createHourlyCharts(data) {
    // Temperature chart
    const tempCanvas = document.getElementById('hourlyTempChart');
    if (tempCanvas) {
        const ctx = tempCanvas.getContext('2d');
        
        if (window.hourlyTempChart) {
            window.hourlyTempChart.destroy();
        }
        
        window.hourlyTempChart = new Chart(ctx, {
            type: 'line',
            data: {
                labels: data.map(d => formatTime(new Date(d.dt * 1000))),
                datasets: [
                    {
                        label: 'Temperature',
                        data: data.map(d => d.main.temp),
                        borderColor: '#3b82f6',
                        backgroundColor: 'rgba(59, 130, 246, 0.1)',
                        tension: 0.4,
                        fill: true
                    },
                    {
                        label: 'Feels Like',
                        data: data.map(d => d.main.feels_like),
                        borderColor: '#f59e0b',
                        backgroundColor: 'rgba(245, 158, 11, 0.1)',
                        tension: 0.4,
                        fill: true,
                        borderDash: [5, 5]
                    }
                ]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        labels: {
                            color: '#94a3b8'
                        }
                    }
                },
                scales: {
                    y: {
                        ticks: {
                            color: '#94a3b8',
                            callback: (value) => value + '°C'
                        },
                        grid: {
                            color: 'rgba(148, 163, 184, 0.1)'
                        }
                    },
                    x: {
                        ticks: {
                            color: '#94a3b8'
                        },
                        grid: {
                            color: 'rgba(148, 163, 184, 0.1)'
                        }
                    }
                }
            }
        });
    }
    
    // Precipitation chart
    const precipCanvas = document.getElementById('hourlyPrecipChart');
    if (precipCanvas) {
        const ctx = precipCanvas.getContext('2d');
        
        if (window.hourlyPrecipChart) {
            window.hourlyPrecipChart.destroy();
        }
        
        window.hourlyPrecipChart = new Chart(ctx, {
            type: 'bar',
            data: {
                labels: data.map(d => formatTime(new Date(d.dt * 1000))),
                datasets: [{
                    label: 'Precipitation Probability',
                    data: data.map(d => (d.pop * 100).toFixed(0)),
                    backgroundColor: 'rgba(59, 130, 246, 0.5)',
                    borderColor: '#3b82f6',
                    borderWidth: 1
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        labels: {
                            color: '#94a3b8'
                        }
                    }
                },
                scales: {
                    y: {
                        beginAtZero: true,
                        max: 100,
                        ticks: {
                            color: '#94a3b8',
                            callback: (value) => value + '%'
                        },
                        grid: {
                            color: 'rgba(148, 163, 184, 0.1)'
                        }
                    },
                    x: {
                        ticks: {
                            color: '#94a3b8'
                        },
                        grid: {
                            color: 'rgba(148, 163, 184, 0.1)'
                        }
                    }
                }
            }
        });
    }
}

// ============================================
// LOCATION & GEOLOCATION
// ============================================

function getLocationWeather() {
    if (!navigator.geolocation) {
        showToast('Geolocation is not supported by your browser', 'error');
        return;
    }
    
    showToast('Getting your location...', 'info');
    
    navigator.geolocation.getCurrentPosition(
        async (position) => {
            const { latitude, longitude } = position.coords;
            
            try {
                const weatherData = await fetchWeatherByCoords(latitude, longitude);
                state.currentWeather = weatherData;
                state.currentCity = weatherData.name;
                
                document.getElementById('cityInput').value = weatherData.name;
                
                displayCurrentWeather(weatherData);
                applyWeatherTheme(weatherData.weather[0].main);
                
                fetchAndDisplayForecast(weatherData.name);
                fetchAndDisplayHourly(weatherData.name);
                fetchAndDisplayAirQuality(latitude, longitude);
                
                generateWeatherParticles(weatherData.weather[0].main);
                
                saveToHistory(weatherData);
                
                showToast(`Weather loaded for your location: ${weatherData.name}`, 'success');
                
            } catch (error) {
                console.error('Error:', error);
                showToast('Failed to fetch weather for your location', 'error');
            }
        },
        (error) => {
            let message = 'Failed to get your location';
            if (error.code === error.PERMISSION_DENIED) {
                message = 'Location permission denied. Please enable location access.';
            }
            showToast(message, 'error');
        },
        {
            enableHighAccuracy: true,
            timeout: 5000,
            maximumAge: 0
        }
    );
}

// ============================================
// VOICE SEARCH
// ============================================

let recognition = null;

function initSpeechRecognition() {
    if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
        document.getElementById('voiceBtn').style.display = 'none';
        return;
    }
    
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    recognition = new SpeechRecognition();
    
    recognition.continuous = false;
    recognition.interimResults = false;
    recognition.lang = 'en-US';
    
    recognition.onstart = () => {
        document.getElementById('voiceBtn').classList.add('listening');
        showToast('Listening... Speak a city name', 'info');
    };
    
    recognition.onresult = (event) => {
        const transcript = event.results[0][0].transcript;
        document.getElementById('cityInput').value = transcript;
        searchCity(transcript);
    };
    
    recognition.onerror = (event) => {
        console.error('Speech recognition error:', event.error);
        showToast('Voice recognition failed. Please try again.', 'error');
        document.getElementById('voiceBtn').classList.remove('listening');
    };
    
    recognition.onend = () => {
        document.getElementById('voiceBtn').classList.remove('listening');
    };
}

function startVoiceSearch() {
    if (recognition) {
        recognition.start();
    } else {
        showToast('Voice search not available', 'error');
    }
}

// ============================================
// CITY SUGGESTIONS
// ============================================

async function fetchCitySuggestions(query) {
    try {
        const url = `${CONFIG.GEO_URL}/direct?q=${encodeURIComponent(query)}&limit=5&appid=${CONFIG.API_KEY}`;
        const response = await fetch(url);
        
        if (!response.ok) return;
        
        const data = await response.json();
        displaySuggestions(data);
    } catch (error) {
        console.error('Error fetching suggestions:', error);
    }
}

function displaySuggestions(cities) {
    const suggestionsEl = document.getElementById('searchSuggestions');
    
    if (cities.length === 0) {
        hideSuggestions();
        return;
    }
    
    suggestionsEl.innerHTML = cities.map(city => `
        <div class="suggestion-item" onclick="selectCity('${city.name}', '${city.country}')">
            <strong>${city.name}</strong>, ${city.country}
            ${city.state ? `, ${city.state}` : ''}
        </div>
    `).join('');
    
    suggestionsEl.classList.add('active');
}

function hideSuggestions() {
    const suggestionsEl = document.getElementById('searchSuggestions');
    suggestionsEl.classList.remove('active');
    suggestionsEl.innerHTML = '';
}

function selectCity(city, country) {
    document.getElementById('cityInput').value = city;
    hideSuggestions();
    searchCity(city);
}

// Click outside to close suggestions
document.addEventListener('click', (e) => {
    if (!e.target.closest('.search-bar-3d')) {
        hideSuggestions();
    }
});

// ============================================
// THEME FUNCTIONS
// ============================================

function applyWeatherTheme(weather) {
    if (!state.settings.animations) return;
    
    const body = document.body;
    body.className = ''; // Remove all classes
    
    const themes = {
        'Clear': 'sunny-theme',
        'Clouds': 'cloudy-theme',
        'Rain': 'rainy-theme',
        'Drizzle': 'rainy-theme',
        'Snow': 'snowy-theme',
        'Thunderstorm': 'stormy-theme',
        'Mist': 'cloudy-theme',
        'Fog': 'cloudy-theme'
    };
    
    const themeClass = themes[weather] || 'default-theme';
    body.classList.add(themeClass);
}

function toggleTheme() {
    const body = document.body;
    const themeIcon = document.querySelector('#themeToggle i');
    
    body.classList.toggle('light-theme');
    
    if (body.classList.contains('light-theme')) {
        themeIcon.classList.remove('fa-moon');
        themeIcon.classList.add('fa-sun');
    } else {
        themeIcon.classList.remove('fa-sun');
        themeIcon.classList.add('fa-moon');
    }
}

// ============================================
// WEATHER PARTICLES ANIMATION
// ============================================

function generateWeatherParticles(weather) {
    if (!state.settings.animations) return;
    
    const container = document.getElementById('weatherParticles');
    container.innerHTML = ''; // Clear existing particles
    
    const particleCount = 50;
    
    if (weather === 'Rain' || weather === 'Drizzle') {
        for (let i = 0; i < particleCount; i++) {
            const particle = document.createElement('div');
            particle.className = 'particle rain-particle';
            particle.style.left = Math.random() * 100 + '%';
            particle.style.animationDelay = Math.random() * 2 + 's';
            particle.style.animationDuration = (Math.random() * 0.5 + 0.5) + 's';
            container.appendChild(particle);
        }
    } else if (weather === 'Snow') {
        for (let i = 0; i < particleCount; i++) {
            const particle = document.createElement('div');
            particle.className = 'particle snow-particle';
            particle.style.left = Math.random() * 100 + '%';
            particle.style.animationDelay = Math.random() * 5 + 's';
            particle.style.animationDuration = (Math.random() * 3 + 3) + 's';
            container.appendChild(particle);
        }
    } else if (weather === 'Clouds') {
        for (let i = 0; i < 10; i++) {
            const particle = document.createElement('div');
            particle.className = 'particle cloud-particle';
            particle.style.top = Math.random() * 50 + '%';
            particle.style.left = '100%';
            particle.style.animationDelay = Math.random() * 20 + 's';
            container.appendChild(particle);
        }
    }
}

// ============================================
// BACKGROUND ANIMATION
// ============================================

function initBackgroundAnimation() {
    const canvas = document.getElementById('backgroundCanvas');
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    
    const particles = [];
    const particleCount = 100;
    
    for (let i = 0; i < particleCount; i++) {
        particles.push({
            x: Math.random() * canvas.width,
            y: Math.random() * canvas.height,
            radius: Math.random() * 2 + 1,
            vx: Math.random() * 0.5 - 0.25,
            vy: Math.random() * 0.5 - 0.25,
            opacity: Math.random() * 0.5 + 0.2
        });
    }
    
    function animate() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        
        particles.forEach(particle => {
            particle.x += particle.vx;
            particle.y += particle.vy;
            
            if (particle.x < 0 || particle.x > canvas.width) particle.vx *= -1;
            if (particle.y < 0 || particle.y > canvas.height) particle.vy *= -1;
            
            ctx.beginPath();
            ctx.arc(particle.x, particle.y, particle.radius, 0, Math.PI * 2);
            ctx.fillStyle = `rgba(255, 255, 255, ${particle.opacity})`;
            ctx.fill();
        });
        
        requestAnimationFrame(animate);
    }
    
    animate();
    
    window.addEventListener('resize', () => {
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
    });
}

// ============================================
// NAVIGATION
// ============================================

function navigateToPage(pageName) {
    // Update nav buttons
    document.querySelectorAll('.nav-btn').forEach(btn => {
        btn.classList.remove('active');
        if (btn.dataset.page === pageName) {
            btn.classList.add('active');
        }
    });
    
    // Update pages
    document.querySelectorAll('.page').forEach(page => {
        page.classList.remove('active');
    });
    
    const targetPage = document.getElementById(pageName + 'Page');
    if (targetPage) {
        targetPage.classList.add('active');
    }
    
    // Load page-specific data
    if (pageName === 'history') {
        loadHistoryPage();
    }
}

// ============================================
// COMPARE CITIES
// ============================================

async function compareCity(cityNumber) {
    const inputId = `compareCity${cityNumber}`;
    const cityName = document.getElementById(inputId).value.trim();
    
    if (!cityName) {
        showToast('Please enter a city name', 'error');
        return;
    }
    
    try {
        const weatherData = await fetchCurrentWeather(cityName);
        state.compareData[`city${cityNumber}`] = weatherData;
        
        displayCompareResults();
        
    } catch (error) {
        showToast(`Failed to load weather for ${cityName}`, 'error');
    }
}

function displayCompareResults() {
    const { city1, city2 } = state.compareData;
    const compareGrid = document.getElementById('compareGrid');
    
    if (!city1 && !city2) {
        compareGrid.innerHTML = '<p class="empty-state">Enter cities to compare</p>';
        return;
    }
    
    compareGrid.innerHTML = '';
    
    if (city1) {
        compareGrid.innerHTML += createCompareCityCard(city1);
    }
    
    if (city2) {
        compareGrid.innerHTML += createCompareCityCard(city2);
    }
}

function createCompareCityCard(data) {
    return `
        <div class="compare-city-card">
            <div class="compare-city-header">
                <div class="compare-city-name">${data.name}, ${data.sys.country}</div>
                <div class="compare-city-temp">${Math.round(data.main.temp)}°C</div>
                <p>${data.weather[0].description}</p>
            </div>
            <div class="compare-stats">
                <div class="compare-stat-item">
                    <span class="compare-stat-label">Feels Like</span>
                    <span class="compare-stat-value">${Math.round(data.main.feels_like)}°C</span>
                </div>
                <div class="compare-stat-item">
                    <span class="compare-stat-label">Humidity</span>
                    <span class="compare-stat-value">${data.main.humidity}%</span>
                </div>
                <div class="compare-stat-item">
                    <span class="compare-stat-label">Wind Speed</span>
                    <span class="compare-stat-value">${data.wind.speed} m/s</span>
                </div>
                <div class="compare-stat-item">
                    <span class="compare-stat-label">Pressure</span>
                    <span class="compare-stat-value">${data.main.pressure} hPa</span>
                </div>
                <div class="compare-stat-item">
                    <span class="compare-stat-label">Visibility</span>
                    <span class="compare-stat-value">${(data.visibility / 1000).toFixed(1)} km</span>
                </div>
                <div class="compare-stat-item">
                    <span class="compare-stat-label">Cloudiness</span>
                    <span class="compare-stat-value">${data.clouds.all}%</span>
                </div>
            </div>
        </div>
    `;
}

// ============================================
// HISTORY & FAVORITES
// ============================================

function saveToHistory(data) {
    let history = JSON.parse(localStorage.getItem(CONFIG.STORAGE_KEYS.HISTORY) || '[]');
    
    const entry = {
        name: data.name,
        country: data.sys.country,
        temp: Math.round(data.main.temp),
        condition: data.weather[0].main,
        icon: data.weather[0].icon,
        timestamp: Date.now()
    };
    
    // Remove duplicate if exists
    history = history.filter(item => item.name !== entry.name);
    
    // Add to beginning
    history.unshift(entry);
    
    // Keep only last 20
    history = history.slice(0, 20);
    
    localStorage.setItem(CONFIG.STORAGE_KEYS.HISTORY, JSON.stringify(history));
}

function loadHistoryPage() {
    loadFavorites();
    loadHistory();
}

function loadHistory() {
    const history = JSON.parse(localStorage.getItem(CONFIG.STORAGE_KEYS.HISTORY) || '[]');
    const historyList = document.getElementById('historyList');
    
    if (history.length === 0) {
        historyList.innerHTML = '<p class="empty-state">No search history</p>';
        return;
    }
    
    historyList.innerHTML = history.map(item => {
        const icon = WEATHER_ICONS[item.icon] || '🌤️';
        const timeAgo = getTimeAgo(item.timestamp);
        
        return `
            <div class="history-item" onclick="searchCity('${item.name}')">
                <div class="history-info">
                    <div class="history-city">${icon} ${item.name}, ${item.country}</div>
                    <div class="history-details">${item.temp}°C • ${item.condition}</div>
                </div>
                <div class="history-time">${timeAgo}</div>
            </div>
        `;
    }).join('');
}

function clearHistory() {
    if (confirm('Are you sure you want to clear all history?')) {
        localStorage.removeItem(CONFIG.STORAGE_KEYS.HISTORY);
        loadHistory();
        showToast('History cleared', 'success');
    }
}

function loadFavorites() {
    const favorites = JSON.parse(localStorage.getItem(CONFIG.STORAGE_KEYS.FAVORITES) || '[]');
    const favoritesGrid = document.getElementById('favoritesGrid');
    
    if (favorites.length === 0) {
        favoritesGrid.innerHTML = '<p class="empty-state">No favorites yet. Click the star icon to add favorites!</p>';
        return;
    }
    
    favoritesGrid.innerHTML = favorites.map(item => {
        const icon = WEATHER_ICONS[item.icon] || '🌤️';
        
        return `
            <div class="favorite-card" onclick="searchCity('${item.name}')">
                <div class="favorite-header">
                    <div class="favorite-name">${item.name}</div>
                    <button class="favorite-remove" onclick="removeFavorite('${item.name}', event)">
                        <i class="fas fa-times"></i>
                    </button>
                </div>
                <div class="favorite-temp">${icon} ${item.temp}°C</div>
                <div class="favorite-condition">${item.condition}</div>
            </div>
        `;
    }).join('');
}

function removeFavorite(cityName, event) {
    event.stopPropagation();
    
    let favorites = JSON.parse(localStorage.getItem(CONFIG.STORAGE_KEYS.FAVORITES) || '[]');
    favorites = favorites.filter(item => item.name !== cityName);
    localStorage.setItem(CONFIG.STORAGE_KEYS.FAVORITES, JSON.stringify(favorites));
    
    loadFavorites();
    showToast('Removed from favorites', 'success');
}

function loadLastSearch() {
    const lastCity = localStorage.getItem(CONFIG.STORAGE_KEYS.LAST_CITY);
    if (lastCity) {
        document.getElementById('cityInput').value = lastCity;
        // Optionally auto-search
        // searchCity(lastCity);
    }
}

// ============================================
// UTILITY FUNCTIONS
// ============================================

function handleSearch() {
    const city = document.getElementById('cityInput').value.trim();
    searchCity(city);
}

function showLoading() {
    // You can implement a loading indicator here
    console.log('Loading...');
}

function hideLoading() {
    console.log('Loading complete');
}

function showToast(message, type = 'info') {
    const container = document.getElementById('toastContainer');
    
    const icons = {
        success: 'fa-circle-check',
        error: 'fa-circle-xmark',
        warning: 'fa-triangle-exclamation',
        info: 'fa-circle-info'
    };
    
    const toast = document.createElement('div');
    toast.className = `toast ${type}`;
    toast.innerHTML = `
        <div class="toast-icon">
            <i class="fas ${icons[type]}"></i>
        </div>
        <div class="toast-content">
            <div class="toast-message">${message}</div>
        </div>
        <button class="toast-close" onclick="this.parentElement.remove()">
            <i class="fas fa-times"></i>
        </button>
    `;
    
    container.appendChild(toast);
    
    setTimeout(() => {
        toast.remove();
    }, 5000);
}

function formatDateTime(date) {
    const options = {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    };
    return date.toLocaleDateString('en-US', options);
}

function formatTime(date) {
    return date.toLocaleTimeString('en-US', {
        hour: '2-digit',
        minute: '2-digit',
        hour12: state.settings.timeFormat === '12'
    });
}

function formatWindSpeed(speed) {
    const unit = state.settings.windUnit;
    let converted = speed;
    
    if (unit === 'km/h') {
        converted = (speed * 3.6).toFixed(1);
    } else if (unit === 'mph') {
        converted = (speed * 2.237).toFixed(1);
    } else {
        converted = speed.toFixed(1);
    }
    
    return `${converted} ${unit}`;
}

function getTimeAgo(timestamp) {
    const now = Date.now();
    const diff = now - timestamp;
    
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);
    
    if (minutes < 60) return `${minutes}m ago`;
    if (hours < 24) return `${hours}h ago`;
    return `${days}d ago`;
}

async function refreshWeatherData() {
    if (state.currentCity) {
        console.log('Auto-refreshing weather data...');
        await searchCity(state.currentCity);
    }
}

// ============================================
// MODAL FUNCTIONS
// ============================================

function openModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) {
        modal.classList.add('active');
    }
}

function closeModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) {
        modal.classList.remove('active');
    }
}

function saveSettings() {
    // Get settings from form
    const unit = document.querySelector('.toggle-btn[data-unit].active')?.dataset.unit || 'metric';
    const windUnit = document.getElementById('windUnit').value;
    const timeFormat = document.querySelector('.toggle-btn[data-time].active')?.dataset.time || '24';
    const animations = document.getElementById('animationsToggle').checked;
    const autoRefresh = parseInt(document.getElementById('refreshInterval').value);
    
    state.settings = {
        unit,
        windUnit,
        timeFormat,
        animations,
        autoRefresh
    };
    
    CONFIG.UNITS = unit;
    
    localStorage.setItem(CONFIG.STORAGE_KEYS.SETTINGS, JSON.stringify(state.settings));
    
    closeModal('settingsModal');
    showToast('Settings saved successfully', 'success');
    
    // Refresh current weather if loaded
    if (state.currentCity) {
        refreshWeatherData();
    }
}

function loadSettings() {
    const saved = localStorage.getItem(CONFIG.STORAGE_KEYS.SETTINGS);
    if (saved) {
        state.settings = JSON.parse(saved);
        CONFIG.UNITS = state.settings.unit;
    }
}

// Toggle buttons in settings
document.addEventListener('click', (e) => {
    if (e.target.classList.contains('toggle-btn')) {
        const group = e.target.parentElement;
        group.querySelectorAll('.toggle-btn').forEach(btn => {
            btn.classList.remove('active');
        });
        e.target.classList.add('active');
    }
});

// ============================================
// CONSOLE WELCOME MESSAGE
// ============================================

console.log(`
%c🌦️ Weather Pro 3D
%cVersion 1.0.0
%cBuilt with ❤️ by Weather Enthusiasts

%cFeatures:
• Real-time weather data
• 7-day forecast
• 48-hour hourly forecast
• Air quality monitoring
• City comparison
• Voice search
• Beautiful 3D animations

%c⚠️ Remember to add your OpenWeatherMap API key!
`, 
'font-size: 24px; font-weight: bold; color: #3b82f6;',
'font-size: 14px; color: #94a3b8;',
'font-size: 14px; color: #94a3b8; font-style: italic;',
'font-size: 14px; color: #10b981;',
'font-size: 16px; font-weight: bold; color: #ef4444;'
);
