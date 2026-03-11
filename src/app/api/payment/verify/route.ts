import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { verifyRazorpaySignature } from "@/lib/payments";
import { requireActiveUser } from "@/lib/auth-helpers";

const requestSchema = z.object({
  orderId: z.string().uuid(),
  razorpayOrderId: z.string().min(1),
  razorpayPaymentId: z.string().min(1),
  razorpaySignature: z.string().min(1),
});

export async function POST(req: Request) {
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
    where: { id: parsed.data.orderId, studentId: userId },
  });

  if (!order) {
    return NextResponse.json({ error: "Order not found" }, { status: 404 });
  }

  if (order.razorpayOrderId && order.razorpayOrderId !== parsed.data.razorpayOrderId) {
    return NextResponse.json({ error: "Order mismatch" }, { status: 409 });
  }

  const keySecret = process.env.RAZORPAY_KEY_SECRET;
  if (!keySecret) {
    return NextResponse.json({ error: "Razorpay not configured" }, { status: 500 });
  }

  const isValid = verifyRazorpaySignature(
    parsed.data.razorpayOrderId,
    parsed.data.razorpayPaymentId,
    parsed.data.razorpaySignature,
    keySecret
  );

  if (!isValid) {
    await prisma.activityLog.create({
      data: {
        userId,
        action: "PAYMENT_VERIFY_FAILED",
        details: `Invalid signature for order ${order.id}`,
      },
    });
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
  }

  if (order.status === "PAID") {
    return NextResponse.json({ status: "ok" });
  }

  await prisma.$transaction([
    prisma.order.update({
      where: { id: order.id },
      data: {
        status: "PAID",
        razorpayOrderId: parsed.data.razorpayOrderId,
        razorpayPaymentId: parsed.data.razorpayPaymentId,
      },
    }),
    prisma.activityLog.create({
      data: {
        userId,
        action: "PAYMENT_VERIFIED",
        details: `Payment verified for order ${order.id}`,
      },
    }),
  ]);

  return NextResponse.json({ status: "ok" });
}
