import { NextResponse } from "next/server";
import { z } from "zod";
import { createRateLimiter, shouldBypassRateLimit } from "@/lib/ratelimit";
import { buildStoragePath, getSupabaseServerClient, storageBucket } from "@/lib/supabase-server";
import { requireActiveUser } from "@/lib/auth-helpers";

const requestSchema = z.object({
  fileName: z.string().min(1).max(150),
  fileSize: z.number().int().positive().max(20 * 1024 * 1024),
  mimeType: z.string().min(1).max(120),
});

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

export async function POST(req: Request) {
  const authResult = await requireActiveUser("STUDENT");
  if ("response" in authResult) {
    return authResult.response;
  }
  const userId = authResult.user.id;

  if (writeLimiter) {
    const { success } = await writeLimiter.limit(`upload-create:${userId}`);
    if (!success) {
      return NextResponse.json({ error: "Too Many Requests" }, { status: 429 });
    }
  } else if (!shouldBypassRateLimit()) {
    return NextResponse.json({ error: "Rate limiting unavailable" }, { status: 500 });
  }

  const body = await req.json();
  const parsed = requestSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }

  if (!allowedMimeTypes.has(parsed.data.mimeType)) {
    return NextResponse.json(
      {
        error: `Unsupported file type: ${parsed.data.mimeType}`,
        supportedTypes: Array.from(allowedMimeTypes),
      },
      { status: 400 }
    );
  }

  const supabase = getSupabaseServerClient();
  if (!supabase) {
    return NextResponse.json({ error: "Storage not configured" }, { status: 500 });
  }

  const path = buildStoragePath(userId, parsed.data.fileName);
  const { data, error } = await supabase.storage.from(storageBucket).createSignedUploadUrl(path);

  if (error || !data?.token) {
    return NextResponse.json({ error: "Failed to generate upload URL" }, { status: 502 });
  }

  return NextResponse.json({
    bucket: storageBucket,
    path,
    token: data.token,
    storedFileUrl: `sb://${storageBucket}/${path}`,
  });
}
