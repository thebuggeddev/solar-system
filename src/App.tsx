/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect } from 'react';
import { PLANETS } from './data/planets';
import PlanetScene from './components/PlanetScene';
import PlanetInfoPanel from './components/PlanetInfoPanel';
import PlanetSidebar from './components/PlanetSidebar';
import NextPlanetHint from './components/NextPlanetHint';

const TRANSITION_DURATION_MS = 2200;

export default function App() {
  const [activeIndex, setActiveIndex] = useState(7);
  const [isTransitioning, setIsTransitioning] = useState(false);

  useEffect(() => {
    setIsTransitioning(true);
    const timer = setTimeout(() => setIsTransitioning(false), TRANSITION_DURATION_MS);
    return () => clearTimeout(timer);
  }, [activeIndex]);

  const activePlanet = PLANETS[activeIndex];
  const hasPreviousPlanet = activeIndex > 0;

  return (
    <div className="relative w-full h-screen overflow-hidden bg-black text-white font-sans selection:bg-orange-500/30 select-none">
      <PlanetScene activeIndex={activeIndex} onPlanetChange={setActiveIndex} />

      {/* Header */}
      <div className="absolute top-[4%] md:top-[6%] left-1/2 -translate-x-1/2 text-center tracking-[0.4em] z-10 pl-[0.4em]">
        <h1 className="text-[10px] md:text-sm font-light text-gray-200">SOLAR EXPLORER</h1>
        <p className="text-[8px] md:text-[10px] text-[#e89c51] mt-1 md:mt-2">IN ONLY THREE.JS</p>
      </div>

      {/* Shadow overlay between the "next" planet and the active planet label */}
      {hasPreviousPlanet && (
        <div
          className={`absolute left-0 right-0 z-10 pointer-events-none transition-opacity ${
            isTransitioning ? 'opacity-0 duration-0' : 'opacity-100 duration-1000'
          }`}
          style={{
            top: '16%',
            height: '34%',
            background:
              'linear-gradient(to bottom, rgba(0,0,0,0) 0%, rgba(0,0,0,1) 70%, rgba(0,0,0,1) 100%)',
          }}
        />
      )}

      {/* Clickable hint showing the next planet above the horizon */}
      {hasPreviousPlanet && (
        <NextPlanetHint
          planet={PLANETS[activeIndex - 1]}
          activeIndex={activeIndex}
          onClick={() => setActiveIndex(activeIndex - 1)}
        />
      )}

      <PlanetInfoPanel planet={activePlanet} activeIndex={activeIndex} />

      <PlanetSidebar planets={PLANETS} activeIndex={activeIndex} onSelect={setActiveIndex} />
    </div>
  );
}
