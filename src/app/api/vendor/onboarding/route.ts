import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { createRateLimiter, shouldBypassRateLimit } from "@/lib/ratelimit";
import { requireActiveUser } from "@/lib/auth-helpers";
import { getDefaultVendorPricingConfig } from "@/lib/vendor-defaults";

const readLimiter = createRateLimiter(80, "1 m");
const writeLimiter = createRateLimiter(30, "1 m");

const onboardingSchema = z.object({
  ownerName: z.string().min(2).max(120),
  phone: z.string().min(8).max(20),
  shopName: z.string().min(2).max(150),
  shopAddress: z.string().min(5).max(300),
  mapLocation: z.string().max(300).optional(),
  verificationId: z.string().min(4).max(120),
});

function hasCompletedOnboarding(profile: {
  ownerName: string | null;
  contactNumber: string | null;
  shopName: string;
  shopAddress: string | null;
  mapLocation: string | null;
  businessHours: unknown;
  servicesAvailable: unknown;
  pricePerPageBW: number | null;
  pricePerPageColor: number | null;
  upiId: string | null;
  openingTime: string | null;
  closingTime: string | null;
  verificationId: string | null;
}) {
  return Boolean(
    profile.ownerName &&
      profile.contactNumber &&
      profile.shopName &&
      profile.shopAddress &&
      profile.verificationId
  );
}

export async function GET() {
  const authResult = await requireActiveUser("VENDOR");
  if ("response" in authResult) {
    return authResult.response;
  }

  if (readLimiter) {
    const { success } = await readLimiter.limit(`vendor-onboarding-read:${authResult.user.id}`);
    if (!success) {
      return NextResponse.json({ error: "Too Many Requests" }, { status: 429 });
    }
  } else if (!shouldBypassRateLimit()) {
    return NextResponse.json({ error: "Rate limiting unavailable" }, { status: 500 });
  }

  const profile = await prisma.vendorProfile.upsert({
    where: { userId: authResult.user.id },
    update: {},
    create: {
      userId: authResult.user.id,
      shopName: authResult.user.name ? `${authResult.user.name} Print Shop` : "Campus Print Vendor",
      approvalStatus: "PENDING_APPROVAL",
      acceptingOrders: false,
      pricePerPageBW: 2,
      pricePerPageColor: 8,
      pricingConfig: getDefaultVendorPricingConfig(),
    },
    select: {
      id: true,
      ownerName: true,
      contactNumber: true,
      shopName: true,
      shopAddress: true,
      mapLocation: true,
      openingTime: true,
      closingTime: true,
      businessHours: true,
      servicesAvailable: true,
      pricePerPageBW: true,
      pricePerPageColor: true,
      upiId: true,
      verificationId: true,
      approvalStatus: true,
    },
  });

  return NextResponse.json({
    profile,
    completed: hasCompletedOnboarding(profile),
  });
}

export async function PATCH(req: Request) {
  const authResult = await requireActiveUser("VENDOR");
  if ("response" in authResult) {
    return authResult.response;
  }

  if (writeLimiter) {
    const { success } = await writeLimiter.limit(`vendor-onboarding-write:${authResult.user.id}`);
    if (!success) {
      return NextResponse.json({ error: "Too Many Requests" }, { status: 429 });
    }
  } else if (!shouldBypassRateLimit()) {
    return NextResponse.json({ error: "Rate limiting unavailable" }, { status: 500 });
  }

  const parsed = onboardingSchema.safeParse(await req.json());
  if (!parsed.success) {
    return NextResponse.json(
      {
        error: "Invalid request",
        details: parsed.error.flatten().fieldErrors,
      },
      { status: 400 }
    );
  }

  const profile = await prisma.$transaction(async (tx) => {
    const updated = await tx.vendorProfile.upsert({
      where: { userId: authResult.user.id },
      update: {
        ownerName: parsed.data.ownerName,
        contactNumber: parsed.data.phone,
        shopName: parsed.data.shopName,
        shopAddress: parsed.data.shopAddress,
        mapLocation: parsed.data.mapLocation,
        verificationId: parsed.data.verificationId,
        businessHours: [{ label: "Daily", open: "09:00", close: "18:00" }],
        servicesAvailable: ["A4 BW", "A4 Color", "A3 BW", "A3 Color"],
        pricePerPageBW: 2,
        pricePerPageColor: 8,
        pricingConfig: getDefaultVendorPricingConfig(),
        approvalStatus: "PENDING_APPROVAL",
        acceptingOrders: false,
      },
      create: {
        userId: authResult.user.id,
        ownerName: parsed.data.ownerName,
        contactNumber: parsed.data.phone,
        shopName: parsed.data.shopName,
        shopAddress: parsed.data.shopAddress,
        mapLocation: parsed.data.mapLocation,
        verificationId: parsed.data.verificationId,
        businessHours: [{ label: "Daily", open: "09:00", close: "18:00" }],
        servicesAvailable: ["A4 BW", "A4 Color", "A3 BW", "A3 Color"],
        pricePerPageBW: 2,
        pricePerPageColor: 8,
        pricingConfig: getDefaultVendorPricingConfig(),
        approvalStatus: "PENDING_APPROVAL",
        acceptingOrders: false,
      },
    });

    await tx.activityLog.create({
      data: {
        userId: authResult.user.id,
        action: "VENDOR_ONBOARDING_SUBMITTED",
        details: `Vendor profile submitted for review (${parsed.data.shopName})`,
      },
    });

    return updated;
  });

  return NextResponse.json({ profile, completed: true });
}
