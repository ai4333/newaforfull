"use client";

import { useState } from "react";

export default function VendorSupportPage() {
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");
  const [saving, setSaving] = useState(false);
  const [result, setResult] = useState("");

  const submit = async () => {
    setResult("");
    setSaving(true);
    try {
      const res = await fetch("/api/vendor/support", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ subject, message }),
      });

      const payload = await res.json().catch(() => ({}));
      if (!res.ok) {
        setResult(payload?.error || "Failed to submit support request.");
        return;
      }

      setResult(`Support request submitted. Ticket ID: ${payload.ticketId}`);
      setSubject("");
      setMessage("");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div style={{ display: "grid", gap: "20px", gridTemplateColumns: "minmax(280px, 1fr) 1.4fr" }}>
      <section className="paper-sheet" style={{ padding: "20px" }}>
        <h3 className="fraunces text-ink" style={{ fontSize: "1.1rem", marginBottom: "10px" }}>Contact Support</h3>
        <div style={{ fontSize: "13px", display: "grid", gap: "8px" }}>
          <div><strong>Email:</strong> support@aforprint.com</div>
          <div><strong>Hours:</strong> Mon-Sat, 9:00 AM to 8:00 PM</div>
          <div><strong>For payout issues:</strong> payouts@aforprint.com</div>
        </div>
      </section>

      <section className="paper-sheet" style={{ padding: "24px" }}>
        <h2 className="fraunces text-ink" style={{ fontSize: "1.4rem", marginBottom: "12px" }}>Raise a Support Request</h2>
        {result ? <div style={{ marginBottom: "10px", color: result.toLowerCase().includes("failed") ? "var(--wax-red)" : "#166534", fontSize: "12px" }}>{result}</div> : null}
        <div style={{ display: "grid", gap: "10px" }}>
          <input className="ink-input" placeholder="Subject" value={subject} onChange={(e) => setSubject(e.target.value)} />
          <textarea className="ink-input" placeholder="Describe your issue" rows={5} value={message} onChange={(e) => setMessage(e.target.value)} />
          <button className="btn-signup" onClick={submit} disabled={saving}>{saving ? "Submitting..." : "Submit Ticket"}</button>
        </div>

        <div style={{ marginTop: "20px" }}>
          <h4 className="fraunces text-ink" style={{ fontSize: "1rem", marginBottom: "8px" }}>FAQ</h4>
          <div style={{ display: "grid", gap: "8px", fontSize: "12px" }}>
            <div><strong>When are payouts processed?</strong> Weekly after completed orders are reconciled.</div>
            <div><strong>Why is an order not visible?</strong> Check if your shop status is Online and order payment is completed.</div>
            <div><strong>How to pause orders?</strong> Go to Shop Settings and set status to Offline.</div>
          </div>
        </div>
      </section>
    </div>
  );
}
