# 🌦 SkyCast - Advanced Weather Application

An intelligent weather application with 15+ unique features including real-time weather data, smart recommendations, dynamic theming, and advanced forecasting.

![Weather App](https://img.shields.io/badge/Status-Ready-success)
![HTML5](https://img.shields.io/badge/HTML5-E34F26?logo=html5&logoColor=white)
![CSS3](https://img.shields.io/badge/CSS3-1572B6?logo=css3&logoColor=white)
![JavaScript](https://img.shields.io/badge/JavaScript-F7DF1E?logo=javascript&logoColor=black)

## ✨ Features

### Core Features
- 🌡️ **Real-time Weather Data** - Current temperature, feels like, humidity, pressure
- 📅 **5-Day Forecast** - Detailed weather predictions with min/max temperatures
- 🌫️ **Air Quality Index (AQI)** - Monitor air pollution levels with health recommendations
- 📍 **Geolocation Detection** - Automatically detect your location
- 🎤 **Voice Search** - Search cities using voice commands

### Advanced Features
- 🎨 **Dynamic Weather Themes** - Background changes based on weather conditions
- 🧠 **Smart Weather Advisor** - Intelligent recommendations based on conditions
- 💾 **Search History** - Track your recent searches with timestamps
- ⭐ **Favorites Management** - Save up to 10 favorite cities
- 🎭 **Weather Mood Indicators** - Fun mood descriptions based on weather
- 🌅 **Sunrise/Sunset Tracking** - Know when the sun rises and sets
- 🌬️ **Comprehensive Weather Details** - Wind, visibility, cloudiness, and more
- 📱 **Responsive Design** - Works perfectly on all devices
- ⚡ **Fast & Lightweight** - Single-file application, no dependencies

## 🚀 Quick Start

### Prerequisites
- A modern web browser (Chrome, Firefox, Edge, Safari)
- OpenWeatherMap API key (free)

### Setup Instructions

1. **Get Your API Key**
   - Visit [OpenWeatherMap](https://openweathermap.org/api)
   - Sign up for a free account
   - Navigate to "API Keys" section
   - Copy your API key

2. **Configure the Application**
   - Open `script.js` in a text editor
   - Find line 2: `const API_KEY = "YOUR_API_KEY_HERE";`
   - Replace `YOUR_API_KEY_HERE` with your actual API key
   - Save the file

3. **Run the Application**
   - Double-click `index.html` to open in your browser
   - Or use a local server:
     ```bash
     # Python 3
     python -m http.server 8000
     
     # Node.js
     npx serve
     ```
   - Visit `http://localhost:8000`

## 📖 Usage Guide

### Searching for Weather
1. **Text Search**: Type a city name and click "Search" or press Enter
2. **Location Detection**: Click "My Location" to auto-detect your location
3. **Voice Search**: Click the microphone icon and speak the city name

### Managing Favorites
- Click the "☆ Favorite" button on any search history item
- Access favorites from the "History & Favorites" tab
- Remove favorites by clicking "Remove"

### Understanding the Interface

#### Current Weather Tab
- Large temperature display with weather icon
- Detailed metrics (humidity, wind, visibility, pressure)
- Sunrise and sunset times
- Smart advisor recommendations
- Air Quality Index with health information
- Weather mood indicator

#### 5-Day Forecast Tab
- Daily weather predictions
- Average, minimum, and maximum temperatures
- Weather conditions for each day

#### History & Favorites Tab
- Quick access to favorite cities
- Recent search history with timestamps
- Add/remove favorites
- Clear history option

## 🎨 Weather Themes

The application automatically changes its appearance based on weather conditions:

- ☀️ **Sunny** - Warm orange/yellow gradient
- 🌧️ **Rainy** - Dark blue gradient with rain effects
- ☁️ **Cloudy** - Grey gradient
- ❄️ **Snowy** - Light blue/white gradient
- ⛈️ **Stormy** - Dark grey gradient

## 🧠 Smart Advisor

The intelligent advisor provides context-aware recommendations:

- **Temperature-based**: Hydration advice for hot weather, layering for cold
- **Weather-based**: Umbrella reminders for rain, outdoor activity suggestions
- **Humidity-based**: AC recommendations, moisturizer suggestions
- **Wind-based**: Warnings for strong winds
- **Visibility-based**: Driving cautions for fog

## 🌐 Browser Compatibility

| Browser | Supported | Voice Search |
|---------|-----------|--------------|
| Chrome  | ✅ Yes    | ✅ Yes       |
| Edge    | ✅ Yes    | ✅ Yes       |
| Firefox | ✅ Yes    | ❌ No        |
| Safari  | ✅ Yes    | ⚠️ Limited   |

## 📱 Responsive Design

The application is fully responsive and works on:
- 📱 Mobile phones (320px and up)
- 📱 Tablets (768px and up)
- 💻 Laptops and desktops (1024px and up)
- 🖥️ Large screens (1440px and up)

## 🔧 Technical Details

### Technologies Used
- **HTML5** - Semantic markup and structure
- **CSS3** - Styling, animations, and responsive design
- **JavaScript ES6+** - Logic, API calls, and interactivity

### APIs Used
- OpenWeatherMap Current Weather API
- OpenWeatherMap 5-Day Forecast API
- OpenWeatherMap Air Pollution API
- Browser Geolocation API
- Web Speech API (for voice search)

### Data Storage
- LocalStorage for search history (max 20 items)
- LocalStorage for favorites (max 10 cities)
- LocalStorage for last searched city

## 📊 Project Structure

```
SkyCast/
├── index.html          # Main HTML structure
├── style.css           # All CSS styles and themes
├── script.js           # All JavaScript functionality
├── README.md           # This file
├── API_SETUP.md        # Detailed API setup guide
├── DEPLOYMENT.md       # Deployment instructions
└── VIVA_GUIDE.md       # Viva preparation guide
```

## 🚀 Deployment

See [DEPLOYMENT.md](DEPLOYMENT.md) for detailed instructions on deploying to:
- GitHub Pages
- Vercel
- Netlify

## 🎓 Academic Use

This project is perfect for:
- Web development coursework
- API integration demonstrations
- JavaScript programming assignments
- UI/UX design projects

See [VIVA_GUIDE.md](VIVA_GUIDE.md) for viva preparation materials.

## 🤝 Contributing

This is an educational project. Feel free to:
- Add new features
- Improve the UI/UX
- Optimize the code
- Fix bugs

## 📄 License

This project is open source and available for educational purposes.

## 🙏 Acknowledgments

- Weather data provided by [OpenWeatherMap](https://openweathermap.org/)
- Icons and emojis from Unicode standard
- Inspired by modern weather applications

## 📞 Support

For issues or questions:
1. Check the [API_SETUP.md](API_SETUP.md) guide
2. Verify your API key is correct
3. Check browser console for errors
4. Ensure you have an active internet connection

---

**Made with ❤️ for learning and education**

*Last Updated: January 2026*
