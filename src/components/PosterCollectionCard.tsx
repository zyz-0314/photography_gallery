"use client";

import Link from "next/link";
import type { Collection, Photograph } from "@/types";
import { titleCase } from "@/lib/titleCase";
import { SmartImage, Grain } from "@/components/ui/SmartImage";

interface PosterCardProps {
  collection: Collection;
  cover?: Photograph;
  count: number;
  index: number;
}

/**
 * Compact mosaic tile for the home collections section — the cover keeps its
 * true ratio, so tiles of different shapes flow together like a jigsaw.
 */
export function PosterCollectionCard({
  collection,
  cover,
  count,
  index,
}: PosterCardProps) {
  return (
    <Link
      href={`/collections/${collection.slug}`}
      className="group relative block overflow-hidden bg-ink-2"
    >
      <SmartImage
        src={cover?.thumb || cover?.src || ""}
        alt={collection.title}
        natural
        aspect={cover?.aspect ?? "2/3"}
        imgClassName="transition-[transform,filter] duration-[1600ms] ease-out group-hover:scale-[1.05] group-hover:brightness-[1.06]"
        meta={{ location: cover?.location, country: cover?.country, year: cover?.year }}
      />

      {/* legibility + gentle brighten on hover */}
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-transparent" />
      <div className="pointer-events-none absolute inset-0 bg-black/0 transition-colors duration-700 group-hover:bg-white/[0.05]" />
      <Grain opacity={0.05} />

      {/* index */}
      <span className="label-sm absolute left-4 top-4 text-muted">
        {String(index + 1).padStart(2, "0")}
      </span>

      {/* title block */}
      <div className="pointer-events-none absolute inset-x-0 bottom-0 flex items-end justify-between gap-3 p-4">
        <div className="flex min-w-0 flex-col">
          <h3 className="headline text-[clamp(18px,1.8vw,28px)] text-paper">
            {titleCase(collection.title)}
          </h3>
          {collection.nameZh && (
            <p className="mt-0.5 text-[12px] tracking-wide text-muted">
              {collection.nameZh}
            </p>
          )}
          <p className="label-sm mt-1.5 text-faint">{count} WORKS</p>
        </div>
        <span className="label-sm text-muted opacity-0 transition-opacity duration-500 group-hover:opacity-100">
          VIEW →
        </span>
      </div>
    </Link>
  );
}
