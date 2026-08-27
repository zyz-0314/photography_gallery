#!/usr/bin/env node
/**
 * Optimize the photography archive.
 *
 * Drop originals into  content/photos/<id>.jpg  and run:
 *
 *     npm run images
 *
 * This produces, for every file:
 *   public/photos/<id>.webp          — full-size, max 2400px, quality 82
 *   public/photos/<id>@thumb.webp    — thumbnail, 480px, quality 70
 *
 * The data layer references <id> by convention, so a photo dropped in and
 * optimized is live on every page that metadata places it on.
 */

import { readdir, stat, mkdir } from "node:fs/promises";
import path from "node:path";
import sharp from "sharp";

const SRC = path.resolve("content/photos");
const OUT = path.resolve("public/photos");
const EXTS = new Set([
  ".jpg", ".jpeg", ".png", ".webp", ".tif", ".tiff", ".avif", ".heic",
]);

async function main() {
  await mkdir(OUT, { recursive: true });

  let files;
  try {
    files = await readdir(SRC);
  } catch {
    console.log(`No ${path.relative(process.cwd(), SRC)} folder yet — nothing to do.`);
    return;
  }

  const images = files
    .filter((f) => EXTS.has(path.extname(f).toLowerCase()))
    .filter((f) => !f.startsWith("."));

  if (images.length === 0) {
    console.log("No images found. Drop originals into content/photos/ and re-run.");
    return;
  }

  console.log(`Optimizing ${images.length} image(s)…\n`);

  let done = 0;
  for (const file of images) {
    const id = path.basename(file, path.extname(file));
    const input = path.join(SRC, file);

    try {
      const meta = await sharp(input).metadata();
      const full = path.join(OUT, `${id}.webp`);
      const thumb = path.join(OUT, `${id}@thumb.webp`);

      await Promise.all([
        sharp(input)
          .rotate() // honour EXIF orientation
          .resize({ width: 2400, withoutEnlargement: true })
          .webp({ quality: 82 })
          .toFile(full),
        sharp(input)
          .rotate()
          .resize({ width: 480, withoutEnlargement: true })
          .webp({ quality: 70 })
          .toFile(thumb),
      ]);

      const size = (await stat(full)).size / 1024;
      done += 1;
      console.log(
        `  ✓ ${id}.webp${meta.orientation ? ` (orient ${meta.orientation})` : ""} — ${size.toFixed(0)} kB`
      );
    } catch (err) {
      console.error(`  ✗ ${file}: ${err instanceof Error ? err.message : err}`);
    }
  }

  console.log(`\nDone. ${done}/${images.length} images optimized → public/photos/`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
