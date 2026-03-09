import { NextResponse } from "next/server";
import { z } from "zod";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { createRateLimiter, shouldBypassRateLimit } from "@/lib/ratelimit";

const requestSchema = z.object({
  orderId: z.string().uuid(),
});

const rateLimiter = createRateLimiter(5, "1 m");

export async function POST(req: Request) {
  if (rateLimiter) {
    const session = await auth();
    const identity = session?.user?.id ?? req.headers.get("x-forwarded-for") ?? "anonymous";
    const { success } = await rateLimiter.limit(`payment-create:${identity}`);
    if (!success) {
      return NextResponse.json({ error: "Too Many Requests" }, { status: 429 });
    }
  } else if (!shouldBypassRateLimit()) {
    return NextResponse.json({ error: "Rate limiting unavailable" }, { status: 500 });
  }

  const session = await auth();
  const userId = session?.user?.id;
  const role = (session?.user as { role?: string } | undefined)?.role;

  if (!userId || role !== "STUDENT") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

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

  const keyId = process.env.RAZORPAY_KEY_ID;
  const keySecret = process.env.RAZORPAY_KEY_SECRET;

  if (!keyId || !keySecret) {
    return NextResponse.json({ error: "Razorpay not configured" }, { status: 500 });
  }

  const amount = Math.round(order.totalPaid * 100);
  const response = await fetch("https://api.razorpay.com/v1/orders", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Basic ${Buffer.from(`${keyId}:${keySecret}`).toString("base64")}`,
    },
    body: JSON.stringify({
      amount,
      currency: "INR",
      receipt: `order_${order.id}`,
      payment_capture: 1,
    }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    await prisma.activityLog.create({
      data: {
        userId,
        action: "PAYMENT_CREATE_FAILED",
        details: errorText.slice(0, 500),
      },
    });
    return NextResponse.json({ error: "Razorpay order creation failed" }, { status: 502 });
  }

  const data = (await response.json()) as { id: string };

  await prisma.$transaction([
    prisma.order.update({
      where: { id: order.id },
      data: { razorpayOrderId: data.id, status: "PAYMENT_PENDING" },
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
