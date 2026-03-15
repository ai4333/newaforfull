import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireActiveUser } from "@/lib/auth-helpers";

export async function GET() {
    try {
        const authResult = await requireActiveUser();
        if ("response" in authResult) return authResult.response;

        const studentId = authResult.user.id;

        // Run aggregations in parallel
        const [activeCount, totalOrders, totalSpent] = await Promise.all([
            // Count active orders
            prisma.order.count({
                where: {
                    studentId,
                    status: { in: ["PENDING", "PAYMENT_PENDING", "PAID", "ACCEPTED", "READY"] },
                },
            }),

            // Count total orders
            prisma.order.count({
                where: { studentId },
            }),

            // Sum spent
            prisma.order.aggregate({
                where: {
                    studentId,
                    status: { notIn: ["REJECTED", "PENDING", "PAYMENT_PENDING"] },
                },
                _sum: { totalPaid: true },
            }),
        ]);

        return NextResponse.json(
            {
                stats: {
                    activeCount,
                    totalOrders,
                    totalSpent: totalSpent._sum.totalPaid || 0,
                },
            },
            { headers: { "Cache-Control": "private, max-age=60" } }
        );
    } catch (error: any) {
        console.error("Student stats error:", error);
        return NextResponse.json({ error: "Internal server error" }, { status: 500 });
    }
}
