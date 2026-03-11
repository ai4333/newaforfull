import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import { AdminVendorApprovalAction } from "@/components/admin/AdminVendorApprovalAction";

export const dynamic = "force-dynamic";

export default async function AdminShopsPage() {
  const session = await auth();
  const role = (session?.user as { role?: string } | undefined)?.role;

  if (!session?.user) redirect("/admin/login?next=/admin/shops");
  if (role !== "ADMIN") redirect("/");

  const shops = await prisma.vendorProfile.findMany({
    select: {
      id: true,
      shopName: true,
      shopAddress: true,
      acceptingOrders: true,
      user: { select: { name: true, email: true } },
      _count: { select: { orders: true } },
    },
    orderBy: { createdAt: "desc" },
  });

  const pendingCount = shops.filter((s) => !s.acceptingOrders).length;

  return (
    <div style={{ display: "grid", gap: 16 }}>
      <div>
        <h1 style={{ fontSize: 28, marginBottom: 4 }}>Vendor Approvals</h1>
        <div style={{ color: "#6b7280", fontSize: 13 }}>Pending approvals: {pendingCount}</div>
      </div>

      <div style={{ background: "#fff", border: "1px solid #e5e7eb", borderRadius: 10, padding: 14, overflowX: "auto" }}>
        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead>
            <tr style={{ textAlign: "left", borderBottom: "1px solid #e5e7eb" }}>
              <th style={{ padding: 8, fontSize: 12 }}>Shop</th>
              <th style={{ padding: 8, fontSize: 12 }}>Owner</th>
              <th style={{ padding: 8, fontSize: 12 }}>Address</th>
              <th style={{ padding: 8, fontSize: 12 }}>Orders</th>
              <th style={{ padding: 8, fontSize: 12 }}>Status</th>
              <th style={{ padding: 8, fontSize: 12 }}>Action</th>
            </tr>
          </thead>
          <tbody>
            {shops.length === 0 ? (
              <tr>
                <td colSpan={6} style={{ padding: 14, color: "#6b7280", fontSize: 13 }}>
                  No vendors found.
                </td>
              </tr>
            ) : (
              shops.map((shop) => {
                const status = shop.acceptingOrders ? "APPROVED" : "PENDING_APPROVAL";
                return (
                  <tr key={shop.id} style={{ borderBottom: "1px solid #f3f4f6" }}>
                    <td style={{ padding: 8, fontSize: 13, fontWeight: 600 }}>{shop.shopName}</td>
                    <td style={{ padding: 8, fontSize: 13 }}>{shop.user.name || "-"} ({shop.user.email || "-"})</td>
                    <td style={{ padding: 8, fontSize: 13 }}>{shop.shopAddress || "-"}</td>
                    <td style={{ padding: 8, fontSize: 13 }}>{shop._count.orders}</td>
                    <td style={{ padding: 8, fontSize: 13 }}>{status}</td>
                    <td style={{ padding: 8, fontSize: 13 }}>
                      <AdminVendorApprovalAction vendorId={shop.id} initialStatus={status} />
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
