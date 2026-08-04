/**
 * Weather Utility Functions
 * Helper functions for weather data formatting and icon mapping
 */

import React from 'react';
import {
  WiDaySunny,
  WiCloud,
  WiRain,
  WiSnow,
  WiThunderstorm,
  WiFog,
} from "react-icons/wi";
import { UV_LEVELS } from '../constants/config';

/**
 * Convierte Celsius a Fahrenheit
 */
export const celsiusToFahrenheit = (c: number): number => (c * 9) / 5 + 32;

/**
 * Formatea temperatura según unidad seleccionada
 */
export const formatTempUnit = (tempC: number | undefined, unit: 'C' | 'F'): string => {
  if (tempC === undefined || tempC === null) return '--';
  const value = unit === 'F' ? celsiusToFahrenheit(tempC) : tempC;
  return `${Math.round(value)}°${unit}`;
};

/**
 * Devuelve color y etiqueta según índice UV
 */
export const getUvInfo = (uv: number | undefined) => {
  const value = uv ?? 0;
  const level = UV_LEVELS.find((l) => value <= l.max) ?? UV_LEVELS[UV_LEVELS.length - 1];
  return { value, label: level.label, color: level.color };
};

/**
 * Formatea hora de string "HH:MM AM/PM" a "HH:MM"
 */
export const formatAstroTime = (time?: string): string => time ?? '--:--';

/**
 * Regresión lineal simple (mínimos cuadrados) sobre puntos (x, y)
 * Devuelve slope (pendiente) e intercept
 */
export const linearRegression = (points: number[]): { slope: number; intercept: number } => {
  const n = points.length;
  if (n < 2) return { slope: 0, intercept: points[0] ?? 0 };

  const xs = points.map((_, i) => i);
  const sumX = xs.reduce((a, b) => a + b, 0);
  const sumY = points.reduce((a, b) => a + b, 0);
  const sumXY = xs.reduce((acc, x, i) => acc + x * points[i], 0);
  const sumXX = xs.reduce((acc, x) => acc + x * x, 0);

  const slope = (n * sumXY - sumX * sumY) / (n * sumXX - sumX * sumX || 1);
  const intercept = (sumY - slope * sumX) / n;

  return { slope, intercept };
};

/**
 * Predice los próximos N valores a partir de una regresión lineal
 */
export const predictNext = (points: number[], count: number): number[] => {
  const { slope, intercept } = linearRegression(points);
  const startX = points.length;
  return Array.from({ length: count }, (_, i) => slope * (startX + i) + intercept);
};

/**
 * Maps weather condition to background type
 */
export const weatherToBackground = (main: string | undefined): string => {
  if (!main) return 'default';
  const m = main.toLowerCase();

  if (m.includes('lluvia') || m.includes('drizzle') || m.includes('rain')) return 'rain';
  if (m.includes('nublado') || m.includes('cloud')) return 'clouds';
  if (m.includes('tormenta') || m.includes('thunderstorm') || m.includes('storm')) return 'storm';
  if (m.includes('nieve') || m.includes('snow')) return 'snow';
  if (m.includes('niebla') || m.includes('mist') || m.includes('fog') || m.includes('haze')) return 'mist';
  if (m.includes('despejado') || m.includes('clear') || m.includes('sunny')) return 'clear';

  return 'default';
};

/**
 * Returns appropriate weather icon component based on condition text
 * @param text - Weather condition text
 * @returns JSX element representing weather icon
 */
export const getWeatherIcon = (text?: string): React.ReactNode => {
  const iconProps = { size: 32 };

  if (!text) return React.createElement(WiDaySunny, iconProps);

  const t = text.toLowerCase();

  if (t.includes("cloud") || t.includes("nublado")) {
    return React.createElement(WiCloud, iconProps);
  }
  if (t.includes("rain") || t.includes("drizzle") || t.includes("lluvia")) {
    return React.createElement(WiRain, iconProps);
  }
  if (t.includes("thunder") || t.includes("tormenta")) {
    return React.createElement(WiThunderstorm, iconProps);
  }
  if (t.includes("snow") || t.includes("nieve")) {
    return React.createElement(WiSnow, iconProps);
  }
  if (t.includes("mist") || t.includes("fog") || t.includes("haze") || t.includes("niebla")) {
    return React.createElement(WiFog, iconProps);
  }

  return React.createElement(WiDaySunny, iconProps);
};

/**
 * Formats temperature to readable string
 * @param t - Temperature in Celsius
 * @returns Formatted temperature string with degree symbol
 */
export const formatTemp = (t: number | undefined): string => {
  if (t === undefined || t === null) return '--';
  return `${Math.round(t)}°C`;
};

/**
 * Formats timestamp to hour format (HH:00)
 * @param dt - Unix timestamp in seconds
 * @returns Formatted hour string
 */
export const formatHour = (dt: number): string => {
  if (!dt) return '--:--';
  const date = new Date(dt * 1000);
  return date.getHours().toString().padStart(2, '0') + ':00';
};

/**
 * Formats timestamp to weekday and date format
 * @param dt - Unix timestamp in seconds
 * @returns Formatted date string (e.g., "lun 15")
 */
export const formatDay = (dt: number): string => {
  if (!dt) return '--';
  const date = new Date(dt * 1000);
  return date.toLocaleDateString('es-ES', {
    weekday: 'short',
    day: 'numeric',
  });
};
