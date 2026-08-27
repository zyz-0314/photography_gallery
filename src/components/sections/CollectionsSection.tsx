import { Reveal } from "@/components/ui/Reveal";
import { SectionLabel } from "@/components/ui/SectionLabel";
import { PosterCollection } from "@/components/PosterCollection";
import { site } from "@/data/site";
import { allCollections, allPhotos } from "@/lib/archive";

const lines = site.collectionsSubtitle.split("\n");

export async function CollectionsSection() {
  const collections = await allCollections();
  const photos = await allPhotos();
  return (
    <section id="collections" className="pt-16">
      <section className="mx-auto max-w-[1600px] px-6 lg:px-10">
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
      </section>

      <section className="mx-auto max-w-[1600px] px-6 py-24 lg:px-10 lg:py-32">
        <PosterCollection collections={collections} photos={photos} />
      </section>
    </section>
  );
}
