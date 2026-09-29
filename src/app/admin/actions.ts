"use server";

import { execFile } from "node:child_process";
import { promisify } from "node:util";
import { revalidatePath } from "next/cache";
import { signOut } from "@/auth";
import { getAdmin } from "@/lib/admin";
import { canWrite, loadContent, restoreVersion, saveContent, storageMode } from "@/lib/store";
import { clean, isSectionId, setSection, slugify } from "./_lib/sections";

export type ActionResult = { ok: true; message?: string } | { ok: false; error: string };

const notAllowed: ActionResult = { ok: false, error: "Please sign in again." };

export async function saveSection(id: string, value: unknown): Promise<ActionResult> {
  const admin = await getAdmin();
  if (!admin) return notAllowed;
  if (!canWrite) return { ok: false, error: "Saving needs the database (or a local dev server)." };
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

  await saveContent(setSection(await loadContent(), id, next), admin.email);
  // Rebuild the public pages so the change is live on the next visit.
  revalidatePath("/", "layout");
  return { ok: true, message: storageMode === "database" ? "Saved — it's live on the site now." : undefined };
}

export async function restore(versionId: number): Promise<ActionResult> {
  const admin = await getAdmin();
  if (!admin) return notAllowed;
  try {
    await restoreVersion(versionId, admin.email);
  } catch (error) {
    return { ok: false, error: error instanceof Error ? error.message : "Restore failed." };
  }
  revalidatePath("/", "layout");
  return { ok: true, message: "Restored — that version is live again." };
}

export async function logout() {
  await signOut({ redirectTo: "/login" });
}

const run = promisify(execFile);

/**
 * File mode only (no database): commits the content file and uploads, then
 * pushes — Vercel deploys from there.
 */
export async function publish(): Promise<ActionResult> {
  const admin = await getAdmin();
  if (!admin) return notAllowed;
  if (storageMode === "database") return { ok: true, message: "Nothing to publish — saved changes are already live." };
  if (process.env.NODE_ENV !== "development") return { ok: false, error: "Publishing works from your local dev server." };
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
