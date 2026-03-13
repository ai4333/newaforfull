"use client";

import { useEffect, useState } from "react";
import { signOut } from "next-auth/react";

type Profile = {
  name: string;
  phone: string;
  college: string;
  university: string;
  course: string;
  year: string;
  defaultDeliveryAddress: string;
};

const emptyProfile: Profile = {
  name: "",
  phone: "",
  college: "",
  university: "",
  course: "",
  year: "",
  defaultDeliveryAddress: "",
};

export default function ProfilePage() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [profile, setProfile] = useState<Profile>(emptyProfile);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      setError("");
      try {
        const res = await fetch("/api/student/profile", { cache: "no-store" });
        if (!res.ok) {
          const payload = await res.json().catch(() => ({}));
          setError(payload?.error || "Failed to load profile");
          return;
        }

        const data = await res.json();
        const p = data?.profile || {};
        setProfile({
          name: p.name || "",
          phone: p.phone || "",
          college: p.college || "",
          university: p.university || "",
          course: p.course || "",
          year: p.year || "",
          defaultDeliveryAddress: p.defaultDeliveryAddress || "",
        });
      } finally {
        setLoading(false);
      }
    };

    load();
  }, []);

  const save = async () => {
    setSaving(true);
    setError("");
    setSuccess("");
    try {
      const res = await fetch("/api/student/profile", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(profile),
      });

      if (!res.ok) {
        const payload = await res.json().catch(() => ({}));
        const detailText = payload?.details
          ? Object.entries(payload.details)
              .map(([field, msgs]) => `${field}: ${(msgs as string[]).join(", ")}`)
              .join(" | ")
          : "";
        setError(payload?.error ? `${payload.error}${detailText ? ` - ${detailText}` : ""}` : "Failed to update profile");
        return;
      }

      setSuccess("Profile updated successfully.");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <div className="paper-sheet">Loading profile...</div>;
  }

  return (
    <div className="paper-sheet" style={{ maxWidth: 900 }}>
      <h2 className="fraunces text-ink" style={{ fontSize: "1.6rem", marginBottom: 8 }}>Student Profile</h2>
      <p className="lora italic" style={{ opacity: 0.7, marginBottom: 14 }}>Your real profile data is shown and saved here.</p>

      {error ? <div style={{ color: "var(--wax-red)", marginBottom: 10, fontSize: 12 }}>{error}</div> : null}
      {success ? <div style={{ color: "#166534", marginBottom: 10, fontSize: 12 }}>{success}</div> : null}

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
        <input className="ink-input" placeholder="Full Name" value={profile.name} onChange={(e) => setProfile((p) => ({ ...p, name: e.target.value }))} />
        <input className="ink-input" placeholder="Phone" value={profile.phone} onChange={(e) => setProfile((p) => ({ ...p, phone: e.target.value }))} />
        <input className="ink-input" placeholder="College" value={profile.college} onChange={(e) => setProfile((p) => ({ ...p, college: e.target.value }))} />
        <input className="ink-input" placeholder="University" value={profile.university} onChange={(e) => setProfile((p) => ({ ...p, university: e.target.value }))} />
        <input className="ink-input" placeholder="Course" value={profile.course} onChange={(e) => setProfile((p) => ({ ...p, course: e.target.value }))} />
        <input className="ink-input" placeholder="Year" value={profile.year} onChange={(e) => setProfile((p) => ({ ...p, year: e.target.value }))} />
        <textarea
          className="ink-input"
          placeholder="Default Delivery Address"
          rows={3}
          value={profile.defaultDeliveryAddress}
          onChange={(e) => setProfile((p) => ({ ...p, defaultDeliveryAddress: e.target.value }))}
          style={{ gridColumn: "1 / span 2" }}
        />
      </div>

      <div style={{ display: "flex", gap: 10, marginTop: 16 }}>
        <button className="btn-signup" onClick={save} disabled={saving}>{saving ? "Saving..." : "Update Profile"}</button>
        <button className="btn-signin" onClick={() => signOut({ callbackUrl: "/auth/login" })}>Logout</button>
      </div>
    </div>
  );
}
