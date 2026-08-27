import { navLinks, site } from "@/data/site";
import { SectionLink } from "./ui/SectionLink";

export function Footer() {
  return (
    <footer className="border-t border-line-soft">
      <div className="mx-auto max-w-[1600px] px-6 py-16 lg:px-10">
        <div className="grid gap-12 md:grid-cols-[1fr_auto]">
          <div>
            <p className="font-display text-lg font-semibold tracking-[0.3em]">
              R1YAD&nbsp;JAME
            </p>
            <p className="label mt-4 max-w-xs leading-relaxed text-faint">
              Photographer — Hangzhou, China
            </p>
          </div>
          <nav className="flex flex-col gap-3" aria-label="Footer">
            {navLinks.map((link) => (
              <SectionLink
                key={link.href}
                href={link.href}
                className="label w-fit text-muted transition-colors hover:text-paper"
              >
                {link.label}
              </SectionLink>
            ))}
          </nav>
        </div>

        <div className="mt-16 flex flex-col gap-2 border-t border-line-soft pt-6 sm:flex-row sm:items-center sm:justify-between">
          <span className="label-sm text-faint">
            © {site.copyrightYear} R1YADJAME
          </span>
          <span className="label-sm text-faint">{site.copyrightPlace}</span>
        </div>
      </div>
    </footer>
  );
}
