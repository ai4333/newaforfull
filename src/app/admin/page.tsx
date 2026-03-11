import { redirect } from "next/navigation";
import { auth } from "@/auth";

export default async function AdminIndexPage() {
  const session = await auth();
  const role = (session?.user as { role?: string } | undefined)?.role;

  if (!session?.user) {
    redirect("/admin/login?next=/admin");
  }

  if (role !== "ADMIN") {
    redirect("/");
  }

  redirect("/admin/dashboard");
}
