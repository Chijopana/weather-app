/**
 * TempToggle
 * Segmentado con la unidad activa visible. El boton anterior mostraba siempre
 * "°C / °F", asi que no habia forma de saber en que unidad estabas leyendo.
 */
import React, { FC, memo } from 'react';

import type { TempUnit } from '../types/weather';

interface TempToggleProps {
  unit: TempUnit;
  onToggle: () => void;
}

const UNITS: TempUnit[] = ['C', 'F'];

const TempToggle: FC<TempToggleProps> = memo(function TempToggle({ unit, onToggle }) {
  return (
    <div
      className="flex items-center rounded-lg border border-white/15 bg-white/10 p-0.5 backdrop-blur-md"
      role="group"
      aria-label="Unidad de temperatura"
    >
      {UNITS.map((u) => (
        <button
          key={u}
          type="button"
          onClick={() => {
            if (u !== unit) onToggle();
          }}
          aria-pressed={u === unit}
          className={`rounded-md px-2.5 py-1 text-sm font-medium transition focus:outline-none focus-visible:ring-2 focus-visible:ring-white/60 ${
            u === unit ? 'bg-white/25 text-white' : 'text-white/55 hover:text-white/85'
          }`}
        >
          °{u}
        </button>
      ))}
    </div>
  );
});

export default TempToggle;
