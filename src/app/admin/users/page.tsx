import { prisma } from "@/lib/prisma";
import { format } from "date-fns";
import { Prisma } from "@prisma/client";
import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { AdminUserStateAction } from "@/components/admin/AdminUserStateAction";
import { History } from "lucide-react";

export const dynamic = 'force-dynamic';

type UserWithLogs = Prisma.UserGetPayload<{
    include: {
        logs: { take: 1; orderBy: { createdAt: 'desc' } };
        accounts: { select: { provider: true; providerAccountId: true } };
    }
}>;

type LogWithUser = Prisma.ActivityLogGetPayload<{
    include: { user: true }
}>;

type ExtendedProfileFields = {
    phone?: string | null;
    givenName?: string | null;
    familyName?: string | null;
    locale?: string | null;
    isSuspended?: boolean;
};

export default async function AdminUsersPage() {
    const session = await auth();
    const role = (session?.user as { role?: string } | undefined)?.role;

    if (!session?.user || role !== "ADMIN") {
        redirect('/admin/login?next=/admin/users');
    }

    const users = await prisma.user.findMany({
        include: {
            logs: {
                orderBy: { createdAt: "desc" },
                take: 1,
            },
            accounts: {
                select: {
                    provider: true,
                },
            },
            orders: {
                select: {
                    totalPaid: true,
                }
            }
        },
        orderBy: { createdAt: "desc" },
    });

    const studentCount = users.filter(u => u.role === 'STUDENT').length;
    const vendorCount = users.filter(u => u.role === 'VENDOR').length;
    const adminCount = users.filter(u => u.role === 'ADMIN').length;

    const activityLogs: LogWithUser[] = await prisma.activityLog.findMany({
        include: { user: true },
        orderBy: { createdAt: "desc" },
        take: 20,
    });

    return (
        <div className="reveal-up active">
            <header style={{ marginBottom: '2.5rem' }}>
                <h2 className="fraunces text-ink" style={{ fontSize: '2rem', fontWeight: 900, marginBottom: '0.5rem' }}>User Registry</h2>
                <p className="lora italic opacity-60">"Comprehensive monitoring of the AforPrint ecosystem's active participants."</p>
            </header>

            {/* ── PLATFORM STATS ── */}
            <div className="admin-grid-3" style={{ marginBottom: '2.5rem' }}>
                <section className="paper-sheet" style={{ padding: '1.2rem' }}>
                    <div className="label" style={{ fontSize: '9px', marginBottom: '8px' }}>Total Students</div>
                    <div className="fraunces text-ink" style={{ fontSize: '1.8rem', fontWeight: 800 }}>{studentCount}</div>
                </section>
                <section className="paper-sheet" style={{ padding: '1.2rem' }}>
                    <div className="label" style={{ fontSize: '9px', marginBottom: '8px' }}>Active Vendors</div>
                    <div className="fraunces text-ink" style={{ fontSize: '1.8rem', fontWeight: 800 }}>{vendorCount}</div>
                </section>
                <section className="paper-sheet" style={{ padding: '1.2rem' }}>
                    <div className="label" style={{ fontSize: '9px', marginBottom: '8px' }}>Platform Admins</div>
                    <div className="fraunces text-ink" style={{ fontSize: '1.8rem', fontWeight: 800 }}>{adminCount}</div>
                </section>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '2rem' }}>
                {/* ── USER TABLE ── */}
                <section className="paper-sheet">
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
                        <h3 className="fraunces text-ink" style={{ fontSize: '1.2rem' }}>Registered Profiles</h3>
                        <div className="label" style={{ fontSize: '9px', opacity: 0.5 }}>Showing {users.length} total entries</div>
                    </div>

                    <div style={{ overflowX: 'auto' }}>
                        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '12px', minWidth: '860px' }}>
                            <thead>
                                <tr style={{ borderBottom: '1px solid rgba(62,32,40,0.1)', textAlign: 'left' }}>
                                    <th style={{ padding: '15px 10px' }} className="label">Identity</th>
                                    <th style={{ padding: '15px 10px' }} className="label">Financials</th>
                                    <th style={{ padding: '15px 10px' }} className="label">Activity</th>
                                    <th style={{ padding: '15px 10px' }} className="label">Status</th>
                                    <th style={{ padding: '15px 10px' }} className="label">Action</th>
                                </tr>
                            </thead>
                            <tbody>
                                {users.length === 0 ? (
                                    <tr><td colSpan={5} style={{ padding: '4rem', textAlign: 'center', opacity: 0.4 }} className="lora italic">No users found in the system.</td></tr>
                                ) : users.map((u) => {
                                    const totalSpending = u.orders.reduce((sum, o) => sum + (o.totalPaid || 0), 0);
                                    const orderCount = u.orders.length;
                                    const profile = u as any & ExtendedProfileFields;
                                    const lastLogin = u.logs[0]?.createdAt;

                                    return (
                                        <tr key={u.id} style={{ borderBottom: '1px solid rgba(62,32,40,0.05)' }}>
                                            <td style={{ padding: '15px 10px' }}>
                                                <div style={{ fontWeight: 700, fontSize: '14px' }} className="text-ink">{u.name || "Anonymous Student"}</div>
                                                <div style={{ fontSize: '10px', opacity: 0.6 }}>{u.email}</div>
                                                <div style={{ fontSize: '9px', marginTop: '4px' }}>
                                                    <span style={{
                                                        fontSize: '8px',
                                                        padding: '2px 6px',
                                                        background: u.role === 'VENDOR' ? 'var(--wax-red)' : u.role === 'ADMIN' ? 'var(--ink-primary)' : 'rgba(62,32,40,0.1)',
                                                        color: (u.role === 'VENDOR' || u.role === 'ADMIN') ? 'white' : 'var(--ink-primary)',
                                                        borderRadius: '2px',
                                                        fontWeight: 900,
                                                        textTransform: 'uppercase'
                                                    }}>{u.role}</span>
                                                    <span style={{ marginLeft: '8px', opacity: 0.4 }}>via {u.accounts[0]?.provider || 'Email'}</span>
                                                </div>
                                            </td>
                                            <td style={{ padding: '15px 10px' }}>
                                                <div style={{ fontWeight: 700 }} className="text-ink">₹{totalSpending.toFixed(2)}</div>
                                                <div style={{ fontSize: '10px', opacity: 0.5 }}>{orderCount} total orders</div>
                                            </td>
                                            <td style={{ padding: '15px 10px' }}>
                                                <div style={{ fontSize: '10px', fontWeight: 600 }}>Join: {format(new Date(u.createdAt), "MMM d, yyyy")}</div>
                                                <div style={{ fontSize: '10px', opacity: 0.5 }}>Active: {lastLogin ? format(new Date(lastLogin), "MMM d, HH:mm") : "N/A"}</div>
                                            </td>
                                            <td style={{ padding: '15px 10px' }}>
                                                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                                                    <div style={{
                                                        width: '6px',
                                                        height: '6px',
                                                        borderRadius: '50%',
                                                        background: profile.isSuspended ? 'var(--wax-red)' : '#10b981'
                                                    }}
                                                    ></div>
                                                    <span style={{ fontSize: '10px', fontWeight: 700, color: profile.isSuspended ? 'var(--wax-red)' : '#10b981' }}>
                                                        {profile.isSuspended ? 'SUSPENDED' : 'OPERATIONAL'}
                                                    </span>
                                                </div>
                                            </td>
                                            <td style={{ padding: '15px 10px' }}>
                                                <AdminUserStateAction userId={u.id} isSuspended={!!profile.isSuspended} />
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                </section>

                {/* ── ACTIVITY FEED ── */}
                <section className="paper-sheet" style={{ background: 'rgba(62,32,40,0.02)' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
                        <h3 className="fraunces text-ink" style={{ fontSize: '1.2rem' }}>Global Activity Stream</h3>
                        <History size={16} className="text-ink" opacity={0.3} />
                    </div>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '1.5rem' }}>
                        {activityLogs.length === 0 ? (
                            <div style={{ opacity: 0.4, fontSize: '11px' }} className="lora italic">No recorded activity in the last 24 hours.</div>
                        ) : activityLogs.map((l) => (
                            <div key={l.id} style={{
                                borderLeft: '2px solid var(--wax-red)',
                                padding: '12px',
                                background: 'white',
                                boxShadow: '2px 2px 10px rgba(0,0,0,0.02)'
                            }}>
                                <div style={{ fontSize: '11px', fontWeight: 800, marginBottom: '4px' }} className="text-ink">{l.user.name}</div>
                                <div style={{ fontSize: '10px', opacity: 0.7, lineHeight: 1.4 }}>{l.action}: {l.details}</div>
                                <div style={{ fontSize: '9px', marginTop: '8px', opacity: 0.4, fontWeight: 700 }}>{format(new Date(l.createdAt), "MMM d • HH:mm:ss")}</div>
                            </div>
                        ))}
                    </div>
                </section>
            </div>
        </div>
    );
}
