"use client";
import React from 'react';

export default function AnalyticsPage() {
    const metrics = [
        { label: "B&W vs Color", data: "82% B&W", desc: "Mainly lecture notes" },
        { label: "Top Paper Size", data: "A4 Regular", desc: "95% of total volume" },
        { label: "Peak Order Time", data: "11 AM - 1 PM", desc: "Highest traffic window" },
        { label: "Avg. Turnaround", data: "14.2 Mins", desc: "Time to mark Ready" },
    ];

    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <h2 className="fraunces text-ink" style={{ fontSize: '1.5rem', fontWeight: 700 }}>Business Analytics</h2>
                <select className="paper-sheet" style={{ padding: '8px 16px', fontSize: '11px', height: 'auto' }}>
                    <option>Last 30 Days</option>
                    <option>Year to Date</option>
                </select>
            </div>

            {/* ── METRICS GRID ── */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '20px' }}>
                {metrics.map((m, i) => (
                    <div key={i} className="paper-sheet" style={{ padding: '24px', textAlign: 'center' }}>
                        <div className="label" style={{ fontSize: '9px', opacity: 0.5, marginBottom: '8px' }}>{m.label}</div>
                        <div className="fraunces text-ink" style={{ fontSize: '1.4rem', fontWeight: 900 }}>{m.data}</div>
                        <div className="lora italic opacity-40 mt-2" style={{ fontSize: '10px' }}>"{m.desc}"</div>
                    </div>
                ))}
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1.5fr 1fr', gap: '32px' }}>
                {/* ── VOLUME CHART PLACEHOLDER ── */}
                <section className="paper-sheet" style={{ padding: '32px', height: '350px', display: 'flex', flexDirection: 'column' }}>
                    <h3 className="fraunces text-ink mb-8" style={{ fontSize: '1.1rem' }}>Order Volume Distribution</h3>
                    <div style={{ flex: 1, display: 'flex', alignItems: 'flex-end', gap: '16px', borderBottom: '1px solid rgba(0,0,0,0.1)', paddingBottom: '12px' }}>
                        {[40, 70, 45, 90, 65, 80, 50].map((h, i) => (
                            <div key={i} style={{ flex: 1, background: 'var(--wax-red)', height: `${h}%`, opacity: 0.15 + (h / 100), borderRadius: '4px 4px 0 0' }}></div>
                        ))}
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '12px' }}>
                        {["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"].map((d, i) => (
                            <span key={i} className="label" style={{ fontSize: '9px', opacity: 0.5 }}>{d}</span>
                        ))}
                    </div>
                </section>

                {/* ── TOP CUSTOMERS ── */}
                <section className="paper-sheet" style={{ padding: '24px' }}>
                    <h3 className="fraunces text-ink mb-6" style={{ fontSize: '1rem' }}>Top Customers</h3>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                        {[
                            { name: "Nikhil Sridhara", count: 18 },
                            { name: "Sarah Jenkins", count: 14 },
                            { name: "Rahul Verma", count: 12 },
                            { name: "Priya Das", count: 9 },
                        ].map((c, i) => (
                            <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <div className="nav-text" style={{ fontSize: '13px', fontWeight: 700 }}>{c.name}</div>
                                <div className="label" style={{ fontSize: '10px' }}>{c.count} Orders</div>
                            </div>
                        ))}
                    </div>
                </section>
            </div>
        </div>
    );
}
