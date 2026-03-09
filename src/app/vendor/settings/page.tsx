"use client";
import React, { useEffect, useState } from "react";

type BusinessHour = {
  label: string;
  open: string;
  close: string;
};

type VendorSettings = {
  shopName: string;
  ownerName: string;
  contactNumber: string;
  shopAddress: string;
  acceptingOrders: boolean;
  expressDelivery: boolean;
  deliveryRadiusKm: number;
  businessHours: BusinessHour[];
};

const defaultBusinessHours: BusinessHour[] = [
  { label: "Monday - Friday", open: "09:00", close: "19:00" },
  { label: "Saturday", open: "09:00", close: "17:00" },
  { label: "Sunday", open: "10:00", close: "14:00" },
];

export default function ShopSettingsPage() {
  const [settings, setSettings] = useState<VendorSettings>({
    shopName: "",
    ownerName: "",
    contactNumber: "",
    shopAddress: "",
    acceptingOrders: true,
    expressDelivery: true,
    deliveryRadiusKm: 2.5,
    businessHours: defaultBusinessHours,
  });
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [message, setMessage] = useState("");

  useEffect(() => {
    const load = async () => {
      try {
        const res = await fetch("/api/vendor/settings");
        if (!res.ok) {
          return;
        }
        const data = await res.json();
        const row = data.settings;
        setSettings({
          shopName: row.shopName || "",
          ownerName: row.ownerName || "",
          contactNumber: row.contactNumber || "",
          shopAddress: row.shopAddress || "",
          acceptingOrders: row.acceptingOrders ?? true,
          expressDelivery: row.expressDelivery ?? true,
          deliveryRadiusKm: row.deliveryRadiusKm ?? 2.5,
          businessHours: Array.isArray(row.businessHours) && row.businessHours.length > 0 ? row.businessHours : defaultBusinessHours,
        });
      } finally {
        setIsLoading(false);
      }
    };

    load();
  }, []);

  const updateHour = (index: number, field: "open" | "close", value: string) => {
    setSettings((prev) => {
      const next = [...prev.businessHours];
      next[index] = { ...next[index], [field]: value };
      return { ...prev, businessHours: next };
    });
  };

  const saveAll = async () => {
    setMessage("");
    setIsSaving(true);
    try {
      const res = await fetch("/api/vendor/settings", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(settings),
      });

      if (!res.ok) {
        setMessage("Failed to save settings.");
        return;
      }

      setMessage("Settings saved.");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "32px" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <h2 className="fraunces text-ink" style={{ fontSize: "1.5rem", fontWeight: 700 }}>
          Shop Settings
        </h2>
        <button className="btn-signup" style={{ fontSize: "11px", padding: "8px 24px" }} onClick={saveAll} disabled={isSaving || isLoading}>
          {isSaving ? "Saving..." : "Save All Changes"}
        </button>
      </div>

      {message && (
        <div className="paper-sheet" style={{ padding: "10px 14px", color: message.includes("Failed") ? "#8b1e2b" : "#2d5a27" }}>
          {message}
        </div>
      )}

      <div style={{ display: "grid", gridTemplateColumns: "1.5fr 1fr", gap: "32px" }}>
        <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
          <section className="paper-sheet" style={{ padding: "24px" }}>
            <h3 className="fraunces text-ink mb-6" style={{ fontSize: "1.1rem" }}>
              General Information
            </h3>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
              <div style={{ gridColumn: "span 2" }}>
                <label className="ink-label">Shop Name</label>
                <input type="text" className="ink-input" value={settings.shopName} onChange={(e) => setSettings({ ...settings, shopName: e.target.value })} />
              </div>
              <div>
                <label className="ink-label">Owner Name</label>
                <input type="text" className="ink-input" value={settings.ownerName} onChange={(e) => setSettings({ ...settings, ownerName: e.target.value })} />
              </div>
              <div>
                <label className="ink-label">Contact Number</label>
                <input type="tel" className="ink-input" value={settings.contactNumber} onChange={(e) => setSettings({ ...settings, contactNumber: e.target.value })} />
              </div>
              <div style={{ gridColumn: "span 2" }}>
                <label className="ink-label">Shop Address</label>
                <textarea className="ink-input" rows={2} value={settings.shopAddress} onChange={(e) => setSettings({ ...settings, shopAddress: e.target.value })}></textarea>
              </div>
            </div>
          </section>

          <section className="paper-sheet" style={{ padding: "24px" }}>
            <h3 className="fraunces text-ink mb-6" style={{ fontSize: "1.1rem" }}>
              Business Hours
            </h3>
            <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
              {settings.businessHours.map((day, i) => (
                <div key={day.label} style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <span className="lora" style={{ fontSize: "13px", fontWeight: 600 }}>
                    {day.label}
                  </span>
                  <div style={{ display: "flex", gap: "8px", alignItems: "center" }}>
                    <input
                      type="time"
                      className="ink-input text-center"
                      value={day.open}
                      onChange={(e) => updateHour(i, "open", e.target.value)}
                      style={{ width: "100px", padding: "4px" }}
                    />
                    <span className="label" style={{ fontSize: "10px" }}>
                      to
                    </span>
                    <input
                      type="time"
                      className="ink-input text-center"
                      value={day.close}
                      onChange={(e) => updateHour(i, "close", e.target.value)}
                      style={{ width: "100px", padding: "4px" }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </section>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
          <section className="paper-sheet" style={{ padding: "24px" }}>
            <h3 className="fraunces text-ink mb-6" style={{ fontSize: "1rem" }}>
              Order Management
            </h3>
            <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
              <label style={{ display: "flex", justifyContent: "space-between", alignItems: "center", cursor: "pointer" }}>
                <div>
                  <div className="nav-text" style={{ fontSize: "13px", fontWeight: 700 }}>
                    Accepting Orders
                  </div>
                  <div className="label" style={{ fontSize: "9px", opacity: 0.5 }}>
                    Disable to pause new incoming jobs
                  </div>
                </div>
                <input type="checkbox" checked={settings.acceptingOrders} onChange={(e) => setSettings({ ...settings, acceptingOrders: e.target.checked })} />
              </label>
              <label style={{ display: "flex", justifyContent: "space-between", alignItems: "center", cursor: "pointer" }}>
                <div>
                  <div className="nav-text" style={{ fontSize: "13px", fontWeight: 700 }}>
                    Express Delivery
                  </div>
                  <div className="label" style={{ fontSize: "9px", opacity: 0.5 }}>
                    Toggle same-day priority service
                  </div>
                </div>
                <input type="checkbox" checked={settings.expressDelivery} onChange={(e) => setSettings({ ...settings, expressDelivery: e.target.checked })} />
              </label>
              <div>
                <label className="ink-label">Delivery Radius (KM)</label>
                <input
                  type="number"
                  className="ink-input"
                  value={settings.deliveryRadiusKm}
                  min={0}
                  max={50}
                  step={0.1}
                  onChange={(e) => setSettings({ ...settings, deliveryRadiusKm: Number(e.target.value) })}
                  style={{ width: "100px" }}
                />
              </div>
            </div>
          </section>

          <section className="paper-sheet" style={{ padding: "24px", border: "1px solid rgba(139,30,43,0.1)" }}>
            <h3 className="fraunces text-ink mb-2" style={{ fontSize: "1rem", color: "var(--wax-red)" }}>
              Notice
            </h3>
            <p className="lora italic opacity-50 mb-4" style={{ fontSize: "11px" }}>
              Changing order acceptance settings affects customer experience immediately.
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}
