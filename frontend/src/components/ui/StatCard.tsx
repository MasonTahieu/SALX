import { Card } from './Card';
export function StatCard({ label, value, hint }: { label: string; value: string; hint?: string }) {
  return <Card><div className="text-sm font-semibold text-[var(--sal-muted)]">{label}</div><div className="mt-2 text-3xl font-black tracking-tight">{value}</div>{hint && <div className="mt-2 text-xs text-[var(--sal-muted)]">{hint}</div>}</Card>;
}
