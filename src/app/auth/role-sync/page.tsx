"use client";
import { Suspense, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";

function RoleSyncInner() {
  const router = useRouter();
  const params = useSearchParams();
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    const run = async () => {
      try {
        const roleParam = params.get("role");
        const role = roleParam === "vendor" ? "VENDOR" : "STUDENT";

        let lastError = "Unable to verify your session.";

        for (let attempt = 0; attempt < 4; attempt += 1) {
          const response = await fetch("/api/user/role", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ role }),
            credentials: "include",
          });

          if (response.ok) {
            if (!cancelled) {
              if (role === "VENDOR") {
                const vendorRes = await fetch("/api/vendor/onboarding", { credentials: "include" });
                if (vendorRes.ok) {
                  const vendorData = await vendorRes.json();
                  if (vendorData?.profile?.approvalStatus === "APPROVED") {
                    router.replace("/vendor/dashboard");
                  } else {
                    router.replace("/auth/vendor-onboarding");
                  }
                } else {
                  router.replace("/auth/vendor-onboarding");
                }
              } else {
                const profileRes = await fetch("/api/student/profile", { credentials: "include" });
                if (profileRes.ok) {
                  const profileData = await profileRes.json();
                  router.replace(profileData?.completed ? "/student/dashboard" : "/student/onboarding");
                } else {
                  router.replace("/student/onboarding");
                }
              }
            }
            return;
          }

          const payload = await response.json().catch(() => ({}));
          if (typeof payload?.error === "string" && payload.error) {
            lastError = payload.error;
          }

          await new Promise((resolve) => setTimeout(resolve, 350));
        }

        if (!cancelled) {
          setError(lastError);
        }
      } catch {
        if (!cancelled) {
          setError("Role sync failed. Please sign in again.");
        }
      }
    };

    run();
    return () => {
      cancelled = true;
    };
  }, [params, router]);

  if (error) {
    return (
      <div className="parchment" style={{ maxWidth: "520px", padding: "40px", textAlign: "center" }}>
        <div className="paper-fold"></div>
        <div className="card-lines"></div>
        <h2 className="fraunces text-ink" style={{ fontSize: "1.6rem", fontWeight: 900, marginBottom: "8px" }}>
          Sign-in Needs One More Try
        </h2>
        <p className="lora" style={{ color: "var(--ink-secondary)", fontStyle: "italic", marginBottom: "16px" }}>
          {error}
        </p>
        <button className="btn-signup" onClick={() => router.replace("/auth/login")} style={{ cursor: "pointer" }}>
          Return to Login
        </button>
      </div>
    );
  }

  return (
    <div className="parchment" style={{ maxWidth: "520px", padding: "40px", textAlign: "center" }}>
      <div className="paper-fold"></div>
      <div className="card-lines"></div>
      <div className="founder-monogram" style={{ margin: "0 auto 24px", width: "80px", height: "80px" }}>
        A
      </div>
      <h2 className="fraunces text-ink" style={{ fontSize: "2rem", fontWeight: 900, marginBottom: "8px" }}>
        Preparing Workspace
      </h2>
      <p className="lora" style={{ color: "var(--ink-secondary)", fontStyle: "italic" }}>
        Syncing account role and routing you to the console.
      </p>
    </div>
  );
}

export default function RoleSyncPage() {
  return (
    <Suspense
      fallback={
        <div className="parchment" style={{ maxWidth: "520px", padding: "40px", textAlign: "center" }}>
          <h2 className="fraunces text-ink" style={{ fontSize: "2rem", fontWeight: 900 }}>Preparing Workspace</h2>
        </div>
      }
    >
      <RoleSyncInner />
    </Suspense>
  );
}
