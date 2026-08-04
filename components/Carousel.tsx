/**
 * Carousel Component
 * Contenedor arrastrable con navegación por teclado y botones prev/next
 */
import React, { FC, ReactNode, useRef, useState, useEffect, KeyboardEvent } from 'react';
import { motion } from 'framer-motion';
import { FiChevronLeft, FiChevronRight } from 'react-icons/fi';

interface CarouselProps {
  children: ReactNode[];
  itemWidth?: number; // ancho aproximado de cada item + gap, para el scroll por botones
  ariaLabel: string;
}

const Carousel: FC<CarouselProps> = ({ children, itemWidth = 136, ariaLabel }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [dragWidth, setDragWidth] = useState(0);
  const [scrollX, setScrollX] = useState(0);

  useEffect(() => {
    if (containerRef.current) {
      const { scrollWidth, offsetWidth } = containerRef.current;
      setDragWidth(Math.max(0, scrollWidth - offsetWidth));
    }
  }, [children]);

  const scrollBy = (direction: 1 | -1) => {
    const next = Math.min(Math.max(scrollX - direction * itemWidth * 3, -dragWidth), 0);
    setScrollX(next);
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLDivElement>) => {
    if (e.key === 'ArrowRight') {
      e.preventDefault();
      scrollBy(1);
    } else if (e.key === 'ArrowLeft') {
      e.preventDefault();
      scrollBy(-1);
    }
  };

  return (
    <div className="relative group">
      {dragWidth > 0 && (
        <>
          <button
            onClick={() => scrollBy(-1)}
            disabled={scrollX >= 0}
            className="hidden sm:flex absolute left-0 top-1/2 -translate-y-1/2 z-10 items-center justify-center w-8 h-8 rounded-full bg-black/40 hover:bg-black/60 disabled:opacity-0 transition-all -translate-x-3"
            aria-label="Anterior"
          >
            <FiChevronLeft size={18} />
          </button>
          <button
            onClick={() => scrollBy(1)}
            disabled={scrollX <= -dragWidth}
            className="hidden sm:flex absolute right-0 top-1/2 -translate-y-1/2 z-10 items-center justify-center w-8 h-8 rounded-full bg-black/40 hover:bg-black/60 disabled:opacity-0 transition-all translate-x-3"
            aria-label="Siguiente"
          >
            <FiChevronRight size={18} />
          </button>
        </>
      )}

      <div
        ref={containerRef}
        role="region"
        aria-label={ariaLabel}
        tabIndex={0}
        onKeyDown={handleKeyDown}
        className="flex gap-4 snap-x snap-mandatory cursor-grab active:cursor-grabbing overflow-hidden focus:outline-none focus:ring-2 focus:ring-purple-400 rounded-xl"
      >
        <motion.div
          drag="x"
          dragConstraints={{ right: 0, left: -dragWidth }}
          dragElastic={0.2}
          dragMomentum={true}
          animate={{ x: scrollX }}
          transition={{ type: 'spring', stiffness: 300, damping: 30 }}
          onDragEnd={(_, info) => {
            setScrollX((prev) => Math.min(Math.max(prev + info.offset.x, -dragWidth), 0));
          }}
          className="flex gap-4"
        >
          {children}
        </motion.div>
      </div>
    </div>
  );
};

export default Carousel;