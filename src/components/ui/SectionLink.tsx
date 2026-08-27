"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import type { ComponentProps, MouseEvent } from "react";
import { scrollToSection } from "@/hooks/lenis";

/**
 * Nav link for the single-page layout. On the home page a hash href
 * smooth-scrolls to the matching section instead of triggering a route
 * change; from a detail page it falls through to normal Link navigation
 * (SmoothScroll scrolls to the hash on arrival).
 */
export function SectionLink({
  href,
  onNavigate,
  onClick,
  ...props
}: ComponentProps<typeof Link> & { onNavigate?: () => void }) {
  const pathname = usePathname();
  const hash = href.toString().split("#")[1];

  const handleClick = (e: MouseEvent<HTMLAnchorElement>) => {
    onClick?.(e);
    if (pathname === "/" && hash) {
      e.preventDefault();
      scrollToSection(hash);
      window.history.replaceState(null, "", `#${hash}`);
    }
    onNavigate?.();
  };

  return <Link href={href} onClick={handleClick} {...props} />;
}
