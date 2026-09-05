/**
 * Tipos de WeatherAPI.com
 * Modelados sobre la respuesta real de /forecast.json (verificada contra la API).
 */

/* ─────────────────────────  Respuesta cruda de la API  ───────────────────────── */

export interface WeatherAPIErrorResponse {
  error: {
    code: number;
    message: string;
  };
}

export interface WeatherCondition {
  text: string;
  /** URL protocol-relative: "//cdn.weatherapi.com/..." */
  icon: string;
  /** Código estable de condición. Preferir esto sobre `text` para mapear iconos. */
  code: number;
}

export interface AirQuality {
  co: number;
  no2: number;
  o3: number;
  so2: number;
  pm2_5: number;
  pm10: number;
  /** 1 = Bueno … 6 = Peligroso */
  'us-epa-index': number;
  'gb-defra-index': number;
}

export interface AstroData {
  sunrise: string;
  sunset: string;
  moonrise: string;
  moonset: string;
  moon_phase: string;
  moon_illumination: number;
  is_moon_up: number;
  is_sun_up: number;
}

export interface WeatherAlert {
  headline: string;
  severity: string;
  event: string;
  effective: string;
  expires: string;
  desc: string;
}

export interface CitySearchResult {
  id: number;
  name: string;
  region: string;
  country: string;
  lat: number;
  lon: number;
}

export interface CurrentWeather {
  last_updated_epoch: number;
  last_updated: string;
  temp_c: number;
  temp_f: number;
  /** 1 = de día, 0 = de noche */
  is_day: number;
  condition: WeatherCondition;
  wind_kph: number;
  wind_mph: number;
  wind_degree: number;
  wind_dir: string;
  pressure_mb: number;
  precip_mm: number;
  humidity: number;
  cloud: number;
  feelslike_c: number;
  feelslike_f: number;
  dewpoint_c: number;
  vis_km: number;
  uv: number;
  gust_kph: number;
  air_quality?: AirQuality;
}

export interface HourWeather {
  /** Epoch UNIX en segundos. Fuente de verdad temporal: NO parsear `time`. */
  time_epoch: number;
  /** Hora local de la ciudad, "YYYY-MM-DD HH:mm" (sin offset: no parseable de forma fiable) */
  time: string;
  temp_c: number;
  temp_f: number;
  is_day: number;
  condition: WeatherCondition;
  wind_kph: number;
  wind_degree: number;
  wind_dir: string;
  pressure_mb: number;
  precip_mm: number;
  humidity: number;
  cloud: number;
  feelslike_c: number;
  chance_of_rain: number;
  chance_of_snow: number;
  will_it_rain: number;
  vis_km: number;
  gust_kph: number;
  uv: number;
}

export interface DayForecast {
  maxtemp_c: number;
  maxtemp_f: number;
  mintemp_c: number;
  mintemp_f: number;
  avgtemp_c: number;
  avgtemp_f: number;
  maxwind_kph: number;
  totalprecip_mm: number;
  avghumidity: number;
  daily_will_it_rain: number;
  daily_chance_of_rain: number;
  daily_chance_of_snow: number;
  condition: WeatherCondition;
  uv: number;
}

export interface ForecastDay {
  /** "YYYY-MM-DD" en hora local de la ciudad */
  date: string;
  /** Epoch UNIX en segundos (medianoche local) */
  date_epoch: number;
  day: DayForecast;
  astro: AstroData;
  hour: HourWeather[];
}

export interface WeatherAPILocation {
  name: string;
  region: string;
  country: string;
  lat: number;
  lon: number;
  /** IANA timezone, ej. "America/Caracas" */
  tz_id: string;
  localtime_epoch: number;
  localtime: string;
}

export interface WeatherAPIResponse {
  location: WeatherAPILocation;
  current: CurrentWeather;
  forecast: { forecastday: ForecastDay[] };
  alerts?: { alert: WeatherAlert[] };
}

/* ─────────────────────────  Modelo normalizado de la app  ───────────────────────── */

export interface Coordinates {
  lat: number;
  lon: number;
}

export interface WeatherData {
  location: WeatherAPILocation;
  current: CurrentWeather;
  /** Todas las horas del pronóstico, aplanadas y ordenadas */
  hourly: HourWeather[];
  daily: ForecastDay[];
  astro: AstroData | null;
  alerts: WeatherAlert[];
  /** IANA tz de la ciudad consultada; todos los formateos de fecha lo usan */
  timeZone: string;
  /** Epoch en el que la app recibió estos datos */
  fetchedAt: number;
}

export type TempUnit = 'C' | 'F';
export type WeatherCardType = 'current' | 'hourly' | 'daily';

/** Categorías visuales derivadas del `condition.code` */
export type ConditionKind =
  | 'clear'
  | 'partly'
  | 'clouds'
  | 'fog'
  | 'drizzle'
  | 'rain'
  | 'storm'
  | 'snow'
  | 'sleet';
