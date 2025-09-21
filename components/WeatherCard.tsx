import React, { FC } from "react";
import { formatTemp, formatHour, formatDay } from "../utils/weatherUtils";
import {
  WiDaySunny,
  WiCloud,
  WiRain,
  WiSnow,
  WiThunderstorm,
  WiFog,
  WiStrongWind,
  WiHumidity,
} from "react-icons/wi";
import { motion } from "framer-motion";

type Condition = {
  text?: string;
};

type WeatherData = {
  temp_c?: number;
  feelslike_c?: number;
  humidity?: number;
  wind_kph?: number;
  condition?: Condition;
  day?: { condition?: Condition; avgtemp_c?: number };
  dt?: number;
};

type WeatherCardProps = {
  data?: WeatherData;
  type?: "current" | "hourly" | "daily";
};

const weatherIcon = (text?: string) => {
  if (!text) return <WiDaySunny size={32} />;
  const t = text.toLowerCase();
  if (t.includes("cloud") || t.includes("nublado")) return <WiCloud size={32} />;
  if (t.includes("rain") || t.includes("drizzle") || t.includes("lluvia")) return <WiRain size={32} />;
  if (t.includes("thunder") || t.includes("tormenta")) return <WiThunderstorm size={32} />;
  if (t.includes("snow") || t.includes("nieve")) return <WiSnow size={32} />;
  if (t.includes("mist") || t.includes("fog") || t.includes("haze") || t.includes("niebla")) return <WiFog size={32} />;
  return <WiDaySunny size={32} />;
};

const WeatherCard: FC<WeatherCardProps> = ({ data, type = "current" }) => {
  if (!data) return null;

  const cardBase =
    "flex-shrink-0 rounded-2xl p-4 text-white shadow-md backdrop-blur-md transition-transform duration-300 hover:scale-105 hover:shadow-xl border border-white/20";

  // Clima actual
  if (type === "current") {
    const w = data.condition;
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className={`max-w-3xl w-full ${cardBase} mt-6 bg-gradient-to-br from-white/5 via-white/10 to-white/5`}
      >
        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          <div>
            <h2 className="text-3xl font-bold flex items-center gap-3">
              {formatTemp(data.temp_c ?? 0)} {weatherIcon(w?.text)}
            </h2>
            <p className="text-sm opacity-90 mt-1">{w?.text ?? "Desconocido"}</p>
            <div className="flex gap-4 mt-2 text-sm opacity-80">
              <span className="flex items-center gap-1">
                <WiHumidity /> {data.humidity ?? 0}%
              </span>
              <span className="flex items-center gap-1">
                <WiStrongWind /> {Math.round(data.wind_kph ?? 0)} km/h
              </span>
            </div>
          </div>
          <div className="text-right">
            <p className="text-sm opacity-80">Sensación</p>
            <p className="text-xl font-semibold">{formatTemp(data.feelslike_c ?? 0)}</p>
          </div>
        </div>
      </motion.div>
    );
  }

  // Hourly o Daily
  const w = type === "daily" ? data.day?.condition || data.condition : data.condition;
  const temp = type === "daily" ? data.day?.avgtemp_c ?? data.temp_c ?? 0 : data.temp_c ?? 0;
  const gradient = "bg-gradient-to-br from-white/5 via-white/10 to-white/5";

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className={`${cardBase} ${gradient} min-h-[180px] min-w-[120px] max-w-[140px] text-center p-3 flex flex-col items-center justify-center mb-4`}
    >
      <div className="flex flex-col justify-between h-full items-center">
        <div className="text-3xl">{weatherIcon(w?.text)}</div>
        <p className="text-sm font-medium opacity-80 mt-1">
          {type === "hourly" ? formatHour(data.dt ?? 0) : formatDay(data.dt ?? 0)}
        </p>
        <div className="text-lg font-semibold mt-1">{formatTemp(temp)}</div>
        <p className="text-xs opacity-70 mt-1">{w?.text ?? "Desconocido"}</p>
      </div>
    </motion.div>
  );
};

export default WeatherCard;
