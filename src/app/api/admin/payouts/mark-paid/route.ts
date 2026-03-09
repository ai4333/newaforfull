import { NextResponse } from "next/server";
import { z } from "zod";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { createRateLimiter, shouldBypassRateLimit } from "@/lib/ratelimit";

const requestSchema = z.object({
  payoutId: z.string().uuid(),
});

const writeLimiter = createRateLimiter(30, "1 m");

export async function PATCH(req: Request) {
  const session = await auth();
  const userId = session?.user?.id;
  const role = (session?.user as { role?: string } | undefined)?.role;

  if (!userId || role !== "ADMIN") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  if (writeLimiter) {
    const { success } = await writeLimiter.limit(`admin-payout-mark-paid:${userId}`);
    if (!success) {
      return NextResponse.json({ error: "Too Many Requests" }, { status: 429 });
    }
  } else if (!shouldBypassRateLimit()) {
    return NextResponse.json({ error: "Rate limiting unavailable" }, { status: 500 });
  }

  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await req.json();
  const parsed = requestSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }

  const payout = await prisma.payout.findUnique({ where: { id: parsed.data.payoutId } });
  if (!payout) {
    return NextResponse.json({ error: "Payout not found" }, { status: 404 });
  }

  if (payout.status === "PAID") {
    return NextResponse.json({ payout });
  }

  const updated = await prisma.$transaction(async (tx) => {
    const result = await tx.payout.update({
      where: { id: payout.id },
      data: {
        status: "PAID",
        paidAt: new Date(),
      },
    });

    await tx.activityLog.create({
      data: {
        userId,
        action: "PAYOUT_MARKED_PAID",
        details: `Payout ${payout.id} marked paid`,
      },
    });

    return result;
  });

  return NextResponse.json({ payout: updated });
}
