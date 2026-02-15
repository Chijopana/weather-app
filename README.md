# 🌤️ Weather App

A beautiful, modern weather application built with Next.js, React, and TypeScript. Features real-time weather forecasts, interactive maps, and smooth animations.

## ✨ Features

- **Real-time Weather Data**: Fetches current weather and 7-day forecasts from WeatherAPI
- **Geolocation Support**: Automatically detects user location for instant weather info
- **City Search**: Search for weather in any city worldwide
- **Hourly & Daily Forecasts**: Browse hourly and daily weather with responsive scrolling
- **Interactive Map**: View your location on an interactive map powered by Leaflet
- **Dynamic Background**: Animated backgrounds that change based on weather conditions
- **Responsive Design**: Fully responsive UI that works on all device sizes
- **Error Handling**: Comprehensive error boundaries and user-friendly error messages
- **Loading States**: Skeleton loaders for better UX during data fetching
- **Performance Optimized**: Component memoization and efficient re-rendering

## 🛠️ Tech Stack

- **Framework**: Next.js 14.2.1
- **Language**: TypeScript 5.4.2
- **Styling**: Tailwind CSS 3.4.8
- **UI Components**: React 18.2.0
- **Animations**: Framer Motion 12.23.16
- **Weather API**: WeatherAPI.com
- **Mapping**: Leaflet 1.9.4 + React Leaflet 4.2.1
- **Icons**: React Icons 5.5.0
- **Particles**: React Tsparticles 2.12.2

## 🚀 Getting Started

### Prerequisites

- Node.js 16+ and npm/yarn
- A free WeatherAPI key from [WeatherAPI.com](https://www.weatherapi.com/)

### Installation

1. **Clone or download the project**
   ```bash
   cd app-clima
   ```

2. **Install dependencies**
   ```bash
   npm install
   # or
   yarn install
   ```

3. **Set up environment variables**
   ```bash
   cp .env.example .env.local
   ```

4. **Add your WeatherAPI key**
   Edit `.env.local` and add your API key:
   ```env
   NEXT_PUBLIC_WEATHERAPI_KEY=your_api_key_here
   ```

5. **Run the development server**
   ```bash
   npm run dev
   # or
   yarn dev
   ```

6. **Open your browser**
   Navigate to [http://localhost:3000](http://localhost:3000)

## 📋 Environment Variables

Create a `.env.local` file in the project root with the following variables:

```env
# WeatherAPI.com API Key (required)
NEXT_PUBLIC_WEATHERAPI_KEY=your_weatherapi_key_here

# Refresh interval in minutes (default: 5)
NEXT_PUBLIC_REFRESH_MINUTES=5

# Map zoom level (default: 12)
NEXT_PUBLIC_MAP_ZOOM=12
```

## 📁 Project Structure

```
app-clima/
├── components/          # React components
│   ├── Background.tsx   # Dynamic weather background
│   ├── ErrorBoundary.tsx # Error handling component
│   ├── LoadingSkeleton.tsx # Loading state placeholders
│   ├── Map.tsx          # Interactive map
│   ├── SearchBar.tsx    # City search input
│   └── WeatherCard.tsx  # Weather display card
├── constants/           # Application constants
│   └── config.ts        # Configuration and constants
├── hooks/               # Custom React hooks
│   └── useWeather.ts    # Weather data fetching hook
├── pages/               # Next.js pages
│   ├── _app.tsx         # App wrapper
│   └── index.tsx        # Home page
├── public/              # Static assets
│   └── leaflet/         # Leaflet map icons
├── styles/              # CSS stylesheets
│   └── globals.css      # Global styles
├── types/               # TypeScript type definitions
│   ├── react-leaflet.d.ts # Leaflet type definitions
│   └── weather.ts       # Weather API types
├── utils/               # Utility functions
│   └── weatherUtils.ts  # Weather formatting & mapping utilities
├── .env.example         # Environment variables template
├── next.config.js       # Next.js configuration
├── postcss.config.js    # PostCSS configuration
├── tailwind.config.js   # Tailwind CSS configuration
├── tsconfig.json        # TypeScript configuration
└── package.json         # Project dependencies
```

## 🎨 Features Explained

### Dynamic Background
The background automatically changes based on current weather:
- ☀️ **Clear**: Blue sky gradient
- ☁️ **Cloudy**: Gray gradient
- 🌧️ **Rain**: Blue gradient with falling rain particles
- ⛈️ **Storm**: Dark purple gradient with heavy rain animation
- ❄️ **Snow**: White gradient
- 🌫️ **Mist/Fog**: Stone gradient

### Weather Cards
- **Current Weather**: Shows temperature, condition, humidity, and wind speed
- **Hourly Forecast**: 24-hour forecast with draggable carousel
- **Daily Forecast**: 7-day forecast with draggable carousel

### Geolocation
The app automatically requests your location on first load to provide instant weather data for your area.

### Search Functionality
Search for any city worldwide by typing the city name and pressing Enter or clicking the search button.

## 🔧 Available Scripts

- `npm run dev` - Start development server (port 3000)
- `npm run build` - Build for production
- `npm start` - Start production server

## 📱 Responsive Design

The app is fully responsive and optimized for:
- Mobile phones (xs, sm)
- Tablets (md, lg)
- Desktop screens (xl, 2xl)

Mobile users get an optimized experience with:
- Touch-friendly interactions
- Optimized card sizes
- Better spacing for smaller screens

## ⚡ Performance Optimizations

- **Component Memoization**: Uses `React.memo` to prevent unnecessary re-renders
- **Hook Optimization**: Custom hooks with proper dependency management
- **Dynamic Imports**: Map component loaded dynamically to avoid SSR issues
- **Particle Effects**: Only rendered for rain/storm weather conditions
- **Image Optimization**: Uses Leaflet icons properly configured for Next.js

## 🐛 Error Handling

The application includes:
- **Error Boundary**: Catches React errors with user-friendly fallback UI
- **API Error Handling**: Comprehensive error messages for invalid cities or network issues
- **Geolocation Errors**: Graceful fallback if location access is denied
- **Loading States**: Skeleton loaders while data is being fetched

## 🔒 Security

- Environment variables are properly secured with `.env.local`
- API keys are protected and not exposed in client-side code
- Proper CORS configuration for external API calls

## 🌐 Browser Support

- Chrome/Edge (latest)
- Firefox (latest)
- Safari (latest)
- Mobile browsers (iOS Safari, Chrome Mobile)

## 📚 API Documentation

This app uses the [WeatherAPI.com](https://www.weatherapi.com/) API. Free tier includes:
- Current weather
- 7-day forecast
- Hourly data
- 1,000 API calls per day

## 🚀 Deployment

### Deploy to Vercel (Recommended)

1. Push your code to GitHub
2. Connect your GitHub repo to Vercel
3. Add environment variables in Vercel dashboard
4. Click Deploy

```bash
# Or use Vercel CLI
vercel
```

### Deploy to Other Platforms

Make sure to:
- Build: `npm run build`
- Start: `npm start`
- Add environment variables to your hosting platform

## 📝 Notes

- The app requires HTTPS for geolocation to work properly
- WeatherAPI free tier has a 1,000 requests/day limit
- Weather updates automatically every 5 minutes (configurable)
- All times are displayed in your local timezone

## 🤝 Contributing

Feel free to fork, improve, and submit pull requests!

## 📄 License

This project is open source and available under the MIT License.

## 🙋 Support

If you encounter any issues:
1. Check that your WeatherAPI key is valid
2. Ensure your browser allows geolocation
3. Check the browser console for error messages
4. Verify your environment variables are set correctly

## 🎯 Future Improvements

- [ ] Add multiple location tracking
- [ ] Weather alerts and notifications
- [ ] Detailed weather metrics (UV index, air quality)
- [ ] Historical weather data
- [ ] Dark/Light theme toggle
- [ ] Unit preferences (Celsius/Fahrenheit)
- [ ] Offline support (PWA)
- [ ] Weather comparison between cities

---

**Made with ❤️ using Next.js and TypeScript**
