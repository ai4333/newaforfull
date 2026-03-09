"use client";
import React, { useEffect, useMemo, useState } from 'react';

type PayoutRow = {
    id: string;
    createdAt: string;
    paidAt: string | null;
    amount: number;
    status: "PENDING" | "PAID";
};

export default function EarningsPage() {
    const [payouts, setPayouts] = useState<PayoutRow[]>([]);
    const [pendingAmount, setPendingAmount] = useState(0);
    const [lifetimeEarnings, setLifetimeEarnings] = useState(0);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const load = async () => {
            try {
                const res = await fetch('/api/vendor/payouts');
                if (res.ok) {
                    const data = await res.json();
                    setPayouts(data.payouts || []);
                    setPendingAmount(data.pendingAmount || 0);
                    setLifetimeEarnings(data.lifetimeEarnings || 0);
                }
            } finally {
                setLoading(false);
            }
        };
        load();
    }, []);

    const monthSales = useMemo(() => {
        const currentMonth = new Date().getMonth();
        return payouts
            .filter((row) => new Date(row.createdAt).getMonth() === currentMonth)
            .reduce((sum, row) => sum + row.amount, 0);
    }, [payouts]);

    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
            <h2 className="fraunces text-ink" style={{ fontSize: '1.5rem', fontWeight: 700 }}>Earnings & Payouts</h2>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '24px' }}>
                <div className="paper-sheet" style={{ padding: '24px' }}>
                    <div className="label" style={{ fontSize: '9px', opacity: 0.5, marginBottom: '8px' }}>PENDING PAYOUT</div>
                    <div className="fraunces text-ink" style={{ fontSize: '1.8rem', fontWeight: 900 }}>₹{pendingAmount.toFixed(2)}</div>
                    <div className="label" style={{ fontSize: '10px', marginTop: '12px', color: '#2d5a27' }}>Available for withdrawal</div>
                </div>
                <div className="paper-sheet" style={{ padding: '24px' }}>
                    <div className="label" style={{ fontSize: '9px', opacity: 0.5, marginBottom: '8px' }}>TOTAL SALES (MONTH)</div>
                    <div className="fraunces text-ink" style={{ fontSize: '1.8rem', fontWeight: 900 }}>₹{monthSales.toFixed(2)}</div>
                    <div className="label" style={{ fontSize: '10px', marginTop: '12px', opacity: 0.5 }}>From payout records this month</div>
                </div>
                <div className="paper-sheet" style={{ padding: '24px', background: 'var(--ink-primary)', color: 'white' }}>
                    <div className="label" style={{ fontSize: '9px', opacity: 0.6, marginBottom: '8px', color: 'white' }}>NET LIFETIME EARNINGS</div>
                    <div className="fraunces" style={{ fontSize: '1.8rem', fontWeight: 900 }}>₹{lifetimeEarnings.toFixed(2)}</div>
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
                        {loading ? (
                            <tr><td style={{ padding: '16px 24px' }} colSpan={5}>Loading payouts...</td></tr>
                        ) : payouts.length === 0 ? (
                            <tr><td style={{ padding: '16px 24px' }} colSpan={5}>No payout records yet.</td></tr>
                        ) : (
                            payouts.map((row) => (
                                <tr key={row.id} style={{ borderBottom: '1px solid rgba(0,0,0,0.03)' }}>
                                    <td className="nav-text" style={{ padding: '16px 24px', fontSize: '12px', fontWeight: 700 }}>#{row.id.slice(0, 8)}</td>
                                    <td className="lora" style={{ padding: '16px 24px', fontSize: '13px' }}>{new Date(row.createdAt).toLocaleDateString()}</td>
                                    <td className="fraunces" style={{ padding: '16px 24px', fontSize: '14px', fontWeight: 700 }}>₹{row.amount.toFixed(2)}</td>
                                    <td className="label" style={{ padding: '16px 24px', fontSize: '10px', opacity: 0.6 }}>{row.status === 'PAID' ? 'Transfer Complete' : 'Awaiting Transfer'}</td>
                                    <td style={{ padding: '16px 24px' }}>
                                        <span style={{ fontSize: '9px', fontWeight: 900, padding: '4px 8px', borderRadius: '4px', background: row.status === 'PAID' ? 'rgba(45,90,39,0.1)' : 'rgba(139,30,43,0.1)', color: row.status === 'PAID' ? '#2d5a27' : '#8b1e2b' }}>
                                            {row.status}
                                        </span>
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </section>
        </div>
    );
}
