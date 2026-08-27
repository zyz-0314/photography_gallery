"use client";

import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { navLinks } from "@/data/site";
import { cx } from "@/lib/cx";
import { SectionLink } from "./ui/SectionLink";
import { MobileMenu } from "./MobileMenu";

export function Navbar() {
  const pathname = usePathname();
  const [scrolled, setScrolled] = useState(false);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // Scroll-spy: highlight the section nearest the top while on the home page.
  useEffect(() => {
    if (pathname !== "/") {
      setActiveId(null);
      return;
    }
    const ids = navLinks.map((link) => link.href.split("#")[1]);
    const onScroll = () => {
      const mid = window.innerHeight * 0.35;
      let current = ids[0];
      for (const id of ids) {
        const el = document.getElementById(id);
        if (el && el.getBoundingClientRect().top <= mid) current = id;
      }
      setActiveId(current);
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
    };
  }, [pathname]);

  return (
    <>
      <header
        className={cx(
          "fixed inset-x-0 top-0 z-50 h-16 border-b border-transparent bg-ink transition-[border-color] duration-500",
          scrolled && "border-line-soft"
        )}
      >
        <div className="mx-auto flex h-full max-w-[1600px] items-center justify-between px-6 lg:px-10">
          <SectionLink
            href="/#main"
            className="font-display text-[13px] font-semibold tracking-[0.3em] text-paper"
            aria-label="r1yadJame — home"
          >
            R1YAD&nbsp;JAME
          </SectionLink>

          <nav className="hidden items-center gap-9 md:flex" aria-label="Main">
            {navLinks.map((link) => {
              const active = pathname === "/" && activeId === link.href.split("#")[1];
              return (
                <SectionLink
                  key={link.href}
                  href={link.href}
                  className={cx(
                    "label relative py-2 transition-colors duration-300",
                    active ? "text-paper" : "text-muted hover:text-paper"
                  )}
                >
                  {link.label}
                  <span
                    className={cx(
                      "absolute -bottom-0.5 left-0 h-px bg-paper transition-all duration-500",
                      active ? "w-full" : "w-0"
                    )}
                  />
                </SectionLink>
              );
            })}
          </nav>

          <button
            className="label md:hidden"
            onClick={() => setMenuOpen(true)}
            aria-label="Open menu"
          >
            MENU
          </button>
        </div>
      </header>

      <MobileMenu open={menuOpen} onClose={() => setMenuOpen(false)} activeId={activeId} />
    </>
  );
}
