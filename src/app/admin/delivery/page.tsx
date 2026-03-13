import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { format } from "date-fns";
import { redirect } from "next/navigation";

export const dynamic = "force-dynamic";

export default async function AdminDeliveryPage() {
  const session = await auth();
  const role = (session?.user as { role?: string } | undefined)?.role;
  if (!session?.user) redirect("/admin/login?next=/admin/delivery");
  if (role !== "ADMIN") redirect("/");

  const orders = await prisma.order.findMany({
    where: {
      OR: [{ deliveryAddress: { not: null } }, { deliveryType: "DELIVERY" }],
    },
    include: {
      student: { select: { name: true } },
      vendor: { select: { shopName: true } },
    },
    orderBy: { createdAt: "desc" },
    take: 100,
  });

  const inTransit = orders.filter((o) => o.status === "READY").length;
  const completed = orders.filter((o) => o.status === "COMPLETED").length;

  return (
    <div style={{ display: "grid", gap: 16 }}>
      <div>
        <h1 style={{ fontSize: 28, marginBottom: 4 }}>Delivery Tracking</h1>
        <div style={{ color: "#6b7280", fontSize: 13 }}>Delivery-related orders and current fulfillment state.</div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(180px,1fr))", gap: 12 }}>
        <div className="paper-sheet" style={{ padding: 12 }}><div className="label">Delivery Orders</div><div className="fraunces">{orders.length}</div></div>
        <div className="paper-sheet" style={{ padding: 12 }}><div className="label">In Transit</div><div className="fraunces">{inTransit}</div></div>
        <div className="paper-sheet" style={{ padding: 12 }}><div className="label">Completed</div><div className="fraunces">{completed}</div></div>
      </div>

      <section className="paper-sheet" style={{ padding: 0 }}>
        <div style={{ overflowX: "auto" }}>
          <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 12 }}>
            <thead>
              <tr style={{ textAlign: "left", borderBottom: "1px solid rgba(62,32,40,0.1)" }}>
                <th style={{ padding: 10 }} className="label">Order</th>
                <th style={{ padding: 10 }} className="label">Student</th>
                <th style={{ padding: 10 }} className="label">Vendor</th>
                <th style={{ padding: 10 }} className="label">Address</th>
                <th style={{ padding: 10 }} className="label">Status</th>
                <th style={{ padding: 10 }} className="label">Created</th>
              </tr>
            </thead>
            <tbody>
              {orders.length === 0 ? (
                <tr><td colSpan={6} style={{ padding: 30, textAlign: "center", opacity: 0.6 }}>No delivery orders found.</td></tr>
              ) : orders.map((order) => (
                <tr key={order.id} style={{ borderBottom: "1px solid rgba(62,32,40,0.05)" }}>
                  <td style={{ padding: 10 }}>#{order.id.slice(0, 8)}</td>
                  <td style={{ padding: 10 }}>{order.student.name || "Student"}</td>
                  <td style={{ padding: 10 }}>{order.vendor.shopName}</td>
                  <td style={{ padding: 10 }}>{order.deliveryAddress || "-"}</td>
                  <td style={{ padding: 10 }}>{order.status}</td>
                  <td style={{ padding: 10 }}>{format(new Date(order.createdAt), "MMM d, HH:mm")}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
