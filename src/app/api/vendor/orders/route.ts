import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { OrderStatus } from "@prisma/client";
import { resolveStoredFileUrl } from "@/lib/supabase-server";
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
    include: {
      files: true,
      student: { select: { id: true, name: true, email: true } },
    },
    orderBy: { createdAt: "desc" },
  });

  const resolvedOrders = await Promise.all(
    orders.map(async (order) => ({
      ...order,
      files: await Promise.all(
        order.files.map(async (file) => ({
          ...file,
          fileUrl: await resolveStoredFileUrl(file.fileUrl),
        }))
      ),
    }))
  );

  return NextResponse.json({ orders: resolvedOrders });
}
