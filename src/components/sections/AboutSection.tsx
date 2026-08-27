import { Reveal } from "@/components/ui/Reveal";
import { SectionLabel } from "@/components/ui/SectionLabel";
import { site } from "@/data/site";

export function AboutSection() {
  return (
    <section id="about">
      {/* tools */}
      <section className="border-t border-line-soft py-28 lg:py-36">
        <div className="mx-auto max-w-[1600px] px-6 lg:px-10">
          <Reveal className="mb-16">
            <SectionLabel>{site.toolsLabel}</SectionLabel>
          </Reveal>
          <div className="grid gap-12 md:grid-cols-3">
            {site.tools.map((tool) => (
              <Reveal key={tool.label}>
                <div className="flex flex-col gap-4">
                  <span className="label text-faint">{tool.label}</span>
                  <p className="text-[15px] leading-[1.7] text-paper/90 whitespace-pre-line">
                    {tool.value}
                  </p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>
    </section>
  );
}
