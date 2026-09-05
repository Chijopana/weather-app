/**
 * WeatherAlerts
 * Avisos oficiales. El texto completo va plegado: `desc` suele traer varios
 * párrafos de boletín y antes se volcaba entero, empujando el pronóstico fuera
 * de la primera pantalla.
 */
import { motion } from 'framer-motion';
import React, { memo } from 'react';
import { FiAlertTriangle } from 'react-icons/fi';

import type { WeatherAlert } from '../types/weather';

interface WeatherAlertsProps {
  alerts: WeatherAlert[];
}

const WeatherAlerts = memo(function WeatherAlerts({ alerts }: WeatherAlertsProps) {
  if (alerts.length === 0) return null;

  return (
    <section aria-label="Avisos meteorológicos" className="space-y-2">
      {alerts.map((alert, i) => {
        const title = alert.event || alert.headline || 'Aviso meteorológico';
        const body = (alert.desc || '').trim();

        return (
          <motion.article
            key={`${title}-${alert.effective ?? i}`}
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            className="rounded-2xl border border-amber-400/35 bg-amber-500/15 p-4 backdrop-blur-md"
          >
            <div className="flex items-start gap-3">
              <FiAlertTriangle
                size={20}
                className="mt-0.5 shrink-0 text-amber-300"
                aria-hidden="true"
              />
              <div className="min-w-0 flex-1">
                <h3 className="text-sm font-semibold text-amber-100">{title}</h3>
                {alert.severity && (
                  <p className="mt-0.5 text-xs text-amber-200/80">Severidad: {alert.severity}</p>
                )}
                {body && (
                  <details className="group mt-2">
                    <summary className="cursor-pointer select-none text-xs text-amber-200/90 transition hover:text-amber-100">
                      <span className="group-open:hidden">Ver detalle</span>
                      <span className="hidden group-open:inline">Ocultar detalle</span>
                    </summary>
                    <p className="mt-2 whitespace-pre-line text-xs leading-relaxed text-amber-50/85">
                      {body}
                    </p>
                  </details>
                )}
              </div>
            </div>
          </motion.article>
        );
      })}
    </section>
  );
});

export default WeatherAlerts;
