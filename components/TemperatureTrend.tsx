/**
 * TemperatureTrend Component
 * Predicción simple de temperatura con regresión lineal sobre las próximas horas.
 * Diferenciador de portfolio: mezcla frontend con un modelito ligero client-side.
 */
import React, { FC, useMemo } from 'react';
import { motion } from 'framer-motion';
import { FiTrendingUp, FiTrendingDown, FiMinus } from 'react-icons/fi';
import { HourlyWeather } from '../types/weather';
import { predictNext } from '../utils/weatherUtils';

interface TemperatureTrendProps {
  hourly: HourlyWeather[];
  unit: 'C' | 'F';
}

const PREDICT_HOURS = 6;
const HISTORY_WINDOW = 12; // usamos las últimas 12h disponibles como entrada del modelo

const TemperatureTrend: FC<TemperatureTrendProps> = ({ hourly, unit }) => {
  const { predicted, trendDirection, sparklinePoints, lastActual, lastPredicted } = useMemo(() => {
  const temps = hourly.slice(0, HISTORY_WINDOW).map((h) => h.temp_c ?? 0);
  if (temps.length < 3) {
    return { predicted: [], trendDirection: 'flat' as const, sparklinePoints: '', lastActual: 0, lastPredicted: 0 };
  }

  const predicted = predictNext(temps, PREDICT_HOURS);
  const delta = predicted[predicted.length - 1] - temps[temps.length - 1];
  const trendDirection = delta > 0.5 ? 'up' : delta < -0.5 ? 'down' : 'flat';

  const allValues = [...temps, ...predicted];
  const min = Math.min(...allValues);
  const max = Math.max(...allValues);
  const range = max - min || 1;

  const width = 240;
  const height = 60;
  const step = width / (allValues.length - 1);

  const sparklinePoints = allValues
    .map((v, i) => {
      const x = i * step;
      const y = height - ((v - min) / range) * height;
      return `${x},${y}`;
    })
    .join(' ');

  return {
    predicted,
    trendDirection,
    sparklinePoints,
    lastActual: temps[temps.length - 1],
    lastPredicted: predicted[predicted.length - 1],
  };
}, [hourly]);

  if (predicted.length === 0) return null;

  const convert = (c: number) => (unit === 'F' ? Math.round((c * 9) / 5 + 32) : Math.round(c));
  const historyLen = Math.min(hourly.length, HISTORY_WINDOW);
  const splitX = ((historyLen - 1) / (historyLen + PREDICT_HOURS - 1)) * 240;

  const TrendIcon = trendDirection === 'up' ? FiTrendingUp : trendDirection === 'down' ? FiTrendingDown : FiMinus;
  const trendColor = trendDirection === 'up' ? 'text-red-300' : trendDirection === 'down' ? 'text-blue-300' : 'text-white/70';
  const trendLabel = trendDirection === 'up' ? 'Subiendo' : trendDirection === 'down' ? 'Bajando' : 'Estable';

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="rounded-2xl p-4 bg-gradient-to-br from-white/5 via-white/10 to-white/5 border border-white/20"
    >
      <div className="flex items-center justify-between mb-3">
  <h3 className="text-sm font-medium opacity-90">Tendencia (próximas {PREDICT_HOURS}h)</h3>
  <span className={`flex items-center gap-1 text-sm font-medium ${trendColor}`}>
    <TrendIcon size={16} /> {trendLabel}
  </span>
</div>

<p className="text-xs opacity-70 mb-2">
  Ahora: {convert(lastActual)}°{unit} → En {PREDICT_HOURS}h: {convert(lastPredicted)}°{unit}
</p>

      <svg viewBox="0 0 240 60" className="w-full h-16" preserveAspectRatio="none">
        {/* Línea divisoria entre histórico y predicción */}
        <line x1={splitX} y1="0" x2={splitX} y2="60" stroke="rgba(255,255,255,0.15)" strokeDasharray="3,3" />
        <polyline
          points={sparklinePoints}
          fill="none"
          stroke="rgba(255,255,255,0.8)"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>

      <p className="text-xs opacity-60 mt-2">
        Estimación basada en regresión lineal sobre las últimas {historyLen}h · dato ilustrativo, no oficial
      </p>
    </motion.div>
  );
};

export default TemperatureTrend;