/**
 * SearchBar Component
 * Search input for city weather lookup
 * Includes form validation and animations
 */

import React, { useState, useRef, useEffect, memo } from 'react';
import { FiSearch, FiClock, FiX } from 'react-icons/fi';
import { motion, AnimatePresence } from 'framer-motion';
import { useCitySearch } from '../hooks/useCitySearch';
import { useRecentCities } from '../hooks/useRecentCities';
import { CitySearchResult } from '../types/weather';

interface SearchBarProps {
  onSearch: (city: string) => void;
  disabled?: boolean;
}

const SearchBar = memo(function SearchBar({ onSearch, disabled = false }: SearchBarProps) {
  const [value, setValue] = useState('');
  const [showDropdown, setShowDropdown] = useState(false);
  const wrapperRef = useRef<HTMLDivElement>(null);

  const { results, loading: searching } = useCitySearch(value);
  const { cities: recentCities, addCity, clearAll } = useRecentCities();

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target as Node)) {
        setShowDropdown(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const commitSearch = (city: string) => {
    const trimmed = city.trim();
    if (!trimmed) return;
    onSearch(trimmed);
    addCity(trimmed);
    setValue('');
    setShowDropdown(false);
  };

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    commitSearch(value);
  };

  const handleSelectResult = (city: CitySearchResult) => {
    commitSearch(`${city.name}, ${city.country}`);
  };

  const showRecents = !value && recentCities.length > 0;
  const showResults = value.trim().length >= 2;

  return (
    <motion.div
      ref={wrapperRef}
      className="w-full max-w-3xl p-4 mt-6 relative"
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <form onSubmit={handleSubmit}>
        <div className="flex gap-2">
          <input
            className="flex-1 rounded-xl p-3 bg-white/10 placeholder-white/60 text-white focus:outline-none shadow-md backdrop-blur-sm transition-all focus:ring-2 focus:ring-purple-400 disabled:opacity-50 disabled:cursor-not-allowed"
            placeholder="Buscar ciudad (ej. Barcelona, Madrid, Caracas...)"
            value={value}
            onChange={(e) => setValue(e.target.value)}
            onFocus={() => setShowDropdown(true)}
            disabled={disabled}
            autoComplete="off"
            type="text"
            aria-label="Buscar ciudad"
            role="combobox"
            aria-expanded={showDropdown}
            aria-autocomplete="list"
          />
          <motion.button
            type="submit"
            whileHover={!disabled ? { scale: 1.05 } : {}}
            whileTap={!disabled ? { scale: 0.95 } : {}}
            className="flex items-center gap-1 px-4 py-2 bg-white/20 rounded-xl hover:bg-white/30 transition-all shadow-md disabled:opacity-50 disabled:cursor-not-allowed"
            disabled={disabled || !value.trim()}
            aria-label="Buscar"
          >
            <FiSearch size={18} />
            Buscar
          </motion.button>
        </div>
      </form>

      <AnimatePresence>
        {showDropdown && (showRecents || showResults) && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="absolute left-4 right-4 mt-2 bg-[#1a1a2e]/95 backdrop-blur-md border border-white/20 rounded-xl shadow-lg overflow-hidden z-20"
          >
            {showRecents && (
              <div>
                <div className="flex items-center justify-between px-4 pt-3 pb-1">
                  <span className="text-xs opacity-60">Recientes</span>
                  <button
                    onClick={clearAll}
                    className="text-xs opacity-60 hover:opacity-100 flex items-center gap-1"
                    aria-label="Borrar historial"
                  >
                    <FiX size={12} /> Borrar
                  </button>
                </div>
                {recentCities.map((city) => (
                  <button
                    key={city}
                    onClick={() => commitSearch(city)}
                    className="w-full text-left px-4 py-2 hover:bg-white/10 transition-colors flex items-center gap-2 text-sm"
                  >
                    <FiClock size={14} className="opacity-60" /> {city}
                  </button>
                ))}
              </div>
            )}

            {showResults && (
              <div>
                {searching && (
                  <p className="px-4 py-3 text-sm opacity-60">Buscando...</p>
                )}
                {!searching && results.length === 0 && (
                  <p className="px-4 py-3 text-sm opacity-60">Sin resultados</p>
                )}
                {results.map((r) => (
                  <button
                    key={r.id}
                    onClick={() => handleSelectResult(r)}
                    className="w-full text-left px-4 py-2 hover:bg-white/10 transition-colors text-sm"
                  >
                    <span className="font-medium">{r.name}</span>
                    <span className="opacity-60">, {r.region ? `${r.region}, ` : ''}{r.country}</span>
                  </button>
                ))}
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
});

export default SearchBar;
