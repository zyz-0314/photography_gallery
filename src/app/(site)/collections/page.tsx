import type { Metadata } from "next";
import type { Photograph } from "@/types";
import { PageTransition } from "@/components/ui/PageTransition";
import { Reveal } from "@/components/ui/Reveal";
import { SectionLabel } from "@/components/ui/SectionLabel";
import { CollectionPosterWall } from "@/components/CollectionPosterWall";
import { allCollections, allPhotos } from "@/lib/archive";
import { site } from "@/data/site";
import { collectionNameZh } from "@/data/collectionMeta";

// The archive is DB-driven: render at request time so a freshly picked cover
// or newly published photograph shows up without a rebuild.
export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "R1YADJAME — COLLECTIONS",
};

const lines = site.collectionsSubtitle.split("\n");

export default async function CollectionsPage() {
  const [collections, photos] = await Promise.all([
    allCollections(),
    allPhotos(),
  ]);

  const enriched = collections.map((c) => ({
    ...c,
    nameZh: c.nameZh || collectionNameZh(c.slug),
  }));

  const coverBySlug = new Map(photos.map((p) => [p.slug, p]));
  const counts: Record<string, number> = {};
  const covers: Photograph[] = [];
  for (const c of enriched) {
    counts[c.slug] = photos.filter((p) => p.categories.includes(c.title)).length;
    const cover = coverBySlug.get(c.coverId);
    if (cover) covers.push(cover);
  }

  return (
    <PageTransition className="pt-16">
      <header className="mx-auto max-w-[1600px] px-6 lg:px-10">
        <Reveal className="mt-20">
          <SectionLabel>{site.collectionsLabel}</SectionLabel>
        </Reveal>
        <h1 className="headline mt-14 text-[clamp(46px,8vw,104px)]">
          {lines.map((line, i) => (
            <span key={i} className="block">
              {line}
            </span>
          ))}
        </h1>
      </header>

      <section className="mx-auto mt-16 max-w-[1600px] px-6 pb-24 lg:mt-24 lg:px-10 lg:pb-32">
        {enriched.length === 0 ? (
          <p className="label text-faint">NO COLLECTIONS YET.</p>
        ) : (
          <CollectionPosterWall
            collections={enriched}
            covers={covers}
            counts={counts}
          />
        )}
      </section>
    </PageTransition>
  );
}
