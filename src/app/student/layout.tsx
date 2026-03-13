import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { StudentShell } from "@/components/student/StudentShell";

export default async function StudentLayout({ children }: { children: React.ReactNode }) {
    const session = await auth();
    const role = (session?.user as { role?: string } | undefined)?.role;

    if (!session?.user) {
        redirect("/auth/login");
    }

    if (role === "VENDOR") {
        redirect("/vendor/dashboard");
    }

    if (role === "ADMIN") {
        redirect("/admin/dashboard");
    }

    if (role !== "STUDENT") {
        redirect("/auth/login");
    }

    return <StudentShell session={session}>{children}</StudentShell>;
}
