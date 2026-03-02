"use client";
import React from 'react';

export default function ProfilePage() {
    const handleLogout = () => {
        localStorage.removeItem('userRole');
        localStorage.removeItem('isLoggedIn');
        window.location.href = '/auth/login';
    };

    return (
        <div className="dash-container">
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '32px', alignItems: 'start' }}>
                {/* ── PROFILE INFO ── */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                    <div className="paper-sheet" style={{ textAlign: 'center', padding: '32px 20px' }}>
                        <div className="founder-monogram" style={{ width: '80px', height: '80px', fontSize: '32px', margin: '0 auto 16px' }}>N</div>
                        <h3 className="fraunces text-ink" style={{ fontSize: '1.25rem', fontWeight: 700 }}>Nikhil Sridhara</h3>
                        <div className="label" style={{ fontSize: '9px', opacity: 0.5 }}>Member since 2024</div>
                        <button onClick={handleLogout} className="btn-signin" style={{ marginTop: '24px', width: '100%', color: 'var(--wax-red)', borderColor: 'rgba(139,30,43,0.15)', fontSize: '10px' }}>Logout Account</button>
                    </div>
                </div>

                {/* ── SETTINGS ── */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                    <section className="paper-sheet">
                        <h4 className="fraunces text-ink mb-6" style={{ fontSize: '1rem', fontWeight: 700 }}>Personal Credentials</h4>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                            <div style={{ gridColumn: 'span 1' }}>
                                <label className="ink-label">Full Name</label>
                                <input type="text" className="ink-input" defaultValue="Nikhil Sridhara" />
                            </div>
                            <div style={{ gridColumn: 'span 1' }}>
                                <label className="ink-label">Phone Number</label>
                                <input type="tel" className="ink-input" defaultValue="+91 98765 43210" />
                            </div>
                            <div style={{ gridColumn: 'span 2' }}>
                                <label className="ink-label">Email Address</label>
                                <input type="email" className="ink-input" defaultValue="nikhil.s@university.edu" disabled style={{ opacity: 0.5, background: 'rgba(62,32,40,0.05)' }} />
                            </div>
                        </div>
                    </section>

                    <section className="paper-sheet">
                        <h4 className="fraunces text-ink mb-6" style={{ fontSize: '1rem', fontWeight: 700 }}>Printing Preferences</h4>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                            <div>
                                <label className="ink-label">Default Size</label>
                                <select className="ink-input"><option>A4</option><option>Legal</option></select>
                            </div>
                            <div>
                                <label className="ink-label">Color Mode</label>
                                <select className="ink-input"><option>B&W</option><option>Color</option></select>
                            </div>
                        </div>
                    </section>

                    <div className="text-right">
                        <button className="btn-signup" style={{ padding: '8px 32px' }}>Update Profile</button>
                    </div>
                </div>
            </div>
        </div>
    );
}
