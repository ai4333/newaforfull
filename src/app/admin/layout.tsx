"use client";
import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
    LayoutDashboard,
    Users,
    ShoppingBag,
    Store,
    Truck,
    CreditCard,
    HardDrive,
    LifeBuoy,
    History,
    Settings,
    ChevronRight
} from "lucide-react";

const NAV_ITEMS = [
    { label: "Overview", href: "/admin/dashboard", icon: LayoutDashboard },
    { label: "User Registry", href: "/admin/users", icon: Users },
    { label: "Order Oversight", href: "/admin/orders", icon: ShoppingBag },
    { label: "Shop Management", href: "/admin/shops", icon: Store },
    { label: "Delivery Tracking", href: "/admin/delivery", icon: Truck },
    { label: "Financials", href: "/admin/payouts", icon: CreditCard },
    { label: "File Storage", href: "/admin/files", icon: HardDrive },
    { label: "Support Tickets", href: "/admin/support", icon: LifeBuoy },
    { label: "Activity Logs", href: "/admin/logs", icon: History },
    { label: "System Settings", href: "/admin/settings", icon: Settings },
];

export default function AdminLayout({ children }: { children: React.ReactNode }) {
    const pathname = usePathname();

    return (
        <div className="dash-layout parchment" style={{
            height: '92vh',
            margin: '0 auto',
            border: 'none',
            boxShadow: '0 20px 50px rgba(0,0,0,0.3)'
        }}>
            {/* ── SIDEBAR ── */}
            <aside className="dash-sidebar" style={{
                borderRight: '1px dashed rgba(62,32,40,0.15)',
                background: 'rgba(228, 213, 183, 0.4)',
                backdropFilter: 'blur(10px)'
            }}>
                <div style={{ padding: '0 8px 24px', borderBottom: '1px dashed rgba(62,32,40,0.1)' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '8px' }}>
                        <div className="wax-seal" style={{ width: '38px', height: '38px' }}></div>
                        <h2 className="fraunces text-ink" style={{ fontSize: '1.2rem', fontWeight: 900 }}>
                            Controller
                        </h2>
                    </div>
                    <p className="lora italic" style={{ fontSize: '10px', opacity: 0.6 }}>AforPrint Admin Suite v2.0</p>
                </div>

                <nav style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '4px', marginTop: '16px' }}>
                    {NAV_ITEMS.map((item) => {
                        const isActive = pathname === item.href;
                        const Icon = item.icon;
                        return (
                            <Link
                                key={item.href}
                                href={item.href}
                                style={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '12px',
                                    padding: '10px 12px',
                                    textDecoration: 'none',
                                    borderRadius: '4px',
                                    transition: 'all 0.2s ease',
                                    background: isActive ? 'rgba(62, 32, 40, 0.08)' : 'transparent',
                                    border: isActive ? '1px solid rgba(62, 32, 40, 0.1)' : '1px solid transparent'
                                }}
                            >
                                <Icon size={16} color={isActive ? "var(--wax-red)" : "var(--ink-secondary)"} strokeWidth={isActive ? 2.5 : 2} />
                                <span
                                    className="label"
                                    style={{
                                        color: isActive ? 'var(--ink-primary)' : 'var(--ink-secondary)',
                                        opacity: isActive ? 1 : 0.7,
                                        fontSize: '11px',
                                        fontWeight: isActive ? 700 : 500
                                    }}
                                >
                                    {item.label}
                                </span>
                                {isActive && <ChevronRight size={12} style={{ marginLeft: 'auto', color: 'var(--wax-red)' }} />}
                            </Link>
                        );
                    })}
                </nav>

                <div style={{ marginTop: 'auto', paddingTop: '20px', borderTop: '1px dashed rgba(62,32,40,0.1)' }}>
                    <Link href="/" style={{ textDecoration: 'none' }}>
                        <div style={{
                            padding: '12px',
                            background: 'var(--ink-primary)',
                            color: 'white',
                            fontSize: '10px',
                            textAlign: 'center',
                            borderRadius: '2px',
                            fontWeight: 700,
                            letterSpacing: '1px',
                            textTransform: 'uppercase'
                        }}>
                            Exit to Platform
                        </div>
                    </Link>
                </div>
            </aside>

            {/* ── MAIN CONTENT ── */}
            <main className="dash-content" style={{ padding: 0 }}>
                <div style={{
                    height: '100%',
                    overflowY: 'auto',
                    padding: '40px',
                    backgroundImage: 'url("https://www.transparenttextures.com/patterns/paper-fibers.png")'
                }}>
                    {children}
                </div>
            </main>
        </div>
    );
}
