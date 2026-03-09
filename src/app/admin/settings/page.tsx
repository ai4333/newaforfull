import React from "react";
import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { Save, Bell, Lock, Globe, Database } from "lucide-react";
export const dynamic = 'force-dynamic';


export default async function AdminSettingsPage() {
    const session = await auth();
    const role = (session?.user as { role?: string } | undefined)?.role;

    if (!session?.user || role !== "ADMIN") {
        redirect('/admin/login?next=/admin/settings');
    }

    return (
        <div className="reveal-up active">
            <header style={{ marginBottom: '2.5rem' }}>
                <h2 className="fraunces text-ink" style={{ fontSize: '2rem', fontWeight: 900, marginBottom: '0.5rem' }}>Platform Covenant</h2>
                <p className="lora italic opacity-60">"Adjusting the fundamental parameters of the AforPrint ecosystem."</p>
            </header>

            <div className="admin-grid-4" style={{ marginBottom: '2.5rem' }}>
                <section className="paper-sheet" style={{ padding: '1.2rem' }}>
                    <div className="label" style={{ fontSize: '8px', marginBottom: '8px' }}>Security Level</div>
                    <div style={{ fontSize: '10px', fontWeight: 900, color: 'var(--wax-red)' }}>MAXIMUM</div>
                </section>
                <section className="paper-sheet" style={{ padding: '1.2rem' }}>
                    <div className="label" style={{ fontSize: '8px', marginBottom: '8px' }}>Global Commission</div>
                    <div className="fraunces text-ink" style={{ fontSize: '1.2rem', fontWeight: 800 }}>11% per Side</div>
                </section>
                <section className="paper-sheet" style={{ padding: '1.2rem' }}>
                    <div className="label" style={{ fontSize: '8px', marginBottom: '8px' }}>API Version</div>
                    <div className="fraunces text-ink" style={{ fontSize: '1.2rem', fontWeight: 800 }}>v2.4 LTS</div>
                </section>
                <section className="paper-sheet" style={{ padding: '1.2rem' }}>
                    <div className="label" style={{ fontSize: '8px', marginBottom: '8px' }}>CDN Latency</div>
                    <div style={{ fontSize: '10px', fontWeight: 900, color: '#10b981' }}>12ms (Optimal)</div>
                </section>
            </div>

            <div className="admin-main-grid">
                <section className="paper-sheet">
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '25px' }}>
                        <Globe size={18} className="text-ink" />
                        <h3 className="fraunces text-ink" style={{ fontSize: '1.2rem' }}>Universal Parameters</h3>
                    </div>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                        <div>
                            <label className="label" style={{ fontSize: '9px', marginBottom: '8px', display: 'block' }}>Platform Name</label>
                            <input className="ink-input" defaultValue="AforPrint: Campus Logistics" style={{ width: '100%', fontSize: '12px' }} />
                        </div>
                        <div>
                            <label className="label" style={{ fontSize: '9px', marginBottom: '8px', display: 'block' }}>Support Email</label>
                            <input className="ink-input" defaultValue="parchment@aforprint.io" style={{ width: '100%', fontSize: '12px' }} />
                        </div>
                        <div style={{ display: 'flex', gap: '20px' }}>
                            <div style={{ flex: 1 }}>
                                <label className="label" style={{ fontSize: '9px', marginBottom: '8px', display: 'block' }}>Max File Size (MB)</label>
                                <input className="ink-input" defaultValue="50" type="number" style={{ width: '100%', fontSize: '12px' }} />
                            </div>
                            <div style={{ flex: 1 }}>
                                <label className="label" style={{ fontSize: '9px', marginBottom: '8px', display: 'block' }}>Default Currency</label>
                                <select className="ink-input" style={{ width: '100%', fontSize: '12px' }}>
                                    <option>INR (₹)</option>
                                    <option>USD ($)</option>
                                </select>
                            </div>
                        </div>
                    </div>

                    <button className="btn-signup" style={{ marginTop: '30px', width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
                        <Save size={14} /> Seal Changes
                    </button>
                </section>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                    <section className="paper-sheet">
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '15px' }}>
                            <Bell size={16} className="text-ink" />
                            <h3 className="fraunces text-ink" style={{ fontSize: '1rem' }}>Notification Relay</h3>
                        </div>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <span style={{ fontSize: '11px' }}>Order Confirmation Emails</span>
                                <input type="checkbox" defaultChecked />
                            </div>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <span style={{ fontSize: '11px' }}>Vendor Payout Alerts</span>
                                <input type="checkbox" defaultChecked />
                            </div>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <span style={{ fontSize: '11px' }}>Platform Maintenance SMS</span>
                                <input type="checkbox" />
                            </div>
                        </div>
                    </section>

                    <section className="paper-sheet" style={{ borderLeft: '3px solid var(--wax-red)' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '15px' }}>
                            <Lock size={16} style={{ color: 'var(--wax-red)' }} />
                            <h3 className="fraunces" style={{ fontSize: '1rem', color: 'var(--wax-red)' }}>Access Control</h3>
                        </div>
                        <p style={{ fontSize: '10px', opacity: 0.6, marginBottom: '15px' }}>Restrict administrative access to specific IP ranges or domains.</p>
                        <button className="btn-signin" style={{ width: '100%', fontSize: '10px' }}>Manage Whitelist</button>
                    </section>

                    <div className="paper-sheet" style={{ background: 'var(--ink-primary)', color: 'white', padding: '15px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '10px' }}>
                            <Database size={14} />
                            <div className="label" style={{ fontSize: '8px', color: 'white' }}>System Health</div>
                        </div>
                        <div style={{ fontSize: '10px' }}>All scripts operating within nominal parameters. Archives are synchronized.</div>
                    </div>
                </div>
            </div>
        </div>
    );
}
