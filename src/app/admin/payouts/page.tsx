import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { AdminPayoutsClient } from "@/components/admin/AdminPayoutsClient";
export const dynamic = 'force-dynamic';


export default async function AdminPayoutsPage() {
  const session = await auth();
  const role = (session?.user as { role?: string } | undefined)?.role;

  if (!session?.user) {
    redirect("/admin/login?next=/admin/payouts");
  }

  if (role !== "ADMIN") {
    redirect("/");
  }

  return <AdminPayoutsClient />;
}
