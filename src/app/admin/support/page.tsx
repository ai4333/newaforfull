import React from "react";
import { prisma } from "@/lib/prisma";
import { format } from "date-fns";
import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { Mail, MessageSquare, AlertCircle, ShieldAlert } from "lucide-react";
export const dynamic = 'force-dynamic';


export default async function AdminSupportPage() {
    const session = await auth();
    const role = (session?.user as { role?: string } | undefined)?.role;

    if (!session?.user || role !== "ADMIN") {
        redirect('/admin/login?next=/admin/support');
    }

    // Mocking support tickets for now
    const disputes = await prisma.order.findMany({
        where: { status: 'DISPUTED' },
        include: { student: true, vendor: true },
        orderBy: { updatedAt: 'desc' }
    });

    return (
        <div className="reveal-up active">
            <header style={{ marginBottom: '2.5rem' }}>
                <h2 className="fraunces text-ink" style={{ fontSize: '2rem', fontWeight: 900, marginBottom: '0.5rem' }}>Support & Resolution</h2>
                <p className="lora italic opacity-60">"Mediating conflicts and upholding the platform's covenant of trust."</p>
            </header>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '1.5rem', marginBottom: '2.5rem' }}>
                <section className="paper-sheet" style={{ padding: '1.2rem' }}>
                    <div className="label" style={{ fontSize: '8px', marginBottom: '8px' }}>Open Disputes</div>
                    <div className="fraunces text-ink" style={{ fontSize: '1.5rem', fontWeight: 800 }}>{disputes.length}</div>
                </section>
                <section className="paper-sheet" style={{ padding: '1.2rem' }}>
                    <div className="label" style={{ fontSize: '8px', marginBottom: '8px' }}>Avg Resolution Time</div>
                    <div className="fraunces text-ink" style={{ fontSize: '1.5rem', fontWeight: 800 }}>4.2 hrs</div>
                </section>
                <section className="paper-sheet" style={{ padding: '1.2rem' }}>
                    <div className="label" style={{ fontSize: '8px', marginBottom: '8px' }}>Support Rating</div>
                    <div className="fraunces text-ink" style={{ fontSize: '1.5rem', fontWeight: 800 }}>4.9/5</div>
                </section>
                <section className="paper-sheet" style={{ padding: '1.2rem' }}>
                    <div className="label" style={{ fontSize: '8px', marginBottom: '8px' }}>Trust Safety Index</div>
                    <div className="fraunces text-ink" style={{ fontSize: '1.5rem', fontWeight: 800 }}>99.1%</div>
                </section>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '2rem' }}>
                <section className="paper-sheet">
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                        <h3 className="fraunces text-ink" style={{ fontSize: '1.2rem' }}>Dispute Queue</h3>
                        <span style={{ fontSize: '9px', fontWeight: 800, color: 'var(--wax-red)' }}>{disputes.length} PRIORITY ITEMS</span>
                    </div>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                        {disputes.length === 0 ? (
                            <div style={{ padding: '40px', textAlign: 'center', opacity: 0.4 }} className="lora italic">All disputes resolved. Harmony prevails.</div>
                        ) : disputes.map(d => (
                            <div key={d.id} style={{ borderBottom: '1px dashed rgba(62,32,40,0.1)', paddingBottom: '15px' }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                                    <div style={{ fontWeight: 800, fontSize: '13px' }} className="text-ink">#{d.id.slice(0, 8)}</div>
                                    <div style={{ fontSize: '9px', color: 'var(--wax-red)', fontWeight: 900 }}>REQUIRES ACTION</div>
                                </div>
                                <div style={{ fontSize: '10px', opacity: 0.7, marginBottom: '8px' }}>
                                    Conflict between <span style={{ fontWeight: 700 }}>{d.student.name}</span> and <span style={{ fontWeight: 700 }}>{d.vendor.shopName}</span>.
                                    Dispute flagged on {format(new Date(d.updatedAt), "PPP")}.
                                </div>
                                <div style={{ display: 'flex', gap: '10px' }}>
                                    <button className="btn-signin" style={{ padding: '4px 8px', fontSize: '9px' }}>View Evidence</button>
                                    <button className="btn-signin" style={{ padding: '4px 8px', fontSize: '9px', background: 'white', color: 'var(--wax-red)', border: '1px solid var(--wax-red)' }}>Intervene</button>
                                </div>
                            </div>
                        ))}
                    </div>
                </section>

                <section>
                    <div className="paper-sheet mb-6">
                        <h4 className="fraunces mb-4" style={{ fontSize: '1rem' }}>Global Bulletin</h4>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                            <div style={{ display: 'flex', gap: '12px' }}>
                                <ShieldAlert size={16} style={{ color: 'var(--wax-red)', flexShrink: 0 }} />
                                <div>
                                    <div style={{ fontSize: '11px', fontWeight: 800 }} className="text-ink">Security Alert</div>
                                    <div style={{ fontSize: '9px', opacity: 0.6 }}>Unusual login activity detected in North Campus hub.</div>
                                </div>
                            </div>
                            <div style={{ display: 'flex', gap: '12px' }}>
                                <AlertCircle size={16} style={{ color: 'var(--ink-primary)', flexShrink: 0 }} />
                                <div>
                                    <div style={{ fontSize: '11px', fontWeight: 800 }} className="text-ink">Maintenance Scheduled</div>
                                    <div style={{ fontSize: '9px', opacity: 0.6 }}>Database cleanup on Sunday, 02:00 AM.</div>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="paper-sheet" style={{ background: 'var(--ink-primary)', color: 'white' }}>
                        <h4 className="fraunces mb-4" style={{ fontSize: '1rem' }}>Support Hotlinks</h4>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                            <div style={{ fontSize: '10px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                                <Mail size={12} /> admin@aforprint.com
                            </div>
                            <div style={{ fontSize: '10px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                                <MessageSquare size={12} /> View Live Chat Archive
                            </div>
                        </div>
                    </div>
                </section>
            </div>
        </div>
    );
}
