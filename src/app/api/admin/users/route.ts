import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { createRateLimiter, shouldBypassRateLimit } from "@/lib/ratelimit";
import { requireAdminApiUser } from "@/lib/auth-helpers";

const readLimiter = createRateLimiter(60, "1 m");

export async function GET() {
  const authResult = await requireAdminApiUser();
  if ("response" in authResult) {
    return authResult.response;
  }

  if (readLimiter) {
    const { success } = await readLimiter.limit(`admin-users-read:${authResult.user.id}`);
    if (!success) {
      return NextResponse.json({ error: "Too Many Requests" }, { status: 429 });
    }
  } else if (!shouldBypassRateLimit()) {
    return NextResponse.json({ error: "Rate limiting unavailable" }, { status: 500 });
  }

  const users = await prisma.user.findMany({
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      isSuspended: true,
      createdAt: true,
    },
    orderBy: { createdAt: "desc" },
    take: 200,
  });

  return NextResponse.json({ users });
}
