import type { ReactNode } from 'react';
export function Badge({ children, tone = 'neutral' }: { children: ReactNode; tone?: 'neutral' | 'success' | 'warning' | 'danger' }) {
  const style = {
    neutral: 'bg-slate-500/10 text-[var(--sal-muted)] border-slate-500/20',
    success: 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20',
    warning: 'bg-amber-500/10 text-amber-500 border-amber-500/20',
    danger: 'bg-red-500/10 text-red-500 border-red-500/20',
  }[tone];
  return <span className={`inline-flex rounded-full border px-2.5 py-1 text-xs font-bold ${style}`}>{children}</span>;
}
