import { PageTransition } from "@/components/ui/PageTransition";
import { MainSection } from "@/components/sections/MainSection";
import { AboutSection } from "@/components/sections/AboutSection";
import { CollectionsSection } from "@/components/sections/CollectionsSection";
import { MapSection } from "@/components/sections/MapSection";
import { ContactSection } from "@/components/sections/ContactSection";

// The archive is DB-driven: render at request time so newly published
// photographs appear without a rebuild.
export const dynamic = "force-dynamic";

export default function HomePage() {
  return (
    <PageTransition>
      <MainSection />
      <AboutSection />
      <CollectionsSection />
      <MapSection />
      <ContactSection />
    </PageTransition>
  );
}
