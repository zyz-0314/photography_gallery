import type { Aspect, Location, Photograph } from "@/types";

/** Best pre-load ratio guess for a photograph: real width/height when known, else the snapped aspect. */
export function photoRatio(photo: {
  width?: number | null;
  height?: number | null;
  aspect: Aspect;
}): string {
  return photo.width && photo.height
    ? `${photo.width}/${photo.height}`
    : photo.aspect;
}

/** Snap a width/height ratio to the nearest standard aspect for layout. */
export function aspectFrom(
  width?: number | null,
  height?: number | null
): Aspect {
  if (width && height) {
    const ratio = width / height;
    const table: [Aspect, number][] = [
      ["1/1", 1],
      ["3/4", 0.75],
      ["4/5", 0.8],
      ["2/3", 2 / 3],
      ["4/3", 4 / 3],
      ["3/2", 1.5],
      ["16/9", 16 / 9],
      ["21/9", 21 / 9],
    ];
    let best: Aspect = "3/2";
    let bestDiff = Infinity;
    for (const [a, v] of table) {
      const d = Math.abs(ratio - v);
      if (d < bestDiff) {
        bestDiff = d;
        best = a;
      }
    }
    return best;
  }
  return "3/2";
}

/** Safe URL/path slug from arbitrary text. */
export function slugify(text: string): string {
  return text
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80) || "photo";
}

/** All photos belonging to a location — a region includes its children. */
export function photosForLocation(
  slug: string,
  locations: Location[],
  photos: Photograph[]
): Photograph[] {
  const loc = locations.find((l) => l.slug === slug);
  if (!loc) return [];
  const slugs = loc.region
    ? [
        slug,
        ...locations.filter((l) => l.parent === slug).map((l) => l.slug),
      ]
    : [slug];
  const set = new Set(slugs);
  return photos.filter((p) => p.locationSlug && set.has(p.locationSlug));
}

/** Compact "LOCATION — COUNTRY · YEAR" parts. */
export const metadataFor = (photo: Photograph) => [
  photo.location,
  photo.country,
  photo.year ? String(photo.year) : "",
];
