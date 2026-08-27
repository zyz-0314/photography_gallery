"use client";

import { useEffect, useCallback, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import type { Photograph } from "@/types";
import { SmartImage, Grain } from "@/components/ui/SmartImage";
import { PhotoDetails } from "@/components/ui/PhotoMeta";
import { PaletteSwatches } from "./PaletteSwatches";
import { lockScroll, unlockScroll } from "@/hooks/lenis";

interface ImageLightboxProps {
  state: { photos: Photograph[]; index: number } | null;
  onClose: () => void;
  onMove: (dir: 1 | -1) => void;
}

/** Best real width/height ratio for a photograph. */
function photoAspect(photo?: Photograph): number {
  if (photo?.width && photo?.height) return photo.width / photo.height;
  const [w, h] = (photo?.aspect ?? "3/2").split("/").map(Number);
  return w && h ? w / h : 1.5;
}

const INFO_W = 360;
const GAP = 48;
const SIDE = 48;
const V_PAD = 192;
const MAX_PLATE = 1720;

export function ImageLightbox({ state, onClose, onMove }: ImageLightboxProps) {
  const photos = state?.photos ?? [];
  const index = state?.index ?? 0;
  const photo = photos[index];

  const [vp, setVp] = useState({ w: 0, h: 0 });

  const onKey = useCallback(
    (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
      if (e.key === "ArrowLeft") onMove(-1);
      if (e.key === "ArrowRight") onMove(1);
    },
    [onClose, onMove]
  );

  useEffect(() => {
    if (state) {
      lockScroll();
      window.addEventListener("keydown", onKey);
      const update = () => setVp({ w: window.innerWidth, h: window.innerHeight });
      update();
      window.addEventListener("resize", update);
      return () => {
        unlockScroll();
        window.removeEventListener("keydown", onKey);
        window.removeEventListener("resize", update);
      };
    }
  }, [state, onKey]);

  const isDesktop = vp.w >= 768;
  const ratio = photoAspect(photo);
  // Two fixed window aspect ratios — landscape and portrait plates. Photos that
  // don't exactly match their plate just letterbox (object-contain), which is
  // fine and keeps the modal a consistent shape for each orientation.
  const canvasRatio = ratio >= 1 ? 4 / 3 : 3 / 4;
  const availW = Math.max(300, Math.min(vp.w - SIDE * 2, MAX_PLATE) - INFO_W - GAP);
  const availH = Math.max(300, vp.h - V_PAD);
  let imgW = availH * canvasRatio;
  let imgH = availH;
  if (imgW > availW) {
    imgW = availW;
    imgH = availW / canvasRatio;
  }

  const placeLine = [photo?.location, photo?.country, photo?.year ? String(photo.year) : ""]
    .filter(Boolean)
    .join(" · ");

  return (
    <AnimatePresence>
      {state && photo && (
        <motion.div
          key="lightbox"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.4, ease: "easeOut" }}
          className="fixed inset-0 z-[100] bg-ink/95"
          onClick={onClose}
          role="dialog"
          aria-modal="true"
          aria-label={photo.title}
        >
          <Grain opacity={0.04} />

          {/* top bar */}
          <div className="pointer-events-none absolute inset-x-0 top-0 z-20 flex items-center justify-between px-5 py-4 sm:px-10 lg:px-14">
            <span className="label text-muted">{photo.title}</span>
            <button
              onClick={onClose}
              aria-label="Close"
              className="pointer-events-auto label text-muted transition-colors hover:text-paper"
            >
              CLOSE ✕
            </button>
          </div>

          {/* centred, ratio-adaptive plate */}
          <div
            className="absolute inset-0 flex justify-center overflow-hidden px-4 sm:px-8 md:px-12"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex h-full w-full max-w-[1720px] flex-col gap-8 py-20 md:flex-row md:justify-center md:gap-12 md:py-24">
              {/* image — fixed landscape/portrait plate, photo letterboxes inside */}
              <div
                className="relative min-h-0 shrink-0 md:self-center"
                style={
                  isDesktop
                    ? { width: imgW, height: imgH }
                    : { flex: 1, width: "100%", minHeight: 0 }
                }
              >
                <motion.div
                  key={photo.id}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.35 }}
                  className="absolute inset-0"
                >
                  <SmartImage
                    src={photo.src}
                    alt={photo.title}
                    fill
                    priority
                    eager
                    imgClassName="object-contain object-left"
                    meta={{
                      location: photo.location,
                      country: photo.country,
                      year: photo.year,
                    }}
                  />
                </motion.div>

                {/* prev / next */}
                {photos.length > 1 && (
                  <>
                    <button
                      aria-label="Previous photograph"
                      onClick={(e) => {
                        e.stopPropagation();
                        onMove(-1);
                      }}
                      className="absolute left-2 top-1/2 z-10 -translate-y-1/2 p-3 text-muted transition-colors hover:text-paper sm:left-4"
                    >
                      ←
                    </button>
                    <button
                      aria-label="Next photograph"
                      onClick={(e) => {
                        e.stopPropagation();
                        onMove(1);
                      }}
                      className="absolute right-2 top-1/2 z-10 -translate-y-1/2 p-3 text-muted transition-colors hover:text-paper sm:right-4"
                    >
                      →
                    </button>
                  </>
                )}
              </div>

              {/* info column */}
              <aside
                data-lenis-prevent
                className="max-h-[50vh] shrink-0 overflow-y-auto overscroll-contain [scrollbar-width:thin] [scrollbar-color:rgba(255,255,255,0.14)_transparent] md:max-h-full md:self-stretch md:w-[360px] md:border-l md:border-line-soft md:pl-10 lg:pl-14 [&::-webkit-scrollbar]:w-[5px] [&::-webkit-scrollbar-track]:bg-transparent [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-thumb]:bg-white/15"
              >
                <span className="label-sm break-all text-faint">{photo.slug}</span>
                <h2 className="mt-3 headline text-[clamp(22px,2.4vw,30px)] text-paper">
                  {photo.title}
                </h2>
                {placeLine && (
                  <p className="label mt-3 text-muted">{placeLine}</p>
                )}

                <div className="mt-8 flex flex-col gap-8">
                  <PhotoDetails photo={photo} />
                  <PaletteSwatches src={photo.thumb || photo.src} />
                  {photo.description && (
                    <p className="text-[14px] leading-relaxed text-muted">
                      {photo.description}
                    </p>
                  )}
                </div>

                <div className="mt-10 border-t border-line-soft pt-4">
                  <span className="label-sm text-faint">
                    {String(index + 1).padStart(2, "0")} /{" "}
                    {String(photos.length).padStart(2, "0")}
                  </span>
                </div>
              </aside>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
