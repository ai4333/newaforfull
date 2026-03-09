"use client";
import React from 'react';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
    label?: string;
}

export const Input: React.FC<InputProps> = ({ label, ...props }) => {
    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', width: '100%' }}>
            {label && <label style={{ fontSize: '0.875rem', fontWeight: 500, color: 'hsl(var(--muted-foreground))' }}>{label}</label>}
            <input
                style={{
                    padding: '0.75rem 1rem',
                    borderRadius: 'var(--radius)',
                    border: '1px solid hsl(var(--border))',
                    backgroundColor: 'white',
                    fontSize: '1rem',
                    outline: 'none',
                    transition: 'all 0.2s ease',
                }}
                className="input-focus-accent"
                {...props}
            />
            <style jsx>{`
        input:focus {
          border-color: hsl(var(--primary));
          box-shadow: 0 0 0 2px hsl(var(--primary) / 0.1);
        }
      `}</style>
        </div>
    );
};
