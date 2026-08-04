/**
 * useCitySearch Hook
 * Autocomplete de ciudades usando WeatherAPI /search.json
 */
import { useState, useEffect, useRef, useCallback } from 'react';
import { CitySearchResult } from '../types/weather';
import { WEATHER_CONFIG } from '../constants/config';

export function useCitySearch(query: string) {
  const [results, setResults] = useState<CitySearchResult[]>([]);
  const [loading, setLoading] = useState(false);
  const debounceRef = useRef<NodeJS.Timeout | null>(null);
  const abortRef = useRef<AbortController | null>(null);

  const search = useCallback(async (q: string) => {
    if (q.trim().length < 2) {
      setResults([]);
      return;
    }

    abortRef.current?.abort();
    abortRef.current = new AbortController();
    setLoading(true);

    try {
      const url = new URL('https://api.weatherapi.com/v1/search.json');
      url.searchParams.append('key', WEATHER_CONFIG.API_KEY || '');
      url.searchParams.append('q', q);

      const res = await fetch(url.toString(), { signal: abortRef.current.signal });
      if (!res.ok) throw new Error('Search failed');

      const data = (await res.json()) as CitySearchResult[];
      setResults(data);
    } catch (err) {
      if ((err as Error).name !== 'AbortError') {
        setResults([]);
      }
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);

    debounceRef.current = setTimeout(() => {
      search(query);
    }, WEATHER_CONFIG.SEARCH_DEBOUNCE_MS);

    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [query, search]);

  return { results, loading };
}