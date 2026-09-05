/**
 * useCitySearch
 * Autocompletado de ciudades contra /api/search (proxy propio, sin API key
 * en el cliente). Debounce + cancelacion de la peticion anterior.
 */
import { useCallback, useEffect, useRef, useState } from 'react';

import { WEATHER_CONFIG } from '../constants/config';
import type { CitySearchResult } from '../types/weather';

const MIN_QUERY_LENGTH = 2;

export function useCitySearch(query: string) {
  const [results, setResults] = useState<CitySearchResult[]>([]);
  const [loading, setLoading] = useState(false);
  const abortRef = useRef<AbortController | null>(null);

  const search = useCallback(async (q: string) => {
    abortRef.current?.abort();
    const controller = new AbortController();
    abortRef.current = controller;
    setLoading(true);

    try {
      const res = await fetch(`/api/search?q=${encodeURIComponent(q)}`, {
        signal: controller.signal,
      });
      if (!res.ok) throw new Error('search failed');

      const data: unknown = await res.json();
      if (abortRef.current !== controller) return;
      setResults(Array.isArray(data) ? (data as CitySearchResult[]) : []);
    } catch (err) {
      if (err instanceof Error && err.name === 'AbortError') return;
      if (abortRef.current === controller) setResults([]);
    } finally {
      if (abortRef.current === controller) setLoading(false);
    }
  }, []);

  useEffect(() => {
    const trimmed = query.trim();

    if (trimmed.length < MIN_QUERY_LENGTH) {
      abortRef.current?.abort();
      setResults([]);
      setLoading(false);
      return undefined;
    }

    // Se marca "buscando" ya durante el debounce: si no, el dropdown muestra
    // "Sin resultados" durante 300 ms antes de que la peticion siquiera salga.
    setLoading(true);
    const timer = setTimeout(() => void search(trimmed), WEATHER_CONFIG.SEARCH_DEBOUNCE_MS);

    return () => clearTimeout(timer);
  }, [query, search]);

  useEffect(() => () => abortRef.current?.abort(), []);

  return { results, loading };
}
