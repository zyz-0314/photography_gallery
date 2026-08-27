"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";
import Lenis from "lenis";
import { setLenis, getLenis } from "@/hooks/lenis";

/**
 * Cinematic smooth scrolling on desktop only.
 * Disabled on touch screens and for reduced-motion users so the horizontal
 * gallery swipe and mobile performance are never compromised.
 */
export function SmoothScroll() {
  const pathname = usePathname();

  useEffect(() => {
    if (typeof window === "undefined") return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    if (window.matchMedia("(pointer: coarse)").matches) return;

    const lenis = new Lenis({ duration: 1.15, smoothWheel: true });
    setLenis(lenis);

    let raf = 0;
    const loop = (time: number) => {
      lenis.raf(time);
      raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);

    return () => {
      cancelAnimationFrame(raf);
      lenis.destroy();
      setLenis(null);
    };
  }, []);

  // Land on the URL hash if present (direct visit, redirect, or nav from a
  // detail page); otherwise start each route at the top.
  useEffect(() => {
    const go = () => {
      const id = window.location.hash?.slice(1);
      const el = id ? document.getElementById(id) : null;
      const lenis = getLenis();
      if (lenis) {
        lenis.scrollTo(el ?? 0, { immediate: true });
      } else if (el) {
        el.scrollIntoView();
      } else {
        window.scrollTo(0, 0);
      }
    };
    const raf = requestAnimationFrame(go);
    window.addEventListener("hashchange", go);
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("hashchange", go);
    };
  }, [pathname]);

  return null;
}
