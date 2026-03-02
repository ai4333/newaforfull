"use client";
import React from 'react';

export default function ShopSettingsPage() {
    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <h2 className="fraunces text-ink" style={{ fontSize: '1.5rem', fontWeight: 700 }}>Shop Settings</h2>
                <button className="btn-signup" style={{ fontSize: '11px', padding: '8px 24px' }}>Save All Changes</button>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1.5fr 1fr', gap: '32px' }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
                    {/* ── GENERAL INFO ── */}
                    <section className="paper-sheet" style={{ padding: '24px' }}>
                        <h3 className="fraunces text-ink mb-6" style={{ fontSize: '1.1rem' }}>General Information</h3>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                            <div style={{ gridColumn: 'span 2' }}>
                                <label className="ink-label">Shop Name</label>
                                <input type="text" className="ink-input" defaultValue="University Print Hub" />
                            </div>
                            <div>
                                <label className="ink-label">Owner Name</label>
                                <input type="text" className="ink-input" defaultValue="Amit Sharma" />
                            </div>
                            <div>
                                <label className="ink-label">Contact Number</label>
                                <input type="tel" className="ink-input" defaultValue="+91 98765 43210" />
                            </div>
                            <div style={{ gridColumn: 'span 2' }}>
                                <label className="ink-label">Shop Address</label>
                                <textarea className="ink-input" rows={2} defaultValue="Main Campus, Student Plaza, Building B, Ground Floor"></textarea>
                            </div>
                        </div>
                    </section>

                    {/* ── OPERATIONAL HOURS ── */}
                    <section className="paper-sheet" style={{ padding: '24px' }}>
                        <h3 className="fraunces text-ink mb-6" style={{ fontSize: '1.1rem' }}>Business Hours</h3>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                            {["Monday - Friday", "Saturday", "Sunday"].map((day, i) => (
                                <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                    <span className="lora" style={{ fontSize: '13px', fontWeight: 600 }}>{day}</span>
                                    <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                                        <input type="text" className="ink-input text-center" defaultValue="09:00 AM" style={{ width: '90px', padding: '4px' }} />
                                        <span className="label" style={{ fontSize: '10px' }}>to</span>
                                        <input type="text" className="ink-input text-center" defaultValue="07:00 PM" style={{ width: '90px', padding: '4px' }} />
                                    </div>
                                </div>
                            ))}
                        </div>
                    </section>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
                    {/* ── ORDER CONTROLS ── */}
                    <section className="paper-sheet" style={{ padding: '24px' }}>
                        <h3 className="fraunces text-ink mb-6" style={{ fontSize: '1rem' }}>Order Management</h3>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <div>
                                    <div className="nav-text" style={{ fontSize: '13px', fontWeight: 700 }}>Accepting Orders</div>
                                    <div className="label" style={{ fontSize: '9px', opacity: 0.5 }}>Disable to pause new incoming jobs</div>
                                </div>
                                <div style={{ width: '36px', height: '18px', background: '#2d5a27', borderRadius: '9px' }}></div>
                            </div>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <div>
                                    <div className="nav-text" style={{ fontSize: '13px', fontWeight: 700 }}>Express Delivery</div>
                                    <div className="label" style={{ fontSize: '9px', opacity: 0.5 }}>Toggle same-day priority service</div>
                                </div>
                                <div style={{ width: '36px', height: '18px', background: '#2d5a27', borderRadius: '9px' }}></div>
                            </div>
                            <div>
                                <label className="ink-label">Delivery Radius (KM)</label>
                                <input type="number" className="ink-input" defaultValue="2.5" style={{ width: '80px' }} />
                            </div>
                        </div>
                    </section>

                    {/* ── DANGER ZONE ── */}
                    <section className="paper-sheet" style={{ padding: '24px', border: '1px solid rgba(139,30,43,0.1)' }}>
                        <h3 className="fraunces text-ink mb-2" style={{ fontSize: '1rem', color: 'var(--wax-red)' }}>Danger Zone</h3>
                        <p className="lora italic opacity-50 mb-4" style={{ fontSize: '11px' }}>Temporarily closed mode or shop deletion.</p>
                        <button className="btn-signin w-full" style={{ fontSize: '10px', color: 'var(--wax-red)', borderColor: 'rgba(139,30,43,0.1)' }}>Go Offline Temporarily</button>
                    </section>
                </div>
            </div>
        </div>
    );
}
