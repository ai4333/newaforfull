import { NextResponse } from "next/server";
import { PDFDocument } from "pdf-lib";
import JSZip from "jszip";
import { createRateLimiter, shouldBypassRateLimit } from "@/lib/ratelimit";
import { buildStoragePath, getSupabaseServerClient, storageBucket } from "@/lib/supabase-server";
import { requireActiveUser } from "@/lib/auth-helpers";

const writeLimiter = createRateLimiter(20, "1 m");

const allowedMimeTypes = new Set([
  "application/pdf",
  "application/msword",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  "application/zip",
  "application/x-zip-compressed",
  "image/png",
  "image/jpeg",
  "image/jpg",
]);

const MAX_FILE_SIZE = 20 * 1024 * 1024;

function getExtension(fileName: string) {
  const dot = fileName.lastIndexOf(".");
  if (dot < 0) return "";
  return fileName.slice(dot + 1).toLowerCase();
}

async function estimateDocxPages(arrayBuffer: ArrayBuffer) {
  try {
    const zip = await JSZip.loadAsync(arrayBuffer);
    const documentXml = await zip.file("word/document.xml")?.async("string");
    if (!documentXml) return 1;

    const explicitBreaks = (documentXml.match(/w:type="page"/g) || []).length;
    const textWithoutTags = documentXml
      .replace(/<[^>]+>/g, " ")
      .replace(/\s+/g, " ")
      .trim();

    const charsPerPage = 1800;
    const estimatedFromText = Math.max(1, Math.ceil(textWithoutTags.length / charsPerPage));
    return Math.max(explicitBreaks + 1, estimatedFromText);
  } catch {
    return 1;
  }
}

async function detectPageCount(fileName: string, mimeType: string, arrayBuffer: ArrayBuffer) {
  const ext = getExtension(fileName);

  if (mimeType === "application/pdf" || ext === "pdf") {
    try {
      const pdfDoc = await PDFDocument.load(arrayBuffer, { ignoreEncryption: true });
      return Math.max(1, pdfDoc.getPageCount());
    } catch {
      return 1;
    }
  }

  if (mimeType.startsWith("image/") || ["png", "jpg", "jpeg", "webp"].includes(ext)) {
    return 1;
  }

  if (mimeType === "application/vnd.openxmlformats-officedocument.wordprocessingml.document" || ext === "docx") {
    return estimateDocxPages(arrayBuffer);
  }

  if (mimeType === "application/msword" || ext === "doc") {
    const approxBytesPerPage = 12000;
    return Math.max(1, Math.ceil(arrayBuffer.byteLength / approxBytesPerPage));
  }

  if (mimeType === "application/zip" || mimeType === "application/x-zip-compressed" || ext === "zip") {
    try {
      const zip = await JSZip.loadAsync(arrayBuffer);
      let total = 0;

      for (const [entryName, entry] of Object.entries(zip.files)) {
        if (entry.dir) continue;
        const entryExt = getExtension(entryName);

        if (entryExt === "pdf") {
          const bytes = await entry.async("uint8array");
          const entryBuffer = bytes.buffer.slice(bytes.byteOffset, bytes.byteOffset + bytes.byteLength) as ArrayBuffer;
          try {
            const pdf = await PDFDocument.load(entryBuffer, { ignoreEncryption: true });
            total += Math.max(1, pdf.getPageCount());
          } catch {
            total += 1;
          }
        } else if (["png", "jpg", "jpeg", "webp"].includes(entryExt)) {
          total += 1;
        } else if (entryExt === "docx") {
          const bytes = await entry.async("uint8array");
          const entryBuffer = bytes.buffer.slice(bytes.byteOffset, bytes.byteOffset + bytes.byteLength) as ArrayBuffer;
          total += await estimateDocxPages(entryBuffer);
        } else if (entryExt === "doc") {
          const bytes = await entry.async("uint8array");
          total += Math.max(1, Math.ceil(bytes.byteLength / 12000));
        }
      }

      return Math.max(1, total);
    } catch {
      return 1;
    }
  }

  return 1;
}

export async function POST(req: Request) {
  const authResult = await requireActiveUser("STUDENT");
  if ("response" in authResult) {
    return authResult.response;
  }
  const userId = authResult.user.id;

  if (writeLimiter) {
    const { success } = await writeLimiter.limit(`upload-file:${userId}`);
    if (!success) {
      return NextResponse.json({ error: "Too Many Requests" }, { status: 429 });
    }
  } else if (!shouldBypassRateLimit()) {
    return NextResponse.json({ error: "Rate limiting unavailable" }, { status: 500 });
  }

  const formData = await req.formData();
  const fileEntry = formData.get("file");

  if (!(fileEntry instanceof File)) {
    return NextResponse.json({ error: "File is required" }, { status: 400 });
  }

  if (!allowedMimeTypes.has(fileEntry.type)) {
    return NextResponse.json(
      {
        error: `Unsupported file type: ${fileEntry.type || "unknown"}`,
        supportedTypes: Array.from(allowedMimeTypes),
      },
      { status: 400 }
    );
  }

  if (fileEntry.size <= 0 || fileEntry.size > MAX_FILE_SIZE) {
    return NextResponse.json({ error: "File size must be between 1 byte and 20MB" }, { status: 400 });
  }

  const supabase = getSupabaseServerClient();
  if (!supabase) {
    return NextResponse.json({ error: "Storage not configured" }, { status: 500 });
  }

  const path = buildStoragePath(userId, fileEntry.name);
  const arrayBuffer = await fileEntry.arrayBuffer();
  const fileBuffer = Buffer.from(arrayBuffer);

  const { error: uploadError } = await supabase.storage
    .from(storageBucket)
    .upload(path, fileBuffer, {
      contentType: fileEntry.type,
      upsert: false,
    });

  if (uploadError) {
    return NextResponse.json({ error: `Upload failed: ${uploadError.message}` }, { status: 502 });
  }

  const pageCount = await detectPageCount(fileEntry.name, fileEntry.type, arrayBuffer);

  return NextResponse.json({
    fileUrl: `sb://${storageBucket}/${path}`,
    fileName: fileEntry.name,
    fileSize: fileEntry.size,
    pageCount,
    pageCountSource:
      fileEntry.type === "application/pdf"
        ? "pdf"
        : fileEntry.type.startsWith("image/")
          ? "image"
          : getExtension(fileEntry.name) === "docx"
            ? "docx_estimated"
            : getExtension(fileEntry.name) === "doc"
              ? "doc_estimated"
              : "default",
  });
}
