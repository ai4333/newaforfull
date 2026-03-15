"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";

type VendorForm = {
  ownerName: string;
  phone: string;
  shopName: string;
  shopAddress: string;
  mapLocation: string;
  verificationId: string;
};

const initialForm: VendorForm = {
  ownerName: "",
  phone: "",
  shopName: "",
  shopAddress: "",
  mapLocation: "",
  verificationId: "",
};

export default function VendorOnboardingPage() {
  const { data: session } = useSession();
  const router = useRouter();
  const [form, setForm] = useState<VendorForm>(initialForm);
  const [approvalStatus, setApprovalStatus] = useState<string>("PENDING_APPROVAL");
  const [completed, setCompleted] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [fieldErrors, setFieldErrors] = useState<Record<string, string[]>>({});

  const isPendingLocked = useMemo(
    () => approvalStatus === "PENDING_APPROVAL" && completed,
    [approvalStatus, completed]
  );

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
        setCompleted(Boolean(data?.completed));

        if (profile) {
          setForm({
            ownerName: profile.ownerName || "",
            phone: profile.contactNumber || "",
            shopName: profile.shopName || "",
            shopAddress: profile.shopAddress || "",
            mapLocation: profile.mapLocation || "",
            verificationId: profile.verificationId || "",
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

  useEffect(() => {
    if (!isPendingLocked) return;

    const timer = setInterval(async () => {
      const res = await fetch("/api/vendor/onboarding", { cache: "no-store" });
      if (!res.ok) return;
      const data = await res.json();
      const status = data?.profile?.approvalStatus;
      setApprovalStatus(status || "PENDING_APPROVAL");
      if (status === "APPROVED") {
        router.replace("/vendor/dashboard");
      }
    }, 8000);

    return () => clearInterval(timer);
  }, [isPendingLocked, router]);

  const save = async () => {
    setError("");
    setSuccess("");
    setFieldErrors({});
    setSaving(true);
    try {
      const payload = {
        ownerName: form.ownerName,
        phone: form.phone,
        shopName: form.shopName,
        shopAddress: form.shopAddress,
        mapLocation: form.mapLocation || undefined,
        verificationId: form.verificationId,
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
      setCompleted(true);
      setSuccess("Application submitted successfully.");
    } catch {
      setError("Submission failed due to a network/server issue. Please retry.");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <div className="paper-sheet">Loading vendor onboarding...</div>;
  }

  if (isPendingLocked) {
    return (
      <div style={{ maxWidth: 760, margin: "40px auto" }}>
        <div className="paper-sheet" style={{ padding: 24 }}>
          <h2 className="fraunces text-ink" style={{ fontSize: "1.7rem", marginBottom: 8 }}>Vendor Application Submitted</h2>
          <div className="label" style={{ marginBottom: 12 }}>Status: Pending Approval</div>
          <p className="lora italic" style={{ opacity: 0.75 }}>
            Your shop is currently under review. You will be notified once approved.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div style={{ maxWidth: "980px", margin: "24px auto", display: "grid", gap: "16px" }}>
      <section className="paper-sheet" style={{ padding: "20px" }}>
        <h2 className="fraunces text-ink" style={{ fontSize: "1.7rem", marginBottom: "8px" }}>Vendor Registration</h2>
        <p className="lora italic" style={{ opacity: 0.75, marginBottom: "10px" }}>Submit your shop identity details for admin approval.</p>
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
        <h3 className="fraunces text-ink" style={{ fontSize: "1.1rem", marginBottom: "12px" }}>Business Identity</h3>
        <div style={{ display: "grid", gap: 12, gridTemplateColumns: "repeat(auto-fit,minmax(220px,1fr))" }}>
          <input className="ink-input" placeholder="Shop Name" value={form.shopName} onChange={(e) => setForm({ ...form, shopName: e.target.value })} />
          <input className="ink-input" placeholder="Owner Name" value={form.ownerName} onChange={(e) => setForm({ ...form, ownerName: e.target.value })} />
          <input className="ink-input" placeholder="Phone Number" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} />
          <input className="ink-input" value={session?.user?.email || ""} disabled />
          <textarea className="ink-input" placeholder="Shop Address" rows={3} value={form.shopAddress} onChange={(e) => setForm({ ...form, shopAddress: e.target.value })} style={{ gridColumn: "1 / -1" }} />
          <input className="ink-input" placeholder="Google Map Location Link (optional)" value={form.mapLocation} onChange={(e) => setForm({ ...form, mapLocation: e.target.value })} style={{ gridColumn: "1 / -1" }} />
          <input className="ink-input" placeholder="ID / Verification Number" value={form.verificationId} onChange={(e) => setForm({ ...form, verificationId: e.target.value })} style={{ gridColumn: "1 / -1" }} />
        </div>
      </section>

      <div style={{ display: "flex", justifyContent: "flex-end" }}>
        <button className="btn-signup" onClick={save} disabled={saving}>{saving ? "Submitting..." : "Submit for Approval"}</button>
      </div>
    </div>
  );
}
