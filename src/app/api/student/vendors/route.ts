import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const session = await auth();
  const userId = session?.user?.id;
  const role = (session?.user as { role?: string } | undefined)?.role;

  if (!userId || role !== "STUDENT") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const vendors = await prisma.vendorProfile.findMany({
    select: {
      id: true,
      shopName: true,
      user: {
        select: {
          name: true,
        },
      },
    },
    orderBy: {
      shopName: "asc",
    },
    take: 50,
  });

  return NextResponse.json({ vendors });
}
