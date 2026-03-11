import React from "react";
import { prisma } from "@/lib/prisma";
import { format } from "date-fns";
import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { HardDrive, FileText, DownloadCloud, Trash2 } from "lucide-react";
export const dynamic = 'force-dynamic';


export default async function AdminFilesPage() {
    const session = await auth();
    const role = (session?.user as { role?: string } | undefined)?.role;

    if (!session?.user) {
        redirect('/admin/login?next=/admin/files');
    }

    if (role !== "ADMIN") {
        redirect('/');
    }

    const files = await prisma.orderFile.findMany({
        include: {
            order: {
                include: { student: true }
            }
        },
        orderBy: { createdAt: 'desc' },
        take: 100
    });

    // Calculate total storage (mocking for now based on file size)
    const totalSize = files.reduce((acc, f) => acc + (f.fileSize || 0), 0);
    const sizeInMB = (totalSize / (1024 * 1024)).toFixed(2);

    return (
        <div className="reveal-up active">
            <header style={{ marginBottom: '2.5rem' }}>
                <h2 className="fraunces text-ink" style={{ fontSize: '2rem', fontWeight: 900, marginBottom: '0.5rem' }}>Storage & Assets</h2>
                <p className="lora italic opacity-60">"Monitoring the digital archives of the platform's knowledge base."</p>
            </header>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '1.5rem', marginBottom: '2.5rem' }}>
                <section className="paper-sheet" style={{ padding: '1.2rem' }}>
                    <div className="label" style={{ fontSize: '8px', marginBottom: '8px' }}>Total Storage Used</div>
                    <div className="fraunces text-ink" style={{ fontSize: '1.5rem', fontWeight: 800 }}>{sizeInMB} MB</div>
                </section>
                <section className="paper-sheet" style={{ padding: '1.2rem' }}>
                    <div className="label" style={{ fontSize: '8px', marginBottom: '8px' }}>Total Files</div>
                    <div className="fraunces text-ink" style={{ fontSize: '1.5rem', fontWeight: 800 }}>{files.length}</div>
                </section>
                <section className="paper-sheet" style={{ padding: '1.2rem' }}>
                    <div className="label" style={{ fontSize: '8px', marginBottom: '8px' }}>S3 Bucket Status</div>
                    <div style={{ fontSize: '10px', fontWeight: 900, color: '#10b981' }}>HEALTHY</div>
                </section>
                <section className="paper-sheet" style={{ padding: '1.2rem' }}>
                    <div className="label" style={{ fontSize: '8px', marginBottom: '8px' }}>Avg File Size</div>
                    <div className="fraunces text-ink" style={{ fontSize: '1.5rem', fontWeight: 800 }}>{(totalSize / (files.length || 1) / 1024).toFixed(0)} KB</div>
                </section>
            </div>

            <section className="paper-sheet" style={{ padding: 0 }}>
                <div style={{ overflowX: 'auto' }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '12px' }}>
                        <thead>
                            <tr style={{ borderBottom: '1px solid rgba(62,32,40,0.1)', textAlign: 'left' }}>
                                <th style={{ padding: '15px 12px' }} className="label">File Name</th>
                                <th style={{ padding: '15px 12px' }} className="label">Owner & Order</th>
                                <th style={{ padding: '15px 12px' }} className="label">Size</th>
                                <th style={{ padding: '15px 12px' }} className="label">Created</th>
                                <th style={{ padding: '15px 12px' }} className="label">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {files.length === 0 ? (
                                <tr><td colSpan={5} style={{ padding: '4rem', textAlign: 'center', opacity: 0.4 }} className="lora italic">Vault is currently empty.</td></tr>
                            ) : files.map((file) => (
                                <tr key={file.id} style={{ borderBottom: '1px solid rgba(62,32,40,0.05)' }}>
                                    <td style={{ padding: '18px 12px' }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                            <FileText size={16} className="text-ink" opacity={0.3} />
                                            <div style={{ fontWeight: 700, fontSize: '13px' }} className="text-ink">{file.fileName}</div>
                                        </div>
                                    </td>
                                    <td style={{ padding: '18px 12px' }}>
                                        <div style={{ fontSize: '10px' }}>{file.order.student.name || "Student"}</div>
                                        <div style={{ fontSize: '9px', opacity: 0.5 }}>Order #{file.orderId.slice(0, 6)}</div>
                                    </td>
                                    <td style={{ padding: '18px 12px' }}>
                                        <div style={{ fontSize: '11px' }}>{(file.fileSize / 1024).toFixed(1)} KB</div>
                                    </td>
                                    <td style={{ padding: '18px 12px' }}>
                                        <div style={{ fontSize: '11px' }}>{format(new Date(file.createdAt), "MMM d, yyyy")}</div>
                                    </td>
                                    <td style={{ padding: '18px 12px' }}>
                                        <div style={{ display: 'flex', gap: '8px' }}>
                                            <a href={file.fileUrl} target="_blank" rel="noreferrer" style={{
                                                padding: '6px',
                                                borderRadius: '4px',
                                                background: 'var(--ink-primary)',
                                                color: 'white'
                                            }} title="Download">
                                                <DownloadCloud size={14} />
                                            </a>
                                            <button style={{
                                                padding: '6px',
                                                border: '1px solid rgba(62,32,40,0.1)',
                                                borderRadius: '4px',
                                                background: 'white'
                                            }} title="Purge Asset">
                                                <Trash2 size={14} color="var(--wax-red)" />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </section>
        </div>
    );
}
