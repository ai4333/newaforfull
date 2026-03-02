"use client";
import React, { useState } from 'react';
import { Card } from '@/components/Card';
import { Button } from '@/components/Button';
import { Input } from '@/components/Input';
import Link from 'next/link';

export default function OrderPage() {
    const [step, setStep] = useState(1);
    const [config, setConfig] = useState({
        color: 'bw',
        sides: 'single',
        copies: 1,
        binding: 'none',
        lamination: false
    });

    const nextStep = () => setStep(prev => prev + 1);

    return (
        <div style={{ padding: '2rem', maxWidth: '1000px', margin: '0 auto' }}>
            <div style={{ display: 'flex', gap: '1rem', marginBottom: '3rem' }}>
                {[1, 2, 3, 4].map(s => (
                    <div key={s} style={{
                        height: '4px',
                        flex: 1,
                        background: s <= step ? 'var(--grad-primary)' : 'hsl(var(--border))',
                        borderRadius: '2px'
                    }}></div>
                ))}
            </div>

            {step === 1 && (
                <div className="animate-fade-in">
                    <h2 style={{ fontSize: '2rem', marginBottom: '1.5rem' }}>Upload Document</h2>
                    <Card variant="glass" style={{ border: '2px dashed hsl(var(--border))', padding: '4rem', textAlign: 'center' }}>
                        <div style={{ width: '64px', height: '64px', borderRadius: '50%', background: 'hsl(var(--primary) / 0.1)', color: 'hsl(var(--primary))', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1.5rem' }}>
                            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" /><polyline points="17 8 12 3 7 8" /><line x1="12" y1="3" x2="12" y2="15" /></svg>
                        </div>
                        <h3>Drag & drop your PDF</h3>
                        <p style={{ color: 'hsl(var(--muted-foreground))', marginTop: '0.5rem' }}>Maximum file size 50MB. Only PDF supported.</p>
                        <Button variant="secondary" style={{ marginTop: '2rem' }}>Browse Files</Button>
                    </Card>

                    <div style={{ marginTop: '2rem', display: 'flex', justifyContent: 'flex-end' }}>
                        <Button onClick={nextStep} style={{ width: '200px' }}>Continue</Button>
                    </div>
                </div>
            )}

            {step === 2 && (
                <div className="animate-fade-in">
                    <h2 style={{ fontSize: '2rem', marginBottom: '1.5rem' }}>Configure Print</h2>
                    <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '2rem' }}>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                            <Card>
                                <h4 style={{ marginBottom: '1rem' }}>Color Mode</h4>
                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                                    <Button variant={config.color === 'bw' ? 'primary' : 'secondary'} onClick={() => setConfig({ ...config, color: 'bw' })}>Black & White</Button>
                                    <Button variant={config.color === 'color' ? 'primary' : 'secondary'} onClick={() => setConfig({ ...config, color: 'color' })}>Color</Button>
                                </div>
                            </Card>

                            <Card>
                                <h4 style={{ marginBottom: '1rem' }}>Print Options</h4>
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                                    <Input label="Number of Copies" type="number" value={config.copies} onChange={(e) => setConfig({ ...config, copies: parseInt(e.target.value) })} />
                                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                                        <Button variant={config.sides === 'single' ? 'primary' : 'secondary'} onClick={() => setConfig({ ...config, sides: 'single' })}>Single Side</Button>
                                        <Button variant={config.sides === 'double' ? 'primary' : 'secondary'} onClick={() => setConfig({ ...config, sides: 'double' })}>Double Side</Button>
                                    </div>
                                </div>
                            </Card>
                        </div>

                        <Card style={{ height: 'fit-content' }}>
                            <h4 style={{ marginBottom: '1rem' }}>Price Estimate</h4>
                            <p style={{ color: 'hsl(var(--muted-foreground))', fontSize: '0.875rem', marginBottom: '1.5rem' }}>Actual price depends on the selected vendor in the next step.</p>
                            <div style={{ borderTop: '1px solid hsl(var(--border))', paddingTop: '1rem' }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                                    <span>Base Price</span>
                                    <span>₹2/page</span>
                                </div>
                                <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 700, fontSize: '1.25rem', marginTop: '1rem' }}>
                                    <span>Est. Total</span>
                                    <span>₹2.00</span>
                                </div>
                            </div>
                        </Card>
                    </div>

                    <div style={{ marginTop: '2rem', display: 'flex', justifyContent: 'flex-end', gap: '1rem' }}>
                        <Button variant="secondary" onClick={() => setStep(1)}>Back</Button>
                        <Button onClick={nextStep} style={{ width: '200px' }}>Choose Vendor</Button>
                    </div>
                </div>
            )}

            {step === 3 && (
                <div className="animate-fade-in">
                    <h2 style={{ fontSize: '2rem', marginBottom: '1.5rem' }}>Select Print Shop</h2>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                        {[
                            { name: 'Main Library Prints', price: '₹2.00', distance: '100m', rating: '4.8', time: '15 mins' },
                            { name: 'Tech Block Xerox', price: '₹1.80', distance: '450m', rating: '4.5', time: '30 mins' },
                            { name: 'Student Center Hub', price: '₹2.50', distance: '200m', rating: '4.9', time: '10 mins' },
                        ].map((vendor, i) => (
                            <Card key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', cursor: 'pointer', border: '1px solid hsl(var(--border))' }}>
                                <div style={{ display: 'flex', gap: '1.5rem', alignItems: 'center' }}>
                                    <div style={{ width: '48px', height: '48px', borderRadius: '12px', background: 'hsl(var(--primary) / 0.1)', color: 'hsl(var(--primary))', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold' }}>
                                        {vendor.name[0]}
                                    </div>
                                    <div>
                                        <h4 style={{ fontSize: '1.125rem' }}>{vendor.name}</h4>
                                        <p style={{ color: 'hsl(var(--muted-foreground))', fontSize: '0.875rem' }}>{vendor.distance} • ⭐ {vendor.rating} • Ready in {vendor.time}</p>
                                    </div>
                                </div>
                                <div style={{ textAlign: 'right', display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
                                    <span style={{ fontWeight: 700, fontSize: '1.25rem' }}>{vendor.price}</span>
                                    <Button variant="secondary" onClick={nextStep}>Select</Button>
                                </div>
                            </Card>
                        ))}
                    </div>

                    <div style={{ marginTop: '2rem', display: 'flex', justifyContent: 'flex-start' }}>
                        <Button variant="secondary" onClick={() => setStep(2)}>Back</Button>
                    </div>
                </div>
            )}

            {step === 4 && (
                <div className="animate-fade-in">
                    <h2 style={{ fontSize: '2rem', marginBottom: '1.5rem' }}>Delivery Mode</h2>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1.5rem', marginBottom: '3rem' }}>
                        <Card style={{ textAlign: 'center', padding: '2rem' }}>
                            <div style={{ fontSize: '2rem', marginBottom: '1rem' }}>🚶</div>
                            <h3>Self Pickup</h3>
                            <p style={{ color: 'hsl(var(--muted-foreground))', margin: '0.5rem 0 1.5rem' }}>Pickup from shop when ready.</p>
                            <span style={{ display: 'block', fontWeight: 700, fontSize: '1.25rem', marginBottom: '1.5rem' }}>₹0</span>
                            <Button style={{ width: '100% ' }} onClick={nextStep}>Select</Button>
                        </Card>

                        <Card style={{ textAlign: 'center', padding: '2rem', border: '2px solid hsl(var(--primary) / 0.3)' }}>
                            <div style={{ fontSize: '2rem', marginBottom: '1rem' }}>🚚</div>
                            <h3>Scheduled</h3>
                            <p style={{ color: 'hsl(var(--muted-foreground))', margin: '0.5rem 0 1.5rem' }}>Delivery in next available slot.</p>
                            <span style={{ display: 'block', fontWeight: 700, fontSize: '1.25rem', marginBottom: '1.5rem' }}>+ ₹15</span>
                            <Button style={{ width: '100% ' }} onClick={nextStep}>Select</Button>
                        </Card>

                        <Card style={{ textAlign: 'center', padding: '2rem' }}>
                            <div style={{ fontSize: '2rem', marginBottom: '1rem' }}>⚡</div>
                            <h3>Express</h3>
                            <p style={{ color: 'hsl(var(--muted-foreground))', margin: '0.5rem 0 1.5rem' }}>Urgent delivery in 15 mins.</p>
                            <span style={{ display: 'block', fontWeight: 700, fontSize: '1.25rem', marginBottom: '1.5rem' }}>+ ₹30</span>
                            <Button style={{ width: '100% ' }} onClick={nextStep}>Select</Button>
                        </Card>
                    </div>

                    <div style={{ display: 'flex', justifyContent: 'flex-start' }}>
                        <Button variant="secondary" onClick={() => setStep(3)}>Back</Button>
                    </div>
                </div>
            )}

            {step === 5 && (
                <div className="animate-fade-in" style={{ textAlign: 'center', padding: '3rem 0' }}>
                    <div style={{ maxWidth: '400px', margin: '0 auto' }}>
                        <div style={{ width: '80px', height: '80px', borderRadius: '50%', background: 'hsl(142, 70%, 45% / 0.1)', color: 'hsl(142, 70%, 45%)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 2rem' }}>
                            <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12" /></svg>
                        </div>
                        <h2 style={{ fontSize: '2rem', marginBottom: '1rem' }}>Payment Successful</h2>
                        <p style={{ color: 'hsl(var(--muted-foreground))', marginBottom: '2rem' }}>Your order #PRNT-9921 has been placed and sent to the vendor.</p>
                        <Card style={{ textAlign: 'left', marginBottom: '2rem' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                                <span style={{ color: 'hsl(var(--muted-foreground))' }}>Vendor</span>
                                <span style={{ fontWeight: 600 }}>Main Library Prints</span>
                            </div>
                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                                <span style={{ color: 'hsl(var(--muted-foreground))' }}>Total Paid</span>
                                <span style={{ fontWeight: 600 }}>₹22.00</span>
                            </div>
                        </Card>
                        <Link href="/student/dashboard">
                            <Button style={{ width: '100%' }}>Go to Dashboard</Button>
                        </Link>
                    </div>
                </div>
            )}
        </div>
    );
}
