import { NextResponse } from "next/server";
import { PDFDocument } from "pdf-lib";
import JSZip from "jszip";
import { createRateLimiter, shouldBypassRateLimit } from "@/lib/ratelimit";
import { buildStoragePath, getSupabaseServerClient, storageBucket } from "@/lib/supabase-server";
import { requireActiveUser } from "@/lib/auth-helpers";

const writeLimiter = createRateLimiter(20, "1 m");

const allowedMimeTypes = new Set([
  "application/pdf",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  "application/vnd.ms-powerpoint",
  "application/vnd.openxmlformats-officedocument.presentationml.presentation",
  "image/png",
  "image/jpeg",
  "image/jpg",
  "image/webp",
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

  if (
    mimeType === "application/vnd.ms-powerpoint" ||
    mimeType === "application/vnd.openxmlformats-officedocument.presentationml.presentation" ||
    ext === "ppt" ||
    ext === "pptx"
  ) {
    if (ext === "pptx") {
      try {
        const zip = await JSZip.loadAsync(arrayBuffer);
        const slideCount = Object.keys(zip.files).filter((n) => /^ppt\/slides\/slide\d+\.xml$/i.test(n)).length;
        return Math.max(1, slideCount);
      } catch {
        return Math.max(1, Math.ceil(arrayBuffer.byteLength / 40000));
      }
    }
    return Math.max(1, Math.ceil(arrayBuffer.byteLength / 40000));
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
            : ["ppt", "pptx"].includes(getExtension(fileEntry.name))
              ? "ppt_estimated"
              : "default",
  });
}
