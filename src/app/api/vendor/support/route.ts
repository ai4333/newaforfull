import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { requireActiveUser } from "@/lib/auth-helpers";

const requestSchema = z.object({
  subject: z.string().min(3).max(120),
  message: z.string().min(10).max(2000),
});

export async function POST(req: Request) {
  const authResult = await requireActiveUser("VENDOR");
  if ("response" in authResult) return authResult.response;

  const parsed = requestSchema.safeParse(await req.json());
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid request", details: parsed.error.flatten().fieldErrors }, { status: 400 });
  }

  const log = await prisma.activityLog.create({
    data: {
      userId: authResult.user.id,
      action: "VENDOR_SUPPORT_TICKET_CREATED",
      details: `Subject: ${parsed.data.subject}\nMessage: ${parsed.data.message}`,
    },
    select: { id: true },
  });

  return NextResponse.json({ ticketId: log.id });
}
