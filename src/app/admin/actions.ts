"use server";

import { execFile } from "node:child_process";
import { promisify } from "node:util";
import { revalidatePath } from "next/cache";
import { getAdmin } from "@/lib/auth";
import { canEdit, loadDraft, saveContent, storeMode } from "@/lib/store";
import { clean, isSectionId, setSection, slugify } from "./_lib/sections";

export type ActionResult = { ok: true; message?: string } | { ok: false; error: string };

export async function saveSection(id: string, value: unknown): Promise<ActionResult> {
  // Server actions are public endpoints, so each one checks the session itself.
  if (!(await getAdmin())) return { ok: false, error: "Your session has ended — sign in again." };
  if (!canEdit) return { ok: false, error: "Saving is turned off: add GITHUB_TOKEN to your Vercel environment variables." };
  if (!isSectionId(id)) return { ok: false, error: "Unknown section." };

  let next = clean(value);
  // Projects and papers need a URL slug; derive it from the title when left empty.
  if (id === "projects" || id === "publications") {
    next = (next as { slug?: string; title: string }[]).map((item) => ({
      ...item,
      slug: item.slug || slugify(item.title),
    }));
  }

  if (id === "skills") {
    next = (next as { id?: string; title: string }[]).map((group) => ({ ...group, id: group.id || slugify(group.title) }));
  }

  try {
    await saveContent(setSection(await loadDraft(), id, next), `Update ${id} from admin`);
  } catch (error) {
    return { ok: false, error: error instanceof Error ? error.message : String(error) };
  }
  revalidatePath("/", "layout");
  return {
    ok: true,
    message:
      storeMode === "github"
        ? "Saved to GitHub — the live site updates in about a minute."
        : "Saved. Use Publish to put it on the live site.",
  };
}

const run = promisify(execFile);

/** Commits the content file and uploads, then pushes — Vercel deploys from there. */
export async function publish(): Promise<ActionResult> {
  if (!(await getAdmin())) return { ok: false, error: "Your session has ended — sign in again." };
  if (storeMode !== "local") return { ok: false, error: "On the live site, saving publishes by itself." };
  const paths = ["src/content/site.json", "public/uploads"];
  try {
    await run("git", ["add", "--", ...paths]);
    const { stdout } = await run("git", ["diff", "--cached", "--name-only", "--", ...paths]);
    if (stdout.trim()) await run("git", ["commit", "-m", "Update content from admin", "--", ...paths]);
    // Bring in anything pushed from elsewhere first, so the push isn't rejected.
    await run("git", ["pull", "--no-rebase", "--no-edit"]);
    await run("git", ["push"]);
    return { ok: true, message: "Published — Vercel is deploying it now (about a minute)." };
  } catch (error) {
    const detail = error instanceof Error ? error.message.split("\n").slice(-3).join(" ") : String(error);
    return { ok: false, error: `Git failed: ${detail}` };
  }
}
