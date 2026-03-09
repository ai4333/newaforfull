"use client";
import { Suspense, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";

function RoleSyncInner() {
  const router = useRouter();
  const params = useSearchParams();

  useEffect(() => {
    const run = async () => {
      const roleParam = params.get("role");
      const role = roleParam === "vendor" ? "VENDOR" : "STUDENT";

      await fetch("/api/user/role", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ role }),
      });

      router.replace(role === "VENDOR" ? "/vendor/dashboard" : "/student/dashboard");
    };

    run();
  }, [params, router]);

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
