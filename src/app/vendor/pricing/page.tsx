"use client";
import { useEffect, useState } from "react";

type PaperPrice = { size: string; bw: number; color: number };
type GsmPrice = { gsm: string; add: number };
type FinishingPrice = { item: string; price: number; enabled: boolean };

const defaultPaperPrices: PaperPrice[] = [
  { size: "A4 Regular", bw: 1.5, color: 8 },
  { size: "A3 Large", bw: 4, color: 15 },
  { size: "A2 Poster", bw: 10, color: 45 },
  { size: "A5 Booklet", bw: 1, color: 5 },
  { size: "Legal", bw: 1.75, color: 10 },
  { size: "Letter", bw: 1.5, color: 8 },
];

const defaultGsmPrices: GsmPrice[] = [
  { gsm: "70 GSM", add: 0 },
  { gsm: "75 GSM", add: 0.2 },
  { gsm: "80 GSM", add: 0.5 },
  { gsm: "100 GSM", add: 1.5 },
  { gsm: "150 GSM", add: 3 },
  { gsm: "200+ GSM", add: 6 },
];

const defaultFinishing: FinishingPrice[] = [
  { item: "Spiral Binding", price: 25, enabled: true },
  { item: "Soft Binding", price: 25, enabled: true },
  { item: "Hard Binding", price: 25, enabled: true },
  { item: "Lamination", price: 25, enabled: true },
];

export default function PricingPage() {
  const [paperPrices, setPaperPrices] = useState<PaperPrice[]>(defaultPaperPrices);
  const [gsmPrices, setGsmPrices] = useState<GsmPrice[]>(defaultGsmPrices);
  const [finishingPrices, setFinishingPrices] = useState<FinishingPrice[]>(defaultFinishing);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");

  useEffect(() => {
    const load = async () => {
      const res = await fetch("/api/vendor/pricing");
      if (!res.ok) return;
      const data = await res.json();
      if (data.pricing?.paperPrices) setPaperPrices(data.pricing.paperPrices);
      if (data.pricing?.gsmPrices) setGsmPrices(data.pricing.gsmPrices);
      if (data.pricing?.finishingPrices) setFinishingPrices(data.pricing.finishingPrices);
    };
    load();
  }, []);

  const save = async () => {
    setMessage("");
    setSaving(true);
    try {
      const res = await fetch("/api/vendor/pricing", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ paperPrices, gsmPrices, finishingPrices }),
      });

      if (!res.ok) {
        setMessage("Failed to save pricing.");
        return;
      }

      setMessage("Pricing updated.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "32px" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <h2 className="fraunces text-ink" style={{ fontSize: "1.5rem", fontWeight: 700 }}>
          Pricing & Services
        </h2>
        <button className="btn-signup" style={{ fontSize: "11px", padding: "8px 24px" }} onClick={save} disabled={saving}>
          {saving ? "Saving..." : "Save Changes"}
        </button>
      </div>

      {message && <div className="paper-sheet" style={{ padding: "10px", color: message.includes("Failed") ? "#8b1e2b" : "#2d5a27" }}>{message}</div>}

      <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr", gap: "32px" }}>
        <section className="paper-sheet" style={{ padding: "24px" }}>
          <h3 className="fraunces text-ink mb-6" style={{ fontSize: "1.1rem" }}>Standard Printing Rates</h3>
          <table className="w-full" style={{ borderCollapse: "collapse" }}>
            <thead>
              <tr style={{ borderBottom: "1px solid rgba(0,0,0,0.05)" }}>
                <th className="label text-left" style={{ padding: "12px", fontSize: "9px" }}>PAPER SIZE</th>
                <th className="label text-left" style={{ padding: "12px", fontSize: "9px" }}>B&W (PER PAGE)</th>
                <th className="label text-left" style={{ padding: "12px", fontSize: "9px" }}>COLOR (PER PAGE)</th>
              </tr>
            </thead>
            <tbody>
              {paperPrices.map((row, i) => (
                <tr key={row.size} style={{ borderBottom: "1px solid rgba(0,0,0,0.03)" }}>
                  <td className="nav-text" style={{ padding: "12px", fontSize: "13px" }}>{row.size}</td>
                  <td style={{ padding: "12px" }}>
                    <input
                      type="number"
                      className="ink-input"
                      value={row.bw}
                      step="0.01"
                      onChange={(e) => {
                        const val = Number(e.target.value);
                        setPaperPrices((prev) => prev.map((x, idx) => (idx === i ? { ...x, bw: Number.isNaN(val) ? 0 : val } : x)));
                      }}
                      style={{ width: "90px", padding: "4px 8px", fontSize: "12px" }}
                    />
                  </td>
                  <td style={{ padding: "12px" }}>
                    <input
                      type="number"
                      className="ink-input"
                      value={row.color}
                      step="0.01"
                      onChange={(e) => {
                        const val = Number(e.target.value);
                        setPaperPrices((prev) => prev.map((x, idx) => (idx === i ? { ...x, color: Number.isNaN(val) ? 0 : val } : x)));
                      }}
                      style={{ width: "90px", padding: "4px 8px", fontSize: "12px" }}
                    />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </section>

        <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
          <section className="paper-sheet" style={{ padding: "24px" }}>
            <h3 className="fraunces text-ink mb-4" style={{ fontSize: "1rem" }}>GSM Add-ons</h3>
            <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
              {gsmPrices.map((row, i) => (
                <div key={row.gsm} style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <span className="lora" style={{ fontSize: "12px" }}>{row.gsm}</span>
                  <input
                    type="number"
                    className="ink-input"
                    value={row.add}
                    step="0.01"
                    onChange={(e) => {
                      const val = Number(e.target.value);
                      setGsmPrices((prev) => prev.map((x, idx) => (idx === i ? { ...x, add: Number.isNaN(val) ? 0 : val } : x)));
                    }}
                    style={{ width: "80px", padding: "2px 8px", fontSize: "11px" }}
                  />
                </div>
              ))}
            </div>
          </section>

          <section className="paper-sheet" style={{ padding: "24px" }}>
            <h3 className="fraunces text-ink mb-4" style={{ fontSize: "1rem" }}>Binding & Finishing</h3>
            <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
              {finishingPrices.map((row, i) => (
                <div key={row.item} style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <span className="nav-text" style={{ fontSize: "12px", fontWeight: 700 }}>{row.item}</span>
                  <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                    <input
                      type="number"
                      className="ink-input"
                      value={row.price}
                      step="0.01"
                      onChange={(e) => {
                        const val = Number(e.target.value);
                        setFinishingPrices((prev) => prev.map((x, idx) => (idx === i ? { ...x, price: Number.isNaN(val) ? 0 : val } : x)));
                      }}
                      style={{ width: "80px", padding: "2px 8px", fontSize: "11px" }}
                    />
                    <input
                      type="checkbox"
                      checked={row.enabled}
                      onChange={(e) => {
                        setFinishingPrices((prev) => prev.map((x, idx) => (idx === i ? { ...x, enabled: e.target.checked } : x)));
                      }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
