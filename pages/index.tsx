import React, { useEffect, useState, useRef } from "react";
import dynamic from "next/dynamic";
import { motion } from "framer-motion";

import SearchBar from "../components/SearchBar";
import WeatherCard from "../components/WeatherCard";
import Background from "../components/Background";
import { useWeather } from "../hooks/useWeather";

const MapNoSSR = dynamic(() => import("../components/Map"), { ssr: false });

type Coords = { lat: number; lon: number };

export default function Home() {
  const [coords, setCoords] = useState<Coords | null>(null);
  const [city, setCity] = useState<string>("");

  const { data, loading, error, refresh } = useWeather(
    coords?.lat,
    coords?.lon,
    city
  );

  const hourlyRef = useRef<HTMLDivElement>(null);
  const dailyRef = useRef<HTMLDivElement>(null);

  // Obtener ubicación del usuario
  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => setCoords({ lat: pos.coords.latitude, lon: pos.coords.longitude }),
        (err) => console.warn("No se pudo obtener la ubicación:", err.message),
        { enableHighAccuracy: true, maximumAge: 1000 * 60 * 5 }
      );
    }
  }, []);

  // Calcular ancho del scroll para framer-motion
  const [hourlyWidth, setHourlyWidth] = useState(0);
  const [dailyWidth, setDailyWidth] = useState(0);

  useEffect(() => {
    if (hourlyRef.current) {
      setHourlyWidth(hourlyRef.current.scrollWidth - hourlyRef.current.offsetWidth);
    }
    if (dailyRef.current) {
      setDailyWidth(dailyRef.current.scrollWidth - dailyRef.current.offsetWidth);
    }
  }, [data?.hourly, data?.daily]);

  const scrollContainer = "flex gap-4 snap-x snap-mandatory cursor-grab";

  return (
    <div className="min-h-screen flex flex-col items-center text-white relative font-sans">
      {/* Fondo dinámico */}
      <Background weatherMain={data?.current?.condition?.text} />

      {/* Header */}
      <header className="w-full max-w-3xl p-4 mt-6 flex items-center justify-between">
        <h1 className="text-3xl font-semibold tracking-wide">Weather</h1>
        <div className="text-sm opacity-80">{data?.locationName ?? data?.timezone ?? ""}</div>
      </header>

      {/* Buscador */}
      <SearchBar onSearch={(c) => setCity(c)} />

      <main className="w-full max-w-3xl px-4 mt-4 space-y-6">
        {/* Carga y errores */}
        {loading && <p className="text-white/70 animate-pulse">Cargando clima...</p>}
        {error && <p className="text-red-400 font-medium">{error}</p>}

        {/* Clima actual */}
        {data?.current && <WeatherCard data={data.current} type="current" />}

        {/* Clima por horas */}
        {data?.hourly && data.hourly.length > 0 && (
          <section>
            <h4 className="text-white/90 mb-3 text-lg font-medium tracking-wide">Por hora</h4>
            <motion.div ref={hourlyRef} className={`${scrollContainer} overflow-hidden`} whileTap={{ cursor: "grabbing" }}>
              <motion.div drag="x" dragConstraints={{ right: 0, left: -hourlyWidth }} className="flex gap-4">
                {data.hourly.slice(0, 24).map((h, i) => (
                  <div key={i} className="snap-start flex-shrink-0">
                    <WeatherCard data={h} type="hourly" />
                  </div>
                ))}
              </motion.div>
            </motion.div>
          </section>
        )}

        {/* Clima por días */}
        {data?.daily && data.daily.length > 0 && (
          <section className="mb-8">
            <h4 className="text-white/90 mb-3 text-lg font-medium tracking-wide">Por día</h4>
            <motion.div ref={dailyRef} className={`${scrollContainer} overflow-hidden`} whileTap={{ cursor: "grabbing" }}>
              <motion.div drag="x" dragConstraints={{ right: 0, left: -dailyWidth }} className="flex gap-4">
                {data.daily.slice(0, 7).map((d, i) => (
                  <div key={i} className="snap-start flex-shrink-0">
                    <WeatherCard data={d} type="daily" />
                  </div>
                ))}
              </motion.div>
            </motion.div>
          </section>
        )}

        {/* Mapa */}
        {coords && <MapNoSSR lat={coords.lat} lon={coords.lon} />}

        {/* Botones */}
        <div className="flex gap-3 mt-4 justify-center">
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => refresh()}
            className="px-4 py-2 bg-white/20 hover:bg-white/30 rounded-lg backdrop-blur-sm transition-colors font-medium"
          >
            Actualizar
          </motion.button>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => {
              setCity("");
              if (coords) setCoords({ lat: coords.lat, lon: coords.lon });
            }}
            className="px-4 py-2 bg-white/10 hover:bg-white/20 rounded-lg backdrop-blur-sm transition-colors font-medium"
          >
            Volver a mi ubicación
          </motion.button>
        </div>
      </main>
    </div>
  );
}
