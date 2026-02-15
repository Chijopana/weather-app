/**
 * SearchBar Component
 * Search input for city weather lookup
 * Includes form validation and animations
 */

import React, { useState, memo } from 'react';
import { FiSearch } from 'react-icons/fi';
import { motion } from 'framer-motion';

interface SearchBarProps {
  onSearch: (city: string) => void;
  disabled?: boolean;
}

const SearchBar = memo(function SearchBar({ onSearch, disabled = false }: SearchBarProps) {
  const [value, setValue] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    const trimmedValue = value.trim();
    if (!trimmedValue) return;

    setIsSubmitting(true);
    onSearch(trimmedValue);

    // Reset form after submission
    setTimeout(() => {
      setIsSubmitting(false);
      setValue('');
    }, 300);
  };

  return (
    <motion.div
      className="w-full max-w-3xl p-4 mt-6"
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
            disabled={disabled || isSubmitting}
            autoComplete="off"
            type="text"
            aria-label="Buscar ciudad"
          />
          <motion.button
            type="submit"
            whileHover={!disabled && !isSubmitting ? { scale: 1.05 } : {}}
            whileTap={!disabled && !isSubmitting ? { scale: 0.95 } : {}}
            className="flex items-center gap-1 px-4 py-2 bg-white/20 rounded-xl hover:bg-white/30 transition-all shadow-md disabled:opacity-50 disabled:cursor-not-allowed"
            disabled={disabled || isSubmitting || !value.trim()}
            aria-label="Buscar"
          >
            <FiSearch size={18} />
            Buscar
          </motion.button>
        </div>
      </form>
    </motion.div>
  );
});

export default SearchBar;
