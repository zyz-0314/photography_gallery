import "server-only";

/**
 * GitHub Contents API adapter — READ-ONLY, for the public site.
 * The token lives in `GITHUB_TOKEN` (env, deployed server-side) and never
 * reaches the browser. The public site only reads the archive's JSON files
 * and serves images; all writes happen in the separate admin app.
 */

const API = "https://api.github.com";

const token = () => process.env.GITHUB_TOKEN ?? "";

export const isGitHubConfigured = () => Boolean(token());

export const repoOwner = () => process.env.GITHUB_REPO_OWNER ?? "";
export const repoName = () => process.env.GITHUB_REPO_NAME ?? "";

/** Repo identity comes from the environment. */
export function repoRef(): { owner: string; name: string } | null {
  const owner = repoOwner();
  const name = repoName();
  if (isGitHubConfigured() && owner && name) return { owner, name };
  return null;
}

function authHeaders(accept: string): Record<string, string> {
  return {
    Authorization: `Bearer ${token()}`,
    Accept: accept,
    "X-GitHub-Api-Version": "2022-11-28",
    "User-Agent": "photography-archive",
  };
}

const encodePath = (path: string) =>
  path.split("/").map(encodeURIComponent).join("/");

export class GitHubError extends Error {
  status: number;
  constructor(status: number, message: string) {
    super(message);
    this.status = status;
  }
}

async function request(
  url: string,
  init?: RequestInit,
  accept = "application/vnd.github+json"
): Promise<Response> {
  const res = await fetch(url, {
    ...init,
    headers: { ...authHeaders(accept), ...(init?.headers ?? {}) },
    cache: "no-store",
  });
  if (!res.ok) {
    let message = `GitHub API ${res.status}`;
    try {
      const body = await res.json();
      if (body?.message) message = String(body.message);
    } catch {
      /* keep default message */
    }
    throw new GitHubError(res.status, message);
  }
  return res;
}

/** Read a text file (JSON). Returns decoded content + its git sha. */
export async function readFile(
  owner: string,
  name: string,
  path: string
): Promise<{ content: string; sha: string }> {
  const res = await request(`${API}/repos/${owner}/${name}/contents/${encodePath(path)}`);
  const meta = await res.json();
  if (meta?.type !== "file" || typeof meta.content !== "string") {
    throw new GitHubError(422, `Not a file: ${path}`);
  }
  return { content: Buffer.from(meta.content, "base64").toString("utf8"), sha: meta.sha };
}

/** Read a binary file (image). Returns raw bytes. */
export async function readRaw(
  owner: string,
  name: string,
  path: string
): Promise<Buffer> {
  const res = await request(
    `${API}/repos/${owner}/${name}/contents/${encodePath(path)}`,
    undefined,
    "application/vnd.github.raw+json"
  );
  return Buffer.from(await res.arrayBuffer());
}
