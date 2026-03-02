import React from 'react';

interface CardProps {
    children: React.ReactNode;
    variant?: 'white' | 'glass';
    className?: string;
    style?: React.CSSProperties;
}

export const Card: React.FC<CardProps> = ({ children, variant = 'white', className = '', style }) => {
    return (
        <div
            className={`${variant === 'glass' ? 'glass' : 'card-premium'} ${className}`}
            style={{ ...style }}
        >
            {children}
        </div>
    );
};
