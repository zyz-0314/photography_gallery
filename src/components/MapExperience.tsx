"use client";

import { useMediaQuery } from "@/hooks/useMediaQuery";
import { InteractiveMap } from "./InteractiveMap";
import { LocationTimeline } from "./LocationTimeline";
import type { Location, Photograph } from "@/types";

/**
 * Desktop gets the map; mobile gets a journal-style list instead of a
 * shrunken map. The media query starts false on the server, so first paint
 * always matches the desktop markup.
 */
export function MapExperience({
  locations,
  photos,
}: {
  locations: Location[];
  photos: Photograph[];
}) {
  const isMobile = useMediaQuery("(max-width: 767px)");

  return isMobile ? (
    <LocationTimeline locations={locations} photos={photos} />
  ) : (
    <InteractiveMap locations={locations} photos={photos} />
  );
}
