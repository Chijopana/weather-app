import { useState, useEffect, useCallback } from 'react';
import { TempUnit } from '../types/weather';
import { getTempUnit, setTempUnit as persistTempUnit } from '../utils/storage';

export function useTempUnit() {
  const [unit, setUnitState] = useState<TempUnit>('C');

  useEffect(() => {
    setUnitState(getTempUnit());
  }, []);

  const toggleUnit = useCallback(() => {
    setUnitState((prev) => {
      const next = prev === 'C' ? 'F' : 'C';
      persistTempUnit(next);
      return next;
    });
  }, []);

  return { unit, toggleUnit };
}