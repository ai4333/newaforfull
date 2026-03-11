"use client";
import React, { useEffect } from 'react';
import Link from 'next/link';
import { signIn, useSession } from "next-auth/react";
import { useRouter } from 'next/navigation';

export default function LoginPage() {
    const [step, setStep] = React.useState<'role' | 'vendor-login' | 'student-login'>('role');
    const { data: session, status } = useSession();
    const router = useRouter();

    useEffect(() => {
        if (status !== 'authenticated') {
            return;
        }

        const role = (session?.user as { role?: string } | undefined)?.role;
        if (role === 'VENDOR') {
            router.replace('/vendor/dashboard');
            return;
        }
        if (role === 'ADMIN') {
            router.replace('/admin/dashboard');
            return;
        }
        router.replace('/student/dashboard');
    }, [status, session, router]);

    const handleGoogleLogin = async (role: 'student' | 'vendor') => {
        const callbackUrl = `/auth/role-sync?role=${role}`;
        await signIn("google", { callbackUrl });
    };

    useEffect(() => {
        // ── CURSOR GLOW ──
        const glow = document.createElement('div');
        glow.id = 'cursor-glow';
        document.body.appendChild(glow);
        const moveGlow = (e: MouseEvent) => {
            glow.style.left = e.clientX + 'px';
            glow.style.top = e.clientY + 'px';
        };
        document.addEventListener('mousemove', moveGlow);

        // ── REVEAL EFFECTS ──
        const io = new IntersectionObserver((entries) => {
            entries.forEach((entry) => {
                if (!entry.isIntersecting) return;
                entry.target.classList.add('active');
                io.unobserve(entry.target);
            });
        }, { threshold: 0.1 });

        document.querySelectorAll('.reveal-up, .stamp-in').forEach(el => io.observe(el));

        return () => {
            document.removeEventListener('mousemove', moveGlow);
            glow.remove();
        };
    }, [step]); // Re-run observer when step changes

    return (
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '100vh', width: '100%' }}>
            <div className="parchment reveal-up" style={{ maxWidth: '480px', padding: '40px', textAlign: 'center', position: 'relative' }}>
                <div className="paper-fold"></div>
                <div className="card-lines"></div>

                <div className="hero-signin" style={{ position: 'absolute', top: '20px', left: '20px' }}>
                    {step === 'role' ? (
                        <Link href="/" className="btn-signin" style={{ fontSize: '10px' }}>← Back</Link>
                    ) : (
                        <button onClick={() => setStep('role')} className="btn-signin" style={{ fontSize: '10px', background: 'none', cursor: 'pointer' }}>← Back</button>
                    )}
                </div>

                {step === 'role' ? (
                    <>
                        <div style={{ marginBottom: '32px', position: 'relative', zIndex: 10 }}>
                            <div className="founder-monogram stamp-in" style={{ margin: '0 auto 24px', width: '80px', height: '80px' }}>A</div>
                            <h2 className="fraunces text-ink" style={{ fontSize: '2.2rem', fontWeight: 900, marginBottom: '8px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Identify Role</h2>
                            <div className="founders-rule" style={{ width: '60px', marginBottom: '16px' }}></div>
                            <p className="lora" style={{ color: 'var(--ink-secondary)', fontStyle: 'italic', fontSize: '0.95rem' }}>"Select your designation to proceed within the network."</p>
                        </div>

                        <div style={{ position: 'relative', zIndex: 10, display: 'flex', flexDirection: 'column', gap: '12px' }}>
                            <button onClick={() => setStep('student-login')} className="btn-signup" style={{ justifyContent: 'center', padding: '16px', fontSize: '14px', cursor: 'pointer' }}>
                                Join as Student
                            </button>
                            <button onClick={() => setStep('vendor-login')} className="btn-signin" style={{ justifyContent: 'center', padding: '16px', fontSize: '14px', cursor: 'pointer' }}>
                                Enter as Vendor
                            </button>
                        </div>
                    </>
                ) : step === 'student-login' ? (
                    <>
                        <div style={{ marginBottom: '32px', position: 'relative', zIndex: 10 }}>
                            <div className="founder-monogram stamp-in" style={{ margin: '0 auto 24px', width: '80px', height: '80px' }}>S</div>
                            <h2 className="fraunces text-ink" style={{ fontSize: '2.2rem', fontWeight: 900, marginBottom: '8px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Student Access</h2>
                            <div className="founders-rule" style={{ width: '60px', marginBottom: '16px' }}></div>
                            <p className="lora" style={{ color: 'var(--ink-secondary)', fontStyle: 'italic', fontSize: '0.95rem' }}>"Use your university credentials to access the printing portal."</p>
                        </div>

                        <div style={{ position: 'relative', zIndex: 10 }}>
                            <button onClick={() => handleGoogleLogin('student')} className="btn-signup" style={{
                                width: '100%',
                                justifyContent: 'center',
                                padding: '16px',
                                fontSize: '14px',
                                marginBottom: '20px',
                                display: 'flex',
                                alignItems: 'center',
                                cursor: 'pointer'
                            }}>
                                <svg width="18" height="18" viewBox="0 0 24 24" style={{ marginRight: '12px', flexShrink: 0 }}>
                                    <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="white" />
                                    <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="white" opacity="0.8" />
                                    <path d="M5.84 14.1c-.22-.66-.35-1.36-.35-2.1s.13-1.44.35-2.1V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.83z" fill="white" opacity="0.8" />
                                    <path d="M12 5.38c1.62 0 3.06.56 4.21 1.66l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.83c.87-2.6 3.3-4.52 6.16-4.52z" fill="white" opacity="0.9" />
                                </svg>
                                Continue with Google
                            </button>
                        </div>
                    </>
                ) : (
                    <>
                        <div style={{ marginBottom: '32px', position: 'relative', zIndex: 10 }}>
                            <div className="founder-monogram stamp-in" style={{ margin: '0 auto 24px', width: '80px', height: '80px' }}>V</div>
                            <h2 className="fraunces text-ink" style={{ fontSize: '2.2rem', fontWeight: 900, marginBottom: '8px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Vendor Access</h2>
                            <div className="founders-rule" style={{ width: '60px', marginBottom: '16px' }}></div>
                            <p className="lora" style={{ color: 'var(--ink-secondary)', fontStyle: 'italic', fontSize: '0.95rem' }}>"Authenticated entry for registered print merchants."</p>
                        </div>

                        <div style={{ position: 'relative', zIndex: 10 }}>
                            <button onClick={() => handleGoogleLogin('vendor')} className="btn-signup" style={{
                                width: '100%',
                                justifyContent: 'center',
                                padding: '16px',
                                fontSize: '14px',
                                marginBottom: '20px',
                                display: 'flex',
                                alignItems: 'center',
                                cursor: 'pointer'
                            }}>
                                <svg width="18" height="18" viewBox="0 0 24 24" style={{ marginRight: '12px', flexShrink: 0 }}>
                                    <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="white" />
                                    <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="white" opacity="0.8" />
                                    <path d="M5.84 14.1c-.22-.66-.35-1.36-.35-2.1s.13-1.44.35-2.1V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.83z" fill="white" opacity="0.8" />
                                    <path d="M12 5.38c1.62 0 3.06.56 4.21 1.66l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.83c.87-2.6 3.3-4.52 6.16-4.52z" fill="white" opacity="0.9" />
                                </svg>
                                Continue with Google
                            </button>
                        </div>
                    </>
                )}

                <div style={{ position: 'relative', zIndex: 10, marginTop: '20px' }}>
                    <p className="lora" style={{ fontSize: '0.8rem', opacity: 0.6, lineHeight: 1.6 }}>
                        By engaging, you abide by the <span style={{ textDecoration: 'underline', cursor: 'pointer' }}>Charter of Service</span> and acknowledge our <span style={{ textDecoration: 'underline', cursor: 'pointer' }}>Privacy Protocols</span>.
                    </p>
                </div>

                <div className="card-seal stamp-in delay-500" style={{ bottom: '20px', right: '20px' }}>
                    {step === 'role' ? 'AUTH' : step === 'student-login' ? 'STUDENT' : 'VENDOR'}
                </div>
            </div>
        </div>
    );
}
