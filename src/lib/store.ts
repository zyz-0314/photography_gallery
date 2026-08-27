import "server-only";

import { GitHubError, readFile, readRaw, repoRef, isGitHubConfigured } from "@/lib/github";
import type {
  StoredCategory,
  StoredLocation,
  StoredPhoto,
  StoredProject,
} from "@/types";

/**
 * READ-ONLY GitHub data store for the public site. Loads the archive's JSON
 * files and serves images. All writes happen in the separate admin app.
 * Reads are cached briefly to stay off the GitHub rate limit.
 */

const FILES = {
  photos: "data/photos.json",
  categories: "data/categories.json",
  locations: "data/locations.json",
  projects: "data/projects.json",
} as const;

export const isConnected = () => Boolean(isGitHubConfigured() && repoRef());

const ref = (): { owner: string; name: string } => {
  const r = repoRef();
  if (!r) throw new Error("GitHub is not connected.");
  return r;
};

const cache = new Map<string, { data: unknown; ts: number }>();
const TTL = 60_000;

const key = (file: string) => `${ref().owner}/${ref().name}:${file}`;async function readJson<T>(file: string, fallback: T): Promise<T> {
  const k = key(file);
  const hit = cache.get(k);
  if (hit && Date.now() - hit.ts < TTL) return hit.data as T;
  const { owner, name } = ref();
  try {
    const { content } = await readFile(owner, name, file);
    const data = JSON.parse(content) as T;
    cache.set(k, { data, ts: Date.now() });
    return data;
  } catch (err) {
    // Missing file / empty repo → fall back to the empty shape.
    if (err instanceof GitHubError && err.status === 404) return fallback;
    throw err;
  }
}

export const getPhotos = () => readJson<StoredPhoto[]>(FILES.photos, []);
export const getCategories = () => readJson<StoredCategory[]>(FILES.categories, []);
export const getLocations = () => readJson<StoredLocation[]>(FILES.locations, []);
export const getProjects = () => readJson<StoredProject[]>(FILES.projects, []);

/** Read an image from the repo (bytes) for the /api/images proxy. Cached + concurrency-limited. */
const imageCache = new Map<string, { buf: Buffer; ts: number }>();
const imageInflight = new Map<string, Promise<Buffer>>();
// Images are immutable once uploaded (unique slugs) — a long cache is safe.
const IMAGE_CACHE_TTL = 24 * 60 * 60 * 1000;
// GitHub throttles bursts on the Contents API; a few parallel fetches keep us clear.
const MAX_CONCURRENT_FETCHES = 3;
let activeFetches = 0;
const fetchQueue: Array<() => void> = [];

function acquireFetch(): Promise<void> {
  return new Promise((resolve) => {
    const go = () => {
      if (activeFetches < MAX_CONCURRENT_FETCHES) {
        activeFetches += 1;
        resolve();
      } else {
        fetchQueue.push(go);
      }
    };
    go();
  });
}

function releaseFetch(): void {
  activeFetches -= 1;
  fetchQueue.shift()?.();
}

export async function readImage(path: string): Promise<Buffer> {
  const { owner, name } = ref();
  const k = `${owner}/${name}:${path}`;
  const hit = imageCache.get(k);
  if (hit && Date.now() - hit.ts < IMAGE_CACHE_TTL) return hit.buf;
  const inFlight = imageInflight.get(k);
  if (inFlight) return inFlight;
  const promise = (async () => {
    await acquireFetch();
    try {
      const buf = await readRaw(owner, name, path);
      imageCache.set(k, { buf, ts: Date.now() });
      return buf;
    } finally {
      releaseFetch();
    }
  })();
  imageInflight.set(k, promise);
  try {
    return await promise;
  } finally {
    imageInflight.delete(k);
  }
}
