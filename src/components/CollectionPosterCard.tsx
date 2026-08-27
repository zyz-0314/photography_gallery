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

/** A uniform 2:3 collection poster — the cover photograph fills the frame. */
export function CollectionPosterCard({
  collection,
  cover,
  count,
  index,
}: PosterCardProps) {
  return (
    <Link
      href={`/collections/${collection.slug}`}
      className="group relative block overflow-hidden bg-ink-2"
      style={{ aspectRatio: "2/3" }}
    >
      <SmartImage
        src={cover?.thumb || cover?.src || ""}
        alt={collection.title}
        fill
        imgClassName="transition-[transform,filter] duration-[1600ms] ease-out group-hover:scale-[1.05] group-hover:brightness-[1.08]"
        meta={{ location: cover?.location, country: cover?.country, year: cover?.year }}
      />

      {/* legibility + gentle brighten on hover */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-black/5" />
      <div className="pointer-events-none absolute inset-0 bg-black/0 transition-colors duration-700 group-hover:bg-white/[0.05]" />

      <Grain opacity={0.06} />

      {/* index */}
      <span className="label-sm absolute left-4 top-4 text-muted lg:left-5 lg:top-5">
        {String(index + 1).padStart(2, "0")}
      </span>

      {/* title block */}
      <div className="absolute inset-x-0 bottom-0 p-4 lg:p-6">
        <h2 className="headline text-[clamp(22px,2.4vw,38px)] text-paper">
          {titleCase(collection.title)}
        </h2>
        {collection.nameZh && (
          <p className="mt-1.5 text-[13px] tracking-wide text-muted">
            {collection.nameZh}
          </p>
        )}
        <p className="label-sm mt-3 text-faint">{count} WORKS</p>
      </div>

      {/* hairline that grows on hover */}
      <span className="absolute bottom-0 left-0 h-[2px] w-0 bg-paper transition-all duration-[1200ms] ease-out group-hover:w-full" />
    </Link>
  );
}
