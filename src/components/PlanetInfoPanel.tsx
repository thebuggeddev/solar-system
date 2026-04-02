import { motion, AnimatePresence } from 'motion/react';
import type { Planet } from '../data/planets';

interface PlanetInfoPanelProps {
  planet: Planet;
  activeIndex: number;
}

export default function PlanetInfoPanel({ planet, activeIndex }: PlanetInfoPanelProps) {
  return (
    <div className="absolute bottom-8 md:bottom-16 left-1/2 -translate-x-1/2 text-center z-10 w-full max-w-2xl px-4 md:px-6">
      <AnimatePresence mode="wait">
        <motion.div
          key={`info-${activeIndex}`}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          transition={{ duration: 0.8, ease: 'easeInOut', delay: 0.5 }}
        >
          <p className="text-[8px] md:text-[10px] tracking-[0.3em] text-[#e89c51] mb-1 md:mb-2 pl-[0.3em]">
            PLANET
          </p>
          <h2 className="text-4xl md:text-6xl tracking-[0.4em] font-thin mb-4 md:mb-6 pl-[0.4em]">
            {planet.name}
          </h2>

          <p className="text-[10px] md:text-xs leading-loose tracking-[0.2em] text-gray-300 max-w-xl mx-auto mb-6 md:mb-8 pl-[0.2em]">
            {planet.description}
          </p>

          <button className="text-[8px] md:text-[10px] tracking-[0.3em] text-[#e89c51] uppercase border-b border-[#e89c51] pb-1 hover:text-white hover:border-white transition-colors pl-[0.3em]">
            READ MORE
          </button>
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
