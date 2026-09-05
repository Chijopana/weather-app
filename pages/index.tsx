import { AnimatePresence, motion } from 'framer-motion';
import dynamic from 'next/dynamic';
import Head from 'next/head';
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { FiAlertCircle, FiRefreshCw } from 'react-icons/fi';

import Background from '../components/Background';
import CurrentWeather from '../components/CurrentWeather';
import DailyForecast from '../components/DailyForecast';
import HourlyForecast from '../components/HourlyForecast';
import { WeatherPageSkeleton } from '../components/LoadingSkeleton';
import MetricsGrid from '../components/MetricsGrid';
import SearchBar from '../components/SearchBar';
import SunArc from '../components/SunArc';
import TempToggle from '../components/TempToggle';
import TemperatureTrend from '../components/TemperatureTrend';
import WeatherAlerts from '../components/WeatherAlerts';
import { WEATHER_CONFIG } from '../constants/config';
import { KIND_LABEL } from '../constants/theme';
import { useGeolocation } from '../hooks/useGeolocation';
import { useNow } from '../hooks/useNow';
import { useTempUnit } from '../hooks/useTempUnit';
import { useWeather } from '../hooks/useWeather';
import { getLastQuery, setLastQuery } from '../utils/storage';
import { conditionKind, formatRelativeTime } from '../utils/weatherUtils';

const MapNoSSR = dynamic(() => import('../components/Map'), {
  ssr: false,
  loading: () => <div className="h-[280px] animate-pulse rounded-2xl bg-white/10" />,
});

export default function Home() {
  const [query, setQuery] = useState<string | null>(null);
  const [ready, setReady] = useState(false);

  const { data, loading, refreshing, error, stale, refresh } = useWeather(query);
  const { unit, toggleUnit } = useTempUnit();
  const geo = useGeolocation();
  // Reloj a un minuto: mantiene vivos los textos relativos sin invalidar los
  // memos en cada render.
  const nowEpoch = useNow();

  const applyQuery = useCallback((next: string) => {
    setQuery(next);
    setLastQuery(next);
  }, []);

  // Se depende de `geo.request` (estable) y no de `geo`, que es un objeto nuevo
  // en cada render y haria inutil el useCallback.
  const requestLocation = geo.request;
  const locate = useCallback(async () => {
    const coords = await requestLocation();
    if (coords) applyQuery(`${coords.lat},${coords.lon}`);
  }, [requestLocation, applyQuery]);

  // Arranque: se intenta la geolocalización y, si falla o se deniega, se cae en
  // la última ciudad consultada. Antes una denegación dejaba la app en blanco.
  useEffect(() => {
    let cancelled = false;

    const boot = async () => {
      const saved = getLastQuery();
      const coords = await requestLocation();
      if (cancelled) return;

      if (coords) applyQuery(`${coords.lat},${coords.lon}`);
      else if (saved) setQuery(saved);

      setReady(true);
    };

    void boot();
    return () => {
      cancelled = true;
    };
    // Solo al montar: `boot` no debe reejecutarse al cambiar la query.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const upcomingHours = useMemo(() => {
    if (!data || nowEpoch === 0) return [];
    return data.hourly
      .filter((h) => h.time_epoch >= nowEpoch - 3600)
      .slice(0, WEATHER_CONFIG.HOURLY_SLICE_LIMIT);
  }, [data, nowEpoch]);

  const kind = data ? conditionKind(data.current.condition?.code) : null;
  const isDay = data ? data.current.is_day === 1 : true;
  const showSkeleton = (loading || !ready) && !data;
  const noLocationYet = ready && !query && !data;

  const pageTitle = data
    ? `${Math.round(data.current.temp_c)}°C · ${data.location.name} · Clima`
    : 'Clima';

  return (
    <>
      <Head>
        <title>{pageTitle}</title>
        <meta
          name="description"
          content="Pronóstico del tiempo por hora y por día, con alertas oficiales, calidad del aire y mapa de la ubicación."
        />
      </Head>

      <Background kind={kind} isDay={isDay} />

      {/* `relative z-10`: mantiene el contenido por delante de la capa de fondo
          sin recurrir a z-index negativos en el fondo. */}
      <div className="relative z-10 flex min-h-screen flex-col text-white">
        <div className="mx-auto w-full max-w-3xl flex-1 px-4 pb-16 pt-6 sm:px-6">
          <header className="mb-5 flex items-center justify-between gap-4">
            <div className="min-w-0">
              <h1 className="text-2xl font-semibold tracking-tight">Clima</h1>
              <p className="h-4 truncate text-xs text-white/55">
                {data && (
                  <>
                    {kind && <span className="capitalize">{KIND_LABEL[kind]}</span>}
                    {' · actualizado '}
                    {formatRelativeTime(data.fetchedAt, nowEpoch * 1000)}
                  </>
                )}
              </p>
            </div>

            <div className="flex shrink-0 items-center gap-2">
              <TempToggle unit={unit} onToggle={toggleUnit} />
              <button
                type="button"
                onClick={() => void refresh()}
                disabled={!query || loading || refreshing}
                aria-label="Actualizar datos"
                title="Actualizar datos"
                className="rounded-lg border border-white/15 bg-white/10 p-2 backdrop-blur-md transition hover:bg-white/20 focus:outline-none focus-visible:ring-2 focus-visible:ring-white/60 disabled:opacity-40"
              >
                <FiRefreshCw
                  size={17}
                  className={refreshing || loading ? 'animate-spin motion-reduce:animate-none' : ''}
                />
              </button>
            </div>
          </header>

          <SearchBar
            onSearch={(next) => applyQuery(next)}
            onLocate={() => void locate()}
            locating={geo.status === 'locating'}
          />

          <main className="mt-6 space-y-6">
            {/* Un aviso de geolocalización solo estorba si ya hay datos en pantalla */}
            {geo.error && !data && (
              <Notice tone="warning">
                {geo.error}{' '}
                <button
                  type="button"
                  onClick={() => void locate()}
                  className="underline underline-offset-2 hover:no-underline"
                >
                  Reintentar
                </button>
              </Notice>
            )}

            {error && (
              <Notice tone="error">
                {error}
                {stale && ' Se muestran los últimos datos recibidos.'}
              </Notice>
            )}

            {noLocationYet && !geo.error && (
              <Notice tone="info">Busca una ciudad para ver su pronóstico.</Notice>
            )}

            {showSkeleton && query && <WeatherPageSkeleton />}

            <AnimatePresence mode="wait">
              {data && (
                <motion.div
                  key={data.location.tz_id + data.location.name}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.25 }}
                  className={`space-y-6 transition-opacity ${stale ? 'opacity-60' : ''}`}
                >
                  <WeatherAlerts alerts={data.alerts} />

                  <CurrentWeather
                    current={data.current}
                    location={data.location}
                    today={data.daily[0]?.day ?? null}
                    unit={unit}
                  />

                  <HourlyForecast
                    hours={upcomingHours}
                    unit={unit}
                    timeZone={data.timeZone}
                    nowEpoch={nowEpoch}
                  />

                  <DailyForecast
                    days={data.daily.slice(0, WEATHER_CONFIG.DAILY_SLICE_LIMIT)}
                    unit={unit}
                    timeZone={data.timeZone}
                    nowEpoch={nowEpoch}
                  />

                  <MetricsGrid current={data.current} />

                  {data.astro && <SunArc astro={data.astro} location={data.location} />}

                  <TemperatureTrend
                    hourly={data.hourly}
                    unit={unit}
                    timeZone={data.timeZone}
                    nowEpoch={nowEpoch}
                  />

                  <MapNoSSR
                    lat={data.location.lat}
                    lon={data.location.lon}
                    label={data.location.name}
                  />
                </motion.div>
              )}
            </AnimatePresence>
          </main>

          <footer className="mt-10 text-center text-xs text-white/40">
            Datos de{' '}
            <a
              href="https://www.weatherapi.com/"
              target="_blank"
              rel="noopener noreferrer"
              className="underline underline-offset-2 hover:text-white/70"
            >
              WeatherAPI.com
            </a>
            {' · mapa de OpenStreetMap'}
          </footer>
        </div>
      </div>
    </>
  );
}

function Notice({
  tone,
  children,
}: {
  tone: 'error' | 'warning' | 'info';
  children: React.ReactNode;
}) {
  const styles = {
    error: 'border-red-400/35 bg-red-500/15 text-red-100',
    warning: 'border-amber-400/35 bg-amber-500/15 text-amber-100',
    info: 'border-white/15 bg-white/[0.07] text-white/80',
  }[tone];

  return (
    <p
      role={tone === 'error' ? 'alert' : 'status'}
      className={`flex items-start gap-2 rounded-xl border p-3 text-sm backdrop-blur-md ${styles}`}
    >
      <FiAlertCircle size={16} className="mt-0.5 shrink-0" aria-hidden="true" />
      <span>{children}</span>
    </p>
  );
}
