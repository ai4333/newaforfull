import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { requireAdminApiUser } from "@/lib/auth-helpers";
import { createRateLimiter, shouldBypassRateLimit } from "@/lib/ratelimit";

const writeLimiter = createRateLimiter(40, "1 m");

const requestSchema = z.object({
  vendorId: z.string().uuid(),
  status: z.enum(["APPROVED", "REJECTED", "PENDING_APPROVAL"]),
});

export async function PATCH(req: Request) {
  const authResult = await requireAdminApiUser();
  if ("response" in authResult) {
    return authResult.response;
  }

  if (writeLimiter) {
    const { success } = await writeLimiter.limit(`admin-vendor-status:${authResult.user.id}`);
    if (!success) {
      return NextResponse.json({ error: "Too Many Requests" }, { status: 429 });
    }
  } else if (!shouldBypassRateLimit()) {
    return NextResponse.json({ error: "Rate limiting unavailable" }, { status: 500 });
  }

  const parsed = requestSchema.safeParse(await req.json());
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }

  const vendor = await prisma.vendorProfile.findUnique({ where: { id: parsed.data.vendorId }, select: { id: true, userId: true } });
  if (!vendor) {
    return NextResponse.json({ error: "Vendor not found" }, { status: 404 });
  }

  const updated = await prisma.$transaction(async (tx) => {
    const acceptingOrders = parsed.data.status === "APPROVED";

    const result = await tx.vendorProfile.update({
      where: { id: parsed.data.vendorId },
      data: {
        approvalStatus: parsed.data.status,
        acceptingOrders,
      },
    });

    await tx.activityLog.create({
      data: {
        userId: authResult.user.id,
        action: "ADMIN_VENDOR_STATUS_UPDATED",
        details: `Vendor ${parsed.data.vendorId} -> ${parsed.data.status}`,
      },
    });

    return result;
  });

  return NextResponse.json({ vendor: updated });
}
