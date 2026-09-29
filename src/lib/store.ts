// Where site content lives: one JSON file in the repo (src/content/site.json)
// plus uploads in public/uploads.
//
// The admin panel writes them in one of two ways:
//  - "local":  on your computer (`npm run dev`) it writes the files directly;
//              the Publish button then commits and pushes them.
//  - "github": on the live site it commits them through the GitHub API;
//              Vercel sees the commit and redeploys (about a minute).
// Without a GitHub token on the live site, the admin panel is read-only.

import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import bundled from "@/content/site.json";
import type { SiteContent } from "@/content/types";

const CONTENT_PATH = "src/content/site.json";
const UPLOAD_DIR = "public/uploads";

export type StoreMode = "local" | "github" | "readonly";

const github = {
  token: process.env.GITHUB_TOKEN,
  // On Vercel these are filled in from the connected repository automatically.
  repo:
    process.env.GITHUB_REPO ??
    (process.env.VERCEL_GIT_REPO_OWNER && process.env.VERCEL_GIT_REPO_SLUG
      ? `${process.env.VERCEL_GIT_REPO_OWNER}/${process.env.VERCEL_GIT_REPO_SLUG}`
      : undefined),
  branch: process.env.GITHUB_BRANCH ?? process.env.VERCEL_GIT_COMMIT_REF ?? "main",
};

export const storeMode: StoreMode =
  process.env.NODE_ENV === "development" ? "local" : github.token && github.repo ? "github" : "readonly";

export const canEdit = storeMode !== "readonly";

/** Content as the public site shows it (baked into the build in production). */
export async function loadContent(): Promise<SiteContent> {
  // In dev, read the file fresh so admin edits show up immediately.
  if (storeMode === "local") return readLocal();
  return bundled as unknown as SiteContent;
}

/** The latest saved content, for the admin panel — may be ahead of the live build. */
export async function loadDraft(): Promise<SiteContent> {
  if (storeMode === "github") {
    const file = await getGithubFile(CONTENT_PATH);
    if (file) return JSON.parse(Buffer.from(file.content, "base64").toString("utf8")) as SiteContent;
  }
  return loadContent();
}

export async function saveContent(content: SiteContent, message = "Update content from admin") {
  const text = JSON.stringify(content, null, 2) + "\n";
  if (storeMode === "local") return writeFile(path.join(process.cwd(), CONTENT_PATH), text);
  if (storeMode === "github") return putGithubFile(CONTENT_PATH, Buffer.from(text), message);
  throw new Error("Saving is turned off: add GITHUB_TOKEN to your Vercel environment variables.");
}

/** Stores an uploaded file and returns its public URL. */
export async function saveUpload(name: string, bytes: Buffer) {
  if (storeMode === "local") {
    const dir = path.join(process.cwd(), UPLOAD_DIR);
    await mkdir(dir, { recursive: true });
    await writeFile(path.join(dir, name), bytes);
  } else if (storeMode === "github") {
    await putGithubFile(`${UPLOAD_DIR}/${name}`, bytes, `Upload ${name} from admin`);
  } else {
    throw new Error("Uploads are turned off: add GITHUB_TOKEN to your Vercel environment variables.");
  }
  return `/uploads/${name}`;
}

async function readLocal() {
  return JSON.parse(await readFile(path.join(process.cwd(), CONTENT_PATH), "utf8")) as SiteContent;
}

// --- GitHub contents API ---------------------------------------------------

async function githubFetch(filePath: string, init?: RequestInit) {
  return fetch(`https://api.github.com/repos/${github.repo}/contents/${filePath}`, {
    ...init,
    cache: "no-store",
    headers: {
      Accept: "application/vnd.github+json",
      Authorization: `Bearer ${github.token}`,
      "X-GitHub-Api-Version": "2022-11-28",
      ...init?.headers,
    },
  });
}

async function getGithubFile(filePath: string): Promise<{ sha: string; content: string } | null> {
  const response = await githubFetch(`${filePath}?ref=${encodeURIComponent(github.branch)}`);
  if (response.status === 404) return null;
  if (!response.ok) throw new Error(`GitHub: ${response.status} ${await response.text()}`);
  const file = (await response.json()) as { sha: string; content?: string; download_url?: string };
  // Files over 1 MB come back without inline content.
  if (!file.content && file.download_url) {
    const raw = await fetch(file.download_url, { cache: "no-store", headers: { Authorization: `Bearer ${github.token}` } });
    return { sha: file.sha, content: Buffer.from(await raw.arrayBuffer()).toString("base64") };
  }
  return { sha: file.sha, content: file.content ?? "" };
}

async function putGithubFile(filePath: string, bytes: Buffer, message: string) {
  const existing = await getGithubFile(filePath);
  const response = await githubFetch(filePath, {
    method: "PUT",
    body: JSON.stringify({
      message,
      content: bytes.toString("base64"),
      branch: github.branch,
      ...(existing ? { sha: existing.sha } : {}),
    }),
  });
  if (!response.ok) {
    const detail = ((await response.json().catch(() => ({}))) as { message?: string }).message ?? response.statusText;
    throw new Error(`GitHub refused the commit (${response.status}): ${detail}`);
  }
}
