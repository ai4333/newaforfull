import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { createRateLimiter, shouldBypassRateLimit } from "@/lib/ratelimit";
import { requireActiveUser } from "@/lib/auth-helpers";
import Razorpay from "razorpay";

const requestSchema = z.object({
  orderId: z.string().uuid(),
});

const rateLimiter = createRateLimiter(5, "1 m");

export async function POST(req: Request) {
  if (rateLimiter) {
    const authResult = await requireActiveUser("STUDENT");
    const identity = "response" in authResult ? req.headers.get("x-forwarded-for") ?? "anonymous" : authResult.user.id;
    const { success } = await rateLimiter.limit(`payment-create:${identity}`);
    if (!success) {
      return NextResponse.json({ error: "Too Many Requests" }, { status: 429 });
    }
  } else if (!shouldBypassRateLimit()) {
    return NextResponse.json({ error: "Rate limiting unavailable" }, { status: 500 });
  }

  const authResult = await requireActiveUser("STUDENT");
  if ("response" in authResult) {
    return authResult.response;
  }
  const userId = authResult.user.id;

  const body = await req.json();
  const parsed = requestSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }

  const order = await prisma.order.findFirst({
    where: {
      id: parsed.data.orderId,
      studentId: userId,
    },
  });

  if (!order) {
    return NextResponse.json({ error: "Order not found" }, { status: 404 });
  }

  if (order.status === "PAID") {
    return NextResponse.json({ error: "Order already paid" }, { status: 409 });
  }

  if (order.status !== "PAYMENT_PENDING") {
    return NextResponse.json({ error: `Payment cannot be created in status ${order.status}` }, { status: 409 });
  }

  const keyId = process.env.RAZORPAY_KEY_ID;
  const keySecret = process.env.RAZORPAY_KEY_SECRET;

  if (!keyId || !keySecret) {
    return NextResponse.json({ error: "Razorpay not configured" }, { status: 500 });
  }

  const amount = Math.round(order.totalPaid * 100);
  if (amount < 100) {
    return NextResponse.json({ error: "Order amount must be at least ₹1.00" }, { status: 400 });
  }

  const receipt = `ord_${order.id.replace(/-/g, "").slice(0, 30)}`;

  const razorpay = new Razorpay({ key_id: keyId, key_secret: keySecret });

  let data: { id: string };
  try {
    const created = await razorpay.orders.create({
      amount,
      currency: "INR",
      receipt,
    });
    data = { id: created.id };
  } catch (error) {
    const providerMessage =
      error instanceof Error
        ? error.message
        : typeof error === "object" && error && "description" in error
          ? String((error as { description?: string }).description)
          : "Razorpay rejected the order create request";

    await prisma.activityLog.create({
      data: {
        userId,
        action: "PAYMENT_CREATE_FAILED",
        details: providerMessage.slice(0, 500),
      },
    });

    return NextResponse.json(
      {
        error: "Razorpay order creation failed",
        reason: providerMessage,
      },
      { status: 502 }
    );
  }

  await prisma.$transaction([
    prisma.order.update({
      where: { id: order.id },
      data: { razorpayOrderId: data.id },
    }),
    prisma.activityLog.create({
      data: {
        userId,
        action: "PAYMENT_ORDER_CREATED",
        details: `Razorpay order ${data.id} created for ${order.id}`,
      },
    }),
  ]);

  return NextResponse.json({
    razorpayOrderId: data.id,
    keyId,
    amount,
    currency: "INR",
  });
}
