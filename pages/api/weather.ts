/**
 * GET /api/weather?q=<ciudad|lat,lon>
 *
 * Proxy del endpoint forecast.json de WeatherAPI. Mantiene la API key en el
 * servidor y cachea la respuesta para no quemar la cuota con el auto-refresh.
 */
import type { NextApiRequest, NextApiResponse } from 'next';
import { WEATHER_CONFIG } from '../../constants/config';
import { callWeatherAPI, rejectNonGet, requireApiKey, send } from '../../lib/upstream';

const MAX_QUERY_LENGTH = 100;

export default async function handler(req: NextApiRequest, res: NextApiResponse): Promise<void> {
  if (rejectNonGet(req.method, res)) return;
  if (!requireApiKey(res)) return;

  const raw = req.query.q;
  const q = (Array.isArray(raw) ? raw[0] : raw)?.trim() ?? '';

  if (!q) {
    send(res, 400, { error: { code: 400, message: 'Falta el parámetro q.' } }, 0);
    return;
  }
  if (q.length > MAX_QUERY_LENGTH) {
    send(res, 400, { error: { code: 400, message: 'Consulta demasiado larga.' } }, 0);
    return;
  }

  const { status, payload } = await callWeatherAPI(
    'forecast.json',
    {
      q,
      days: String(WEATHER_CONFIG.FORECAST_DAYS),
      aqi: 'yes',
      alerts: 'yes',
      lang: 'es',
    },
    WEATHER_CONFIG.SERVER_CACHE_TTL_S
  );

  send(res, status, payload);
}
