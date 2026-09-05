/**
 * Esqueletos de carga.
 * Replican la geometria real de cada bloque para que la pagina no salte cuando
 * llegan los datos. `animate-pulse` se anula bajo prefers-reduced-motion.
 */
import React from 'react';

const shimmer = 'animate-pulse rounded-lg bg-white/10 motion-reduce:animate-none';

export function CurrentWeatherSkeleton() {
  return (
    <div className="rounded-3xl border border-white/15 bg-white/[0.07] p-6 backdrop-blur-xl sm:p-8">
      <div className={`h-5 w-48 ${shimmer}`} />
      <div className={`mt-2 h-4 w-64 ${shimmer}`} />
      <div className="mt-6 flex items-center gap-4">
        <div className={`h-16 w-16 rounded-full ${shimmer}`} />
        <div>
          <div className={`h-14 w-32 ${shimmer}`} />
          <div className={`mt-3 h-4 w-28 ${shimmer}`} />
        </div>
      </div>
      <div className="mt-6 grid grid-cols-2 gap-3 border-t border-white/10 pt-5 sm:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className={`h-9 ${shimmer}`} />
        ))}
      </div>
    </div>
  );
}

export function HourlySkeleton() {
  return (
    <div>
      <div className={`mb-3 h-4 w-32 ${shimmer}`} />
      <div className="flex gap-3 overflow-hidden">
        {Array.from({ length: 8 }).map((_, i) => (
          <div key={i} className={`h-[132px] w-[92px] shrink-0 rounded-2xl ${shimmer}`} />
        ))}
      </div>
    </div>
  );
}

export function DailySkeleton() {
  return (
    <div>
      <div className={`mb-3 h-4 w-32 ${shimmer}`} />
      <div className="space-y-px overflow-hidden rounded-2xl">
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className={`h-[52px] ${shimmer} rounded-none`} />
        ))}
      </div>
    </div>
  );
}

export function WeatherPageSkeleton() {
  return (
    <div className="space-y-6" aria-hidden="true">
      <CurrentWeatherSkeleton />
      <HourlySkeleton />
      <DailySkeleton />
    </div>
  );
}
