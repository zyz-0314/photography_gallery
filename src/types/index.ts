/** Categories are DB rows now — free-form names. */
export type Category = string;

export type PhotoStatus = "draft" | "published";

/** CSS aspect-ratio value, e.g. "3/4". Drives layout before the image loads. */
export type Aspect = "1/1" | "3/4" | "4/5" | "2/3" | "4/3" | "3/2" | "16/9" | "21/9";

/**
 * A photograph as the PUBLIC site sees it — always a published record from
 * the repo, hydrated with its location, categories and project memberships.
 */
export interface Photograph {
  id: string;
  slug: string;
  /** Optimized display URL (served through the app's image proxy). */
  src: string;
  /** Thumbnail URL (~640px). */
  thumb: string;
  title: string;
  location: string;
  /** Slug of the location row, used for map / timeline grouping. */
  locationSlug: string;
  country: string;
  latitude: number;
  longitude: number;
  year?: number;
  categories: Category[];
  /** Slugs of every project this photo belongs to. */
  projects?: string[];
  /** Legacy singular project slug — kept for the reference data copy. */
  project?: string;
  /** Legacy free-form tags — kept for the reference data copy. */
  tags?: string[];
  featured?: boolean;
  description?: string;
  camera?: string;
  lens?: string;
  focalLength?: string;
  aperture?: string;
  shutterSpeed?: string;
  iso?: string;
  /** ISO date the photograph was taken, from EXIF. */
  takenAt?: string;
  width?: number;
  height?: number;
  aspect: Aspect;
  status: PhotoStatus;
}

export interface Collection {
  slug: string;
  title: string;
  /** Chinese display name, e.g. 风光摄影 (falls back to a known-slug map). */
  nameZh?: string;
  /** One-line subtitle shown on the archive page. */
  subtitle: string;
  /** Short line revealed on poster hover. */
  posterLine: string;
  coverId: string;
}

export interface Project {
  slug: string;
  number: string;
  title: string;
  location: string;
  country: string;
  year: number;
  categories: Category[];
  description: string;
  coverId: string;
  photoIds: string[];
  /** Alternate layout direction for MAIN featured previews. */
  direction: "left" | "right" | "wide";
}

export interface Location {
  slug: string;
  name: string;
  country: string;
  latitude: number;
  longitude: number;
  year: number;
  /** True when this location groups sub-locations (e.g. South Island). */
  region?: boolean;
  /** Slug of the parent location, if any. */
  parent?: string;
  intro?: string;
  coverId: string;
  photoIds: string[];
}

// ——————————————————————————————————————————————
// CMS / admin shapes
// ——————————————————————————————————————————————

/** Everything the admin can set on a photograph. */
export interface PhotoInput {
  slug?: string;
  title?: string | null;
  description?: string | null;
  year?: number | null;
  camera?: string | null;
  lens?: string | null;
  focalLength?: string | null;
  aperture?: string | null;
  shutterSpeed?: string | null;
  iso?: string | null;
  featured?: boolean;
  status: PhotoStatus;
  width?: number | null;
  height?: number | null;
  takenAt?: string | null;
  locationId?: string | null;
  categoryIds: string[];
  projectIds: string[];
}

/** A photograph as the admin sees it — every row, any status. */
export interface AdminPhoto {
  id: string;
  slug: string;
  imagePath: string;
  title: string;
  description?: string | null;
  year?: number | null;
  status: PhotoStatus;
  featured: boolean;
  camera?: string | null;
  lens?: string | null;
  focalLength?: string | null;
  aperture?: string | null;
  shutterSpeed?: string | null;
  iso?: string | null;
  takenAt?: string | null;
  width?: number | null;
  height?: number | null;
  created_at: string;
  location?: { id: string; slug: string; name: string; country: string } | null;
  categories: { id: string; name: string }[];
  projects: { id: string; slug: string; title: string }[];
}

export interface CategoryInput {
  name: string;
  slug?: string;
  subtitle?: string;
  posterLine?: string;
  sortOrder?: number;
}

export interface LocationInput {
  name: string;
  slug?: string;
  country: string;
  latitude: number;
  longitude: number;
  year?: number | null;
  region?: boolean;
  parentId?: string | null;
  intro?: string;
  sortOrder?: number;
}

export interface ProjectInput {
  title: string;
  slug?: string;
  number?: string;
  location?: string;
  country?: string;
  year?: number | null;
  description?: string;
  direction?: "left" | "right" | "wide";
  coverPhotoId?: string | null;
  sortOrder?: number;
  /** Photo ids (or slugs) that belong to the project. */
  photoIds?: string[];
}

// ——————————————————————————————————————————————
// GitHub data store (JSON files in the private repo)
// ——————————————————————————————————————————————

/** A photograph as stored in `data/photos.json` (drafts included). */
export interface StoredPhoto {
  slug: string;
  /** Repo-relative path of the original image, e.g. images/2026/auckland/a.jpg */
  imagePath: string;
  /** Repo-relative path of the generated thumbnail. */
  thumbPath: string;
  title: string;
  description?: string;
  year?: number;
  camera?: string;
  lens?: string;
  focalLength?: string;
  aperture?: string;
  shutterSpeed?: string;
  iso?: string;
  takenAt?: string;
  width?: number;
  height?: number;
  featured: boolean;
  status: PhotoStatus;
  locationSlug?: string;
  categorySlugs: string[];
  projectSlugs: string[];
  createdAt?: string;
}

export interface StoredCategory {
  name: string;
  slug: string;
  subtitle?: string;
  posterLine?: string;
  sortOrder: number;
  /** Chinese display name, e.g. 风光摄影. */
  nameZh?: string;
  /** Slug of the photograph used as this collection's cover. */
  coverPhotoSlug?: string;
}

export interface StoredLocation {
  name: string;
  slug: string;
  country: string;
  latitude: number;
  longitude: number;
  region?: boolean;
  parentSlug?: string;
  intro?: string;
  year?: number;
  sortOrder: number;
}

export interface StoredProject {
  title: string;
  slug: string;
  number?: string;
  location?: string;
  country?: string;
  year?: number;
  description?: string;
  direction: "left" | "right" | "wide";
  coverPhotoSlug?: string;
  sortOrder: number;
  photoSlugs: string[];
}

export interface StoredSettings {
  adminPasscodeHash?: string;
  githubRepoOwner?: string;
  githubRepoName?: string;
}
