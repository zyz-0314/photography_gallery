import Link from "next/link";
import { notFound } from "next/navigation";
import { PageTransition } from "@/components/ui/PageTransition";
import { Reveal } from "@/components/ui/Reveal";
import { LocationGallery } from "@/components/LocationGallery";
import { allLocations, allPhotos, byIds, getLocation } from "@/lib/archive";
import { photosForLocation } from "@/lib/photos";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const loc = await getLocation(slug);
  return {
    title: `R1YADJAME — ${loc?.name ?? "Location"}`,
    description: loc?.intro,
  };
}

export default async function LocationPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const [loc, locations, photos] = await Promise.all([
    getLocation(slug),
    allLocations(),
    allPhotos(),
  ]);
  if (!loc) notFound();

  const gallery = await byIds(loc.photoIds);
  const children = locations.filter((l) => l.parent === slug);
  const siblings = locations.filter((l) => l.parent === loc.parent);

  return (
    <PageTransition className="pt-16">
      <header className="mx-auto max-w-[1600px] px-6 lg:px-10">
        <Reveal className="mt-20">
          <Link
            href="/#map"
            className="label text-muted transition-colors hover:text-paper"
          >
            ← BACK TO THE MAP
          </Link>
        </Reveal>

        <Reveal delay={0.1} className="mt-14 flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
          <h1 className="headline text-[clamp(44px,8vw,104px)]">
            {loc.name}
          </h1>
          <p className="label shrink-0 pb-3 text-muted">
            {loc.country.toUpperCase()} · {loc.year} ·{" "}
            {gallery.length} PHOTOGRAPHS
          </p>
        </Reveal>

        <Reveal delay={0.2} className="mt-8 max-w-[52ch]">
          <p className="text-[16px] leading-[1.8] text-muted">{loc.intro}</p>
        </Reveal>

        {children.length > 0 && (
          <Reveal delay={0.25} className="mt-14">
            <p className="label mb-4 text-faint">EXPLORE THIS REGION</p>
            <div className="flex flex-col border-t border-line-soft">
              {children.map((child) => (
                <Link
                  key={child.slug}
                  href={`/location/${child.slug}`}
                  className="group flex items-baseline justify-between border-b border-line-soft py-4"
                >
                  <span className="text-[17px] text-paper transition-colors group-hover:text-muted">
                    {child.name}
                  </span>
                  <span className="label-sm text-faint">
                    {photosForLocation(child.slug, locations, photos).length} PHOTOGRAPHS →
                  </span>
                </Link>
              ))}
            </div>
          </Reveal>
        )}
      </header>

      <section className="mx-auto mt-20 max-w-[1600px] px-6 pb-20 lg:mt-28 lg:px-10">
        <LocationGallery photos={gallery} />
      </section>

      <nav className="mx-auto mt-10 max-w-[1600px] border-t border-line-soft px-6 py-16 lg:px-10">
        {siblings.length > 1 ? (
          <div className="flex flex-wrap items-center justify-between gap-4">
            <span className="label text-faint">ALSO IN {loc.country.toUpperCase()}</span>
            <div className="flex flex-wrap gap-x-6 gap-y-2">
              {siblings
                .filter((s) => s.slug !== loc.slug)
                .map((s) => (
                  <Link
                    key={s.slug}
                    href={`/location/${s.slug}`}
                    className="label text-muted transition-colors hover:text-paper"
                  >
                    {s.name} →
                  </Link>
                ))}
            </div>
          </div>
        ) : (
          <Link href="/#map" className="label text-muted transition-colors hover:text-paper">
            EXPLORE THE MAP →
          </Link>
        )}
      </nav>
    </PageTransition>
  );
}
