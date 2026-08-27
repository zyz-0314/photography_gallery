import {
  geoNaturalEarth1,
  geoPath,
  type GeoProjection,
  type GeoSphere,
} from "d3-geo";
import { feature } from "topojson-client";
import type { Topology, GeometryCollection } from "topojson-specification";
import type { FeatureCollection, Feature, Geometry } from "geojson";
import worldTopo from "@/data/world-countries-110m.json";

/**
 * MAP COORDINATE SYSTEM
 * ---------------------
 * This is a CUSTOM vector map — not Mapbox/Google. The base map is a Natural
 * Earth projection (d3-geo `geoNaturalEarth1`) rendered as SVG <path>s from
 * vendored world-atlas TopoJSON: every country outline is a projected polygon
 * of real lat/lon data. The projection IS the lat/lon → pixel mapping; there
 * is no raster image to align against.
 *
 * Projection & bounds (viewBox units, MAP_W×MAP_H = 1000×520):
 *   longitude  -180 … +180   →  px  0 … 1000
 *   latitude    -90 …  +90   →  py  0 … 520
 * Natural Earth is a pseudocylindrical projection fit to the whole sphere via
 * `fitExtent`; the poles land on the top/bottom edges.
 *
 * Lat/lon → screen for a given view transform {x, y, k} (the SAME transform
 * applied to the land group and inherited by every marker):
 *   [px, py] = projectPoint(latitude, longitude)
 *   screenX  = x + k * px
 *   screenY  = y + k * py
 *
 * Markers must never be placed at fixed pixel coordinates — they are derived
 * from this projection + the shared view transform, so zooming, panning and
 * responsive re-layout keep them glued to their real geographic position.
 */

export interface Transform {
  x: number;
  y: number;
  k: number;
}

/** Fixed viewBox for the map. Natural Earth fits a ~2:1 world. */
export const MAP_W = 1000;
export const MAP_H = 520;

type CountryProperties = { name?: string };
type CountryFeature = Feature<Geometry, CountryProperties>;

let geoFeatures: CountryFeature[] | null = null;

/** World country features (GeoJSON), converted once from the vendored TopoJSON. */
export function countries(): CountryFeature[] {
  if (geoFeatures) return geoFeatures;
  const topo = worldTopo as unknown as Topology;
  const collection = topo.objects.countries as GeometryCollection;
  const fc = feature<CountryProperties>(topo, collection) as FeatureCollection<
    Geometry,
    CountryProperties
  >;
  geoFeatures = fc.features.filter(
    (f) => f.geometry && f.geometry.type !== null
  );
  return geoFeatures;
}

/** Feature(s) for a country by display name, e.g. "New Zealand". */
export function countryFeatures(name: string): CountryFeature[] {
  return countries().filter((f) => f.properties?.name === name);
}

let _projection: GeoProjection | null = null;
function projection(): GeoProjection {
  if (_projection) return _projection;
  _projection = geoNaturalEarth1().fitExtent(
    [
      [0, 0],
      [MAP_W, MAP_H],
    ],
    { type: "Sphere" } as GeoSphere
  );
  return _projection;
}

const path = () => geoPath(projection());

/** Project lat/lng into viewBox pixel space (0…MAP_W, 0…MAP_H). Returns [px, py]. */
export function projectPoint(
  latitude: number,
  longitude: number
): [number, number] {
  const p = projection()([longitude, latitude]) ?? [0, 0];
  return [p[0], p[1]];
}

/** Land path `d` strings for every country, in world space. */
export function landPaths(): string[] {
  return countries().map((f) => path()(f) ?? "");
}

/** Fits a set of projected points into the viewBox with padding. */
export function zoomToPoints(
  points: [number, number][],
  pad = 90
): Transform {
  if (points.length === 0) return { x: 0, y: 0, k: 1 };
  const xs = points.map((p) => p[0]);
  const ys = points.map((p) => p[1]);
  const minX = Math.min(...xs);
  const maxX = Math.max(...xs);
  const minY = Math.min(...ys);
  const maxY = Math.max(...ys);
  return zoomToBox(minX, minY, maxX, maxY, pad);
}

export function zoomToBox(
  minX: number,
  minY: number,
  maxX: number,
  maxY: number,
  pad = 90
): Transform {
  const bw = Math.max(1, maxX - minX);
  const bh = Math.max(1, maxY - minY);
  // Padding is in screen space: subtract it from the available area.
  const k = Math.max(
    1,
    Math.min((MAP_W - pad * 2) / bw, (MAP_H - pad * 2) / bh, 60)
  );
  const cx = (minX + maxX) / 2;
  const cy = (minY + maxY) / 2;
  return { k, x: MAP_W / 2 - k * cx, y: MAP_H / 2 - k * cy };
}

/** Fit a country (by name) into the viewBox. */
export function zoomToCountry(name: string): Transform | null {
  const features = countryFeatures(name);
  if (features.length === 0) return null;
  const pathFn = path();
  let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;
  for (const f of features) {
    const b = pathFn.bounds(f);
    minX = Math.min(minX, b[0][0]);
    minY = Math.min(minY, b[0][1]);
    maxX = Math.max(maxX, b[1][0]);
    maxY = Math.max(maxY, b[1][1]);
  }
  return zoomToBox(minX, minY, maxX, maxY, 90);
}

export const identity: Transform = { x: 0, y: 0, k: 1 };
