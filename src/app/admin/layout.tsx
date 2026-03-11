"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const navItems = [
  { href: "/admin/dashboard", label: "Dashboard" },
  { href: "/admin/shops", label: "Vendors" },
  { href: "/admin/orders", label: "Orders" },
  { href: "/admin/users", label: "Users" },
  { href: "/admin/payouts", label: "Payouts" },
  { href: "/admin/files", label: "Files" },
  { href: "/admin/logs", label: "Logs" },
  { href: "/admin/settings", label: "Settings" },
];

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  if (pathname?.startsWith("/admin/login")) {
    return <>{children}</>;
  }

  return (
    <div style={{ display: "flex", minHeight: "100vh", width: "100%", background: "#f8f6f1" }}>
      <aside
        style={{
          width: 240,
          background: "#ffffff",
          borderRight: "1px solid #e5e7eb",
          padding: 16,
          display: "flex",
          flexDirection: "column",
          gap: 10,
        }}
      >
        <div style={{ fontWeight: 800, color: "#111827", fontSize: 18, marginBottom: 8 }}>AforPrint Admin</div>
        {navItems.map((item) => {
          const active = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              style={{
                textDecoration: "none",
                padding: "10px 12px",
                borderRadius: 8,
                background: active ? "#111827" : "transparent",
                color: active ? "#ffffff" : "#111827",
                fontSize: 14,
                fontWeight: 600,
              }}
            >
              {item.label}
            </Link>
          );
        })}
        <div style={{ marginTop: "auto" }}>
          <Link href="/" style={{ textDecoration: "none", color: "#6b7280", fontSize: 13 }}>
            Exit to platform
          </Link>
        </div>
      </aside>

      <main style={{ flex: 1, padding: 20, color: "#111827" }}>{children}</main>
    </div>
  );
}
