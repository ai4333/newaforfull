import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { createRateLimiter, shouldBypassRateLimit } from "@/lib/ratelimit";
import { requireAdminApiUser } from "@/lib/auth-helpers";

const createPayoutSchema = z.object({
  vendorId: z.string().uuid(),
  amount: z.number().positive(),
});

const readLimiter = createRateLimiter(60, "1 m");
const writeLimiter = createRateLimiter(20, "1 m");

export async function GET() {
  const authResult = await requireAdminApiUser();
  if ("response" in authResult) return authResult.response;
  const userId = authResult.user.id;

  if (readLimiter) {
    const { success } = await readLimiter.limit(`admin-payouts-read:${userId}`);
    if (!success) {
      return NextResponse.json({ error: "Too Many Requests" }, { status: 429 });
    }
  } else if (!shouldBypassRateLimit()) {
    return NextResponse.json({ error: "Rate limiting unavailable" }, { status: 500 });
  }

  const payouts = await prisma.payout.findMany({
    include: {
      vendor: {
        include: {
          user: {
            select: { name: true, email: true },
          },
        },
      },
    },
    orderBy: { createdAt: "desc" },
    take: 100,
  });

  return NextResponse.json({ payouts });
}

export async function POST(req: Request) {
  const authResult = await requireAdminApiUser();
  if ("response" in authResult) return authResult.response;
  const userId = authResult.user.id;

  if (writeLimiter) {
    const { success } = await writeLimiter.limit(`admin-payouts-write:${userId}`);
    if (!success) {
      return NextResponse.json({ error: "Too Many Requests" }, { status: 429 });
    }
  } else if (!shouldBypassRateLimit()) {
    return NextResponse.json({ error: "Rate limiting unavailable" }, { status: 500 });
  }

  const body = await req.json();
  const parsed = createPayoutSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }

  const vendor = await prisma.vendorProfile.findUnique({
    where: { id: parsed.data.vendorId },
    select: { id: true },
  });

  if (!vendor) {
    return NextResponse.json({ error: "Vendor not found" }, { status: 404 });
  }

  const payout = await prisma.$transaction(async (tx) => {
    const result = await tx.payout.create({
      data: {
        vendorId: parsed.data.vendorId,
        amount: parsed.data.amount,
      },
    });

    await tx.activityLog.create({
      data: {
        userId,
        action: "PAYOUT_CREATED",
        details: `Payout ${result.id} created for vendor ${parsed.data.vendorId}`,
      },
    });

    return result;
  });

  return NextResponse.json({ payout }, { status: 201 });
}
