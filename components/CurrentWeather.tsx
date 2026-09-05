/**
 * CurrentWeather
 * Tarjeta principal: la cifra grande manda, el resto se ordena a su alrededor.
 */
import { motion } from 'framer-motion';
import React, { memo } from 'react';
import { WiHumidity, WiRaindrop, WiStrongWind, WiThermometer } from 'react-icons/wi';

import type { DayForecast, TempUnit, WeatherAPILocation, CurrentWeather as Current } from '../types/weather';
import {
  formatLongDate,
  formatTemp,
  formatTempUnit,
  iconUrl,
  windDirectionLabel,
} from '../utils/weatherUtils';

interface CurrentWeatherProps {
  current: Current;
  location: WeatherAPILocation;
  today: DayForecast | null;
  unit: TempUnit;
}

const CurrentWeather = memo(function CurrentWeather({
  current,
  location,
  today,
  unit,
}: CurrentWeatherProps) {
  const place = [location.name, location.region, location.country]
    // La API repite el nombre en `region` para ciudades-estado: se deduplica.
    .filter((part, i, all) => part && all.indexOf(part) === i)
    .join(', ');

  return (
    <motion.section
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.45, ease: 'easeOut' }}
      className="rounded-3xl border border-white/15 bg-white/[0.07] p-6 shadow-xl backdrop-blur-xl sm:p-8"
      aria-label="Clima actual"
    >
      <header className="mb-1">
        <h2 className="text-lg font-medium leading-tight sm:text-xl">{place}</h2>
        <p className="text-sm capitalize text-white/60">
          {formatLongDate(location.localtime_epoch, location.tz_id)}
          {' · '}
          <span className="tabular-nums">{location.localtime?.slice(11) ?? ''}</span> hora local
        </p>
      </header>

      <div className="mt-5 flex flex-wrap items-center justify-between gap-x-6 gap-y-4">
        <div className="flex items-center gap-3">
          {current.condition?.icon && (
            /* eslint-disable-next-line @next/next/no-img-element -- icono remoto
               de tamaño fijo servido por el CDN de la API; next/image aquí solo
               añadiría configuración de dominios sin ganancia real. */
            <img
              src={iconUrl(current.condition.icon)}
              alt=""
              width={72}
              height={72}
              className="h-16 w-16 shrink-0 drop-shadow-lg sm:h-[72px] sm:w-[72px]"
              loading="eager"
            />
          )}
          <div>
            <p className="text-6xl font-light leading-none tracking-tight tabular-nums sm:text-7xl">
              {formatTempUnit(current.temp_c, unit)}
            </p>
            <p className="mt-2 text-base capitalize text-white/85">
              {current.condition?.text ?? 'Sin datos'}
            </p>
          </div>
        </div>

        <dl className="grid grid-cols-2 gap-x-6 gap-y-2 text-sm sm:text-right">
          <dt className="text-white/60">Sensación</dt>
          <dd className="font-medium tabular-nums">{formatTempUnit(current.feelslike_c, unit)}</dd>

          {today && (
            <>
              <dt className="text-white/60">Máx / Mín</dt>
              <dd className="font-medium tabular-nums">
                {formatTemp(today.maxtemp_c, unit)} / {formatTemp(today.mintemp_c, unit)}
              </dd>
            </>
          )}
        </dl>
      </div>

      <ul className="mt-6 grid grid-cols-2 gap-3 border-t border-white/10 pt-5 sm:grid-cols-4">
        <QuickStat
          icon={<WiThermometer size={22} aria-hidden="true" />}
          label="Punto de rocío"
          value={formatTemp(current.dewpoint_c, unit)}
        />
        <QuickStat
          icon={<WiHumidity size={22} aria-hidden="true" />}
          label="Humedad"
          value={`${Math.round(current.humidity ?? 0)}%`}
        />
        <QuickStat
          icon={<WiStrongWind size={22} aria-hidden="true" />}
          label="Viento"
          value={`${Math.round(current.wind_kph ?? 0)} km/h ${windDirectionLabel(current.wind_degree)}`}
        />
        <QuickStat
          icon={<WiRaindrop size={22} aria-hidden="true" />}
          label="Precipitación"
          value={`${(current.precip_mm ?? 0).toFixed(1)} mm`}
        />
      </ul>
    </motion.section>
  );
});

function QuickStat({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
}) {
  return (
    <li className="flex items-center gap-2">
      <span className="text-white/60">{icon}</span>
      <span className="min-w-0">
        <span className="block text-xs text-white/60">{label}</span>
        <span className="block truncate text-sm font-medium tabular-nums">{value}</span>
      </span>
    </li>
  );
}

export default CurrentWeather;
