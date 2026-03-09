import React from "react";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { ShieldCheck, ShieldAlert, Star } from "lucide-react";
export const dynamic = 'force-dynamic';


export default async function AdminShopsPage() {
    const session = await auth();
    const role = (session?.user as { role?: string } | undefined)?.role;

    if (!session?.user || role !== "ADMIN") {
        redirect('/admin/login?next=/admin/shops');
    }

    const shops = await prisma.vendorProfile.findMany({
        select: {
            id: true,
            shopName: true,
            shopAddress: true,
            user: {
                select: {
                    name: true,
                    email: true,
                },
            },
            _count: {
                select: { orders: true }
            }
        },
        orderBy: { shopName: 'asc' }
    }) as any;

    return (
        <div className="reveal-up active">
            <header style={{ marginBottom: '2.5rem' }}>
                <h2 className="fraunces text-ink" style={{ fontSize: '2rem', fontWeight: 900, marginBottom: '0.5rem' }}>Shop Management</h2>
                <p className="lora italic opacity-60">"Authorize, monitor, and regulate platform print partners."</p>
            </header>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '1.5rem', marginBottom: '2.5rem' }}>
                <section className="paper-sheet" style={{ padding: '1.2rem' }}>
                    <div className="label" style={{ fontSize: '9px', marginBottom: '8px' }}>Total Partners</div>
                    <div className="fraunces text-ink" style={{ fontSize: '1.5rem', fontWeight: 800 }}>{shops.length}</div>
                </section>
                <section className="paper-sheet" style={{ padding: '1.2rem' }}>
                    <div className="label" style={{ fontSize: '9px', marginBottom: '8px' }}>Operating Capacity</div>
                    <div className="fraunces text-ink" style={{ fontSize: '1.5rem', fontWeight: 800 }}>88%</div>
                </section>
                <section className="paper-sheet" style={{ padding: '1.2rem' }}>
                    <div className="label" style={{ fontSize: '9px', marginBottom: '8px' }}>Pending Approvals</div>
                    <div className="fraunces text-ink" style={{ fontSize: '1.5rem', fontWeight: 800 }}>0</div>
                </section>
                <section className="paper-sheet" style={{ padding: '1.2rem' }}>
                    <div className="label" style={{ fontSize: '9px', marginBottom: '8px' }}>Avg Rating</div>
                    <div className="fraunces text-ink" style={{ fontSize: '1.5rem', fontWeight: 800 }}>4.8</div>
                </section>
            </div>

            <section className="paper-sheet">
                <div style={{ overflowX: 'auto' }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '12px' }}>
                        <thead>
                            <tr style={{ borderBottom: '1px solid rgba(62,32,40,0.1)', textAlign: 'left' }}>
                                <th style={{ padding: '15px 10px' }} className="label">Shop Name & Owner</th>
                                <th style={{ padding: '15px 10px' }} className="label">Location</th>
                                <th style={{ padding: '15px 10px' }} className="label">Volume</th>
                                <th style={{ padding: '15px 10px' }} className="label">Status</th>
                                <th style={{ padding: '15px 10px' }} className="label">Action</th>
                            </tr>
                        </thead>
                        <tbody>
                            {shops.length === 0 ? (
                                <tr><td colSpan={5} style={{ padding: '4rem', textAlign: 'center', opacity: 0.4 }} className="lora italic">No shops registered yet.</td></tr>
                            ) : shops.map((shop: any) => (
                                <tr key={shop.id} style={{ borderBottom: '1px solid rgba(62,32,40,0.05)' }}>
                                    <td style={{ padding: '15px 10px' }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                            <div className="wax-seal" style={{ width: '32px', height: '32px', flexShrink: 0 }}></div>
                                            <div>
                                                <div style={{ fontWeight: 700, fontSize: '14px' }} className="text-ink">{shop.shopName}</div>
                                                <div style={{ fontSize: '10px', opacity: 0.5 }}>Owner: {shop.user.name} ({shop.user.email})</div>
                                            </div>
                                        </div>
                                    </td>
                                    <td style={{ padding: '15px 10px' }}>
                                        <div style={{ maxWidth: '200px', fontSize: '11px' }}>{shop.shopAddress}</div>
                                    </td>
                                    <td style={{ padding: '15px 10px' }}>
                                        <div style={{ fontWeight: 700 }} className="text-ink">{shop._count.orders} Orders</div>
                                        <div style={{ display: 'flex', gap: '2px', marginTop: '4px' }}>
                                            {[1, 2, 3, 4, 5].map(i => <Star key={i} size={8} fill={i <= 4 ? "var(--wax-red)" : "none"} color="var(--wax-red)" />)}
                                        </div>
                                    </td>
                                    <td style={{ padding: '15px 10px' }}>
                                        <span style={{
                                            background: 'rgba(16, 185, 129, 0.1)',
                                            color: '#10b981',
                                            fontSize: '8px',
                                            padding: '2px 6px',
                                            borderRadius: '2px',
                                            fontWeight: 900,
                                            letterSpacing: '0.5px'
                                        }}>VERIFIED</span>
                                    </td>
                                    <td style={{ padding: '15px 10px' }}>
                                        <div style={{ display: 'flex', gap: '8px' }}>
                                            <button style={{
                                                padding: '6px',
                                                border: '1px solid rgba(62,32,40,0.1)',
                                                borderRadius: '4px',
                                                background: 'white',
                                                cursor: 'pointer'
                                            }} title="Suspend Shop">
                                                <ShieldAlert size={14} color="var(--wax-red)" />
                                            </button>
                                            <button style={{
                                                padding: '6px',
                                                border: '1px solid rgba(62,32,40,0.1)',
                                                borderRadius: '4px',
                                                background: 'white',
                                                cursor: 'pointer'
                                            }} title="Verify Shop">
                                                <ShieldCheck size={14} color="#10b981" />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </section>
        </div>
    );
}
