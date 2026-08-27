"use client";

import { motion } from "framer-motion";
import type { ReactNode } from "react";

/** Slow fade-in at the top of every page. Mounts fresh per route. */
export function PageTransition({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <motion.main
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.8, ease: "easeOut" }}
      className={className}
    >
      {children}
    </motion.main>
  );
}
