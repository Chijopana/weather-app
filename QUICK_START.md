# 🚀 Quick Start Guide

Get your Weather App running in minutes!

## ⚡ 5-Minute Setup

### Step 1: Get Your API Key
1. Go to [WeatherAPI.com](https://www.weatherapi.com/)
2. Sign up for free (1000 requests/day)
3. Copy your API key

### Step 2: Configure Environment
Open the project folder and create `.env.local`:
```bash
NEXT_PUBLIC_WEATHERAPI_KEY=paste_your_api_key_here
NEXT_PUBLIC_REFRESH_MINUTES=5
NEXT_PUBLIC_MAP_ZOOM=12
```

### Step 3: Install & Run
```bash
npm install
npm run dev
```

### Step 4: Open Browser
Visit [http://localhost:3000](http://localhost:3000)

**Done! 🎉**

## 📁 What's Included

✅ **New Improvements**:
- Error Boundary component for crash handling
- Loading skeleton placeholders
- Centralized configuration system
- Comprehensive type definitions
- Enhanced documentation
- Performance optimizations
- Better error messages

✅ **Features**:
- Real-time weather data
- Geolocation detection
- City search
- Hourly & daily forecasts
- Interactive map
- Dynamic backgrounds
- Smooth animations

## 🎯 First Steps After Setup

1. **Allow Location Access**: Grant browser permission for geolocation
2. **Search a City**: Try searching for "Barcelona" or "New York"
3. **Check Forecasts**: Scroll through hourly and daily weather
4. **View Map**: See your location on the interactive map

## 🛠️ Available Commands

```bash
npm run dev          # Start development server
npm run build        # Build for production
npm start            # Start production server
npm run type-check   # Check TypeScript errors
npm run format       # Format code
```

## 📝 Environment Variables

| Variable | Default | Description |
|----------|---------|-------------|
| `NEXT_PUBLIC_WEATHERAPI_KEY` | required | Your WeatherAPI key |
| `NEXT_PUBLIC_REFRESH_MINUTES` | 5 | Auto-refresh interval |
| `NEXT_PUBLIC_MAP_ZOOM` | 12 | Initial map zoom level |

## ⚙️ Project Structure (Quick Reference)

```
📦 components/       → React components
📦 constants/        → Config & constants
📦 hooks/            → Custom React hooks
📦 pages/            → Next.js pages
📦 styles/           → Global CSS
📦 types/            → TypeScript definitions
📦 utils/            → Helper functions
📄 .env.example      → Environment template
```

## 🐛 Troubleshooting

### Issue: "API key not found"
**Solution**: Check `.env.local` has `NEXT_PUBLIC_WEATHERAPI_KEY`

### Issue: "Location not available"
**Solution**: Allow browser geolocation permission or search a city

### Issue: "Port 3000 already in use"
**Solution**: Run `npm run dev -- -p 3001` for different port

### Issue: Map not loading
**Solution**: Ensure public/leaflet folder has marker icons

## 📚 Learn More

- [Next.js Docs](https://nextjs.org/docs)
- [React Docs](https://react.dev)
- [TypeScript Handbook](https://www.typescriptlang.org/docs)
- [WeatherAPI Docs](https://www.weatherapi.com/docs)
- [Tailwind CSS Docs](https://tailwindcss.com/docs)

## 🚀 Next Steps

1. **Explore Code**: Check `/IMPROVEMENTS.md` for what was enhanced
2. **Customize**: Edit `constants/config.ts` to tweak settings
3. **Deploy**: Follow README.md deployment section
4. **Extend**: Add features like multiple cities, alerts, etc.

## 💡 Tips

- Use browser DevTools to test responsive design
- Check Network tab to see API calls
- Test geolocation on mobile devices
- Try different weather conditions in different cities

## ✨ Need Help?

1. Check [README.md](./README.md) for detailed documentation
2. See [IMPROVEMENTS.md](./IMPROVEMENTS.md) for all enhancements
3. Review code comments in source files
4. Check browser console for error messages

---

**Happy Weather Tracking! 🌤️**
