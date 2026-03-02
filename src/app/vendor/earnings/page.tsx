"use client";
import React from 'react';

export default function EarningsPage() {
    const payouts = [
        { id: "PAY-99281", date: "Oct 28, 2025", amount: "₹4,200", status: "COMPLETED", method: "UPI-Direct" },
        { id: "PAY-99215", date: "Oct 21, 2025", amount: "₹3,850", status: "COMPLETED", method: "Bank Transfer" },
        { id: "PAY-99150", date: "Oct 14, 2025", amount: "₹5,100", status: "COMPLETED", method: "UPI-Direct" },
    ];

    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
            <h2 className="fraunces text-ink" style={{ fontSize: '1.5rem', fontWeight: 700 }}>Earnings & Payouts</h2>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '24px' }}>
                <div className="paper-sheet" style={{ padding: '24px' }}>
                    <div className="label" style={{ fontSize: '9px', opacity: 0.5, marginBottom: '8px' }}>PENDING PAYOUT</div>
                    <div className="fraunces text-ink" style={{ fontSize: '1.8rem', fontWeight: 900 }}>₹2,450.00</div>
                    <div className="label" style={{ fontSize: '10px', marginTop: '12px', color: '#2d5a27' }}>Available for withdrawal</div>
                </div>
                <div className="paper-sheet" style={{ padding: '24px' }}>
                    <div className="label" style={{ fontSize: '9px', opacity: 0.5, marginBottom: '8px' }}>TOTAL SALES (MONTH)</div>
                    <div className="fraunces text-ink" style={{ fontSize: '1.8rem', fontWeight: 900 }}>₹12,400.75</div>
                    <div className="label" style={{ fontSize: '10px', marginTop: '12px', opacity: 0.5 }}>After commission (15%)</div>
                </div>
                <div className="paper-sheet" style={{ padding: '24px', background: 'var(--ink-primary)', color: 'white' }}>
                    <div className="label" style={{ fontSize: '9px', opacity: 0.6, marginBottom: '8px', color: 'white' }}>NET LIFETIME EARNINGS</div>
                    <div className="fraunces" style={{ fontSize: '1.8rem', fontWeight: 900 }}>₹48,210.00</div>
                    <button className="btn-signup w-full mt-4" style={{ fontSize: '10px', borderColor: 'rgba(255,255,255,0.2)' }}>Payout History Report</button>
                </div>
            </div>

            <section className="paper-sheet">
                <div style={{ padding: '20px 24px', borderBottom: '1px solid rgba(0,0,0,0.05)' }}>
                    <h3 className="fraunces text-ink" style={{ fontSize: '1.1rem' }}>Payout History</h3>
                </div>
                <table className="w-full text-left" style={{ borderCollapse: 'collapse' }}>
                    <thead>
                        <tr style={{ borderBottom: '1px solid rgba(0,0,0,0.05)', background: 'rgba(0,0,0,0.02)' }}>
                            <th className="label" style={{ padding: '12px 24px', fontSize: '9px' }}>TRANSACTION ID</th>
                            <th className="label" style={{ padding: '12px 24px', fontSize: '9px' }}>DATE</th>
                            <th className="label" style={{ padding: '12px 24px', fontSize: '9px' }}>AMOUNT</th>
                            <th className="label" style={{ padding: '12px 24px', fontSize: '9px' }}>METHOD</th>
                            <th className="label" style={{ padding: '12px 24px', fontSize: '9px' }}>STATUS</th>
                        </tr>
                    </thead>
                    <tbody>
                        {payouts.map((row, i) => (
                            <tr key={i} style={{ borderBottom: '1px solid rgba(0,0,0,0.03)' }}>
                                <td className="nav-text" style={{ padding: '16px 24px', fontSize: '12px', fontWeight: 700 }}>{row.id}</td>
                                <td className="lora" style={{ padding: '16px 24px', fontSize: '13px' }}>{row.date}</td>
                                <td className="fraunces" style={{ padding: '16px 24px', fontSize: '14px', fontWeight: 700 }}>{row.amount}</td>
                                <td className="label" style={{ padding: '16px 24px', fontSize: '10px', opacity: 0.6 }}>{row.method}</td>
                                <td style={{ padding: '16px 24px' }}>
                                    <span style={{ fontSize: '9px', fontWeight: 900, padding: '4px 8px', borderRadius: '4px', background: 'rgba(45,90,39,0.1)', color: '#2d5a27' }}>
                                        {row.status}
                                    </span>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </section>
        </div>
    );
}
