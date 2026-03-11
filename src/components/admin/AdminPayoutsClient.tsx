"use client";
import { useEffect, useState } from "react";
import Link from "next/link";

type PayoutRow = {
  id: string;
  amount: number;
  status: "PENDING" | "PAID";
  paidAt: string | null;
  createdAt: string;
  vendor: {
    shopName: string;
    user: { name: string | null; email: string };
  };
};

type VendorRow = {
  id: string;
  shopName: string;
  user: { name: string | null; email: string };
};

export function AdminPayoutsClient() {
  const [payouts, setPayouts] = useState<PayoutRow[]>([]);
  const [vendors, setVendors] = useState<VendorRow[]>([]);
  const [selectedVendorId, setSelectedVendorId] = useState("");
  const [amount, setAmount] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const [pendingId, setPendingId] = useState<string | null>(null);
  const [creating, setCreating] = useState(false);

  const loadPayouts = async () => {
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/admin/payouts");
      if (res.ok) {
        const data = await res.json();
        setPayouts(data.payouts || []);
      } else {
        const payload = await res.json().catch(() => ({}));
        setError(payload?.error || "Unable to load payouts right now.");
        setPayouts([]);
      }
    } catch {
      setError("Unable to load payouts right now.");
      setPayouts([]);
    } finally {
      setLoading(false);
    }
  };

  const loadVendors = async () => {
    try {
      const res = await fetch("/api/admin/vendors");
      if (res.ok) {
        const data = await res.json();
        const rows = (data.vendors || []) as VendorRow[];
        setVendors(rows);
        if (rows.length > 0) {
          setSelectedVendorId((current) => current || rows[0].id);
        }
      } else {
        const payload = await res.json().catch(() => ({}));
        setError(payload?.error || "Unable to load vendors right now.");
      }
    } catch {
      setError("Unable to load vendors right now.");
    }
  };

  useEffect(() => {
    loadPayouts();
    loadVendors();
  }, []);

  const markPaid = async (payoutId: string) => {
    setPendingId(payoutId);
    try {
      const res = await fetch("/api/admin/payouts/mark-paid", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ payoutId }),
      });
      if (res.ok) {
        await loadPayouts();
      } else {
        const payload = await res.json().catch(() => ({}));
        setError(payload?.error || "Failed to update payout status.");
      }
    } catch {
      setError("Failed to update payout status.");
    } finally {
      setPendingId(null);
    }
  };

  const createPayout = async () => {
    setError("");
    const parsedAmount = Number(amount);
    if (!selectedVendorId || Number.isNaN(parsedAmount) || parsedAmount <= 0) {
      setError("Select vendor and enter a valid amount.");
      return;
    }

    setCreating(true);
    try {
      const res = await fetch("/api/admin/payouts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ vendorId: selectedVendorId, amount: parsedAmount }),
      });

      if (!res.ok) {
        const payload = await res.json().catch(() => ({}));
        setError(payload?.error || "Failed to create payout.");
        return;
      }

      setAmount("");
      await loadPayouts();
    } catch {
      setError("Failed to create payout.");
    } finally {
      setCreating(false);
    }
  };

  return (
    <div style={{ padding: "2rem", maxWidth: "1200px", margin: "0 auto" }}>
      <header className="admin-header" style={{ marginBottom: "1.5rem", alignItems: "center" }}>
        <div>
          <Link href="/admin/dashboard" style={{ fontSize: "0.875rem", color: "hsl(var(--muted-foreground))" }}>
            Back to Dashboard
          </Link>
          <h1 style={{ fontSize: "2rem" }}>Payout Management</h1>
        </div>
      </header>

      <section className="paper-sheet" style={{ overflow: "hidden" }}>
        <div className="admin-form-grid" style={{ padding: "1rem", borderBottom: "1px solid hsl(var(--border))" }}>
          <div>
            <div style={{ fontSize: "0.75rem", color: "hsl(var(--muted-foreground))", marginBottom: "0.3rem" }}>Vendor</div>
            <select
              className="ink-input"
              value={selectedVendorId}
              onChange={(e) => setSelectedVendorId(e.target.value)}
            >
              {vendors.map((vendor) => (
                <option key={vendor.id} value={vendor.id}>
                  {vendor.shopName} - {vendor.user.name || vendor.user.email}
                </option>
              ))}
            </select>
          </div>
          <div>
            <div style={{ fontSize: "0.75rem", color: "hsl(var(--muted-foreground))", marginBottom: "0.3rem" }}>Amount</div>
            <input
              className="ink-input"
              value={amount}
              type="number"
              min="0"
              step="0.01"
              onChange={(e) => setAmount(e.target.value)}
            />
          </div>
          <button className="btn-signup" onClick={createPayout} disabled={creating}>
            {creating ? "Creating..." : "Create Payout"}
          </button>
        </div>
        {error && <div style={{ padding: "0.75rem 1rem", color: "#8b1e2b", fontSize: "0.85rem" }}>{error}</div>}
        <div style={{ overflowX: "auto" }}>
        <table style={{ width: "100%", borderCollapse: "collapse", minWidth: "760px" }}>
          <thead>
            <tr style={{ borderBottom: "1px solid hsl(var(--border))", textAlign: "left" }}>
              <th style={{ padding: "1rem" }}>Vendor</th>
              <th style={{ padding: "1rem" }}>Amount</th>
              <th style={{ padding: "1rem" }}>Status</th>
              <th style={{ padding: "1rem" }}>Created</th>
              <th style={{ padding: "1rem" }}>Action</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td style={{ padding: "1rem" }} colSpan={5}>Loading payouts...</td>
              </tr>
            ) : payouts.length === 0 ? (
              <tr>
                <td style={{ padding: "1rem" }} colSpan={5}>No payouts found.</td>
              </tr>
            ) : (
              payouts.map((row) => (
                <tr key={row.id} style={{ borderBottom: "1px solid hsl(var(--border))" }}>
                  <td style={{ padding: "1rem" }}>
                    <div style={{ fontWeight: 600 }}>{row.vendor.shopName}</div>
                    <div style={{ fontSize: "0.8rem", color: "hsl(var(--muted-foreground))" }}>
                      {row.vendor.user.name || "Vendor"} • {row.vendor.user.email}
                    </div>
                  </td>
                  <td style={{ padding: "1rem", fontWeight: 700 }}>₹{row.amount.toFixed(2)}</td>
                  <td style={{ padding: "1rem" }}>{row.status}</td>
                  <td style={{ padding: "1rem" }}>{new Date(row.createdAt).toLocaleString()}</td>
                  <td style={{ padding: "1rem" }}>
                    {row.status === "PENDING" ? (
                      <button
                        className="btn-signup"
                        style={{ padding: "6px 10px", fontSize: "0.75rem" }}
                        onClick={() => markPaid(row.id)}
                        disabled={pendingId === row.id}
                      >
                        {pendingId === row.id ? "Updating..." : "Mark Paid"}
                      </button>
                    ) : (
                      <span style={{ color: "hsl(142, 70%, 45%)", fontSize: "0.875rem" }}>
                        Paid {row.paidAt ? new Date(row.paidAt).toLocaleDateString() : ""}
                      </span>
                    )}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
        </div>
      </section>
    </div>
  );
}
