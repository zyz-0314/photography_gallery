"use client";

import {
  useEffect,
  useMemo,
  useRef,
  useState,
  type PointerEvent as ReactPointerEvent,
} from "react";
import { useRouter } from "next/navigation";
import { AnimatePresence, motion, useMotionValue } from "framer-motion";
import type { Location, Photograph } from "@/types";
import {
  landPaths,
  projectPoint,
  zoomToCountry,
  zoomToPoints,
  identity,
  MAP_W,
  MAP_H,
  type Transform,
} from "@/lib/map";
import { MapLocationPreview } from "./MapLocationPreview";
import { cx } from "@/lib/cx";

type Level =
  | { kind: "world" }
  | { kind: "country"; country: string }
  | { kind: "region"; slug: string };

const clamp = (v: number, min: number, max: number) =>
  Math.min(max, Math.max(min, v));

/** True for coordinates that aren't the 0,0 "unset" default. */
const hasCoords = (lat: number, lon: number) => lat !== 0 || lon !== 0;

const K_MIN = 1;
const K_MAX = 40;
/** Max inertia glide speed (viewBox units/s) — stops fast flicks from flying off. */
const MAX_PAN_VELOCITY = 3000;
/** Inertia friction (1/s) — higher stops the glide sooner. */
const INERTIA_DECAY = 5;
/** Zoom ease rate (1/s) — how quickly the zoom settles toward the target. */
const ZOOM_RATE = 10;
/** Pointer movement (px) that separates a click from a drag. */
const DRAG_THRESHOLD = 4;

/**
 * One map marker. It is a CHILD of the same group as the land, so it inherits
 * the group's view transform and can never drift from the geography. The
 * marker's own transform is applied natively by the animation loop
 * (`translate(wx,wy) scale(1/k)`) so its dot keeps a constant screen size.
 */
function MapMarker({
  loc,
  registerRef,
  active,
  onHover,
  onLeave,
  onClick,
}: {
  loc: Location;
  registerRef: (el: SVGGElement | null) => void;
  active: boolean;
  onHover: () => void;
  onLeave: () => void;
  onClick: () => void;
}) {
  const dotR = active ? 5 : 3.4;
  const haloR = active ? 13 : 8;
  const dotSpring = { type: "spring", stiffness: 200, damping: 22 } as const;

  return (
    <g
      ref={registerRef}
      className="cursor-pointer"
      onPointerEnter={onHover}
      onPointerLeave={onLeave}
      onClick={onClick}
      onKeyDown={(e) => {
        if (e.key === "Enter") onClick();
      }}
      tabIndex={0}
      role="button"
      aria-label={`${loc.name}, ${loc.country}`}
    >
      <motion.circle
        cx={0}
        cy={0}
        initial={{ r: dotR }}
        animate={{ r: dotR }}
        transition={dotSpring}
        fill={active ? "#f2f2f2" : "#a7a7a7"}
      />
      <motion.circle
        cx={0}
        cy={0}
        initial={{ r: haloR }}
        animate={{ r: haloR }}
        transition={dotSpring}
        fill="none"
        stroke="#f2f2f2"
        strokeOpacity={active ? 0.45 : 0.12}
      />
      <circle cx={0} cy={0} r={16} fill="transparent" />
    </g>
  );
}

export function InteractiveMap({
  locations,
  photos,
}: {
  locations: Location[];
  photos: Photograph[];
}) {
  const router = useRouter();
  const [level, setLevel] = useState<Level>({ kind: "world" });
  const [hovered, setHovered] = useState<Location | null>(null);
  const [dragging, setDragging] = useState(false);
  const [viewDirty, setViewDirty] = useState(false);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const clearTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  // ——————————————————————————————————————————————
  // Animation core. ONE rAF loop owns the rendered transform (animRef) and
  // writes it into the DOM via the native SVG `transform` attribute, which
  // always scales around the viewBox origin (0,0). Using the CSS transform
  // (framer-motion x/y/scale) is a trap: framer forces `transform-origin:
  // 50% 50%` on SVG, making zoom pivot around the map center, not the cursor.
  // ——————————————————————————————————————————————
  const animRef = useRef({ x: identity.x, y: identity.y, k: identity.k }); // rendered transform
  const targetRef = useRef({ x: identity.x, y: identity.y, k: identity.k }); // goal for zoom / fly
  const anchorRef = useRef({ px: MAP_W / 2, py: MAP_H / 2 }); // zoom pivot, viewBox coords
  const zoomModeRef = useRef<"idle" | "anchor" | "fly">("idle"); // anchor = user zoom, fly = level change
  const panModeRef = useRef<"idle" | "drag" | "inertia">("idle");
  const velRef = useRef({ x: 0, y: 0 }); // inertia velocity, viewBox units/s
  const rafRef = useRef(0);
  const lastFrameRef = useRef(0);

  const landGroupRef = useRef<SVGGElement | null>(null);
  const markerElsRef = useRef(
    new Map<string, { el: SVGGElement; wx: number; wy: number }>()
  );

  // Live animated values, kept in sync by the loop for the hover preview.
  const animX = useMotionValue(identity.x);
  const animY = useMotionValue(identity.y);
  const animK = useMotionValue(identity.k);

  const applyTransforms = () => {
    const a = animRef.current;
    landGroupRef.current?.setAttribute(
      "transform",
      `translate(${a.x},${a.y}) scale(${a.k})`
    );
    const inv = 1 / a.k;
    markerElsRef.current.forEach((m) => {
      m.el.setAttribute(
        "transform",
        `translate(${m.wx},${m.wy}) scale(${inv})`
      );
    });
  };

  useEffect(() => {
    lastFrameRef.current = performance.now();
    const frame = (now: number) => {
      const dt = Math.min(0.05, Math.max(0.0001, (now - lastFrameRef.current) / 1000));
      lastFrameRef.current = now;
      const a = animRef.current;
      const t = targetRef.current;
      let changed = false;

      // Zoom / fly: ease k toward the target. User zoom pivots around the
      // cursor anchor (anchor-preserving), level changes ease x/y too.
      if (Math.abs(a.k - t.k) > 0.00005) {
        const prevK = a.k;
        const alpha = 1 - Math.exp(-dt * ZOOM_RATE);
        a.k = prevK + (t.k - prevK) * alpha;
        const settled = Math.abs(a.k - t.k) < 0.00005;
        if (settled) a.k = t.k;
        const ratio = a.k / prevK;
        if (zoomModeRef.current === "anchor") {
          const p = anchorRef.current;
          a.x = p.px - (p.px - a.x) * ratio;
          a.y = p.py - (p.py - a.y) * ratio;
        } else {
          a.x += (t.x - a.x) * alpha;
          a.y += (t.y - a.y) * alpha;
        }
        if (settled) {
          zoomModeRef.current = "idle";
          t.x = a.x;
          t.y = a.y; // keep the goal aligned with the rendered view
        }
        changed = true;
      }

      // Inertia: keep panning with the release velocity, decay to a stop.
      if (panModeRef.current === "inertia") {
        const v = velRef.current;
        a.x += v.x * dt;
        a.y += v.y * dt;
        const f = Math.exp(-dt * INERTIA_DECAY);
        v.x *= f;
        v.y *= f;
        if (Math.hypot(v.x, v.y) < 5) {
          panModeRef.current = "idle";
          velRef.current = { x: 0, y: 0 };
          t.x = a.x;
          t.y = a.y;
        }
        changed = true;
      }

      if (changed) {
        applyTransforms();
        animX.set(a.x);
        animY.set(a.y);
        animK.set(a.k);
      }
      rafRef.current = requestAnimationFrame(frame);
    };
    applyTransforms(); // initial paint
    rafRef.current = requestAnimationFrame(frame);
    return () => cancelAnimationFrame(rafRef.current);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const locationBySlug = (slug: string) => locations.find((l) => l.slug === slug);

  // Fly to the target view whenever the level changes (world / country / region).
  useEffect(() => {
    const target = ((): Transform => {
      if (level.kind === "world") return identity;
      if (level.kind === "country") return zoomToCountry(level.country) ?? identity;
      const children = locations.filter(
        (l) => l.parent === level.slug && hasCoords(l.latitude, l.longitude)
      );
      return zoomToPoints(children.map((l) => projectPoint(l.latitude, l.longitude)));
    })();
    targetRef.current = target;
    zoomModeRef.current = "fly";
    panModeRef.current = "idle";
    velRef.current = { x: 0, y: 0 };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [level]);

  // Native non-passive wheel listener. React's synthetic onWheel can't stop
  // Lenis (it listens at the window); capturing here + stopPropagation keeps
  // wheel events out of the page scroller. The zoom pivots around the cursor.
  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const onWheel = (e: WheelEvent) => {
      e.preventDefault();
      e.stopPropagation();
      const rect = el.getBoundingClientRect();
      const px = ((e.clientX - rect.left) / rect.width) * MAP_W;
      const py = ((e.clientY - rect.top) / rect.height) * MAP_H;
      targetRef.current.k = clamp(
        targetRef.current.k * Math.exp(-e.deltaY * 0.0016),
        K_MIN,
        K_MAX
      );
      anchorRef.current = { px, py };
      zoomModeRef.current = "anchor";
      panModeRef.current = "idle"; // a wheel cancels any inertia glide
      velRef.current = { x: 0, y: 0 };
      setViewDirty(true);
    };
    el.addEventListener("wheel", onWheel, { passive: false });
    return () => el.removeEventListener("wheel", onWheel);
  }, []);

  // ——————————————————————————————————————————————
  // Pointer interactions: single-pointer drag (mouse + touch swipe) and
  // two-pointer pinch zoom. Both feed the same anim/target refs.
  // ——————————————————————————————————————————————
  const pointersRef = useRef(new Map<number, { x: number; y: number }>());
  const dragRef = useRef<{
    pointerId: number;
    downX: number;
    downY: number;
    lastX: number;
    lastY: number;
    moved: boolean;
  } | null>(null);
  const dragMovedRef = useRef(false);
  const pinchRef = useRef<{
    startDist: number;
    startK: number;
    lastMidX: number;
    lastMidY: number;
  } | null>(null);
  const velSamplesRef = useRef<{ x: number; y: number; t: number }[]>([]);

  const onPointerDown = (e: ReactPointerEvent<HTMLDivElement>) => {
    if (e.pointerType === "mouse" && e.button !== 0) return;
    pointersRef.current.set(e.pointerId, { x: e.clientX, y: e.clientY });

    if (pointersRef.current.size >= 2) {
      // A second finger arrived → pinch. Drop any single-finger drag.
      dragRef.current = null;
      panModeRef.current = "idle";
      velRef.current = { x: 0, y: 0 };
      return;
    }

    panModeRef.current = "drag";
    velRef.current = { x: 0, y: 0 };
    velSamplesRef.current = [];
    dragMovedRef.current = false;
    dragRef.current = {
      pointerId: e.pointerId,
      downX: e.clientX,
      downY: e.clientY,
      lastX: e.clientX,
      lastY: e.clientY,
      moved: false,
    };
    // Grabbing the map snaps any in-flight zoom so pan doesn't fight it.
    if (zoomModeRef.current !== "idle") {
      animRef.current.k = targetRef.current.k;
      animK.set(animRef.current.k);
      zoomModeRef.current = "idle";
    }
  };

  const onPointerMove = (e: ReactPointerEvent<HTMLDivElement>) => {
    const ptrs = pointersRef.current;
    const p = ptrs.get(e.pointerId);
    if (!p) return;
    p.x = e.clientX;
    p.y = e.clientY;

    // —— pinch (two pointers): zoom around the midpoint + midpoint pan ——
    if (ptrs.size === 2) {
      setDragging(false);
      const [a, b] = [...ptrs.values()];
      const dist = Math.hypot(b.x - a.x, b.y - a.y);
      const midX = (a.x + b.x) / 2;
      const midY = (a.y + b.y) / 2;
      const rect = e.currentTarget.getBoundingClientRect();
      const mx = ((midX - rect.left) / rect.width) * MAP_W;
      const my = ((midY - rect.top) / rect.height) * MAP_H;
      if (!pinchRef.current) {
        pinchRef.current = { startDist: dist, startK: animRef.current.k, lastMidX: midX, lastMidY: midY };
      }
      const pin = pinchRef.current;
      const k = clamp(pin.startK * (dist / pin.startDist), K_MIN, K_MAX);
      const a0 = animRef.current;
      const ratio = k / a0.k;
      const dMx = ((midX - pin.lastMidX) / rect.width) * MAP_W;
      const dMy = ((midY - pin.lastMidY) / rect.height) * MAP_H;
      pin.lastMidX = midX;
      pin.lastMidY = midY;
      a0.x += dMx;
      a0.y += dMy;
      a0.x = mx - (mx - a0.x) * ratio; // keep the midpoint anchored while zooming
      a0.y = my - (my - a0.y) * ratio;
      a0.k = k;
      targetRef.current = { ...a0 };
      zoomModeRef.current = "idle";
      panModeRef.current = "idle";
      velRef.current = { x: 0, y: 0 };
      setViewDirty(true);
      applyTransforms();
      animX.set(a0.x);
      animY.set(a0.y);
      animK.set(a0.k);
      return;
    }

    // —— single-pointer drag: 1:1 pan ——
    const drag = dragRef.current;
    if (!drag || drag.pointerId !== e.pointerId) return;
    if (!drag.moved) {
      const dist = Math.hypot(e.clientX - drag.downX, e.clientY - drag.downY);
      if (dist > DRAG_THRESHOLD) {
        drag.moved = true;
        dragMovedRef.current = true;
        setDragging(true);
        setHover(null);
        try {
          e.currentTarget.setPointerCapture(e.pointerId);
        } catch {
          /* capture can throw if the pointer is no longer active */
        }
      }
    }
    if (!drag.moved) return;
    const dx = e.clientX - drag.lastX;
    const dy = e.clientY - drag.lastY;
    drag.lastX = e.clientX;
    drag.lastY = e.clientY;
    if (dx === 0 && dy === 0) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const dxVb = (dx / rect.width) * MAP_W;
    const dyVb = (dy / rect.height) * MAP_H;
    const a0 = animRef.current;
    a0.x += dxVb;
    a0.y += dyVb;
    targetRef.current.x = a0.x;
    targetRef.current.y = a0.y;
    applyTransforms();
    animX.set(a0.x);
    animY.set(a0.y);
    velSamplesRef.current.push({ x: e.clientX, y: e.clientY, t: e.timeStamp });
    if (velSamplesRef.current.length > 24) velSamplesRef.current.shift();
    setViewDirty(true);
  };

  const onPointerUp = (e: ReactPointerEvent<HTMLDivElement>) => {
    pointersRef.current.delete(e.pointerId);
    if (pinchRef.current && pointersRef.current.size < 2) {
      pinchRef.current = null;
    }

    const drag = dragRef.current;
    if (drag && drag.pointerId === e.pointerId) {
      dragRef.current = null;
      if (!drag.moved) {
        panModeRef.current = "idle";
        return;
      }
      setDragging(false);
      // Release velocity from the last ~120ms of pointer samples → inertia.
      // Timestamps come from the pointer events themselves (e.timeStamp), so
      // no wall-clock call is needed here.
      const samples = velSamplesRef.current;
      const lastT = samples.length ? samples[samples.length - 1].t : 0;
      const recent = samples.filter((s) => lastT - s.t < 120);
      let vx = 0;
      let vy = 0;
      if (recent.length >= 2) {
        const first = recent[0];
        const last = recent[recent.length - 1];
        const dt = (last.t - first.t) / 1000;
        if (dt > 0) {
          vx = (last.x - first.x) / dt;
          vy = (last.y - first.y) / dt;
        }
      }
      const rect = containerRef.current?.getBoundingClientRect();
      if (rect) {
        vx = (vx / rect.width) * MAP_W;
        vy = (vy / rect.height) * MAP_H;
      }
      const mag = Math.hypot(vx, vy);
      if (mag > MAX_PAN_VELOCITY) {
        vx = (vx / mag) * MAX_PAN_VELOCITY;
        vy = (vy / mag) * MAX_PAN_VELOCITY;
      }
      velRef.current = { x: vx, y: vy };
      targetRef.current = { ...animRef.current };
      panModeRef.current = "inertia";
      // The compatibility click fires right after pointerup; clear the
      // suppression flag after it has had its chance to run.
      setTimeout(() => {
        dragMovedRef.current = false;
      }, 0);
    }
  };

  const onPointerCancel = (e: ReactPointerEvent<HTMLDivElement>) => {
    pointersRef.current.delete(e.pointerId);
    if (pinchRef.current && pointersRef.current.size < 2) {
      pinchRef.current = null;
    }
    // A system cancel (e.g. gesture interruption) should stop cleanly and
    // never trigger inertia.
    dragRef.current = null;
    setDragging(false);
    panModeRef.current = "idle";
    velRef.current = { x: 0, y: 0 };
  };

  const resetView = () => {
    setLevel({ kind: "world" });
    setViewDirty(false);
  };

  const visible = useMemo(() => {
    const base =
      level.kind === "world"
        ? locations.filter((l) => !l.parent)
        : level.kind === "country"
          ? locations.filter((l) => l.country === level.country && !l.parent)
          : locations.filter((l) => l.parent === level.slug);
    // Never render the 0,0 "unset" default — it would sit in the Atlantic.
    return base.filter((l) => hasCoords(l.latitude, l.longitude));
  }, [level, locations]);

  const setHover = (loc: Location | null) => {
    if (clearTimer.current) {
      clearTimeout(clearTimer.current);
      clearTimer.current = null;
    }
    if (loc === null) {
      clearTimer.current = setTimeout(() => setHovered(null), 140);
    } else {
      setHovered(loc);
    }
  };

  const handleMarkerClick = (loc: Location) => {
    // Ignore clicks that immediately follow a drag. Pointer capture normally
    // redirects the click away from the marker; this is a safety net.
    if (dragMovedRef.current) {
      dragMovedRef.current = false;
      return;
    }
    if (loc.region) {
      setViewDirty(true);
      setLevel({ kind: "region", slug: loc.slug });
      return;
    }
    if (level.kind === "world") {
      const countryCount = locations.filter(
        (l) => l.country === loc.country && !l.parent
      ).length;
      if (countryCount <= 1) {
        router.push(`/location/${loc.slug}`);
      } else {
        setViewDirty(true);
        setLevel({ kind: "country", country: loc.country });
      }
      return;
    }
    router.push(`/location/${loc.slug}`);
  };

  const goUp = () => {
    setViewDirty(true);
    if (level.kind === "region") {
      const region = locationBySlug(level.slug);
      if (region?.country) setLevel({ kind: "country", country: region.country });
      else setLevel({ kind: "world" });
    } else {
      setLevel({ kind: "world" });
    }
  };

  const crumb =
    level.kind === "world"
      ? "WORLD"
      : level.kind === "country"
        ? level.country.toUpperCase()
        : (locationBySlug(level.slug)?.name.toUpperCase() ?? "REGION");

  // Preview geometry (percentages of the map container), from the live
  // animated transform so it tracks the marker's real screen position.
  const preview =
    hovered
      ? (() => {
          const [wx, wy] = projectPoint(hovered.latitude, hovered.longitude);
          const x = animX.get();
          const y = animY.get();
          const k = animK.get();
          const sx = x + k * wx;
          const sy = y + k * wy;
          return {
            x: clamp((sx / MAP_W) * 100, 20, 78),
            y: clamp((sy / MAP_H) * 100, 18, 70),
          };
        })()
      : null;

  const actionFor = (loc: Location): { label: string; href?: string } => {
    if (loc.region) return { label: "EXPLORE REGION" };
    if (level.kind === "world") return { label: `EXPLORE ${loc.country.toUpperCase()}` };
    return { label: "VIEW ARCHIVE", href: `/location/${loc.slug}` };
  };

  const registerMarker = (slug: string, wx: number, wy: number) => (
    el: SVGGElement | null
  ) => {
    if (el) {
      markerElsRef.current.set(slug, { el, wx, wy });
      // Apply its transform immediately so it doesn't flash at (0,0).
      el.setAttribute(
        "transform",
        `translate(${wx},${wy}) scale(${1 / animRef.current.k})`
      );
    } else {
      markerElsRef.current.delete(slug);
    }
  };

  return (
    <div className="relative">
      {/* breadcrumb + reset + hint */}
      <div className="mb-5 flex items-center justify-between">
        <button
          onClick={goUp}
          className={cx(
            "label inline-flex items-center gap-2 text-muted transition-colors hover:text-paper",
            level.kind === "world" && "pointer-events-none text-faint"
          )}
          aria-label="Back to world"
        >
          {level.kind !== "world" && <span>←</span>}
          {crumb}
        </button>
        <div className="flex items-center gap-4">
          {viewDirty && (
            <button
              onClick={resetView}
              className="label text-muted transition-colors hover:text-paper"
              aria-label="Reset map view"
            >
              RESET VIEW
            </button>
          )}
          <span className="label hidden text-faint sm:block">
            HOVER A PLACE TO LOOK INSIDE · CLICK TO TRAVEL THERE
          </span>
        </div>
      </div>

      <div
        ref={containerRef}
        className={cx(
          "relative w-full select-none touch-none overflow-hidden border border-line-soft bg-ink-2/40",
          dragging ? "cursor-grabbing" : "cursor-grab"
        )}
        style={{ aspectRatio: `${MAP_W} / ${MAP_H}` }}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
        onPointerCancel={onPointerCancel}
        onPointerLeave={() => setHover(null)}
      >
        <svg
          viewBox={`0 0 ${MAP_W} ${MAP_H}`}
          className="h-full w-full"
          role="img"
          aria-label="World map of visited locations"
        >
          {/* The view transform is applied natively (SVG transform attribute),
              so it always scales around the viewBox origin (0,0) — markers and
              land share it and can never drift apart. */}
          <g ref={landGroupRef}>
            {landPaths().map((d, i) => (
              <path
                key={i}
                d={d}
                vectorEffect="non-scaling-stroke"
                className="fill-[#141416] stroke-[#262629]"
                strokeWidth={0.5}
              />
            ))}

            {visible.map((loc) => {
              const [wx, wy] = projectPoint(loc.latitude, loc.longitude);
              const active = hovered?.slug === loc.slug;
              return (
                <MapMarker
                  key={loc.slug}
                  loc={loc}
                  registerRef={registerMarker(loc.slug, wx, wy)}
                  active={active}
                  onHover={() => setHover(loc)}
                  onLeave={() => setHover(null)}
                  onClick={() => handleMarkerClick(loc)}
                />
              );
            })}
          </g>
        </svg>

        {/* hover preview */}
        <AnimatePresence>
          {hovered && preview && (
            <MapLocationPreview
              loc={hovered}
              x={preview.x}
              y={preview.y}
              locations={locations}
              photos={photos}
              actionLabel={actionFor(hovered).label}
              actionHref={actionFor(hovered).href}
              onAction={() => handleMarkerClick(hovered)}
            />
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
