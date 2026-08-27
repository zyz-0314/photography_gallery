"use client";

import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";

const isBlockedShortcut = (e: KeyboardEvent) => {
  if (e.key === "F12") return true;
  const ctrlOrCmd = e.ctrlKey || e.metaKey;
  if (ctrlOrCmd && e.shiftKey && (e.key === "I" || e.key === "J")) return true;
  if (ctrlOrCmd && e.key.toLowerCase() === "u") return true;
  return false;
};

/**
 * Blocks the common DevTools keyboard shortcuts (F12, Ctrl/⌘+Shift+I/J,
 * Ctrl/⌘+U) and shows a small dismissible notice. Inspection is best-effort —
 * the browser's own menu still has an "Inspect" entry, which cannot be blocked.
 */
export function DevToolsGuard() {
  const [visible, setVisible] = useState(false);
  const cardRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (isBlockedShortcut(e)) {
        e.preventDefault();
        e.stopPropagation();
        setVisible(true);
      }
    };
    // Capture phase so nothing downstream can open DevTools first.
    window.addEventListener("keydown", onKey, true);
    return () => window.removeEventListener("keydown", onKey, true);
  }, []);

  useEffect(() => {
    if (!visible) return;
    const dismissOnKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setVisible(false);
    };
    const dismissOnOutside = (e: PointerEvent) => {
      if (cardRef.current && !cardRef.current.contains(e.target as Node)) {
        setVisible(false);
      }
    };
    window.addEventListener("keydown", dismissOnKey);
    window.addEventListener("pointerdown", dismissOnOutside);
    return () => {
      window.removeEventListener("keydown", dismissOnKey);
      window.removeEventListener("pointerdown", dismissOnOutside);
    };
  }, [visible]);

  return (
    <AnimatePresence>
      {visible && (
        // Static wrapper carries the fixed position so the motion.div's own
        // transform animation (y/scale) doesn't fight the centering.
        <div className="fixed left-1/2 top-1/4 z-[120] -translate-x-1/2">
          <motion.div
            ref={cardRef}
            initial={{ opacity: 0, y: 10, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 8, scale: 0.98 }}
            transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
            className="w-[min(320px,86vw)] rounded-xl border border-line bg-ink-2 px-6 py-5 shadow-2xl shadow-black/50"
          >
            <div className="flex items-start justify-between gap-4">
              <p className="font-display text-[17px] leading-snug text-paper">
                What do you want to check?
              </p>
              <button
                onClick={() => setVisible(false)}
                aria-label="Close"
                className="label-sm shrink-0 text-faint transition-colors hover:text-paper"
              >
                ✕
              </button>
            </div>
            <div className="mt-4 flex items-center justify-between border-t border-line-soft pt-3">
              <span className="label-sm text-faint">INSPECTION DISABLED</span>
              <button
                onClick={() => setVisible(false)}
                className="label text-muted transition-colors hover:text-paper"
              >
                CLOSE
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
