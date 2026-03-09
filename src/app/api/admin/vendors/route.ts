import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { createRateLimiter, shouldBypassRateLimit } from "@/lib/ratelimit";

const readLimiter = createRateLimiter(60, "1 m");

export async function GET() {
  const session = await auth();
  const userId = session?.user?.id;
  const role = (session?.user as { role?: string } | undefined)?.role;

  if (!userId || role !== "ADMIN") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  if (readLimiter) {
    const { success } = await readLimiter.limit(`admin-vendors-read:${userId}`);
    if (!success) {
      return NextResponse.json({ error: "Too Many Requests" }, { status: 429 });
    }
  } else if (!shouldBypassRateLimit()) {
    return NextResponse.json({ error: "Rate limiting unavailable" }, { status: 500 });
  }

  const vendors = await prisma.vendorProfile.findMany({
    select: {
      id: true,
      shopName: true,
      user: {
        select: {
          name: true,
          email: true,
        },
      },
    },
    orderBy: { shopName: "asc" },
    take: 200,
  });

  return NextResponse.json({ vendors });
}
