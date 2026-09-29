import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import sharp from "sharp";
import { getAdmin } from "@/lib/admin";
import { slugify } from "../../_lib/sections";

const DIR = path.join(process.cwd(), "public/uploads");
const allowed = /^(image\/(jpeg|png|webp|gif|avif)|video\/(mp4|webm|quicktime)|application\/pdf)$/;

/** Blob storage when it's set up (works anywhere), otherwise files in /public/uploads (local dev). */
const blobEnabled = Boolean(process.env.BLOB_READ_WRITE_TOKEN);

/** Tells the admin panel how to upload. */
export async function GET() {
  if (!(await getAdmin())) return Response.json({ error: "Not signed in." }, { status: 401 });
  return Response.json({ mode: blobEnabled ? "blob" : "file" });
}

/** Local mode: saves the file under /public/uploads (photos resized and converted to WebP). */
export async function POST(request: Request) {
  if (!(await getAdmin())) return Response.json({ error: "Not signed in." }, { status: 401 });
  if (process.env.NODE_ENV !== "development") {
    return Response.json({ error: "Uploads need Vercel Blob to be connected." }, { status: 400 });
  }

  const file = (await request.formData()).get("file");
  if (!(file instanceof File)) return Response.json({ error: "No file." }, { status: 400 });
  if (!allowed.test(file.type)) return Response.json({ error: `Unsupported file type: ${file.type}` }, { status: 400 });

  const base = slugify(file.name.replace(/\.[^.]+$/, "")) || "file";
  const stamp = Date.now().toString(36);
  let bytes: Buffer = Buffer.from(await file.arrayBuffer());
  let name: string;

  if (file.type.startsWith("image/") && file.type !== "image/gif") {
    bytes = await sharp(bytes).rotate().resize({ width: 2000, height: 2000, fit: "inside", withoutEnlargement: true }).webp({ quality: 82 }).toBuffer();
    name = `${base}-${stamp}.webp`;
  } else {
    const ext = path.extname(file.name).toLowerCase().replace(/[^.a-z0-9]/g, "") || ".bin";
    name = `${base}-${stamp}${ext}`;
  }

  await mkdir(DIR, { recursive: true });
  await writeFile(path.join(DIR, name), bytes);
  return Response.json({ url: `/uploads/${name}`, size: bytes.length });
}
