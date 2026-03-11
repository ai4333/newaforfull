import React from "react";
import { prisma } from "@/lib/prisma";
import { format } from "date-fns";
import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { Terminal, Shield, RefreshCw, Cpu } from "lucide-react";
export const dynamic = 'force-dynamic';


export default async function AdminLogsPage() {
    const session = await auth();
    const role = (session?.user as { role?: string } | undefined)?.role;

    if (!session?.user) {
        redirect('/admin/login?next=/admin/logs');
    }

    if (role !== "ADMIN") {
        redirect('/');
    }

    const logs = await prisma.activityLog.findMany({
        include: { user: true },
        orderBy: { createdAt: 'desc' },
        take: 200
    });

    return (
        <div className="reveal-up active">
            <header style={{ marginBottom: '2.5rem' }}>
                <h2 className="fraunces text-ink" style={{ fontSize: '2rem', fontWeight: 900, marginBottom: '0.5rem' }}>System Intelligence</h2>
                <p className="lora italic opacity-60">"Auditing the heartbeat and operational logs of the AforPrint engine."</p>
            </header>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '1.5rem', marginBottom: '2.5rem' }}>
                <section className="paper-sheet" style={{ padding: '1.2rem' }}>
                    <div className="label" style={{ fontSize: '8px', marginBottom: '8px' }}>Server Uptime</div>
                    <div className="fraunces text-ink" style={{ fontSize: '1.5rem', fontWeight: 800 }}>99.98%</div>
                </section>
                <section className="paper-sheet" style={{ padding: '1.2rem' }}>
                    <div className="label" style={{ fontSize: '8px', marginBottom: '8px' }}>Security Incidents</div>
                    <div className="fraunces text-ink" style={{ fontSize: '1.5rem', fontWeight: 800 }}>0</div>
                </section>
                <section className="paper-sheet" style={{ padding: '1.2rem' }}>
                    <div className="label" style={{ fontSize: '8px', marginBottom: '8px' }}>Memory Usage</div>
                    <div className="fraunces text-ink" style={{ fontSize: '1.5rem', fontWeight: 800 }}>42%</div>
                </section>
                <section className="paper-sheet" style={{ padding: '1.2rem' }}>
                    <div className="label" style={{ fontSize: '8px', marginBottom: '8px' }}>Last Backup</div>
                    <div style={{ fontSize: '10px', fontWeight: 900 }}>24m AGO</div>
                </section>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 300px', gap: '2rem' }}>
                <section className="paper-sheet" style={{ padding: 0 }}>
                    <div style={{ padding: '20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid rgba(62,32,40,0.1)' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                            <Terminal size={16} className="text-ink" />
                            <h3 className="fraunces text-ink" style={{ fontSize: '1.1rem' }}>Audit Trail</h3>
                        </div>
                        <button style={{ fontSize: '9px', fontWeight: 800 }} className="label">[ CLEAR LOGS ]</button>
                    </div>

                    <div style={{ height: '500px', overflowY: 'auto', padding: '20px' }} className="vintage-scrollbar">
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                            {logs.length === 0 ? (
                                <div style={{ opacity: 0.4, padding: '40px', textAlign: 'center' }} className="lora italic">Archive is currently empty.</div>
                            ) : logs.map((log) => (
                                <div key={log.id} style={{ display: 'flex', gap: '15px', fontSize: '11px' }}>
                                    <div style={{ opacity: 0.3, flexShrink: 0, fontWeight: 700, width: '130px' }}>
                                        {format(new Date(log.createdAt), "MMM d • HH:mm:ss")}
                                    </div>
                                    <div style={{ flexGrow: 1 }}>
                                        <span style={{ fontWeight: 800 }} className="text-ink">[{log.user.name || "System"}]</span> {log.action}
                                        {log.details && (
                                            <div style={{ marginTop: '4px', padding: '8px', background: 'rgba(62,32,40,0.03)', borderRadius: '4px', fontSize: '10px', opacity: 0.8, fontFamily: 'monospace' }}>
                                                {log.details}
                                            </div>
                                        )}
                                    </div>
                                    <div style={{ opacity: 0.4, fontSize: '9px' }}>{log.ip || "127.0.0.1"}</div>
                                </div>
                            ))}
                        </div>
                    </div>
                </section>

                <section>
                    <div className="paper-sheet mb-6">
                        <h4 className="fraunces mb-4" style={{ fontSize: '1rem' }}>Admin Tools</h4>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                            <button className="btn-signin" style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '10px', width: '100%' }}>
                                <RefreshCw size={14} /> Flush Server Cache
                            </button>
                            <button className="btn-signin" style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '10px', width: '100%' }}>
                                <Shield size={14} /> Verify DB Integrity
                            </button>
                            <button className="btn-signin" style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '10px', width: '100%' }}>
                                <Cpu size={14} /> Performance Profiler
                            </button>
                        </div>
                    </div>

                    <div className="paper-sheet">
                        <h4 className="fraunces mb-4" style={{ fontSize: '0.9rem' }}>Version Cluster</h4>
                        <div style={{ fontSize: '10px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                <span className="label" style={{ fontSize: '8px' }}>Core Engine</span>
                                <span style={{ fontWeight: 700 }}>2.4.1-stable</span>
                            </div>
                            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                <span className="label" style={{ fontSize: '8px' }}>Database</span>
                                <span style={{ fontWeight: 700 }}>PostgreSQL 15</span>
                            </div>
                            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                <span className="label" style={{ fontSize: '8px' }}>Frontend</span>
                                <span style={{ fontWeight: 700 }}>Next.js 14.1</span>
                            </div>
                        </div>
                    </div>
                </section>
            </div>
        </div>
    );
}
