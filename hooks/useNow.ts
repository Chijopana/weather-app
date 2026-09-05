import { useEffect, useState } from 'react';

/**
 * Reloj compartido que avanza a intervalos, no en cada render.
 *
 * Calcular `Date.now()` durante el render tiene dos problemas: cambia en cada
 * pasada, con lo que invalida cualquier useMemo que dependa de el, y ademas
 * deja congelados los textos relativos ("actualizado hace 3 min") hasta que
 * algo mas provoque un render.
 *
 * Devuelve segundos epoch. Arranca en 0 y se fija tras el montaje para que el
 * HTML del servidor y el del cliente coincidan durante la hidratacion.
 */
export function useNow(intervalMs = 60_000): number {
  const [now, setNow] = useState(0);

  useEffect(() => {
    const update = () => setNow(Math.floor(Date.now() / 1000));
    update();
    const timer = setInterval(update, intervalMs);
    return () => clearInterval(timer);
  }, [intervalMs]);

  return now;
}
