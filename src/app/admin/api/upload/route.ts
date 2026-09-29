import path from "node:path";
import sharp from "sharp";
import { getAdmin } from "@/lib/auth";
import { canEdit, saveUpload } from "@/lib/store";
import { slugify } from "../../_lib/sections";

const allowed = /^(image\/(jpeg|png|webp|gif|avif)|video\/(mp4|webm|quicktime)|application\/pdf)$/;

/** Saves an uploaded file under /public/uploads (photos are resized and converted to WebP). */
export async function POST(request: Request) {
  if (!(await getAdmin())) return Response.json({ error: "Sign in again to upload." }, { status: 401 });
  if (!canEdit) return Response.json({ error: "Uploads need GITHUB_TOKEN on the live site." }, { status: 403 });

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

  try {
    const url = await saveUpload(name, bytes);
    return Response.json({ url, size: bytes.length });
  } catch (error) {
    return Response.json({ error: error instanceof Error ? error.message : String(error) }, { status: 500 });
  }
}
