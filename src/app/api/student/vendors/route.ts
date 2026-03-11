import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireActiveUser } from "@/lib/auth-helpers";

export async function GET() {
  const authResult = await requireActiveUser("STUDENT");
  if ("response" in authResult) {
    return authResult.response;
  }

  const vendors = await prisma.vendorProfile.findMany({
    where: { acceptingOrders: true },
    select: {
      id: true,
      shopName: true,
      pricePerPageBW: true,
      pricePerPageColor: true,
      pricingConfig: true,
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
