import React, { useMemo } from 'react';
import { weatherToBackground } from '../utils/weatherUtils';
import { motion } from 'framer-motion';
import Particles from 'react-tsparticles';
import type { RecursivePartial, IOptions, MoveDirection } from 'tsparticles';

export default function Background({ weatherMain }: { weatherMain?: string }) {
  const type = weatherToBackground(weatherMain);
  const base = 'fixed inset-0 -z-10 transition-all duration-1000';

  const particlesOptions: RecursivePartial<IOptions> = useMemo(() => ({
    background: { color: { value: 'transparent' } },
    fpsLimit: 60,
    particles: {
      number: { value: type === 'storm' ? 80 : 50 },
      color: { value: '#ffffff' },
      shape: { type: (type === 'rain' || type === 'storm') ? 'line' : 'circle' },
      opacity: { value: 0.3 },
      size: { value: type === 'storm' ? 2 : 1.5 },
      move: {
        enable: true,
        speed: type === 'rain' ? 7 : type === 'storm' ? 10 : 1.5,
        direction: 'bottom' as MoveDirection, // ✅ cast al tipo correcto
        straight: type === 'rain' || type === 'storm',
      },
    },
    interactivity: {
      events: { onHover: { enable: false }, onClick: { enable: false } },
    },
    detectRetina: true,
  }), [type]);

  const gradients: Record<string, string> = {
    clear: 'from-sky-400 via-sky-300 to-indigo-500',
    clouds: 'from-gray-300 via-gray-400 to-gray-600',
    rain: 'from-blue-600 via-blue-500 to-blue-700',
    storm: 'from-purple-800 via-indigo-800 to-black',
    snow: 'from-white via-slate-200 to-slate-400',
    mist: 'from-stone-200 via-stone-300 to-stone-400',
    default: 'from-cyan-400 via-blue-400 to-indigo-600',
  };

  return (
    <motion.div
      key={type}
      className={`${base} bg-gradient-to-b ${gradients[type] || gradients.default}`}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 1.5 }}
    >
      {(type === 'rain' || type === 'storm') && (
        <Particles id="weather-particles" options={particlesOptions} />
      )}
    </motion.div>
  );
}
