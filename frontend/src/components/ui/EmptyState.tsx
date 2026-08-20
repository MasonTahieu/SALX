import type { ReactNode } from 'react';

export function EmptyState({ title, description, action }: { title: string; description?: string; action?: ReactNode }) {
  return (
    <div className="sal-empty-state">
      <div className="sal-empty-icon">◇</div>
      <div className="font-black">{title}</div>
      {description && <div className="mt-1 max-w-lg text-sm text-[var(--sal-muted)]">{description}</div>}
      {action && <div className="mt-4">{action}</div>}
    </div>
  );
}
