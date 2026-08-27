import Link from "next/link";
import { Reveal } from "@/components/ui/Reveal";
import { SectionLabel } from "@/components/ui/SectionLabel";
import { SmartImage } from "@/components/ui/SmartImage";
import { HeroIntro } from "@/components/HeroIntro";
import { HorizontalPhotoGallery } from "@/components/HorizontalPhotoGallery";
import { ProjectPreview } from "@/components/ProjectPreview";
import { site } from "@/data/site";
import { allCollections, allProjects, featured } from "@/lib/archive";

export async function MainSection() {
  const selected = await featured();
  const projects = await allProjects();
  const collections = await allCollections();

  return (
    <section id="main">
      {/* hero */}
      <div className="mx-auto max-w-[1600px] px-6 lg:px-10">
        <HeroIntro />
      </div>

      {/* short about */}
      <section className="border-t border-line-soft py-28 lg:py-40">
        <div className="mx-auto grid max-w-[1600px] gap-10 px-6 md:grid-cols-12 lg:px-10">
          <Reveal className="md:col-span-3">
            <SectionLabel>{site.shortAboutLabel}</SectionLabel>
          </Reveal>
          <Reveal delay={0.1} className="md:col-span-5 md:col-start-5">
            <h2 className="headline text-[clamp(32px,4vw,52px)] font-bold text-paper">
              {site.name}
            </h2>
            <p className="label mt-3 text-muted">{site.shortAboutPlace}</p>
            <blockquote className="mt-7 max-w-[36ch] text-[15px] italic leading-relaxed text-muted">
              “{site.quote.text}”
              <span className="mt-2 block text-[13px] not-italic text-faint">
                — {site.quote.by}
              </span>
            </blockquote>

            {/* photography categories → each opens its collection */}
            <div className="mt-12 flex flex-wrap gap-x-8 gap-y-3 border-t border-line-soft pt-8">
              {collections.map((c) => (
                <Link
                  key={c.slug}
                  href={`/collections/${c.slug}`}
                  className="group inline-flex items-baseline gap-2"
                >
                  <span className="text-[15px] font-medium tracking-[0.08em] text-muted transition-colors group-hover:text-paper">
                    {c.title}
                  </span>
                  <span className="text-[13px] text-muted transition-transform duration-300 group-hover:translate-x-0.5 group-hover:text-paper">
                    →
                  </span>
                </Link>
              ))}
            </div>
          </Reveal>
          <Reveal delay={0.15} className="md:col-span-3 md:col-start-10">
            <SmartImage
              src="/avatar.jpg"
              alt="r1yadJame"
              natural
              aspect="1/1"
              className="max-w-[240px] rounded-md"
            />
          </Reveal>
        </div>
      </section>

      {/* selected works */}
      <section className="pb-28 lg:pb-40">
        <div className="mx-auto flex max-w-[1600px] items-baseline justify-between px-6 pb-10 lg:px-10">
          <SectionLabel>{site.selectedWorksLabel}</SectionLabel>
          <span className="label hidden text-faint sm:block">
            DRAG · SCROLL · EXPLORE
          </span>
        </div>
        <HorizontalPhotoGallery photos={selected} />
      </section>

      {/* featured projects */}
      <section className="border-t border-line-soft py-28 lg:py-40">
        <div className="mx-auto max-w-[1600px] px-6 lg:px-10">
          <Reveal className="mb-16 lg:mb-24">
            <SectionLabel>{site.projectsLabel}</SectionLabel>
          </Reveal>
          <div className="flex flex-col gap-32 lg:gap-44">
            {projects.map((project) => (
              <ProjectPreview key={project.slug} project={project} />
            ))}
          </div>
        </div>
      </section>
    </section>
  );
}
