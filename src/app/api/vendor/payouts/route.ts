import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireActiveUser } from "@/lib/auth-helpers";

export async function GET() {
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
