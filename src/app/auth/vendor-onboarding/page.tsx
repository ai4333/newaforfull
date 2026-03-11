"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

type VendorForm = {
  ownerName: string;
  phone: string;
  shopName: string;
  shopAddress: string;
  openingTime: string;
  closingTime: string;
  servicesAvailable: string;
  pricePerPageBW: string;
  pricePerPageColor: string;
  upiId: string;
};

const initialForm: VendorForm = {
  ownerName: "",
  phone: "",
  shopName: "",
  shopAddress: "",
  openingTime: "09:00",
  closingTime: "18:00",
  servicesAvailable: "BW Print, Color Print",
  pricePerPageBW: "1.5",
  pricePerPageColor: "8",
  upiId: "",
};

export default function VendorOnboardingPage() {
  const router = useRouter();
  const [form, setForm] = useState<VendorForm>(initialForm);
  const [approvalStatus, setApprovalStatus] = useState<string>("PENDING_APPROVAL");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        const res = await fetch("/api/vendor/onboarding");
        if (!res.ok) {
          setError("Unable to load vendor profile.");
          return;
        }

        const data = await res.json();
        const profile = data.profile;
        setApprovalStatus(profile?.approvalStatus || "PENDING_APPROVAL");

        if (profile) {
          setForm({
            ownerName: profile.ownerName || "",
            phone: profile.contactNumber || "",
            shopName: profile.shopName || "",
            shopAddress: profile.shopAddress || "",
            openingTime: profile.openingTime || "09:00",
            closingTime: profile.closingTime || "18:00",
            servicesAvailable: Array.isArray(profile.servicesAvailable) ? profile.servicesAvailable.join(", ") : "",
            pricePerPageBW: profile.pricePerPageBW?.toString() || "1.5",
            pricePerPageColor: profile.pricePerPageColor?.toString() || "8",
            upiId: profile.upiId || "",
          });
        }

        if (profile?.approvalStatus === "APPROVED") {
          router.replace("/vendor/dashboard");
        }
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [router]);

  const save = async () => {
    setError("");
    setSaving(true);
    try {
      const payload = {
        ownerName: form.ownerName,
        phone: form.phone,
        shopName: form.shopName,
        shopAddress: form.shopAddress,
        openingTime: form.openingTime,
        closingTime: form.closingTime,
        servicesAvailable: form.servicesAvailable.split(",").map((x) => x.trim()).filter(Boolean),
        pricePerPageBW: Number(form.pricePerPageBW),
        pricePerPageColor: Number(form.pricePerPageColor),
        upiId: form.upiId,
      };

      const res = await fetch("/api/vendor/onboarding", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        setError(data?.error || "Failed to submit onboarding");
        return;
      }

      setApprovalStatus("PENDING_APPROVAL");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <div className="paper-sheet">Loading vendor onboarding...</div>;
  }

  return (
    <div className="paper-sheet" style={{ maxWidth: "860px", margin: "24px auto", padding: "24px" }}>
      <h2 className="fraunces text-ink" style={{ fontSize: "1.6rem", marginBottom: "8px" }}>Vendor Onboarding</h2>
      <p className="lora italic" style={{ opacity: 0.7, marginBottom: "12px" }}>Submit your shop profile for admin approval.</p>
      <div className="label" style={{ marginBottom: "12px", fontSize: "10px" }}>Current status: {approvalStatus}</div>
      {error ? <div style={{ color: "var(--wax-red)", marginBottom: "12px", fontSize: "12px" }}>{error}</div> : null}

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
        <input className="ink-input" placeholder="Owner Name" value={form.ownerName} onChange={(e) => setForm({ ...form, ownerName: e.target.value })} />
        <input className="ink-input" placeholder="Phone" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} />
        <input className="ink-input" placeholder="Shop Name" value={form.shopName} onChange={(e) => setForm({ ...form, shopName: e.target.value })} />
        <input className="ink-input" placeholder="UPI ID" value={form.upiId} onChange={(e) => setForm({ ...form, upiId: e.target.value })} />
        <input className="ink-input" placeholder="Opening Time" value={form.openingTime} onChange={(e) => setForm({ ...form, openingTime: e.target.value })} />
        <input className="ink-input" placeholder="Closing Time" value={form.closingTime} onChange={(e) => setForm({ ...form, closingTime: e.target.value })} />
        <input className="ink-input" placeholder="BW price/page" value={form.pricePerPageBW} onChange={(e) => setForm({ ...form, pricePerPageBW: e.target.value })} />
        <input className="ink-input" placeholder="Color price/page" value={form.pricePerPageColor} onChange={(e) => setForm({ ...form, pricePerPageColor: e.target.value })} />
        <textarea className="ink-input" placeholder="Shop Address" rows={3} value={form.shopAddress} onChange={(e) => setForm({ ...form, shopAddress: e.target.value })} style={{ gridColumn: "1 / span 2" }} />
        <textarea className="ink-input" placeholder="Services (comma separated)" rows={2} value={form.servicesAvailable} onChange={(e) => setForm({ ...form, servicesAvailable: e.target.value })} style={{ gridColumn: "1 / span 2" }} />
      </div>

      <button className="btn-signup" style={{ marginTop: "16px" }} onClick={save} disabled={saving}>
        {saving ? "Submitting..." : "Submit For Approval"}
      </button>
    </div>
  );
}
