import type { Photograph } from "@/types";

/** Compact "LOCATION — COUNTRY · YEAR" line used on hover and in captions. */
export function PhotoMeta({ photo }: { photo: Photograph }) {
  const parts = [photo.location, photo.country, String(photo.year)].filter(
    Boolean
  );
  return <span className="label text-muted">{parts.join(" · ")}</span>;
}

/** Multi-line metadata block for the lightbox footer. */
export function MetadataDisplay({
  photo,
}: {
  photo: Photograph;
}) {
  const rows: [string, string][] = [];
  if (photo.location || photo.country)
    rows.push(["PLACE", [photo.location, photo.country].filter(Boolean).join(", ")]);
  rows.push(["YEAR", String(photo.year)]);
  if (photo.camera) rows.push(["CAMERA", photo.camera]);
  if (photo.lens) rows.push(["LENS", photo.lens]);
  if (photo.title) rows.unshift(["TITLE", photo.title]);

  return (
    <div className="grid grid-cols-1 gap-x-8 gap-y-2 sm:grid-cols-2 lg:grid-cols-[1fr_auto_auto_auto_auto]">
      {rows.map(([k, v]) => (
        <div key={k} className="flex flex-col gap-0.5">
          <span className="label-sm text-faint">{k}</span>
          <span className="text-[13px] text-muted">{v}</span>
        </div>
      ))}
    </div>
  );
}

const formatDate = (iso: string) =>
  new Date(iso).toLocaleDateString("en-GB", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });

/** Full spec grid for the lightbox info panel — only non-empty fields. */
export function PhotoDetails({ photo }: { photo: Photograph }) {
  const rows: [string, string][] = [];
  if (photo.camera) rows.push(["CAMERA", photo.camera]);
  if (photo.lens) rows.push(["LENS", photo.lens]);
  if (photo.focalLength) rows.push(["FOCAL LENGTH", photo.focalLength]);
  if (photo.aperture) rows.push(["APERTURE", photo.aperture]);
  if (photo.shutterSpeed) rows.push(["SHUTTER", photo.shutterSpeed]);
  if (photo.iso) rows.push(["ISO", photo.iso]);
  if (photo.takenAt) rows.push(["TAKEN ON", formatDate(photo.takenAt)]);
  if (photo.categories.length > 0)
    rows.push(["CATEGORIES", photo.categories.join(" / ")]);

  if (rows.length === 0) return null;

  return (
    <dl className="flex flex-col gap-3">
      {rows.map(([k, v]) => (
        <div
          key={k}
          className="flex items-baseline justify-between gap-6 border-b border-line-soft/60 pb-2.5"
        >
          <dt className="label-sm shrink-0 text-faint">{k}</dt>
          <dd className="text-right text-[13px] text-muted">{v}</dd>
        </div>
      ))}
    </dl>
  );
}
