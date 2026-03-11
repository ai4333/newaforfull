"use client";

import { useEffect, useMemo, useState } from "react";

type AnalyticsResponse = {
  ordersPerDay: Array<{ day: string; orders: number }>;
  revenuePerDay: Array<{ day: string; revenue: number }>;
  activeVendors: number;
  topVendors: Array<{ id: string; shopName: string; orders: number }>;
  topColleges: Array<{ college: string | null; students: number }>;
};

type AdminUser = { id: string; role: string };
type AdminOrder = { id: string; totalPaid: number };
type AdminVendor = { id: string; shopName: string };

export function AdminDashboardClient() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [analytics, setAnalytics] = useState<AnalyticsResponse | null>(null);
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [orders, setOrders] = useState<AdminOrder[]>([]);
  const [vendors, setVendors] = useState<AdminVendor[]>([]);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      setError("");

      try {
        const [analyticsRes, usersRes, ordersRes, vendorsRes] = await Promise.allSettled([
          fetch("/api/admin/analytics", { cache: "no-store" }),
          fetch("/api/admin/users", { cache: "no-store" }),
          fetch("/api/admin/orders", { cache: "no-store" }),
          fetch("/api/admin/vendors", { cache: "no-store" }),
        ]);

        let failedEndpoints = 0;

        if (analyticsRes.status === "fulfilled" && analyticsRes.value.ok) {
          const data = (await analyticsRes.value.json()) as AnalyticsResponse;
          setAnalytics(data);
        } else {
          failedEndpoints += 1;
        }

        if (usersRes.status === "fulfilled" && usersRes.value.ok) {
          const data = await usersRes.value.json();
          setUsers((data?.users || []) as AdminUser[]);
        } else {
          failedEndpoints += 1;
        }

        if (ordersRes.status === "fulfilled" && ordersRes.value.ok) {
          const data = await ordersRes.value.json();
          setOrders((data?.orders || []) as AdminOrder[]);
        } else {
          failedEndpoints += 1;
        }

        if (vendorsRes.status === "fulfilled" && vendorsRes.value.ok) {
          const data = await vendorsRes.value.json();
          setVendors((data?.vendors || []) as AdminVendor[]);
        } else {
          failedEndpoints += 1;
        }

        if (failedEndpoints > 0) {
          setError(`Warning: ${failedEndpoints} data endpoint(s) failed (likely 403 or connection issue). Dashboard showing partial data.`);
        }
      } catch {
        setError("Failed to load admin dashboard data.");
      } finally {
        setLoading(false);
      }
    };

    load();
  }, []);

  const totalRevenue = useMemo(() => orders.reduce((sum, o) => sum + (o.totalPaid || 0), 0), [orders]);
  const studentCount = useMemo(() => users.filter((u) => u.role === "STUDENT").length, [users]);
  const vendorCount = useMemo(() => users.filter((u) => u.role === "VENDOR").length, [users]);
  const adminCount = useMemo(() => users.filter((u) => u.role === "ADMIN").length, [users]);

  if (loading) {
    return <div className="paper-sheet">Loading admin dashboard...</div>;
  }

  return (
    <div className="reveal-up active">
      <h1 className="fraunces text-ink" style={{ fontSize: "2rem", marginBottom: "12px" }}>Platform Oversight</h1>
      {error ? <div className="paper-sheet" style={{ color: "var(--wax-red)", marginBottom: "12px" }}>{error}</div> : null}

      <div className="admin-grid-4" style={{ marginBottom: "16px" }}>
        <div className="paper-sheet" style={{ padding: "16px" }}><div className="label">Total Revenue</div><div className="fraunces">₹{totalRevenue.toFixed(2)}</div></div>
        <div className="paper-sheet" style={{ padding: "16px" }}><div className="label">Orders</div><div className="fraunces">{orders.length}</div></div>
        <div className="paper-sheet" style={{ padding: "16px" }}><div className="label">Vendors</div><div className="fraunces">{vendors.length}</div></div>
        <div className="paper-sheet" style={{ padding: "16px" }}><div className="label">Active Vendors</div><div className="fraunces">{analytics?.activeVendors ?? 0}</div></div>
      </div>

      <div className="admin-grid-3" style={{ marginBottom: "16px" }}>
        <div className="paper-sheet" style={{ padding: "16px" }}><div className="label">Students</div><div className="fraunces">{studentCount}</div></div>
        <div className="paper-sheet" style={{ padding: "16px" }}><div className="label">Vendor Accounts</div><div className="fraunces">{vendorCount}</div></div>
        <div className="paper-sheet" style={{ padding: "16px" }}><div className="label">Admin Accounts</div><div className="fraunces">{adminCount}</div></div>
      </div>

      <section className="paper-sheet" style={{ padding: "16px" }}>
        <h3 className="fraunces text-ink" style={{ marginBottom: "8px" }}>Top Vendors</h3>
        {analytics?.topVendors?.length ? (
          <div style={{ display: "grid", gap: "8px" }}>
            {analytics.topVendors.slice(0, 5).map((vendor) => (
              <div key={vendor.id} style={{ fontSize: "12px" }}>
                {vendor.shopName} - {vendor.orders} orders
              </div>
            ))}
          </div>
        ) : (
          <div className="lora italic" style={{ opacity: 0.6, fontSize: "12px" }}>No vendor data yet.</div>
        )}
      </section>

      <section className="paper-sheet" style={{ padding: "16px", marginTop: "12px" }}>
        <h3 className="fraunces text-ink" style={{ marginBottom: "8px" }}>Top Colleges</h3>
        {analytics?.topColleges?.length ? (
          <div style={{ display: "grid", gap: "8px" }}>
            {analytics.topColleges.slice(0, 5).map((college) => (
              <div key={college.college || "unknown"} style={{ fontSize: "12px" }}>
                {college.college || "Unknown"} - {college.students} students
              </div>
            ))}
          </div>
        ) : (
          <div className="lora italic" style={{ opacity: 0.6, fontSize: "12px" }}>No college data yet.</div>
        )}
      </section>
    </div>
  );
}
