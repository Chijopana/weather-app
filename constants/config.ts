/**
 * Configuración compartida entre cliente y servidor.
 *
 * Aquí NO va ningún secreto: este módulo lo importan los componentes, así que
 * todo lo que contenga acaba en el bundle del navegador. La API key vive en
 * lib/upstream.ts, que solo se ejecuta en el servidor.
 */

export const WEATHER_CONFIG = {
  /**
   * Días de pronóstico. El plan gratuito de WeatherAPI devuelve 3 como
   * máximo aunque se pidan más, así que 3 es el valor honesto por defecto.
   */
  FORECAST_DAYS: Number(process.env.WEATHER_FORECAST_DAYS || '3'),
  REFRESH_INTERVAL_MINUTES: Number(process.env.NEXT_PUBLIC_REFRESH_MINUTES || '10'),
  /** Horas futuras que se muestran en el carrusel */
  HOURLY_SLICE_LIMIT: 24,
  DAILY_SLICE_LIMIT: 7,
  GEOLOCATION_OPTIONS: {
    enableHighAccuracy: false,
    timeout: 10_000,
    maximumAge: 1000 * 60 * 5,
  } satisfies PositionOptions,
  SEARCH_DEBOUNCE_MS: 300,
  MAX_RECENT_CITIES: 6,
  /** TTL de la caché en servidor, en segundos */
  SERVER_CACHE_TTL_S: 300,
} as const;

export const STORAGE_KEYS = {
  TEMP_UNIT: 'weather_app_temp_unit',
  RECENT_CITIES: 'weather_app_recent_cities',
  LAST_QUERY: 'weather_app_last_query',
} as const;

export const MAP_CONFIG = {
  ZOOM: Number(process.env.NEXT_PUBLIC_MAP_ZOOM || '11'),
} as const;

export const ERROR_MESSAGES = {
  GEOLOCATION_DENIED: 'Permiso de ubicación denegado. Busca una ciudad o vuelve a intentarlo.',
  GEOLOCATION_UNAVAILABLE: 'No se pudo determinar tu ubicación. Busca una ciudad manualmente.',
  GEOLOCATION_TIMEOUT: 'La ubicación tardó demasiado. Busca una ciudad manualmente.',
  GEOLOCATION_UNSUPPORTED: 'Tu navegador no soporta geolocalización.',
  FETCH_FAILED: 'No se pudieron obtener los datos del clima.',
  OFFLINE: 'Sin conexión. Mostrando los últimos datos disponibles.',
  NO_API_KEY: 'Falta configurar WEATHERAPI_KEY en el servidor.',
} as const;

/** Umbrales del índice UV (OMS) */
export const UV_LEVELS = [
  { max: 2, label: 'Bajo', color: '#4ade80' },
  { max: 5, label: 'Moderado', color: '#facc15' },
  { max: 7, label: 'Alto', color: '#fb923c' },
  { max: 10, label: 'Muy alto', color: '#f87171' },
  { max: Infinity, label: 'Extremo', color: '#c084fc' },
] as const;

/** Índice de calidad del aire US EPA (1-6) */
export const AQI_LEVELS = [
  { label: 'Buena', color: '#4ade80' },
  { label: 'Moderada', color: '#facc15' },
  { label: 'Dañina (grupos sensibles)', color: '#fb923c' },
  { label: 'Dañina', color: '#f87171' },
  { label: 'Muy dañina', color: '#c084fc' },
  { label: 'Peligrosa', color: '#ef4444' },
] as const;
