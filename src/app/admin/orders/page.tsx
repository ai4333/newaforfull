import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { AdminOrdersClient } from "@/components/admin/AdminOrdersClient";
export const dynamic = 'force-dynamic';


export default async function AdminOrdersPage() {
  const session = await auth();
  const role = (session?.user as { role?: string } | undefined)?.role;

  if (!session?.user) {
    redirect("/admin/login?next=/admin/orders");
  }

  if (role !== "ADMIN") {
    redirect("/");
  }

  return <AdminOrdersClient />;
}
