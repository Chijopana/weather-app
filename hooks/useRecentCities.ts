import { useCallback, useEffect, useState } from 'react';

import { WEATHER_CONFIG } from '../constants/config';
import {
  addRecentCity,
  clearRecentCities,
  getRecentCities,
  removeRecentCity,
} from '../utils/storage';

export function useRecentCities() {
  const [cities, setCities] = useState<string[]>([]);

  useEffect(() => {
    setCities(getRecentCities());
  }, []);

  const addCity = useCallback((city: string) => {
    setCities(addRecentCity(city, WEATHER_CONFIG.MAX_RECENT_CITIES));
  }, []);

  const removeCity = useCallback((city: string) => {
    setCities(removeRecentCity(city));
  }, []);

  const clearAll = useCallback(() => {
    clearRecentCities();
    setCities([]);
  }, []);

  return { cities, addCity, removeCity, clearAll };
}
