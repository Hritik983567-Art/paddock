'use client';

import React from 'react';

export interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: 'default' | 'glass' | 'bordered' | 'interactive';
  padding?: 'none' | 'sm' | 'md' | 'lg';
}

export const Card: React.FC<CardProps> = ({
  children,
  variant = 'default',
  padding = 'md',
  className = '',
  ...props
}) => {
  const baseStyles = 'rounded-xl overflow-hidden transition-all duration-200';
  
  const paddingStyles = {
    none: 'p-0',
    sm: 'p-3',
    md: 'p-5',
    lg: 'p-7',
  };

  const variantStyles = {
    default: 'bg-zinc-900/90 border border-zinc-800/80 text-zinc-100',
    glass: 'bg-zinc-900/40 backdrop-blur-md border border-zinc-800/50 text-zinc-100 shadow-xl',
    bordered: 'bg-black/60 border border-zinc-700/80 text-zinc-100',
    interactive: 'bg-zinc-900/80 border border-zinc-800 hover:border-zinc-700 hover:bg-zinc-850 cursor-pointer hover:shadow-lg hover:shadow-red-950/10 text-zinc-100',
  };

  return (
    <div
      className={`${baseStyles} ${paddingStyles[padding]} ${variantStyles[variant]} ${className}`}
      {...props}
    >
      {children}
    </div>
  );
};
