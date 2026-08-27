import { type NextRequest } from "next/server";
import { isConnected, readImage } from "@/lib/store";

/**
 * Streams images out of the private repo for the public site and admin.
 * The token stays server-side; browsers just see an immutable cacheable URL.
 */
export async function GET(
  _req: NextRequest,
  ctx: { params: Promise<{ path: string[] }> }
) {
  const { path } = await ctx.params;
  const repoPath = path.join("/");
  if (!isConnected()) return new Response("Not connected", { status: 404 });

  try {
    const buf = await readImage(repoPath);
    const ext = repoPath.split(".").pop()?.toLowerCase();
    const mime =
      ext === "webp"
        ? "image/webp"
        : ext === "png"
          ? "image/png"
          : ext === "gif"
            ? "image/gif"
            : "image/jpeg";
    return new Response(new Uint8Array(buf), {
      headers: {
        "Content-Type": mime,
        // Images are immutable once uploaded (unique slugs) — cache hard.
        "Cache-Control": "public, max-age=31536000, immutable",
      },
    });
  } catch {
    return new Response("Not found", { status: 404 });
  }
}
