"use client";

import { useEffect, useRef, type PointerEvent as ReactPointerEvent } from "react";
import { motion } from "framer-motion";
import { site } from "@/data/site";
import { useMediaQuery } from "@/hooks/useMediaQuery";

const lines = site.heroHeadline.split("\n");

/** Radius of the cursor's light beam over the headline. */
const GLOW_RADIUS = 220;

/**
 * Editorial hero: typography and whitespace, no full-bleed image.
 * On pointer-capable devices the headline is revealed by a radial light that
 * follows the cursor — a "finding the words in the dark" effect. Touch devices
 * keep the quiet static layout.
 */
export function HeroIntro() {
  const canHover = useMediaQuery("(hover: hover) and (pointer: fine)");
  const glowRef = useRef<HTMLHeadingElement>(null);
  const target = useRef({ x: -999, y: -999 });
  const current = useRef({ x: -999, y: -999 });
  const rafId = useRef(0);

  // Ease the light toward the cursor (a little behind it), updating the mask
  // directly on the DOM node so React isn't re-rendered every frame.
  const tick = () => {
    rafId.current = 0;
    const g = glowRef.current;
    if (!g) return;
    const c = current.current;
    const t = target.current;
    c.x += (t.x - c.x) * 0.12;
    c.y += (t.y - c.y) * 0.12;
    const mask = `radial-gradient(${GLOW_RADIUS}px at ${c.x.toFixed(1)}px ${c.y.toFixed(1)}px, #000 0%, rgba(0,0,0,0.6) 42%, transparent 100%)`;
    g.style.setProperty("-webkit-mask-image", mask);
    g.style.setProperty("mask-image", mask);
    if (Math.abs(t.x - c.x) + Math.abs(t.y - c.y) > 0.5) {
      rafId.current = requestAnimationFrame(tick);
    }
  };

  useEffect(
    () => () => {
      if (rafId.current) cancelAnimationFrame(rafId.current);
    },
    []
  );

  const onPointerMove = (e: ReactPointerEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    target.current = { x: e.clientX - rect.left, y: e.clientY - rect.top };
    if (!rafId.current) rafId.current = requestAnimationFrame(tick);
  };

  const renderLines = () =>
    lines.map((line, i) => (
      <span key={i} className="block overflow-hidden">
        <motion.span
          initial={{ y: "110%" }}
          animate={{ y: 0 }}
          transition={{
            duration: 1.1,
            delay: 0.15 + i * 0.14,
            ease: [0.16, 1, 0.3, 1],
          }}
          className="block"
        >
          {line}
        </motion.span>
      </span>
    ));

  return (
    <section className="flex min-h-[92svh] flex-col justify-between pt-16">
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 1, delay: 0.2 }}
        className="mt-16 flex items-center justify-between lg:mt-24"
      >
        <span className="label text-muted">{site.heroLabel}</span>
        <span className="label hidden text-faint sm:block">EST. 2016</span>
      </motion.div>

      <div onPointerMove={canHover ? onPointerMove : undefined} className="relative mt-20">
        {/* quiet base layer — understated film-still grey */}
        <h1 className="headline text-[clamp(52px,11vw,132px)] text-white/70">
          {renderLines()}
        </h1>
        {/* light layer — only visible inside the cursor's radial glow */}
        {canHover && (
          <h1
            ref={glowRef}
            aria-hidden
            className="pointer-events-none absolute inset-0 headline text-[clamp(52px,11vw,132px)] text-[#fffdf6]"
          >
            {renderLines()}
          </h1>
        )}
      </div>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 1, delay: 0.9 }}
        className="mt-16 flex items-end justify-between gap-8 pb-10 lg:pb-16"
      >
        <p className="label max-w-[34ch] leading-loose text-muted">
          {site.heroFoot}
        </p>
        <span className="label hidden items-center gap-3 text-faint md:flex">
          SCROLL
          <span className="inline-block h-10 w-px bg-line" />
        </span>
      </motion.div>
    </section>
  );
}
