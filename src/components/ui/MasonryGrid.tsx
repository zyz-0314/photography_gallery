"use client";

import type { Photograph } from "@/types";
import { PhotoFrame } from "@/components/PhotoFrame";
import { useLightbox } from "@/components/lightbox/LightboxProvider";

/**
 * Compact 500px-style exhibition grid: photos keep their true aspect ratio
 * and flow through responsive CSS columns (masonry). Every tile opens the lightbox.
 */
export function MasonryGrid({
  photos,
  priorityFrom = 0,
}: {
  photos: Photograph[];
  /** First N photos load eagerly. */
  priorityFrom?: number;
}) {
  const { open } = useLightbox();

  if (photos.length === 0) {
    return (
      <p className="label text-faint">
        NO PHOTOGRAPHS YET — ADD SOME TO THE ARCHIVE.
      </p>
    );
  }

  return (
    <div className="columns-2 gap-3 md:columns-3 md:gap-4 xl:columns-4">
      {photos.map((photo, i) => (
        <div key={photo.id} className="mb-3 break-inside-avoid md:mb-4">
          <PhotoFrame
            photo={photo}
            natural
            priority={i < priorityFrom}
            onClick={() => open(photos, i)}
          />
        </div>
      ))}
    </div>
  );
}
