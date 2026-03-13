import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { format } from "date-fns";

export const dynamic = "force-dynamic";

export default async function AdminLogsPage() {
  const session = await auth();
  const role = (session?.user as { role?: string } | undefined)?.role;
  if (!session?.user) redirect("/admin/login?next=/admin/logs");
  if (role !== "ADMIN") redirect("/");

  const logs = await prisma.activityLog.findMany({
    include: { user: { select: { name: true, email: true } } },
    orderBy: { createdAt: "desc" },
    take: 200,
  });

  const now = Date.now();
  const twentyFourHoursAgo = new Date(now - 24 * 60 * 60 * 1000);
  const eventsToday = logs.filter((l) => l.createdAt >= twentyFourHoursAgo).length;
  const uniqueUsers = new Set(logs.map((l) => l.userId)).size;
  const errorEvents = logs.filter((l) => /(FAIL|ERROR|REJECT)/i.test(`${l.action} ${l.details || ""}`)).length;

  return (
    <div style={{ display: "grid", gap: 16 }}>
      <div>
        <h1 style={{ fontSize: 28, marginBottom: 4 }}>System Activity Logs</h1>
        <div style={{ color: "#6b7280", fontSize: 13 }}>Real-time audit events from database.</div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(180px,1fr))", gap: 12 }}>
        <div className="paper-sheet" style={{ padding: 12 }}><div className="label">Total Events</div><div className="fraunces">{logs.length}</div></div>
        <div className="paper-sheet" style={{ padding: 12 }}><div className="label">Events (24h)</div><div className="fraunces">{eventsToday}</div></div>
        <div className="paper-sheet" style={{ padding: 12 }}><div className="label">Unique Users</div><div className="fraunces">{uniqueUsers}</div></div>
        <div className="paper-sheet" style={{ padding: 12 }}><div className="label">Failure Events</div><div className="fraunces">{errorEvents}</div></div>
      </div>

      <section className="paper-sheet" style={{ padding: 0 }}>
        <div style={{ overflowX: "auto" }}>
          <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 12 }}>
            <thead>
              <tr style={{ textAlign: "left", borderBottom: "1px solid rgba(62,32,40,0.1)" }}>
                <th style={{ padding: 10 }} className="label">Time</th>
                <th style={{ padding: 10 }} className="label">User</th>
                <th style={{ padding: 10 }} className="label">Action</th>
                <th style={{ padding: 10 }} className="label">Details</th>
              </tr>
            </thead>
            <tbody>
              {logs.length === 0 ? (
                <tr><td colSpan={4} style={{ padding: 30, textAlign: "center", opacity: 0.6 }}>No logs yet.</td></tr>
              ) : logs.map((log) => (
                <tr key={log.id} style={{ borderBottom: "1px solid rgba(62,32,40,0.05)" }}>
                  <td style={{ padding: 10 }}>{format(new Date(log.createdAt), "MMM d, HH:mm:ss")}</td>
                  <td style={{ padding: 10 }}>{log.user.name || log.user.email || "Unknown"}</td>
                  <td style={{ padding: 10, fontWeight: 700 }}>{log.action}</td>
                  <td style={{ padding: 10 }}>{log.details || "-"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
