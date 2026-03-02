"use client";
import React from 'react';

export default function InventoryPage() {
    const stockItems = [
        { name: "A4 80GSM Paper", category: "Paper", stock: 4500, min: 1000, unit: "Sheets" },
        { name: "A3 100GSM Paper", category: "Paper", stock: 850, min: 500, unit: "Sheets" },
        { name: "Spiral Coils (10mm)", category: "Binding", stock: 45, min: 100, unit: "Units", alert: true },
        { name: "Soft Bind Covers", category: "Binding", stock: 120, min: 50, unit: "Units" },
        { name: "Lamination Film (A4)", category: "Lamination", stock: 300, min: 100, unit: "Sheets" },
        { name: "Toner Cartridge (B&W)", category: "Inks", stock: 2, min: 1, unit: "Units" },
    ];

    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <h2 className="fraunces text-ink" style={{ fontSize: '1.5rem', fontWeight: 700 }}>Products & Inventory</h2>
                <button className="btn-signup" style={{ fontSize: '11px', padding: '8px 24px' }}>Update Stock</button>
            </div>

            {/* ── ALERTS ── */}
            <div className="paper-sheet" style={{ padding: '16px', border: '1px solid rgba(139,30,43,0.2)', background: 'rgba(139,30,43,0.02)', display: 'flex', alignItems: 'center', gap: '16px' }}>
                <span style={{ fontSize: '20px', display: 'flex', alignItems: 'center' }}>
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ color: 'var(--wax-red)' }}>
                        <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"></path>
                        <line x1="12" y1="9" x2="12" y2="13"></line>
                        <line x1="12" y1="17" x2="12.01" y2="17"></line>
                    </svg>
                </span>
                <div className="nav-text" style={{ fontSize: '13px', color: 'var(--wax-red)', fontWeight: 700 }}>
                    Low Stock Alert: Spiral Coils (10mm) is below minimum level.
                </div>
            </div>

            <section className="paper-sheet">
                <table className="w-full text-left" style={{ borderCollapse: 'collapse' }}>
                    <thead>
                        <tr style={{ borderBottom: '1px solid rgba(0,0,0,0.05)', background: 'rgba(0,0,0,0.02)' }}>
                            <th className="label" style={{ padding: '12px 16px', fontSize: '9px' }}>ITEM NAME</th>
                            <th className="label" style={{ padding: '12px 16px', fontSize: '9px' }}>CATEGORY</th>
                            <th className="label" style={{ padding: '12px 16px', fontSize: '9px' }}>STOCK LEVEL</th>
                            <th className="label" style={{ padding: '12px 16px', fontSize: '9px' }}>MINIMUM</th>
                            <th className="label" style={{ padding: '12px 16px', fontSize: '9px' }}>STATUS</th>
                        </tr>
                    </thead>
                    <tbody>
                        {stockItems.map((item, i) => (
                            <tr key={i} style={{ borderBottom: '1px solid rgba(0,0,0,0.03)' }}>
                                <td className="nav-text" style={{ padding: '16px', fontSize: '13px', fontWeight: 700 }}>{item.name}</td>
                                <td className="label" style={{ padding: '16px', fontSize: '10px', opacity: 0.5 }}>{item.category}</td>
                                <td className="lora" style={{ padding: '16px', fontSize: '13px' }}>{item.stock} {item.unit}</td>
                                <td className="lora" style={{ padding: '16px', fontSize: '11px', opacity: 0.5 }}>{item.min} {item.unit}</td>
                                <td style={{ padding: '16px' }}>
                                    <span style={{
                                        fontSize: '9px',
                                        fontWeight: 900,
                                        padding: '4px 8px',
                                        borderRadius: '4px',
                                        background: item.alert ? 'rgba(139,30,43,0.1)' : 'rgba(45,90,39,0.1)',
                                        color: item.alert ? 'var(--wax-red)' : '#2d5a27'
                                    }}>
                                        {item.alert ? "LOW STOCK" : "OPTIMAL"}
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
