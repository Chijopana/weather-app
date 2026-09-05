import { useCallback, useEffect, useState } from 'react';

import type { TempUnit } from '../types/weather';
import { getTempUnit, setTempUnit as persist } from '../utils/storage';

/**
 * Unidad de temperatura persistida.
 * El estado arranca en 'C' y se hidrata en un efecto: leer localStorage durante
 * el render provocaria un desajuste de hidratacion con el HTML del servidor.
 */
export function useTempUnit() {
  const [unit, setUnit] = useState<TempUnit>('C');

  useEffect(() => {
    setUnit(getTempUnit());
  }, []);

  const toggleUnit = useCallback(() => {
    setUnit((prev) => {
      const next: TempUnit = prev === 'C' ? 'F' : 'C';
      persist(next);
      return next;
    });
  }, []);

  return { unit, toggleUnit };
}
