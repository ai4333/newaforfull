import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireActiveUser } from "@/lib/auth-helpers";
import { resolveStoredFileUrl } from "@/lib/supabase-server";

export async function GET(
    req: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const authResult = await requireActiveUser("VENDOR");
        if ("response" in authResult) return authResult.response;

        const vendorId = authResult.user.id;
        const { id: orderId } = await params;

        // Verify ownership and get files
        const order = await prisma.order.findUnique({
            where: { id: orderId, vendorId },
            include: {
                files: true,
            },
        });

        if (!order) {
            return NextResponse.json({ error: "Order not found" }, { status: 404 });
        }

        // Resolve signed URLs on demand
        const resolvedFiles = await Promise.all(
            order.files.map(async (file) => ({
                id: file.id,
                fileName: file.fileName,
                fileUrl: await resolveStoredFileUrl(file.fileUrl),
            }))
        );

        return NextResponse.json({ files: resolvedFiles });
    } catch (error: any) {
        console.error("Fetch files error:", error);
        return NextResponse.json({ error: "Internal server error" }, { status: 500 });
    }
}
