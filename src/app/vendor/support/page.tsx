"use client";
import React from 'react';

export default function VendorSupportPage() {
    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
            <h2 className="fraunces text-ink" style={{ fontSize: '1.5rem', fontWeight: 700 }}>Vendor Support</h2>

            <div style={{ display: 'grid', gridTemplateColumns: 'minmax(300px, 1fr) 1.5fr', gap: '32px', alignItems: 'start' }}>
                {/* ── CONTACT OPTIONS ── */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                    <section className="paper-sheet">
                        <h3 className="fraunces text-ink mb-4" style={{ fontSize: '1.1rem', fontWeight: 700 }}>Administrator Help</h3>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                            <div className="paper-sheet" style={{ padding: '20px', background: 'rgba(62,32,40,0.02)', cursor: 'pointer' }}>
                                <div className="nav-text" style={{ fontSize: '13px', fontWeight: 700 }}>Priority Seller Chat</div>
                                <div className="label" style={{ fontSize: '9px', opacity: 0.5 }}>Dedicated line for urgent payout issues</div>
                            </div>
                            <div className="paper-sheet" style={{ padding: '20px', background: 'rgba(62,32,40,0.02)', cursor: 'pointer' }}>
                                <div className="nav-text" style={{ fontSize: '13px', fontWeight: 700 }}>Technical Desk</div>
                                <div className="label" style={{ fontSize: '9px', opacity: 0.5 }}>api-support@aforprint.com</div>
                            </div>
                        </div>
                    </section>

                    <section className="paper-sheet" style={{ background: 'var(--bg-darker)', color: 'white', border: 'none' }}>
                        <h3 className="fraunces mb-2" style={{ fontSize: '1rem' }}>Emergency Hotline</h3>
                        <p className="lora italic opacity-60" style={{ fontSize: '11px' }}>
                            "For critical server outages or security concerns."
                        </p>
                        <div className="nav-text mt-4" style={{ fontSize: '16px', letterSpacing: '0.05em' }}>+91 1800-SELL-HELP</div>
                    </section>
                </div>

                {/* ── FAQ ── */}
                <div className="paper-sheet" style={{ padding: '32px' }}>
                    <h3 className="fraunces text-ink mb-6" style={{ fontSize: '1.25rem', fontWeight: 700 }}>Vendor FAQ</h3>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
                        {[
                            { q: "How are commission rates calculated?", a: "Standard platform commission is 15% on gross sales, covering gateway fees and support." },
                            { q: "When do I get paid?", a: "Payouts are processed every Tuesday for the previous week's completed orders." },
                            { q: "Can I dispute student reviews?", a: "Yes, use the 'Report Review' flag. Admin will verify if the review violates policies." },
                        ].map((faq, i) => (
                            <div key={i} style={{ borderBottom: i === 2 ? 'none' : '1px solid rgba(62,32,40,0.05)', paddingBottom: '20px' }}>
                                <div className="nav-text" style={{ fontSize: '13px', fontWeight: 700, marginBottom: '6px' }}>{faq.q}</div>
                                <p className="lora" style={{ fontSize: '12px', opacity: 0.7, lineHeight: '1.6' }}>{faq.a}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}
