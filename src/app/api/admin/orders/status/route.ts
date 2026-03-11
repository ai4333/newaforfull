import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { OrderStatus } from "@prisma/client";
import { createRateLimiter, shouldBypassRateLimit } from "@/lib/ratelimit";
import { requireAdminApiUser } from "@/lib/auth-helpers";

const requestSchema = z.object({
  orderId: z.string().uuid(),
  status: z.enum(["PAYMENT_PENDING", "PAID", "ACCEPTED", "PRINTING", "READY", "COMPLETED", "REJECTED"]),
  note: z.string().min(3).max(300).optional(),
});

const writeLimiter = createRateLimiter(40, "1 m");

const allowedAdminTransitions: Record<OrderStatus, OrderStatus[]> = {
  PENDING: ["PAYMENT_PENDING", "REJECTED"],
  PAYMENT_PENDING: ["PAID", "REJECTED"],
  PAID: ["ACCEPTED", "REJECTED"],
  ACCEPTED: ["PRINTING", "REJECTED"],
  PRINTING: ["READY", "REJECTED"],
  READY: ["COMPLETED", "REJECTED"],
  COMPLETED: [],
  REJECTED: [],
  DISPUTED: ["ACCEPTED", "PRINTING", "READY", "COMPLETED", "REJECTED"],
  CANCELLED: ["PAYMENT_PENDING", "REJECTED"],
};

export async function PATCH(req: Request) {
  const authResult = await requireAdminApiUser();
  if ("response" in authResult) {
    return authResult.response;
  }
  const userId = authResult.user.id;

  if (writeLimiter) {
    const { success } = await writeLimiter.limit(`admin-order-status:${userId}`);
    if (!success) {
      return NextResponse.json({ error: "Too Many Requests" }, { status: 429 });
    }
  } else if (!shouldBypassRateLimit()) {
    return NextResponse.json({ error: "Rate limiting unavailable" }, { status: 500 });
  }

  const body = await req.json();
  const parsed = requestSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }

  const order = await prisma.order.findUnique({ where: { id: parsed.data.orderId } });
  if (!order) {
    return NextResponse.json({ error: "Order not found" }, { status: 404 });
  }

  const nextStatus = parsed.data.status as OrderStatus;
  const allowed = allowedAdminTransitions[order.status] ?? [];
  if (!allowed.includes(nextStatus)) {
    return NextResponse.json(
      { error: `Invalid status transition from ${order.status} to ${nextStatus}` },
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
        action: "ADMIN_ORDER_STATUS_UPDATED",
        details: `Order ${order.id} -> ${nextStatus}${parsed.data.note ? ` | ${parsed.data.note}` : ""}`,
      },
    });

    return result;
  });

  return NextResponse.json({ order: updated });
}
