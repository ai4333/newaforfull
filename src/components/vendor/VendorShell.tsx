"use client";
import React, { useState, useEffect } from "react";
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
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // Close menu on route change
  useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [pathname]);

  // Lock body scroll when mobile menu is open
  useEffect(() => {
    if (isMobileMenuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'auto';
    }
    return () => {
      document.body.style.overflow = 'auto';
    };
  }, [isMobileMenuOpen]);

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
  ];

  const handleLogout = async () => {
    await signOut({ callbackUrl: "/auth/login" });
  };

  return (
    <div className="dash-layout relative">
      <div
        className={`drawer-overlay ${isMobileMenuOpen ? 'open' : ''}`}
        onClick={() => setIsMobileMenuOpen(false)}
      />

      <aside className={`dash-sidebar ${isMobileMenuOpen ? 'drawer-open' : ''} z-50`}>
        <div className="mb-10 px-2 flex justify-between items-center w-full">
          <div>
            <h1 className="fraunces text-ink" style={{ fontSize: "1.4rem", fontWeight: 900, letterSpacing: "-0.02em" }}>
              AforPrint
            </h1>
            <div className="label mt-1" style={{ fontSize: "8px", opacity: 0.5, letterSpacing: "0.1em" }}>VENDOR CONSOLE</div>
          </div>
          <button
            className="md:hidden"
            onClick={() => setIsMobileMenuOpen(false)}
            style={{ background: 'none', border: 'none', color: 'var(--ink-primary)', padding: '4px' }}
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
          </button>
        </div>

        <nav style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
          {navItems.map((item) => {
            const isActive = pathname === item.path;
            return (
              <Link
                key={item.path}
                href={item.path}
                className={isActive ? "vendor-nav-item vendor-nav-item-active" : "vendor-nav-item"}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "12px",
                  padding: "8px 12px",
                  borderRadius: "6px",
                  fontSize: "13px",
                  fontWeight: isActive ? 700 : 500,
                  transition: "all 0.2s ease",
                  color: isActive ? "#fff" : "var(--ink-primary)",
                  background: isActive ? "var(--ink-primary)" : "transparent",
                  border: isActive ? "1px solid rgba(62,32,40,0.15)" : "1px solid transparent",
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
            <select className="ink-input" style={{ fontSize: "11px", padding: "4px 8px", height: "auto" }} disabled>
              <option>RV University</option>
            </select>
          </div>
        </div>
      </aside>

      <div style={{ display: 'flex', flexDirection: 'column', flex: 1, width: '100%', overflow: 'hidden' }}>
        {/* Mobile Header elements only show on standard mobile via CSS media query class */}
        <header className="mobile-header">
          <h1 className="fraunces text-ink" style={{ fontSize: "1.2rem", fontWeight: 900, letterSpacing: "0.05em", margin: 0 }}>
            {shopName}
          </h1>
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            <div
              className="founder-monogram"
              style={{ width: "28px", height: "28px", fontSize: "10px", margin: 0, cursor: "pointer" }}
              onClick={handleLogout}
              title="Logout"
            >
              {(session?.user?.name || "V")[0]}
            </div>
            <button
              onClick={() => setIsMobileMenuOpen(true)}
              style={{ background: 'transparent', border: 'none', color: 'var(--ink-primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '4px' }}
            >
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="3" y1="12" x2="21" y2="12"></line><line x1="3" y1="6" x2="21" y2="6"></line><line x1="3" y1="18" x2="21" y2="18"></line></svg>
            </button>
          </div>
        </header>

        <main className="dash-content">
          <header
            className="hidden md:flex"
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
                  margin: 0
                }}
                title="Logout"
              >
                {session?.user?.name?.[0] || "V"}
              </button>
            </div>
          </header>

          <div className="dash-container">{children}</div>
        </main>
      </div>

      <div className="fixed bottom-4 left-4 z-50 pointer-events-none hidden md:block">
        <div className="paper-sheet" style={{ padding: "4px 8px", borderRadius: "4px", opacity: 0.3 }}>
          <span className="label" style={{ fontSize: "8px" }}>v.1.0.4-vendor</span>
        </div>
      </div>
    </div>
  );
}

