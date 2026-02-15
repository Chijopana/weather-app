/**
 * Application Configuration Constants
 */

export const WEATHER_CONFIG = {
  API_KEY: process.env.NEXT_PUBLIC_WEATHERAPI_KEY,
  REFRESH_INTERVAL_MINUTES: Number(process.env.NEXT_PUBLIC_REFRESH_MINUTES || '5'),
  FORECAST_DAYS: 7,
  HOURLY_SLICE_LIMIT: 24,
  DAILY_SLICE_LIMIT: 7,
  GEOLOCATION_OPTIONS: {
    enableHighAccuracy: true,
    timeout: 10000,
    maximumAge: 1000 * 60 * 5,
  },
};

export const MAP_CONFIG = {
  ZOOM: Number(process.env.NEXT_PUBLIC_MAP_ZOOM || '12'),
  DEFAULT_LAT: 40.4168,
  DEFAULT_LON: -3.7038,
};

export const ANIMATION_CONFIG = {
  FADE_DURATION: 0.5,
  SLIDE_DURATION: 0.3,
};

export const ERROR_MESSAGES = {
  GEOLOCATION_FAILED: 'No se pudo obtener tu ubicación. Intenta buscar una ciudad.',
  FETCH_FAILED: 'Error al obtener los datos del clima',
  INVALID_CITY: 'Ciudad no encontrada',
  NETWORK_ERROR: 'Error de conexión',
};
