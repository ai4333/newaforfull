import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { resolveStoredFileUrl } from "@/lib/supabase-server";
import { AdminFilesClient } from "@/components/admin/AdminFilesClient";

export const dynamic = "force-dynamic";

export default async function AdminFilesPage() {
  const session = await auth();
  const role = (session?.user as { role?: string } | undefined)?.role;

  if (!session?.user) {
    redirect("/admin/login?next=/admin/files");
  }
  if (role !== "ADMIN") {
    redirect("/");
  }

  const rows = await prisma.orderFile.findMany({
    include: {
      order: {
        include: { student: { select: { name: true } } },
      },
    },
    orderBy: { createdAt: "desc" },
    take: 200,
  });

  const initialFiles = await Promise.all(
    rows.map(async (row) => ({
      id: row.id,
      fileName: row.fileName,
      fileSize: row.fileSize,
      fileUrl: await resolveStoredFileUrl(row.fileUrl),
      createdAt: row.createdAt.toISOString(),
      orderId: row.orderId,
      studentName: row.order.student?.name || null,
    }))
  );

  return <AdminFilesClient initialFiles={initialFiles} />;
}
