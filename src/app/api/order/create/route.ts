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
        pages: z.number().int().positive().optional(),
        copies: z.number().int().positive().optional(),
        printType: z.string().min(1).max(40).optional(),
        paperType: z.string().min(1).max(40).optional(),
        binding: z.string().min(1).max(60).optional(),
        duplex: z.boolean().optional(),
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
  const normalizedFiles = (parsed.data.files && parsed.data.files.length > 0)
    ? parsed.data.files.map((f) => ({
      ...f,
      pages: f.pages ?? 1,
      copies: f.copies ?? 1,
      printType: (f.printType || parsed.data.printType || "BW").toUpperCase(),
      paperType: f.paperType || "A4",
      binding: f.binding || parsed.data.binding || "No Binding",
      duplex: Boolean(f.duplex),
    }))
    : [{
      fileUrl: "",
      fileName: "Document",
      fileSize: 1,
      pages: parsed.data.pages ?? 1,
      copies: parsed.data.copies ?? 1,
      printType: (parsed.data.printType || "BW").toUpperCase(),
      paperType: "A4",
      binding: parsed.data.binding || "No Binding",
      duplex: false,
    }];

  const computedLines = normalizedFiles.map((f) => {
    const ratePerPage = f.printType === "COLOR" ? (vendor.pricePerPageColor ?? 8) : (vendor.pricePerPageBW ?? 2);
    const bindingFee = bindingFeeByType[f.binding.toUpperCase()] ?? 0;
    const duplexMultiplier = f.duplex ? 0.9 : 1;
    const lineAmount = Number((f.pages * f.copies * ratePerPage * duplexMultiplier + bindingFee).toFixed(2));

    return {
      ...f,
      lineAmount,
    };
  });

  const baseAmount = Number(computedLines.reduce((sum, f) => sum + f.lineAmount, 0).toFixed(2));
  const aggregatePages = computedLines.reduce((sum, f) => sum + f.pages, 0);
  const aggregateCopies = computedLines.reduce((sum, f) => sum + f.copies, 0);
  const aggregatePrintType = computedLines.some((f) => f.printType === "COLOR") ? "COLOR" : "BW";

  const breakdown = calculateOrderBreakdown(baseAmount);

  const order = await prisma.$transaction(async (tx) => {
    const created = await tx.order.create({
      data: {
        studentId: userId,
        vendorId: parsed.data.vendorId,
        status: "PAYMENT_PENDING",
        ...breakdown,
        pages: aggregatePages,
        printType: aggregatePrintType,
        copies: aggregateCopies,
        binding: parsed.data.binding,
        deliveryType: parsed.data.deliveryType,
        deliveryAddress: parsed.data.deliveryAddress,
        files: parsed.data.files
          ? {
            create: computedLines.map((file) => ({
              fileUrl: file.fileUrl,
              fileName: file.fileName,
              fileSize: file.fileSize,
              pages: file.pages,
              copies: file.copies,
              printType: file.printType,
              paperType: file.paperType,
              binding: file.binding,
              duplex: file.duplex,
              lineAmount: file.lineAmount,
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
