"use client";

import { useEffect } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { navLinks } from "@/data/site";
import { cx } from "@/lib/cx";
import { lockScroll, unlockScroll } from "@/hooks/lenis";
import { SectionLink } from "./ui/SectionLink";

export function MobileMenu({
  open,
  onClose,
  activeId,
}: {
  open: boolean;
  onClose: () => void;
  activeId?: string | null;
}) {
  // Lock page scroll while the menu is open.
  const isOpen = open;
  useEffect(() => {
    if (isOpen) {
      lockScroll();
      return () => unlockScroll();
    }
  }, [isOpen]);

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          key="mobile-menu"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.35 }}
          className="fixed inset-0 z-[90] flex flex-col bg-ink"
          role="dialog"
          aria-modal="true"
          aria-label="Menu"
        >
          <div className="flex h-16 items-center justify-between px-6">
            <span className="font-display text-[13px] font-semibold tracking-[0.3em]">
              R1YAD&nbsp;JAME
            </span>
            <button className="label" onClick={onClose} aria-label="Close menu">
              CLOSE
            </button>
          </div>

          <nav className="flex flex-1 flex-col justify-center gap-2 px-6" aria-label="Main">
            {navLinks.map((link, i) => {
              const active = activeId === link.href.split("#")[1];
              return (
                <motion.div
                  key={link.href}
                  initial={{ opacity: 0, y: 24 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: 0.08 * i, ease: [0.16, 1, 0.3, 1] }}
                >
                  <SectionLink
                    href={link.href}
                    onNavigate={onClose}
                    className={cx(
                      "headline block py-3 text-5xl transition-opacity",
                      active ? "text-paper" : "text-muted"
                    )}
                  >
                    {link.label}
                  </SectionLink>
                </motion.div>
              );
            })}
          </nav>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4, duration: 0.6 }}
            className="border-t border-line-soft px-6 py-8"
          >
            <p className="label text-faint">HANGZHOU, CHINA</p>
            <a
              href="mailto:hello@r1yadjame.com"
              className="label mt-3 block text-muted"
            >
              HELLO@R1YADJAME.COM
            </a>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
