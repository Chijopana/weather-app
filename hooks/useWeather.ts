/**
 * useWeather Hook
 * Fetches weather data from WeatherAPI.com with auto-refresh capability
 */

import { useEffect, useState, useRef, useCallback } from 'react';
import { WeatherData, HourlyWeather, DailyWeather, WeatherAPIResponse } from '../types/weather';
import { WEATHER_CONFIG, ERROR_MESSAGES } from '../constants/config';

interface UseWeatherReturn {
  data: WeatherData | null;
  loading: boolean;
  error: string | null;
  refresh: () => Promise<void>;
}

/**
 * Custom hook for fetching weather data
 * @param lat - Latitude coordinate
 * @param lon - Longitude coordinate
 * @param city - City name for search
 * @returns Weather data, loading state, error state, and refresh function
 */
export function useWeather(lat?: number, lon?: number, city?: string): UseWeatherReturn {
  const [data, setData] = useState<WeatherData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const abortControllerRef = useRef<AbortController | null>(null);

  /**
   * Validates and normalizes API response data
   */
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
        description: d.day.condition.text ?? 'Unknown' 
      }],
    }));

    return {
      current: json.current,
      hourly,
      daily,
      timezone: json.location.tz_id,
      locationName: `${json.location.name}, ${json.location.country}`,
    };
  };

  /**
   * Fetches weather data from API
   */
  const fetchWeather = useCallback(async (query: string) => {
    // Cancel previous request if still pending
    abortControllerRef.current?.abort();
    abortControllerRef.current = new AbortController();

    setLoading(true);
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
      url.searchParams.append('alerts', 'no');
      url.searchParams.append('lang', 'es');

      const response = await fetch(url.toString(), {
        signal: abortControllerRef.current.signal,
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }

      const json = (await response.json()) as WeatherAPIResponse;

      if ((json as any).error) {
        throw new Error((json as any).error.message || ERROR_MESSAGES.FETCH_FAILED);
      }

      setData(normalizeWeatherData(json));
      setError(null);
    } catch (err) {
      const error = err instanceof Error ? err : new Error(String(err));
      if (error.name === 'AbortError') return; // Request was cancelled

      const message = error.message || ERROR_MESSAGES.FETCH_FAILED;
      console.error('Weather fetch error:', error);
      setError(message);
      setData(null);
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * Effect for fetching weather and setting up auto-refresh
   */
  useEffect(() => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
    }

    const executeQuery = async () => {
      if (city) {
        await fetchWeather(city);
      } else if (lat !== undefined && lon !== undefined) {
        await fetchWeather(`${lat},${lon}`);
      }
    };

    executeQuery();

    // Set up auto-refresh
    timerRef.current = setInterval(
      executeQuery,
      WEATHER_CONFIG.REFRESH_INTERVAL_MINUTES * 60 * 1000
    );

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
      abortControllerRef.current?.abort();
    };
  }, [lat, lon, city, fetchWeather]);

  /**
   * Manual refresh function
   */
  const refresh = useCallback(async () => {
    if (city) {
      await fetchWeather(city);
    } else if (lat !== undefined && lon !== undefined) {
      await fetchWeather(`${lat},${lon}`);
    }
  }, [lat, lon, city, fetchWeather]);

  return {
    data,
    loading,
    error,
    refresh,
  };
}
