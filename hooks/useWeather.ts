/**
 * useWeather Hook
 * Fetches weather data from WeatherAPI.com with auto-refresh capability
 */
import { useEffect, useState, useRef, useCallback } from 'react';
import {
  WeatherData,
  HourlyWeather,
  DailyWeather,
  WeatherAPIResponse,
  WeatherAPIErrorResponse,
} from '../types/weather';
import { WEATHER_CONFIG, ERROR_MESSAGES } from '../constants/config';

interface UseWeatherReturn {
  data: WeatherData | null;
  loading: boolean;      // true solo en carga inicial (sin data previa)
  refreshing: boolean;   // true en refresh con data ya presente
  error: string | null;
  refresh: () => Promise<void>;
}

function isErrorResponse(json: unknown): json is WeatherAPIErrorResponse {
  return typeof json === 'object' && json !== null && 'error' in json;
}

export function useWeather(lat?: number, lon?: number, city?: string): UseWeatherReturn {
  const [data, setData] = useState<WeatherData | null>(null);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const abortControllerRef = useRef<AbortController | null>(null);
  const hasDataRef = useRef(false);

  const normalizeWeatherData = (json: WeatherAPIResponse): WeatherData => {
    const hourly: HourlyWeather[] = json.forecast.forecastday.flatMap((day) =>
      day.hour.map((h) => ({
        ...h,
        dt: Math.floor(new Date(h.time).getTime() / 1000),
      }))
    );

    const daily: DailyWeather[] = json.forecast.forecastday.map((d) => ({
      ...d,
      dt: Math.floor(new Date(d.date).getTime() / 1000),
      temp: { day: d.day.avgtemp_c },
      weather: [{
        main: d.day.condition.text ?? 'Unknown',
        description: d.day.condition.text ?? 'Unknown',
      }],
    }));

    return {
      current: json.current,
      hourly,
      daily,
      timezone: json.location.tz_id,
      locationName: `${json.location.name}, ${json.location.country}`,
      astro: json.forecast.forecastday[0]?.astro ?? null,
      alerts: json.alerts?.alert ?? [],
    };
  };

  const fetchWeather = useCallback(async (query: string) => {
    const controller = new AbortController();
    abortControllerRef.current?.abort();
    abortControllerRef.current = controller;

    if (hasDataRef.current) {
      setRefreshing(true);
    } else {
      setLoading(true);
    }
    setError(null);

    try {
      if (!WEATHER_CONFIG.API_KEY) {
        throw new Error('API key not configured. Please set NEXT_PUBLIC_WEATHERAPI_KEY in environment.');
      }

      const url = new URL('https://api.weatherapi.com/v1/forecast.json');
      url.searchParams.append('key', WEATHER_CONFIG.API_KEY);
      url.searchParams.append('q', query);
      url.searchParams.append('days', String(WEATHER_CONFIG.FORECAST_DAYS));
      url.searchParams.append('aqi', 'no');
      url.searchParams.append('alerts', 'yes');
      url.searchParams.append('lang', 'es');

      const response = await fetch(url.toString(), { signal: controller.signal });
      const json = (await response.json()) as WeatherAPIResponse | WeatherAPIErrorResponse;

      if (isErrorResponse(json)) {
        throw new Error(json.error.message || ERROR_MESSAGES.FETCH_FAILED);
      }

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }

      setData(normalizeWeatherData(json));
      hasDataRef.current = true;
      setError(null);
    } catch (err) {
      const error = err instanceof Error ? err : new Error(String(err));
      if (error.name === 'AbortError') return;

      // Solo abortamos si esta sigue siendo la request activa
      if (abortControllerRef.current === controller) {
        console.error('Weather fetch error:', error);
        setError(error.message || ERROR_MESSAGES.FETCH_FAILED);
        if (!hasDataRef.current) setData(null);
      }
    } finally {
      if (abortControllerRef.current === controller) {
        setLoading(false);
        setRefreshing(false);
      }
    }
  }, []);

  useEffect(() => {
    if (timerRef.current) clearInterval(timerRef.current);

    const executeQuery = async () => {
      if (city) {
        await fetchWeather(city);
      } else if (lat !== undefined && lon !== undefined) {
        await fetchWeather(`${lat},${lon}`);
      }
    };

    executeQuery();

    timerRef.current = setInterval(
      executeQuery,
      WEATHER_CONFIG.REFRESH_INTERVAL_MINUTES * 60 * 1000
    );

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
      abortControllerRef.current?.abort();
    };
  }, [lat, lon, city, fetchWeather]);

  const refresh = useCallback(async () => {
    if (city) {
      await fetchWeather(city);
    } else if (lat !== undefined && lon !== undefined) {
      await fetchWeather(`${lat},${lon}`);
    }
  }, [lat, lon, city, fetchWeather]);

  return { data, loading, refreshing, error, refresh };
}