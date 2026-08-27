import type { Collection, Category } from "@/types";

export const collections: Collection[] = [
  {
    slug: "human-stories",
    title: "HUMAN STORIES",
    subtitle: "Portraits, streets and moments between people.",
    posterLine: "People, streets, portraits, the small human moments.",
    coverId: "auckland-street-01",
  },
  {
    slug: "the-land",
    title: "THE LAND",
    subtitle: "Places, landscapes and the atmosphere of the world around us.",
    posterLine: "Landscape, nature, travel, environments.",
    coverId: "milford-fjord-01",
  },
  {
    slug: "motion",
    title: "MOTION",
    subtitle: "Movement, competition, energy and the moment between action.",
    posterLine: "Sports, football, movement, the instant between two actions.",
    coverId: "hangzhou-football-01",
  },
  {
    slug: "wild",
    title: "WILD",
    subtitle: "Life beyond the city.",
    posterLine: "Wildlife, animals, the quiet edges of the land.",
    coverId: "mtcook-kea-01",
  },
];

export const collectionBySlug = (slug: string) =>
  collections.find((c) => c.slug === slug);

export const categoryForSlug = (slug: string): Category | undefined => {
  switch (slug) {
    case "human-stories":
      return "HUMAN STORIES";
    case "the-land":
      return "THE LAND";
    case "motion":
      return "MOTION";
    case "wild":
      return "WILD";
    default:
      return undefined;
  }
};
