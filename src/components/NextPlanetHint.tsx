import { motion, AnimatePresence } from 'motion/react';
import type { Planet } from '../data/planets';

interface NextPlanetHintProps {
  planet: Planet;
  activeIndex: number;
  onClick: () => void;
}

export default function NextPlanetHint({ planet, activeIndex, onClick }: NextPlanetHintProps) {
  return (
    <div
      className="absolute top-[14%] md:top-[18%] left-1/2 -translate-x-1/2 text-center tracking-[0.2em] z-20 cursor-pointer opacity-60 hover:opacity-100 transition-opacity pl-[0.2em]"
      onClick={onClick}
    >
      <AnimatePresence mode="wait">
        <motion.div
          key={`next-${activeIndex}`}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          transition={{ duration: 0.8, ease: 'easeInOut', delay: 0.5 }}
        >
          <p className="text-[8px] text-gray-400 mb-1">PLANET</p>
          <h2 className="text-xs text-gray-200">{planet.name}</h2>
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
