"use client";
import { useState } from "react";

type AdminUserStateActionProps = {
  userId: string;
  isSuspended: boolean;
};

export function AdminUserStateAction({ userId, isSuspended }: AdminUserStateActionProps) {
  const [loading, setLoading] = useState(false);
  const [localSuspended, setLocalSuspended] = useState(isSuspended);

  const toggle = async () => {
    setLoading(true);
    try {
      const next = !localSuspended;
      const res = await fetch("/api/admin/users/status", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId, suspend: next }),
      });

      if (res.ok) {
        setLocalSuspended(next);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <button
      className="btn-signin"
      style={{ padding: "4px 8px", fontSize: "9px", color: localSuspended ? "#2d5a27" : "#8b1e2b" }}
      onClick={toggle}
      disabled={loading}
    >
      {loading ? "Saving..." : localSuspended ? "Reactivate" : "Suspend"}
    </button>
  );
}
