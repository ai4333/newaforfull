import React from 'react';
import { Card } from '@/components/Card';
import { Button } from '@/components/Button';
import { Input } from '@/components/Input';
import Link from 'next/link';

export default function AdminSettings() {
    return (
        <div style={{ padding: '2rem', maxWidth: '800px', margin: '0 auto' }}>
            <header style={{ marginBottom: '3rem' }}>
                <Link href="/admin/dashboard" style={{ color: 'hsl(var(--primary))', textDecoration: 'none', marginBottom: '1rem', display: 'block' }}>← Back to Dashboard</Link>
                <h1 style={{ fontSize: '2.5rem' }}>Global Economcis</h1>
                <p style={{ color: 'hsl(var(--muted-foreground))' }}>Control commissions, fees, and batching thresholds across the platform.</p>
            </header>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
                <Card>
                    <h3 style={{ marginBottom: '1.5rem' }}>Commission & Fees</h3>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
                        <Input label="Vendor Commission (%)" defaultValue="10" type="number" />
                        <Input label="Platform Fee (Student)" defaultValue="5.00" type="number" />
                    </div>
                </Card>

                <Card>
                    <h3 style={{ marginBottom: '1.5rem' }}>Delivery Model</h3>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
                        <Input label="Base Batch Payout" defaultValue="40.00" type="number" />
                        <Input label="Per Order Bonus" defaultValue="5.00" type="number" />
                        <Input label="Scheduling Threshold (₹)" defaultValue="250" type="number" />
                        <Input label="Scheduling Threshold (Qty)" defaultValue="5" type="number" />
                    </div>
                </Card>

                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '1rem' }}>
                    <Button variant="primary" style={{ width: '200px' }}>Save Global Settings</Button>
                </div>

                <section style={{ marginTop: '2rem', padding: '1.5rem', background: 'hsl(var(--destructive) / 0.05)', borderRadius: 'var(--radius)', border: '1px solid hsl(var(--destructive) / 0.1)' }}>
                    <h4 style={{ color: 'hsl(var(--destructive))', marginBottom: '0.5rem' }}>Danger Zone</h4>
                    <p style={{ fontSize: '0.875rem', color: 'hsl(var(--muted-foreground))', marginBottom: '1.5rem' }}>
                        These settings affect all active campuses immediately. Use with caution.
                    </p>
                    <Button variant="secondary" style={{ color: 'hsl(var(--destructive))' }}>Reset All to System Default</Button>
                </section>
            </div>
        </div>
    );
}
