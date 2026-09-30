'use client';

import React from 'react';

export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: 'red' | 'emerald' | 'amber' | 'blue' | 'zinc' | 'purple';
  size?: 'sm' | 'md';
}

export const Badge: React.FC<BadgeProps> = ({
  children,
  variant = 'zinc',
  size = 'md',
  className = '',
  ...props
}) => {
  const baseStyles = 'inline-flex items-center font-medium uppercase tracking-wider rounded-md';
  
  const sizeStyles = {
    sm: 'px-2 py-0.5 text-[10px]',
    md: 'px-2.5 py-1 text-xs',
  };

  const variantStyles = {
    red: 'bg-red-950/80 text-red-400 border border-red-800/50',
    emerald: 'bg-emerald-950/80 text-emerald-400 border border-emerald-800/50',
    amber: 'bg-amber-950/80 text-amber-400 border border-amber-800/50',
    blue: 'bg-blue-950/80 text-blue-400 border border-blue-800/50',
    zinc: 'bg-zinc-800/90 text-zinc-300 border border-zinc-700/50',
    purple: 'bg-purple-950/80 text-purple-400 border border-purple-800/50',
  };

  return (
    <span
      className={`${baseStyles} ${sizeStyles[size]} ${variantStyles[variant]} ${className}`}
      {...props}
    >
      {children}
    </span>
  );
};
