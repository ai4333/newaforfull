import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const session = await auth();
  const userId = session?.user?.id;
  const role = (session?.user as { role?: string } | undefined)?.role;

  if (!userId || role !== "ADMIN") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const [orderAgg, payoutAgg, userCounts] = await Promise.all([
    prisma.order.aggregate({
      _count: { _all: true },
      _sum: { platformRevenue: true, totalPaid: true },
    }),
    prisma.payout.aggregate({
      _count: { _all: true },
      _sum: { amount: true },
      where: { status: "PENDING" },
    }),
    prisma.user.groupBy({
      by: ["role"],
      _count: { _all: true },
    }),
  ]);

  const roleCounts = userCounts.reduce<Record<string, number>>((acc, row) => {
    acc[row.role] = row._count._all;
    return acc;
  }, {});

  return NextResponse.json({
    orders: {
      total: orderAgg._count._all,
      platformRevenue: orderAgg._sum.platformRevenue ?? 0,
      totalPaid: orderAgg._sum.totalPaid ?? 0,
    },
    payouts: {
      pendingCount: payoutAgg._count._all,
      pendingAmount: payoutAgg._sum.amount ?? 0,
    },
    users: roleCounts,
  });
}
