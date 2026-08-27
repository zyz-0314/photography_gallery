"use client";

import type { Photograph } from "@/types";
import { MasonryGrid } from "@/components/ui/MasonryGrid";

/**
 * Renders a category archive as a compact 500px-style exhibition grid.
 * Every tile opens the shared lightbox.
 */
export function CollectionArchive({ photos }: { photos: Photograph[] }) {
  return <MasonryGrid photos={photos} priorityFrom={1} />;
}
