import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { createRateLimiter, shouldBypassRateLimit } from "@/lib/ratelimit";
import { OrderStatus } from "@prisma/client";
import { resolveStoredFileUrl } from "@/lib/supabase-server";

const readLimiter = createRateLimiter(60, "1 m");

export async function GET(req: Request) {
  const session = await auth();
  const userId = session?.user?.id;
  const role = (session?.user as { role?: string } | undefined)?.role;

  if (!userId || role !== "ADMIN") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  if (readLimiter) {
    const { success } = await readLimiter.limit(`admin-orders-read:${userId}`);
    if (!success) {
      return NextResponse.json({ error: "Too Many Requests" }, { status: 429 });
    }
  } else if (!shouldBypassRateLimit()) {
    return NextResponse.json({ error: "Rate limiting unavailable" }, { status: 500 });
  }

  const url = new URL(req.url);
  const statusParam = url.searchParams.get("status");
  const q = url.searchParams.get("q")?.trim();

  const status = statusParam && Object.values(OrderStatus).includes(statusParam as OrderStatus)
    ? (statusParam as OrderStatus)
    : undefined;

  const orders = await prisma.order.findMany({
    where: {
      status: status ? { equals: status } : undefined,
      OR: q
        ? [
          { id: { contains: q } },
          { student: { name: { contains: q, mode: "insensitive" } } },
          { student: { email: { contains: q, mode: "insensitive" } } },
          { vendor: { shopName: { contains: q, mode: "insensitive" } } },
        ]
        : undefined,
    },
    include: {
      student: { select: { id: true, name: true, email: true } },
      vendor: { select: { id: true, shopName: true } },
      files: { select: { id: true, fileName: true, fileUrl: true } },
    },
    orderBy: { createdAt: "desc" },
    take: 200,
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
