"use client";

/** Lenis instance shared across the app, plus scroll-lock helpers. */

interface LenisLike {
  stop: () => void;
  start: () => void;
  scrollTo: (
    target: number | string | HTMLElement,
    options?: { offset?: number; immediate?: boolean }
  ) => void;
}

let lenisInstance: LenisLike | null = null;

export function setLenis(lenis: LenisLike | null) {
  lenisInstance = lenis;
}

export function getLenis() {
  return lenisInstance;
}

/** Smooth-scroll to a section by its id (minus the leading `#`). */
export function scrollToSection(hash: string) {
  const el = document.getElementById(hash);
  if (!el) return;
  const lenis = getLenis();
  if (lenis) lenis.scrollTo(el);
  else el.scrollIntoView({ behavior: "smooth" });
}

export function lockScroll() {
  document.body.style.overflow = "hidden";
  lenisInstance?.stop();
}

export function unlockScroll() {
  document.body.style.overflow = "";
  lenisInstance?.start();
}
