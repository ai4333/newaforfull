import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { createRateLimiter, shouldBypassRateLimit } from "@/lib/ratelimit";
import { requireAdminApiUser } from "@/lib/auth-helpers";

const requestSchema = z.object({
  payoutId: z.string().uuid(),
});

const writeLimiter = createRateLimiter(30, "1 m");

export async function PATCH(req: Request) {
  const authResult = await requireAdminApiUser();
  if ("response" in authResult) return authResult.response;
  const userId = authResult.user.id;

  if (writeLimiter) {
    const { success } = await writeLimiter.limit(`admin-payout-mark-paid:${userId}`);
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
