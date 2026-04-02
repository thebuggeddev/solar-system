export interface Planet {
  id: string;
  name: string;
  distance: string;
  color: string;
  radius: number;
  description: string;
}

/**
 * Ordered from outermost (Pluto) to innermost (Mercury).
 * This is the UI order used for the sidebar and active index.
 */
export const PLANETS: Planet[] = [
  {
    id: 'pluto',
    name: 'PLUTO',
    distance: '39.5 AU',
    color: '#8B7355',
    radius: 30,
    description:
      'ONCE CONSIDERED THE NINTH PLANET, PLUTO IS A DWARF PLANET IN THE KUIPER BELT. IT HAS A COMPLEX SURFACE WITH MOUNTAINS OF WATER ICE.',
  },
  {
    id: 'neptune',
    name: 'NEPTUNE',
    distance: '30.06 AU',
    color: '#274687',
    radius: 30,
    description:
      'DARK, COLD, AND WHIPPED BY SUPERSONIC WINDS, ICE GIANT NEPTUNE IS THE EIGHTH AND MOST DISTANT PLANET IN OUR SOLAR SYSTEM.',
  },
  {
    id: 'uranus',
    name: 'URANUS',
    distance: '19.18 AU',
    color: '#82b3d1',
    radius: 30,
    description:
      'URANUS IS THE SEVENTH PLANET FROM THE SUN. IT HAS THE THIRD-LARGEST PLANETARY RADIUS AND FOURTH-LARGEST PLANETARY MASS.',
  },
  {
    id: 'saturn',
    name: 'SATURN',
    distance: '9.539 AU',
    color: '#e3cb8f',
    radius: 30,
    description:
      'ADORNED WITH A DAZZLING, COMPLEX SYSTEM OF ICY RINGS, SATURN IS UNIQUE IN OUR SOLAR SYSTEM. IT IS THE SECOND-LARGEST PLANET.',
  },
  {
    id: 'jupiter',
    name: 'JUPITER',
    distance: '5.203 AU',
    color: '#c99b75',
    radius: 30,
    description:
      "JUPITER IS MORE THAN TWICE AS MASSIVE THAN THE OTHER PLANETS OF OUR SOLAR SYSTEM COMBINED. THE GIANT PLANET'S GREAT RED SPOT IS A CENTURIES-OLD STORM.",
  },
  {
    id: 'mars',
    name: 'MARS',
    distance: '1.524 AU',
    color: '#c1440e',
    radius: 30,
    description:
      'MARS IS A DUSTY, COLD, DESERT WORLD WITH A VERY THIN ATMOSPHERE. THERE IS STRONG EVIDENCE MARS WAS - BILLIONS OF YEARS AGO - WETTER AND WARMER.',
  },
  {
    id: 'earth',
    name: 'EARTH',
    distance: '1 AU',
    color: '#4b759e',
    radius: 30,
    description:
      "OUR HOME PLANET IS THE ONLY PLACE WE KNOW OF SO FAR THAT'S INHABITED BY LIVING THINGS. IT'S ALSO THE ONLY PLANET IN OUR SOLAR SYSTEM WITH LIQUID WATER ON THE SURFACE.",
  },
  {
    id: 'venus',
    name: 'VENUS',
    distance: '0.723 AU',
    color: '#e89c51',
    radius: 30,
    description:
      'NAMED FOR THE ROMAN GODDESS OF LOVE AND BEAUTY. IN ANCIENT TIMES, VENUS WAS OFTEN THOUGHT TO BE TWO DIFFERENT STARS, THE EVENING STAR AND THE MORNING STAR.',
  },
  {
    id: 'mercury',
    name: 'MERCURY',
    distance: '0.39 AU',
    color: '#888888',
    radius: 30,
    description:
      "THE SMALLEST PLANET IN OUR SOLAR SYSTEM AND NEAREST TO THE SUN, MERCURY IS ONLY SLIGHTLY LARGER THAN EARTH'S MOON.",
  },
];

/**
 * Scene order is reversed so Mercury (innermost) sits at Z=0
 * and each successive planet is further along the negative Z axis.
 */
export const SCENE_PLANETS = [...PLANETS].reverse();

export const PLANET_SPACING = 400;

const CDN_BASE =
  'https://cdn.jsdelivr.net/gh/jeromeetienne/threex.planets@master/images/';

export const TEXTURE_URLS: Record<string, string> = {
  mercury: CDN_BASE + 'mercurymap.jpg',
  venus: CDN_BASE + 'venusmap.jpg',
  earth: CDN_BASE + 'earthmap1k.jpg',
  mars: CDN_BASE + 'marsmap1k.jpg',
  jupiter: CDN_BASE + 'jupitermap.jpg',
  saturn: CDN_BASE + 'saturnmap.jpg',
  uranus: CDN_BASE + 'uranusmap.jpg',
  neptune: CDN_BASE + 'neptunemap.jpg',
  pluto: CDN_BASE + 'plutomap1k.jpg',
};

export const BUMP_URLS: Record<string, string> = {
  mercury: CDN_BASE + 'mercurybump.jpg',
  venus: CDN_BASE + 'venusbump.jpg',
  earth: CDN_BASE + 'earthbump1k.jpg',
  mars: CDN_BASE + 'marsbump1k.jpg',
  pluto: CDN_BASE + 'plutobump1k.jpg',
};

/** Convert a UI-level planet index to the scene-level index. */
export function toSceneIndex(uiIndex: number): number {
  return SCENE_PLANETS.length - 1 - uiIndex;
}
