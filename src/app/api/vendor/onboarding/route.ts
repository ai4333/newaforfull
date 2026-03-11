import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { createRateLimiter, shouldBypassRateLimit } from "@/lib/ratelimit";
import { requireActiveUser } from "@/lib/auth-helpers";

const readLimiter = createRateLimiter(80, "1 m");
const writeLimiter = createRateLimiter(30, "1 m");

const onboardingSchema = z.object({
  ownerName: z.string().min(2).max(120),
  phone: z.string().min(8).max(20),
  shopName: z.string().min(2).max(150),
  shopAddress: z.string().min(5).max(300),
  openingTime: z.string().min(3).max(20),
  closingTime: z.string().min(3).max(20),
  servicesAvailable: z.array(z.string().min(2)).min(1),
  pricePerPageBW: z.number().nonnegative(),
  pricePerPageColor: z.number().nonnegative(),
  upiId: z.string().min(3).max(120),
});

function hasCompletedOnboarding(profile: {
  ownerName: string | null;
  contactNumber: string | null;
  shopName: string;
  shopAddress: string | null;
  openingTime: string | null;
  closingTime: string | null;
  servicesAvailable: unknown;
  pricePerPageBW: number | null;
  pricePerPageColor: number | null;
  upiId: string | null;
}) {
  return Boolean(
    profile.ownerName &&
      profile.contactNumber &&
      profile.shopName &&
      profile.shopAddress &&
      profile.openingTime &&
      profile.closingTime &&
      Array.isArray(profile.servicesAvailable) &&
      profile.servicesAvailable.length > 0 &&
      profile.pricePerPageBW !== null &&
      profile.pricePerPageColor !== null &&
      profile.upiId
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
    },
    select: {
      id: true,
      ownerName: true,
      contactNumber: true,
      shopName: true,
      shopAddress: true,
      openingTime: true,
      closingTime: true,
      servicesAvailable: true,
      pricePerPageBW: true,
      pricePerPageColor: true,
      upiId: true,
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
        openingTime: parsed.data.openingTime,
        closingTime: parsed.data.closingTime,
        servicesAvailable: parsed.data.servicesAvailable,
        pricePerPageBW: parsed.data.pricePerPageBW,
        pricePerPageColor: parsed.data.pricePerPageColor,
        upiId: parsed.data.upiId,
        approvalStatus: "PENDING_APPROVAL",
      },
      create: {
        userId: authResult.user.id,
        ownerName: parsed.data.ownerName,
        contactNumber: parsed.data.phone,
        shopName: parsed.data.shopName,
        shopAddress: parsed.data.shopAddress,
        openingTime: parsed.data.openingTime,
        closingTime: parsed.data.closingTime,
        servicesAvailable: parsed.data.servicesAvailable,
        pricePerPageBW: parsed.data.pricePerPageBW,
        pricePerPageColor: parsed.data.pricePerPageColor,
        upiId: parsed.data.upiId,
        approvalStatus: "PENDING_APPROVAL",
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
