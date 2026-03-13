"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

type StudentProfile = {
  name: string;
  phone: string;
  college: string;
  university: string;
  course: string;
  year: string;
  defaultDeliveryAddress: string;
};

const initialForm: StudentProfile = {
  name: "",
  phone: "",
  college: "",
  university: "",
  course: "",
  year: "",
  defaultDeliveryAddress: "",
};

export default function StudentOnboardingPage() {
  const router = useRouter();
  const [form, setForm] = useState<StudentProfile>(initialForm);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [fieldErrors, setFieldErrors] = useState<Record<string, string[]>>({});

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        const res = await fetch("/api/student/profile");
        if (!res.ok) {
          setError("Unable to load your profile. Please try again.");
          return;
        }

        const data = await res.json();
        if (data.completed) {
          router.replace("/student/dashboard");
          return;
        }

        if (data.profile) {
          setForm({
            name: data.profile.name || "",
            phone: data.profile.phone || "",
            college: data.profile.college || "",
            university: data.profile.university || "",
            course: data.profile.course || "",
            year: data.profile.year || "",
            defaultDeliveryAddress: data.profile.defaultDeliveryAddress || "",
          });
        }
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [router]);

  const onSave = async () => {
    setSaving(true);
    setError("");
    setFieldErrors({});
    try {
      const res = await fetch("/api/student/profile", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      if (!res.ok) {
        const payload = await res.json().catch(() => ({}));
        setError(payload?.error || "Unable to save profile");
        if (payload?.details && typeof payload.details === "object") {
          setFieldErrors(payload.details as Record<string, string[]>);
        }
        return;
      }
      router.replace("/student/dashboard");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <div className="paper-sheet">Loading onboarding...</div>;
  }

  return (
    <div className="paper-sheet" style={{ maxWidth: "760px", margin: "0 auto", padding: "24px" }}>
      <h2 className="fraunces text-ink" style={{ fontSize: "1.6rem", marginBottom: "8px" }}>Student Onboarding</h2>
      <p className="lora italic" style={{ opacity: 0.7, marginBottom: "16px" }}>Complete your profile to start placing print orders.</p>
      {error ? <div style={{ color: "var(--wax-red)", marginBottom: "12px", fontSize: "12px" }}>{error}</div> : null}
      {Object.keys(fieldErrors).length > 0 ? (
        <div style={{ color: "var(--wax-red)", marginBottom: "12px", fontSize: "12px" }}>
          {Object.entries(fieldErrors).map(([field, messages]) => (
            <div key={field}>{field}: {messages.join(", ")}</div>
          ))}
        </div>
      ) : null}

      <div className="admin-form-grid" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
        <input className="ink-input" placeholder="Full Name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
        <input className="ink-input" placeholder="Phone" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} />
        <input className="ink-input" placeholder="College" value={form.college} onChange={(e) => setForm({ ...form, college: e.target.value })} />
        <input className="ink-input" placeholder="University" value={form.university} onChange={(e) => setForm({ ...form, university: e.target.value })} />
        <input className="ink-input" placeholder="Course" value={form.course} onChange={(e) => setForm({ ...form, course: e.target.value })} />
        <input className="ink-input" placeholder="Year" value={form.year} onChange={(e) => setForm({ ...form, year: e.target.value })} />
        <textarea
          className="ink-input"
          placeholder="Default Delivery Address"
          value={form.defaultDeliveryAddress}
          onChange={(e) => setForm({ ...form, defaultDeliveryAddress: e.target.value })}
          rows={3}
          style={{ gridColumn: "1 / span 2" }}
        />
      </div>

      <button className="btn-signup" style={{ marginTop: "16px" }} onClick={onSave} disabled={saving}>
        {saving ? "Saving..." : "Complete Onboarding"}
      </button>
    </div>
  );
}
