/**
 * TemperatureTrend
 *
 * Ajusta una regresión lineal sobre las horas YA TRANSCURRIDAS de hoy, la
 * extrapola 6 horas y la superpone al pronóstico real de la API para esas mismas
 * horas. El interés está en la comparación: cuánto se aleja un modelo ingenuo
 * del pronóstico de verdad.
 *
 * La versión anterior ajustaba la recta sobre las horas FUTURAS del pronóstico y
 * las rotulaba como "las últimas 12h", para luego "predecir" un tramo que la API
 * ya entregaba. Además extrapolaba sin límite, así que una mañana de rápido
 * calentamiento proyectaba temperaturas imposibles.
 *
 * Colores: slots 1 y 2 de la paleta categórica en modo oscuro, verificados con
 * el validador (banda de luminosidad, croma, separación CVD y contraste).
 * El gráfico lleva su propio fondo oscuro fijo para que ese contraste se cumpla
 * sea cual sea el gradiente meteorológico que haya detrás.
 */
import { motion } from 'framer-motion';
import React, { memo, useMemo, useState } from 'react';

import type { HourWeather, TempUnit } from '../types/weather';
import { deltaToUnit, formatHour, linearRegression, rSquared, toUnit } from '../utils/weatherUtils';

interface TemperatureTrendProps {
  hourly: HourWeather[];
  unit: TempUnit;
  timeZone: string;
  nowEpoch: number;
}

const HISTORY_HOURS = 12;
const HORIZON_HOURS = 6;
const MIN_HISTORY = 6;

const W = 320;
const H = 120;
const PAD_X = 8;
const PAD_TOP = 12;
const PAD_BOTTOM = 22;

const SERIES = {
  model: '#3987e5',
  forecast: '#d95926',
  observed: 'rgba(255,255,255,0.72)',
};

const TemperatureTrend = memo(function TemperatureTrend({
  hourly,
  unit,
  timeZone,
  nowEpoch,
}: TemperatureTrendProps) {
  const [hoverIndex, setHoverIndex] = useState<number | null>(null);

  const chart = useMemo(() => {
    const past = hourly.filter((h) => h.time_epoch <= nowEpoch).slice(-HISTORY_HOURS);
    const future = hourly.filter((h) => h.time_epoch > nowEpoch).slice(0, HORIZON_HOURS);

    // De madrugada apenas hay horas transcurridas: sin base suficiente el ajuste
    // no significa nada, así que el módulo no se muestra.
    if (past.length < MIN_HISTORY || future.length < HORIZON_HOURS) return null;

    const observed = past.map((h) => h.temp_c);
    const { slope, intercept } = linearRegression(observed);
    const fit = rSquared(observed);

    // El modelo se ancla al último valor observado en lugar de arrancar en el
    // intercepto: así el salto visual en la juntura no confunde.
    const anchor = slope * (observed.length - 1) + intercept;
    const offset = observed[observed.length - 1] - anchor;

    const modelValues = future.map((_, i) => slope * (observed.length + i) + intercept + offset);
    const forecastValues = future.map((h) => h.temp_c);

    const mae =
      modelValues.reduce((acc, v, i) => acc + Math.abs(v - forecastValues[i]), 0) /
      modelValues.length;

    const all = [...observed, ...modelValues, ...forecastValues];
    const min = Math.min(...all);
    const max = Math.max(...all);
    const span = Math.max(max - min, 1);

    const totalPoints = observed.length + future.length;
    const stepX = (W - PAD_X * 2) / (totalPoints - 1);
    const plotH = H - PAD_TOP - PAD_BOTTOM;

    const x = (i: number) => PAD_X + i * stepX;
    const y = (v: number) => PAD_TOP + plotH - ((v - min) / span) * plotH;

    const toPath = (values: number[], startIndex: number) =>
      values.map((v, i) => `${i === 0 ? 'M' : 'L'} ${x(startIndex + i)} ${y(v)}`).join(' ');

    const lastObservedIndex = observed.length - 1;

    return {
      past,
      future,
      observed,
      modelValues,
      forecastValues,
      fit,
      mae,
      slope,
      x,
      y,
      totalPoints,
      splitX: x(lastObservedIndex),
      observedPath: toPath(observed, 0),
      // Ambas ramas arrancan en el último punto observado para que las líneas
      // salgan del mismo sitio en vez de flotar sueltas.
      modelPath: toPath([observed[lastObservedIndex], ...modelValues], lastObservedIndex),
      forecastPath: toPath([observed[lastObservedIndex], ...forecastValues], lastObservedIndex),
    };
  }, [hourly, nowEpoch]);

  if (!chart) return null;

  const fmt = (c: number) => `${Math.round(toUnit(c, unit))}°`;
  const trend =
    chart.slope > 0.15 ? 'al alza' : chart.slope < -0.15 ? 'a la baja' : 'estable';

  const hovered =
    hoverIndex === null
      ? null
      : hoverIndex < chart.observed.length
        ? {
            epoch: chart.past[hoverIndex].time_epoch,
            observed: chart.observed[hoverIndex],
            model: null as number | null,
            forecast: null as number | null,
          }
        : {
            epoch: chart.future[hoverIndex - chart.observed.length].time_epoch,
            observed: null as number | null,
            model: chart.modelValues[hoverIndex - chart.observed.length],
            forecast: chart.forecastValues[hoverIndex - chart.observed.length],
          };

  const handleMove = (e: React.MouseEvent<SVGSVGElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const ratio = (e.clientX - rect.left) / rect.width;
    const index = Math.round(
      ((ratio * W - PAD_X) / (W - PAD_X * 2)) * (chart.totalPoints - 1)
    );
    setHoverIndex(Math.min(Math.max(index, 0), chart.totalPoints - 1));
  };

  return (
    <motion.section
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: 0.25 }}
      className="rounded-2xl border border-white/12 bg-white/[0.06] p-5 backdrop-blur-md"
      aria-label="Modelo lineal frente al pronóstico"
    >
      <div className="flex flex-wrap items-baseline justify-between gap-2">
        <h2 className="text-sm font-medium uppercase tracking-wider text-white/60">
          Modelo lineal vs. pronóstico
        </h2>
        <p className="text-xs text-white/60">
          Tendencia observada {trend} · R² {chart.fit.toFixed(2)}
        </p>
      </div>

      <p className="mt-1 text-sm text-white/80">
        Extrapolar la recta de las últimas {chart.observed.length} h se desvía{' '}
        <strong className="font-semibold">
          {deltaToUnit(chart.mae, unit).toFixed(1)}°
        </strong>{' '}
        de media respecto al pronóstico de las próximas {HORIZON_HOURS} h.
      </p>

      {/* Leyenda: con dos series la identidad nunca depende solo del color. */}
      <ul className="mt-3 flex flex-wrap gap-x-4 gap-y-1 text-xs text-white/70">
        <LegendItem color={SERIES.observed} label="Observado" />
        <LegendItem color={SERIES.model} label="Modelo lineal" dashed />
        <LegendItem color={SERIES.forecast} label="Pronóstico" />
      </ul>

      <div className="mt-3 rounded-xl bg-[#0b0f18]/55 p-1">
        <svg
          viewBox={`0 0 ${W} ${H}`}
          className="w-full"
          role="img"
          aria-label={`Temperatura observada las últimas ${chart.observed.length} horas y dos proyecciones para las próximas ${HORIZON_HOURS} horas: modelo lineal y pronóstico oficial. Desviación media ${Math.round(chart.mae)} grados.`}
          onMouseMove={handleMove}
          onMouseLeave={() => setHoverIndex(null)}
        >
          {/* Eje base y separador presente/futuro */}
          <line
            x1={PAD_X}
            y1={H - PAD_BOTTOM}
            x2={W - PAD_X}
            y2={H - PAD_BOTTOM}
            stroke="rgba(255,255,255,0.15)"
            strokeWidth="1"
          />
          <line
            x1={chart.splitX}
            y1={PAD_TOP - 6}
            x2={chart.splitX}
            y2={H - PAD_BOTTOM}
            stroke="rgba(255,255,255,0.28)"
            strokeWidth="1"
            strokeDasharray="3 3"
          />
          <text
            x={chart.splitX + 4}
            y={PAD_TOP - 1}
            className="fill-white/55"
            fontSize="8"
          >
            ahora
          </text>

          <path d={chart.observedPath} fill="none" stroke={SERIES.observed} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          <path d={chart.forecastPath} fill="none" stroke={SERIES.forecast} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          <path d={chart.modelPath} fill="none" stroke={SERIES.model} strokeWidth="2" strokeDasharray="5 4" strokeLinecap="round" strokeLinejoin="round" />

          {/* Etiquetas directas en el extremo de cada rama */}
          <EndLabel
            x={chart.x(chart.totalPoints - 1)}
            y={chart.y(chart.forecastValues[chart.forecastValues.length - 1])}
            color={SERIES.forecast}
            text={fmt(chart.forecastValues[chart.forecastValues.length - 1])}
          />
          <EndLabel
            x={chart.x(chart.totalPoints - 1)}
            y={chart.y(chart.modelValues[chart.modelValues.length - 1])}
            color={SERIES.model}
            text={fmt(chart.modelValues[chart.modelValues.length - 1])}
          />

          {hoverIndex !== null && (
            <line
              x1={chart.x(hoverIndex)}
              y1={PAD_TOP - 6}
              x2={chart.x(hoverIndex)}
              y2={H - PAD_BOTTOM}
              stroke="rgba(255,255,255,0.45)"
              strokeWidth="1"
            />
          )}
        </svg>
      </div>

      {/* Tooltip fuera del SVG: así no se recorta ni hereda el escalado del viewBox */}
      <p className="mt-2 h-5 text-xs tabular-nums text-white/75">
        {hovered && (
          <>
            <span className="font-medium">{formatHour(hovered.epoch, timeZone)}</span>
            {hovered.observed !== null && <> · observado {fmt(hovered.observed)}</>}
            {hovered.model !== null && <> · modelo {fmt(hovered.model)}</>}
            {hovered.forecast !== null && <> · pronóstico {fmt(hovered.forecast)}</>}
          </>
        )}
      </p>

      <details className="mt-1 text-xs text-white/60">
        <summary className="cursor-pointer select-none hover:text-white/85">
          Ver los datos en tabla
        </summary>
        <table className="mt-2 w-full text-left tabular-nums">
          <thead className="text-white/50">
            <tr>
              <th scope="col" className="py-1 font-normal">Hora</th>
              <th scope="col" className="py-1 font-normal">Modelo</th>
              <th scope="col" className="py-1 font-normal">Pronóstico</th>
            </tr>
          </thead>
          <tbody>
            {chart.future.map((h, i) => (
              <tr key={h.time_epoch} className="border-t border-white/10">
                <th scope="row" className="py-1 font-normal">{formatHour(h.time_epoch, timeZone)}</th>
                <td className="py-1">{fmt(chart.modelValues[i])}</td>
                <td className="py-1">{fmt(chart.forecastValues[i])}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </details>

      <p className="mt-2 text-xs text-white/50">
        Ejercicio ilustrativo: una recta sobre 12 puntos no es un modelo
        meteorológico. Para decidir si sacar paraguas, mira el pronóstico.
      </p>
    </motion.section>
  );
});

function LegendItem({ color, label, dashed }: { color: string; label: string; dashed?: boolean }) {
  return (
    <li className="flex items-center gap-1.5">
      <span
        aria-hidden="true"
        className="inline-block h-0.5 w-4 rounded-full"
        style={
          dashed
            ? { backgroundImage: `repeating-linear-gradient(to right, ${color} 0 5px, transparent 5px 9px)` }
            : { backgroundColor: color }
        }
      />
      {label}
    </li>
  );
}

function EndLabel({ x, y, color, text }: { x: number; y: number; color: string; text: string }) {
  return (
    <>
      <circle cx={x} cy={y} r="4" fill={color} stroke="#0b0f18" strokeWidth="2" />
      <text x={x - 6} y={y - 7} textAnchor="end" fontSize="9" className="fill-white">
        {text}
      </text>
    </>
  );
}

export default TemperatureTrend;
