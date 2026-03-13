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
  pricePerPageBW: "2",
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
  const [success, setSuccess] = useState("");
  const [fieldErrors, setFieldErrors] = useState<Record<string, string[]>>({});

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      setError("");
      try {
        const res = await fetch("/api/vendor/onboarding", { cache: "no-store" });
        if (!res.ok) {
          const payload = await res.json().catch(() => ({}));
          setError(payload?.error || "Unable to load vendor profile.");
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
            pricePerPageBW: profile.pricePerPageBW?.toString() || "2",
            pricePerPageColor: profile.pricePerPageColor?.toString() || "8",
            upiId: profile.upiId || "",
          });
        }

        if (profile?.approvalStatus === "APPROVED") {
          router.replace("/vendor/dashboard");
        }
      } catch {
        setError("Unable to load vendor profile. Please refresh and retry.");
      } finally {
        setLoading(false);
      }
    };

    load();
  }, [router]);

  const save = async () => {
    setError("");
    setSuccess("");
    setFieldErrors({});
    setSaving(true);
    try {
      const pricePerPageBW = Number(form.pricePerPageBW);
      const pricePerPageColor = Number(form.pricePerPageColor);
      const cleanedServices = form.servicesAvailable.split(",").map((x) => x.trim()).filter(Boolean);

      if (!Number.isFinite(pricePerPageBW) || !Number.isFinite(pricePerPageColor)) {
        setError("BW and Color prices must be valid numbers.");
        return;
      }

      if (cleanedServices.length === 0) {
        setError("Add at least one service in Services Available.");
        return;
      }

      const payload = {
        ownerName: form.ownerName,
        phone: form.phone,
        shopName: form.shopName,
        shopAddress: form.shopAddress,
        openingTime: form.openingTime,
        closingTime: form.closingTime,
        servicesAvailable: cleanedServices,
        pricePerPageBW,
        pricePerPageColor,
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
        if (data?.details && typeof data.details === "object") {
          setFieldErrors(data.details as Record<string, string[]>);
        }
        return;
      }

      setApprovalStatus("PENDING_APPROVAL");
      setSuccess("Request sent successfully. Your profile is pending admin approval.");
    } catch {
      setError("Submission failed due to a network/server issue. Please retry.");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <div className="paper-sheet">Loading vendor onboarding...</div>;
  }

  return (
    <div style={{ maxWidth: "980px", margin: "24px auto", display: "grid", gap: "16px" }}>
      <section className="paper-sheet" style={{ padding: "20px" }}>
        <h2 className="fraunces text-ink" style={{ fontSize: "1.7rem", marginBottom: "8px" }}>Complete Vendor Registration</h2>
        <p className="lora italic" style={{ opacity: 0.75, marginBottom: "10px" }}>Add your print shop profile and submit for admin approval.</p>
        <div className="label" style={{ fontSize: "10px" }}>Current status: {approvalStatus}</div>
      </section>

      {error ? <div className="paper-sheet" style={{ color: "var(--wax-red)", fontSize: "12px", padding: "12px" }}>{error}</div> : null}
      {success ? <div className="paper-sheet" style={{ color: "#166534", fontSize: "12px", padding: "12px" }}>{success}</div> : null}
      {Object.keys(fieldErrors).length > 0 ? (
        <div className="paper-sheet" style={{ fontSize: "12px", color: "var(--wax-red)", padding: "12px" }}>
          {Object.entries(fieldErrors).map(([field, messages]) => (
            <div key={field}>{field}: {messages.join(", ")}</div>
          ))}
        </div>
      ) : null}

      <section className="paper-sheet" style={{ padding: "20px" }}>
        <h3 className="fraunces text-ink" style={{ fontSize: "1.1rem", marginBottom: "12px" }}>Owner & Contact</h3>
        <div className="admin-grid-3" style={{ gap: "12px", gridTemplateColumns: "repeat(auto-fit,minmax(220px,1fr))" }}>
          <input className="ink-input" placeholder="Owner Name" value={form.ownerName} onChange={(e) => setForm({ ...form, ownerName: e.target.value })} />
          <input className="ink-input" placeholder="Phone Number" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} />
          <input className="ink-input" placeholder="UPI ID" value={form.upiId} onChange={(e) => setForm({ ...form, upiId: e.target.value })} />
        </div>
      </section>

      <section className="paper-sheet" style={{ padding: "20px" }}>
        <h3 className="fraunces text-ink" style={{ fontSize: "1.1rem", marginBottom: "12px" }}>Shop Details</h3>
        <div style={{ display: "grid", gap: "12px" }}>
          <input className="ink-input" placeholder="Shop Name" value={form.shopName} onChange={(e) => setForm({ ...form, shopName: e.target.value })} />
          <textarea className="ink-input" placeholder="Shop Address" rows={3} value={form.shopAddress} onChange={(e) => setForm({ ...form, shopAddress: e.target.value })} />
          <textarea className="ink-input" placeholder="Services (comma separated)" rows={2} value={form.servicesAvailable} onChange={(e) => setForm({ ...form, servicesAvailable: e.target.value })} />
        </div>
      </section>

      <section className="paper-sheet" style={{ padding: "20px" }}>
        <h3 className="fraunces text-ink" style={{ fontSize: "1.1rem", marginBottom: "12px" }}>Hours & Pricing</h3>
        <div className="admin-grid-4" style={{ gap: "12px", gridTemplateColumns: "repeat(auto-fit,minmax(160px,1fr))" }}>
          <input className="ink-input" placeholder="Opening Time" value={form.openingTime} onChange={(e) => setForm({ ...form, openingTime: e.target.value })} />
          <input className="ink-input" placeholder="Closing Time" value={form.closingTime} onChange={(e) => setForm({ ...form, closingTime: e.target.value })} />
          <input className="ink-input" placeholder="BW price/page" value={form.pricePerPageBW} onChange={(e) => setForm({ ...form, pricePerPageBW: e.target.value })} />
          <input className="ink-input" placeholder="Color price/page" value={form.pricePerPageColor} onChange={(e) => setForm({ ...form, pricePerPageColor: e.target.value })} />
        </div>
      </section>

      <div style={{ display: "flex", justifyContent: "flex-end" }}>
        <button className="btn-signup" onClick={save} disabled={saving}>
          {saving ? "Submitting..." : "Submit for Approval"}
        </button>
      </div>
    </div>
  );
}
