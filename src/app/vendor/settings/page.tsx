"use client";

import { useEffect, useState } from "react";

export default function ShopSettingsPage() {
  const [acceptingOrders, setAcceptingOrders] = useState(true);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [message, setMessage] = useState("");

  useEffect(() => {
    const load = async () => {
      try {
        const res = await fetch("/api/vendor/settings");
        if (!res.ok) return;
        const data = await res.json();
        setAcceptingOrders(Boolean(data?.settings?.acceptingOrders));
      } finally {
        setIsLoading(false);
      }
    };

    load();
  }, []);

  const save = async () => {
    setMessage("");
    setIsSaving(true);
    try {
      const res = await fetch("/api/vendor/settings", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ acceptingOrders }),
      });

      if (!res.ok) {
        const payload = await res.json().catch(() => ({}));
        setMessage(payload?.error || "Failed to update shop status.");
        return;
      }

      setMessage("Shop status updated.");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div style={{ display: "grid", gap: "16px", maxWidth: "760px" }}>
      <h2 className="fraunces text-ink" style={{ fontSize: "1.5rem", fontWeight: 700 }}>Shop Settings</h2>

      {message ? (
        <div className="paper-sheet" style={{ padding: "10px", color: message.toLowerCase().includes("fail") ? "#8b1e2b" : "#2d5a27" }}>
          {message}
        </div>
      ) : null}

      <section className="paper-sheet" style={{ padding: "24px" }}>
        <h3 className="fraunces text-ink" style={{ fontSize: "1.1rem", marginBottom: "10px" }}>Shop Status</h3>
        <p className="lora italic" style={{ opacity: 0.7, fontSize: "12px", marginBottom: "16px" }}>
          Set your shop Online or Offline. Offline shops are hidden from students and do not receive new orders.
        </p>

        <label style={{ display: "flex", justifyContent: "space-between", alignItems: "center", cursor: "pointer" }}>
          <div>
            <div className="nav-text" style={{ fontSize: "13px", fontWeight: 700 }}>
              {acceptingOrders ? "Online" : "Offline"}
            </div>
            <div className="label" style={{ fontSize: "9px", opacity: 0.5 }}>
              {acceptingOrders ? "Students can place orders" : "New orders are paused"}
            </div>
          </div>
          <input
            type="checkbox"
            checked={acceptingOrders}
            disabled={isLoading}
            onChange={(e) => setAcceptingOrders(e.target.checked)}
          />
        </label>

        <button className="btn-signup" style={{ marginTop: "18px" }} onClick={save} disabled={isSaving || isLoading}>
          {isSaving ? "Saving..." : "Save Shop Status"}
        </button>
      </section>
    </div>
  );
}
