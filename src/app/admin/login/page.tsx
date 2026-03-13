"use client";

import { Suspense, useEffect, useMemo } from "react";
import Link from "next/link";
import { signIn, useSession } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";

function AdminLoginInner() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const params = useSearchParams();

  const nextUrl = useMemo(() => {
    const next = params.get("next");
    if (next && next.startsWith("/admin")) return next;
    return "/admin/dashboard";
  }, [params]);

  useEffect(() => {
    if (status !== "authenticated") {
      return;
    }

    const role = (session?.user as { role?: string } | undefined)?.role;
    if (role === "ADMIN") {
      router.replace(nextUrl);
    }
  }, [status, session, router, nextUrl]);

  const role = (session?.user as { role?: string } | undefined)?.role;
  const blocked = status === "authenticated" && role !== "ADMIN";

  return (
    <div style={{ display: "flex", alignItems: "center", justifyContent: "center", minHeight: "100vh", padding: "24px" }}>
      <div className="parchment reveal-up active" style={{ maxWidth: "520px", width: "100%", padding: "36px", textAlign: "center", position: "relative" }}>
        <div className="paper-fold"></div>
        <div className="card-lines"></div>

        <div className="founder-monogram" style={{ margin: "0 auto 20px", width: "80px", height: "80px" }}>A</div>
        <h1 className="fraunces text-ink" style={{ fontSize: "2rem", fontWeight: 900, marginBottom: "10px" }}>Admin Console Login</h1>
        <p className="lora italic" style={{ opacity: 0.7, marginBottom: "24px" }}>
          Sign in with your allowlisted admin account to access oversight controls.
        </p>

        {blocked ? (
          <div className="paper-sheet" style={{ padding: "14px", border: "1px solid rgba(139,30,43,0.2)", color: "var(--wax-red)", fontSize: "12px", marginBottom: "16px" }}>
            Access denied. You are not an admin.
          </div>
        ) : null}

        <button
          className="btn-signup"
          style={{ width: "100%", justifyContent: "center", padding: "14px", fontSize: "13px", cursor: "pointer" }}
          onClick={() => signIn("google", { callbackUrl: nextUrl, prompt: "select_account" })}
        >
          Continue with Google
        </button>

        <div style={{ marginTop: "16px" }}>
          <Link href="/auth/login" className="label" style={{ fontSize: "10px", textDecoration: "none", borderBottom: "1px solid", opacity: 0.7 }}>
            Open regular login
          </Link>
        </div>
      </div>
    </div>
  );
}

export default function AdminLoginPage() {
  return (
    <Suspense fallback={<div style={{ minHeight: "100vh" }}></div>}>
      <AdminLoginInner />
    </Suspense>
  );
}
