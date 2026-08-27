import { Reveal } from "@/components/ui/Reveal";
import { SectionLabel } from "@/components/ui/SectionLabel";
import { MapExperience } from "@/components/MapExperience";
import { site } from "@/data/site";
import { allLocations, allPhotos } from "@/lib/archive";

const labelLines = site.mapLabel.split("\n");

export async function MapSection() {
  const locations = await allLocations();
  const photos = await allPhotos();
  return (
    <section id="map" className="pt-16">
      <header className="mx-auto max-w-[1600px] px-6 lg:px-10">
        <Reveal className="mt-20">
          <SectionLabel>MAP</SectionLabel>
        </Reveal>
        <Reveal delay={0.1} className="mt-14">
          <h1 className="headline text-[clamp(44px,8vw,104px)]">
            {labelLines.map((line, i) => (
              <span key={i} className="block">
                {line}
              </span>
            ))}
          </h1>
        </Reveal>
        <Reveal delay={0.2} className="mt-8">
          <p className="text-[17px] leading-relaxed text-muted">
            {site.mapHeadline.split("\n").map((line, i) => (
              <span key={i} className="block">
                {line}
              </span>
            ))}
          </p>
        </Reveal>
      </header>

      <section className="mx-auto mt-20 max-w-[1600px] px-6 pb-28 lg:mt-28 lg:px-10">
        <MapExperience locations={locations} photos={photos} />
      </section>
    </section>
  );
}
