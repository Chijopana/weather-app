import React, { useState } from 'react';
import { FiSearch } from 'react-icons/fi';
import { motion } from 'framer-motion';

type SearchBarProps = {
  onSearch: (city: string) => void;
};

export default function SearchBar({ onSearch }: SearchBarProps) {
  const [value, setValue] = useState('');

  return (
    <motion.div
      className="w-full max-w-3xl p-4 mt-6"
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <form
        onSubmit={(e) => {
          e.preventDefault();
          if (value.trim() !== '') onSearch(value.trim());
        }}
      >
        <div className="flex gap-2">
          <input
            className="flex-1 rounded-xl p-3 bg-white/10 placeholder-white/60 text-white focus:outline-none shadow-md backdrop-blur-sm transition-all focus:ring-2 focus:ring-purple-400"
            placeholder="Buscar ciudad (ej. Barcelona, Madrid, Caracas...)"
            value={value}
            onChange={(e) => setValue(e.target.value)}
          />
          <motion.button
            type="submit"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="flex items-center gap-1 px-4 py-2 bg-white/20 rounded-xl hover:bg-white/30 transition-all shadow-md"
          >
            <FiSearch size={18} />
            Buscar
          </motion.button>
        </div>
      </form>
    </motion.div>
  );
}
