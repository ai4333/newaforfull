"use client";
import React from 'react';
import Link from 'next/link';
import { Button } from './Button';

export const Navbar = () => {
    return (
        <nav style={{
            padding: '1.5rem 2rem',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            borderBottom: '1px dashed rgba(62,32,40,0.18)',
            background: 'var(--bg-parchment)',
            position: 'relative',
            zIndex: 100,
            width: '100%'
        }}>
            <Link href="/" style={{ textDecoration: 'none' }}>
                <h2 className="fraunces text-ink" style={{ fontSize: '1.5rem', fontWeight: 900, letterSpacing: '-0.02em' }}>
                    AforPrint
                </h2>
            </Link>

            <div style={{ display: 'flex', gap: '2rem', alignItems: 'center' }}>
                <Link href="#features" style={{ textDecoration: 'none' }}>
                    <span className="label" style={{ cursor: 'pointer' }}>Approach</span>
                </Link>
                <Link href="#founders" style={{ textDecoration: 'none' }}>
                    <span className="label" style={{ cursor: 'pointer' }}>Founders</span>
                </Link>
                <Link href="/auth/login">
                    <Button variant="secondary" size="sm" style={{ borderColor: 'var(--ink-primary)', color: 'var(--ink-primary)' }}>
                        Get Started
                    </Button>
                </Link>
            </div>
        </nav>
    );
};
