/**
 * Loading Skeleton Components
 * Displays placeholder UI while data is loading
 */

import React from 'react';
import { motion } from 'framer-motion';

export function CurrentWeatherSkeleton() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="max-w-3xl w-full rounded-2xl p-4 mt-6 bg-gradient-to-br from-white/5 via-white/10 to-white/5 border border-white/20"
    >
      <div className="flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="flex-1">
          <div className="h-10 bg-white/10 rounded-lg w-40 mb-3 animate-pulse" />
          <div className="h-4 bg-white/10 rounded-lg w-32 animate-pulse mb-4" />
          <div className="flex gap-4">
            <div className="h-4 bg-white/10 rounded-lg w-24 animate-pulse" />
            <div className="h-4 bg-white/10 rounded-lg w-24 animate-pulse" />
          </div>
        </div>
        <div className="text-right">
          <div className="h-4 bg-white/10 rounded-lg w-20 mb-2 animate-pulse" />
          <div className="h-8 bg-white/10 rounded-lg w-24 animate-pulse" />
        </div>
      </div>
    </motion.div>
  );
}

export function HourlyWeatherSkeleton() {
  return (
    <section className="mt-6">
      <div className="h-6 bg-white/10 rounded-lg w-24 mb-3 animate-pulse" />
      <div className="flex gap-4 overflow-hidden">
        {Array.from({ length: 6 }).map((_, i) => (
          <div
            key={i}
            className="flex-shrink-0 rounded-2xl p-3 bg-gradient-to-br from-white/5 via-white/10 to-white/5 min-h-[180px] min-w-[120px] max-w-[140px] animate-pulse border border-white/20"
          />
        ))}
      </div>
    </section>
  );
}

export function DailyWeatherSkeleton() {
  return (
    <section className="mt-6 mb-8">
      <div className="h-6 bg-white/10 rounded-lg w-20 mb-3 animate-pulse" />
      <div className="flex gap-4 overflow-hidden">
        {Array.from({ length: 7 }).map((_, i) => (
          <div
            key={i}
            className="flex-shrink-0 rounded-2xl p-3 bg-gradient-to-br from-white/5 via-white/10 to-white/5 min-h-[180px] min-w-[120px] max-w-[140px] animate-pulse border border-white/20"
          />
        ))}
      </div>
    </section>
  );
}

export function WeatherPageSkeleton() {
  return (
    <div className="w-full max-w-3xl px-4 mt-4 space-y-6">
      <CurrentWeatherSkeleton />
      <HourlyWeatherSkeleton />
      <DailyWeatherSkeleton />
    </div>
  );
}
