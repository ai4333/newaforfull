import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { createRateLimiter, shouldBypassRateLimit } from "@/lib/ratelimit";
import { requireActiveUser } from "@/lib/auth-helpers";

const itemSchema = z.object({
  name: z.string().min(1),
  category: z.string().min(1),
  stock: z.number().int().nonnegative(),
  min: z.number().int().nonnegative(),
  unit: z.string().min(1),
});

const requestSchema = z.object({
  items: z.array(itemSchema).min(1),
});

const readLimiter = createRateLimiter(60, "1 m");
const writeLimiter = createRateLimiter(30, "1 m");

async function ensureVendor() {
  const authResult = await requireActiveUser("VENDOR");
  if ("response" in authResult) {
    return null;
  }

  const userId = authResult.user.id;

  const profile = await prisma.vendorProfile.findUnique({
    where: { userId },
    select: { id: true, userId: true, approvalStatus: true },
  });
  if (!profile) {
    return null;
  }

  if (profile.approvalStatus !== "APPROVED") {
    return null;
  }

  return { userId, profile };
}

export async function GET() {
  const vendor = await ensureVendor();
  if (!vendor) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  if (readLimiter) {
    const { success } = await readLimiter.limit(`vendor-inventory-read:${vendor.userId}`);
    if (!success) return NextResponse.json({ error: "Too Many Requests" }, { status: 429 });
  } else if (!shouldBypassRateLimit()) {
    return NextResponse.json({ error: "Rate limiting unavailable" }, { status: 500 });
  }

  const rows = await prisma.$queryRaw<Array<{ inventoryItems: unknown }>>`
    SELECT "inventoryItems"
    FROM "VendorProfile"
    WHERE "id" = ${vendor.profile.id}
    LIMIT 1
  `;

  const inventory = rows[0]?.inventoryItems ?? null;

  return NextResponse.json({ inventory });
}

export async function PATCH(req: Request) {
  const vendor = await ensureVendor();
  if (!vendor) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  if (writeLimiter) {
    const { success } = await writeLimiter.limit(`vendor-inventory-write:${vendor.userId}`);
    if (!success) return NextResponse.json({ error: "Too Many Requests" }, { status: 429 });
  } else if (!shouldBypassRateLimit()) {
    return NextResponse.json({ error: "Rate limiting unavailable" }, { status: 500 });
  }

  const body = await req.json();
  const parsed = requestSchema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: "Invalid request" }, { status: 400 });

  await prisma.$transaction(async (tx) => {
    await tx.$executeRaw`
      UPDATE "VendorProfile"
      SET "inventoryItems" = ${JSON.stringify(parsed.data)}::jsonb
      WHERE "id" = ${vendor.profile.id}
    `;

    await tx.activityLog.create({
      data: {
        userId: vendor.userId,
        action: "VENDOR_INVENTORY_UPDATED",
        details: `Vendor inventory updated for ${vendor.profile.id}`,
      },
    });

  });

  return NextResponse.json({ inventory: parsed.data });
}
