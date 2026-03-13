import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";

export const dynamic = "force-dynamic";

export default async function AnalyticsPage() {
  const session = await auth();
  const role = (session?.user as { role?: string } | undefined)?.role;
  if (!session?.user || role !== "VENDOR") {
    redirect("/auth/login");
  }

  const vendor = await prisma.vendorProfile.findUnique({
    where: { userId: session.user.id },
    select: { id: true, shopName: true, approvalStatus: true },
  });

  if (!vendor || vendor.approvalStatus !== "APPROVED") {
    redirect("/auth/vendor-onboarding");
  }

  const [orders, paidOrders] = await Promise.all([
    prisma.order.findMany({
      where: { vendorId: vendor.id },
      select: {
        id: true,
        status: true,
        createdAt: true,
        pages: true,
        copies: true,
        printType: true,
        totalPaid: true,
        vendorEarning: true,
      },
      orderBy: { createdAt: "desc" },
    }),
    prisma.order.findMany({
      where: { vendorId: vendor.id, status: { in: ["PAID", "ACCEPTED", "PRINTING", "READY", "COMPLETED"] } },
      select: { id: true, totalPaid: true, vendorEarning: true, pages: true, copies: true, createdAt: true },
    }),
  ]);

  const totalOrders = orders.length;
  const completedOrders = orders.filter((o) => o.status === "COMPLETED").length;
  const activeOrders = orders.filter((o) => ["PAID", "ACCEPTED", "PRINTING", "READY"].includes(o.status)).length;
  const totalRevenue = paidOrders.reduce((sum, o) => sum + (o.totalPaid ?? 0), 0);
  const vendorEarnings = paidOrders.reduce((sum, o) => sum + (o.vendorEarning ?? 0), 0);
  const printVolume = paidOrders.reduce((sum, o) => sum + ((o.pages ?? 0) * (o.copies ?? 1)), 0);
  const colorOrders = orders.filter((o) => (o.printType || "BW").toUpperCase() === "COLOR").length;
  const bwOrders = totalOrders - colorOrders;

  const byDate = new Map<string, { orders: number; revenue: number }>();
  for (const order of paidOrders) {
    const key = order.createdAt.toISOString().slice(0, 10);
    const prev = byDate.get(key) || { orders: 0, revenue: 0 };
    byDate.set(key, { orders: prev.orders + 1, revenue: prev.revenue + (order.totalPaid ?? 0) });
  }

  const trendRows = Array.from(byDate.entries())
    .sort(([a], [b]) => (a < b ? -1 : 1))
    .slice(-14);

  return (
    <div style={{ display: "grid", gap: "16px" }}>
      <h2 className="fraunces text-ink" style={{ fontSize: "1.6rem", fontWeight: 700 }}>Business Analytics</h2>

      <div className="admin-grid-4" style={{ gridTemplateColumns: "repeat(auto-fit,minmax(180px,1fr))", gap: "12px" }}>
        <div className="paper-sheet" style={{ padding: "14px" }}><div className="label">Total Orders</div><div className="fraunces">{totalOrders}</div></div>
        <div className="paper-sheet" style={{ padding: "14px" }}><div className="label">Active Orders</div><div className="fraunces">{activeOrders}</div></div>
        <div className="paper-sheet" style={{ padding: "14px" }}><div className="label">Completed Orders</div><div className="fraunces">{completedOrders}</div></div>
        <div className="paper-sheet" style={{ padding: "14px" }}><div className="label">Print Volume</div><div className="fraunces">{printVolume} pages</div></div>
      </div>

      <div className="admin-grid-3" style={{ gridTemplateColumns: "repeat(auto-fit,minmax(220px,1fr))", gap: "12px" }}>
        <div className="paper-sheet" style={{ padding: "14px" }}><div className="label">Gross Revenue</div><div className="fraunces">₹{totalRevenue.toFixed(2)}</div></div>
        <div className="paper-sheet" style={{ padding: "14px" }}><div className="label">Your Earnings</div><div className="fraunces">₹{vendorEarnings.toFixed(2)}</div></div>
        <div className="paper-sheet" style={{ padding: "14px" }}><div className="label">BW vs Color</div><div className="fraunces">{bwOrders} / {colorOrders}</div></div>
      </div>

      <section className="paper-sheet" style={{ padding: "14px" }}>
        <h3 className="fraunces text-ink" style={{ fontSize: "1.1rem", marginBottom: "10px" }}>Last 14 Days</h3>
        {trendRows.length === 0 ? (
          <div style={{ fontSize: "12px", opacity: 0.7 }}>No paid order activity yet.</div>
        ) : (
          <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "12px" }}>
            <thead>
              <tr style={{ textAlign: "left", borderBottom: "1px solid rgba(62,32,40,0.1)" }}>
                <th style={{ padding: "8px" }}>Date</th>
                <th style={{ padding: "8px" }}>Orders</th>
                <th style={{ padding: "8px" }}>Revenue</th>
              </tr>
            </thead>
            <tbody>
              {trendRows.map(([date, value]) => (
                <tr key={date} style={{ borderBottom: "1px solid rgba(62,32,40,0.05)" }}>
                  <td style={{ padding: "8px" }}>{date}</td>
                  <td style={{ padding: "8px" }}>{value.orders}</td>
                  <td style={{ padding: "8px" }}>₹{value.revenue.toFixed(2)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </section>
    </div>
  );
}
