"use client";
import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut } from "next-auth/react";
import type { Session } from "next-auth";

type VendorShellProps = {
  children: React.ReactNode;
  session: Session | null;
  shopName: string;
};

export function VendorShell({ children, session, shopName }: VendorShellProps) {
  const pathname = usePathname();

  const navItems = [
    {
      name: "Dashboard",
      path: "/vendor/dashboard",
      icon: (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <rect x="3" y="3" width="7" height="7"></rect>
          <rect x="14" y="3" width="7" height="7"></rect>
          <rect x="14" y="14" width="7" height="7"></rect>
          <rect x="3" y="14" width="7" height="7"></rect>
        </svg>
      ),
    },
    {
      name: "Orders",
      path: "/vendor/orders",
      icon: (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <polyline points="21 8 21 21 3 21 3 8"></polyline>
          <rect x="1" y="3" width="22" height="5"></rect>
          <line x1="10" y1="12" x2="14" y2="12"></line>
        </svg>
      ),
    },
    {
      name: "Pricing & Services",
      path: "/vendor/pricing",
      icon: (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <line x1="12" y1="1" x2="12" y2="23"></line>
          <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"></path>
        </svg>
      ),
    },
    {
      name: "Products & Inventory",
      path: "/vendor/inventory",
      icon: (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2"></path>
          <rect x="8" y="2" width="8" height="4" rx="1" ry="1"></rect>
        </svg>
      ),
    },
    {
      name: "Earnings & Payouts",
      path: "/vendor/earnings",
      icon: (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <rect x="2" y="5" width="20" height="14" rx="2"></rect>
          <line x1="2" y1="10" x2="22" y2="10"></line>
        </svg>
      ),
    },
    {
      name: "Business Analytics",
      path: "/vendor/analytics",
      icon: (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <line x1="18" y1="20" x2="18" y2="10"></line>
          <line x1="12" y1="20" x2="12" y2="4"></line>
          <line x1="6" y1="20" x2="6" y2="14"></line>
        </svg>
      ),
    },
    {
      name: "Shop Settings",
      path: "/vendor/settings",
      icon: (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="12" cy="12" r="3"></circle>
          <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"></path>
        </svg>
      ),
    },
    {
      name: "Support",
      path: "/vendor/support",
      icon: (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
        </svg>
      ),
    },
    {
      name: "User Registry",
      path: "http://admin.localhost:3000/users",
      icon: (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
          <circle cx="9" cy="7" r="4"></circle>
          <path d="M23 21v-2a4 4 0 0 0-3-3.87"></path>
          <path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
        </svg>
      ),
    },
  ];

  const handleLogout = async () => {
    await signOut({ callbackUrl: "/auth/login" });
  };

  return (
    <div className="dash-layout">
      <aside className="dash-sidebar">
        <div className="mb-10 px-2">
          <h1 className="fraunces text-ink" style={{ fontSize: "1.4rem", fontWeight: 900, letterSpacing: "-0.02em" }}>
            AforPrint
          </h1>
          <div className="label mt-1" style={{ fontSize: "8px", opacity: 0.5, letterSpacing: "0.1em" }}>VENDOR CONSOLE</div>
        </div>

        <nav style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
          {navItems.map((item) => {
            const isActive = pathname === item.path;
            return (
              <Link
                key={item.path}
                href={item.path}
                className={isActive ? "nav-item-active" : "nav-item"}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "12px",
                  padding: "8px 12px",
                  borderRadius: "6px",
                  fontSize: "13px",
                  fontWeight: isActive ? 700 : 500,
                  transition: "all 0.2s ease",
                }}
              >
                <span style={{ fontSize: "14px" }}>{item.icon}</span>
                {item.name}
              </Link>
            );
          })}
        </nav>

        <div className="mt-auto pt-8 border-t border-black/5">
          <div className="paper-sheet" style={{ padding: "12px", background: "rgba(62,32,40,0.02)", marginBottom: "12px" }}>
            <div className="label" style={{ fontSize: "8px", marginBottom: "4px" }}>ACTIVE CAMPUS</div>
            <select className="ink-input" style={{ fontSize: "11px", padding: "4px 8px", height: "auto" }}>
              <option>Main University Lab</option>
              <option>North Campus Annex</option>
            </select>
          </div>
        </div>
      </aside>

      <main className="dash-content">
        <header
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            padding: "16px 0",
            marginBottom: "32px",
            borderBottom: "1px solid rgba(62,32,40,0.05)",
          }}
        >
          <div>
            <h2 className="fraunces text-ink" style={{ fontSize: "1.2rem", fontWeight: 700 }}>{shopName}</h2>
            <p className="lora italic opacity-50" style={{ fontSize: "11px" }}>ID: V-882-HUB</p>
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: "20px" }}>
            <div style={{ textAlign: "right" }}>
              <div className="nav-text" style={{ fontSize: "12px", fontWeight: 700 }}>{session?.user?.name || "Loading..."}</div>
              <div className="label" style={{ fontSize: "9px", opacity: 0.5 }}>{session?.user?.email}</div>
            </div>
            <button
              onClick={handleLogout}
              className="founder-monogram"
              style={{
                width: "36px",
                height: "36px",
                fontSize: "14px",
                cursor: "pointer",
                transition: "transform 0.2s ease",
              }}
              title="Logout"
            >
              {session?.user?.name?.[0] || "V"}
            </button>
          </div>
        </header>

        <div className="dash-container">{children}</div>
      </main>

      <div className="fixed bottom-4 left-4 z-50 pointer-events-none">
        <div className="paper-sheet" style={{ padding: "4px 8px", borderRadius: "4px", opacity: 0.3 }}>
          <span className="label" style={{ fontSize: "8px" }}>v.1.0.4-vendor</span>
        </div>
      </div>
    </div>
  );
}
