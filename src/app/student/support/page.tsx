"use client";
import React from 'react';

export default function SupportPage() {
    const faqs = [
        { q: "How long are my files stored?", a: "Files are automatically purged from our printing nodes 24 hours after order completion for security." },
        { q: "Can I cancel an order?", a: "Orders can be canceled until the vendor marks them as 'Printing'. Check your order status in the history tab." },
        { q: "What if the print quality is poor?", a: "Use the 'Report Issue' button on your order. We'll facilitate a refund or reprint with the vendor." },
    ];

    return (
        <div className="dash-container">
            <div style={{ display: 'grid', gridTemplateColumns: 'minmax(300px, 1fr) 1.5fr', gap: '32px', alignItems: 'start' }}>
                {/* ── CONTACT OPTIONS ── */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                    <section className="paper-sheet">
                        <h3 className="fraunces text-ink mb-4" style={{ fontSize: '1.1rem', fontWeight: 700 }}>Direct Support</h3>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                            <div className="paper-sheet" style={{ padding: '16px', background: 'rgba(62,32,40,0.02)', cursor: 'pointer' }}>
                                <div className="nav-text" style={{ fontSize: '13px', fontWeight: 700 }}>Live Chat</div>
                                <div className="label" style={{ fontSize: '8px', opacity: 0.5 }}>Average response: 2 mins</div>
                            </div>
                            <div className="paper-sheet" style={{ padding: '16px', background: 'rgba(62,32,40,0.02)', cursor: 'pointer' }}>
                                <div className="nav-text" style={{ fontSize: '13px', fontWeight: 700 }}>Email Support</div>
                                <div className="label" style={{ fontSize: '8px', opacity: 0.5 }}>support@aforprint.com</div>
                            </div>
                        </div>
                    </section>

                    <section className="paper-sheet" style={{ background: 'var(--bg-darker)', color: 'white', border: 'none' }}>
                        <h3 className="fraunces mb-2" style={{ fontSize: '1rem' }}>Emergency Contact</h3>
                        <p className="lora italic opacity-60" style={{ fontSize: '11px' }}>
                            "For urgent campus-wide printing outages or payment failures."
                        </p>
                        <div className="nav-text mt-4" style={{ fontSize: '14px', letterSpacing: '0.05em' }}>+91 1800-PRINT-HELP</div>
                    </section>
                </div>

                {/* ── FAQ ── */}
                <div className="paper-sheet">
                    <h3 className="fraunces text-ink mb-6" style={{ fontSize: '1.25rem', fontWeight: 700 }}>Frequently Asked</h3>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                        {faqs.map((faq, i) => (
                            <div key={i} style={{ borderBottom: i === faqs.length - 1 ? 'none' : '1px solid rgba(62,32,40,0.05)', paddingBottom: '20px' }}>
                                <div className="nav-text" style={{ fontSize: '13px', fontWeight: 700, marginBottom: '6px' }}>{faq.q}</div>
                                <p className="lora" style={{ fontSize: '12px', opacity: 0.7, lineHeight: '1.6' }}>{faq.a}</p>
                            </div>
                        ))}
                    </div>
                    <button className="btn-signup w-full mt-6" style={{ fontSize: '10px' }}>Open Support Ticket</button>
                </div>
            </div>
        </div>
    );
}
