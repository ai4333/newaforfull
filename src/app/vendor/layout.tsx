import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { VendorShell } from "@/components/vendor/VendorShell";

export default async function VendorLayout({ children }: { children: React.ReactNode }) {
    const session = await auth();
    const role = (session?.user as { role?: string } | undefined)?.role;

    if (!session?.user) {
        redirect("/auth/login");
    }

    if (role === "STUDENT") {
        redirect("/student/dashboard");
    }

    if (role === "ADMIN") {
        redirect("/admin/dashboard");
    }

    if (role !== "VENDOR") {
        redirect("/auth/login");
    }

    const vendorProfile = await prisma.vendorProfile.findUnique({
        where: { userId: session.user.id },
        select: { shopName: true, approvalStatus: true },
    });

    if (!vendorProfile || vendorProfile.approvalStatus !== "APPROVED") {
        redirect("/auth/vendor-onboarding");
    }

    const shopName = vendorProfile?.shopName || "University Print Hub";

    return (
        <VendorShell session={session} shopName={shopName}>
            {children}
        </VendorShell>
    );
}
