import * as React from 'react';
import { Loader2 } from 'lucide-react';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'default' | 'brand' | 'outline' | 'secondary' | 'ghost' | 'destructive';
  size?: 'default' | 'sm' | 'lg' | 'icon';
  isLoading?: boolean;
  loadingText?: string;
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      className = '',
      variant = 'default',
      size = 'default',
      isLoading = false,
      loadingText,
      children,
      disabled,
      ...props
    },
    ref
  ) => {
    const baseStyles =
      'inline-flex items-center justify-center font-medium rounded-lg transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--brand-500)] disabled:pointer-events-none disabled:opacity-50 select-none relative';

    const variants = {
      default: 'bg-[var(--brand-500)] hover:bg-[var(--brand-600)] text-white shadow-xs',
      brand: 'bg-[var(--brand-500)] hover:bg-[var(--brand-600)] text-white shadow-xs',
      outline: 'border border-[var(--border)] bg-white hover:bg-gray-50 text-[var(--text-primary)]',
      secondary: 'bg-[var(--brand-50)] text-[var(--brand-700)] hover:bg-blue-100',
      ghost: 'hover:bg-gray-100 text-[var(--text-secondary)] hover:text-[var(--text-primary)]',
      destructive: 'bg-red-600 hover:bg-red-700 text-white shadow-xs',
    };

    const sizes = {
      default: 'h-10 px-4 py-2 text-sm',
      sm: 'h-8 px-3 text-xs rounded-md',
      lg: 'h-12 px-6 text-base rounded-xl',
      icon: 'h-9 w-9 p-0',
    };

    return (
      <button
        ref={ref}
        disabled={disabled || isLoading}
        className={`${baseStyles} ${variants[variant]} ${sizes[size]} ${className}`}
        {...props}
      >
        {isLoading ? <Loader2 className="w-4 h-4 animate-spin shrink-0" /> : children}
      </button>
    );
  }
);

Button.displayName = 'Button';
