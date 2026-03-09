"use client";
import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut } from "next-auth/react";
import type { Session } from "next-auth";

type StudentShellProps = {
  children: React.ReactNode;
  session: Session | null;
};

export function StudentShell({ children, session }: StudentShellProps) {
  const pathname = usePathname();
  const handleLogout = async () => {
    await signOut({ callbackUrl: "/auth/login" });
  };

  const navItems = [
    {
      name: "Dashboard",
      href: "/student/dashboard",
      icon: (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path>
          <polyline points="9 22 9 12 15 12 15 22"></polyline>
        </svg>
      ),
    },
    {
      name: "New Order",
      href: "/student/new-order",
      icon: (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="12" cy="12" r="10"></circle>
          <line x1="12" y1="8" x2="12" y2="16"></line>
          <line x1="8" y1="12" x2="16" y2="12"></line>
        </svg>
      ),
    },
    {
      name: "My Orders",
      href: "/student/orders",
      icon: (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <polyline points="21 8 21 21 3 21 3 8"></polyline>
          <rect x="1" y="3" width="22" height="5"></rect>
          <line x1="10" y1="12" x2="14" y2="12"></line>
        </svg>
      ),
    },
    {
      name: "Profile",
      href: "/student/profile",
      icon: (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
          <circle cx="12" cy="7" r="4"></circle>
        </svg>
      ),
    },
    {
      name: "Support",
      href: "/student/support",
      icon: (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
        </svg>
      ),
    },
  ];

  return (
    <div className="dash-layout">
      <aside className="dash-sidebar">
        <div style={{ paddingBottom: "20px", borderBottom: "1px solid rgba(139,30,43,0.08)" }}>
          <h1 className="fraunces text-ink" style={{ fontSize: "1.25rem", fontWeight: 900, letterSpacing: "0.05em" }}>
            AforPrint
          </h1>
          <span className="label" style={{ fontSize: "8px", opacity: 0.5, letterSpacing: "0.1em" }}>STUDENT PORTAL</span>
        </div>

        <nav style={{ flex: 1, display: "flex", flexDirection: "column", gap: "4px" }}>
          {navItems.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={isActive ? "btn-signup" : "btn-signin"}
                style={{
                  justifyContent: "flex-start",
                  gap: "10px",
                  padding: "10px 14px",
                  border: "none",
                  background: isActive ? undefined : "transparent",
                  boxShadow: isActive ? undefined : "none",
                  fontSize: "11px",
                }}
              >
                <span style={{ fontSize: "14px" }}>{item.icon}</span>
                <span className="nav-text" style={{ fontWeight: isActive ? 700 : 500 }}>{item.name}</span>
              </Link>
            );
          })}
        </nav>

        <div className="sidebar-cell" style={{ borderTop: "1px solid rgba(62,32,40,0.08)", paddingTop: "16px" }}>
          <div className="ink-label" style={{ fontSize: "8px" }}>Active Campus</div>
          <select className="ink-input" style={{ fontSize: "11px", padding: "6px 10px" }}>
            <option>Main University Campus</option>
            <option>East Engineering Wing</option>
            <option>Medical College Block</option>
          </select>
        </div>
      </aside>

      <main className="dash-content">
        <div className="dash-container">
          <header
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              marginBottom: "32px",
              paddingBottom: "12px",
              borderBottom: "1px solid rgba(62,32,40,0.05)",
            }}
          >
            <div>
              <h2 className="fraunces text-ink" style={{ fontSize: "1rem", fontWeight: 700, opacity: 0.8 }}>
                {navItems.find((i) => i.href === pathname)?.name || "Dashboard"}
              </h2>
            </div>

            <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
              <div style={{ textAlign: "right" }}>
                <div className="nav-text" style={{ fontSize: "11px", fontWeight: 700 }}>{session?.user?.name || "Loading..."}</div>
                <div className="label" style={{ fontSize: "8px", opacity: 0.5 }}>{session?.user?.email}</div>
              </div>
              <div
                className="founder-monogram"
                style={{ width: "32px", height: "32px", fontSize: "12px", cursor: "pointer" }}
                onClick={handleLogout}
                title="Logout"
              >
                {session?.user?.name?.[0] || "U"}
              </div>
            </div>
          </header>

          <div className="reveal-up active" style={{ flex: 1 }}>
            {children}
          </div>
        </div>
      </main>
    </div>
  );
}
