"use client";
import React, { useEffect, useState } from "react";
import { useSession } from "next-auth/react";

type StudentOrder = {
    id: string;
    status: string;
    createdAt: string;
    files: { fileName: string }[];
    vendor: { shopName: string } | null;
};

type PaymentCreateResponse = {
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
            prefill?: { name?: string; email?: string };
            theme?: { color?: string };
            modal?: { ondismiss?: () => void };
        }) => { open: () => void };
    }
}

const loadRazorpayScript = async () => {
    if (typeof window === "undefined") return false;
    if (window.Razorpay) return true;

    return new Promise<boolean>((resolve) => {
        const script = document.createElement("script");
        script.src = "https://checkout.razorpay.com/v1/checkout.js";
        script.async = true;
        script.onload = () => resolve(true);
        script.onerror = () => resolve(false);
        document.body.appendChild(script);
    });
};

const steps = ["PAYMENT_PENDING", "PAID", "ACCEPTED", "READY", "COMPLETED"];

function formatStatus(status: string) {
    return status.replace(/_/g, " ");
}

function getCurrentStepIndex(status: string) {
    const idx = steps.indexOf(status);
    return idx === -1 ? 0 : idx;
}

export default function MyOrdersPage() {
    const { data: session } = useSession();
    const [orders, setOrders] = useState<StudentOrder[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [retryingOrderId, setRetryingOrderId] = useState<string | null>(null);
    const [error, setError] = useState("");

    useEffect(() => {
        const loadOrders = async () => {
            try {
                const res = await fetch("/api/student/orders");
                if (res.ok) {
                    const data = await res.json();
                    setOrders(data.orders || []);
                }
            } finally {
                setIsLoading(false);
            }
        };

        loadOrders();
    }, []);

    const retryPayment = async (orderId: string) => {
        setError("");
        setRetryingOrderId(orderId);
        try {
            const paymentRes = await fetch("/api/payment/create", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ orderId }),
            });

            if (!paymentRes.ok) {
                setError("Unable to create payment order right now.");
                return;
            }

            const paymentData = (await paymentRes.json()) as PaymentCreateResponse;
            const loaded = await loadRazorpayScript();
            if (!loaded || !window.Razorpay) {
                setError("Razorpay checkout failed to load.");
                return;
            }

            const razorpay = new window.Razorpay({
                key: paymentData.keyId,
                amount: paymentData.amount,
                currency: paymentData.currency,
                name: "AforPrint",
                description: "Retry order payment",
                order_id: paymentData.razorpayOrderId,
                prefill: {
                    name: session?.user?.name ?? undefined,
                    email: session?.user?.email ?? undefined,
                },
                theme: { color: "#8b1e2b" },
                handler: async (response) => {
                    const verifyRes = await fetch("/api/payment/verify", {
                        method: "POST",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify({
                            orderId,
                            razorpayOrderId: response.razorpay_order_id,
                            razorpayPaymentId: response.razorpay_payment_id,
                            razorpaySignature: response.razorpay_signature,
                        }),
                    });

                    if (!verifyRes.ok) {
                        setError("Payment verification failed. Please contact support.");
                        return;
                    }

                    const refreshed = await fetch("/api/student/orders");
                    if (refreshed.ok) {
                        const data = await refreshed.json();
                        setOrders(data.orders || []);
                    }
                },
            });

            razorpay.open();
        } finally {
            setRetryingOrderId(null);
        }
    };

    return (
        <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
            {error && <div className="paper-sheet" style={{ padding: "12px", color: "#8b1e2b" }}>{error}</div>}
            {isLoading && <div className="paper-sheet" style={{ padding: "16px" }}>Loading orders...</div>}
            {!isLoading && orders.length === 0 && <div className="paper-sheet" style={{ padding: "16px" }}>No orders yet.</div>}
            {orders.map((order) => {
                const currentStepIdx = getCurrentStepIndex(order.status);
                const fileName = order.files?.[0]?.fileName || "Document";
                const vendorName = order.vendor?.shopName || "Vendor";
                const dateLabel = new Date(order.createdAt).toLocaleDateString();

                return (
                    <div key={order.id} className="paper-sheet" style={{ padding: "20px 24px" }}>
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px" }}>
                            <div style={{ display: "flex", alignItems: "center", gap: "20px" }}>
                                <div className="founder-monogram" style={{ width: "32px", height: "32px", fontSize: "10px" }}>DOC</div>
                                <div>
                                    <h3 className="fraunces text-ink" style={{ fontSize: "1.1rem", fontWeight: 700 }}>{fileName}</h3>
                                    <div className="label" style={{ fontSize: "8px", opacity: 0.5 }}>{vendorName} • ID: #{order.id.slice(0, 8)}</div>
                                </div>
                            </div>
                            <div style={{ textAlign: "right" }}>
                                <span className={`status-seal status-${order.status.toLowerCase()}`}>
                                    {formatStatus(order.status)}
                                </span>
                                <div className="label mt-1" style={{ fontSize: "8px", opacity: 0.4 }}>Ordered {dateLabel}</div>
                                {order.status === "PAYMENT_PENDING" && (
                                    <button
                                        className="btn-signup"
                                        style={{ marginTop: "8px", padding: "4px 8px", fontSize: "9px" }}
                                        onClick={() => retryPayment(order.id)}
                                        disabled={retryingOrderId === order.id}
                                    >
                                        {retryingOrderId === order.id ? "Opening..." : "Pay Now"}
                                    </button>
                                )}
                            </div>
                        </div>

                        {/* ── REFINED STATUS TRACKER ── */}
                        <div style={{ display: "flex", justifyContent: "space-between", position: "relative", marginTop: "24px", padding: "0 10px" }}>
                            <div style={{
                                position: "absolute", top: "8px", left: "20px", right: "20px",
                                height: "1px", background: "rgba(62,32,40,0.05)", zIndex: 0
                            }}></div>
                            <div style={{
                                position: "absolute", top: "8px", left: "20px",
                                width: `calc(${(currentStepIdx / (steps.length - 1)) * 100}% - 40px)`,
                                height: "1px", background: "var(--wax-red)", zIndex: 1, transition: "width 1s ease"
                            }}></div>

                            {steps.map((s, i) => (
                                <div key={s} style={{ position: "relative", zIndex: 2, textAlign: "center" }}>
                                    <div style={{
                                        width: "16px", height: "16px", borderRadius: "50%",
                                        background: i <= currentStepIdx ? "var(--wax-red)" : "var(--bg-darker)",
                                        border: "3px solid var(--bg-parchment)",
                                        margin: "0 auto 6px",
                                        boxShadow: "0 1px 2px rgba(0,0,0,0.05)"
                                    }}></div>
                                    <div className="label" style={{
                                        fontSize: "7px",
                                        fontWeight: i === currentStepIdx ? 900 : 400,
                                        opacity: i <= currentStepIdx ? 0.8 : 0.3
                                    }}>{formatStatus(s)}</div>
                                </div>
                            ))}
                        </div>
                    </div>
                );
            })}
        </div>
    );
}
