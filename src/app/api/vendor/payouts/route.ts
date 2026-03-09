import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const session = await auth();
  const userId = session?.user?.id;
  const role = (session?.user as { role?: string } | undefined)?.role;

  if (!userId || role !== "VENDOR") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const vendorProfile = await prisma.vendorProfile.findUnique({
    where: { userId },
    select: { id: true },
  });

  if (!vendorProfile) {
    return NextResponse.json({ error: "Vendor profile not found" }, { status: 404 });
  }

  const [payouts, pendingAgg, lifetimeAgg] = await Promise.all([
    prisma.payout.findMany({
      where: { vendorId: vendorProfile.id },
      orderBy: { createdAt: "desc" },
      take: 50,
    }),
    prisma.payout.aggregate({
      where: { vendorId: vendorProfile.id, status: "PENDING" },
      _sum: { amount: true },
    }),
    prisma.order.aggregate({
      where: { vendorId: vendorProfile.id, status: "COMPLETED" },
      _sum: { vendorEarning: true },
    }),
  ]);

  return NextResponse.json({
    payouts,
    pendingAmount: pendingAgg._sum.amount ?? 0,
    lifetimeEarnings: lifetimeAgg._sum.vendorEarning ?? 0,
  });
}
