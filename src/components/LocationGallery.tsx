"use client";

import type { Photograph } from "@/types";
import { MasonryGrid } from "@/components/ui/MasonryGrid";

/**
 * A location's photographs as a compact 500px-style exhibition grid.
 * Every tile opens the shared lightbox.
 */
export function LocationGallery({ photos }: { photos: Photograph[] }) {
  return <MasonryGrid photos={photos} priorityFrom={1} />;
}
