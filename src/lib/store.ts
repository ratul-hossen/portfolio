// Where site content lives.
// With a database (DATABASE_URL, e.g. Neon) content is one JSON row there,
// edited from the admin panel anywhere and live as soon as it's saved.
// Without one, it's src/content/site.json: the panel edits it on a local
// dev server and a git push publishes it. That file also seeds the database
// the first time.

import { readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { cache } from "react";
import { neon } from "@neondatabase/serverless";
import bundled from "@/content/site.json";
import type { SiteContent } from "@/content/types";

const FILE = path.join(process.cwd(), "src/content/site.json");
const databaseUrl = process.env.DATABASE_URL ?? process.env.POSTGRES_URL;
const sql = databaseUrl ? neon(databaseUrl) : null;

export const storageMode: "database" | "file" = sql ? "database" : "file";

/** The file can only be written on a local dev server; the database anywhere. */
export const canWrite = sql !== null || process.env.NODE_ENV === "development";


let ready: Promise<unknown> | null = null;
function ensureTables() {
  if (!sql) return Promise.resolve();
  ready ??= (async () => {
    await sql`create table if not exists site_content (
      id int primary key,
      data jsonb not null,
      updated_at timestamptz not null default now(),
      updated_by text
    )`;
    // Every save keeps the previous version, so a mistake can be undone.
    await sql`create table if not exists site_content_history (
      id bigserial primary key,
      data jsonb not null,
      saved_at timestamptz not null default now(),
      saved_by text
    )`;
  })();
  return ready;
}

async function readFileContent(): Promise<SiteContent> {
  // In dev, read the file fresh so edits show up immediately.
  if (process.env.NODE_ENV === "development") return JSON.parse(await readFile(FILE, "utf8")) as SiteContent;
  return bundled as unknown as SiteContent;
}

/** Reads the content once per request. */
export const loadContent = cache(async (): Promise<SiteContent> => {
  if (!sql) return readFileContent();
  try {
    await ensureTables();
    const rows = await sql`select data from site_content where id = 1`;
    if (rows.length) return rows[0].data as SiteContent;
  } catch (error) {
    // Keep the site up if the database is briefly unreachable.
    console.error("Reading content from the database failed; using the bundled file.", error);
  }
  return readFileContent();
});

export async function saveContent(content: SiteContent, by = "admin") {
  if (!canWrite) throw new Error("Editing needs a database, or a local dev server.");
  if (!sql) {
    await writeFile(FILE, JSON.stringify(content, null, 2) + "\n");
    return;
  }
  await ensureTables();
  const data = JSON.stringify(content);
  await sql`insert into site_content_history (data, saved_by)
    select data, updated_by from site_content where id = 1`;
  await sql`insert into site_content (id, data, updated_at, updated_by)
    values (1, ${data}::jsonb, now(), ${by})
    on conflict (id) do update set data = excluded.data, updated_at = now(), updated_by = excluded.updated_by`;
}

/** Recent saved versions, newest first. */
export async function listHistory(limit = 20) {
  if (!sql) return [];
  await ensureTables();
  return (await sql`select id, saved_at, saved_by from site_content_history order by id desc limit ${limit}`) as {
    id: number;
    saved_at: string;
    saved_by: string | null;
  }[];
}

export async function restoreVersion(id: number, by = "admin") {
  if (!sql) throw new Error("History needs the database.");
  const rows = await sql`select data from site_content_history where id = ${id}`;
  if (!rows.length) throw new Error("That version no longer exists.");
  await saveContent(rows[0].data as SiteContent, by);
}
