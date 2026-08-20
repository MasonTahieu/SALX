import type { ReactNode } from 'react';

export function PageHeader({
  eyebrow,
  title,
  description,
  actions,
}: {
  eyebrow?: string;
  title: string;
  description?: string;
  actions?: ReactNode;
}) {
  return (
    <div className="flex flex-col justify-between gap-5 md:flex-row md:items-end">
      <div className="max-w-3xl">
        {eyebrow && <div className="text-sm font-black text-[var(--sal-primary)]">{eyebrow}</div>}
        <h1 className="mt-1 text-3xl font-black tracking-tight md:text-4xl">{title}</h1>
        {description && <p className="mt-2 max-w-2xl text-sm leading-6 text-[var(--sal-muted)] md:text-base">{description}</p>}
      </div>
      {actions && <div className="flex shrink-0 flex-wrap gap-2">{actions}</div>}
    </div>
  );
}
