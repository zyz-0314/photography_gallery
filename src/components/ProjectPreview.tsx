import Link from "next/link";
import type { Project } from "@/types";
import { byId } from "@/lib/archive";
import { photoRatio } from "@/lib/photos";
import { SmartImage } from "@/components/ui/SmartImage";
import { Reveal } from "@/components/ui/Reveal";
import { cx } from "@/lib/cx";

/** Quiet "VIEW PROJECT →" link. */
export function ProjectLink({ slug }: { slug: string }) {
  return (
    <Link
      href={`/project/${slug}`}
      className="label group inline-flex items-center gap-3 text-muted transition-colors hover:text-paper"
    >
      VIEW PROJECT
      <span className="transition-transform duration-500 group-hover:translate-x-1.5">
        →
      </span>
    </Link>
  );
}

/** One featured project as an alternating editorial chapter. */
export async function ProjectPreview({ project }: { project: Project }) {
  const cover = await byId(project.coverId);
  const dir = project.direction;

  const meta = (
    <p className="label text-muted">
      {[project.location, project.year ? String(project.year) : ""]
        .filter(Boolean)
        .join(" · ")}
    </p>
  );

  const textBlock = (
    <div className="flex flex-col gap-6">
      <span className="font-display text-sm text-faint">{project.number}</span>
      <Link
        href={`/project/${project.slug}`}
        className="headline text-[clamp(34px,4.4vw,54px)] text-paper transition-colors hover:text-muted"
      >
        {project.title}
      </Link>
      {meta}
      <p className="label text-faint">
        {project.categories.join(" / ")}
      </p>
      <p className="max-w-[46ch] text-[15px] leading-relaxed text-muted">
        {project.description}
      </p>
      <ProjectLink slug={project.slug} />
    </div>
  );

  const image = cover && (
    <Link href={`/project/${project.slug}`} className="group block">
      <SmartImage
        src={cover.src}
        alt={cover.title}
        natural
        aspect={photoRatio(cover)}
        priority
        imgClassName="transition-transform duration-[1600ms] ease-out group-hover:scale-[1.03]"
        meta={{ location: cover.location, country: cover.country, year: cover.year }}
      />
    </Link>
  );

  if (dir === "wide") {
    return (
      <Reveal className="grid gap-8">
        {image}
        <div className="grid items-start gap-8 md:grid-cols-[1fr_auto]">
          <div className="max-w-[62ch]">{textBlock}</div>
          <span className="label hidden self-end justify-self-end pb-2 text-faint md:block">
            PROJECT {project.number}
          </span>
        </div>
      </Reveal>
    );
  }

  const isLeft = dir === "left";
  return (
    <Reveal className="grid items-center gap-10 md:grid-cols-12 md:gap-6">
      <div className={cx("md:col-span-7", !isLeft && "md:order-2")}>{image}</div>
      <div
        className={cx(
          "md:col-span-4",
          isLeft ? "md:col-start-9" : "md:col-start-2",
          !isLeft && "md:order-1"
        )}
      >
        {textBlock}
      </div>
    </Reveal>
  );
}
