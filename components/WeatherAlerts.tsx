import React, { FC } from 'react';
import { motion } from 'framer-motion';
import { FiAlertTriangle } from 'react-icons/fi';
import { WeatherAlert } from '../types/weather';

interface WeatherAlertsProps {
  alerts: WeatherAlert[];
}

const WeatherAlerts: FC<WeatherAlertsProps> = ({ alerts }) => {
  if (!alerts || alerts.length === 0) return null;

  return (
    <div className="space-y-2">
      {alerts.map((alert, i) => (
        <motion.div
          key={i}
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-start gap-3 bg-orange-500/15 border border-orange-500/30 rounded-xl p-3"
        >
          <FiAlertTriangle className="text-orange-300 mt-0.5 flex-shrink-0" size={20} />
          <div>
            <p className="font-semibold text-sm text-orange-200">{alert.event || alert.headline}</p>
            <p className="text-xs opacity-80 mt-1">{alert.desc}</p>
          </div>
        </motion.div>
      ))}
    </div>
  );
};

export default WeatherAlerts;