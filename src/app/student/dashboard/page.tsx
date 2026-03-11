"use client";
import React, { useEffect, useMemo, useState } from "react";
import Link from "next/link";

type OrderRow = {
    id: string;
    status: string;
    createdAt: string;
    files: { fileName: string }[];
    vendor: { shopName: string } | null;
    totalPaid: number;
};

type StudentProfile = {
    name: string | null;
    college: string | null;
    course: string | null;
    year: string | null;
};

export default function StudentDashboard() {
    const [orders, setOrders] = useState<OrderRow[]>([]);
    const [profile, setProfile] = useState<StudentProfile | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const load = async () => {
            try {
                const profileRes = await fetch("/api/student/profile");
                if (profileRes.ok) {
                    const profileData = await profileRes.json();
                    if (!profileData?.completed) {
                        window.location.href = "/student/onboarding";
                        return;
                    }
                    setProfile(profileData.profile || null);
                }

                const res = await fetch("/api/student/orders");
                if (res.ok) {
                    const data = await res.json();
                    setOrders(data.orders || []);
                }
            } finally {
                setIsLoading(false);
            }
        };
        load();
    }, []);

    const stats = useMemo(() => {
        const activeStatuses = new Set(["PENDING", "PAYMENT_PENDING", "PAID", "ACCEPTED", "READY"]);
        const activeCount = orders.filter((order) => activeStatuses.has(order.status)).length;
        const totalSpent = orders.reduce((sum, order) => sum + (order.totalPaid || 0), 0);
        return {
            activeCount,
            totalOrders: orders.length,
            totalSpent,
        };
    }, [orders]);

    return (
        <div style={{ display: "flex", flexDirection: "column", gap: "32px" }}>
            {/* ── REFINED WELCOME & QUICK ACTIONS ── */}
            <section style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", gap: "40px" }}>
                <div style={{ flex: 1 }}>
                    <h1 className="fraunces text-ink" style={{ fontSize: "2rem", marginBottom: "4px" }}>Welcome Back</h1>
                    <p className="lora" style={{ fontStyle: "italic", fontSize: "13px", opacity: 0.6 }}>
                        "Ready to turn your digital drafts into physical documents?"
                    </p>
                    {profile ? (
                        <p className="label" style={{ marginTop: "8px", fontSize: "10px", opacity: 0.6 }}>
                            {profile.name || "Student"} • {profile.college || "College not set"} • {profile.course || "Course"} {profile.year ? `(${profile.year})` : ""}
                        </p>
                    ) : null}
                </div>

                <div style={{ display: "flex", gap: "12px" }}>
                    <Link href="/student/new-order" className="btn-signup">Create New Order</Link>
                    <Link href="/student/orders" className="btn-signin">Order History</Link>
                </div>
            </section>

            {/* ── QUICK STATS ── */}
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", gap: "20px" }}>
                <div className="paper-sheet" style={{ padding: "20px" }}>
                    <div className="ink-label">Active Orders</div>
                    <div className="fraunces text-ink" style={{ fontSize: "1.75rem", fontWeight: 900 }}>{stats.activeCount}</div>
                    <div className="label" style={{ fontSize: "8px", marginTop: "8px", opacity: 0.4 }}>Live across your campus</div>
                </div>
                <div className="paper-sheet" style={{ padding: "20px" }}>
                    <div className="ink-label">Total Orders</div>
                    <div className="fraunces text-ink" style={{ fontSize: "1.75rem", fontWeight: 900 }}>{stats.totalOrders}</div>
                    <div className="label" style={{ fontSize: "8px", marginTop: "8px", opacity: 0.4 }}>All time activity</div>
                </div>
                <div className="paper-sheet" style={{ padding: "20px" }}>
                    <div className="ink-label">Total Spent</div>
                    <div className="fraunces text-ink" style={{ fontSize: "1.75rem", fontWeight: 900 }}>₹{stats.totalSpent.toFixed(2)}</div>
                    <div className="label" style={{ fontSize: "8px", marginTop: "8px", opacity: 0.4 }}>Verified payments</div>
                </div>
            </div>

            {/* ── RECENT ACTIVITY ── */}
            <section>
                <div className="flex items-center justify-between mb-4">
                    <h3 className="fraunces text-ink" style={{ fontSize: '1rem', fontWeight: 700 }}>Recent Activity</h3>
                    <div className="founders-rule" style={{ flex: 1, margin: '0 20px', opacity: 0.1 }}></div>
                    <Link href="/student/orders" className="label" style={{ fontSize: '9px', textDecoration: 'none', opacity: 0.6 }}>View All</Link>
                </div>

                <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                    {isLoading ? (
                        <div className="paper-sheet" style={{ padding: "16px" }}>Loading recent orders...</div>
                    ) : orders.length === 0 ? (
                        <div className="paper-sheet" style={{ padding: "16px" }}>No orders yet.</div>
                    ) : (
                        orders.map((order) => {
                            const fileName = order.files?.[0]?.fileName || "Document";
                            const vendorName = order.vendor?.shopName || "Vendor";
                            const dateLabel = new Date(order.createdAt).toLocaleDateString();
                            return (
                                <div key={order.id} className="paper-sheet" style={{
                                    display: "flex",
                                    justifyContent: "space-between",
                                    alignItems: "center",
                                    padding: "12px 20px",
                                }}>
                                    <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
                                        <div className="founder-monogram" style={{ width: "32px", height: "32px", fontSize: "10px" }}>PDF</div>
                                        <div>
                                            <div className="nav-text" style={{ fontSize: "13px", fontWeight: 700 }}>{fileName}</div>
                                            <div className="label" style={{ fontSize: "9px", opacity: 0.5 }}>{vendorName} • {dateLabel}</div>
                                        </div>
                                    </div>
                                    <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
                                        <span className={`status-seal status-${order.status.toLowerCase()}`}>{order.status}</span>
                                        <span className="label" style={{ fontSize: "9px", opacity: 0.4 }}>{order.id.slice(0, 8)}</span>
                                    </div>
                                </div>
                            );
                        })
                    )}
                </div>
            </section>
        </div>
    );
}
