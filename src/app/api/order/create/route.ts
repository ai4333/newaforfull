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
  pages: z.number().int().positive().optional(),
  printType: z.string().min(1).max(40).optional(),
  copies: z.number().int().positive().optional(),
  binding: z.string().min(1).max(60).optional(),
  deliveryType: z.nativeEnum(DeliveryType).optional(),
  deliveryAddress: z.string().min(5).max(400).optional(),
  files: z
    .array(
      z.object({
        fileUrl: z.string().min(1),
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
    select: {
      id: true,
      acceptingOrders: true,
      pricePerPageBW: true,
      pricePerPageColor: true,
    },
  });

  if (!vendor) {
    return NextResponse.json({ error: "Vendor not found" }, { status: 404 });
  }

  if (!vendor.acceptingOrders) {
    return NextResponse.json({ error: "Selected vendor is not accepting orders" }, { status: 409 });
  }

  const pages = parsed.data.pages ?? 1;
  const copies = parsed.data.copies ?? 1;
  const printType = (parsed.data.printType || "BW").toUpperCase();
  const ratePerPage = printType === "COLOR"
    ? (vendor.pricePerPageColor ?? 8)
    : (vendor.pricePerPageBW ?? 2);

  const bindingFeeByType: Record<string, number> = {
    "NO BINDING": 0,
    "SPIRAL BINDING": 30,
    "SOFT BINDING": 45,
    "HARD BINDING": 80,
    "STAPLE (TOP LEFT)": 5,
    "CENTER PIN": 8,
    "LAMINATION (FRONT ONLY)": 20,
    "LAMINATION (BOTH SIDES)": 35,
  };
  const bindingLabel = (parsed.data.binding || "No Binding").toUpperCase();
  const bindingFee = bindingFeeByType[bindingLabel] ?? 0;

  const baseAmount = Number((pages * copies * ratePerPage + bindingFee).toFixed(2));

  const breakdown = calculateOrderBreakdown(baseAmount);

  const order = await prisma.$transaction(async (tx) => {
    const created = await tx.order.create({
      data: {
        studentId: userId,
        vendorId: parsed.data.vendorId,
        status: "PAYMENT_PENDING",
        ...breakdown,
        pages,
        printType,
        copies,
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
