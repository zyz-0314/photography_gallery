import "server-only";

import { cache } from "react";
import type {
  Collection,
  Location,
  Photograph,
  Project,
} from "@/types";
import { aspectFrom, photosForLocation } from "@/lib/photos";
import { imageUrl } from "@/lib/storage";
import {
  getCategories,
  getLocations,
  getPhotos,
  getProjects,
  isConnected,
} from "@/lib/store";

/**
 * PUBLIC data access layer. Reads the archive's JSON files from the GitHub
 * private repo (server-side token). Only published photos are surfaced.
 * Every helper shares one cached fetch per request; the store adds a short
 * TTL so the GitHub API isn't hit on every request. When GitHub isn't
 * connected the archive is empty and pages render graceful empty states.
 */

interface Archive {
  photos: Photograph[];
  locations: Location[];
  collections: Collection[];
  projects: Project[];
}

const buildArchive = async (): Promise<Archive> => {
  const empty: Archive = {
    photos: [],
    locations: [],
    collections: [],
    projects: [],
  };
  if (!isConnected()) return empty;

  try {
    const [storedPhotos, storedCats, storedLocs, storedProjects] =
      await Promise.all([getPhotos(), getCategories(), getLocations(), getProjects()]);

    const catByName = new Map(storedCats.map((c) => [c.slug, c.name]));
    const locBySlug = new Map(storedLocs.map((l) => [l.slug, l]));

    const photos: Photograph[] = storedPhotos
      .filter((p) => p.status === "published")
      .map((row) => {
        const loc = row.locationSlug ? locBySlug.get(row.locationSlug) : undefined;
        return {
          id: row.slug,
          slug: row.slug,
          src: imageUrl(row.imagePath),
          thumb: imageUrl(row.thumbPath),
          title: row.title || row.slug,
          location: loc?.name ?? "",
          locationSlug: row.locationSlug ?? "",
          country: loc?.country ?? "",
          latitude: loc?.latitude ?? 0,
          longitude: loc?.longitude ?? 0,
          year: row.year,
          categories: row.categorySlugs.map((s) => catByName.get(s) ?? s),
          projects: row.projectSlugs,
          featured: row.featured,
          description: row.description,
          camera: row.camera,
          lens: row.lens,
          focalLength: row.focalLength,
          aperture: row.aperture,
          shutterSpeed: row.shutterSpeed,
          iso: row.iso,
          takenAt: row.takenAt,
          width: row.width,
          height: row.height,
          aspect: aspectFrom(row.width, row.height),
          status: row.status,
        };
      });

    const locations: Location[] = (() => {
      const allLocs: Location[] = storedLocs.map((row) => ({
        slug: row.slug,
        name: row.name,
        country: row.country,
        latitude: row.latitude,
        longitude: row.longitude,
        region: row.region ?? false,
        parent: row.parentSlug,
        year: row.year ?? 0,
        intro: row.intro,
        coverId: "",
        photoIds: [],
      }));
      return allLocs.map((loc) => {
        const own = photosForLocation(loc.slug, allLocs, photos);
        const cover = own[0];
        return { ...loc, coverId: cover?.slug ?? "", photoIds: own.map((p) => p.slug) };
      });
    })();

    const collections: Collection[] = storedCats
      .slice()
      .sort((a, b) => a.sortOrder - b.sortOrder)
      .map((cat) => {
        const name = cat.name;
        const first = photos.find((p) => p.categories.some((c) => c === name));
        // An admin-picked cover wins; fall back to the first photo in the
        // category. Only published photos are in `photos`, so a cover pointing
        // at a draft or deleted photo degrades to the fallback.
        const cover =
          (cat.coverPhotoSlug
            ? photos.find((p) => p.slug === cat.coverPhotoSlug)
            : undefined) ?? first;
        return {
          slug: cat.slug,
          title: name,
          nameZh: cat.nameZh,
          subtitle: cat.subtitle ?? "",
          posterLine: cat.posterLine ?? "",
          coverId: cover?.slug ?? "",
        };
      });

    const projects: Project[] = storedProjects
      .slice()
      .sort((a, b) => a.sortOrder - b.sortOrder)
      .map((row) => {
        // A photo belongs to a project if the project lists it (photoSlugs) OR
        // the photo lists the project (projectSlugs) — the admin writes both
        // sides separately, so either may be populated.
        const members = photos.filter(
          (p) => row.photoSlugs.includes(p.slug) || p.projects?.includes(row.slug)
        );
        const categories = [...new Set(members.flatMap((m) => m.categories))];
        const cover =
          members.find((m) => m.slug === row.coverPhotoSlug) ?? members[0];
        return {
          slug: row.slug,
          number: row.number ?? "",
          title: row.title,
          location: row.location ?? "",
          country: row.country ?? "",
          year: row.year ?? 0,
          categories,
          description: row.description ?? "",
          coverId: cover?.slug ?? "",
          photoIds: members.map((m) => m.slug),
          direction: row.direction,
        };
      });

    return { photos, locations, collections, projects };
  } catch {
    return empty;
  }
};

/** One shared fetch per request, reused by every helper below. */
export const getArchive = cache(buildArchive);

export const allPhotos = async (): Promise<Photograph[]> =>
  (await getArchive()).photos;

export const featured = async (): Promise<Photograph[]> =>
  (await getArchive()).photos.filter((p) => p.featured);

export const byCategory = async (nameOrSlug: string): Promise<Photograph[]> => {
  const q = nameOrSlug.toLowerCase();
  return (await getArchive()).photos.filter((p) =>
    p.categories.some((c) => c.toLowerCase() === q)
  );
};

export const byProject = async (slug: string): Promise<Photograph[]> =>
  (await getArchive()).photos.filter((p) => p.projects?.includes(slug));

export const byLocation = async (slug: string): Promise<Photograph[]> =>
  (await getArchive()).photos.filter((p) => p.locationSlug === slug);

/** Look up by photo slug (what coverId / photoIds reference). */
export const byId = async (slug: string): Promise<Photograph | undefined> =>
  (await getArchive()).photos.find((p) => p.slug === slug);

export const bySlug = byId;

export const byIds = async (slugs: string[]): Promise<Photograph[]> => {
  const archive = (await getArchive()).photos;
  const map = new Map(archive.map((p) => [p.slug, p]));
  return slugs
    .map((slug) => map.get(slug))
    .filter((p): p is Photograph => Boolean(p));
};

export const allLocations = async (): Promise<Location[]> =>
  (await getArchive()).locations;

export const getLocation = async (
  slug: string
): Promise<Location | undefined> =>
  (await getArchive()).locations.find((l) => l.slug === slug);

export const allCollections = async (): Promise<Collection[]> =>
  (await getArchive()).collections;

export const getCollection = async (
  slug: string
): Promise<Collection | undefined> =>
  (await getArchive()).collections.find((c) => c.slug === slug);

export const allProjects = async (): Promise<Project[]> =>
  (await getArchive()).projects;

export const getProject = async (
  slug: string
): Promise<Project | undefined> =>
  (await getArchive()).projects.find((p) => p.slug === slug);
