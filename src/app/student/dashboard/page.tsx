"use client";
import React from 'react';
import Link from 'next/link';

export default function StudentDashboard() {
    const recentOrders = [
        { id: '#PR-8821', file: 'Final_Thesis_v2.pdf', vendor: 'Campus Print Lab', status: 'Ready', date: 'Oct 24, 2025' },
        { id: '#PR-8819', file: 'Assignment_3.docx', vendor: 'Hostel A-Block Store', status: 'Delivered', date: 'Oct 22, 2025' },
    ];

    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
            {/* ── REFINED WELCOME & QUICK ACTIONS ── */}
            <section style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', gap: '40px' }}>
                <div style={{ flex: 1 }}>
                    <h1 className="fraunces text-ink" style={{ fontSize: '2rem', marginBottom: '4px' }}>Welcome Back, Nikhil</h1>
                    <p className="lora" style={{ fontStyle: 'italic', fontSize: '13px', opacity: 0.6 }}>
                        "Ready to turn your digital drafts into physical documents?"
                    </p>
                </div>

                <div style={{ display: 'flex', gap: '12px' }}>
                    <Link href="/student/new-order" className="btn-signup">
                        Create New Order
                    </Link>
                    <Link href="/student/orders" className="btn-signin">
                        Order History
                    </Link>
                </div>
            </section>

            {/* ── QUICK STATS ── */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '20px' }}>
                <div className="paper-sheet" style={{ padding: '20px' }}>
                    <div className="ink-label">Active Orders</div>
                    <div className="fraunces text-ink" style={{ fontSize: '1.75rem', fontWeight: 900 }}>01</div>
                    <div className="label" style={{ fontSize: '8px', marginTop: '8px', opacity: 0.4 }}>ETA: 2 Hours</div>
                </div>
                <div className="paper-sheet" style={{ padding: '20px' }}>
                    <div className="ink-label">Saved Time</div>
                    <div className="fraunces text-ink" style={{ fontSize: '1.75rem', fontWeight: 900 }}>14.2h</div>
                    <div className="label" style={{ fontSize: '8px', marginTop: '8px', opacity: 0.4 }}>Global Ranking: #12</div>
                </div>
                <div className="paper-sheet" style={{ padding: '20px' }}>
                    <div className="ink-label">Credits</div>
                    <div className="fraunces text-ink" style={{ fontSize: '1.75rem', fontWeight: 900 }}>₹442.00</div>
                    <div className="label" style={{ fontSize: '8px', marginTop: '8px', opacity: 0.4 }}>Next Recharge: 15 Oct</div>
                </div>
            </div>

            {/* ── RECENT ACTIVITY ── */}
            <section>
                <div className="flex items-center justify-between mb-4">
                    <h3 className="fraunces text-ink" style={{ fontSize: '1rem', fontWeight: 700 }}>Recent Activity</h3>
                    <div className="founders-rule" style={{ flex: 1, margin: '0 20px', opacity: 0.1 }}></div>
                    <Link href="/student/orders" className="label" style={{ fontSize: '9px', textDecoration: 'none', opacity: 0.6 }}>View All</Link>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    {recentOrders.map((order) => (
                        <div key={order.id} className="paper-sheet" style={{
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center',
                            padding: '12px 20px'
                        }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                                <div className="founder-monogram" style={{ width: '32px', height: '32px', fontSize: '10px' }}>PDF</div>
                                <div>
                                    <div className="nav-text" style={{ fontSize: '13px', fontWeight: 700 }}>{order.file}</div>
                                    <div className="label" style={{ fontSize: '9px', opacity: 0.5 }}>{order.vendor} • {order.date}</div>
                                </div>
                            </div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                                <span className={`status-seal status-${order.status.toLowerCase()}`}>
                                    {order.status}
                                </span>
                                <span className="label" style={{ fontSize: '9px', opacity: 0.4 }}>{order.id}</span>
                            </div>
                        </div>
                    ))}
                </div>
            </section>
        </div>
    );
}
