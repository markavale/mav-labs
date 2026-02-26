'use client';

import { cn } from '@/lib/utils';
import { forwardRef } from 'react';
import { Loader2 } from 'lucide-react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'default' | 'primary' | 'secondary' | 'ghost' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  isLoading?: boolean;
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = 'default', size = 'md', isLoading, children, disabled, ...props }, ref) => {
    return (
      <button
        ref={ref}
        disabled={disabled || isLoading}
        className={cn(
          'inline-flex items-center justify-center font-medium rounded-lg transition-colors',
          'focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-dark-bg',
          'disabled:opacity-50 disabled:cursor-not-allowed',
          {
            'bg-dark-card border border-dark-border text-text-primary hover:bg-dark-border focus:ring-dark-border':
              variant === 'default',
            'bg-brand-cyan text-dark-bg hover:bg-brand-cyan/90 focus:ring-brand-cyan':
              variant === 'primary',
            'bg-brand-purple text-white hover:bg-brand-purple/90 focus:ring-brand-purple':
              variant === 'secondary',
            'bg-transparent text-text-secondary hover:text-text-primary hover:bg-dark-card focus:ring-dark-border':
              variant === 'ghost',
            'bg-status-error text-white hover:bg-status-error/90 focus:ring-status-error':
              variant === 'danger',
          },
          {
            'text-xs px-2.5 py-1.5': size === 'sm',
            'text-sm px-4 py-2': size === 'md',
            'text-base px-6 py-3': size === 'lg',
          },
          className
        )}
        {...props}
      >
        {isLoading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
        {children}
      </button>
    );
  }
);
Button.displayName = 'Button';
