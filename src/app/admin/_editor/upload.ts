"use client";

import { upload } from "@vercel/blob/client";

let modePromise: Promise<"blob" | "file"> | null = null;

/** Asks the server once whether uploads go to Vercel Blob or the local folder. */
function uploadMode() {
  modePromise ??= fetch("/admin/api/upload")
    .then((response) => response.json())
    .then((data) => (data.mode === "blob" ? "blob" : "file"))
    .catch(() => {
      modePromise = null;
      return "file" as const;
    });
  return modePromise;
}

function safeName(name: string) {
  const base = name.replace(/\.[^.]+$/, "").toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "");
  return base.slice(0, 50) || "file";
}

/** Shrinks a photo to at most 2000px and re-encodes it as WebP, in the browser. */
async function toWebp(file: File): Promise<Blob> {
  const bitmap = await createImageBitmap(file, { imageOrientation: "from-image" });
  const scale = Math.min(1, 2000 / Math.max(bitmap.width, bitmap.height));
  const canvas = document.createElement("canvas");
  canvas.width = Math.round(bitmap.width * scale);
  canvas.height = Math.round(bitmap.height * scale);
  canvas.getContext("2d")!.drawImage(bitmap, 0, 0, canvas.width, canvas.height);
  bitmap.close();
  const blob = await new Promise<Blob | null>((resolve) => canvas.toBlob(resolve, "image/webp", 0.82));
  return blob ?? file;
}

/** Uploads a file and returns its public URL. */
export async function uploadFile(file: File): Promise<string> {
  if ((await uploadMode()) === "file") {
    const body = new FormData();
    body.append("file", file);
    const response = await fetch("/admin/api/upload", { method: "POST", body });
    const data = await response.json();
    if (!response.ok) throw new Error(data.error ?? "Upload failed");
    return data.url;
  }

  const photo = file.type.startsWith("image/") && file.type !== "image/gif" && file.type !== "image/svg+xml";
  const body = photo ? await toWebp(file) : file;
  const extension = photo ? "webp" : (file.name.split(".").pop() ?? "bin").toLowerCase();
  const result = await upload(`uploads/${safeName(file.name)}.${extension}`, body, {
    access: "public",
    handleUploadUrl: "/admin/api/upload/blob",
    contentType: photo ? "image/webp" : file.type,
    multipart: body.size > 20 * 1024 * 1024,
  });
  return result.url;
}
