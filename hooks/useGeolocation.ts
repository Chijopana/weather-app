import { useCallback, useState } from 'react';

import { ERROR_MESSAGES, WEATHER_CONFIG } from '../constants/config';
import type { Coordinates } from '../types/weather';

export type GeoStatus = 'idle' | 'locating' | 'granted' | 'error';

/**
 * Geolocalizacion bajo demanda.
 * Se expone `request()` en lugar de pedir la ubicacion sola en un efecto: asi
 * el usuario puede reintentar tras denegar el permiso, algo que antes obligaba
 * a recargar la pagina.
 */
export function useGeolocation() {
  const [coords, setCoords] = useState<Coordinates | null>(null);
  const [status, setStatus] = useState<GeoStatus>('idle');
  const [error, setError] = useState<string | null>(null);

  const request = useCallback((): Promise<Coordinates | null> => {
    if (typeof navigator === 'undefined' || !navigator.geolocation) {
      setStatus('error');
      setError(ERROR_MESSAGES.GEOLOCATION_UNSUPPORTED);
      return Promise.resolve(null);
    }

    setStatus('locating');
    setError(null);

    return new Promise((resolve) => {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          const next = { lat: pos.coords.latitude, lon: pos.coords.longitude };
          setCoords(next);
          setStatus('granted');
          setError(null);
          resolve(next);
        },
        (err) => {
          const message =
            err.code === err.PERMISSION_DENIED
              ? ERROR_MESSAGES.GEOLOCATION_DENIED
              : err.code === err.TIMEOUT
                ? ERROR_MESSAGES.GEOLOCATION_TIMEOUT
                : ERROR_MESSAGES.GEOLOCATION_UNAVAILABLE;
          setStatus('error');
          setError(message);
          resolve(null);
        },
        WEATHER_CONFIG.GEOLOCATION_OPTIONS
      );
    });
  }, []);

  return { coords, status, error, request };
}
