/**
 * Weather API Type Definitions
 */


export interface WeatherAPIErrorResponse {
  error: {
    code: number;
    message: string;
  };
}

export interface AstroData {
  sunrise: string;
  sunset: string;
  moonrise: string;
  moonset: string;
  moon_phase: string;
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

export type TempUnit = 'C' | 'F';

export interface WeatherCondition {
  text?: string;
  icon?: string;
  code?: number;
}

export interface Temperature {
  day?: number;
  min?: number;
  max?: number;
  night?: number;
  eve?: number;
  morn?: number;
}

export interface CurrentWeather {
  temp_c?: number;
  temp_f?: number;
  feelslike_c?: number;
  feelslike_f?: number;
  humidity?: number;
  wind_kph?: number;
  wind_mph?: number;
  wind_degree?: number;
  pressure_mb?: number;
  precip_mm?: number;
  uv?: number; // WeatherAPI usa 'uv', no 'uv_index'
  condition?: WeatherCondition;
  last_updated?: string;
}

export interface HourlyWeather extends CurrentWeather {
  time?: string;
  dt?: number;
}

export interface DailyWeather {
  date?: string;
  dt?: number;
  day?: {
    condition?: WeatherCondition;
    avgtemp_c?: number;
    avgtemp_f?: number;
    maxtemp_c?: number;
    mintemp_c?: number;
    chance_of_rain?: number;
  };
  temp?: Temperature;
  weather?: Array<{ main: string; description: string }>;
}

export interface WeatherData {
  current: CurrentWeather | null;
  hourly: HourlyWeather[] | null;
  daily: DailyWeather[] | null;
  timezone?: string;
  locationName?: string;
  astro?: AstroData | null;
  alerts?: WeatherAlert[];
}

export interface Coordinates {
  lat: number;
  lon: number;
}

export type WeatherCardType = 'current' | 'hourly' | 'daily';

/**
 * WeatherAPI.com Response Types
 */
export interface WeatherAPIForecastDay {
  date: string;
  day: {
    condition: WeatherCondition;
    avgtemp_c: number;
    avgtemp_f: number;
    maxtemp_c: number;
    mintemp_c: number;
    chance_of_rain: number;
  };
  hour: Array<{
    time: string;
    temp_c: number;
    temp_f: number;
    feelslike_c: number;
    feelslike_f: number;
    humidity: number;
    wind_kph: number;
    wind_mph: number;
    wind_degree: number;
    condition: WeatherCondition;
  }>;
}

export interface WeatherAPILocation {
  name: string;
  country: string;
  tz_id: string;
}

export interface WeatherAPIResponse {
  current: CurrentWeather;
  forecast: {
    forecastday: (WeatherAPIForecastDay & { astro: AstroData })[];
  };
  location: WeatherAPILocation;
  alerts?: {
    alert: WeatherAlert[];
  };
}
