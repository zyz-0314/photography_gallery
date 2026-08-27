"use client";

import { useEffect, useRef } from "react";
import type { PointerEvent as ReactPointerEvent } from "react";
import type { Photograph } from "@/types";
import { PhotoCard, type DragState } from "@/components/PhotoCard";
import { useLightbox } from "@/components/lightbox/LightboxProvider";

/** Column width and target column height for the horizontal masonry. */
const COL_W = 300;
const MAX_COL_H = 560;

const aspectOf = (p: Photograph): number => {
  if (p.width && p.height) return p.width / p.height;
  const [w, h] = p.aspect.split("/").map(Number);
  return w && h ? w / h : 1.5;
};

/** Split photos into masonry columns, each kept near MAX_COL_H tall. */
function layoutColumns(photos: Photograph[]): Photograph[][] {
  const cols: Photograph[][] = [];
  let col: Photograph[] = [];
  let h = 0;
  for (const p of photos) {
    const itemH = COL_W / aspectOf(p);
    if (col.length > 0 && h + itemH > MAX_COL_H) {
      cols.push(col);
      col = [];
      h = 0;
    }
    col.push(p);
    h += itemH;
  }
  if (col.length > 0) cols.push(col);
  return cols;
}

interface DragTracker {
  down: boolean;
  moved: boolean;
  startX: number;
  startScroll: number;
  lastX: number;
  lastT: number;
  vel: number;
}

/**
 * Horizontal masonry of selected work — photos keep their true aspect ratio,
 * stack into tall columns, and the whole band scrolls sideways. Moves with the
 * wheel, drag, touch swipe and trackpad.
 */
export function HorizontalPhotoGallery({ photos }: { photos: Photograph[] }) {
  const scroller = useRef<HTMLDivElement>(null);
  const drag = useRef<DragTracker>({
    down: false,
    moved: false,
    startX: 0,
    startScroll: 0,
    lastX: 0,
    lastT: 0,
    vel: 0,
  });
  const dragState = useRef<DragState>({ moved: false });
  const { open } = useLightbox();

  const columns = layoutColumns(photos);

  // Mouse wheel → horizontal scroll (non-passive so we can preventDefault).
  useEffect(() => {
    const el = scroller.current;
    if (!el) return;
    const onWheel = (e: WheelEvent) => {
      // Let trackpads with horizontal intent pass through.
      if (Math.abs(e.deltaX) > Math.abs(e.deltaY)) return;
      e.preventDefault();
      el.scrollBy({ left: e.deltaY, behavior: "auto" });
    };
    el.addEventListener("wheel", onWheel, { passive: false });
    return () => el.removeEventListener("wheel", onWheel);
  }, []);

  const onPointerDown = (e: ReactPointerEvent) => {
    const el = scroller.current;
    if (!el) return;
    drag.current.down = true;
    drag.current.moved = false;
    drag.current.startX = e.clientX;
    drag.current.startScroll = el.scrollLeft;
    drag.current.lastX = e.clientX;
    drag.current.lastT = performance.now();
    drag.current.vel = 0;
    dragState.current.moved = false;
    try {
      el.setPointerCapture(e.pointerId);
    } catch {
      // synthetic / non-tracked pointers — drag still works without capture
    }
  };

  const onPointerMove = (e: ReactPointerEvent) => {
    const el = scroller.current;
    if (!drag.current.down || !el) return;
    const dx = e.clientX - drag.current.startX;
    el.scrollLeft = drag.current.startScroll - dx;
    if (Math.abs(dx) > 6) {
      drag.current.moved = true;
      dragState.current.moved = true;
    }
    const now = performance.now();
    const dt = Math.max(1, now - drag.current.lastT);
    // scroll velocity: dragging left (clientX down) scrolls right (scrollLeft up)
    drag.current.vel = -((e.clientX - drag.current.lastX) / dt) * 16; // px / frame
    drag.current.lastX = e.clientX;
    drag.current.lastT = now;
  };

  const endDrag = () => {
    if (!drag.current.down) return;
    drag.current.down = false;
    const el = scroller.current;
    if (el && Math.abs(drag.current.vel) > 0.25) {
      let v = drag.current.vel;
      const decay = () => {
        v *= 0.93;
        el.scrollLeft += v;
        if (Math.abs(v) > 0.08) requestAnimationFrame(decay);
      };
      requestAnimationFrame(decay);
    }
    // Let the click handler run with `moved` already latched, then reset.
    requestAnimationFrame(() => {
      drag.current.moved = false;
      dragState.current.moved = false;
    });
  };

  const handleOpen = (index: number) => {
    if (dragState.current.moved) return;
    open(photos, index);
  };

  return (
    <div
      ref={scroller}
      data-lenis-prevent
      onPointerDown={onPointerDown}
      onPointerMove={onPointerMove}
      onPointerUp={endDrag}
      onPointerCancel={endDrag}
      className="w-full cursor-grab touch-pan-x select-none overflow-x-auto active:cursor-grabbing [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
      style={{ touchAction: "pan-x pan-y" }}
    >
      <div className="flex items-start gap-4 pr-[12vw]">
        {columns.map((col, ci) => {
          const start = columns.slice(0, ci).reduce((a, c) => a + c.length, 0);
          return (
            <div
              key={ci}
              className="flex w-[300px] shrink-0 flex-col gap-4"
            >
              {col.map((photo, i) => (
                <PhotoCard
                  key={photo.id}
                  photo={photo}
                  dragState={dragState}
                  onClick={() => handleOpen(start + i)}
                  priority={start + i < 2}
                  natural
                  style={{ width: "100%" }}
                />
              ))}
            </div>
          );
        })}
      </div>
    </div>
  );
}
