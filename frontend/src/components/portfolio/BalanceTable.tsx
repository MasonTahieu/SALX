import { formatNumber } from '../../lib/format';
import { Badge } from '../ui/Badge';
import type { BalanceRow } from './usePortfolioData';

interface Props {
  balances: BalanceRow[];
  walletAddress: string;
  selectedProjectId: number | null;
  onSelect: (id: number) => void;
  t: (key: string) => string;
}

export function BalanceTable({ balances, walletAddress, selectedProjectId, onSelect, t }: Props) {
  if (balances.length === 0) return null;

  return (
    <div className="overflow-hidden rounded-[var(--sal-radius)] border border-[var(--sal-border)] bg-[var(--sal-surface)]">
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[var(--sal-border)] px-5 py-4">
        <div>
          <h2 className="text-lg font-black">{t('dashboard.holdings')}</h2>
          <p className="mt-0.5 text-sm text-[var(--sal-muted)]">{t('dashboard.holdingsDesc')}</p>
        </div>
        <Badge tone="success">1 SAL = 10 kg CO₂e</Badge>
      </div>
      <div className="divide-y divide-[var(--sal-border)]">
        {balances.map(({ project, balance }) => {
          const id = project.onChainProjectId!;
          const isOwner = project.ownerWallet?.toLowerCase() === walletAddress?.toLowerCase();
          const isSelected = selectedProjectId === id;
          return (
            <button
              key={project._id}
              className={`portfolio-row w-full text-left${isSelected ? ' is-selected' : ''}`}
              onClick={() => onSelect(id)}
            >
              <div className="min-w-0">
                <div className="text-xs text-[var(--sal-muted)]">Project #{id}</div>
                <div className="mt-0.5 font-black">{project.projectName}</div>
                {isOwner && (
                  <div className="mt-1 text-[10px] font-black uppercase tracking-widest text-[var(--sal-primary)]">
                    Owner · select to list
                  </div>
                )}
              </div>
              <div className="text-right">
                <div className="text-xl font-black">{formatNumber(balance)} SAL</div>
                <div className="text-xs text-[var(--sal-muted)]">{formatNumber(balance * 10)} kg CO₂e</div>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
