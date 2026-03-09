import { NextResponse } from "next/server";
import { z } from "zod";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { createRateLimiter, shouldBypassRateLimit } from "@/lib/ratelimit";

const querySchema = z.object({
  orderId: z.string().uuid(),
});

const createSchema = z.object({
  orderId: z.string().uuid(),
  note: z.string().min(3).max(500),
});

const readLimiter = createRateLimiter(80, "1 m");
const writeLimiter = createRateLimiter(40, "1 m");

async function ensureAdmin() {
  const session = await auth();
  const userId = session?.user?.id;
  const role = (session?.user as { role?: string } | undefined)?.role;
  if (!userId || role !== "ADMIN") return null;
  return userId;
}

export async function GET(req: Request) {
  const adminId = await ensureAdmin();
  if (!adminId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  if (readLimiter) {
    const { success } = await readLimiter.limit(`admin-order-notes-read:${adminId}`);
    if (!success) return NextResponse.json({ error: "Too Many Requests" }, { status: 429 });
  } else if (!shouldBypassRateLimit()) {
    return NextResponse.json({ error: "Rate limiting unavailable" }, { status: 500 });
  }

  const url = new URL(req.url);
  const parsed = querySchema.safeParse({ orderId: url.searchParams.get("orderId") });
  if (!parsed.success) return NextResponse.json({ error: "Invalid request" }, { status: 400 });

  const key = `ORDER_NOTE:${parsed.data.orderId}:`;
  const notes = await prisma.activityLog.findMany({
    where: {
      action: "ADMIN_ORDER_NOTE",
      details: { contains: key },
    },
    include: { user: { select: { name: true, email: true } } },
    orderBy: { createdAt: "desc" },
    take: 50,
  });

  return NextResponse.json({ notes });
}

export async function POST(req: Request) {
  const adminId = await ensureAdmin();
  if (!adminId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  if (writeLimiter) {
    const { success } = await writeLimiter.limit(`admin-order-notes-write:${adminId}`);
    if (!success) return NextResponse.json({ error: "Too Many Requests" }, { status: 429 });
  } else if (!shouldBypassRateLimit()) {
    return NextResponse.json({ error: "Rate limiting unavailable" }, { status: 500 });
  }

  const body = await req.json();
  const parsed = createSchema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: "Invalid request" }, { status: 400 });

  const exists = await prisma.order.findUnique({ where: { id: parsed.data.orderId }, select: { id: true } });
  if (!exists) return NextResponse.json({ error: "Order not found" }, { status: 404 });

  const payload = `ORDER_NOTE:${parsed.data.orderId}:${parsed.data.note}`;
  const note = await prisma.activityLog.create({
    data: {
      userId: adminId,
      action: "ADMIN_ORDER_NOTE",
      details: payload,
    },
    include: { user: { select: { name: true, email: true } } },
  });

  return NextResponse.json({ note }, { status: 201 });
}
