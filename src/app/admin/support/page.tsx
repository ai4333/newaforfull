import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { format } from "date-fns";
import { redirect } from "next/navigation";

export const dynamic = "force-dynamic";

export default async function AdminSupportPage() {
  const session = await auth();
  const role = (session?.user as { role?: string } | undefined)?.role;
  if (!session?.user) redirect("/admin/login?next=/admin/support");
  if (role !== "ADMIN") redirect("/");

  const disputes = await prisma.order.findMany({
    where: { status: "DISPUTED" },
    include: {
      student: { select: { name: true, email: true } },
      vendor: { select: { shopName: true } },
    },
    orderBy: { updatedAt: "desc" },
  });

  const ageHours = disputes.map((d) => (Date.now() - new Date(d.updatedAt).getTime()) / (1000 * 60 * 60));
  const avgResolutionAgeHours = ageHours.length ? ageHours.reduce((a, b) => a + b, 0) / ageHours.length : 0;
  const highPriority = ageHours.filter((h) => h > 24).length;

  return (
    <div style={{ display: "grid", gap: 16 }}>
      <div>
        <h1 style={{ fontSize: 28, marginBottom: 4 }}>Support & Disputes</h1>
        <div style={{ color: "#6b7280", fontSize: 13 }}>Real dispute cases requiring intervention.</div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(180px,1fr))", gap: 12 }}>
        <div className="paper-sheet" style={{ padding: 12 }}><div className="label">Open Disputes</div><div className="fraunces">{disputes.length}</div></div>
        <div className="paper-sheet" style={{ padding: 12 }}><div className="label">High Priority (&gt;24h)</div><div className="fraunces">{highPriority}</div></div>
        <div className="paper-sheet" style={{ padding: 12 }}><div className="label">Avg Open Age</div><div className="fraunces">{avgResolutionAgeHours.toFixed(1)} hrs</div></div>
      </div>

      <section className="paper-sheet" style={{ padding: 0 }}>
        <div style={{ overflowX: "auto" }}>
          <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 12 }}>
            <thead>
              <tr style={{ textAlign: "left", borderBottom: "1px solid rgba(62,32,40,0.1)" }}>
                <th style={{ padding: 10 }} className="label">Order</th>
                <th style={{ padding: 10 }} className="label">Student</th>
                <th style={{ padding: 10 }} className="label">Vendor</th>
                <th style={{ padding: 10 }} className="label">Updated</th>
                <th style={{ padding: 10 }} className="label">Status</th>
              </tr>
            </thead>
            <tbody>
              {disputes.length === 0 ? (
                <tr><td colSpan={5} style={{ padding: 30, textAlign: "center", opacity: 0.6 }}>No disputes right now.</td></tr>
              ) : disputes.map((d) => (
                <tr key={d.id} style={{ borderBottom: "1px solid rgba(62,32,40,0.05)" }}>
                  <td style={{ padding: 10 }}>#{d.id.slice(0, 8)}</td>
                  <td style={{ padding: 10 }}>{d.student.name || d.student.email}</td>
                  <td style={{ padding: 10 }}>{d.vendor.shopName}</td>
                  <td style={{ padding: 10 }}>{format(new Date(d.updatedAt), "MMM d, HH:mm")}</td>
                  <td style={{ padding: 10 }}>{d.status}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
