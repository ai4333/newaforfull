import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { createRateLimiter, shouldBypassRateLimit } from "@/lib/ratelimit";
import { requireActiveUser } from "@/lib/auth-helpers";

const patchSchema = z.object({
  acceptingOrders: z.boolean(),
});

const readLimiter = createRateLimiter(60, "1 m");
const writeLimiter = createRateLimiter(30, "1 m");

async function ensureVendor() {
  const authResult = await requireActiveUser("VENDOR");
  if ("response" in authResult) return null;

  const userId = authResult.user.id;
  const profile = await prisma.vendorProfile.findUnique({
    where: { userId },
    select: { id: true, approvalStatus: true, acceptingOrders: true },
  });

  if (!profile || profile.approvalStatus !== "APPROVED") return null;
  return { userId, profile };
}

export async function GET() {
  const vendor = await ensureVendor();
  if (!vendor) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  if (readLimiter) {
    const { success } = await readLimiter.limit(`vendor-settings-read:${vendor.userId}`);
    if (!success) return NextResponse.json({ error: "Too Many Requests" }, { status: 429 });
  } else if (!shouldBypassRateLimit()) {
    return NextResponse.json({ error: "Rate limiting unavailable" }, { status: 500 });
  }

  return NextResponse.json({ settings: { acceptingOrders: vendor.profile.acceptingOrders } });
}

export async function PATCH(req: Request) {
  const vendor = await ensureVendor();
  if (!vendor) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  if (writeLimiter) {
    const { success } = await writeLimiter.limit(`vendor-settings-write:${vendor.userId}`);
    if (!success) return NextResponse.json({ error: "Too Many Requests" }, { status: 429 });
  } else if (!shouldBypassRateLimit()) {
    return NextResponse.json({ error: "Rate limiting unavailable" }, { status: 500 });
  }

  const parsed = patchSchema.safeParse(await req.json());
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid request", details: parsed.error.flatten().fieldErrors }, { status: 400 });
  }

  const updated = await prisma.$transaction(async (tx) => {
    const result = await tx.vendorProfile.update({
      where: { id: vendor.profile.id },
      data: { acceptingOrders: parsed.data.acceptingOrders },
      select: { acceptingOrders: true },
    });

    await tx.activityLog.create({
      data: {
        userId: vendor.userId,
        action: "VENDOR_SHOP_STATUS_UPDATED",
        details: `Shop status set to ${parsed.data.acceptingOrders ? "ONLINE" : "OFFLINE"}`,
      },
    });

    return result;
  });

  return NextResponse.json({ settings: updated });
}
