import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { Role } from "@prisma/client";
import { NextResponse } from "next/server";

/**
 * Reusable helper to enforce session and role requirements in API routes.
 */
export async function getAuthorizedUser(expectedRole?: Role) {
    const session = await auth();

    if (!session?.user?.id) {
        return { error: "Unauthorized: No session", status: 401 };
    }

    // Always fetch fresh user from DB to ensure roles haven't changed
    const user = await prisma.user.findUnique({
        where: { id: session.user.id },
    });

    if (!user) {
        return { error: "Unauthorized: User not found in database", status: 403 };
    }

    if (expectedRole && user.role !== expectedRole && user.role !== Role.ADMIN) {
        return { error: `Forbidden: Requires ${expectedRole} role`, status: 403 };
    }

    return { user, session };
}

/**
 * Common error response generator
 */
export function sendError(message: string, status: number = 400) {
    return NextResponse.json({ error: message }, { status });
}
