import Link from "next/link";
import { notFound } from "next/navigation";
import { PageTransition } from "@/components/ui/PageTransition";
import { Reveal } from "@/components/ui/Reveal";
import { CollectionArchive } from "@/components/CollectionArchive";
import { titleCase } from "@/lib/titleCase";
import { allCollections, byCategory, getCollection } from "@/lib/archive";

// The archive is DB-driven: render at request time so newly published
// photographs appear without a rebuild.
export const dynamic = "force-dynamic";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const collection = await getCollection(slug);
  return {
    title: `R1YADJAME — ${collection?.title ?? "Collections"}`,
  };
}

export default async function CollectionPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const collection = await getCollection(slug);
  if (!collection) notFound();

  const photos = await byCategory(collection.title);
  const all = await allCollections();
  const idx = all.findIndex((c) => c.slug === slug);
  const next = all[(idx + 1) % all.length];

  return (
    <PageTransition className="pt-16">
      <header className="mx-auto max-w-[1600px] px-6 lg:px-10">
        <Reveal className="mt-20">
          <Link
            href="/#collections"
            className="label text-muted transition-colors hover:text-paper"
          >
            ← COLLECTIONS
          </Link>
        </Reveal>
        <Reveal delay={0.1} className="mt-14">
          <h1 className="headline text-[clamp(44px,8vw,104px)]">
            {titleCase(collection.title)}
          </h1>
          <p className="mt-6 max-w-[52ch] text-[16px] leading-relaxed text-muted">
            {collection.subtitle}
          </p>
        </Reveal>
      </header>

      <section className="mx-auto mt-24 max-w-[1600px] px-6 lg:mt-32 lg:px-10">
        <CollectionArchive photos={photos} />
      </section>

      {next && (
        <nav className="mx-auto mt-28 max-w-[1600px] border-t border-line-soft px-6 py-16 lg:mt-40 lg:px-10">
          <Link
            href={`/collections/${next.slug}`}
            className="group flex items-baseline justify-between gap-6"
          >
            <span className="label text-faint">NEXT COLLECTION</span>
            <span className="headline text-[clamp(28px,4vw,52px)] text-muted transition-colors group-hover:text-paper">
              {titleCase(next.title)} <span className="inline-block transition-transform duration-500 group-hover:translate-x-2">→</span>
            </span>
          </Link>
        </nav>
      )}
    </PageTransition>
  );
}
