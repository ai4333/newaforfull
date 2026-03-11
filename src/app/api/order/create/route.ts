import { NextResponse } from "next/server";
import { z } from "zod";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { calculateOrderBreakdown } from "@/lib/payments";
import { createRateLimiter, shouldBypassRateLimit } from "@/lib/ratelimit";
import { DeliveryType } from "@prisma/client";
import { requireActiveUser } from "@/lib/auth-helpers";

const requestSchema = z.object({
  vendorId: z.string().uuid(),
  baseAmount: z.number().positive(),
  pages: z.number().int().positive().optional(),
  printType: z.string().min(1).max(40).optional(),
  copies: z.number().int().positive().optional(),
  binding: z.string().min(1).max(60).optional(),
  deliveryType: z.nativeEnum(DeliveryType).optional(),
  deliveryAddress: z.string().min(5).max(400).optional(),
  files: z
    .array(
      z.object({
        fileUrl: z.string().url(),
        fileName: z.string().min(1),
        fileSize: z.number().int().positive(),
      })
    )
    .optional(),
});

const rateLimiter = createRateLimiter(5, "1 m");

export async function POST(req: Request) {
  if (rateLimiter) {
    const session = await auth();
    const identity = session?.user?.id ?? req.headers.get("x-forwarded-for") ?? "anonymous";
    const { success } = await rateLimiter.limit(`order-create:${identity}`);
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

  const vendor = await prisma.vendorProfile.findUnique({
    where: { id: parsed.data.vendorId },
    select: { id: true },
  });

  if (!vendor) {
    return NextResponse.json({ error: "Vendor not found" }, { status: 404 });
  }

  const breakdown = calculateOrderBreakdown(parsed.data.baseAmount);

  const order = await prisma.$transaction(async (tx) => {
    const created = await tx.order.create({
      data: {
        studentId: userId,
        vendorId: parsed.data.vendorId,
        status: "PAYMENT_PENDING",
        ...breakdown,
        pages: parsed.data.pages ?? 1,
        printType: parsed.data.printType,
        copies: parsed.data.copies,
        binding: parsed.data.binding,
        deliveryType: parsed.data.deliveryType,
        deliveryAddress: parsed.data.deliveryAddress,
        files: parsed.data.files
          ? {
            create: parsed.data.files.map((file) => ({
              fileUrl: file.fileUrl,
              fileName: file.fileName,
              fileSize: file.fileSize,
            })),
          }
          : undefined,
      },
    });

    await tx.activityLog.create({
      data: {
        userId,
        action: "ORDER_CREATED",
        details: `Order ${created.id} created with baseAmount ${breakdown.baseAmount}`,
      },
    });

    return created;
  });

  return NextResponse.json({ order }, { status: 201 });
}
