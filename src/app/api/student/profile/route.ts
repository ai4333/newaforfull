import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { createRateLimiter, shouldBypassRateLimit } from "@/lib/ratelimit";
import { requireActiveUser } from "@/lib/auth-helpers";

const readLimiter = createRateLimiter(80, "1 m");
const writeLimiter = createRateLimiter(30, "1 m");

const patchSchema = z.object({
  name: z.string().min(2).max(120),
  phone: z.string().min(8).max(20),
  college: z.string().min(2).max(150),
  university: z.string().min(2).max(150),
  course: z.string().min(2).max(120),
  year: z.string().min(1).max(30),
  defaultDeliveryAddress: z.string().min(5).max(400),
});

function isComplete(profile: {
  name: string | null;
  phone: string | null;
  college: string | null;
  university: string | null;
  course: string | null;
  year: string | null;
  defaultDeliveryAddress: string | null;
}) {
  return Boolean(
    profile.name &&
      profile.phone &&
      profile.college &&
      profile.university &&
      profile.course &&
      profile.year &&
      profile.defaultDeliveryAddress
  );
}

export async function GET() {
  const authResult = await requireActiveUser("STUDENT");
  if ("response" in authResult) {
    return authResult.response;
  }

  if (readLimiter) {
    const { success } = await readLimiter.limit(`student-profile-read:${authResult.user.id}`);
    if (!success) {
      return NextResponse.json({ error: "Too Many Requests" }, { status: 429 });
    }
  } else if (!shouldBypassRateLimit()) {
    return NextResponse.json({ error: "Rate limiting unavailable" }, { status: 500 });
  }

  const profile = await prisma.studentProfile.upsert({
    where: { userId: authResult.user.id },
    update: {},
    create: {
      userId: authResult.user.id,
      name: authResult.user.name ?? undefined,
    },
  });

  return NextResponse.json({ profile, completed: isComplete(profile) });
}

export async function PATCH(req: Request) {
  const authResult = await requireActiveUser("STUDENT");
  if ("response" in authResult) {
    return authResult.response;
  }

  if (writeLimiter) {
    const { success } = await writeLimiter.limit(`student-profile-write:${authResult.user.id}`);
    if (!success) {
      return NextResponse.json({ error: "Too Many Requests" }, { status: 429 });
    }
  } else if (!shouldBypassRateLimit()) {
    return NextResponse.json({ error: "Rate limiting unavailable" }, { status: 500 });
  }

  const parsed = patchSchema.safeParse(await req.json());
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }

  const profile = await prisma.$transaction(async (tx) => {
    const updated = await tx.studentProfile.upsert({
      where: { userId: authResult.user.id },
      update: parsed.data,
      create: {
        userId: authResult.user.id,
        ...parsed.data,
      },
    });

    await tx.user.update({
      where: { id: authResult.user.id },
      data: {
        name: parsed.data.name,
        phone: parsed.data.phone,
      },
    });

    await tx.activityLog.create({
      data: {
        userId: authResult.user.id,
        action: "STUDENT_PROFILE_UPDATED",
        details: `Student profile updated (${parsed.data.college}, ${parsed.data.course})`,
      },
    });

    return updated;
  });

  return NextResponse.json({ profile, completed: isComplete(profile) });
}
