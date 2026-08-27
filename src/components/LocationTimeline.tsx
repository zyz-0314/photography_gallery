"use client";

import Link from "next/link";
import type { Location, Photograph } from "@/types";
import { photosForLocation } from "@/lib/photos";

function LocationRow({
  loc,
  locations,
  photos,
  indent,
}: {
  loc: Location;
  locations: Location[];
  photos: Photograph[];
  indent?: number;
}) {
  const count = photosForLocation(loc.slug, locations, photos).length;
  const children = locations.filter((l) => l.parent === loc.slug);
  return (
    <div>
      <Link
        href={`/location/${loc.slug}`}
        className="flex items-baseline justify-between gap-4 border-t border-line-soft py-4"
        style={{ paddingLeft: indent ?? 0 }}
      >
        <span className="text-[17px] text-paper">
          {loc.name}
          {loc.region && (
            <span className="label-sm ml-3 align-middle text-faint">REGION</span>
          )}
        </span>
        <span className="label-sm shrink-0 text-faint">
          {loc.year} · {count}
        </span>
      </Link>
      {children.map((child) => (
        <LocationRow
          key={child.slug}
          loc={child}
          locations={locations}
          photos={photos}
          indent={26}
        />
      ))}
    </div>
  );
}

/** Mobile-friendly alternative to the map: a travel-journal list. */
export function LocationTimeline({
  locations,
  photos,
}: {
  locations: Location[];
  photos: Photograph[];
}) {
  const top = locations.filter((l) => !l.parent);
  const byCountry: { country: string; list: Location[] }[] = [];
  top.forEach((l) => {
    const group = byCountry.find((g) => g.country === l.country);
    if (group) group.list.push(l);
    else byCountry.push({ country: l.country, list: [l] });
  });

  return (
    <div className="flex flex-col">
      {byCountry.map((group) => (
        <div key={group.country}>
          <div className="flex items-center gap-4 py-3">
            <span className="h-px flex-1 bg-line" />
            <span className="label text-faint">{group.country.toUpperCase()}</span>
          </div>
          {group.list.map((loc) => (
            <LocationRow
              key={loc.slug}
              loc={loc}
              locations={locations}
              photos={photos}
            />
          ))}
        </div>
      ))}
    </div>
  );
}
