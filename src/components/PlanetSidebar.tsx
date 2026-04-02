import type { Planet } from '../data/planets';

interface PlanetSidebarProps {
  planets: Planet[];
  activeIndex: number;
  onSelect: (index: number) => void;
}

function PlanetDot({ isActive }: { isActive: boolean }) {
  return (
    <div className="relative flex items-center justify-center w-4 h-4">
      <div
        className={`absolute w-3 h-3 rounded-full border transition-all duration-300 ${
          isActive ? 'border-white' : 'border-white opacity-40 group-hover:opacity-80'
        }`}
      />
      {isActive && <div className="absolute w-1.5 h-1.5 bg-white rounded-full" />}
    </div>
  );
}

function PlanetThumbnail({ planet }: { planet: Planet }) {
  return (
    <div
      className="w-6 h-6 rounded-full shadow-inner opacity-50 group-hover:opacity-100 transition-opacity"
      style={{
        background: `radial-gradient(circle at 30% 30%, ${planet.color} 0%, #000 80%)`,
        boxShadow: `inset -2px -2px 4px rgba(0,0,0,0.8), 0 0 4px ${planet.color}40`,
      }}
    />
  );
}

export default function PlanetSidebar({ planets, activeIndex, onSelect }: PlanetSidebarProps) {
  return (
    <div className="absolute left-4 md:left-12 top-1/2 -translate-y-1/2 z-10 flex flex-col gap-4 md:gap-8 scale-75 md:scale-100 origin-left">
      {planets.map((planet, idx) => {
        const isActive = idx === activeIndex;
        return (
          <button
            key={planet.id}
            onClick={() => onSelect(idx)}
            className="flex items-center gap-4 group text-left"
          >
            <PlanetDot isActive={isActive} />

            <div className="flex items-center gap-3">
              {isActive ? (
                <div className="w-8 h-[2px] bg-[#e89c51]" />
              ) : (
                <PlanetThumbnail planet={planet} />
              )}

              <div
                className={`flex flex-col transition-all duration-300 ${
                  isActive ? 'translate-x-2' : ''
                }`}
              >
                <span
                  className={`text-xs tracking-[0.2em] ${
                    isActive ? 'text-white' : 'text-gray-500 group-hover:text-gray-300'
                  }`}
                >
                  {planet.name}
                </span>
                <span
                  className={`text-[9px] tracking-wider ${
                    isActive ? 'text-[#e89c51]' : 'text-gray-700 group-hover:text-gray-500'
                  }`}
                >
                  {planet.distance}
                </span>
              </div>
            </div>
          </button>
        );
      })}
    </div>
  );
}
