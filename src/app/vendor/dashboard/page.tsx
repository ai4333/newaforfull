"use client";
import React from 'react';
import Link from 'next/link';

export default function VendorDashboard() {
    const stats = [
        {
            label: "Orders Today",
            value: "24",
            icon: (
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4Z"></path>
                    <line x1="3" y1="6" x2="21" y2="6"></line>
                    <path d="M16 10a4 4 0 0 1-8 0"></path>
                </svg>
            ),
            trend: "+12%"
        },
        {
            label: "Pending Print Jobs",
            value: "08",
            icon: (
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="6 9 6 2 18 2 18 9"></polyline>
                    <path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2"></path>
                    <rect x="6" y="14" width="12" height="8"></rect>
                </svg>
            ),
            color: "var(--wax-red)"
        },
        {
            label: "Ready for Pickup",
            value: "14",
            icon: (
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
                    <polyline points="22 4 12 14.01 9 11.01"></polyline>
                </svg>
            ),
            color: "#2d5a27"
        },
        {
            label: "Total Earnings (Week)",
            value: "₹8,420",
            icon: (
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <circle cx="12" cy="12" r="10"></circle>
                    <line x1="12" y1="8" x2="12" y2="16"></line>
                    <line x1="8" y1="12" x2="16" y2="12"></line>
                </svg>
            ),
            trend: "+18%"
        },
    ];

    const recentOrders = [
        { id: "#PR-8821", student: "Nikhil Sridhara", type: "Color Print", delivery: "Pickup", status: "READY", time: "12 mins ago" },
        { id: "#PR-8819", student: "Sarah Jenkins", type: "B&W Document", delivery: "Express", status: "PRINTING", time: "24 mins ago" },
        { id: "#PR-8815", student: "Rahul Verma", type: "Spiral Binding", delivery: "Standard", status: "PENDING", time: "1 hour ago" },
        { id: "#PR-8812", student: "Priya Das", type: "Poster Print", delivery: "Pickup", status: "COMPLETED", time: "2 hours ago" },
    ];

    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
            {/* ── STATS GRID ── */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '20px' }}>
                {stats.map((stat, i) => (
                    <div key={i} className="paper-sheet" style={{ padding: '20px', position: 'relative', overflow: 'hidden' }}>
                        <div style={{ fontSize: '20px', marginBottom: '12px' }}>{stat.icon}</div>
                        <div className="label" style={{ fontSize: '9px', opacity: 0.5, marginBottom: '4px' }}>{stat.label}</div>
                        <div className="fraunces text-ink" style={{ fontSize: '1.5rem', fontWeight: 900, color: stat.color || 'inherit' }}>
                            {stat.value}
                        </div>
                        {stat.trend && (
                            <div style={{ position: 'absolute', top: '20px', right: '20px', fontSize: '10px', color: '#2d5a27', fontWeight: 700 }}>
                                {stat.trend} ↑
                            </div>
                        )}
                    </div>
                ))}
            </div>

            {/* ── RECENT ORDERS ── */}
            <section className="paper-sheet" style={{ padding: '24px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
                    <h3 className="fraunces text-ink" style={{ fontSize: '1.1rem', fontWeight: 700 }}>Live Order Queue</h3>
                    <Link href="/vendor/orders" className="label" style={{ fontSize: '10px', color: 'var(--wax-red)', fontWeight: 700 }}>VIEW ALL ORDERS →</Link>
                </div>

                <div className="w-full overflow-x-auto">
                    <table className="w-full text-left" style={{ borderCollapse: 'collapse' }}>
                        <thead>
                            <tr style={{ borderBottom: '1px solid rgba(62,32,40,0.1)' }}>
                                <th className="label" style={{ padding: '12px 16px', fontSize: '9px' }}>ORDER ID</th>
                                <th className="label" style={{ padding: '12px 16px', fontSize: '9px' }}>STUDENT</th>
                                <th className="label" style={{ padding: '12px 16px', fontSize: '9px' }}>TYPE</th>
                                <th className="label" style={{ padding: '12px 16px', fontSize: '9px' }}>DELIVERY</th>
                                <th className="label" style={{ padding: '12px 16px', fontSize: '9px' }}>STATUS</th>
                                <th className="label" style={{ padding: '12px 16px', fontSize: '9px' }}>TIME</th>
                            </tr>
                        </thead>
                        <tbody>
                            {recentOrders.map((order, i) => (
                                <tr key={i} style={{ borderBottom: '1px solid rgba(62,32,40,0.05)', transition: 'background 0.2s ease' }} className="hover:bg-black/[0.01]">
                                    <td className="nav-text" style={{ padding: '16px', fontSize: '13px', fontWeight: 700 }}>{order.id}</td>
                                    <td className="lora" style={{ padding: '16px', fontSize: '13px' }}>{order.student}</td>
                                    <td className="lora" style={{ padding: '16px', fontSize: '13px', opacity: 0.7 }}>{order.type}</td>
                                    <td className="label" style={{ padding: '16px', fontSize: '10px' }}>{order.delivery}</td>
                                    <td style={{ padding: '16px' }}>
                                        <span style={{
                                            fontSize: '9px',
                                            fontWeight: 900,
                                            padding: '4px 8px',
                                            borderRadius: '4px',
                                            background: order.status === 'READY' ? 'rgba(45,90,39,0.1)' : 'rgba(62,32,40,0.05)',
                                            color: order.status === 'READY' ? '#2d5a27' : 'inherit'
                                        }}>
                                            {order.status}
                                        </span>
                                    </td>
                                    <td className="label" style={{ padding: '16px', fontSize: '10px', opacity: 0.5 }}>{order.time}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </section>

            {/* ── QUICK ACTIONS ── */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                <div className="paper-sheet" style={{ padding: '20px', display: 'flex', alignItems: 'center', gap: '16px', cursor: 'pointer' }}>
                    <div style={{ fontSize: '24px', display: 'flex', alignItems: 'center' }}>
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ opacity: 0.8 }}>
                            <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path>
                        </svg>
                    </div>
                    <div>
                        <div className="nav-text" style={{ fontSize: '14px', fontWeight: 700 }}>Service Status: Active</div>
                        <div className="label" style={{ fontSize: '10px', opacity: 0.5 }}>Toggle shop visibility for students</div>
                    </div>
                    <div style={{ marginLeft: 'auto' }}>
                        <div style={{ width: '40px', height: '20px', background: '#2d5a27', borderRadius: '10px', position: 'relative' }}>
                            <div style={{ width: '16px', height: '16px', background: 'white', borderRadius: '50%', position: 'absolute', top: '2px', right: '2px' }}></div>
                        </div>
                    </div>
                </div>
                <div className="paper-sheet" style={{ padding: '20px', display: 'flex', alignItems: 'center', gap: '16px', cursor: 'pointer' }}>
                    <div style={{ fontSize: '24px', display: 'flex', alignItems: 'center' }}>
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ opacity: 0.8 }}>
                            <path d="M18 8a3 3 0 0 0-3-3H5a3 3 0 0 0-3 3v8a3 3 0 0 0 3 3h10a3 3 0 0 0 3-3V8Z"></path>
                            <path d="M22 12a3 3 0 0 0-3-3v6a3 3 0 0 0 3-3Z"></path>
                        </svg>
                    </div>
                    <div>
                        <div className="nav-text" style={{ fontSize: '14px', fontWeight: 700 }}>Broadcast Message</div>
                        <div className="label" style={{ fontSize: '10px', opacity: 0.5 }}>Notify students about delays or stock</div>
                    </div>
                </div>
            </div>
        </div>
    );
}
