/**
 * HourlyForecast
 * Franja de horas próximas con probabilidad de lluvia, un dato que la API ya
 * devolvía (`chance_of_rain`) y la app descartaba.
 */
import { motion } from 'framer-motion';
import React, { memo } from 'react';
import { WiRaindrop } from 'react-icons/wi';

import type { HourWeather, TempUnit } from '../types/weather';
import { formatHour, formatTemp, iconUrl } from '../utils/weatherUtils';
import Carousel from './Carousel';

interface HourlyForecastProps {
  hours: HourWeather[];
  unit: TempUnit;
  timeZone: string;
  /** Epoch actual, para marcar la hora en curso */
  nowEpoch: number;
}

const HourlyForecast = memo(function HourlyForecast({
  hours,
  unit,
  timeZone,
  nowEpoch,
}: HourlyForecastProps) {
  if (hours.length === 0) return null;

  return (
    <motion.section
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: 0.15 }}
    >
      <h2 className="mb-3 text-sm font-medium uppercase tracking-wider text-white/60">
        Próximas horas
      </h2>

      <Carousel ariaLabel="Pronóstico por hora">
        {hours.map((hour, index) => {
          const isNow = index === 0 && hour.time_epoch <= nowEpoch + 3600;
          const rain = hour.chance_of_rain ?? 0;

          return (
            <article
              key={hour.time_epoch}
              className={`flex w-[92px] shrink-0 snap-start flex-col items-center rounded-2xl border p-3 backdrop-blur-md transition-colors ${
                isNow
                  ? 'border-white/40 bg-white/[0.14]'
                  : 'border-white/12 bg-white/[0.06] hover:bg-white/[0.1]'
              }`}
            >
              <p className="text-xs font-medium tabular-nums text-white/75">
                {isNow ? 'Ahora' : formatHour(hour.time_epoch, timeZone)}
              </p>

              {hour.condition?.icon && (
                /* eslint-disable-next-line @next/next/no-img-element -- icono del CDN de la API */
                <img
                  src={iconUrl(hour.condition.icon)}
                  alt={hour.condition.text ?? ''}
                  title={hour.condition.text}
                  width={44}
                  height={44}
                  className="my-1 h-11 w-11"
                  loading="lazy"
                />
              )}

              <p className="text-lg font-semibold tabular-nums">{formatTemp(hour.temp_c, unit)}</p>

              {/* Reservamos el alto siempre, con o sin lluvia, para que las
                  tarjetas no queden desiguales dentro de la franja. */}
              <p
                className={`mt-1 flex h-4 items-center gap-0.5 text-xs tabular-nums ${
                  rain > 0 ? 'text-sky-200' : 'text-transparent'
                }`}
                aria-hidden={rain === 0}
              >
                <WiRaindrop size={16} aria-hidden="true" />
                {rain > 0 ? `${rain}%` : ''}
              </p>
              {rain > 0 && <span className="sr-only">{rain}% de probabilidad de lluvia</span>}
            </article>
          );
        })}
      </Carousel>
    </motion.section>
  );
});

export default HourlyForecast;
