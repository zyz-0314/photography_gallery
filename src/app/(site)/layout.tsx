import { LightboxProvider } from "@/components/lightbox/LightboxProvider";
import { SmoothScroll } from "@/components/SmoothScroll";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { DisableRightClick } from "@/components/DisableRightClick";
import { DevToolsGuard } from "@/components/DevToolsGuard";

export default function SiteLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <LightboxProvider>
      <DisableRightClick />
      <DevToolsGuard />
      <SmoothScroll />
      <Navbar />
      {children}
      <Footer />
    </LightboxProvider>
  );
}
