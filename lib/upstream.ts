/**
 * Utilidades compartidas por las rutas /api/*: caché en memoria y llamada
 * a WeatherAPI con la key del servidor.
 *
 * Vive fuera de pages/ a propósito: Next.js convierte en endpoint público
 * TODO fichero bajo pages/api/, así que estando ahí este módulo auxiliar se
 * publicaba como la ruta /api/lib/upstream.
 *
 * La caché es por instancia (in-memory). En serverless con varias instancias
 * cada una tendrá la suya: suficiente para amortiguar ráfagas y proteger la
 * cuota, no es una caché distribuida.
 */
import type { NextApiResponse } from 'next';
import { WEATHER_CONFIG } from '../constants/config';

/**
 * API key de WeatherAPI. Se declara en este módulo, no en constants/config.ts:
 * ese fichero lo importan los componentes y todo lo que contiene viaja al
 * navegador. Aquí solo llega código de servidor.
 *
 * Se acepta el antiguo NEXT_PUBLIC_WEATHERAPI_KEY como respaldo para no romper
 * despliegues existentes, pero ese nombre expone la key en el bundle: migrar a
 * WEATHERAPI_KEY y rotar la anterior.
 */
const SERVER_API_KEY =
  process.env.WEATHERAPI_KEY || process.env.NEXT_PUBLIC_WEATHERAPI_KEY || '';

const UPSTREAM = 'https://api.weatherapi.com/v1';
const MAX_CACHE_ENTRIES = 200;

interface CacheEntry {
  expiresAt: number;
  payload: unknown;
}

const cache = new Map<string, CacheEntry>();

function readCache(key: string): unknown | null {
  const hit = cache.get(key);
  if (!hit) return null;
  if (hit.expiresAt < Date.now()) {
    cache.delete(key);
    return null;
  }
  // LRU simple: al usarla, la reinsertamos al final.
  cache.delete(key);
  cache.set(key, hit);
  return hit.payload;
}

function writeCache(key: string, payload: unknown, ttlSeconds: number): void {
  if (cache.size >= MAX_CACHE_ENTRIES) {
    const oldest = cache.keys().next().value;
    if (oldest !== undefined) cache.delete(oldest);
  }
  cache.set(key, { payload, expiresAt: Date.now() + ttlSeconds * 1000 });
}

export interface UpstreamResult {
  status: number;
  payload: unknown;
  cached: boolean;
}

export async function callWeatherAPI(
  endpoint: 'forecast.json' | 'search.json',
  params: Record<string, string>,
  ttlSeconds: number
): Promise<UpstreamResult> {
  const cacheKey = `${endpoint}?${new URLSearchParams(params).toString()}`;
  const cached = readCache(cacheKey);
  if (cached) return { status: 200, payload: cached, cached: true };

  const url = new URL(`${UPSTREAM}/${endpoint}`);
  url.searchParams.set('key', SERVER_API_KEY);
  for (const [k, v] of Object.entries(params)) url.searchParams.set(k, v);

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 10_000);

  try {
    const upstream = await fetch(url.toString(), { signal: controller.signal });
    const text = await upstream.text();

    let payload: unknown;
    try {
      payload = JSON.parse(text);
    } catch {
      // Upstream devolvió algo que no es JSON (HTML de error, proxy, etc.)
      return {
        status: 502,
        payload: { error: { code: 502, message: 'Respuesta inválida del proveedor de clima.' } },
        cached: false,
      };
    }

    if (upstream.ok) writeCache(cacheKey, payload, ttlSeconds);
    return { status: upstream.status, payload, cached: false };
  } catch (err) {
    const aborted = err instanceof Error && err.name === 'AbortError';
    return {
      status: aborted ? 504 : 502,
      payload: {
        error: {
          code: aborted ? 504 : 502,
          message: aborted
            ? 'El proveedor de clima tardó demasiado en responder.'
            : 'No se pudo contactar al proveedor de clima.',
        },
      },
      cached: false,
    };
  } finally {
    clearTimeout(timeout);
  }
}

/** Aplica cabeceras de caché y responde. */
export function send(
  res: NextApiResponse,
  status: number,
  payload: unknown,
  ttlSeconds: number = WEATHER_CONFIG.SERVER_CACHE_TTL_S
): void {
  if (status === 200) {
    res.setHeader(
      'Cache-Control',
      `public, s-maxage=${ttlSeconds}, stale-while-revalidate=${ttlSeconds * 2}`
    );
  } else {
    res.setHeader('Cache-Control', 'no-store');
  }
  res.status(status).json(payload);
}

/** Rechaza métodos distintos de GET. Devuelve true si ya respondió. */
export function rejectNonGet(method: string | undefined, res: NextApiResponse): boolean {
  if (method === 'GET') return false;
  res.setHeader('Allow', 'GET');
  send(res, 405, { error: { code: 405, message: 'Método no permitido' } }, 0);
  return true;
}

export function requireApiKey(res: NextApiResponse): boolean {
  if (SERVER_API_KEY) return true;
  send(res, 500, { error: { code: 500, message: 'Falta WEATHERAPI_KEY en el servidor.' } }, 0);
  return false;
}
