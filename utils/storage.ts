/**
 * Wrapper seguro para localStorage (evita errores en SSR)
 */
import { STORAGE_KEYS } from '../constants/config';
import { TempUnit } from '../types/weather';

const isBrowser = typeof window !== 'undefined';

export const getTempUnit = (): TempUnit => {
  if (!isBrowser) return 'C';
  return (localStorage.getItem(STORAGE_KEYS.TEMP_UNIT) as TempUnit) || 'C';
};

export const setTempUnit = (unit: TempUnit): void => {
  if (!isBrowser) return;
  localStorage.setItem(STORAGE_KEYS.TEMP_UNIT, unit);
};

export const getRecentCities = (): string[] => {
  if (!isBrowser) return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.RECENT_CITIES);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
};

export const addRecentCity = (city: string, max: number): string[] => {
  if (!isBrowser) return [];
  const current = getRecentCities().filter(
    (c) => c.toLowerCase() !== city.toLowerCase()
  );
  const updated = [city, ...current].slice(0, max);
  localStorage.setItem(STORAGE_KEYS.RECENT_CITIES, JSON.stringify(updated));
  return updated;
};

export const clearRecentCities = (): void => {
  if (!isBrowser) return;
  localStorage.removeItem(STORAGE_KEYS.RECENT_CITIES);
};