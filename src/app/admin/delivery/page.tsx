import React from "react";
import { prisma } from "@/lib/prisma";
import { format } from "date-fns";
import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { Truck, MapPin, Package, CheckCircle2 } from "lucide-react";
export const dynamic = 'force-dynamic';


export default async function AdminDeliveryPage() {
    const session = await auth();
    const role = (session?.user as { role?: string } | undefined)?.role;

    if (!session?.user || role !== "ADMIN") {
        redirect('/admin/login?next=/admin/delivery');
    }

    // Orders that have a delivery address or are out for delivery
    const deliveryOrders = await prisma.order.findMany({
        where: {
            OR: [
                { deliveryAddress: { not: null } },
                { status: { in: ['READY', 'COMPLETED'] } }
            ]
        },
        include: {
            student: true,
            vendor: true
        },
        orderBy: { createdAt: 'desc' },
        take: 50
    });

    return (
        <div className="reveal-up active">
            <header style={{ marginBottom: '2.5rem' }}>
                <h2 className="fraunces text-ink" style={{ fontSize: '2rem', fontWeight: 900, marginBottom: '0.5rem' }}>Logistics & Delivery</h2>
                <p className="lora italic opacity-60">"Ensuring the transit of knowledge across campus boundaries."</p>
            </header>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1.5rem', marginBottom: '2.5rem' }}>
                <section className="paper-sheet" style={{ padding: '1.2rem', borderLeft: '3px solid var(--wax-red)' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                        <Truck size={14} className="text-ink" />
                        <div className="label" style={{ fontSize: '9px' }}>Active Transit</div>
                    </div>
                    <div className="fraunces text-ink" style={{ fontSize: '1.5rem', fontWeight: 800 }}>{deliveryOrders.filter(o => o.status === 'READY').length}</div>
                </section>
                <section className="paper-sheet" style={{ padding: '1.2rem', borderLeft: '3px solid #10b981' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                        <CheckCircle2 size={14} style={{ color: '#10b981' }} />
                        <div className="label" style={{ fontSize: '9px' }}>Fulfilled Today</div>
                    </div>
                    <div className="fraunces text-ink" style={{ fontSize: '1.5rem', fontWeight: 800 }}>{deliveryOrders.filter(o => o.status === 'COMPLETED').length}</div>
                </section>
                <section className="paper-sheet" style={{ padding: '1.2rem', borderLeft: '3px solid var(--ink-primary)' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                        <MapPin size={14} className="text-ink" />
                        <div className="label" style={{ fontSize: '9px' }}>Fleet Sentiment</div>
                        <span style={{ fontSize: '8px', fontWeight: 900, color: 'var(--wax-red)', marginLeft: 'auto' }}>EXCELLENT</span>
                    </div>
                    <div className="fraunces text-ink" style={{ fontSize: '1.5rem', fontWeight: 800 }}>98%</div>
                </section>
            </div>

            <section className="paper-sheet" style={{ padding: 0 }}>
                <div style={{ overflowX: 'auto' }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '12px' }}>
                        <thead>
                            <tr style={{ borderBottom: '1px solid rgba(62,32,40,0.1)', textAlign: 'left' }}>
                                <th style={{ padding: '15px 12px' }} className="label">Package ID</th>
                                <th style={{ padding: '15px 12px' }} className="label">Destination Address</th>
                                <th style={{ padding: '15px 12px' }} className="label">Origin (Shop)</th>
                                <th style={{ padding: '15px 12px' }} className="label">Logistics Status</th>
                                <th style={{ padding: '15px 12px' }} className="label">Timeline</th>
                            </tr>
                        </thead>
                        <tbody>
                            {deliveryOrders.length === 0 ? (
                                <tr><td colSpan={5} style={{ padding: '4rem', textAlign: 'center', opacity: 0.4 }} className="lora italic">No logistics data available.</td></tr>
                            ) : deliveryOrders.map((order) => (
                                <tr key={order.id} style={{ borderBottom: '1px solid rgba(62,32,40,0.05)' }}>
                                    <td style={{ padding: '20px 12px' }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                            <Package size={16} className="text-ink" opacity={0.3} />
                                            <div>
                                                <div style={{ fontWeight: 800 }} className="text-ink">#{order.id.slice(0, 6)}</div>
                                                <div style={{ fontSize: '9px', opacity: 0.5 }}>By: {order.student.name}</div>
                                            </div>
                                        </div>
                                    </td>
                                    <td style={{ padding: '20px 12px' }}>
                                        <div style={{ display: 'flex', gap: '6px', alignItems: 'flex-start' }}>
                                            <MapPin size={12} style={{ marginTop: '2px', color: 'var(--wax-red)' }} />
                                            <div style={{ fontSize: '10px', maxWidth: '200px', lineHeight: 1.4 }}>
                                                {order.deliveryAddress || "University Collection Hub (Room 302)"}
                                            </div>
                                        </div>
                                    </td>
                                    <td style={{ padding: '20px 12px' }}>
                                        <div style={{ fontSize: '11px', fontWeight: 700 }} className="text-ink">{order.vendor.shopName}</div>
                                        <div style={{ fontSize: '9px', opacity: 0.5 }}>Central Campus Gate #1</div>
                                    </td>
                                    <td style={{ padding: '20px 12px' }}>
                                        <span style={{
                                            fontSize: '8px',
                                            padding: '3px 7px',
                                            background: order.status === 'COMPLETED' ? '#10b981' : 'var(--wax-red)',
                                            color: 'white',
                                            borderRadius: '2px',
                                            fontWeight: 900
                                        }}>{order.status === 'READY' ? 'IN TRANSIT' : order.status}</span>
                                    </td>
                                    <td style={{ padding: '20px 12px' }}>
                                        <div style={{ fontSize: '10px', fontWeight: 600 }}>{format(new Date(order.createdAt), "HH:mm")} <span style={{ opacity: 0.4, fontWeight: 400 }}>Logged</span></div>
                                        <div style={{ fontSize: '9px', opacity: 0.4, marginTop: '2px' }}>Est. Delivery: 25 mins</div>
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
