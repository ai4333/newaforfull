"use client";
import React from 'react';

export default function PricingPage() {
    const paperPrices = [
        { size: "A4 Regular", bw: "₹1.50", color: "₹8.00" },
        { size: "A3 Large", bw: "₹4.00", color: "₹15.00" },
        { size: "A2 Poster", bw: "₹10.00", color: "₹45.00" },
        { size: "A5 Booklet", bw: "₹1.00", color: "₹5.00" },
        { size: "Legal", bw: "₹1.75", color: "₹10.00" },
        { size: "Letter", bw: "₹1.50", color: "₹8.00" },
    ];

    const gsmPrices = [
        { gsm: "70 GSM", add: "₹0.00" },
        { gsm: "75 GSM", add: "+₹0.20" },
        { gsm: "80 GSM", add: "+₹0.50" },
        { gsm: "100 GSM", add: "+₹1.50" },
        { gsm: "150 GSM", add: "+₹3.00" },
        { gsm: "200+ GSM", add: "+₹6.00" },
    ];

    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <h2 className="fraunces text-ink" style={{ fontSize: '1.5rem', fontWeight: 700 }}>Pricing & Services</h2>
                <button className="btn-signup" style={{ fontSize: '11px', padding: '8px 24px' }}>Save Changes</button>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '32px' }}>
                {/* ── PAPER PRICING ── */}
                <section className="paper-sheet" style={{ padding: '24px' }}>
                    <h3 className="fraunces text-ink mb-6" style={{ fontSize: '1.1rem' }}>Standard Printing Rates</h3>
                    <table className="w-full" style={{ borderCollapse: 'collapse' }}>
                        <thead>
                            <tr style={{ borderBottom: '1px solid rgba(0,0,0,0.05)' }}>
                                <th className="label text-left" style={{ padding: '12px', fontSize: '9px' }}>PAPER SIZE</th>
                                <th className="label text-left" style={{ padding: '12px', fontSize: '9px' }}>B&W (PER PAGE)</th>
                                <th className="label text-left" style={{ padding: '12px', fontSize: '9px' }}>COLOR (PER PAGE)</th>
                            </tr>
                        </thead>
                        <tbody>
                            {paperPrices.map((row, i) => (
                                <tr key={i} style={{ borderBottom: '1px solid rgba(0,0,0,0.03)' }}>
                                    <td className="nav-text" style={{ padding: '12px', fontSize: '13px' }}>{row.size}</td>
                                    <td style={{ padding: '12px' }}><input type="text" className="ink-input" defaultValue={row.bw} style={{ width: '80px', padding: '4px 8px', fontSize: '12px' }} /></td>
                                    <td style={{ padding: '12px' }}><input type="text" className="ink-input" defaultValue={row.color} style={{ width: '80px', padding: '4px 8px', fontSize: '12px' }} /></td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </section>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
                    {/* ── GSM MODIFIERS ── */}
                    <section className="paper-sheet" style={{ padding: '24px' }}>
                        <h3 className="fraunces text-ink mb-4" style={{ fontSize: '1rem' }}>GSM Add-ons</h3>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                            {gsmPrices.map((row, i) => (
                                <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                    <span className="lora" style={{ fontSize: '12px' }}>{row.gsm}</span>
                                    <input type="text" className="ink-input" defaultValue={row.add} style={{ width: '70px', padding: '2px 8px', fontSize: '11px' }} />
                                </div>
                            ))}
                        </div>
                    </section>

                    {/* ── FINISHING ── */}
                    <section className="paper-sheet" style={{ padding: '24px' }}>
                        <h3 className="fraunces text-ink mb-4" style={{ fontSize: '1rem' }}>Binding & Finishing</h3>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                            {["Spiral Binding", "Soft Binding", "Hard Binding", "Lamination"].map((item, i) => (
                                <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                    <span className="nav-text" style={{ fontSize: '12px', fontWeight: 700 }}>{item}</span>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                        <input type="text" className="ink-input" defaultValue="₹25.00" style={{ width: '70px', padding: '2px 8px', fontSize: '11px' }} />
                                        <div style={{ width: '30px', height: '16px', background: '#2d5a27', borderRadius: '8px' }}></div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </section>
                </div>
            </div>
        </div>
    );
}
