/**
 * Background
 *
 * Fondo dinámico: gradiente según condición y momento del día, halo radial que
 * insinúa el sol o la luna, y partículas de precipitación cuando corresponde.
 *
 * Las partículas se desactivan si el usuario pide movimiento reducido y si la
 * condición no es de precipitación: antes se montaba el motor de tsparticles
 * (un bundle nada pequeño) también para "nublado", donde no se veía nada.
 */
import dynamic from 'next/dynamic';
import React, { memo, useEffect, useMemo } from 'react';
import type { MoveDirection } from 'tsparticles-engine';

import { getTheme } from '../constants/theme';
import { useReducedMotion } from '../hooks/useReducedMotion';
import type { ConditionKind } from '../types/weather';
import { hasPrecipitation } from '../utils/weatherUtils';

const Particles = dynamic(() => import('react-tsparticles'), { ssr: false });

interface BackgroundProps {
  kind: ConditionKind | null;
  isDay: boolean;
}

const Background = memo(function Background({ kind, isDay }: BackgroundProps) {
  const reducedMotion = useReducedMotion();
  const theme = getTheme(kind, isDay);

  const showParticles = !reducedMotion && kind !== null && hasPrecipitation(kind);
  const isSnowy = kind === 'snow' || kind === 'sleet';

  const particlesOptions = useMemo(
    () => ({
      fullScreen: { enable: false },
      background: { color: { value: 'transparent' } },
      fpsLimit: 60,
      particles: {
        number: {
          value: kind === 'storm' ? 90 : isSnowy ? 70 : 60,
          density: { enable: true, area: 900 },
        },
        color: { value: theme.particle },
        shape: { type: isSnowy ? 'circle' : 'line' },
        opacity: { value: isSnowy ? 0.7 : 0.35 },
        size: { value: isSnowy ? 2.5 : kind === 'storm' ? 2 : 1.5 },
        move: {
          enable: true,
          speed: isSnowy ? 1.5 : kind === 'storm' ? 11 : kind === 'drizzle' ? 4 : 8,
          direction: 'bottom' as MoveDirection,
          straight: !isSnowy,
          drift: isSnowy ? 0.4 : 0,
        },
      },
      interactivity: { events: { onHover: { enable: false }, onClick: { enable: false } } },
      detectRetina: true,
    }),
    [kind, isSnowy, theme.particle]
  );

  const [top, mid, bottom] = theme.gradient;

  // El lienzo (html) toma el color inferior del degradado. Asi, cualquier zona
  // que esta capa no llegue a cubrir -rebote de scroll, barra de direcciones
  // replegandose en movil- queda del mismo color en lugar de contrastar.
  useEffect(() => {
    const root = document.documentElement;
    root.style.setProperty('--wx-bottom', bottom);
    root.style.setProperty('--wx-top', top);
  }, [top, bottom]);

  return (
    // `z-0` con el contenido en `z-10`, en vez de un z-index negativo: los
    // valores negativos pueden colarse por detras del lienzo segun como se
    // formen los contextos de apilamiento.
    <div className="fixed inset-0 z-0 overflow-hidden" aria-hidden="true">
      {/* Gradiente base. La transición larga hace que el cambio de ciudad o el
          paso día/noche se sienta como una disolvencia, no como un corte. */}
      <div
        className="absolute inset-0 transition-[background] duration-1000 ease-out motion-reduce:transition-none"
        style={{ background: `linear-gradient(to bottom, ${top} 0%, ${mid} 55%, ${bottom} 100%)` }}
      />

      {/* Halo del astro, arriba a la derecha */}
      <div
        className="absolute -right-24 -top-24 h-[28rem] w-[28rem] rounded-full blur-3xl transition-colors duration-1000 motion-reduce:transition-none"
        style={{ background: `radial-gradient(circle, ${theme.glow} 0%, transparent 70%)` }}
      />

      {/* Segundo halo, más tenue, para que el degradado no se vea plano */}
      <div
        className="absolute -bottom-32 -left-20 h-[24rem] w-[24rem] rounded-full blur-3xl opacity-60 transition-colors duration-1000 motion-reduce:transition-none"
        style={{ background: `radial-gradient(circle, ${theme.glow} 0%, transparent 70%)` }}
      />

      {showParticles && (
        <Particles
          id="weather-particles"
          className="absolute inset-0"
          options={particlesOptions}
        />
      )}

      {/* Viñeta inferior: asienta el contenido y sube el contraste del texto
          sobre las paletas más claras (niebla, nieve de día). */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/35 via-transparent to-black/10" />
    </div>
  );
});

export default Background;
