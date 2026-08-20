import { Link } from 'react-router-dom';
import { Button } from '../ui/Button';
import type { Project } from '../../types/domain';

interface Props {
  pending: Project[];
  busy: boolean;
  onCancel: (projectId: number) => void;
  t: (key: string) => string;
}

export function PendingProjectsPanel({ pending, busy, onCancel, t }: Props) {
  if (pending.length === 0) return null;

  return (
    <div className="overflow-hidden rounded-[var(--sal-radius)] border border-[var(--sal-border)] bg-[var(--sal-surface)]">
      <div className="flex items-center justify-between border-b border-[var(--sal-border)] px-5 py-4">
        <h2 className="text-lg font-black">{t('dashboard.pending')}</h2>
        <Link to="/submit-project" className="text-sm font-black text-[var(--sal-primary)]">
          + {t('nav.submit')}
        </Link>
      </div>
      <div className="divide-y divide-[var(--sal-border)]">
        {pending.map(p => (
          <div key={p._id} className="portfolio-row">
            <div className="min-w-0">
              <div className="font-black">{p.projectName}</div>
              <div className="mt-0.5 text-xs text-[var(--sal-muted)]">
                #{p.onChainProjectId} · {p.approvalVotes}/{p.approvalQuorum} votes
              </div>
            </div>
            {p.onChainProjectId != null && (
              <Button variant="secondary" disabled={busy} onClick={() => onCancel(p.onChainProjectId!)}>
                {t('dashboard.cancelRefund')}
              </Button>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
