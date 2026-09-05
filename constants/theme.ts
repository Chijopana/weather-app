/**
 * Paletas de fondo por condición y por momento del día.
 *
 * Todas las paletas son OSCURAS a propósito. La versión anterior usaba
 * gradientes claros para nieve y niebla (`from-white via-slate-200`) con texto
 * blanco encima: contraste de ~1.1:1, ilegible. Aquí cada paleta mantiene
 * luminancia baja para que el texto blanco cumpla contraste AA, y el color
 * comunica la condición mediante el tinte, no mediante el brillo.
 */

import type { ConditionKind } from '../types/weather';

export interface WeatherTheme {
  /** Colores del gradiente base, de arriba a abajo */
  gradient: [string, string, string];
  /** Color del halo radial (sol / luna / difusión) */
  glow: string;
  /** Color de acento para elementos interactivos y foco */
  accent: string;
  /** Partículas: color de la precipitación */
  particle: string;
}

type Palette = Record<ConditionKind, WeatherTheme>;

const day: Palette = {
  clear: {
    gradient: ['#1e5faa', '#2b83d4', '#67b6e8'],
    glow: 'rgba(255, 224, 130, 0.55)',
    accent: '#ffd479',
    particle: '#ffffff',
  },
  partly: {
    gradient: ['#26588f', '#3f7cb4', '#7fa9cd'],
    glow: 'rgba(255, 226, 165, 0.40)',
    accent: '#ffd479',
    particle: '#ffffff',
  },
  clouds: {
    gradient: ['#3a4a5c', '#546a80', '#7b8fa3'],
    glow: 'rgba(210, 226, 240, 0.28)',
    accent: '#a8c6de',
    particle: '#ffffff',
  },
  fog: {
    gradient: ['#414b53', '#5c686f', '#87919a'],
    glow: 'rgba(226, 232, 236, 0.32)',
    accent: '#b9c6cd',
    particle: '#e8eef2',
  },
  drizzle: {
    gradient: ['#28455f', '#37607f', '#527f9e'],
    glow: 'rgba(160, 200, 230, 0.25)',
    accent: '#8ec5e8',
    particle: '#cfe6f7',
  },
  rain: {
    gradient: ['#1c3446', '#254c68', '#356b8b'],
    glow: 'rgba(140, 190, 225, 0.22)',
    accent: '#7ec0ea',
    particle: '#cfe6f7',
  },
  storm: {
    gradient: ['#1a1a2e', '#2c2450', '#453a72'],
    glow: 'rgba(190, 160, 255, 0.30)',
    accent: '#c4a6ff',
    particle: '#dcd3f7',
  },
  snow: {
    gradient: ['#3d4d63', '#59708c', '#8199b3'],
    glow: 'rgba(235, 245, 255, 0.35)',
    accent: '#cfe4ff',
    particle: '#ffffff',
  },
  sleet: {
    gradient: ['#33465c', '#4a6480', '#6d88a5'],
    glow: 'rgba(215, 235, 250, 0.28)',
    accent: '#bcd8ee',
    particle: '#eaf4ff',
  },
};

const night: Palette = {
  clear: {
    gradient: ['#080d24', '#12204a', '#1e3568'],
    glow: 'rgba(190, 210, 255, 0.35)',
    accent: '#9db8ff',
    particle: '#ffffff',
  },
  partly: {
    gradient: ['#0a1028', '#16234b', '#243a63'],
    glow: 'rgba(180, 200, 245, 0.28)',
    accent: '#9db8ff',
    particle: '#ffffff',
  },
  clouds: {
    gradient: ['#12161f', '#1e2735', '#2f3c4d'],
    glow: 'rgba(180, 195, 215, 0.20)',
    accent: '#9fb2c8',
    particle: '#ffffff',
  },
  fog: {
    gradient: ['#15181c', '#242a30', '#3a434b'],
    glow: 'rgba(210, 220, 228, 0.22)',
    accent: '#aebac4',
    particle: '#dfe6ec',
  },
  drizzle: {
    gradient: ['#0c1722', '#152634', '#213c50'],
    glow: 'rgba(150, 190, 220, 0.20)',
    accent: '#79b3d8',
    particle: '#bcdcf2',
  },
  rain: {
    gradient: ['#080f18', '#101f2c', '#1a3244'],
    glow: 'rgba(130, 175, 210, 0.18)',
    accent: '#6fabd6',
    particle: '#bcdcf2',
  },
  storm: {
    gradient: ['#0a0714', '#180f2e', '#291a49'],
    glow: 'rgba(175, 140, 255, 0.28)',
    accent: '#b18cff',
    particle: '#cfc4ee',
  },
  snow: {
    gradient: ['#141b26', '#232f40', '#374759'],
    glow: 'rgba(220, 235, 255, 0.25)',
    accent: '#b9d4f0',
    particle: '#ffffff',
  },
  sleet: {
    gradient: ['#111a24', '#1e2c3b', '#324454'],
    glow: 'rgba(200, 225, 245, 0.22)',
    accent: '#a8cae6',
    particle: '#e2eef8',
  },
};

/** Tema neutro mientras no hay datos, evita un flash de color equivocado */
export const NEUTRAL_THEME: WeatherTheme = {
  gradient: ['#101728', '#1a2440', '#26375c'],
  glow: 'rgba(160, 180, 220, 0.20)',
  accent: '#8fa8d8',
  particle: '#ffffff',
};

export function getTheme(kind: ConditionKind | null, isDay: boolean): WeatherTheme {
  if (!kind) return NEUTRAL_THEME;
  return (isDay ? day : night)[kind] ?? NEUTRAL_THEME;
}

/** Etiqueta legible de la categoría, para textos alternativos */
export const KIND_LABEL: Record<ConditionKind, string> = {
  clear: 'despejado',
  partly: 'parcialmente nublado',
  clouds: 'nublado',
  fog: 'niebla',
  drizzle: 'llovizna',
  rain: 'lluvia',
  storm: 'tormenta',
  snow: 'nieve',
  sleet: 'aguanieve',
};
