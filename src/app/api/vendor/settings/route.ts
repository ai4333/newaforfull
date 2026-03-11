import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { createRateLimiter, shouldBypassRateLimit } from "@/lib/ratelimit";
import { requireActiveUser } from "@/lib/auth-helpers";

const businessHourSchema = z.object({
  label: z.string().min(1),
  open: z.string().min(1),
  close: z.string().min(1),
});

const patchSchema = z.object({
  shopName: z.string().min(2).optional(),
  ownerName: z.string().min(2).optional(),
  contactNumber: z.string().min(5).optional(),
  shopAddress: z.string().min(5).optional(),
  acceptingOrders: z.boolean().optional(),
  expressDelivery: z.boolean().optional(),
  deliveryRadiusKm: z.number().min(0).max(50).optional(),
  businessHours: z.array(businessHourSchema).optional(),
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
    select: {
      id: true,
      approvalStatus: true,
      shopName: true,
      ownerName: true,
      contactNumber: true,
      shopAddress: true,
      acceptingOrders: true,
      expressDelivery: true,
      deliveryRadiusKm: true,
      businessHours: true,
    },
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
  if (!vendor) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  if (readLimiter) {
    const { success } = await readLimiter.limit(`vendor-settings-read:${vendor.userId}`);
    if (!success) {
      return NextResponse.json({ error: "Too Many Requests" }, { status: 429 });
    }
  } else if (!shouldBypassRateLimit()) {
    return NextResponse.json({ error: "Rate limiting unavailable" }, { status: 500 });
  }

  return NextResponse.json({ settings: vendor.profile });
}

export async function PATCH(req: Request) {
  const vendor = await ensureVendor();
  if (!vendor) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  if (writeLimiter) {
    const { success } = await writeLimiter.limit(`vendor-settings-write:${vendor.userId}`);
    if (!success) {
      return NextResponse.json({ error: "Too Many Requests" }, { status: 429 });
    }
  } else if (!shouldBypassRateLimit()) {
    return NextResponse.json({ error: "Rate limiting unavailable" }, { status: 500 });
  }

  const body = await req.json();
  const parsed = patchSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }

  const updated = await prisma.$transaction(async (tx) => {
    const result = await tx.vendorProfile.update({
      where: { id: vendor.profile.id },
      data: {
        shopName: parsed.data.shopName,
        ownerName: parsed.data.ownerName,
        contactNumber: parsed.data.contactNumber,
        shopAddress: parsed.data.shopAddress,
        acceptingOrders: parsed.data.acceptingOrders,
        expressDelivery: parsed.data.expressDelivery,
        deliveryRadiusKm: parsed.data.deliveryRadiusKm,
        businessHours: parsed.data.businessHours,
      },
      select: {
        id: true,
        shopName: true,
        ownerName: true,
        contactNumber: true,
        shopAddress: true,
        acceptingOrders: true,
        expressDelivery: true,
        deliveryRadiusKm: true,
        businessHours: true,
      },
    });

    await tx.activityLog.create({
      data: {
        userId: vendor.userId,
        action: "VENDOR_SETTINGS_UPDATED",
        details: `Settings updated for vendor ${vendor.profile.id}`,
      },
    });

    return result;
  });

  return NextResponse.json({ settings: updated });
}
