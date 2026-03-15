import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireActiveUser } from "@/lib/auth-helpers";
import { Role } from "@prisma/client";

export async function GET() {
    try {
        const authResult = await requireActiveUser(Role.VENDOR);
        if ("response" in authResult) return authResult.response;

        const vendorId = authResult.user.id;

        const today = new Date();
        today.setHours(0, 0, 0, 0);

        const weekStart = new Date();
        weekStart.setDate(weekStart.getDate() - 7);
        weekStart.setHours(0, 0, 0, 0);

        // Run aggregations in parallel
        const [ordersToday, pendingCount, readyCount, weekAgg] = await Promise.all([
            // Count orders created today
            prisma.order.count({
                where: {
                    vendorId,
                    createdAt: { gte: today },
                },
            }),

            // Count pending orders
            prisma.order.count({
                where: {
                    vendorId,
                    status: { in: ["PENDING", "PAYMENT_PENDING"] },
                },
            }),

            // Count ready orders
            prisma.order.count({
                where: {
                    vendorId,
                    status: "READY",
                },
            }),

            // Sum earnings for the last 7 days
            prisma.order.aggregate({
                where: {
                    vendorId,
                    createdAt: { gte: weekStart },
                    status: { notIn: ["REJECTED", "PENDING", "PAYMENT_PENDING"] },
                },
                _sum: { vendorEarning: true },
            }),
        ]);

        return NextResponse.json(
            {
                stats: {
                    ordersToday,
                    pendingCount,
                    readyCount,
                    weekEarnings: weekAgg._sum.vendorEarning || 0,
                },
            },
            { headers: { "Cache-Control": "private, max-age=60" } }
        );
    } catch (error: any) {
        console.error("Vendor stats error:", error);
        return NextResponse.json({ error: "Internal server error" }, { status: 500 });
    }
}
