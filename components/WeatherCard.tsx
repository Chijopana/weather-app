/**
 * WeatherCard Component
 * Displays weather information in card format
 * Supports current, hourly, and daily weather display
 */

import React, { FC, memo, useMemo } from "react";
import { formatTempUnit, formatHour, formatDay, getWeatherIcon, getUvInfo, formatAstroTime } from "../utils/weatherUtils";
import { WiStrongWind, WiHumidity, WiSunrise, WiSunset } from "react-icons/wi";
import { motion } from "framer-motion";
import { CurrentWeather, HourlyWeather, DailyWeather, WeatherCardType, AstroData, TempUnit } from "../types/weather";

interface WeatherCardProps {
  data?: CurrentWeather | HourlyWeather | DailyWeather;
  type?: WeatherCardType;
  unit?: TempUnit;
  astro?: AstroData | null;
}

const getConditionText = (
  data: CurrentWeather | HourlyWeather | DailyWeather,
  type: WeatherCardType
): string | undefined => {
  if (type === "daily") {
    const dailyData = data as DailyWeather;
    return dailyData?.day?.condition?.text;
  }
  const weatherData = data as CurrentWeather | HourlyWeather;
  return weatherData?.condition?.text;
};

const getTemperature = (
  data: CurrentWeather | HourlyWeather | DailyWeather,
  type: WeatherCardType
): number => {
  if (type === "daily") {
    const dailyData = data as DailyWeather;
    return dailyData?.day?.avgtemp_c ?? (data as any)?.temp_c ?? 0;
  }
  const weatherData = data as CurrentWeather | HourlyWeather;
  return weatherData?.temp_c ?? 0;
};

const cardBase =
  "flex-shrink-0 rounded-2xl p-4 text-white shadow-md backdrop-blur-md transition-transform duration-300 hover:scale-105 hover:shadow-xl border border-white/20";

const CurrentWeatherCard: FC<{ data: CurrentWeather; unit: TempUnit; astro?: AstroData | null }> = memo(
  ({ data, unit, astro }) => {
    const conditionText = useMemo(() => getConditionText(data, "current"), [data]);
    const uvInfo = useMemo(() => getUvInfo(data.uv), [data.uv]);

    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className={`max-w-3xl w-full ${cardBase} mt-6 bg-gradient-to-br from-white/5 via-white/10 to-white/5`}
      >
        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex-1">
            <h2 className="text-3xl font-bold flex items-center gap-3">
              {formatTempUnit(data.temp_c, unit)}
              <span className="text-4xl">{getWeatherIcon(conditionText)}</span>
            </h2>
            <p className="text-sm opacity-90 mt-1">{conditionText ?? "Desconocido"}</p>
            <div className="flex flex-wrap gap-4 mt-2 text-sm opacity-80">
              <span className="flex items-center gap-1">
                <WiHumidity size={18} /> {data.humidity ?? 0}%
              </span>
              <span className="flex items-center gap-1">
                <WiStrongWind size={18} /> {Math.round(data.wind_kph ?? 0)} km/h
              </span>
              {data.uv !== undefined && (
                <span className="flex items-center gap-1" style={{ color: uvInfo.color }}>
                  UV {Math.round(uvInfo.value)} · {uvInfo.label}
                </span>
              )}
            </div>
            {astro && (
              <div className="flex gap-4 mt-2 text-xs opacity-70">
                <span className="flex items-center gap-1">
                  <WiSunrise size={16} /> {formatAstroTime(astro.sunrise)}
                </span>
                <span className="flex items-center gap-1">
                  <WiSunset size={16} /> {formatAstroTime(astro.sunset)}
                </span>
              </div>
            )}
          </div>
          <div className="text-right">
            <p className="text-sm opacity-80">Sensación térmica</p>
            <p className="text-xl font-semibold">{formatTempUnit(data.feelslike_c, unit)}</p>
          </div>
        </div>
      </motion.div>
    );
  }
);

CurrentWeatherCard.displayName = "CurrentWeatherCard";

const HourlyDailyWeatherCard: FC<{ data: HourlyWeather | DailyWeather; type: "hourly" | "daily"; unit: TempUnit }> = memo(
  ({ data, type, unit }) => {
    const conditionText = useMemo(() => getConditionText(data, type), [data, type]);
    const temperature = useMemo(() => getTemperature(data, type), [data, type]);
    const timeLabel = useMemo(
      () => (type === "hourly" ? formatHour(data.dt ?? 0) : formatDay(data.dt ?? 0)),
      [data, type]
    );

    return (
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className={`${cardBase} bg-gradient-to-br from-white/5 via-white/10 to-white/5 min-h-[180px] min-w-[120px] max-w-[140px] text-center p-3 flex flex-col items-center justify-center mb-4`}
      >
        <div className="flex flex-col justify-between h-full items-center w-full">
          <div className="text-3xl">{getWeatherIcon(conditionText)}</div>
          <p className="text-sm font-medium opacity-80 mt-1">{timeLabel}</p>
          <div className="text-lg font-semibold mt-1">{formatTempUnit(temperature, unit)}</div>
          <p className="text-xs opacity-70 mt-1 break-words">{conditionText ?? "Desconocido"}</p>
        </div>
      </motion.div>
    );
  }
);

HourlyDailyWeatherCard.displayName = "HourlyDailyWeatherCard";

const WeatherCard: FC<WeatherCardProps> = memo(({ data, type = "current", unit = "C", astro }) => {
  if (!data) return null;

  if (type === "current") {
    return <CurrentWeatherCard data={data as CurrentWeather} unit={unit} astro={astro} />;
  }

  return <HourlyDailyWeatherCard data={data} type={type as "hourly" | "daily"} unit={unit} />;
});

WeatherCard.displayName = "WeatherCard";

export default WeatherCard;