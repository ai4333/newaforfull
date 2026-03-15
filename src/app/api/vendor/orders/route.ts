import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { OrderStatus } from "@prisma/client";
import { requireActiveUser } from "@/lib/auth-helpers";

export async function GET(req: Request) {
  const authResult = await requireActiveUser("VENDOR");
  if ("response" in authResult) {
    return authResult.response;
  }
  const userId = authResult.user.id;

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

  const url = new URL(req.url);
  const statusParam = url.searchParams.get("status");
  const status = statusParam && Object.values(OrderStatus).includes(statusParam as OrderStatus)
    ? (statusParam as OrderStatus)
    : undefined;

  const orders = await prisma.order.findMany({
    where: {
      vendorId: vendorProfile.id,
      status: status ? { equals: status } : undefined,
    },
    select: {
      id: true,
      status: true,
      createdAt: true,
      files: {
        select: {
          fileName: true,
          fileUrl: true,
          pages: true,
          copies: true,
          printType: true,
          paperType: true,
          binding: true,
          duplex: true,
        },
      },
      student: { select: { id: true, name: true, email: true } },
    },
    orderBy: { createdAt: "desc" },
    take: 120,
  });

  return NextResponse.json(
    { orders },
    { headers: { "Cache-Control": "private, max-age=10" } }
  );
}
