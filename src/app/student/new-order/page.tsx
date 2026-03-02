"use client";
import React, { useState } from 'react';
import Link from 'next/link';

type Step = 1 | 2 | 3 | 4 | 5 | 6;

export default function NewOrderPage() {
    const [step, setStep] = useState<Step>(1);
    const [order, setOrder] = useState({
        file: null as File | null,
        paperSize: 'A4',
        colorMode: 'Black & White',
        printSide: 'Single Side',
        orientation: 'Portrait',
        copies: 1,
        pagesToPrint: 'All Pages',
        pagesPerSheet: '1',
        gsm: '80 GSM',
        binding: 'No Binding',
        instructions: '',
    });

    const steps = [
        { title: 'Upload', sub: 'Document' },
        { title: 'Paper', sub: 'Settings' },
        { title: 'GSM', sub: 'Thickness' },
        { title: 'Binding', sub: 'Finishing' },
        { title: 'Notes', sub: 'Instructions' },
        { title: 'Review', sub: 'Summary' },
    ];

    const gsmOptions = [
        { label: '70 GSM', sub: 'Very Thin Paper' },
        { label: '75 GSM', sub: 'Thin Office Paper' },
        { label: '80 GSM', sub: 'Standard Normal Paper' },
        { label: '90 GSM', sub: 'Slightly Thick' },
        { label: '100 GSM', sub: 'Premium Paper' },
        { label: '120 GSM', sub: 'Thick Presentation Paper' },
        { label: '150 GSM', sub: 'Card Type Paper' },
        { label: '200+ GSM', sub: 'Very Thick Cover Paper' },
    ];

    const bindingOptions = [
        'No Binding', 'Spiral Binding', 'Soft Binding', 'Hard Binding',
        'Staple (Top Left)', 'Center Pin', 'Lamination (Front Only)', 'Lamination (Both Sides)'
    ];

    const nextStep = () => setStep((prev) => Math.min(prev + 1, 6) as Step);
    const prevStep = () => setStep((prev) => Math.max(prev - 1, 1) as Step);

    return (
        <div className="dash-container">
            {/* ── PROGRESS TRACKER ── */}
            <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                marginBottom: '32px',
                position: 'relative'
            }}>
                <div style={{
                    position: 'absolute', top: '16px', left: '0', right: '0',
                    height: '1px', background: 'rgba(62,32,40,0.06)', zIndex: 0
                }}></div>
                {steps.map((s, i) => (
                    <div key={i} style={{ position: 'relative', zIndex: 1, textAlign: 'center' }}>
                        <div className={`founder-monogram ${step > i ? 'active' : ''}`} style={{
                            width: '32px', height: '32px',
                            margin: '0 auto 6px',
                            fontSize: '10px',
                            background: step === i + 1 ? 'var(--wax-red)' : step > i ? 'var(--ink-primary)' : 'var(--bg-parchment)',
                            color: step >= i + 1 ? 'white' : 'var(--ink-primary)',
                            opacity: step >= i + 1 ? 1 : 0.3,
                            border: '1px solid rgba(62,32,40,0.1)'
                        }}>
                            {i + 1}
                        </div>
                        <div className="label" style={{ fontSize: '8px', opacity: step === i + 1 ? 1 : 0.4 }}>{s.title}</div>
                    </div>
                ))}
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1.5fr 1fr', gap: '24px', alignItems: 'start' }}>
                <div className="paper-sheet" style={{ minHeight: '400px', display: 'flex', flexDirection: 'column' }}>
                    <div className="paper-fold"></div>

                    <div style={{ flex: 1 }}>
                        {/* ── STEP 1: UPLOAD ── */}
                        {step === 1 && (
                            <div className="reveal-up active">
                                <h3 className="fraunces text-ink mb-6" style={{ fontSize: '1.25rem' }}>Upload Document</h3>
                                <div
                                    style={{
                                        border: '1px dashed rgba(62,32,40,0.2)',
                                        padding: '48px 20px',
                                        textAlign: 'center',
                                        borderRadius: '1px',
                                        background: 'rgba(255,255,255,0.05)',
                                        cursor: 'pointer'
                                    }}
                                    onClick={() => document.getElementById('file-input')?.click()}
                                >
                                    <input id="file-input" type="file" hidden onChange={(e) => setOrder({ ...order, file: e.target.files?.[0] || null })} />
                                    <div style={{ marginBottom: '16px', display: 'flex', justifyContent: 'center', opacity: 0.4 }}>
                                        <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                                            <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
                                            <polyline points="14 2 14 8 20 8"></polyline>
                                            <line x1="16" y1="13" x2="8" y2="13"></line>
                                            <line x1="16" y1="17" x2="8" y2="17"></line>
                                            <polyline points="10 9 9 9 8 9"></polyline>
                                        </svg>
                                    </div>
                                    <div className="nav-text" style={{ fontSize: '13px', marginBottom: '4px' }}>
                                        {order.file ? order.file.name : 'Click to upload or drag & drop'}
                                    </div>
                                    <div className="label" style={{ fontSize: '9px', opacity: 0.4 }}>PDF, DOCX, ZIP (MAX 20MB)</div>
                                </div>
                            </div>
                        )}

                        {/* ── STEP 2: PAPER ── */}
                        {step === 2 && (
                            <div className="reveal-up active">
                                <h3 className="fraunces text-ink mb-6" style={{ fontSize: '1.25rem' }}>Paper Settings</h3>
                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                                    <div>
                                        <label className="ink-label">Paper Size</label>
                                        <select className="ink-input" value={order.paperSize} onChange={(e) => setOrder({ ...order, paperSize: e.target.value })}>
                                            {['A2', 'A3', 'A4', 'A5', 'Legal', 'Letter'].map(s => <option key={s}>{s}</option>)}
                                        </select>
                                    </div>
                                    <div>
                                        <label className="ink-label">Color Mode</label>
                                        <select className="ink-input" value={order.colorMode} onChange={(e) => setOrder({ ...order, colorMode: e.target.value })}>
                                            {['Black & White', 'Color'].map(s => <option key={s}>{s}</option>)}
                                        </select>
                                    </div>
                                    <div>
                                        <label className="ink-label">Print Side</label>
                                        <select className="ink-input" value={order.printSide} onChange={(e) => setOrder({ ...order, printSide: e.target.value })}>
                                            {['Single Side', 'Double Side'].map(s => <option key={s}>{s}</option>)}
                                        </select>
                                    </div>
                                    <div>
                                        <label className="ink-label">Orientation</label>
                                        <select className="ink-input" value={order.orientation} onChange={(e) => setOrder({ ...order, orientation: e.target.value })}>
                                            {['Portrait', 'Landscape'].map(s => <option key={s}>{s}</option>)}
                                        </select>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* ── STEP 3: GSM ── */}
                        {step === 3 && (
                            <div className="reveal-up active">
                                <h3 className="fraunces text-ink mb-6" style={{ fontSize: '1.25rem' }}>Paper Thickness</h3>
                                <div className="option-grid">
                                    {gsmOptions.map((opt) => (
                                        <div
                                            key={opt.label}
                                            className={`option-card ${order.gsm === opt.label ? 'selected' : ''}`}
                                            onClick={() => setOrder({ ...order, gsm: opt.label })}
                                        >
                                            <div className="nav-text" style={{ fontSize: '12px', fontWeight: 700 }}>{opt.label}</div>
                                            <div className="label" style={{ fontSize: '8px', opacity: 0.5 }}>{opt.sub}</div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* ── STEP 4: BINDING ── */}
                        {step === 4 && (
                            <div className="reveal-up active">
                                <h3 className="fraunces text-ink mb-6" style={{ fontSize: '1.25rem' }}>Binding & Finishing</h3>
                                <div className="option-grid" style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(130px, 1fr))' }}>
                                    {bindingOptions.map((opt) => (
                                        <div
                                            key={opt}
                                            className={`option-card ${order.binding === opt ? 'selected' : ''}`}
                                            onClick={() => setOrder({ ...order, binding: opt })}
                                        >
                                            <div className="nav-text" style={{ fontSize: '11px' }}>{opt}</div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* ── STEP 5: NOTES ── */}
                        {step === 5 && (
                            <div className="reveal-up active">
                                <h3 className="fraunces text-ink mb-6" style={{ fontSize: '1.25rem' }}>Special Instructions</h3>
                                <textarea
                                    className="ink-input"
                                    rows={6}
                                    maxLength={300}
                                    placeholder="Extra requests for the shop..."
                                    value={order.instructions}
                                    onChange={(e) => setOrder({ ...order, instructions: e.target.value })}
                                ></textarea>
                                <div className="label text-right mt-2" style={{ fontSize: '9px', opacity: 0.5 }}>{order.instructions.length} / 300</div>
                            </div>
                        )}

                        {/* ── STEP 6: REVIEW ── */}
                        {step === 6 && (
                            <div className="reveal-up active">
                                <h3 className="fraunces text-ink mb-6" style={{ fontSize: '1.25rem' }}>Final Review</h3>
                                <p className="lora italic opacity-60 text-13px">"Please confirm all parameters before proceeding to shop comparison."</p>
                            </div>
                        )}
                    </div>

                    {/* ── NAVIGATION BUTTONS ── */}
                    <div style={{
                        marginTop: '32px',
                        display: 'flex',
                        justifyContent: 'space-between',
                        borderTop: '1px solid rgba(62,32,40,0.05)',
                        paddingTop: '24px'
                    }}>
                        {step > 1 ? (
                            <button onClick={prevStep} className="btn-signin">Back</button>
                        ) : (
                            <Link href="/student/dashboard" className="btn-signin">Cancel</Link>
                        )}

                        {step < 6 ? (
                            <button onClick={nextStep} className="btn-signup">Next Step</button>
                        ) : (
                            <Link href="/student/orders" className="btn-signup">Compare Shops</Link>
                        )}
                    </div>
                </div>

                {/* ── LIVE SUMMARY PANEL (Desktop) ── */}
                <aside className="paper-sheet" style={{ background: 'rgba(62,32,40,0.02)', border: '1px solid rgba(62,32,40,0.1)' }}>
                    <div className="ink-label">Live Summary</div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', fontSize: '12px' }}>
                        <div className="flex justify-between"><span className="opacity-50">File</span> <span>{order.file?.name || '---'}</span></div>
                        <div className="flex justify-between"><span className="opacity-50">Size/Color</span> <span>{order.paperSize} | {order.colorMode}</span></div>
                        <div className="flex justify-between"><span className="opacity-50">GSM</span> <span>{order.gsm}</span></div>
                        <div className="flex justify-between"><span className="opacity-50">Binding</span> <span>{order.binding}</span></div>

                        <div className="founders-rule" style={{ opacity: 0.05, margin: '8px 0' }}></div>

                        <div className="flex justify-between" style={{ fontSize: '14px', fontWeight: 900 }}>
                            <span className="fraunces">Est. Base Price</span>
                            <span className="text-ink">₹{step > 5 ? '81.00' : '---'}</span>
                        </div>
                        <p className="label" style={{ fontSize: '8px', opacity: 0.4, fontStyle: 'italic' }}>
                            *Vendors may have additional fees based on campus location.
                        </p>
                    </div>
                </aside>
            </div>
        </div>
    );
}
