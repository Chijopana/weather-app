/**
 * Carousel
 *
 * Scroll horizontal nativo con snap, más botones de avance en escritorio.
 *
 * La versión anterior emulaba el scroll con `drag` de framer-motion sobre un
 * contenedor `overflow-hidden`. Eso rompía el gesto táctil nativo, ignoraba la
 * rueda horizontal del trackpad, dejaba el desplazamiento desincronizado al
 * redimensionar la ventana y volvía el contenido inalcanzable para lectores de
 * pantalla. El scroll nativo trae todo eso resuelto y sin JavaScript.
 */
import React, { FC, ReactNode, useCallback, useEffect, useRef, useState } from 'react';
import { FiChevronLeft, FiChevronRight } from 'react-icons/fi';

interface CarouselProps {
  children: ReactNode;
  ariaLabel: string;
}

const Carousel: FC<CarouselProps> = ({ children, ariaLabel }) => {
  const scrollerRef = useRef<HTMLDivElement>(null);
  const [atStart, setAtStart] = useState(true);
  const [atEnd, setAtEnd] = useState(true);

  const syncEdges = useCallback(() => {
    const el = scrollerRef.current;
    if (!el) return;
    // 1px de tolerancia: el scroll fraccionario de algunos zooms nunca llega
    // exactamente al final y dejaría el botón habilitado para siempre.
    setAtStart(el.scrollLeft <= 1);
    setAtEnd(el.scrollLeft >= el.scrollWidth - el.clientWidth - 1);
  }, []);

  useEffect(() => {
    const el = scrollerRef.current;
    if (!el) return undefined;

    syncEdges();
    el.addEventListener('scroll', syncEdges, { passive: true });

    // Recalcula al cambiar el tamaño del contenedor o del contenido, no solo
    // al montar: rotar el móvil o abrir las herramientas de desarrollo cambiaba
    // los límites y los botones se quedaban mintiendo.
    const observer = new ResizeObserver(syncEdges);
    observer.observe(el);
    for (const child of Array.from(el.children)) observer.observe(child);

    return () => {
      el.removeEventListener('scroll', syncEdges);
      observer.disconnect();
    };
  }, [syncEdges, children]);

  const scrollByPage = (direction: 1 | -1) => {
    const el = scrollerRef.current;
    if (!el) return;
    el.scrollBy({ left: direction * el.clientWidth * 0.8, behavior: 'smooth' });
  };

  const hasOverflow = !(atStart && atEnd);

  return (
    <div className="relative">
      {hasOverflow && (
        <>
          <ArrowButton
            side="left"
            disabled={atStart}
            onClick={() => scrollByPage(-1)}
            label="Desplazar a la izquierda"
          />
          <ArrowButton
            side="right"
            disabled={atEnd}
            onClick={() => scrollByPage(1)}
            label="Desplazar a la derecha"
          />
        </>
      )}

      <div
        ref={scrollerRef}
        role="group"
        aria-label={ariaLabel}
        tabIndex={0}
        className="scrollbar-hide flex snap-x snap-mandatory gap-3 overflow-x-auto scroll-smooth rounded-2xl pb-1 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/70 motion-reduce:scroll-auto"
      >
        {children}
      </div>
    </div>
  );
};

function ArrowButton({
  side,
  disabled,
  onClick,
  label,
}: {
  side: 'left' | 'right';
  disabled: boolean;
  onClick: () => void;
  label: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      aria-label={label}
      className={`absolute top-1/2 z-10 hidden h-9 w-9 -translate-y-1/2 items-center justify-center rounded-full border border-white/20 bg-black/45 text-white backdrop-blur-sm transition hover:bg-black/65 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/70 disabled:pointer-events-none disabled:opacity-0 sm:flex ${
        side === 'left' ? '-left-3' : '-right-3'
      }`}
    >
      {side === 'left' ? <FiChevronLeft size={18} /> : <FiChevronRight size={18} />}
    </button>
  );
}

export default Carousel;
