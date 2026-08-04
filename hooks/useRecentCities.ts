import { useState, useEffect, useCallback } from 'react';
import { WEATHER_CONFIG } from '../constants/config';
import { getRecentCities, addRecentCity, clearRecentCities } from '../utils/storage';

export function useRecentCities() {
  const [cities, setCities] = useState<string[]>([]);

  useEffect(() => {
    setCities(getRecentCities());
  }, []);

  const addCity = useCallback((city: string) => {
    const updated = addRecentCity(city, WEATHER_CONFIG.MAX_RECENT_CITIES);
    setCities(updated);
  }, []);

  const clearAll = useCallback(() => {
    clearRecentCities();
    setCities([]);
  }, []);

  return { cities, addCity, clearAll };
}