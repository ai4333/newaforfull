import { NextResponse } from "next/server";
import { z } from "zod";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { createRateLimiter, shouldBypassRateLimit } from "@/lib/ratelimit";

const requestSchema = z.object({
  userId: z.string().uuid(),
  suspend: z.boolean(),
});

const writeLimiter = createRateLimiter(30, "1 m");

export async function PATCH(req: Request) {
  const session = await auth();
  const adminId = session?.user?.id;
  const role = (session?.user as { role?: string } | undefined)?.role;

  if (!adminId || role !== "ADMIN") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  if (writeLimiter) {
    const { success } = await writeLimiter.limit(`admin-user-status:${adminId}`);
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

  if (parsed.data.userId === adminId) {
    return NextResponse.json({ error: "Cannot modify your own account state" }, { status: 400 });
  }

  const target = await prisma.user.findUnique({ where: { id: parsed.data.userId } });
  if (!target) {
    return NextResponse.json({ error: "User not found" }, { status: 404 });
  }

  await prisma.$transaction(async (tx) => {
    await tx.$executeRaw`
      UPDATE "User"
      SET "isSuspended" = ${parsed.data.suspend},
          "suspendedAt" = ${parsed.data.suspend ? new Date() : null}
      WHERE "id" = ${parsed.data.userId}
    `;

    await tx.activityLog.create({
      data: {
        userId: adminId,
        action: parsed.data.suspend ? "USER_SUSPENDED" : "USER_REACTIVATED",
        details: `Target user ${parsed.data.userId}`,
      },
    });

  });

  return NextResponse.json({ status: "ok" });
}
