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
