import { NextResponse } from "next/server";
import { z } from "zod";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { Role } from "@prisma/client";
import { getDefaultVendorPricingConfig } from "@/lib/vendor-defaults";

function getAdminEmails() {
  const raw = process.env.ADMIN_EMAILS || "";
  return raw
    .split(",")
    .map((email) => email.trim().toLowerCase())
    .filter(Boolean);
}

function isAdminAllowlisted(email?: string | null) {
  if (!email) return false;
  return getAdminEmails().includes(email.toLowerCase());
}

const requestSchema = z.object({
  role: z.enum(["STUDENT", "VENDOR", "ADMIN"]),
  shopName: z.string().min(2).optional(),
});

export async function POST(req: Request) {
  const session = await auth();
  const userId = session?.user?.id;
  const currentRole = (session?.user as { role?: string } | undefined)?.role;

  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await req.json();
  const parsed = requestSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }

  if (parsed.data.role === "ADMIN" && currentRole !== "ADMIN") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const nextRole = (isAdminAllowlisted(user.email) ? "ADMIN" : parsed.data.role) as Role;
  const shopName = parsed.data.shopName ?? "Campus Print Vendor";

  await prisma.$transaction(async (tx) => {
    await tx.user.update({
      where: { id: userId },
      data: { role: nextRole },
    });

    if (nextRole === "VENDOR") {
      const existing = await tx.vendorProfile.findUnique({ where: { userId }, select: { id: true } });
      if (!existing) {
        await tx.vendorProfile.create({
          data: {
            userId,
            shopName,
            approvalStatus: "PENDING_APPROVAL",
            acceptingOrders: false,
            pricePerPageBW: 2,
            pricePerPageColor: 8,
            pricingConfig: getDefaultVendorPricingConfig(),
          },
          select: { id: true },
        });
      }
    }

    if (nextRole === "STUDENT") {
      await tx.studentProfile.upsert({
        where: { userId },
        update: {
          name: user.name ?? undefined,
        },
        create: {
          userId,
          name: user.name ?? undefined,
        },
      });
    }

    await tx.activityLog.create({
      data: {
        userId,
        action: "ROLE_UPDATED",
        details: `Role set to ${nextRole}`,
      },
    });
  });

  return NextResponse.json({ status: "ok", role: nextRole });
}
