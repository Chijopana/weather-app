/**
 * SearchBar
 *
 * Combobox de ciudades con recientes, autocompletado y navegación por teclado.
 *
 * La versión anterior anunciaba `role="combobox"` pero solo respondía al ratón:
 * sin flechas, sin Enter sobre la opción resaltada, sin Escape y sin
 * `aria-activedescendant`. Un lector de pantalla anunciaba una lista que no
 * existía. Aquí el patrón está implementado de verdad.
 */
import { AnimatePresence, motion } from 'framer-motion';
import React, { memo, useCallback, useEffect, useId, useRef, useState } from 'react';
import { FiClock, FiCrosshair, FiSearch, FiX } from 'react-icons/fi';

import { useCitySearch } from '../hooks/useCitySearch';
import { useRecentCities } from '../hooks/useRecentCities';
import type { CitySearchResult } from '../types/weather';

interface SearchBarProps {
  onSearch: (query: string, label: string) => void;
  onLocate: () => void;
  locating?: boolean;
}

interface Option {
  key: string;
  /** Lo que se envía a la API: "lat,lon" es inequívoco; el nombre puede no serlo */
  query: string;
  label: string;
  sublabel?: string;
  recent?: boolean;
}

const SearchBar = memo(function SearchBar({ onSearch, onLocate, locating = false }: SearchBarProps) {
  const [value, setValue] = useState('');
  const [open, setOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState(-1);

  const wrapperRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const listboxId = useId();

  const { results, loading: searching } = useCitySearch(value);
  const { cities: recentCities, addCity, removeCity, clearAll } = useRecentCities();

  const trimmed = value.trim();
  const showingResults = trimmed.length >= 2;

  const options: Option[] = showingResults
    ? results.map((c: CitySearchResult) => ({
        key: `r-${c.id}-${c.lat}-${c.lon}`,
        // Coordenadas en vez del nombre: evita que "Córdoba" resuelva a otro país.
        query: `${c.lat},${c.lon}`,
        label: c.name,
        sublabel: [c.region, c.country].filter(Boolean).join(', '),
      }))
    : recentCities.map((c) => ({ key: `h-${c}`, query: c, label: c, recent: true }));

  // El resaltado se reinicia cuando cambia la lista: mantenerlo apuntaría a una
  // opción distinta de la que el usuario estaba viendo.
  useEffect(() => setActiveIndex(-1), [value, results.length, recentCities.length]);

  useEffect(() => {
    const onPointerDown = (e: MouseEvent | TouchEvent) => {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener('mousedown', onPointerDown);
    document.addEventListener('touchstart', onPointerDown);
    return () => {
      document.removeEventListener('mousedown', onPointerDown);
      document.removeEventListener('touchstart', onPointerDown);
    };
  }, []);

  const commit = useCallback(
    (option: Option) => {
      onSearch(option.query, option.label);
      addCity(option.label);
      setValue('');
      setOpen(false);
      setActiveIndex(-1);
      inputRef.current?.blur();
    },
    [onSearch, addCity]
  );

  const submitFreeText = useCallback(() => {
    if (!trimmed) return;
    onSearch(trimmed, trimmed);
    addCity(trimmed);
    setValue('');
    setOpen(false);
  }, [trimmed, onSearch, addCity]);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Escape') {
      setOpen(false);
      setActiveIndex(-1);
      return;
    }

    if (e.key === 'ArrowDown' || e.key === 'ArrowUp') {
      if (options.length === 0) return;
      e.preventDefault();
      setOpen(true);
      const delta = e.key === 'ArrowDown' ? 1 : -1;
      setActiveIndex((prev) => {
        const next = prev + delta;
        if (next < 0) return options.length - 1;
        if (next >= options.length) return 0;
        return next;
      });
      return;
    }

    if (e.key === 'Enter') {
      e.preventDefault();
      if (activeIndex >= 0 && activeIndex < options.length) commit(options[activeIndex]);
      else submitFreeText();
    }
  };

  const dropdownVisible = open && options.length + (showingResults ? 1 : 0) > 0;

  return (
    <div ref={wrapperRef} className="relative w-full">
      <form
        onSubmit={(e) => {
          e.preventDefault();
          submitFreeText();
        }}
        role="search"
      >
        <div className="flex gap-2">
          <div className="relative flex-1">
            <FiSearch
              size={17}
              aria-hidden="true"
              className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-white/50"
            />
            <input
              ref={inputRef}
              type="text"
              value={value}
              onChange={(e) => {
                setValue(e.target.value);
                setOpen(true);
              }}
              onFocus={() => setOpen(true)}
              onKeyDown={handleKeyDown}
              placeholder="Buscar ciudad…"
              autoComplete="off"
              className="w-full rounded-xl border border-white/15 bg-white/10 py-3 pl-10 pr-3 text-white placeholder-white/50 backdrop-blur-md transition focus:border-white/35 focus:bg-white/15 focus:outline-none focus:ring-2 focus:ring-white/40"
              aria-label="Buscar ciudad"
              role="combobox"
              aria-expanded={dropdownVisible}
              aria-controls={listboxId}
              aria-autocomplete="list"
              aria-activedescendant={
                activeIndex >= 0 && activeIndex < options.length
                  ? `${listboxId}-${activeIndex}`
                  : undefined
              }
            />
          </div>

          <button
            type="button"
            onClick={onLocate}
            disabled={locating}
            title="Usar mi ubicación"
            aria-label="Usar mi ubicación"
            className="flex shrink-0 items-center justify-center rounded-xl border border-white/15 bg-white/10 px-3.5 text-white backdrop-blur-md transition hover:bg-white/20 focus:outline-none focus-visible:ring-2 focus-visible:ring-white/60 disabled:opacity-50"
          >
            <FiCrosshair size={18} className={locating ? 'animate-spin motion-reduce:animate-none' : ''} />
          </button>
        </div>
      </form>

      <AnimatePresence>
        {dropdownVisible && (
          <motion.div
            initial={{ opacity: 0, y: -6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
            transition={{ duration: 0.15 }}
            className="absolute left-0 right-0 z-30 mt-2 overflow-hidden rounded-xl border border-white/15 bg-[#101728]/95 shadow-2xl backdrop-blur-xl"
          >
            {!showingResults && recentCities.length > 0 && (
              <div className="flex items-center justify-between px-4 pb-1 pt-3">
                <span className="text-xs uppercase tracking-wider text-white/50">Recientes</span>
                <button
                  type="button"
                  onClick={clearAll}
                  className="text-xs text-white/50 transition hover:text-white focus:outline-none focus-visible:ring-2 focus-visible:ring-white/60"
                >
                  Borrar todo
                </button>
              </div>
            )}

            {showingResults && searching && options.length === 0 && (
              <p className="px-4 py-3 text-sm text-white/60">Buscando…</p>
            )}
            {showingResults && !searching && options.length === 0 && (
              <p className="px-4 py-3 text-sm text-white/60">
                Sin coincidencias. Pulsa Enter para buscar «{trimmed}» igualmente.
              </p>
            )}

            <ul id={listboxId} role="listbox" aria-label="Sugerencias de ciudades">
              {options.map((option, index) => (
                <li
                  key={option.key}
                  id={`${listboxId}-${index}`}
                  role="option"
                  aria-selected={index === activeIndex}
                  className={`flex items-center ${index === activeIndex ? 'bg-white/15' : ''}`}
                >
                  <button
                    type="button"
                    // onMouseDown, no onClick: el blur del input cierra el
                    // dropdown antes de que el clic llegue a dispararse.
                    onMouseDown={(e) => {
                      e.preventDefault();
                      commit(option);
                    }}
                    onMouseEnter={() => setActiveIndex(index)}
                    className="flex flex-1 items-center gap-2 px-4 py-2.5 text-left text-sm transition hover:bg-white/10"
                  >
                    {option.recent && <FiClock size={14} className="shrink-0 text-white/45" aria-hidden="true" />}
                    <span className="truncate">
                      <span className="font-medium">{option.label}</span>
                      {option.sublabel && <span className="text-white/55">, {option.sublabel}</span>}
                    </span>
                  </button>

                  {option.recent && (
                    <button
                      type="button"
                      onMouseDown={(e) => {
                        e.preventDefault();
                        removeCity(option.label);
                      }}
                      aria-label={`Quitar ${option.label} del historial`}
                      className="px-3 py-2.5 text-white/40 transition hover:text-white focus:outline-none focus-visible:ring-2 focus-visible:ring-white/60"
                    >
                      <FiX size={14} />
                    </button>
                  )}
                </li>
              ))}
            </ul>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
});

export default SearchBar;
