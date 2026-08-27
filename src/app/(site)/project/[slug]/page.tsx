import Link from "next/link";
import { notFound } from "next/navigation";
import { PageTransition } from "@/components/ui/PageTransition";
import { Reveal } from "@/components/ui/Reveal";
import { LocationGallery } from "@/components/LocationGallery";
import { allProjects, byIds, getProject } from "@/lib/archive";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const project = await getProject(slug);
  return {
    title: `R1YADJAME — ${project?.title ?? "Project"}`,
    description: project?.description,
  };
}

export default async function ProjectPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const [project, all] = await Promise.all([
    getProject(slug),
    allProjects(),
  ]);
  if (!project) notFound();

  const photos = await byIds(project.photoIds);
  const idx = all.findIndex((p) => p.slug === slug);
  const next = all[(idx + 1) % all.length];

  return (
    <PageTransition className="pt-16">
      <header className="mx-auto max-w-[1600px] px-6 lg:px-10">
        <Reveal className="mt-20">
          <Link
            href="/"
            className="label text-muted transition-colors hover:text-paper"
          >
            ← BACK TO MAIN
          </Link>
        </Reveal>

        <Reveal delay={0.1} className="mt-14">
          <div className="flex items-baseline gap-6">
            <span className="font-display text-sm text-faint">
              {project.number}
            </span>
            <h1 className="headline text-[clamp(44px,8vw,104px)]">
              {project.title}
            </h1>
          </div>
        </Reveal>

        <Reveal delay={0.18} className="mt-8 flex flex-wrap items-baseline gap-x-10 gap-y-3">
          <p className="label text-muted">
            {[project.location, project.country, project.year ? String(project.year) : ""]
              .filter(Boolean)
              .join(" · ")}
          </p>
          <p className="label text-faint">{project.categories.join(" / ")}</p>
        </Reveal>

        <Reveal delay={0.24} className="mt-10 max-w-[58ch]">
          <p className="text-[16px] leading-[1.85] text-muted">
            {project.description}
          </p>
        </Reveal>
      </header>

      <section className="mx-auto mt-20 max-w-[1600px] px-6 pb-20 lg:mt-28 lg:px-10">
        <LocationGallery photos={photos} />
      </section>

      {next && (
        <nav className="mx-auto mt-10 max-w-[1600px] border-t border-line-soft px-6 py-16 lg:px-10">
          <Link
            href={`/project/${next.slug}`}
            className="group flex items-baseline justify-between gap-6"
          >
            <span className="label text-faint">NEXT PROJECT</span>
            <span className="headline text-[clamp(28px,4vw,52px)] text-muted transition-colors group-hover:text-paper">
              {next.title}{" "}
              <span className="inline-block transition-transform duration-500 group-hover:translate-x-2">
                →
              </span>
            </span>
          </Link>
        </nav>
      )}
    </PageTransition>
  );
}
