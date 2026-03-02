import React from 'react';
import { Card } from '@/components/Card';
import { Button } from '@/components/Button';
import Link from 'next/link';

export default function BatchTracking({ params }: { params: { id: string } }) {
    return (
        <div style={{ padding: '2rem', maxWidth: '800px', margin: '0 auto' }}>
            <header style={{ marginBottom: '2rem' }}>
                <Link href="/delivery/dashboard" style={{ color: 'hsl(var(--primary))', textDecoration: 'none', marginBottom: '1rem', display: 'block' }}>← Back to Dashboard</Link>
                <h1 style={{ fontSize: '2rem' }}>Active Batch: {params.id}</h1>
            </header>

            <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1fr) 300px', gap: '2rem' }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                    <h3 style={{ fontSize: '1.25rem' }}>Delivery Chain</h3>

                    <div style={{ position: 'relative', paddingLeft: '2rem' }}>
                        <div style={{ position: 'absolute', left: '7px', top: '10px', bottom: '10px', width: '2px', background: 'hsl(var(--border))' }}></div>

                        <div style={{ marginBottom: '2rem', position: 'relative' }}>
                            <div style={{ position: 'absolute', left: '-25px', width: '12px', height: '12px', borderRadius: '50%', background: 'hsl(var(--primary))', border: '2px solid white' }}></div>
                            <Card>
                                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                    <h4 style={{ color: 'hsl(var(--primary))' }}>PICKUP</h4>
                                    <span style={{ fontSize: '0.75rem', fontWeight: 700 }}>COMPLETED</span>
                                </div>
                                <p style={{ marginTop: '0.5rem', fontSize: '1rem' }}>Main Library Prints</p>
                                <p style={{ color: 'hsl(var(--muted-foreground))', fontSize: '0.875rem' }}>Collect 3 orders</p>
                            </Card>
                        </div>

                        <div style={{ marginBottom: '2rem', position: 'relative' }}>
                            <div style={{ position: 'absolute', left: '-25px', width: '12px', height: '12px', borderRadius: '50%', background: 'hsl(var(--primary))', border: '2px solid white' }}></div>
                            <Card>
                                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                    <h4 style={{ color: 'hsl(var(--primary))' }}>PICKUP</h4>
                                    <Button variant="primary" size="sm">Mark Picked Up</Button>
                                </div>
                                <p style={{ marginTop: '0.5rem', fontSize: '1rem' }}>Tech Block Xerox</p>
                                <p style={{ color: 'hsl(var(--muted-foreground))', fontSize: '0.875rem' }}>Collect 1 order</p>
                            </Card>
                        </div>

                        <div style={{ position: 'relative' }}>
                            <div style={{ position: 'absolute', left: '-25px', width: '12px', height: '12px', borderRadius: '50%', background: 'hsl(var(--border))', border: '2px solid white' }}></div>
                            <Card style={{ opacity: 0.6 }}>
                                <h4>DROP-OFF</h4>
                                <p style={{ marginTop: '0.5rem', fontSize: '1rem' }}>Hostel Block A, Room 302</p>
                                <p style={{ color: 'hsl(var(--muted-foreground))', fontSize: '0.875rem' }}>Nikhil S. • +91 99****00</p>
                            </Card>
                        </div>
                    </div>
                </div>

                <div>
                    <Card variant="glass" style={{ marginBottom: '1.5rem' }}>
                        <h4 style={{ marginBottom: '1rem' }}>Earnings Breakdown</h4>
                        <div style={{ borderBottom: '1px solid hsl(var(--border))', paddingBottom: '1rem', marginBottom: '1rem' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem', fontSize: '0.875rem' }}>
                                <span>Base Payout</span>
                                <span>₹40</span>
                            </div>
                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem', fontSize: '0.875rem' }}>
                                <span>Per Order Bonus x4</span>
                                <span>₹20</span>
                            </div>
                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem', fontSize: '0.875rem' }}>
                                <span>Incentive</span>
                                <span>₹5</span>
                            </div>
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 800, fontSize: '1.25rem' }}>
                            <span>Total Payout</span>
                            <span>₹65</span>
                        </div>
                    </Card>
                    <Button variant="secondary" style={{ width: '100%' }}>Report Issue</Button>
                </div>
            </div>
        </div>
    );
}
