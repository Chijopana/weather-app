import React, { FC } from 'react';
import { motion } from 'framer-motion';
import { TempUnit } from '../types/weather';

interface TempToggleProps {
  unit: TempUnit;
  onToggle: () => void;
}

const TempToggle: FC<TempToggleProps> = ({ unit, onToggle }) => (
  <motion.button
    onClick={onToggle}
    whileTap={{ scale: 0.9 }}
    className="px-3 py-1.5 rounded-lg bg-white/10 hover:bg-white/20 transition-all text-sm font-medium border border-white/20"
    aria-label={`Cambiar a ${unit === 'C' ? 'Fahrenheit' : 'Celsius'}`}
    title="Cambiar unidad de temperatura"
  >
    °C / °F
  </motion.button>
);

export default TempToggle;