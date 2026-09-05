/**
 * DailyForecast
 *
 * Lista de días con barra de rango de temperatura.
 *
 * Antes era un carrusel de tarjetas que solo mostraba la temperatura media.
 * Una lista vertical permite comparar días de un vistazo, y la barra sitúa el
 * mín/máx de cada día dentro del rango de toda la semana: se ve al instante
 * qué día refresca o qué día aprieta el calor.
 */
import { motion } from 'framer-motion';
import React, { memo, useMemo } from 'react';
import { WiRaindrop } from 'react-icons/wi';

import type { ForecastDay, TempUnit } from '../types/weather';
import { formatRelativeDay, formatTemp, iconUrl } from '../utils/weatherUtils';

interface DailyForecastProps {
  days: ForecastDay[];
  unit: TempUnit;
  timeZone: string;
  nowEpoch: number;
}

const DailyForecast = memo(function DailyForecast({
  days,
  unit,
  timeZone,
  nowEpoch,
}: DailyForecastProps) {
  const { weekMin, weekSpan } = useMemo(() => {
    const mins = days.map((d) => d.day.mintemp_c);
    const maxes = days.map((d) => d.day.maxtemp_c);
    const min = Math.min(...mins);
    const max = Math.max(...maxes);
    // Si toda la semana tiene la misma temperatura el span sería 0 y la barra
    // se dividiría por cero: se fuerza un mínimo.
    return { weekMin: min, weekSpan: Math.max(max - min, 1) };
  }, [days]);

  if (days.length === 0) return null;

  return (
    <motion.section
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: 0.2 }}
    >
      <h2 className="mb-3 text-sm font-medium uppercase tracking-wider text-white/60">
        Próximos días
      </h2>

      <ul className="overflow-hidden rounded-2xl border border-white/12 bg-white/[0.06] backdrop-blur-md">
        {days.map((day) => {
          const left = ((day.day.mintemp_c - weekMin) / weekSpan) * 100;
          const width = ((day.day.maxtemp_c - day.day.mintemp_c) / weekSpan) * 100;
          const rain = day.day.daily_chance_of_rain ?? 0;

          return (
            <li
              key={day.date_epoch}
              className="flex items-center gap-3 border-b border-white/8 px-4 py-3 transition-colors last:border-b-0 hover:bg-white/[0.05]"
            >
              <span className="w-16 shrink-0 text-sm font-medium capitalize sm:w-20">
                {formatRelativeDay(day.date_epoch, nowEpoch, timeZone)}
              </span>

              <span className="flex w-12 shrink-0 items-center gap-0.5">
                {day.day.condition?.icon && (
                  /* eslint-disable-next-line @next/next/no-img-element -- icono del CDN de la API */
                  <img
                    src={iconUrl(day.day.condition.icon)}
                    alt={day.day.condition.text ?? ''}
                    title={day.day.condition.text}
                    width={36}
                    height={36}
                    className="h-9 w-9"
                    loading="lazy"
                  />
                )}
              </span>

              <span
                className={`flex w-12 shrink-0 items-center gap-0.5 text-xs tabular-nums ${
                  rain > 0 ? 'text-sky-200' : 'text-transparent'
                }`}
              >
                <WiRaindrop size={15} aria-hidden="true" />
                {rain > 0 ? `${rain}%` : ''}
              </span>

              <span className="w-9 shrink-0 text-right text-sm tabular-nums text-white/60">
                {formatTemp(day.day.mintemp_c, unit)}
              </span>

              <span
                className="relative h-1.5 min-w-[2.5rem] flex-1 overflow-hidden rounded-full bg-white/15"
                role="img"
                aria-label={`Entre ${formatTemp(day.day.mintemp_c, unit)} y ${formatTemp(day.day.maxtemp_c, unit)}`}
              >
                <span
                  className="absolute inset-y-0 rounded-full bg-gradient-to-r from-sky-300 via-amber-200 to-orange-300"
                  style={{ left: `${left}%`, width: `${Math.max(width, 6)}%` }}
                />
              </span>

              <span className="w-9 shrink-0 text-sm font-semibold tabular-nums">
                {formatTemp(day.day.maxtemp_c, unit)}
              </span>
            </li>
          );
        })}
      </ul>
    </motion.section>
  );
});

export default DailyForecast;
