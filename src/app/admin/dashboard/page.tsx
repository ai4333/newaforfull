import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

const RECEIVED_STATUSES = ["PAID", "ACCEPTED", "PRINTING", "READY", "COMPLETED"] as const;

function card(label: string, value: string | number) {
  return (
    <div style={{ background: "#fff", border: "1px solid #e5e7eb", borderRadius: 10, padding: 14 }}>
      <div style={{ fontSize: 12, color: "#6b7280", marginBottom: 8 }}>{label}</div>
      <div style={{ fontSize: 24, fontWeight: 700, color: "#111827" }}>{value}</div>
    </div>
  );
}

export default async function AdminDashboardPage() {
  const session = await auth();
  const role = (session?.user as { role?: string } | undefined)?.role;

  if (!session?.user) redirect("/admin/login?next=/admin/dashboard");
  if (role !== "ADMIN") redirect("/");

  const [
    orders,
    users,
    vendors,
    activeVendors,
    revenueAgg,
    roleGroups,
    pendingVendors,
    recentOrders,
  ] = await Promise.all([
    prisma.order.count(),
    prisma.user.count(),
    prisma.vendorProfile.count(),
    prisma.vendorProfile.count({ where: { acceptingOrders: true } }),
    prisma.order.aggregate({
      where: { status: { in: [...RECEIVED_STATUSES] } },
      _sum: { totalPaid: true },
    }),
    prisma.user.groupBy({ by: ["role"], _count: { _all: true } }),
    prisma.vendorProfile.findMany({
      where: { acceptingOrders: false },
      select: { id: true, shopName: true, user: { select: { email: true } } },
      orderBy: { createdAt: "desc" },
      take: 8,
    }),
    prisma.order.findMany({
      select: {
        id: true,
        status: true,
        totalPaid: true,
        student: { select: { email: true } },
        vendor: { select: { shopName: true } },
      },
      orderBy: { createdAt: "desc" },
      take: 10,
    }),
  ]);

  const roleMap = new Map(roleGroups.map((r) => [r.role, r._count._all]));
  const revenue = Number(revenueAgg._sum.totalPaid ?? 0).toFixed(2);

  return (
    <div style={{ display: "grid", gap: 16 }}>
      <div>
        <h1 style={{ fontSize: 28, marginBottom: 4 }}>Admin Dashboard</h1>
        <div style={{ color: "#6b7280", fontSize: 13 }}>Signed in as {session.user.email}</div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(4,minmax(0,1fr))", gap: 12 }}>
        {card("Total Revenue", `₹${revenue}`)}
        {card("Orders", orders)}
        {card("Users", users)}
        {card("Vendors", vendors)}
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(4,minmax(0,1fr))", gap: 12 }}>
        {card("Active Vendors", activeVendors)}
        {card("Students", roleMap.get("STUDENT") ?? 0)}
        {card("Vendor Accounts", roleMap.get("VENDOR") ?? 0)}
        {card("Admins", roleMap.get("ADMIN") ?? 0)}
      </div>

      <div style={{ background: "#fff", border: "1px solid #e5e7eb", borderRadius: 10, padding: 14 }}>
        <h2 style={{ fontSize: 18, marginBottom: 10 }}>Pending Vendor Approvals</h2>
        {pendingVendors.length === 0 ? (
          <div style={{ color: "#6b7280", fontSize: 13 }}>No pending vendor approvals.</div>
        ) : (
          <div style={{ display: "grid", gap: 8 }}>
            {pendingVendors.map((v) => (
              <div key={v.id} style={{ fontSize: 14 }}>
                {v.shopName} - {v.user.email}
              </div>
            ))}
          </div>
        )}
      </div>

      <div style={{ background: "#fff", border: "1px solid #e5e7eb", borderRadius: 10, padding: 14 }}>
        <h2 style={{ fontSize: 18, marginBottom: 10 }}>Recent Orders</h2>
        {recentOrders.length === 0 ? (
          <div style={{ color: "#6b7280", fontSize: 13 }}>No orders yet.</div>
        ) : (
          <div style={{ overflowX: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "collapse" }}>
              <thead>
                <tr style={{ textAlign: "left", borderBottom: "1px solid #e5e7eb" }}>
                  <th style={{ padding: "8px 6px", fontSize: 12 }}>Order</th>
                  <th style={{ padding: "8px 6px", fontSize: 12 }}>Status</th>
                  <th style={{ padding: "8px 6px", fontSize: 12 }}>Student</th>
                  <th style={{ padding: "8px 6px", fontSize: 12 }}>Vendor</th>
                  <th style={{ padding: "8px 6px", fontSize: 12 }}>Amount</th>
                </tr>
              </thead>
              <tbody>
                {recentOrders.map((o) => (
                  <tr key={o.id} style={{ borderBottom: "1px solid #f3f4f6" }}>
                    <td style={{ padding: "8px 6px", fontSize: 12 }}>{o.id}</td>
                    <td style={{ padding: "8px 6px", fontSize: 12 }}>{o.status}</td>
                    <td style={{ padding: "8px 6px", fontSize: 12 }}>{o.student.email}</td>
                    <td style={{ padding: "8px 6px", fontSize: 12 }}>{o.vendor.shopName}</td>
                    <td style={{ padding: "8px 6px", fontSize: 12 }}>
                      ₹{RECEIVED_STATUSES.includes(o.status as (typeof RECEIVED_STATUSES)[number]) ? Number(o.totalPaid ?? 0).toFixed(2) : "0.00"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
