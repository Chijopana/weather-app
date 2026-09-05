/**
 * Utilidades de clima: formateo temporal con zona horaria, conversión de
 * unidades y clasificación de condiciones.
 *
 * Regla de oro temporal: la API entrega `time_epoch` / `date_epoch` (epoch UNIX
 * en UTC) y `location.tz_id` (IANA). Toda fecha se formatea con Intl usando esa
 * tz. Nunca se hace `new Date("2026-09-05 14:00")`: ese string no lleva offset y
 * el navegador lo interpreta en SU zona, desfasando el pronóstico de cualquier
 * ciudad que no sea la del usuario.
 */

import { AQI_LEVELS, UV_LEVELS } from '../constants/config';
import type { ConditionKind, TempUnit } from '../types/weather';

/* ---------------------------------  Temperatura  --------------------------------- */

export const celsiusToFahrenheit = (c: number): number => (c * 9) / 5 + 32;

export const toUnit = (celsius: number, unit: TempUnit): number =>
  unit === 'F' ? celsiusToFahrenheit(celsius) : celsius;

/**
 * Convierte una DIFERENCIA de temperatura, no una lectura.
 * Un delta escala por 9/5 pero no lleva el desplazamiento de +32: pasar una
 * diferencia por `toUnit` daría un error de 32 grados.
 */
export const deltaToUnit = (celsiusDelta: number, unit: TempUnit): number =>
  unit === 'F' ? (celsiusDelta * 9) / 5 : celsiusDelta;

/** "23" con grado, sin sufijo de unidad. Para usos densos (carruseles, gráficos). */
export const formatTemp = (celsius: number | undefined | null, unit: TempUnit): string => {
  if (celsius === undefined || celsius === null || Number.isNaN(celsius)) return '--';
  return `${Math.round(toUnit(celsius, unit))}°`;
};

/** "23°C" con unidad explícita. Para la cifra principal. */
export const formatTempUnit = (celsius: number | undefined | null, unit: TempUnit): string => {
  if (celsius === undefined || celsius === null || Number.isNaN(celsius)) return '--';
  return `${Math.round(toUnit(celsius, unit))}°${unit}`;
};

/* ---------------------------  Fecha y hora (con tz)  --------------------------- */

const fmtCache = new Map<string, Intl.DateTimeFormat>();

function formatter(timeZone: string, options: Intl.DateTimeFormatOptions): Intl.DateTimeFormat {
  const key = `${timeZone}|${JSON.stringify(options)}`;
  let f = fmtCache.get(key);
  if (!f) {
    try {
      f = new Intl.DateTimeFormat('es-ES', { ...options, timeZone });
    } catch {
      // tz_id inválida o no soportada: caemos a la del navegador antes que romper.
      f = new Intl.DateTimeFormat('es-ES', options);
    }
    fmtCache.set(key, f);
  }
  return f;
}

/** "14:00" en la hora local de la ciudad consultada */
export const formatHour = (epochSeconds: number, timeZone: string): string => {
  if (!epochSeconds) return '--:--';
  return formatter(timeZone, { hour: '2-digit', minute: '2-digit', hour12: false }).format(
    new Date(epochSeconds * 1000)
  );
};

/** "lun 15" en la fecha local de la ciudad consultada */
export const formatDay = (epochSeconds: number, timeZone: string): string => {
  if (!epochSeconds) return '--';
  return formatter(timeZone, { weekday: 'short', day: 'numeric' }).format(
    new Date(epochSeconds * 1000)
  );
};

/** "lunes, 15 de septiembre" */
export const formatLongDate = (epochSeconds: number, timeZone: string): string => {
  if (!epochSeconds) return '';
  return formatter(timeZone, { weekday: 'long', day: 'numeric', month: 'long' }).format(
    new Date(epochSeconds * 1000)
  );
};

/** true si el epoch cae en el mismo día natural que `reference`, en esa tz */
export const isSameLocalDay = (
  epochSeconds: number,
  referenceEpochSeconds: number,
  timeZone: string
): boolean => {
  const f = formatter(timeZone, { year: 'numeric', month: '2-digit', day: '2-digit' });
  return (
    f.format(new Date(epochSeconds * 1000)) === f.format(new Date(referenceEpochSeconds * 1000))
  );
};

/** Etiqueta relativa de día: "Hoy" / "Mañana" / "mié 17" */
export const formatRelativeDay = (
  epochSeconds: number,
  nowEpochSeconds: number,
  timeZone: string
): string => {
  if (isSameLocalDay(epochSeconds, nowEpochSeconds, timeZone)) return 'Hoy';
  if (isSameLocalDay(epochSeconds, nowEpochSeconds + 86_400, timeZone)) return 'Mañana';
  return formatDay(epochSeconds, timeZone);
};

/**
 * Normaliza "06:17 AM" (formato de los campos astro) a "06:17".
 * La API ya entrega esa hora en local de la ciudad, así que solo se reformatea.
 */
export const formatAstroTime = (time?: string): string => {
  if (!time) return '--:--';
  const match = time.trim().match(/^(\d{1,2}):(\d{2})\s*(AM|PM)$/i);
  if (!match) return time;
  const [, h, m, meridiem] = match;
  let hour = Number(h) % 12;
  if (meridiem.toUpperCase() === 'PM') hour += 12;
  return `${String(hour).padStart(2, '0')}:${m}`;
};

/** "06:17 AM" a minutos desde medianoche; -1 si no se puede interpretar */
export const astroTimeToMinutes = (time?: string): number => {
  const match = formatAstroTime(time).match(/^(\d{2}):(\d{2})$/);
  if (!match) return -1;
  return Number(match[1]) * 60 + Number(match[2]);
};

/** "hace 3 min", a partir de un epoch en milisegundos */
export const formatRelativeTime = (epochMs: number, nowMs: number = Date.now()): string => {
  const seconds = Math.max(0, Math.round((nowMs - epochMs) / 1000));
  if (seconds < 60) return 'hace instantes';
  const minutes = Math.round(seconds / 60);
  if (minutes < 60) return `hace ${minutes} min`;
  const hours = Math.round(minutes / 60);
  if (hours < 24) return `hace ${hours} h`;
  return `hace ${Math.round(hours / 24)} d`;
};

/* ---------------------------  Condiciones climáticas  --------------------------- */

/**
 * Mapa código WeatherAPI -> categoría visual.
 * Se usa el código (estable e independiente del idioma) en lugar del texto, que
 * cambia con el parámetro `lang` y rompe cualquier coincidencia por substring.
 */
const CODE_TO_KIND: Record<number, ConditionKind> = {
  1000: 'clear',
  1003: 'partly',
  1006: 'clouds',
  1009: 'clouds',
  1030: 'fog',
  1135: 'fog',
  1147: 'fog',
  1063: 'drizzle',
  1150: 'drizzle',
  1153: 'drizzle',
  1168: 'drizzle',
  1171: 'drizzle',
  1180: 'rain',
  1183: 'rain',
  1186: 'rain',
  1189: 'rain',
  1192: 'rain',
  1195: 'rain',
  1198: 'rain',
  1201: 'rain',
  1240: 'rain',
  1243: 'rain',
  1246: 'rain',
  1066: 'snow',
  1114: 'snow',
  1117: 'snow',
  1210: 'snow',
  1213: 'snow',
  1216: 'snow',
  1219: 'snow',
  1222: 'snow',
  1225: 'snow',
  1255: 'snow',
  1258: 'snow',
  1069: 'sleet',
  1204: 'sleet',
  1207: 'sleet',
  1237: 'sleet',
  1249: 'sleet',
  1252: 'sleet',
  1261: 'sleet',
  1264: 'sleet',
  1087: 'storm',
  1273: 'storm',
  1276: 'storm',
  1279: 'storm',
  1282: 'storm',
};

export const conditionKind = (code: number | undefined): ConditionKind =>
  (code !== undefined && CODE_TO_KIND[code]) || 'clear';

/** Categorías que justifican partículas de precipitación en el fondo */
export const hasPrecipitation = (kind: ConditionKind): boolean =>
  kind === 'rain' || kind === 'drizzle' || kind === 'storm' || kind === 'snow' || kind === 'sleet';

/** URL absoluta del icono de la API (llega protocol-relative: "//cdn...") */
export const iconUrl = (icon: string | undefined): string =>
  icon ? `https:${icon.replace(/^https?:/, '')}` : '';

/* --------------------------------  Índices  -------------------------------- */

export const getUvInfo = (uv: number | undefined) => {
  const value = uv ?? 0;
  const level = UV_LEVELS.find((l) => value <= l.max) ?? UV_LEVELS[UV_LEVELS.length - 1];
  return { value, label: level.label, color: level.color };
};

export const getAqiInfo = (epaIndex: number | undefined) => {
  if (!epaIndex) return null;
  const level = AQI_LEVELS[Math.min(Math.max(epaIndex, 1), AQI_LEVELS.length) - 1];
  return { value: epaIndex, label: level.label, color: level.color };
};

const COMPASS = [
  'N', 'NNE', 'NE', 'ENE', 'E', 'ESE', 'SE', 'SSE',
  'S', 'SSO', 'SO', 'OSO', 'O', 'ONO', 'NO', 'NNO',
];

/** Punto cardinal en español a partir de los grados del viento */
export const windDirectionLabel = (degrees: number | undefined): string => {
  if (degrees === undefined) return '';
  const normalized = (((degrees % 360) + 360) % 360) / 22.5;
  return COMPASS[Math.round(normalized) % 16];
};

/* -------------------------------  Estadística  ------------------------------- */

/** Regresión lineal por mínimos cuadrados sobre y[i], con x = i */
export const linearRegression = (points: number[]): { slope: number; intercept: number } => {
  const n = points.length;
  if (n < 2) return { slope: 0, intercept: points[0] ?? 0 };

  const sumX = ((n - 1) * n) / 2;
  const sumY = points.reduce((a, b) => a + b, 0);
  const sumXY = points.reduce((acc, y, x) => acc + x * y, 0);
  const sumXX = points.reduce((acc, _, x) => acc + x * x, 0);

  const denominator = n * sumXX - sumX * sumX;
  if (denominator === 0) return { slope: 0, intercept: sumY / n };

  const slope = (n * sumXY - sumX * sumY) / denominator;
  return { slope, intercept: (sumY - slope * sumX) / n };
};

/** Coeficiente de determinación R2 de la recta ajustada sobre los datos */
export const rSquared = (points: number[]): number => {
  const n = points.length;
  if (n < 3) return 0;
  const { slope, intercept } = linearRegression(points);
  const mean = points.reduce((a, b) => a + b, 0) / n;
  let ssRes = 0;
  let ssTot = 0;
  points.forEach((y, x) => {
    ssRes += (y - (slope * x + intercept)) ** 2;
    ssTot += (y - mean) ** 2;
  });
  if (ssTot === 0) return 1;
  return Math.max(0, 1 - ssRes / ssTot);
};
