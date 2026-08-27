"use client";

import type { Collection, Photograph } from "@/types";
import { Reveal } from "@/components/ui/Reveal";
import { PosterCollectionCard } from "./PosterCollectionCard";

/**
 * The home collections section — a compact jigsaw mosaic of the five
 * collections, 2–3 tiles per row. Covers keep their true ratio, so the
 * staggered tile heights read as a mosaic rather than a rigid grid.
 */
export function PosterCollection({
  collections,
  photos,
}: {
  collections: Collection[];
  photos: Photograph[];
}) {
  const coverBySlug = new Map(photos.map((p) => [p.slug, p]));

  const counts = new Map<string, number>();
  for (const photo of photos) {
    for (const c of photo.categories) {
      counts.set(c, (counts.get(c) ?? 0) + 1);
    }
  }

  return (
    <div className="mx-auto grid max-w-[1120px] grid-cols-2 items-start gap-4 sm:gap-5 md:grid-cols-3">
      {collections.map((collection, i) => (
        <Reveal key={collection.slug} delay={i * 0.05} className="min-w-0">
          <PosterCollectionCard
            collection={collection}
            cover={coverBySlug.get(collection.coverId)}
            count={counts.get(collection.title) ?? 0}
            index={i}
          />
        </Reveal>
      ))}
    </div>
  );
}
