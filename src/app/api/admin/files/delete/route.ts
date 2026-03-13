import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { requireAdminApiUser } from "@/lib/auth-helpers";
import { getSupabaseServerClient } from "@/lib/supabase-server";

const requestSchema = z.object({
  fileId: z.string().uuid(),
});

function parseStoredPath(fileUrl: string) {
  if (!fileUrl.startsWith("sb://")) {
    return null;
  }

  const withoutPrefix = fileUrl.slice(5);
  const slash = withoutPrefix.indexOf("/");
  if (slash <= 0) return null;

  return {
    bucket: withoutPrefix.slice(0, slash),
    path: withoutPrefix.slice(slash + 1),
  };
}

export async function DELETE(req: Request) {
  const authResult = await requireAdminApiUser();
  if ("response" in authResult) {
    return authResult.response;
  }

  const parsed = requestSchema.safeParse(await req.json());
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }

  const file = await prisma.orderFile.findUnique({
    where: { id: parsed.data.fileId },
    select: { id: true, fileUrl: true, fileName: true },
  });

  if (!file) {
    return NextResponse.json({ error: "File not found" }, { status: 404 });
  }

  const stored = parseStoredPath(file.fileUrl);
  if (stored) {
    const supabase = getSupabaseServerClient();
    if (supabase) {
      const { error } = await supabase.storage.from(stored.bucket).remove([stored.path]);
      if (error) {
        return NextResponse.json({ error: `Storage delete failed: ${error.message}` }, { status: 502 });
      }
    }
  }

  await prisma.$transaction(async (tx) => {
    await tx.orderFile.delete({ where: { id: file.id } });
    await tx.activityLog.create({
      data: {
        userId: authResult.user.id,
        action: "ADMIN_FILE_DELETED",
        details: `Deleted file ${file.fileName} (${file.id})`,
      },
    });
  });

  return NextResponse.json({ ok: true, fileId: file.id });
}
