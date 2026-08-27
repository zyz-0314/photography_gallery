import { Reveal } from "@/components/ui/Reveal";
import { SectionLabel } from "@/components/ui/SectionLabel";
import { site } from "@/data/site";

const lines = site.contactHeadline.split("\n");

export function ContactSection() {
  return (
    <section id="contact" className="pt-16">
      <section className="mx-auto flex min-h-[78svh] max-w-[1600px] flex-col justify-between px-6 lg:px-10">
        <div>
          <Reveal className="mt-24">
            <SectionLabel>CONTACT</SectionLabel>
          </Reveal>
          <Reveal delay={0.1} className="mt-16">
            <h1 className="headline text-[clamp(56px,12vw,150px)]">
              {lines.map((line, i) => (
                <span key={i} className="block">
                  {line}
                </span>
              ))}
            </h1>
          </Reveal>
        </div>

        <Reveal delay={0.25} className="mt-20">
          <p className="label text-muted">AVAILABLE FOR</p>
          <div className="mt-4 flex flex-wrap gap-x-10 gap-y-2">
            {site.contactAvailable.map((item) => (
              <span key={item} className="headline text-[clamp(22px,3vw,32px)] text-muted">
                {item}
              </span>
            ))}
          </div>
        </Reveal>
      </section>

      <section className="border-t border-line-soft py-24 lg:py-32">
        <div className="mx-auto grid max-w-[1600px] gap-14 px-6 md:grid-cols-3 lg:px-10">
          {site.contactMethods.map((method) => (
            <Reveal key={method.value} className="flex flex-col gap-4">
              <span className="label text-faint">{method.label}</span>
              {method.href ? (
                <a
                  href={method.href}
                  target={method.href.startsWith("http") ? "_blank" : undefined}
                  rel={method.href.startsWith("http") ? "noreferrer" : undefined}
                  className="headline text-[clamp(24px,2.6vw,34px)] break-all text-paper transition-colors hover:text-muted"
                >
                  {method.value}
                </a>
              ) : (
                <span className="headline text-[clamp(24px,2.6vw,34px)] break-all text-paper">
                  {method.value}
                </span>
              )}
            </Reveal>
          ))}
        </div>
      </section>
    </section>
  );
}
