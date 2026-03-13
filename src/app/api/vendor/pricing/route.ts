import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { createRateLimiter, shouldBypassRateLimit } from "@/lib/ratelimit";
import { requireActiveUser } from "@/lib/auth-helpers";

const paperSchema = z.object({
  size: z.string().min(1),
  bw: z.number().nonnegative(),
  color: z.number().nonnegative(),
});

const gsmSchema = z.object({
  gsm: z.string().min(1),
  add: z.number(),
});

const finishingSchema = z.object({
  item: z.string().min(1),
  price: z.number().nonnegative(),
  enabled: z.boolean(),
});

const requestSchema = z.object({
  paperPrices: z.array(paperSchema).min(1),
  gsmPrices: z.array(gsmSchema).min(1),
  finishingPrices: z.array(finishingSchema).min(1),
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
    const { success } = await readLimiter.limit(`vendor-pricing-read:${vendor.userId}`);
    if (!success) return NextResponse.json({ error: "Too Many Requests" }, { status: 429 });
  } else if (!shouldBypassRateLimit()) {
    return NextResponse.json({ error: "Rate limiting unavailable" }, { status: 500 });
  }

  const rows = await prisma.$queryRaw<Array<{ pricingConfig: unknown; "pricePerPageBW": number | null; "pricePerPageColor": number | null }>>`
    SELECT "pricingConfig", "pricePerPageBW", "pricePerPageColor"
    FROM "VendorProfile"
    WHERE "id" = ${vendor.profile.id}
    LIMIT 1
  `;

  const row = rows[0];
  let pricing = row?.pricingConfig ?? null;

  if (!pricing) {
    pricing = {
      paperPrices: [
        {
          size: "A4",
          bw: row?.pricePerPageBW ?? 2,
          color: row?.pricePerPageColor ?? 8,
        },
      ],
      gsmPrices: [],
      finishingPrices: [],
    };
  }

  return NextResponse.json({ pricing });
}

export async function PATCH(req: Request) {
  const vendor = await ensureVendor();
  if (!vendor) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  if (writeLimiter) {
    const { success } = await writeLimiter.limit(`vendor-pricing-write:${vendor.userId}`);
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
      SET "pricingConfig" = ${JSON.stringify(parsed.data)}::jsonb
      WHERE "id" = ${vendor.profile.id}
    `;

    await tx.activityLog.create({
      data: {
        userId: vendor.userId,
        action: "VENDOR_PRICING_UPDATED",
        details: `Vendor pricing updated for ${vendor.profile.id}`,
      },
    });

  });

  return NextResponse.json({ pricing: parsed.data });
}
