import type { Project } from '../../types/domain';
import { projectDisplay } from '../../lib/projectMeta';
import { formatNumber } from '../../lib/format';
import { Badge } from '../ui/Badge';
import { useLanguage } from '../../contexts/LanguageContext';

type Props = {
  project: Project;
  balance: number;
  selected: boolean;
  amount: number;
  disabled?: boolean;
  kgPerSAL: number;
  onToggle: () => void;
  onAmount: (amount: number) => void;
};

export function RetirementSourceCard({ project, balance, selected, amount, disabled, kgPerSAL, onToggle, onAmount }: Props) {
  const { t } = useLanguage();
  const details = projectDisplay(project);
  const carbon = amount * kgPerSAL;
  return (
    <article className={`retire-source ${selected ? 'is-selected' : ''} ${disabled ? 'is-disabled' : ''}`}>
      <button type="button" className="flex w-full items-start gap-3 text-left" onClick={onToggle} disabled={disabled && !selected}>
        <span className={`retire-check ${selected ? 'is-selected' : ''}`}>{selected ? '✓' : ''}</span>
        <span className="min-w-0 flex-1">
          <span className="flex flex-wrap items-center gap-2">
            <strong className="truncate text-base">{project.projectName}</strong>
            <Badge tone="success">Project #{project.onChainProjectId}</Badge>
          </span>
          <span className="mt-1 block text-xs text-[var(--sal-muted)]">
            {[details.projectType, details.location, details.methodology].filter(Boolean).slice(0, 3).join(' · ') || t('retire.onChainSource')}
          </span>
        </span>
        <span className="text-right">
          <span className="block text-[10px] font-black uppercase tracking-wider text-[var(--sal-muted)]">{t('retire.balance')}</span>
          <strong>{formatNumber(balance)} SAL</strong>
        </span>
      </button>

      {selected && (
        <div className="mt-4 grid gap-3 border-t border-[var(--sal-border)] pt-4 sm:grid-cols-[1fr_auto] sm:items-end">
          <div>
            <label className="sal-label">{t('retire.amount')}</label>
            <div className="relative">
              <input
                className="sal-input pr-16"
                type="number"
                min={1}
                max={balance}
                value={amount}
                onChange={(event) => onAmount(Math.max(1, Math.min(balance, Number(event.target.value || 1))))}
              />
              <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-xs font-black text-[var(--sal-muted)]">SAL</span>
            </div>
          </div>
          <div className="rounded-xl bg-[var(--sal-surface-soft)] px-4 py-3 text-sm">
            <div className="text-xs text-[var(--sal-muted)]">{t('retire.carbon')}</div>
            <strong className="text-[var(--sal-primary)]">{formatNumber(carbon)} kg CO₂e</strong>
          </div>
        </div>
      )}
    </article>
  );
}
