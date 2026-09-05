/**
 * GET /api/search?q=<texto>
 *
 * Proxy del autocompletado de ciudades. Devuelve solo los campos que la UI
 * necesita, para no filtrar más superficie de la API de la necesaria.
 */
import type { NextApiRequest, NextApiResponse } from 'next';
import type { CitySearchResult } from '../../types/weather';
import { callWeatherAPI, rejectNonGet, requireApiKey, send } from '../../lib/upstream';

const SEARCH_CACHE_TTL_S = 3600;
const MIN_QUERY_LENGTH = 2;
const MAX_QUERY_LENGTH = 60;

function isCityArray(payload: unknown): payload is CitySearchResult[] {
  return Array.isArray(payload);
}

export default async function handler(req: NextApiRequest, res: NextApiResponse): Promise<void> {
  if (rejectNonGet(req.method, res)) return;
  if (!requireApiKey(res)) return;

  const raw = req.query.q;
  const q = (Array.isArray(raw) ? raw[0] : raw)?.trim() ?? '';

  if (q.length < MIN_QUERY_LENGTH || q.length > MAX_QUERY_LENGTH) {
    send(res, 200, [], SEARCH_CACHE_TTL_S);
    return;
  }

  const { status, payload } = await callWeatherAPI('search.json', { q }, SEARCH_CACHE_TTL_S);

  if (status !== 200 || !isCityArray(payload)) {
    send(res, status === 200 ? 502 : status, payload, 0);
    return;
  }

  const slim: CitySearchResult[] = payload.map((c) => ({
    id: c.id,
    name: c.name,
    region: c.region,
    country: c.country,
    lat: c.lat,
    lon: c.lon,
  }));

  send(res, 200, slim, SEARCH_CACHE_TTL_S);
}
