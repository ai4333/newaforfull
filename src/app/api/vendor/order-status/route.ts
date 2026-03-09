import { NextResponse } from "next/server";
import { z } from "zod";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { OrderStatus } from "@prisma/client";
import { createRateLimiter, shouldBypassRateLimit } from "@/lib/ratelimit";

const requestSchema = z.object({
  orderId: z.string().uuid(),
  status: z.enum(["ACCEPTED", "READY", "COMPLETED", "REJECTED"]),
});

const allowedTransitions: Record<OrderStatus, OrderStatus[]> = {
  PENDING: [],
  PAYMENT_PENDING: [],
  PAID: ["ACCEPTED", "REJECTED"],
  ACCEPTED: ["READY", "REJECTED"],
  READY: ["COMPLETED"],
  COMPLETED: [],
  REJECTED: [],
  DISPUTED: [],
  CANCELLED: [],
};

const writeLimiter = createRateLimiter(40, "1 m");

export async function PATCH(req: Request) {
  const session = await auth();
  const userId = session?.user?.id;
  const role = (session?.user as { role?: string } | undefined)?.role;

  if (!userId || role !== "VENDOR") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  if (writeLimiter) {
    const { success } = await writeLimiter.limit(`vendor-order-status:${userId}`);
    if (!success) {
      return NextResponse.json({ error: "Too Many Requests" }, { status: 429 });
    }
  } else if (!shouldBypassRateLimit()) {
    return NextResponse.json({ error: "Rate limiting unavailable" }, { status: 500 });
  }

  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const vendorProfile = await prisma.vendorProfile.findUnique({
    where: { userId },
    select: { id: true },
  });

  if (!vendorProfile) {
    return NextResponse.json({ error: "Vendor profile not found" }, { status: 404 });
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
