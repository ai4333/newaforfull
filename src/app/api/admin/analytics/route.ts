import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdminApiUser } from "@/lib/auth-helpers";

export async function GET() {
  const authResult = await requireAdminApiUser();
  if ("response" in authResult) {
    return authResult.response;
  }

  const [ordersPerDay, revenuePerDay, activeVendors, topVendors, topColleges] = await Promise.all([
    prisma.$queryRaw<Array<{ day: string; orders: bigint }>>`
      SELECT to_char(date_trunc('day', "createdAt"), 'YYYY-MM-DD') AS day,
             COUNT(*)::bigint AS orders
      FROM "Order"
      WHERE "createdAt" >= now() - interval '30 days'
      GROUP BY 1
      ORDER BY 1 ASC
    `,
    prisma.$queryRaw<Array<{ day: string; revenue: number }>>`
      SELECT to_char(date_trunc('day', "createdAt"), 'YYYY-MM-DD') AS day,
             COALESCE(SUM("totalPaid"), 0)::float8 AS revenue
      FROM "Order"
      WHERE "createdAt" >= now() - interval '30 days'
      GROUP BY 1
      ORDER BY 1 ASC
    `,
    prisma.vendorProfile.count({ where: { approvalStatus: "APPROVED", acceptingOrders: true } }),
    prisma.vendorProfile.findMany({
      where: { approvalStatus: "APPROVED" },
      select: {
        id: true,
        shopName: true,
        _count: { select: { orders: true } },
      },
      orderBy: { orders: { _count: "desc" } },
      take: 10,
    }),
    prisma.studentProfile.groupBy({
      by: ["college"],
      _count: { _all: true },
      where: { college: { not: null } },
      orderBy: { _count: { college: "desc" } },
      take: 10,
    }),
  ]);

  const typedTopVendors = topVendors as Array<{ id: string; shopName: string; _count: { orders: number } }>;
  const typedTopColleges = topColleges as Array<{ college: string | null; _count: { _all: number } }>;

  return NextResponse.json({
    ordersPerDay: ordersPerDay.map((row: { day: string; orders: bigint }) => ({ day: row.day, orders: Number(row.orders) })),
    revenuePerDay,
    activeVendors,
    topVendors: typedTopVendors.map((row) => ({ id: row.id, shopName: row.shopName, orders: row._count.orders })),
    topColleges: typedTopColleges.map((row) => ({ college: row.college, students: row._count._all })),
  });
}
