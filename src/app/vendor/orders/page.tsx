"use client";
import React, { useState } from 'react';

export default function VendorOrdersPage() {
    const [selectedOrder, setSelectedOrder] = useState<any>(null);

    const orders = [
        { id: "#PR-8821", student: "Nikhil Sridhara", phone: "+91 98765 43210", file: "Final_Thesis_v2.pdf", pages: 42, copies: 1, config: "A4, 80GSM, B&W, Double", delivery: "Campus Delivery", slot: "4 PM - 6 PM", status: "READY", payment: "PAID" },
        { id: "#PR-8819", student: "Sarah Jenkins", phone: "+91 91234 56789", file: "Lecture_Notes_Unit3.pdf", pages: 12, copies: 3, config: "A4, 70GSM, B&W, Single", delivery: "Self Pickup", slot: "ASAP", status: "PRINTING", payment: "PAID" },
        { id: "#PR-8815", student: "Rahul Verma", phone: "+91 99887 76655", file: "Design_Portfolio.pdf", pages: 20, copies: 1, config: "A3, 120GSM, Color, Single", delivery: "Standard", slot: "Tomorrow", status: "PENDING", payment: "PAID" },
    ];

    const openOrderDetails = (order: any) => setSelectedOrder(order);

    return (
        <div style={{ position: 'relative', minHeight: 'calc(100vh - 160px)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
                <h2 className="fraunces text-ink" style={{ fontSize: '1.5rem', fontWeight: 700 }}>Order Management</h2>
                <div style={{ display: 'flex', gap: '12px' }}>
                    <button className="paper-sheet" style={{ padding: '8px 16px', fontSize: '12px' }}>Filter by Status</button>
                    <button className="paper-sheet" style={{ padding: '8px 16px', fontSize: '12px' }}>Export CSV</button>
                </div>
            </div>

            <section className="paper-sheet" style={{ overflow: 'hidden' }}>
                <div className="w-full overflow-x-auto">
                    <table className="w-full text-left" style={{ borderCollapse: 'collapse' }}>
                        <thead>
                            <tr style={{ borderBottom: '1px solid rgba(62,32,40,0.1)', background: 'rgba(62,32,40,0.02)' }}>
                                <th className="label" style={{ padding: '12px 16px', fontSize: '9px' }}>ORDER ID</th>
                                <th className="label" style={{ padding: '12px 16px', fontSize: '9px' }}>STUDENT</th>
                                <th className="label" style={{ padding: '12px 16px', fontSize: '9px' }}>FILE & PAGES</th>
                                <th className="label" style={{ padding: '12px 16px', fontSize: '9px' }}>CONFIG</th>
                                <th className="label" style={{ padding: '12px 16px', fontSize: '9px' }}>DELIVERY</th>
                                <th className="label" style={{ padding: '12px 16px', fontSize: '9px' }}>STATUS</th>
                                <th className="label" style={{ padding: '12px 16px', fontSize: '9px' }}>ACTION</th>
                            </tr>
                        </thead>
                        <tbody>
                            {orders.map((order, i) => (
                                <tr key={i} style={{ borderBottom: '1px solid rgba(62,32,40,0.05)' }}>
                                    <td className="nav-text" style={{ padding: '16px', fontSize: '13px', fontWeight: 700 }}>{order.id}</td>
                                    <td style={{ padding: '16px' }}>
                                        <div className="lora" style={{ fontSize: '13px', fontWeight: 600 }}>{order.student}</div>
                                        <div className="label" style={{ fontSize: '9px', opacity: 0.5 }}>{order.phone}</div>
                                    </td>
                                    <td style={{ padding: '16px' }}>
                                        <div className="nav-text" style={{ fontSize: '12px', color: 'var(--wax-red)', textDecoration: 'underline', cursor: 'pointer' }}>{order.file}</div>
                                        <div className="label" style={{ fontSize: '9px', opacity: 0.5 }}>{order.pages} pages × {order.copies} copies</div>
                                    </td>
                                    <td className="lora" style={{ padding: '16px', fontSize: '11px', opacity: 0.7 }}>{order.config}</td>
                                    <td style={{ padding: '16px' }}>
                                        <div className="label" style={{ fontSize: '10px', fontWeight: 700 }}>{order.delivery}</div>
                                        <div className="label" style={{ fontSize: '9px', opacity: 0.5 }}>{order.slot}</div>
                                    </td>
                                    <td style={{ padding: '16px' }}>
                                        <span style={{
                                            fontSize: '9px',
                                            fontWeight: 900,
                                            padding: '4px 8px',
                                            borderRadius: '4px',
                                            background: order.status === 'READY' ? 'rgba(45,90,39,0.1)' : 'rgba(139,30,43,0.05)',
                                            color: order.status === 'READY' ? '#2d5a27' : 'var(--wax-red)'
                                        }}>
                                            {order.status}
                                        </span>
                                    </td>
                                    <td style={{ padding: '16px' }}>
                                        <button
                                            onClick={() => openOrderDetails(order)}
                                            className="btn-signin"
                                            style={{ padding: '4px 12px', fontSize: '10px', width: 'auto' }}
                                        >
                                            Details
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </section>

            {/* ── ORDER DETAIL DRAWER ── */}
            {selectedOrder && (
                <div style={{
                    position: 'fixed',
                    top: 0,
                    right: 0,
                    width: '450px',
                    height: '100vh',
                    background: 'var(--bg-paper)',
                    boxShadow: '-10px 0 30px rgba(0,0,0,0.1)',
                    zIndex: 100,
                    padding: '40px',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '24px',
                    borderLeft: '1px solid rgba(62,32,40,0.1)'
                }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <h3 className="fraunces text-ink" style={{ fontSize: '1.4rem', fontWeight: 700 }}>Order {selectedOrder.id}</h3>
                        <button onClick={() => setSelectedOrder(null)} style={{ fontSize: '20px', opacity: 0.5 }}>×</button>
                    </div>

                    <div className="founders-rule" style={{ opacity: 0.1 }}></div>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                        <section>
                            <div className="label" style={{ fontSize: '10px', marginBottom: '8px' }}>DOCUMENT CONFIGURATION</div>
                            <div className="paper-sheet" style={{ padding: '20px', background: 'rgba(62,32,40,0.02)' }}>
                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                                    <div>
                                        <div className="label" style={{ fontSize: '8px', opacity: 0.5 }}>SIZE</div>
                                        <div className="nav-text" style={{ fontSize: '13px' }}>A4 Regular</div>
                                    </div>
                                    <div>
                                        <div className="label" style={{ fontSize: '8px', opacity: 0.5 }}>WEIGHT</div>
                                        <div className="nav-text" style={{ fontSize: '13px' }}>80 GSM</div>
                                    </div>
                                    <div>
                                        <div className="label" style={{ fontSize: '8px', opacity: 0.5 }}>COLOR</div>
                                        <div className="nav-text" style={{ fontSize: '13px' }}>Black & White</div>
                                    </div>
                                    <div>
                                        <div className="label" style={{ fontSize: '8px', opacity: 0.5 }}>SIDES</div>
                                        <div className="nav-text" style={{ fontSize: '13px' }}>Double Sided</div>
                                    </div>
                                </div>
                            </div>
                        </section>

                        <section>
                            <div className="label" style={{ fontSize: '10px', marginBottom: '8px' }}>FINISHING & BINDING</div>
                            <div className="paper-sheet" style={{ padding: '20px', background: 'rgba(62,32,40,0.02)' }}>
                                <div className="nav-text" style={{ fontSize: '13px' }}>Spiral Binding (Plastic)</div>
                                <div className="label" style={{ fontSize: '10px', opacity: 0.5 }}>"Customer requested no lamination"</div>
                            </div>
                        </section>

                        <section>
                            <div className="label" style={{ fontSize: '10px', marginBottom: '8px' }}>STATUS UPDATE</div>
                            <div style={{ display: 'flex', gap: '12px' }}>
                                <button className="btn-signup" style={{ flex: 1, fontSize: '11px', background: '#3e2028' }}>Mark as Printing</button>
                                <button className="btn-signup" style={{ flex: 1, fontSize: '11px', background: '#2d5a27' }}>Mark as Ready</button>
                            </div>
                            <button className="btn-signin mt-4" style={{ width: '100%', fontSize: '10px', color: 'var(--wax-red)' }}>Report Issue</button>
                        </section>
                    </div>

                    <div className="mt-auto">
                        <div className="label" style={{ fontSize: '9px', textAlign: 'center', opacity: 0.4 }}>
                            "Paid via Razorpay • Trans-882910"
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
