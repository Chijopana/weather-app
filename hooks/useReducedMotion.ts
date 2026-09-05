import { useEffect, useState } from 'react';

/**
 * Refleja la preferencia del sistema `prefers-reduced-motion`.
 * La app la usa para desactivar particulas y acortar transiciones: animaciones
 * continuas de pantalla completa pueden provocar mareo o migrana.
 */
export function useReducedMotion(): boolean {
  const [reduced, setReduced] = useState(false);

  useEffect(() => {
    const media = window.matchMedia('(prefers-reduced-motion: reduce)');
    setReduced(media.matches);

    const onChange = (e: MediaQueryListEvent) => setReduced(e.matches);
    media.addEventListener('change', onChange);
    return () => media.removeEventListener('change', onChange);
  }, []);

  return reduced;
}
