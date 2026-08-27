"use client";

import { useEffect, useState } from "react";

interface Swatch {
  hex: string;
  count: number;
}

const toHex = (r: number, g: number, b: number) =>
  "#" +
  [r, g, b].map((v) => Math.round(v).toString(16).padStart(2, "0")).join("");

const colorDistance = (a: number[], b: number[]) =>
  Math.hypot(a[0] - b[0], a[1] - b[1], a[2] - b[2]);

/** Sample the image's dominant colors on a small canvas (same-origin proxy → readable). */
async function extractPalette(src: string, n = 5): Promise<Swatch[]> {
  return new Promise((resolve) => {
    const img = new Image();
    img.decoding = "async";
    img.onload = () => {
      try {
        const SIZE = 48;
        const canvas = document.createElement("canvas");
        canvas.width = SIZE;
        canvas.height = SIZE;
        const ctx = canvas.getContext("2d", { willReadFrequently: true });
        if (!ctx) return resolve([]);
        ctx.drawImage(img, 0, 0, SIZE, SIZE);
        const { data } = ctx.getImageData(0, 0, SIZE, SIZE);

        // Bucket by 4-bit quantization, accumulate average RGB per bucket.
        const buckets = new Map<
          number,
          { r: number; g: number; b: number; n: number }
        >();
        for (let i = 0; i < data.length; i += 4) {
          if (data[i + 3] < 125) continue;
          const r = data[i];
          const g = data[i + 1];
          const b = data[i + 2];
          const key = ((r >> 4) << 16) | ((g >> 4) << 8) | (b >> 4);
          const e = buckets.get(key);
          if (e) {
            e.r += r;
            e.g += g;
            e.b += b;
            e.n += 1;
          } else {
            buckets.set(key, { r, g, b, n: 1 });
          }
        }

        const sorted = [...buckets.values()].sort((a, b) => b.n - a.n);
        const out: Swatch[] = [];
        for (const c of sorted) {
          const rgb = [c.r / c.n, c.g / c.n, c.b / c.n];
          const hex = toHex(rgb[0], rgb[1], rgb[2]);
          const near = out.find((s) => {
            const h = parseInt(s.hex.slice(1), 16);
            return colorDistance([(h >> 16) & 255, (h >> 8) & 255, h & 255], rgb) < 28;
          });
          if (near) {
            near.count += c.n;
          } else {
            out.push({ hex, count: c.n });
          }
          if (out.length >= n) break;
        }
        resolve(out.sort((a, b) => b.count - a.count));
      } catch {
        resolve([]);
      }
    };
    img.onerror = () => resolve([]);
    img.src = src;
  });
}

/** A low horizontal colour strip of the photograph's theme colours. */
export function PaletteSwatches({ src }: { src: string }) {
  const [swatches, setSwatches] = useState<Swatch[]>([]);

  useEffect(() => {
    let cancelled = false;
    extractPalette(src).then((s) => {
      if (!cancelled) setSwatches(s);
    });
    return () => {
      cancelled = true;
    };
  }, [src]);

  if (swatches.length === 0) return null;

  const total = swatches.reduce((sum, s) => sum + s.count, 0);

  return (
    <div className="flex flex-col gap-3">
      <span className="label-sm text-faint">PALETTE</span>
      <div className="flex h-9 w-full max-w-[280px] overflow-hidden rounded-[2px]">
        {swatches.map((s) => (
          <div
            key={s.hex}
            className="h-full min-w-0 flex-1"
            style={{ backgroundColor: s.hex }}
            title={`${s.hex} · ${Math.round((s.count / total) * 100)}%`}
          />
        ))}
      </div>
    </div>
  );
}
