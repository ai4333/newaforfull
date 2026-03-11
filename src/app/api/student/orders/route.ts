import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { resolveStoredFileUrl } from "@/lib/supabase-server";
import { requireActiveUser } from "@/lib/auth-helpers";

export async function GET() {
  const authResult = await requireActiveUser("STUDENT");
  if ("response" in authResult) {
    return authResult.response;
  }
  const userId = authResult.user.id;

  const orders = await prisma.order.findMany({
    where: { studentId: userId },
    include: {
      files: true,
      vendor: { select: { shopName: true } },
    },
    orderBy: { createdAt: "desc" },
    take: 10,
  });

  const resolvedOrders = await Promise.all(
    orders.map(async (order) => ({
      ...order,
      files: await Promise.all(
        order.files.map(async (file) => ({
          ...file,
          fileUrl: await resolveStoredFileUrl(file.fileUrl),
        }))
      ),
    }))
  );

  return NextResponse.json({ orders: resolvedOrders });
}
