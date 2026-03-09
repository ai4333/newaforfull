import { NextResponse } from "next/server";
import { z } from "zod";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { OrderStatus } from "@prisma/client";
import { createRateLimiter, shouldBypassRateLimit } from "@/lib/ratelimit";

const requestSchema = z.object({
  orderId: z.string().uuid(),
  status: z.enum(["DISPUTED", "CANCELLED", "COMPLETED", "ACCEPTED"]),
  note: z.string().min(3).max(300).optional(),
});

const writeLimiter = createRateLimiter(40, "1 m");

const allowedAdminTransitions: Record<OrderStatus, OrderStatus[]> = {
  PENDING: ["CANCELLED"],
  PAYMENT_PENDING: ["CANCELLED"],
  PAID: ["DISPUTED", "CANCELLED"],
  ACCEPTED: ["DISPUTED", "CANCELLED"],
  READY: ["DISPUTED", "CANCELLED"],
  COMPLETED: ["DISPUTED"],
  REJECTED: ["DISPUTED"],
  DISPUTED: ["ACCEPTED", "COMPLETED", "CANCELLED"],
  CANCELLED: [],
};

export async function PATCH(req: Request) {
  const session = await auth();
  const userId = session?.user?.id;
  const role = (session?.user as { role?: string } | undefined)?.role;

  if (!userId || role !== "ADMIN") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

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
