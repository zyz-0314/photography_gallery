"use client";

import { useEffect } from "react";

/**
 * Blocks the browser context menu (right-click) everywhere on the site —
 * visitors cannot use "Save image as…" on the photographs.
 */
export function DisableRightClick() {
  useEffect(() => {
    const prevent = (e: MouseEvent) => e.preventDefault();
    document.addEventListener("contextmenu", prevent);
    return () => document.removeEventListener("contextmenu", prevent);
  }, []);
  return null;
}
