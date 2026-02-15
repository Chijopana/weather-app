/**
 * Home Page
 * Main weather application interface
 */

import React, { useEffect, useState, useRef, useCallback } from "react";
import dynamic from "next/dynamic";
import { motion } from "framer-motion";
import { FiRefreshCw } from "react-icons/fi";

import SearchBar from "../components/SearchBar";
import WeatherCard from "../components/WeatherCard";
import Background from "../components/Background";
import ErrorBoundary from "../components/ErrorBoundary";
import { WeatherPageSkeleton } from "../components/LoadingSkeleton";
import { useWeather } from "../hooks/useWeather";
import { WEATHER_CONFIG } from "../constants/config";
import type { Coordinates } from "../types/weather";

const MapNoSSR = dynamic(() => import("../components/Map"), { ssr: false });

export default function Home() {
  const [coords, setCoords] = useState<Coordinates | null>(null);
  const [city, setCity] = useState<string>("");
  const [geolocationError, setGeolocationError] = useState<string | null>(null);

  const { data, loading, error, refresh } = useWeather(
    coords?.lat,
    coords?.lon,
    city
  );

  const hourlyRef = useRef<HTMLDivElement>(null);
  const dailyRef = useRef<HTMLDivElement>(null);

  const [hourlyWidth, setHourlyWidth] = useState(0);
  const [dailyWidth, setDailyWidth] = useState(0);

  /**
   * Effect for getting user location on mount
   */
  useEffect(() => {
    if (!navigator.geolocation) {
      setGeolocationError("Tu navegador no soporta geolocalización");
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setCoords({
          lat: pos.coords.latitude,
          lon: pos.coords.longitude,
        });
        setGeolocationError(null);
      },
      (err) => {
        console.warn("Geolocation error:", err);
        setGeolocationError("No se pudo obtener tu ubicación. Busca una ciudad manualmente.");
      },
      WEATHER_CONFIG.GEOLOCATION_OPTIONS
    );
  }, []);

  /**
   * Effect for calculating scroll widths for drag animation
   */
  useEffect(() => {
    if (hourlyRef.current) {
      const scrollWidth = hourlyRef.current.scrollWidth;
      const offsetWidth = hourlyRef.current.offsetWidth;
      setHourlyWidth(Math.max(0, scrollWidth - offsetWidth));
    }
    if (dailyRef.current) {
      const scrollWidth = dailyRef.current.scrollWidth;
      const offsetWidth = dailyRef.current.offsetWidth;
      setDailyWidth(Math.max(0, scrollWidth - offsetWidth));
    }
  }, [data?.hourly, data?.daily]);

  /**
   * Handle city search
   */
  const handleSearch = useCallback((searchCity: string) => {
    setCity(searchCity);
    setCoords(null); // Clear coordinates when searching by city
  }, []);

  /**
   * Handle refresh button click
   */
  const handleRefresh = useCallback(async () => {
    await refresh();
  }, [refresh]);

  const scrollContainer = "flex gap-4 snap-x snap-mandatory cursor-grab active:cursor-grabbing";
  const isLoading = loading && !data; // Only show skeleton on initial load

  return (
    <ErrorBoundary>
      <div className="min-h-screen flex flex-col items-center text-white relative font-sans">
        {/* Dynamic Background */}
        <Background weatherMain={data?.current?.condition?.text} />

        {/* Header */}
        <header className="w-full max-w-3xl p-4 mt-6 flex items-center justify-between">
          <h1 className="text-3xl font-semibold tracking-wide">Weather</h1>
          <div className="flex items-center gap-4">
            <motion.button
              onClick={handleRefresh}
              disabled={loading}
              whileHover={!loading ? { rotate: 20 } : {}}
              whileTap={!loading ? { scale: 0.9 } : {}}
              className="p-2 hover:bg-white/10 rounded-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              aria-label="Actualizar"
              title="Actualizar clima"
            >
              <FiRefreshCw size={20} className={loading ? "animate-spin" : ""} />
            </motion.button>
            <div className="text-sm opacity-80 text-right">
              {data?.locationName ?? data?.timezone ?? "Ubicación"}
            </div>
          </div>
        </header>

        {/* Search Bar */}
        <SearchBar onSearch={handleSearch} disabled={loading} />

        <main className="w-full max-w-3xl px-4 mt-4 space-y-6 pb-12">
          {/* Geolocation Error */}
          {geolocationError && !city && (
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-yellow-300 text-sm bg-yellow-500/10 border border-yellow-500/20 rounded-lg p-3"
            >
              {geolocationError}
            </motion.p>
          )}

          {/* Error Message */}
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

          {/* Loading Skeleton */}
          {isLoading && <WeatherPageSkeleton />}

          {/* Current Weather */}
          {!isLoading && data?.current && (
            <WeatherCard data={data.current} type="current" />
          )}

          {/* Hourly Weather */}
          {!isLoading && data?.hourly && data.hourly.length > 0 && (
            <section>
              <h2 className="text-white/90 mb-3 text-lg font-medium tracking-wide">Por hora</h2>
              <motion.div
                ref={hourlyRef}
                className={`${scrollContainer} overflow-hidden`}
                whileTap={{ cursor: "grabbing" }}
              >
                <motion.div
                  drag="x"
                  dragConstraints={{ right: 0, left: -hourlyWidth }}
                  dragElastic={0.2}
                  dragMomentum={true}
                  className="flex gap-4"
                >
                  {data.hourly.slice(0, WEATHER_CONFIG.HOURLY_SLICE_LIMIT).map((h, i) => (
                    <div key={i} className="snap-start flex-shrink-0">
                      <WeatherCard data={h} type="hourly" />
                    </div>
                  ))}
                </motion.div>
              </motion.div>
            </section>
          )}

          {/* Daily Weather */}
          {!isLoading && data?.daily && data.daily.length > 0 && (
            <section className="mb-8">
              <h2 className="text-white/90 mb-3 text-lg font-medium tracking-wide">Por día</h2>
              <motion.div
                ref={dailyRef}
                className={`${scrollContainer} overflow-hidden`}
                whileTap={{ cursor: "grabbing" }}
              >
                <motion.div
                  drag="x"
                  dragConstraints={{ right: 0, left: -dailyWidth }}
                  dragElastic={0.2}
                  dragMomentum={true}
                  className="flex gap-4"
                >
                  {data.daily.slice(0, WEATHER_CONFIG.DAILY_SLICE_LIMIT).map((d, i) => (
                    <div key={i} className="snap-start flex-shrink-0">
                      <WeatherCard data={d} type="daily" />
                    </div>
                  ))}
                </motion.div>
              </motion.div>
            </section>
          )}

          {/* Map - Show when coords are available */}
          {!isLoading && coords && (
            <MapNoSSR lat={coords.lat} lon={coords.lon} />
          )}
        </main>
      </div>
    </ErrorBoundary>
  );
}
