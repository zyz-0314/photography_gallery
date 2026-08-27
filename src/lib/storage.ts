/**
 * URL helpers for repo images, served through the app's proxy route
 * (`/api/images/…`). The GitHub token never reaches the client — the server
 * fetches the bytes. Isomorphic: only builds strings.
 */

/** App URL that streams an image from the private repo. */
export const imageUrl = (path: string) =>
  `/api/images/${path.split("/").map(encodeURIComponent).join("/")}`;

/** Derive the thumbnail app URL from an original image path. */
export const thumbUrl = (imagePath: string) =>
  imageUrl(imagePath.replace(/\.[^.]+$/, ".thumb.webp"));
