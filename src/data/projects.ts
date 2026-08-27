import type { Project } from "@/types";

export const projects: Project[] = [
  {
    slug: "new-zealand",
    number: "01",
    title: "NEW ZEALAND",
    location: "Auckland · Rotorua · Taupo · South Island",
    country: "New Zealand",
    year: 2026,
    categories: ["THE LAND", "MOTION"],
    description:
      "A visual journey through Auckland, Rotorua, Taupo and the South Island. Four weeks, one rental car, and a country that changed its light every ten minutes.",
    coverId: "milford-fjord-01",
    direction: "left",
    photoIds: [
      "auckland-harbour-01",
      "auckland-street-01",
      "rotorua-geyser-01",
      "taupo-lake-01",
      "taupo-kayak-01",
      "queenstown-peaks-01",
      "mtcook-summit-01",
      "tekapo-stars-01",
      "milford-fjord-01",
      "milford-seal-01",
      "auckland-street-02",
      "rotorua-forest-01",
    ],
  },
  {
    slug: "city-after-dark",
    number: "02",
    title: "CITY AFTER DARK",
    location: "Hangzhou",
    country: "China",
    year: 2025,
    categories: ["HUMAN STORIES"],
    description:
      "Hangzhou after the day shift ends — market lights, umbrellas in the rain, and streets that belong to the night.",
    coverId: "hangzhou-night-street-01",
    direction: "right",
    photoIds: [
      "hangzhou-night-street-01",
      "hangzhou-umbrella-01",
      "hangzhou-bicycle-01",
      "hangzhou-market-01",
    ],
  },
  {
    slug: "the-beautiful-game",
    number: "03",
    title: "THE BEAUTIFUL GAME",
    location: "Hangzhou",
    country: "China",
    year: 2025,
    categories: ["MOTION"],
    description:
      "Midnight five-a-side under floodlights. Football played the way it was meant to be — badly, loudly, and for no one's approval.",
    coverId: "hangzhou-football-01",
    direction: "wide",
    photoIds: [
      "hangzhou-football-01",
      "hangzhou-football-02",
      "hangzhou-football-03",
      "hangzhou-football-04",
      "hangzhou-football-05",
    ],
  },
  {
    slug: "southern-wild",
    number: "04",
    title: "SOUTHERN WILD",
    location: "South Island",
    country: "New Zealand",
    year: 2026,
    categories: ["WILD"],
    description:
      "Kea at the car park, seals on the rocks, gulls on empty piers. Life beyond the city, photographed without hurry.",
    coverId: "mtcook-kea-01",
    direction: "right",
    photoIds: [
      "mtcook-kea-01",
      "milford-seal-01",
      "rotorua-tui-01",
      "auckland-gulls-01",
      "hangzhou-kestrel-01",
    ],
  },
];

export const projectBySlug = (slug: string) =>
  projects.find((p) => p.slug === slug);
