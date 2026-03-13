"use client";
import React, { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { PDFDocument } from 'pdf-lib';

type Vendor = {
    id: string;
    shopName: string;
    pricePerPageBW: number | null;
    pricePerPageColor: number | null;
    pricingConfig: any;
};

type Step = 1 | 2 | 3 | 4 | 5 | 6;

type RazorpayCreateResponse = {
    razorpayOrderId: string;
    keyId: string;
    amount: number;
    currency: string;
};

declare global {
    interface Window {
        Razorpay?: new (options: {
            key: string;
            amount: number;
            currency: string;
            name: string;
            description: string;
            order_id: string;
            handler: (response: {
                razorpay_order_id: string;
                razorpay_payment_id: string;
                razorpay_signature: string;
            }) => void;
            prefill?: {
                name?: string;
                email?: string;
            };
            theme?: { color?: string };
            modal?: { ondismiss?: () => void };
        }) => { open: () => void };
    }
}

const loadRazorpayScript = async () => {
    if (typeof window === 'undefined') return false;
    if (window.Razorpay) return true;

    return new Promise<boolean>((resolve) => {
        const script = document.createElement('script');
        script.src = 'https://checkout.razorpay.com/v1/checkout.js';
        script.async = true;
        script.onload = () => resolve(true);
        script.onerror = () => resolve(false);
        document.body.appendChild(script);
    });
};

export default function NewOrderPage() {
    const router = useRouter();
    const { data: session } = useSession();
    const [step, setStep] = useState<Step>(1);
    const [vendors, setVendors] = useState<Vendor[]>([]);
    const [selectedVendorId, setSelectedVendorId] = useState<string>('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState<string>('');
    const [createdOrderId, setCreatedOrderId] = useState<string>('');
    const [paymentOrderId, setPaymentOrderId] = useState<string>('');
    const [isDetectingPages, setIsDetectingPages] = useState(false);
    const [order, setOrder] = useState({
        file: null as File | null,
        pages: 1,
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

    useEffect(() => {
        const loadVendors = async () => {
            const res = await fetch('/api/student/vendors');
            if (res.ok) {
                const data = await res.json();
                const vendorRows = (data.vendors || []) as Vendor[];
                setVendors(vendorRows);
                if (vendorRows.length > 0) {
                    setSelectedVendorId(vendorRows[0].id);
                }
            }
        };
        loadVendors();
    }, []);

    const selectedVendor = useMemo(() => {
        return vendors.find(v => v.id === selectedVendorId);
    }, [vendors, selectedVendorId]);

    const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0] || null;
        if (!file) {
            setOrder(prev => ({ ...prev, file: null, pages: 1 }));
            return;
        }

        setOrder(prev => ({ ...prev, file }));

        if (file.type === 'application/pdf') {
            setIsDetectingPages(true);
            try {
                const arrayBuffer = await file.arrayBuffer();
                const pdfDoc = await PDFDocument.load(arrayBuffer, { ignoreEncryption: true });
                const pageCount = pdfDoc.getPageCount();
                setOrder(prev => ({ ...prev, pages: Math.max(pageCount, 1) }));
            } catch (err) {
                console.error("PDF Parsing Error:", err);
                // Fallback to 1 page if detection fails
                setOrder(prev => ({ ...prev, pages: 1 }));
            } finally {
                setIsDetectingPages(false);
            }
        } else {
            setOrder(prev => ({ ...prev, pages: 1 }));
        }
    };

    const estimatedBasePrice = useMemo(() => {
        if (!selectedVendor) return 0;

        const rate = order.colorMode === 'Color'
            ? (selectedVendor.pricePerPageColor ?? 10)
            : (selectedVendor.pricePerPageBW ?? 2);

        const bindingFees: Record<string, number> = {
            'No Binding': 0,
            'Spiral Binding': 30,
            'Soft Binding': 45,
            'Hard Binding': 80,
            'Staple (Top Left)': 5,
            'Center Pin': 8,
            'Lamination (Front Only)': 20,
            'Lamination (Both Sides)': 35,
        };

        let price = order.pages * order.copies * rate;
        price += bindingFees[order.binding] ?? 0;

        return Math.max(price, 10); // Minimum 10 rupees
    }, [order.pages, order.copies, order.colorMode, order.binding, selectedVendor]);

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

    const submitOrder = async () => {
        setError('');
        if (!selectedVendorId) {
            setError('Please select a vendor.');
            return;
        }

        setIsSubmitting(true);
        try {
            let uploadedFileMeta:
                | {
                    fileUrl: string;
                    fileName: string;
                    fileSize: number;
                }
                | undefined;

            if (order.file) {
                const formData = new FormData();
                formData.append('file', order.file);

                const uploadRes = await fetch('/api/upload/file', {
                    method: 'POST',
                    body: formData,
                });

                if (!uploadRes.ok) {
                    const payload = await uploadRes.json().catch(() => ({}));
                    setError(payload?.error || 'File upload failed. Please retry.');
                    return;
                }

                const uploadInfo = await uploadRes.json() as {
                    fileUrl: string;
                    fileName: string;
                    fileSize: number;
                    pageCount: number;
                };

                if (uploadInfo.pageCount > 0 && uploadInfo.pageCount !== order.pages) {
                    setOrder(prev => ({ ...prev, pages: uploadInfo.pageCount }));
                }

                uploadedFileMeta = {
                    fileUrl: uploadInfo.fileUrl,
                    fileName: uploadInfo.fileName,
                    fileSize: uploadInfo.fileSize,
                };
            }

            const createRes = await fetch('/api/order/create', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    vendorId: selectedVendorId,
                    pages: order.pages,
                    printType: order.colorMode === "Color" ? "COLOR" : "BW",
                    copies: order.copies,
                    binding: order.binding,
                    deliveryType: "PICKUP",
                    deliveryAddress: undefined,
                    files: uploadedFileMeta ? [uploadedFileMeta] : undefined,
                }),
            });

            if (!createRes.ok) {
                const payload = await createRes.json().catch(() => ({}));
                setError(payload?.error || 'Failed to create order.');
                return;
            }

            const createData = await createRes.json();
            const orderId = createData.order?.id as string;
            setCreatedOrderId(orderId);

            const paymentRes = await fetch('/api/payment/create', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ orderId }),
            });

            if (!paymentRes.ok) {
                const payload = await paymentRes.json().catch(() => ({}));
                setError(payload?.error || 'Failed to create payment order.');
                return;
            }

            const paymentData = (await paymentRes.json()) as RazorpayCreateResponse;
            setPaymentOrderId(paymentData.razorpayOrderId || '');

            const razorpayLoaded = await loadRazorpayScript();
            if (!razorpayLoaded || !window.Razorpay) {
                setError('Razorpay checkout failed to load.');
                return;
            }

            const razorpay = new window.Razorpay({
                key: paymentData.keyId,
                amount: paymentData.amount,
                currency: paymentData.currency,
                name: 'AforPrint',
                description: 'Campus print order payment',
                order_id: paymentData.razorpayOrderId,
                prefill: {
                    name: session?.user?.name ?? undefined,
                    email: session?.user?.email ?? undefined,
                },
                theme: {
                    color: '#8b1e2b',
                },
                handler: async (response) => {
                    const verifyRes = await fetch('/api/payment/verify', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({
                            orderId,
                            razorpayOrderId: response.razorpay_order_id,
                            razorpayPaymentId: response.razorpay_payment_id,
                            razorpaySignature: response.razorpay_signature,
                        }),
                    });

                    if (!verifyRes.ok) {
                        setError('Payment verification failed. Please contact support.');
                        return;
                    }

                    router.push('/student/orders');
                },
                modal: {
                    ondismiss: () => {
                        setError('Payment was cancelled. You can retry from your orders page.');
                    },
                },
            });

            razorpay.open();

        } catch (err) {
            const message = err instanceof Error ? err.message : 'Unexpected error while creating order.';
            setError(message);

        } finally {
            setIsSubmitting(false);
        }
    };

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
                                    <input id="file-input" type="file" hidden onChange={handleFileChange} accept=".pdf,.doc,.docx,.zip,.png,.jpg,.jpeg" />
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
                                        {isDetectingPages ? 'Detecting pages...' : (order.file ? order.file.name : 'Click to upload or drag & drop')}
                                    </div>
                                    {order.pages > 1 && !isDetectingPages && (
                                        <div className="label" style={{ fontSize: '10px', color: 'var(--wax-red)', fontWeight: 700 }}>
                                            {order.pages} pages detected
                                        </div>
                                    )}
                                    <div style={{ marginTop: '12px', display: 'flex', justifyContent: 'center', gap: '8px', alignItems: 'center' }}>
                                        <label className="label" style={{ fontSize: '9px' }}>Pages</label>
                                        <input
                                            type="number"
                                            min={1}
                                            className="ink-input"
                                            style={{ width: '90px', textAlign: 'center', padding: '6px 8px' }}
                                            value={order.pages}
                                            onChange={(ev) => setOrder(prev => ({ ...prev, pages: Math.max(1, Number(ev.target.value) || 1) }))}
                                        />
                                    </div>
                                    <div className="label" style={{ fontSize: '9px', opacity: 0.4 }}>PDF, DOC, DOCX, ZIP, PNG, JPG (MAX 20MB)</div>
                                    <div className="label" style={{ fontSize: '8px', opacity: 0.5 }}>PDF pages are auto-detected. For other files, adjust pages manually.</div>
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
                                <div style={{ marginTop: '20px', display: 'grid', gap: '12px' }}>
                                    <div>
                                        <label className="ink-label">Choose Vendor</label>
                                        <select
                                            className="ink-input"
                                            value={selectedVendorId}
                                            onChange={(e) => setSelectedVendorId(e.target.value)}
                                        >
                                            {vendors.map((vendor) => (
                                                <option key={vendor.id} value={vendor.id}>{vendor.shopName}</option>
                                            ))}
                                        </select>
                                    </div>
                                    {error && <div className="label" style={{ color: 'var(--wax-red)', fontSize: '10px' }}>{error}</div>}
                                </div>
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
                            <button onClick={submitOrder} className="btn-signup" disabled={isSubmitting || vendors.length === 0}>
                                {isSubmitting ? 'Creating...' : 'Create Order'}
                            </button>
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
                            <span className="fraunces">Est. Total Price</span>
                            <span className="text-ink">₹{step > 5 ? estimatedBasePrice.toFixed(2) : '---'}</span>
                        </div>
                        <p className="label" style={{ fontSize: '8px', opacity: 0.4, fontStyle: 'italic' }}>
                            *Price = (Pages × Copies × Rate) + Binding. Detailed breakdown in Review step.
                        </p>
                        {createdOrderId && (
                            <p className="label" style={{ fontSize: '8px', opacity: 0.6 }}>
                                Order #{createdOrderId.slice(0, 8)} created {paymentOrderId ? `• Razorpay ${paymentOrderId}` : ''}
                            </p>
                        )}
                    </div>
                </aside>
            </div>
        </div>
    );
}
