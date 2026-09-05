/**
 * useWeather
 *
 * Pide el clima a /api/weather (proxy propio: la API key nunca llega al
 * navegador), normaliza la respuesta y mantiene un auto-refresh que se pausa
 * cuando la pestaña está oculta o el navegador está sin conexión.
 */
import { useCallback, useEffect, useRef, useState } from 'react';

import { ERROR_MESSAGES, WEATHER_CONFIG } from '../constants/config';
import type {
  WeatherAPIErrorResponse,
  WeatherAPIResponse,
  WeatherData,
} from '../types/weather';

export interface UseWeatherReturn {
  data: WeatherData | null;
  /** Carga inicial: aún no hay nada que mostrar */
  loading: boolean;
  /** Recarga en segundo plano: ya hay datos en pantalla */
  refreshing: boolean;
  error: string | null;
  /** Hay datos en pantalla pero el último intento falló */
  stale: boolean;
  refresh: () => Promise<void>;
}

function isErrorResponse(json: unknown): json is WeatherAPIErrorResponse {
  return typeof json === 'object' && json !== null && 'error' in json;
}

function normalize(json: WeatherAPIResponse): WeatherData {
  const days = json.forecast?.forecastday ?? [];

  return {
    location: json.location,
    current: json.current,
    // Aplanamos todas las horas de todos los días y ordenamos por epoch:
    // el consumidor solo tiene que cortar, no reordenar.
    hourly: days.flatMap((d) => d.hour ?? []).sort((a, b) => a.time_epoch - b.time_epoch),
    daily: days,
    astro: days[0]?.astro ?? null,
    alerts: json.alerts?.alert ?? [],
    timeZone: json.location?.tz_id || 'UTC',
    fetchedAt: Date.now(),
  };
}

export function useWeather(query: string | null): UseWeatherReturn {
  const [data, setData] = useState<WeatherData | null>(null);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [stale, setStale] = useState(false);

  const abortRef = useRef<AbortController | null>(null);
  const hasDataRef = useRef(false);
  const lastFetchRef = useRef(0);
  // La query viva se guarda en una ref para que el temporizador de auto-refresh
  // no tenga que recrearse (ni perder su fase) en cada render.
  const queryRef = useRef<string | null>(query);
  queryRef.current = query;

  const fetchWeather = useCallback(async (q: string) => {
    abortRef.current?.abort();
    const controller = new AbortController();
    abortRef.current = controller;
    lastFetchRef.current = Date.now();

    if (hasDataRef.current) setRefreshing(true);
    else setLoading(true);

    try {
      const res = await fetch(`/api/weather?q=${encodeURIComponent(q)}`, {
        signal: controller.signal,
      });

      let json: unknown;
      try {
        json = await res.json();
      } catch {
        throw new Error(ERROR_MESSAGES.FETCH_FAILED);
      }

      if (!res.ok || isErrorResponse(json)) {
        const message = isErrorResponse(json) ? json.error.message : `Error ${res.status}`;
        throw new Error(message || ERROR_MESSAGES.FETCH_FAILED);
      }

      setData(normalize(json as WeatherAPIResponse));
      hasDataRef.current = true;
      setError(null);
      setStale(false);
    } catch (err) {
      if (err instanceof Error && err.name === 'AbortError') return;
      // Una respuesta tardía de una petición ya reemplazada no debe pisar el estado.
      if (abortRef.current !== controller) return;

      const message =
        typeof navigator !== 'undefined' && navigator.onLine === false
          ? ERROR_MESSAGES.OFFLINE
          : err instanceof Error
            ? err.message
            : ERROR_MESSAGES.FETCH_FAILED;

      setError(message);
      // Se conservan los datos previos: mejor un dato viejo etiquetado como tal
      // que una pantalla vacía.
      setStale(hasDataRef.current);
    } finally {
      if (abortRef.current === controller) {
        setLoading(false);
        setRefreshing(false);
      }
    }
  }, []);

  const refresh = useCallback(async () => {
    const q = queryRef.current;
    if (q) await fetchWeather(q);
  }, [fetchWeather]);

  // Carga cada vez que cambia la query
  useEffect(() => {
    if (!query) return;
    void fetchWeather(query);
  }, [query, fetchWeather]);

  // Aborta cualquier petición en vuelo al desmontar
  useEffect(() => () => abortRef.current?.abort(), []);

  // Auto-refresh: no gasta cuota mientras nadie mira la pestaña, y se pone al
  // día en cuanto el usuario vuelve si el dato ya caducó.
  useEffect(() => {
    if (!query) return undefined;

    const intervalMs = Math.max(1, WEATHER_CONFIG.REFRESH_INTERVAL_MINUTES) * 60_000;
    let timer: ReturnType<typeof setInterval> | null = null;

    const tick = () => {
      if (document.visibilityState !== 'visible') return;
      if (navigator.onLine === false) return;
      void refresh();
    };

    const start = () => {
      if (timer === null) timer = setInterval(tick, intervalMs);
    };
    const stop = () => {
      if (timer !== null) {
        clearInterval(timer);
        timer = null;
      }
    };

    const handleVisibility = () => {
      if (document.visibilityState !== 'visible') {
        stop();
        return;
      }
      start();
      // Solo se pone al día si el dato ya caducó: alternar pestañas rápido no
      // debe convertirse en una ráfaga de peticiones.
      if (Date.now() - lastFetchRef.current >= intervalMs) void refresh();
    };

    if (document.visibilityState === 'visible') start();
    document.addEventListener('visibilitychange', handleVisibility);
    window.addEventListener('online', handleVisibility);

    return () => {
      stop();
      document.removeEventListener('visibilitychange', handleVisibility);
      window.removeEventListener('online', handleVisibility);
    };
  }, [query, refresh]);

  return { data, loading, refreshing, error, stale, refresh };
}
