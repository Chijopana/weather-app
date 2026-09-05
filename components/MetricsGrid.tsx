/**
 * MetricsGrid
 * Índices y medidas secundarias que la API ya devolvía y la app no mostraba:
 * UV, calidad del aire, presión, visibilidad, ráfagas y nubosidad.
 */
import { motion } from 'framer-motion';
import React, { memo } from 'react';

import type { CurrentWeather } from '../types/weather';
import { getAqiInfo, getUvInfo } from '../utils/weatherUtils';

interface MetricsGridProps {
  current: CurrentWeather;
}

interface Metric {
  label: string;
  value: string;
  detail?: string;
  color?: string;
  /** 0-1: rellena la barra inferior de la tarjeta */
  fill?: number;
}

const MetricsGrid = memo(function MetricsGrid({ current }: MetricsGridProps) {
  const uv = getUvInfo(current.uv);
  const aqi = getAqiInfo(current.air_quality?.['us-epa-index']);

  const metrics: Metric[] = [
    {
      label: 'Índice UV',
      value: String(Math.round(uv.value)),
      detail: uv.label,
      color: uv.color,
      fill: Math.min(uv.value / 11, 1),
    },
    ...(aqi
      ? [
          {
            label: 'Calidad del aire',
            value: String(aqi.value),
            detail: aqi.label,
            color: aqi.color,
            fill: aqi.value / 6,
          },
        ]
      : []),
    {
      label: 'Presión',
      value: `${Math.round(current.pressure_mb ?? 0)}`,
      detail: 'hPa',
    },
    {
      label: 'Visibilidad',
      value: `${Math.round(current.vis_km ?? 0)}`,
      detail: 'km',
      fill: Math.min((current.vis_km ?? 0) / 10, 1),
    },
    {
      label: 'Ráfagas',
      value: `${Math.round(current.gust_kph ?? 0)}`,
      detail: 'km/h',
    },
    {
      label: 'Nubosidad',
      value: `${Math.round(current.cloud ?? 0)}%`,
      fill: (current.cloud ?? 0) / 100,
    },
  ];

  return (
    <motion.section
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: 0.05 }}
      aria-label="Detalles del clima"
    >
      <h2 className="mb-3 text-sm font-medium uppercase tracking-wider text-white/60">Detalles</h2>
      <ul className="grid grid-cols-2 gap-3 sm:grid-cols-3">
        {metrics.map((m) => (
          <li
            key={m.label}
            className="rounded-2xl border border-white/12 bg-white/[0.06] p-4 backdrop-blur-md"
          >
            <p className="text-xs text-white/60">{m.label}</p>
            <p className="mt-1 flex items-baseline gap-1.5">
              <span
                className="text-2xl font-semibold tabular-nums"
                style={m.color ? { color: m.color } : undefined}
              >
                {m.value}
              </span>
              {m.detail && <span className="text-xs text-white/70">{m.detail}</span>}
            </p>
            {m.fill !== undefined && (
              <div className="mt-2.5 h-1 overflow-hidden rounded-full bg-white/15">
                <div
                  className="h-full rounded-full transition-[width] duration-500 motion-reduce:transition-none"
                  style={{
                    width: `${Math.max(2, Math.min(100, m.fill * 100))}%`,
                    backgroundColor: m.color ?? 'rgba(255,255,255,0.65)',
                  }}
                />
              </div>
            )}
          </li>
        ))}
      </ul>
    </motion.section>
  );
});

export default MetricsGrid;
