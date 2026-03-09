import React from "react";
import Link from "next/link";
import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { ShoppingBag, History } from "lucide-react";

export const dynamic = 'force-dynamic';

export default async function AdminDashboard() {
  const session = await auth();
  const role = (session?.user as { role?: string } | undefined)?.role;

  if (!session?.user || role !== "ADMIN") {
    redirect("/admin/login?next=/admin/dashboard");
  }

  const [orderAgg, payoutAgg, vendors, userCount, vendorCount, fileCount, logCount] = await Promise.all([
    prisma.order.aggregate({
      _count: { _all: true },
      _sum: { platformRevenue: true, totalPaid: true },
    }),
    prisma.payout.aggregate({
      _count: { _all: true },
      _sum: { amount: true },
      where: { status: "PENDING" },
    }),
    prisma.vendorProfile.findMany({
      select: {
        id: true,
        shopName: true,
        _count: {
          select: { orders: true }
        }
      },
      take: 5,
      orderBy: { orders: { _count: 'desc' } }
    }),
    prisma.user.count(),
    prisma.vendorProfile.count(),
    prisma.orderFile.count(),
    prisma.activityLog.count(),
  ]);

  const totalRevenue = orderAgg._sum.totalPaid ?? 0;
  const platformProfit = orderAgg._sum.platformRevenue ?? 0;
  const totalOrders = orderAgg._count._all;
  const pendingPayouts = payoutAgg._count._all;
  const avgOrderValue = totalOrders > 0 ? totalRevenue / totalOrders : 0;

  return (
    <div className="reveal-up active">
      <header style={{ marginBottom: '2.5rem' }}>
        <h1 className="fraunces text-ink" style={{ fontSize: '2rem', fontWeight: 900, marginBottom: '0.5rem' }}>
          Platform Oversight
        </h1>
        <p className="lora italic opacity-60">"Global analytics and real-time shop performance monitoring."</p>
      </header>

      {/* ── KEY METRICS ── */}
      <div className="admin-grid-4" style={{ marginBottom: "3rem" }}>
        <section className="paper-sheet" style={{ padding: '1.5rem' }}>
          <div className="label" style={{ fontSize: '9px', marginBottom: '8px' }}>Global Revenue</div>
          <div className="fraunces text-ink" style={{ fontSize: '1.5rem', fontWeight: 800 }}>₹{totalRevenue.toLocaleString()}</div>
          <div style={{ fontSize: '10px', marginTop: '4px', color: '#10b981', fontWeight: 700 }}>↑ 12% vs last month</div>
        </section>
        <section className="paper-sheet" style={{ padding: '1.5rem' }}>
          <div className="label" style={{ fontSize: '9px', marginBottom: '8px' }}>Order Volume</div>
          <div className="fraunces text-ink" style={{ fontSize: '1.5rem', fontWeight: 800 }}>{totalOrders.toLocaleString()}</div>
          <div style={{ fontSize: '10px', marginTop: '4px', color: '#10b981', fontWeight: 700 }}>↑ 8% active rate</div>
        </section>
        <section className="paper-sheet" style={{ padding: '1.5rem' }}>
          <div className="label" style={{ fontSize: '9px', marginBottom: '8px' }}>Avg Order Value</div>
          <div className="fraunces text-ink" style={{ fontSize: '1.5rem', fontWeight: 800 }}>₹{avgOrderValue.toFixed(2)}</div>
          <div style={{ fontSize: '10px', marginTop: '4px', opacity: 0.5 }}>Net platform average</div>
        </section>
        <section className="paper-sheet" style={{ padding: '1.5rem', background: 'var(--ink-primary)', color: 'white' }}>
          <div className="label" style={{ fontSize: '9px', marginBottom: '8px', color: 'rgba(255,255,255,0.6)' }}>Platform Profit</div>
          <div className="fraunces" style={{ fontSize: '1.5rem', fontWeight: 800 }}>₹{platformProfit.toLocaleString()}</div>
          <div style={{ fontSize: '10px', marginTop: '4px', color: 'rgba(255,255,255,0.5)' }}>11% Platform Fee Basis</div>
        </section>
      </div>

      <div className="admin-main-grid">
        {/* ── SHOP PERFORMANCE ── */}
        <section>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
            <h3 className="fraunces text-ink" style={{ fontSize: '1.2rem' }}>Top Performing Shops</h3>
            <Link href="/admin/users" className="label" style={{ fontSize: '9px', textDecoration: 'none', borderBottom: '1px solid' }}>View All Vendors</Link>
          </div>
          <section className="paper-sheet" style={{ padding: 0 }}>
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px', minWidth: '520px' }}>
                <thead>
                  <tr style={{ borderBottom: '1px solid rgba(62,32,40,0.1)', textAlign: 'left' }}>
                    <th style={{ padding: '1.2rem', fontWeight: 700 }} className="label">Shop Identity</th>
                    <th style={{ padding: '1.2rem', fontWeight: 700 }} className="label">Total Orders</th>
                    <th style={{ padding: '1.2rem', fontWeight: 700 }} className="label">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {vendors.length === 0 ? (
                    <tr>
                      <td colSpan={3} style={{ padding: '3rem', textAlign: 'center', opacity: 0.5 }} className="lora italic">No active shops registered in the system.</td>
                    </tr>
                  ) : vendors.map((v) => (
                    <tr key={v.id} style={{ borderBottom: '1px solid rgba(62,32,40,0.05)' }}>
                      <td style={{ padding: '1.2rem' }}>
                        <div style={{ fontWeight: 700 }} className="text-ink">{v.shopName}</div>
                        <div style={{ fontSize: '10px', opacity: 0.5 }}>ID: {v.id.slice(0, 8)}</div>
                      </td>
                      <td style={{ padding: '1.2rem', fontWeight: 600 }}>{v._count.orders}</td>
                      <td style={{ padding: '1.2rem' }}>
                        <span style={{
                          background: 'rgba(16, 185, 129, 0.1)',
                          color: '#10b981',
                          fontSize: '9px',
                          padding: '4px 8px',
                          borderRadius: '12px',
                          fontWeight: 800,
                          letterSpacing: '0.5px'
                        }}>ACTIVE</span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>
        </section>

        {/* ── ACTION CENTER ── */}
        <section>
          <h3 className="fraunces text-ink" style={{ marginBottom: "1.5rem", fontSize: '1.2rem' }}>Action Center</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.2rem' }}>
            <Link href="/admin/payouts" style={{ textDecoration: 'none' }}>
              <section className="paper-sheet" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', cursor: 'pointer', transition: 'transform 0.2s' }}>
                <div>
                  <h4 className="fraunces text-ink" style={{ fontSize: "1rem", marginBottom: '4px' }}>Pending Payouts</h4>
                  <p className="lora italic" style={{ fontSize: "0.8rem", opacity: 0.6 }}>{pendingPayouts} vendors awaiting settlement</p>
                </div>
                <div className="wax-seal" style={{ width: '32px', height: '32px' }}></div>
              </section>
            </Link>

            <Link href="/admin/orders" style={{ textDecoration: 'none' }}>
              <section className="paper-sheet" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', cursor: 'pointer' }}>
                <div>
                  <h4 className="fraunces text-ink" style={{ fontSize: "1rem", marginBottom: '4px' }}>Order Oversight</h4>
                  <p className="lora italic" style={{ fontSize: "0.8rem", opacity: 0.6 }}>Review disputes and cancellations</p>
                </div>
                <ShoppingBag size={20} className="text-ink" opacity={0.3} />
              </section>
            </Link>

            <Link href="/admin/logs" style={{ textDecoration: 'none' }}>
              <section className="paper-sheet" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', cursor: 'pointer' }}>
                <div>
                  <h4 className="fraunces text-ink" style={{ fontSize: "1rem", marginBottom: '4px' }}>Security Logs</h4>
                  <p className="lora italic" style={{ fontSize: "0.8rem", opacity: 0.6 }}>Audit platform administrative actions</p>
                </div>
                <History size={20} className="text-ink" opacity={0.3} />
              </section>
            </Link>
          </div>
        </section>
      </div>

      <section className="paper-sheet" style={{ marginTop: '2rem', padding: '1.5rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
          <h3 className="fraunces text-ink" style={{ fontSize: '1.1rem' }}>Database Snapshot</h3>
          <span className="label" style={{ fontSize: '9px', opacity: 0.7 }}>Live counts from production tables</span>
        </div>
        <div className="admin-grid-4">
          <div><div className="label" style={{ fontSize: '9px' }}>Users</div><div className="fraunces text-ink" style={{ fontSize: '1.2rem', fontWeight: 800 }}>{userCount}</div></div>
          <div><div className="label" style={{ fontSize: '9px' }}>Vendors</div><div className="fraunces text-ink" style={{ fontSize: '1.2rem', fontWeight: 800 }}>{vendorCount}</div></div>
          <div><div className="label" style={{ fontSize: '9px' }}>Order Files</div><div className="fraunces text-ink" style={{ fontSize: '1.2rem', fontWeight: 800 }}>{fileCount}</div></div>
          <div><div className="label" style={{ fontSize: '9px' }}>Audit Logs</div><div className="fraunces text-ink" style={{ fontSize: '1.2rem', fontWeight: 800 }}>{logCount}</div></div>
        </div>
      </section>
    </div>
  );
}
