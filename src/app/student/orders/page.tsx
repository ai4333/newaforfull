"use client";
import React from 'react';

export default function MyOrdersPage() {
    const orders = [
        {
            id: '#PR-8821',
            file: 'Final_Thesis_v2.pdf',
            vendor: 'Campus Print Lab',
            type: 'Campus Delivery',
            date: 'Oct 24, 2025',
            status: 'Ready',
            steps: ['Paid', 'Printing', 'Ready', 'Batched', 'Out for Delivery', 'Delivered']
        },
        {
            id: '#PR-8819',
            file: 'Assignment_3.docx',
            vendor: 'Hostel A Store',
            type: 'Self Pickup',
            date: 'Oct 22, 2025',
            status: 'Delivered',
            steps: ['Paid', 'Printing', 'Ready', 'Batched', 'Out for Delivery', 'Delivered']
        },
    ];

    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {orders.map((order) => {
                const currentStepIdx = order.steps.indexOf(order.status);

                return (
                    <div key={order.id} className="paper-sheet" style={{ padding: '20px 24px' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
                                <div className="founder-monogram" style={{ width: '32px', height: '32px', fontSize: '10px' }}>DOC</div>
                                <div>
                                    <h3 className="fraunces text-ink" style={{ fontSize: '1.1rem', fontWeight: 700 }}>{order.file}</h3>
                                    <div className="label" style={{ fontSize: '8px', opacity: 0.5 }}>{order.vendor} • {order.type} • ID: {order.id}</div>
                                </div>
                            </div>
                            <div style={{ textAlign: 'right' }}>
                                <span className={`status-seal status-${order.status.toLowerCase()}`}>
                                    {order.status}
                                </span>
                                <div className="label mt-1" style={{ fontSize: '8px', opacity: 0.4 }}>Ordered {order.date}</div>
                            </div>
                        </div>

                        {/* ── REFINED STATUS TRACKER ── */}
                        <div style={{ display: 'flex', justifyContent: 'space-between', position: 'relative', marginTop: '24px', padding: '0 10px' }}>
                            <div style={{
                                position: 'absolute', top: '8px', left: '20px', right: '20px',
                                height: '1px', background: 'rgba(62,32,40,0.05)', zIndex: 0
                            }}></div>
                            <div style={{
                                position: 'absolute', top: '8px', left: '20px',
                                width: `calc(${(currentStepIdx / (order.steps.length - 1)) * 100}% - 40px)`,
                                height: '1px', background: 'var(--wax-red)', zIndex: 1, transition: 'width 1s ease'
                            }}></div>

                            {order.steps.map((s, i) => (
                                <div key={s} style={{ position: 'relative', zIndex: 2, textAlign: 'center' }}>
                                    <div style={{
                                        width: '16px', height: '16px', borderRadius: '50%',
                                        background: i <= currentStepIdx ? 'var(--wax-red)' : 'var(--bg-darker)',
                                        border: '3px solid var(--bg-parchment)',
                                        margin: '0 auto 6px',
                                        boxShadow: '0 1px 2px rgba(0,0,0,0.05)'
                                    }}></div>
                                    <div className="label" style={{
                                        fontSize: '7px',
                                        fontWeight: i === currentStepIdx ? 900 : 400,
                                        opacity: i <= currentStepIdx ? 0.8 : 0.3
                                    }}>{s}</div>
                                </div>
                            ))}
                        </div>

                        {order.status === 'Delivered' && (
                            <div style={{
                                marginTop: '20px',
                                paddingTop: '12px',
                                borderTop: '1px solid rgba(62,32,40,0.03)',
                                display: 'flex',
                                justifyContent: 'space-between',
                                alignItems: 'center'
                            }}>
                                <div className="lora italic text-11px opacity-60">How was the print quality?</div>
                                <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                                    <div style={{ display: 'flex', gap: '4px' }}>
                                        {[1, 2, 3, 4, 5].map(star => (
                                            <svg key={star} width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ cursor: 'pointer', opacity: 0.2 }}>
                                                <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon>
                                            </svg>
                                        ))}
                                    </div>
                                    <button className="btn-signin" style={{ padding: '4px 10px', fontSize: '8px' }}>Rate Vendor</button>
                                </div>
                            </div>
                        )}
                    </div>
                );
            })}
        </div>
    );
}
