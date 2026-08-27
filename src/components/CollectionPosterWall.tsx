"use client";

import type { Collection, Photograph } from "@/types";
import { Reveal } from "@/components/ui/Reveal";
import { CollectionPosterCard } from "./CollectionPosterCard";

/**
 * The Collection page's poster wall — five uniform 2:3 posters in a single
 * row on desktop, one editorial unit per photography category.
 */
export function CollectionPosterWall({
  collections,
  covers,
  counts,
}: {
  collections: Collection[];
  covers: Photograph[];
  counts: Record<string, number>;
}) {
  const coverBySlug = new Map(covers.map((p) => [p.slug, p]));

  return (
    <div className="grid grid-cols-2 gap-4 md:grid-cols-3 md:gap-5 xl:grid-cols-5 xl:gap-6">
      {collections.map((collection, i) => (
        <Reveal key={collection.slug} delay={i * 0.06} className="min-w-0">
          <CollectionPosterCard
            collection={collection}
            cover={coverBySlug.get(collection.coverId)}
            count={counts[collection.slug] ?? 0}
            index={i}
          />
        </Reveal>
      ))}
    </div>
  );
}
