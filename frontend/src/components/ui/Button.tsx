import type { ButtonHTMLAttributes, ReactNode } from 'react';
export function Button({ children, variant = 'primary', className = '', ...props }: ButtonHTMLAttributes<HTMLButtonElement> & { children: ReactNode; variant?: 'primary' | 'secondary' | 'ghost' | 'danger' }) {
  const styles = {
    primary: 'bg-[var(--sal-primary)] text-white hover:bg-[var(--sal-primary-strong)] shadow-sm',
    secondary: 'border border-[var(--sal-border)] bg-[var(--sal-surface)] text-[var(--sal-text)] hover:bg-[var(--sal-surface-soft)]',
    ghost: 'text-[var(--sal-text)] hover:bg-[var(--sal-surface-soft)]',
    danger: 'bg-[var(--sal-danger)] text-white hover:opacity-90',
  }[variant];
  return <button className={`rounded-xl px-4 py-2.5 text-sm font-bold transition disabled:cursor-not-allowed disabled:opacity-50 ${styles} ${className}`} {...props}>{children}</button>;
}
