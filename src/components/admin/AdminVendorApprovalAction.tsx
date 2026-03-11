"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export function AdminVendorApprovalAction({ vendorId, initialStatus }: { vendorId: string; initialStatus: string }) {
  const [status, setStatus] = useState(initialStatus);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const router = useRouter();

  const setNext = async (nextStatus: "APPROVED" | "REJECTED" | "PENDING_APPROVAL") => {
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/admin/vendors/status", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ vendorId, status: nextStatus }),
      });
      if (res.ok) {
        setStatus(nextStatus);
        router.refresh();
      } else {
        const payload = await res.json().catch(() => ({}));
        setError(payload?.error || "Update failed");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ display: "grid", gap: 6 }}>
      <div style={{ display: "flex", gap: "6px", alignItems: "center" }}>
        <span className="label" style={{ fontSize: "8px", opacity: 0.7 }}>{status}</span>
        <button className="btn-signin" style={{ padding: "4px 8px", fontSize: "9px" }} onClick={() => setNext("APPROVED")} disabled={loading}>Approve</button>
        <button className="btn-signin" style={{ padding: "4px 8px", fontSize: "9px", color: "var(--wax-red)" }} onClick={() => setNext("REJECTED")} disabled={loading}>Reject</button>
      </div>
      {error ? <div style={{ color: "#b91c1c", fontSize: 11 }}>{error}</div> : null}
    </div>
  );
}
