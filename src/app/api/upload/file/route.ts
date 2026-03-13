import { NextResponse } from "next/server";
import { PDFDocument } from "pdf-lib";
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

  let pageCount = 1;
  if (fileEntry.type === "application/pdf") {
    try {
      const pdfDoc = await PDFDocument.load(arrayBuffer, { ignoreEncryption: true });
      pageCount = Math.max(1, pdfDoc.getPageCount());
    } catch {
      pageCount = 1;
    }
  }

  return NextResponse.json({
    fileUrl: `sb://${storageBucket}/${path}`,
    fileName: fileEntry.name,
    fileSize: fileEntry.size,
    pageCount,
  });
}
