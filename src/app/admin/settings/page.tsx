import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { storageBucket } from "@/lib/supabase-server";

export const dynamic = "force-dynamic";

export default async function AdminSettingsPage() {
  const session = await auth();
  const role = (session?.user as { role?: string } | undefined)?.role;
  if (!session?.user) redirect("/admin/login?next=/admin/settings");
  if (role !== "ADMIN") redirect("/");

  const [users, vendors, orders, files] = await Promise.all([
    prisma.user.count(),
    prisma.vendorProfile.count(),
    prisma.order.count(),
    prisma.orderFile.count(),
  ]);

  const hasRazorpay = Boolean(process.env.RAZORPAY_KEY_ID && process.env.RAZORPAY_KEY_SECRET);
  const hasSupabaseStorage = Boolean(process.env.SUPABASE_URL && process.env.SUPABASE_SERVICE_ROLE_KEY);
  const adminEmails = (process.env.ADMIN_EMAILS || "").split(",").map((e) => e.trim()).filter(Boolean);

  return (
    <div style={{ display: "grid", gap: 16 }}>
      <div>
        <h1 style={{ fontSize: 28, marginBottom: 4 }}>Platform Settings</h1>
        <div style={{ color: "#6b7280", fontSize: 13 }}>Live system configuration and readiness checks.</div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(180px,1fr))", gap: 12 }}>
        <div className="paper-sheet" style={{ padding: 12 }}><div className="label">Users</div><div className="fraunces">{users}</div></div>
        <div className="paper-sheet" style={{ padding: 12 }}><div className="label">Vendors</div><div className="fraunces">{vendors}</div></div>
        <div className="paper-sheet" style={{ padding: 12 }}><div className="label">Orders</div><div className="fraunces">{orders}</div></div>
        <div className="paper-sheet" style={{ padding: 12 }}><div className="label">Files</div><div className="fraunces">{files}</div></div>
      </div>

      <section className="paper-sheet" style={{ padding: 14 }}>
        <h3 className="fraunces text-ink" style={{ fontSize: "1.1rem", marginBottom: 10 }}>Environment Status</h3>
        <div style={{ display: "grid", gap: 8, fontSize: 13 }}>
          <div><strong>Admin allowlist count:</strong> {adminEmails.length}</div>
          <div><strong>Razorpay:</strong> {hasRazorpay ? "Configured" : "Missing keys"}</div>
          <div><strong>Supabase storage:</strong> {hasSupabaseStorage ? `Configured (bucket: ${storageBucket})` : "Missing storage credentials"}</div>
          <div><strong>Commission model:</strong> 11% student fee + 11% vendor fee</div>
        </div>
      </section>
    </div>
  );
}
