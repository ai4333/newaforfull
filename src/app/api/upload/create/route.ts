import { NextResponse } from "next/server";
import { z } from "zod";
import { auth } from "@/auth";
import { createRateLimiter, shouldBypassRateLimit } from "@/lib/ratelimit";
import { buildStoragePath, getSupabaseServerClient, storageBucket } from "@/lib/supabase-server";

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
]);

export async function POST(req: Request) {
  const session = await auth();
  const userId = session?.user?.id;
  const role = (session?.user as { role?: string } | undefined)?.role;

  if (!userId || role !== "STUDENT") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

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
    return NextResponse.json({ error: "Unsupported file type" }, { status: 400 });
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
