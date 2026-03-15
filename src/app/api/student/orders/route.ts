import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireActiveUser } from "@/lib/auth-helpers";

export async function GET() {
  const authResult = await requireActiveUser("STUDENT");
  if ("response" in authResult) {
    return authResult.response;
  }
  const userId = authResult.user.id;

  const orders = await prisma.order.findMany({
    where: { studentId: userId },
    select: {
      id: true,
      status: true,
      createdAt: true,
      files: { select: { fileName: true } },
      vendor: { select: { shopName: true } },
    },
    orderBy: { createdAt: "desc" },
    take: 30,
  });

  return NextResponse.json(
    { orders },
    { headers: { "Cache-Control": "private, max-age=15" } }
  );
}
