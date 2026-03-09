import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { OrderStatus } from "@prisma/client";
import { resolveStoredFileUrl } from "@/lib/supabase-server";

export async function GET(req: Request) {
  const session = await auth();
  const userId = session?.user?.id;
  const role = (session?.user as { role?: string } | undefined)?.role;

  if (!userId || role !== "VENDOR") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const vendorProfile = await prisma.vendorProfile.findUnique({
    where: { userId },
    select: { id: true },
  });

  if (!vendorProfile) {
    return NextResponse.json({ error: "Vendor profile not found" }, { status: 404 });
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
