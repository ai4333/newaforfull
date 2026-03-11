import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { OrderStatus } from "@prisma/client";
import { createRateLimiter, shouldBypassRateLimit } from "@/lib/ratelimit";
import { requireActiveUser } from "@/lib/auth-helpers";

const requestSchema = z.object({
  orderId: z.string().uuid(),
  status: z.enum(["ACCEPTED", "PRINTING", "READY", "COMPLETED", "REJECTED"]),
});

const allowedTransitions: Record<OrderStatus, OrderStatus[]> = {
  PENDING: [],
  PAYMENT_PENDING: [],
  PAID: ["ACCEPTED", "REJECTED"],
  ACCEPTED: ["PRINTING", "REJECTED"],
  PRINTING: ["READY", "REJECTED"],
  READY: ["COMPLETED"],
  COMPLETED: [],
  REJECTED: [],
  DISPUTED: [],
  CANCELLED: [],
};

const writeLimiter = createRateLimiter(40, "1 m");

export async function PATCH(req: Request) {
  const authResult = await requireActiveUser("VENDOR");
  if ("response" in authResult) {
    return authResult.response;
  }
  const userId = authResult.user.id;

  if (writeLimiter) {
    const { success } = await writeLimiter.limit(`vendor-order-status:${userId}`);
    if (!success) {
      return NextResponse.json({ error: "Too Many Requests" }, { status: 429 });
    }
  } else if (!shouldBypassRateLimit()) {
    return NextResponse.json({ error: "Rate limiting unavailable" }, { status: 500 });
  }

  const vendorProfile = await prisma.vendorProfile.findUnique({
    where: { userId },
    select: { id: true, approvalStatus: true },
  });

  if (!vendorProfile) {
    return NextResponse.json({ error: "Vendor profile not found" }, { status: 404 });
  }

  if (vendorProfile.approvalStatus !== "APPROVED") {
    return NextResponse.json({ error: "Vendor account pending admin approval" }, { status: 403 });
  }

  const body = await req.json();
  const parsed = requestSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }

  const order = await prisma.order.findFirst({
    where: { id: parsed.data.orderId, vendorId: vendorProfile.id },
  });

  if (!order) {
    return NextResponse.json({ error: "Order not found" }, { status: 404 });
  }

  const nextStatus = parsed.data.status as OrderStatus;
  const allowedNext = allowedTransitions[order.status] ?? [];

  if (!allowedNext.includes(nextStatus)) {
    return NextResponse.json(
      {
        error: `Invalid status transition from ${order.status} to ${nextStatus}`,
      },
      { status: 409 }
    );
  }

  const updated = await prisma.$transaction(async (tx) => {
    const result = await tx.order.update({
      where: { id: order.id },
      data: { status: nextStatus },
    });

    await tx.activityLog.create({
      data: {
        userId,
        action: "ORDER_STATUS_UPDATED",
        details: `Order ${order.id} set to ${nextStatus}`,
      },
    });

    return result;
  });

  return NextResponse.json({ order: updated });
}
