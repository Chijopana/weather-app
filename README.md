# 🌤️ Weather App
 
Aplicación web de pronóstico del tiempo en tiempo real, construida con Next.js y TypeScript. Consulta el clima por geolocalización automática o buscando cualquier ciudad, con datos actuales, pronóstico por hora y por día, alertas meteorológicas y una capa de predicción de tendencia con un modelo ligero client-side.
 
## ✨ Características
 
- **Clima en tiempo real** — temperatura, sensación térmica, humedad, viento, índice UV
- **Geolocalización automática** con fallback a búsqueda manual de ciudad
- **Autocomplete de ciudades** con historial de búsquedas recientes (localStorage)
- **Pronóstico por hora y por día** en carruseles accesibles (arrastre, teclado, botones)
- **Toggle °C / °F** persistente entre sesiones
- **Alertas meteorológicas** oficiales cuando existen para la zona consultada
- **Amanecer / atardecer** del día actual
- **Tendencia de temperatura** — predicción a corto plazo mediante regresión lineal sobre las últimas horas (módulo demostrativo, no oficial)
- **Auto-refresh** configurable de los datos
- **Mapa interactivo** de la ubicación actual (Leaflet / OpenStreetMap)
- **Fondo dinámico** con animaciones de partículas según la condición climática (lluvia, tormenta, etc.)
- Loading states diferenciados: skeleton en carga inicial, indicador sutil en refresh
- Manejo de errores con Error Boundary
## 🛠️ Stack técnico
 
- **Framework:** Next.js (Pages Router) + TypeScript
- **Estilos:** Tailwind CSS
- **Animaciones:** Framer Motion
- **Mapas:** React-Leaflet
- **Partículas:** react-tsparticles
- **Iconos:** react-icons (Weather Icons / Feather Icons)
- **API de datos:** [WeatherAPI.com](https://www.weatherapi.com/)
## 📋 Requisitos previos
 
- Node.js 18+ (probado en Node 22)
- npm
- Una API key gratuita de [WeatherAPI.com](https://www.weatherapi.com/)
## 🚀 Puesta en marcha
 
```bash
# 1. Clonar el repositorio
git clone <url-del-repo>
cd app-clima
 
# 2. Instalar dependencias
npm install
 
# 3. Configurar variables de entorno
cp .env.example .env.local
```
 
Edita `.env.local` con tu API key:
 
```env
NEXT_PUBLIC_WEATHERAPI_KEY=tu_api_key_aqui
NEXT_PUBLIC_REFRESH_MINUTES=5
NEXT_PUBLIC_MAP_ZOOM=12
```
 
> ⚠️ El plan gratuito de WeatherAPI permite hasta 3 días de pronóstico. Si no tienes plan de pago, ajusta `FORECAST_DAYS` en `constants/config.ts` de 7 a 3, o algunas peticiones fallarán.
 
```bash
# 4. Levantar el servidor de desarrollo
npm run dev
```
 
Abre [http://localhost:3000](http://localhost:3000).
 
### Otros comandos
 
```bash
npm run build   # Build de producción
npm run start   # Sirve el build de producción (requiere build previo)
npm run lint    # Linter
```
 
## 📁 Estructura del proyecto
 
```
app-clima/
├── components/         # Componentes de UI (WeatherCard, SearchBar, Carousel, Map...)
├── constants/          # Configuración y constantes (config.ts)
├── hooks/              # Hooks personalizados (useWeather, useCitySearch, useTempUnit...)
├── pages/               # Rutas de Next.js (index.tsx, _app.tsx)
├── styles/              # Estilos globales
├── types/               # Tipos TypeScript compartidos
├── utils/                # Utilidades (formateo, storage, cálculos)
├── .env.example
└── package.json
```
 
## ⚠️ Nota sobre la API key
 
Actualmente la key se expone en el cliente vía `NEXT_PUBLIC_WEATHERAPI_KEY`, lo cual es visible en las peticiones de red del navegador. Para producción se recomienda mover las llamadas a una API Route de Next.js que mantenga la key en el servidor. *(Ver roadmap.)*
 
## 🗺️ Roadmap
 
- [ ] Mover llamadas a la API a una API Route propia (ocultar API key)
- [ ] PWA / soporte offline con última data cacheada
- [ ] Migrar el fetching a SWR o React Query
- [ ] Tests unitarios (hooks y utils)
- [ ] CI con lint + type-check + build en cada push
## 📄 Licencia
 
Proyecto personal con fines de portfolio y aprendizaje.