import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { resolveStoredFileUrl } from "@/lib/supabase-server";

export async function GET() {
  const session = await auth();
  const userId = session?.user?.id;
  const role = (session?.user as { role?: string } | undefined)?.role;

  if (!userId || role !== "STUDENT") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

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
