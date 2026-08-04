import React, { useEffect, useState, useCallback } from 'react';
import dynamic from 'next/dynamic';
import { motion } from 'framer-motion';
import { FiRefreshCw } from 'react-icons/fi';

import SearchBar from '../components/SearchBar';
import WeatherCard from '../components/WeatherCard';
import Background from '../components/Background';
import ErrorBoundary from '../components/ErrorBoundary';
import Carousel from '../components/Carousel';
import WeatherAlerts from '../components/WeatherAlerts';
import TemperatureTrend from '../components/TemperatureTrend';
import TempToggle from '../components/TempToggle';
import { WeatherPageSkeleton } from '../components/LoadingSkeleton';
import { useWeather } from '../hooks/useWeather';
import { useTempUnit } from '../hooks/useTempUnit';
import { WEATHER_CONFIG } from '../constants/config';
import type { Coordinates } from '../types/weather';

const MapNoSSR = dynamic(() => import('../components/Map'), { ssr: false });

export default function Home() {
  const [coords, setCoords] = useState<Coordinates | null>(null);
  const [city, setCity] = useState<string>('');
  const [geolocationError, setGeolocationError] = useState<string | null>(null);

  const { data, loading, refreshing, error, refresh } = useWeather(coords?.lat, coords?.lon, city);
  const { unit, toggleUnit } = useTempUnit();

  useEffect(() => {
    if (!navigator.geolocation) {
      setGeolocationError('Tu navegador no soporta geolocalización');
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setCoords({ lat: pos.coords.latitude, lon: pos.coords.longitude });
        setGeolocationError(null);
      },
      (err) => {
        console.warn('Geolocation error:', err);
        setGeolocationError('No se pudo obtener tu ubicación. Busca una ciudad manualmente.');
      },
      WEATHER_CONFIG.GEOLOCATION_OPTIONS
    );
  }, []);

  const handleSearch = useCallback((searchCity: string) => {
    setCity(searchCity);
    setCoords(null);
  }, []);

  const handleRefresh = useCallback(async () => {
    await refresh();
  }, [refresh]);

  const isLoading = loading && !data;

  // Filtramos horas ya pasadas para el bloque "Por hora"
  const now = Math.floor(Date.now() / 1000);
  const upcomingHourly = data?.hourly?.filter((h) => (h.dt ?? 0) >= now) ?? [];

  return (
    <ErrorBoundary>
      <div className="min-h-screen flex flex-col items-center text-white relative font-sans">
        <Background weatherMain={data?.current?.condition?.text} />

        <header className="w-full max-w-3xl p-4 mt-6 flex items-center justify-between">
          <h1 className="text-3xl font-semibold tracking-wide">Weather</h1>
          <div className="flex items-center gap-3">
            <TempToggle unit={unit} onToggle={toggleUnit} />
            <motion.button
              onClick={handleRefresh}
              disabled={loading}
              whileHover={!loading ? { rotate: 20 } : {}}
              whileTap={!loading ? { scale: 0.9 } : {}}
              className="p-2 hover:bg-white/10 rounded-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed relative"
              aria-label="Actualizar"
              title="Actualizar clima"
            >
              <FiRefreshCw size={20} className={loading || refreshing ? 'animate-spin' : ''} />
            </motion.button>
            <div className="text-sm opacity-80 text-right hidden sm:block">
              {data?.locationName ?? data?.timezone ?? 'Ubicación'}
            </div>
          </div>
        </header>

        <SearchBar onSearch={handleSearch} disabled={loading} />

        <main className="w-full max-w-3xl px-4 mt-4 space-y-6 pb-12">
          {geolocationError && !city && (
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-yellow-300 text-sm bg-yellow-500/10 border border-yellow-500/20 rounded-lg p-3"
            >
              {geolocationError}
            </motion.p>
          )}

          {error && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-red-300 text-sm bg-red-500/10 border border-red-500/20 rounded-lg p-3"
            >
              <p className="font-medium">{error}</p>
              <p className="text-xs opacity-80 mt-1">Verifica la ciudad o intenta de nuevo</p>
            </motion.div>
          )}

          {isLoading && <WeatherPageSkeleton />}

          {!isLoading && data?.alerts && data.alerts.length > 0 && (
            <WeatherAlerts alerts={data.alerts} />
          )}

          {/* Indicador sutil de refresh, sin desmontar la card */}
          {!isLoading && refreshing && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="flex items-center gap-2 text-xs opacity-60"
            >
              <FiRefreshCw size={12} className="animate-spin" /> Actualizando datos...
            </motion.div>
          )}

          {!isLoading && data?.current && (
            <WeatherCard data={data.current} type="current" unit={unit} astro={data.astro} />
          )}

          {!isLoading && upcomingHourly.length > 0 && (
            <TemperatureTrend hourly={upcomingHourly} unit={unit} />
          )}

          {!isLoading && upcomingHourly.length > 0 && (
            <section>
              <h2 className="text-white/90 mb-3 text-lg font-medium tracking-wide">Por hora</h2>
              <Carousel ariaLabel="Pronóstico por hora">
                {upcomingHourly.slice(0, WEATHER_CONFIG.HOURLY_SLICE_LIMIT).map((h, i) => (
                  <div key={i} className="snap-start flex-shrink-0">
                    <WeatherCard data={h} type="hourly" unit={unit} />
                  </div>
                ))}
              </Carousel>
            </section>
          )}

          {!isLoading && data?.daily && data.daily.length > 0 && (
            <section className="mb-8">
              <h2 className="text-white/90 mb-3 text-lg font-medium tracking-wide">Por día</h2>
              <Carousel ariaLabel="Pronóstico diario">
                {data.daily.slice(0, WEATHER_CONFIG.DAILY_SLICE_LIMIT).map((d, i) => (
                  <div key={i} className="snap-start flex-shrink-0">
                    <WeatherCard data={d} type="daily" unit={unit} />
                  </div>
                ))}
              </Carousel>
            </section>
          )}

          {!isLoading && coords && <MapNoSSR lat={coords.lat} lon={coords.lon} />}
        </main>
      </div>
    </ErrorBoundary>
  );
}
