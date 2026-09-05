/**
 * SunArc
 * Amanecer, atardecer y posición del sol en el arco del día.
 * Sustituye a dos horas sueltas en texto: el arco comunica de un vistazo
 * cuánta luz queda.
 */
import { motion } from 'framer-motion';
import React, { memo, useMemo } from 'react';
import { WiMoonAltWaningCrescent4, WiSunrise, WiSunset } from 'react-icons/wi';

import type { AstroData, WeatherAPILocation } from '../types/weather';
import { astroTimeToMinutes, formatAstroTime } from '../utils/weatherUtils';

interface SunArcProps {
  astro: AstroData;
  location: WeatherAPILocation;
}

const WIDTH = 300;
const HEIGHT = 96;
const PAD = 18;

const SunArc = memo(function SunArc({ astro, location }: SunArcProps) {
  const { progress, daylightLabel, hasArc } = useMemo(() => {
    const sunrise = astroTimeToMinutes(astro.sunrise);
    const sunset = astroTimeToMinutes(astro.sunset);

    // En latitudes extremas la API devuelve "No sunrise" / "No sunset":
    // sin dos extremos válidos no hay arco que dibujar.
    if (sunrise < 0 || sunset < 0 || sunset <= sunrise) {
      return { progress: 0, daylightLabel: '', hasArc: false };
    }

    // localtime llega como "YYYY-MM-DD HH:mm" en hora local de la ciudad.
    const clock = location.localtime?.slice(11, 16) ?? '';
    const [h, m] = clock.split(':').map(Number);
    const nowMinutes = Number.isFinite(h) && Number.isFinite(m) ? h * 60 + m : sunrise;

    const span = sunset - sunrise;
    const hours = Math.floor(span / 60);
    const minutes = span % 60;

    return {
      progress: Math.min(1, Math.max(0, (nowMinutes - sunrise) / span)),
      daylightLabel: `${hours} h ${minutes} min de luz`,
      hasArc: true,
    };
  }, [astro.sunrise, astro.sunset, location.localtime]);

  // Semicircunferencia: y = sen(pi * t) invertido al sistema de coordenadas SVG
  const arcWidth = WIDTH - PAD * 2;
  const sunX = PAD + progress * arcWidth;
  const sunY = HEIGHT - PAD - Math.sin(Math.PI * progress) * (HEIGHT - PAD * 2);

  return (
    <motion.section
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: 0.1 }}
      className="rounded-2xl border border-white/12 bg-white/[0.06] p-5 backdrop-blur-md"
      aria-label="Sol y luna"
    >
      <div className="flex items-start justify-between gap-4">
        <div>
          <h2 className="text-sm font-medium uppercase tracking-wider text-white/60">Sol</h2>
          {daylightLabel && <p className="mt-1 text-sm text-white/80">{daylightLabel}</p>}
        </div>
        <p className="flex items-center gap-1.5 text-right text-xs text-white/60">
          <WiMoonAltWaningCrescent4 size={20} aria-hidden="true" />
          <span>
            {astro.moon_phase}
            {typeof astro.moon_illumination === 'number' && ` · ${astro.moon_illumination}%`}
          </span>
        </p>
      </div>

      {hasArc && (
        <svg
          viewBox={`0 0 ${WIDTH} ${HEIGHT}`}
          className="mt-2 w-full"
          role="img"
          aria-label={`El sol sale a las ${formatAstroTime(astro.sunrise)} y se pone a las ${formatAstroTime(astro.sunset)}`}
        >
          <path
            d={`M ${PAD} ${HEIGHT - PAD} Q ${WIDTH / 2} ${-PAD} ${WIDTH - PAD} ${HEIGHT - PAD}`}
            fill="none"
            stroke="rgba(255,255,255,0.22)"
            strokeWidth="2"
            strokeDasharray="4 5"
          />
          <line
            x1={PAD - 6}
            y1={HEIGHT - PAD}
            x2={WIDTH - PAD + 6}
            y2={HEIGHT - PAD}
            stroke="rgba(255,255,255,0.25)"
            strokeWidth="1"
          />
          <circle cx={sunX} cy={sunY} r="12" fill="rgba(255, 214, 120, 0.25)" />
          <circle cx={sunX} cy={sunY} r="5.5" fill="#ffd678" />
        </svg>
      )}

      <div className="mt-1 flex items-center justify-between text-sm">
        <span className="flex items-center gap-1.5 text-white/85">
          <WiSunrise size={22} aria-hidden="true" />
          <span className="tabular-nums">{formatAstroTime(astro.sunrise)}</span>
        </span>
        <span className="flex items-center gap-1.5 text-white/85">
          <span className="tabular-nums">{formatAstroTime(astro.sunset)}</span>
          <WiSunset size={22} aria-hidden="true" />
        </span>
      </div>
    </motion.section>
  );
});

export default SunArc;
