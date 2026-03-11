import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { Role, User } from "@prisma/client";
import { NextResponse } from "next/server";

function getAdminEmails() {
    return (process.env.ADMIN_EMAILS || "")
        .split(",")
        .map((email) => email.trim().toLowerCase())
        .filter(Boolean);
}

function isAllowlistedAdmin(email?: string | null) {
    if (!email) return false;
    return getAdminEmails().includes(email.toLowerCase());
}

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

    if (user.isSuspended) {
        return { error: "Account suspended", status: 403 };
    }

    if (expectedRole && user.role !== expectedRole && user.role !== Role.ADMIN) {
        return { error: `Forbidden: Requires ${expectedRole} role`, status: 403 };
    }

    return { user, session };
}

export async function requireActiveUser(expectedRole?: Role): Promise<{ user: User } | { response: NextResponse }> {
    const result = await getAuthorizedUser(expectedRole);
    if ("error" in result) {
        return { response: sendError(result.error || "Unauthorized", result.status) };
    }

    return { user: result.user };
}

export async function requireAdminApiUser(): Promise<{ user: User } | { response: NextResponse }> {
    const session = await auth();
    const sessionUserId = session?.user?.id;
    const sessionRole = (session?.user as { role?: string } | undefined)?.role;

    if (!sessionUserId || sessionRole !== "ADMIN") {
        return { response: sendError("Forbidden", 403) };
    }

    const user = await prisma.user.findUnique({ where: { id: sessionUserId } });

    if (!user || user.isSuspended || user.role !== "ADMIN" || !isAllowlistedAdmin(user.email)) {
        return { response: sendError("Forbidden", 403) };
    }

    return { user };
}

/**
 * Common error response generator
 */
export function sendError(message: string, status: number = 400) {
    return NextResponse.json({ error: message }, { status });
}
