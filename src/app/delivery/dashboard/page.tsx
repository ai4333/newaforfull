import React from 'react';
import { Card } from '@/components/Card';
import { Button } from '@/components/Button';
import Link from 'next/link';

export default function DeliveryDashboard() {
    const availableBatches = [
        { id: 'BATCH-102', orders: 4, payout: '₹65', distance: '1.2km', vendors: 'Tech Block, Library' },
        { id: 'BATCH-105', orders: 2, payout: '₹48', distance: '0.8km', vendors: 'Student Center' },
    ];

    return (
        <div style={{ padding: '2rem', maxWidth: '800px', margin: '0 auto' }}>
            <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '3rem' }}>
                <div>
                    <h1 style={{ fontSize: '2.5rem' }}>Partner Dashboard</h1>
                    <p style={{ color: 'hsl(var(--muted-foreground))' }}>Active Partner • <span style={{ color: 'hsl(var(--primary))' }}>Working</span></p>
                </div>
                <div style={{ textAlign: 'right' }}>
                    <p style={{ fontSize: '0.875rem', color: 'hsl(var(--muted-foreground))' }}>Total Earnings Today</p>
                    <h3 style={{ fontSize: '2rem' }}>₹420</h3>
                </div>
            </header>

            <div style={{ background: 'var(--grad-primary)', padding: '2rem', borderRadius: 'var(--radius)', color: 'white', marginBottom: '3rem', position: 'relative', overflow: 'hidden' }}>
                <h3 style={{ fontSize: '1.5rem', marginBottom: '0.5rem' }}>Ready to Earn?</h3>
                <p style={{ opacity: 0.9, marginBottom: '1.5rem' }}>Accept a batch and start your deliveries. Current bonus: +₹5 per order.</p>
                <Button variant="glass" style={{ color: 'white' }}>View Nearby Batches</Button>
            </div>

            <section>
                <h2 style={{ marginBottom: '1.5rem', fontSize: '1.5rem' }}>Available Batches</h2>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                    {availableBatches.map(batch => (
                        <Card key={batch.id} style={{ borderLeft: '4px solid hsl(var(--primary))' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                                <div>
                                    <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center', marginBottom: '1rem' }}>
                                        <span style={{ fontWeight: 700, fontSize: '1rem' }}>{batch.id}</span>
                                        <span style={{ padding: '0.25rem 0.5rem', background: 'hsl(var(--muted))', borderRadius: '4px', fontSize: '0.75rem', fontWeight: 600 }}>{batch.orders} Orders</span>
                                    </div>
                                    <p style={{ fontSize: '0.875rem', color: 'hsl(var(--muted-foreground))' }}>VENDORS: {batch.vendors}</p>
                                    <p style={{ fontSize: '0.875rem', color: 'hsl(var(--muted-foreground))', marginTop: '0.25rem' }}>Total Distance: {batch.distance}</p>
                                </div>
                                <div style={{ textAlign: 'right' }}>
                                    <span style={{ display: 'block', fontSize: '1.5rem', fontWeight: 800, color: 'hsl(var(--foreground))', marginBottom: '1rem' }}>{batch.payout}</span>
                                    <Link href={`/delivery/batch/${batch.id}`}>
                                        <Button variant="primary" size="sm">Accept Batch</Button>
                                    </Link>
                                </div>
                            </div>
                        </Card>
                    ))}
                </div>
            </section>
        </div>
    );
}
