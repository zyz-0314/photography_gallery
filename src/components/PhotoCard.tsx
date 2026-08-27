"use client";

import {
  useRef,
  type CSSProperties,
  type RefObject,
} from "react";
import type { Photograph } from "@/types";
import { SmartImage } from "@/components/ui/SmartImage";
import { PhotoMeta } from "@/components/ui/PhotoMeta";
import { photoRatio } from "@/lib/photos";
import { cx } from "@/lib/cx";

export interface DragState {
  moved: boolean;
}

interface PhotoCardProps {
  photo: Photograph;
  onClick?: () => void;
  /** Applies to the figure. */
  className?: string;
  style?: CSSProperties;
  /** Gallery sets this to suppress clicks after a drag gesture. */
  dragState?: RefObject<DragState>;
  priority?: boolean;
  /** Preserve the photo's true ratio instead of cropping to a fixed frame. */
  natural?: boolean;
}

/**
 * A single frame of the film strip. Hover quietly scales the image, lifts
 * the frame and reveals minimal metadata. Click opens the lightbox.
 */
export function PhotoCard({
  photo,
  onClick,
  className,
  style,
  dragState,
  priority,
  natural,
}: PhotoCardProps) {
  const wasDragged = useRef(false);

  const handleClick = () => {
    if (dragState?.current.moved || wasDragged.current) return;
    onClick?.();
  };

  return (
    <figure
      onClick={handleClick}
      onPointerDownCapture={() => {
        wasDragged.current = false;
      }}
      className={cx(
        "group relative shrink-0 cursor-pointer overflow-hidden bg-ink-2",
        className
      )}
      style={style}
    >
      <SmartImage
        src={photo.thumb || photo.src}
        alt={photo.title}
        {...(natural
          ? { natural: true, aspect: photoRatio(photo) }
          : { fill: true })}
        priority={priority}
        imgClassName="transition-[transform,opacity] duration-[1600ms] ease-out group-hover:scale-[1.1]"
        meta={{
          location: photo.location,
          country: photo.country,
          year: photo.year,
        }}
      />

      {/* gentle lift + brighten on hover */}
      <div className="pointer-events-none absolute inset-0 bg-black/0 transition-colors duration-700 group-hover:bg-white/[0.05]" />

      {/* metadata reveal */}
      <div className="pointer-events-none absolute inset-x-0 bottom-0 flex items-end justify-between gap-4 bg-gradient-to-t from-black/70 via-black/20 to-transparent px-4 pb-3 pt-12 opacity-0 transition-opacity duration-700 group-hover:opacity-100">
        <div className="flex flex-col gap-1">
          <span className="text-[13px] font-medium text-paper">
            {photo.title}
          </span>
          <PhotoMeta photo={photo} />
        </div>
      </div>
    </figure>
  );
}
