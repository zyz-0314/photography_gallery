"use client";

import type { CSSProperties } from "react";
import type { Photograph } from "@/types";
import { SmartImage } from "@/components/ui/SmartImage";
import { PhotoMeta } from "@/components/ui/PhotoMeta";
import { photoRatio } from "@/lib/photos";
import { cx } from "@/lib/cx";

interface PhotoFrameProps {
  photo: Photograph;
  /** Fixed ratio for the frame; ignored when `natural` is set. */
  aspect?: string;
  className?: string;
  style?: CSSProperties;
  onClick?: () => void;
  priority?: boolean;
  /** Preserve the photo's true ratio instead of the fixed `aspect`. */
  natural?: boolean;
  /** Permanently show the caption instead of only on hover. */
  caption?: boolean;
  /** Show nothing on hover — used in quiet layouts. */
  quiet?: boolean;
}

/**
 * A clickable photograph frame used across archive pages. Opens the lightbox
 * and shows a quiet caption on hover.
 */
export function PhotoFrame({
  photo,
  aspect,
  className,
  style,
  onClick,
  priority,
  natural,
  caption,
  quiet,
}: PhotoFrameProps) {
  return (
    <figure
      onClick={onClick}
      className={cx(
        "group relative cursor-pointer overflow-hidden bg-ink-2",
        className
      )}
      style={{ ...(natural ? {} : { aspectRatio: aspect }), ...style }}
    >
      <SmartImage
        src={photo.thumb || photo.src}
        alt={photo.title}
        natural={natural}
        aspect={natural ? photoRatio(photo) : aspect}
        priority={priority}
        imgClassName="transition-transform duration-[1500ms] ease-out group-hover:scale-[1.04]"
        meta={{
          location: photo.location,
          country: photo.country,
          year: photo.year,
        }}
      />

      <div className="pointer-events-none absolute inset-0 bg-black/0 transition-colors duration-700 group-hover:bg-white/[0.05]" />

      <div
        className={cx(
          "pointer-events-none absolute inset-x-0 bottom-0 flex items-end justify-between gap-4 bg-gradient-to-t from-black/70 via-black/20 to-transparent px-4 pb-3 pt-12",
          caption
            ? "opacity-100"
            : "opacity-0 transition-opacity duration-700 group-hover:opacity-100",
          quiet && "hidden"
        )}
      >
        <div className="flex flex-col gap-1">
          <span className="text-[13px] font-medium text-paper">
            {photo.title}
          </span>
          <PhotoMeta photo={photo} />
        </div>
        <span className="label-sm text-muted">VIEW</span>
      </div>
    </figure>
  );
}
