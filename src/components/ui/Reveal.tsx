"use client";

import { motion } from "framer-motion";
import type { ReactNode } from "react";
import { cx } from "@/lib/cx";

interface RevealProps {
  children: ReactNode;
  className?: string;
  /** Seconds to wait before animating in. */
  delay?: number;
  /** Initial vertical offset in px. */
  y?: number;
  as?: "div" | "section" | "p" | "span" | "h1" | "h2" | "h3";
  once?: boolean;
}

/** Slow, quiet fade-up on scroll. The site's default entrance. */
export function Reveal({
  children,
  className,
  delay = 0,
  y = 26,
  as = "div",
  once = true,
}: RevealProps) {
  const MotionTag = motion[as] as typeof motion.div;
  return (
    <MotionTag
      initial={{ opacity: 0, y }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once, margin: "-8% 0px -8% 0px" }}
      transition={{ duration: 1.1, ease: [0.16, 1, 0.3, 1], delay }}
      className={cx(className)}
    >
      {children}
    </MotionTag>
  );
}
