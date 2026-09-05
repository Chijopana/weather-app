/**
 * Wrapper de localStorage tolerante a fallos.
 *
 * localStorage no solo falta en SSR: también lanza en modo privado de algunos
 * navegadores, con cookies de terceros bloqueadas o con la cuota llena. Cada
 * acceso va envuelto para que un fallo de almacenamiento nunca tumbe la UI.
 */
import { STORAGE_KEYS } from '../constants/config';
import type { TempUnit } from '../types/weather';

const isBrowser = typeof window !== 'undefined';

function readRaw(key: string): string | null {
  if (!isBrowser) return null;
  try {
    return window.localStorage.getItem(key);
  } catch {
    return null;
  }
}

function writeRaw(key: string, value: string): void {
  if (!isBrowser) return;
  try {
    window.localStorage.setItem(key, value);
  } catch {
    // Cuota llena o almacenamiento bloqueado: se ignora, no es crítico.
  }
}

function removeRaw(key: string): void {
  if (!isBrowser) return;
  try {
    window.localStorage.removeItem(key);
  } catch {
    /* ignorado */
  }
}

/* ---------------------------------  Unidad  --------------------------------- */

export const getTempUnit = (): TempUnit => (readRaw(STORAGE_KEYS.TEMP_UNIT) === 'F' ? 'F' : 'C');

export const setTempUnit = (unit: TempUnit): void => writeRaw(STORAGE_KEYS.TEMP_UNIT, unit);

/* ----------------------------  Ciudades recientes  ---------------------------- */

export const getRecentCities = (): string[] => {
  const raw = readRaw(STORAGE_KEYS.RECENT_CITIES);
  if (!raw) return [];
  try {
    const parsed: unknown = JSON.parse(raw);
    // El contenido puede venir de una versión anterior de la app o de una
    // manipulación manual: se valida antes de confiar en él.
    if (!Array.isArray(parsed)) return [];
    return parsed.filter((c): c is string => typeof c === 'string' && c.length > 0);
  } catch {
    return [];
  }
};

export const addRecentCity = (city: string, max: number): string[] => {
  const current = getRecentCities().filter((c) => c.toLowerCase() !== city.toLowerCase());
  const updated = [city, ...current].slice(0, max);
  writeRaw(STORAGE_KEYS.RECENT_CITIES, JSON.stringify(updated));
  return updated;
};

export const removeRecentCity = (city: string): string[] => {
  const updated = getRecentCities().filter((c) => c.toLowerCase() !== city.toLowerCase());
  writeRaw(STORAGE_KEYS.RECENT_CITIES, JSON.stringify(updated));
  return updated;
};

export const clearRecentCities = (): void => removeRaw(STORAGE_KEYS.RECENT_CITIES);

/* -----------------------------  Última consulta  ----------------------------- */

/** Permite restaurar la última ciudad vista si la geolocalización falla o se deniega. */
export const getLastQuery = (): string | null => readRaw(STORAGE_KEYS.LAST_QUERY);

export const setLastQuery = (query: string): void => writeRaw(STORAGE_KEYS.LAST_QUERY, query);
