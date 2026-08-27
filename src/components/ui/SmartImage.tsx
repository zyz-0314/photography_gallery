"use client";

import { useEffect, useRef, useState } from "react";
import { cx } from "@/lib/cx";

const NOISE = `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='180' height='180'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.7' numOctaves='2' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E")`;

/** Subtle cinematic film grain overlay. */
export function Grain({
  opacity = 0.05,
  className,
}: {
  opacity?: number;
  className?: string;
}) {
  return (
    <div
      aria-hidden
      className={cx("pointer-events-none absolute inset-0", className)}
      style={{
        backgroundImage: NOISE,
        backgroundSize: "180px 180px",
        opacity,
        mixBlendMode: "overlay",
      }}
    />
  );
}

interface SmartImageProps {
  src?: string;
  alt?: string;
  /** CSS aspect-ratio, e.g. "3/4". Keeps layout stable before the image loads. */
  aspect?: string;
  /** Fill the parent instead of using `aspect`. Parent must be positioned. */
  fill?: boolean;
  /**
   * Preserve the photograph's true aspect ratio — the container resizes to
   * the image's real intrinsic dimensions once loaded, never cropping.
   * `aspect` is then just the pre-load placeholder ratio.
   */
  natural?: boolean;
  priority?: boolean;
  sizes?: string;
  className?: string;
  imgClassName?: string;
  meta?: { location?: string; country?: string; year?: number };
  label?: string;
  eager?: boolean;
}

/**
 * Photograph with a graceful cinematic fallback. Until a real image exists at
 * `src`, the frame renders a dark film-like placeholder with the photo's
 * metadata — the site never shows broken images.
 */
export function SmartImage({
  src,
  alt = "",
  aspect,
  fill,
  natural,
  priority,
  sizes,
  className,
  imgClassName,
  meta,
  label,
  eager,
}: SmartImageProps) {
  const [status, setStatus] = useState<"loading" | "loaded" | "error">(
    src ? "loading" : "error"
  );
  const [intrinsic, setIntrinsic] = useState<{ w: number; h: number } | null>(
    null
  );
  const imgRef = useRef<HTMLImageElement>(null);

  // Fast/cached images can be complete before React attaches onLoad — catch that.
  useEffect(() => {
    const img = imgRef.current;
    if (img?.complete && img.naturalWidth > 0) {
      setIntrinsic({ w: img.naturalWidth, h: img.naturalHeight });
      setStatus("loaded");
    }
  }, [src]);

  const showPlaceholder = status !== "loaded";
  const loading = status === "loading" && src;
  const errored = status === "error";

  return (
    <div
      className={cx(
        "relative overflow-hidden bg-ink-2",
        fill ? "absolute inset-0 h-full w-full" : "w-full",
        className
      )}
      style={fill ? undefined : { aspectRatio: natural && intrinsic ? `${intrinsic.w}/${intrinsic.h}` : aspect }}
    >
      {/* placeholder frame */}
      <div
        aria-hidden
        className="absolute inset-0 transition-opacity duration-700"
        style={{
          opacity: showPlaceholder ? 1 : 0,
          background:
            "linear-gradient(165deg, #16161a 0%, #0e0e10 55%, #0a0a0b 100%)",
        }}
      >
        <Grain opacity={0.07} />
        <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 px-6 text-center">
          {label && (
            <span className="label text-faint">{label}</span>
          )}
          {meta?.location && (
            <span className="label text-muted">
              {meta.location}
              {meta.country ? ` — ${meta.country}` : ""}
              {meta.year ? ` · ${meta.year}` : ""}
            </span>
          )}
          {errored && !label && !meta && (
            <span className="label text-faint">PHOTOGRAPH</span>
          )}
        </div>
        {/* vignette */}
        <div
          className="absolute inset-0"
          style={{
            background:
              "radial-gradient(120% 90% at 50% 40%, transparent 55%, rgba(0,0,0,0.45) 100%)",
          }}
        />
      </div>

      {/* the photograph */}
      {src && (
        // Native img: SVG-safe and gives us the grain/fade/fallback pipeline.
        // eslint-disable-next-line @next/next/no-img-element
        <img
          ref={imgRef}
          src={src}
          alt={alt}
          // Eager, not native lazy: `loading="lazy"` never triggers inside the
          // CSS-columns masonry, leaving tiles stuck on the placeholder. Thumbs
          // are small and the proxy caches them, so eager is cheap and reliable.
          loading="eager"
          fetchPriority={priority || eager ? "high" : "auto"}
          decoding="async"
          sizes={sizes}
          onLoad={(e) => {
            const img = e.currentTarget;
            if (img.naturalWidth && img.naturalHeight) {
              setIntrinsic({ w: img.naturalWidth, h: img.naturalHeight });
            }
            setStatus("loaded");
          }}
          onError={() => setStatus("error")}
          className={cx(
            "absolute inset-0 h-full w-full transition-opacity duration-[1100ms] ease-out",
            // Callers that pass an explicit object-* class (e.g. the lightbox's
            // object-contain) must not fight the default cover.
            !imgClassName?.includes("object-") && "object-cover",
            loading ? "opacity-0" : "opacity-100",
            imgClassName
          )}
        />
      )}
    </div>
  );
}
