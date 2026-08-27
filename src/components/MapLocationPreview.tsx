"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import type { Location, Photograph } from "@/types";
import { photosForLocation } from "@/lib/photos";
import { SmartImage } from "@/components/ui/SmartImage";

interface MapLocationPreviewProps {
  loc: Location;
  locations: Location[];
  photos: Photograph[];
  /** Left/top as percentages of the map container. */
  x: number;
  y: number;
  actionLabel: string;
  onAction: () => void;
  actionHref?: string;
}

/** Floating preview near a map marker: photo stack + metadata. */
export function MapLocationPreview({
  loc,
  locations,
  photos,
  x,
  y,
  actionLabel,
  onAction,
  actionHref,
}: MapLocationPreviewProps) {
  const locPhotos = photosForLocation(loc.slug, locations, photos);
  const shown = locPhotos.slice(0, 3);
  const count = locPhotos.length;
  const flip = x > 58;

  const actionClass =
    "label inline-flex items-center gap-2 text-muted transition-colors hover:text-paper";

  return (
    <div
      className="pointer-events-auto absolute z-20"
      style={{
        left: `${x}%`,
        top: `${y}%`,
        transform: `${flip ? "translateX(calc(-100% - 16px))" : "translateX(16px)"} translateY(-50%)`,
      }}
    >
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
        className="w-[236px] border border-line bg-ink-2/95 p-4"
      >
      <div className="flex gap-1">
        {shown.map((photo) => (
          <div key={photo.id} className="h-12 w-12 shrink-0 overflow-hidden bg-ink-3">
            <SmartImage src={photo.thumb || photo.src} alt={photo.title} fill />
          </div>
        ))}
      </div>

      <p className="mt-3 text-[15px] font-medium text-paper">{loc.name}</p>
      <p className="label-sm mt-1 text-faint">
        {loc.country.toUpperCase()} · {loc.year}
      </p>
      <p className="label-sm mt-3 text-muted">
        {count} {count === 1 ? "PHOTOGRAPH" : "PHOTOGRAPHS"}
      </p>

      <div className="mt-3 border-t border-line pt-3">
        {actionHref ? (
          <Link href={actionHref} onClick={onAction} className={actionClass}>
            {actionLabel} →
          </Link>
        ) : (
          <button onClick={onAction} className={actionClass}>
            {actionLabel} →
          </button>
        )}
      </div>
      </motion.div>
    </div>
  );
}
