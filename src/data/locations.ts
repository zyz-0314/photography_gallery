import type { Location } from "@/types";

/**
 * The geography of the archive. Locations form a small hierarchy:
 *
 *   WORLD
 *   ├── CHINA ────── Hangzhou
 *   └── NEW ZEALAND ── Auckland
 *                    ├── Rotorua
 *                    ├── Taupo
 *                    └── South Island (region)
 *                        ├── Queenstown
 *                        ├── Mount Cook
 *                        ├── Lake Tekapo
 *                        └── Milford Sound
 *
 * Adding a place: append an object, drop the photos in content/photos,
 * run `npm run images`. The map, timeline and location pages update.
 */

export const locations: Location[] = [
  {
    slug: "hangzhou",
    name: "Hangzhou",
    country: "China",
    latitude: 30.2741,
    longitude: 120.1551,
    year: 2025,
    intro:
      "Home. A city of lake, tea and neon — photographed between midnight and morning.",
    coverId: "hangzhou-night-street-01",
    photoIds: [
      "hangzhou-night-street-01",
      "hangzhou-lake-mist-01",
      "hangzhou-umbrella-01",
      "hangzhou-football-01",
      "hangzhou-football-02",
      "hangzhou-football-03",
      "hangzhou-football-04",
      "hangzhou-football-05",
      "hangzhou-temple-01",
      "hangzhou-market-01",
      "hangzhou-kestrel-01",
      "hangzhou-bicycle-01",
    ],
  },
  {
    slug: "auckland",
    name: "Auckland",
    country: "New Zealand",
    latitude: -36.8485,
    longitude: 174.7633,
    year: 2026,
    intro:
      "A month of rain, long walks, unfamiliar streets and unexpected moments.",
    coverId: "auckland-harbour-01",
    photoIds: [
      "auckland-harbour-01",
      "auckland-street-01",
      "auckland-street-02",
      "auckland-wynyard-01",
      "auckland-gulls-01",
      "auckland-skyline-01",
      "auckland-market-01",
      "auckland-regatta-01",
    ],
  },
  {
    slug: "rotorua",
    name: "Rotorua",
    country: "New Zealand",
    latitude: -38.1368,
    longitude: 176.2497,
    year: 2026,
    intro: "The ground is alive here. Steam, sulphur and ancient forests.",
    coverId: "rotorua-geyser-01",
    photoIds: [
      "rotorua-geyser-01",
      "rotorua-terraces-01",
      "rotorua-forest-01",
      "rotorua-tui-01",
      "rotorua-mudpools-01",
    ],
  },
  {
    slug: "taupo",
    name: "Taupo",
    country: "New Zealand",
    latitude: -38.6247,
    longitude: 176.0882,
    year: 2026,
    intro: "A lake the size of a small country, black sand and open water.",
    coverId: "taupo-lake-01",
    photoIds: [
      "taupo-lake-01",
      "taupo-kayak-01",
      "taupo-shore-01",
      "taupo-fisher-01",
      "taupo-huka-01",
    ],
  },
  {
    slug: "south-island",
    name: "South Island",
    country: "New Zealand",
    latitude: -43.9,
    longitude: 170.1,
    year: 2026,
    region: true,
    intro:
      "Mountains, fjords and a light that changes every ten minutes. The island that keeps its own weather.",
    coverId: "queenstown-peaks-01",
    photoIds: [],
  },
  {
    slug: "queenstown",
    name: "Queenstown",
    country: "New Zealand",
    latitude: -45.0312,
    longitude: 168.6626,
    year: 2026,
    parent: "south-island",
    intro: "Adventure town in a mountain bowl, lake on three sides.",
    coverId: "queenstown-peaks-01",
    photoIds: [
      "queenstown-peaks-01",
      "queenstown-paraglide-01",
      "queenstown-street-01",
    ],
  },
  {
    slug: "mount-cook",
    name: "Mount Cook",
    country: "New Zealand",
    latitude: -43.5953,
    longitude: 170.142,
    year: 2026,
    parent: "south-island",
    intro: "The highest mountain in the country, revealed on its own terms.",
    coverId: "mtcook-summit-01",
    photoIds: ["mtcook-summit-01", "mtcook-glacier-01", "mtcook-kea-01"],
  },
  {
    slug: "lake-tekapo",
    name: "Lake Tekapo",
    country: "New Zealand",
    latitude: -44.0042,
    longitude: 170.4727,
    year: 2026,
    parent: "south-island",
    intro: "Turquoise water, a stone church, and the darkest sky I have stood under.",
    coverId: "tekapo-stars-01",
    photoIds: ["tekapo-church-01", "tekapo-stars-01", "tekapo-lupins-01"],
  },
  {
    slug: "milford-sound",
    name: "Milford Sound",
    country: "New Zealand",
    latitude: -44.6726,
    longitude: 167.9284,
    year: 2026,
    parent: "south-island",
    intro: "Rain is not bad weather here. Rain is the weather.",
    coverId: "milford-fjord-01",
    photoIds: [
      "milford-fjord-01",
      "milford-mitre-01",
      "milford-seal-01",
      "milford-waterfall-01",
    ],
  },
];

export const locationBySlug = (slug: string) =>
  locations.find((l) => l.slug === slug);

/** Region + its sub-locations, or the location itself. */
export const locationTree = (slug: string): Location[] => {
  const loc = locationBySlug(slug);
  if (!loc) return [];
  if (loc.region) {
    return [loc, ...locations.filter((l) => l.parent === slug)];
  }
  return [loc];
};

/** All photos belonging to a location (a region includes its children). */
export const photosForLocation = (slug: string): string[] => {
  const tree = locationTree(slug);
  const own = tree.flatMap((l) => l.photoIds);
  // de-duplicate while preserving order
  return [...new Set(own)];
};
