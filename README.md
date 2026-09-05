# Clima

Aplicación de pronóstico del tiempo construida con Next.js y TypeScript. Consulta
el clima por geolocalización o buscando cualquier ciudad, con datos actuales,
pronóstico por hora y por día, alertas oficiales, calidad del aire y mapa.

## Características

- **Clima actual** — temperatura, sensación térmica, punto de rocío, humedad,
  viento con dirección y precipitación acumulada.
- **Pronóstico por hora** con probabilidad de lluvia, en una franja con scroll
  nativo (táctil, trackpad, teclado y botones).
- **Pronóstico por día** en lista con barra de rango: el mín/máx de cada día
  situado dentro del rango de toda la semana, para compararlos de un vistazo.
- **Detalles** — índice UV, calidad del aire (US EPA), presión, visibilidad,
  ráfagas y nubosidad.
- **Sol y luna** — arco con la posición del sol, horas de orto y ocaso, fase
  lunar e iluminación.
- **Alertas meteorológicas** oficiales, con el boletín completo plegado.
- **Búsqueda de ciudades** con autocompletado, navegación por teclado completa
  e historial local.
- **Mapa** de la ubicación mostrada, sea la tuya o la ciudad buscada.
- **Fondo dinámico** según condición y momento del día, con partículas de
  precipitación.
- **°C / °F** persistente entre sesiones.
- **Auto-refresh** que se pausa cuando la pestaña está oculta o no hay conexión.

## Stack

| Capa | Tecnología |
|---|---|
| Framework | Next.js 14 (Pages Router) + TypeScript en modo estricto |
| Estilos | Tailwind CSS |
| Animación | Framer Motion |
| Mapas | React-Leaflet + OpenStreetMap |
| Partículas | react-tsparticles |
| Datos | [WeatherAPI.com](https://www.weatherapi.com/) vía rutas API propias |

## Puesta en marcha

```bash
npm install
cp .env.example .env.local   # y pon tu API key dentro
npm run dev                  # http://localhost:3000
```

Necesitas una API key gratuita de [WeatherAPI.com](https://www.weatherapi.com/)
(1000 peticiones/día).

### Variables de entorno

| Variable | Ámbito | Por defecto | Descripción |
|---|---|---|---|
| `WEATHERAPI_KEY` | **Servidor** | — | API key. Obligatoria. |
| `WEATHER_FORECAST_DAYS` | Servidor | `3` | Días a pedir. El plan gratuito devuelve 3 como máximo aunque pidas más. |
| `NEXT_PUBLIC_REFRESH_MINUTES` | Cliente | `10` | Intervalo de auto-refresh. |
| `NEXT_PUBLIC_MAP_ZOOM` | Cliente | `11` | Zoom inicial del mapa. |

> **La API key no lleva prefijo `NEXT_PUBLIC_` a propósito.** Todo lo que lleva
> ese prefijo se incrusta en el JavaScript que se descarga el navegador, donde
> cualquiera puede leerlo. El navegador de esta app solo habla con
> `/api/weather` y `/api/search`; la key se queda en el servidor.
>
> Si vienes de una versión anterior que usaba `NEXT_PUBLIC_WEATHERAPI_KEY`,
> **rota esa key**: ha estado expuesta en el bundle de cualquier despliegue.

## Despliegue

En Vercel (o cualquier host con soporte para rutas API de Next.js):

```bash
vercel
```

Define las variables en el panel del proveedor. **`WEATHERAPI_KEY` es
obligatoria**; sin ella las rutas `/api/*` responden 500 con un mensaje
explícito. Si tu despliegue anterior usaba `NEXT_PUBLIC_WEATHERAPI_KEY`,
sustitúyela por la nueva y **rota la key**: la anterior estuvo pública.

El proyecto necesita un entorno con servidor. Un `next export` estático no
funciona, porque las rutas API son precisamente lo que mantiene la key fuera del
navegador.

## Iconos

`favicon.ico` (16/32/48), `icon-192.png`, `icon-512.png` y `apple-touch-icon.png`
se generan por código, sin dependencias de imagen. El script vive en
[tools/make-icons.js](tools/make-icons.js):

```bash
npm run icons
```

Edita las formas en ese fichero y vuelve a ejecutarlo si quieres otro dibujo.

## Arquitectura

```
pages/
  index.tsx            Composición de la página
  _app.tsx             Error boundary raíz y metadatos
  _document.tsx        lang="es" y preconnect
  api/
    weather.ts         Proxy de forecast.json
    search.ts          Proxy de search.json
lib/
  upstream.ts          API key, caché en memoria y llamada al proveedor
                       (fuera de pages/api/: ahí sería un endpoint público)
hooks/
  useWeather.ts        Carga, normalización y auto-refresh
  useCitySearch.ts     Autocompletado con debounce
  useGeolocation.ts    Ubicación bajo demanda, reintentable
  useTempUnit.ts       Unidad persistida
  useRecentCities.ts   Historial de búsquedas
  useReducedMotion.ts  prefers-reduced-motion
components/            Presentación
utils/weatherUtils.ts  Formateo con zona horaria, unidades, condiciones
constants/             Configuración compartida y paletas
tests/                 Pruebas de las funciones puras
tools/make-icons.js    Generador de favicon e iconos de aplicación
public/                Iconos, manifest y marcadores de Leaflet
```

### Fechas y zonas horarias

La API devuelve `time_epoch` / `date_epoch` (epoch UNIX en UTC) y
`location.tz_id` (zona IANA). **Todo formateo de fecha usa esos dos datos**, vía
`Intl.DateTimeFormat` con `timeZone` explícita.

Lo que no se hace nunca: `new Date(hora.time)`. Ese campo llega como
`"2026-09-05 14:00"`, sin offset, así que el navegador lo interpreta en *su*
zona. Consultando Tokio desde España el pronóstico salía desplazado, y
`new Date("2026-09-05")` (medianoche UTC) mostraba el día anterior a cualquiera
en América.

## Scripts

```bash
npm run dev          # servidor de desarrollo
npm run build        # build de producción
npm run start        # servir el build
npm run lint         # ESLint
npm run type-check   # TypeScript sin emitir
npm run test:utils   # pruebas de las funciones puras
npm run icons        # regenera favicon e iconos
npm run format       # Prettier
```

## Accesibilidad

- `lang="es"` en el documento.
- Combobox de búsqueda con el patrón ARIA completo: flechas, Enter, Escape y
  `aria-activedescendant`.
- Anillo de foco visible en todo elemento interactivo.
- Paletas de fondo siempre oscuras, para que el texto blanco mantenga contraste
  en todas las condiciones.
- `prefers-reduced-motion` desactiva partículas y animaciones.
- El gráfico de tendencia incluye leyenda, etiquetas directas y tabla de datos.

## Limitaciones conocidas

- El plan gratuito de WeatherAPI devuelve **3 días** de pronóstico, no 7.
- La caché del servidor es por instancia; en serverless con varias instancias
  cada una tiene la suya.
- El módulo «Modelo lineal vs. pronóstico» es un ejercicio ilustrativo: una
  recta sobre 12 puntos no es un modelo meteorológico.

## Créditos

Datos meteorológicos de [WeatherAPI.com](https://www.weatherapi.com/).
Cartografía de [OpenStreetMap](https://www.openstreetmap.org/copyright).
