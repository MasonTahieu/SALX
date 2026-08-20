import { Link } from 'react-router-dom';
import type { CertState } from './useRetireFlow';
import { CertificateCard } from '../certificate/CertificateCard';
import { Button } from '../ui/Button';
import { Card } from '../ui/Card';
import { shortAddress } from '../../lib/format';

const ETHERSCAN_URL = 'https://sepolia.etherscan.io/tx/';

interface Props {
  certState: CertState;
  onReload: () => Promise<void>;
  onRetireMore: () => void;
  t: (key: string) => string;
}

export function RetiredCertPanel({ certState, onReload, onRetireMore, t }: Props) {
  if (certState.phase === 'idle') return null;

  const txHash = certState.txHash;

  if (certState.phase === 'pending') {
    return (
      <Card className="p-5 space-y-4">
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 flex-none items-center justify-center rounded-full bg-[var(--sal-surface-soft)] text-lg">
            ⏳
          </div>
          <div>
            <p className="text-sm font-bold">{t('retire.done')}</p>
            <p className="mt-0.5 text-xs text-[var(--sal-muted)]">
              Certificate is being indexed — refresh to check.
            </p>
          </div>
        </div>

        <div className="rounded-[13px] border border-[var(--sal-border)] bg-[var(--sal-surface-soft)] px-3 py-2.5 font-mono text-xs text-[var(--sal-muted)] break-all">
          Tx: {txHash}
        </div>

        <div className="flex flex-wrap items-center gap-2 pt-1">
          <Button type="button" variant="secondary" onClick={onReload} className="text-xs">
            Refresh certificate
          </Button>
          <a
            href={`${ETHERSCAN_URL}${txHash}`}
            target="_blank"
            rel="noreferrer"
            className="text-xs font-black text-[var(--sal-primary)]"
          >
            {t('common.viewTx')} ↗
          </a>
          <Link to="/certificates" className="text-xs font-black text-[var(--sal-primary)]">
            {t('retire.viewSbt')} →
          </Link>
        </div>

        <Button type="button" variant="ghost" onClick={onRetireMore} className="w-full text-xs">
          Retire more SAL
        </Button>
      </Card>
    );
  }

  const { certificate } = certState;
  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3">
        <div className="flex h-9 w-9 flex-none items-center justify-center rounded-full bg-[color-mix(in_srgb,var(--sal-primary)_12%,var(--sal-surface))] text-lg">
          ✓
        </div>
        <div>
          <p className="text-sm font-bold text-[var(--sal-primary)]">Retirement confirmed</p>
          <p className="mt-0.5 text-xs text-[var(--sal-muted)]">
            Tx: {shortAddress(txHash, 8, 6)}
          </p>
        </div>
      </div>
      <CertificateCard certificate={certificate} />
      <div className="flex flex-wrap items-center gap-3">
        <Link to="/certificates" className="text-xs font-black text-[var(--sal-primary)]">
          {t('retire.viewSbt')} →
        </Link>
        <a
          href={`${ETHERSCAN_URL}${txHash}`}
          target="_blank"
          rel="noreferrer"
          className="text-xs font-black text-[var(--sal-primary)]"
        >
          {t('common.viewTx')} ↗
        </a>
      </div>
      <Button type="button" variant="ghost" onClick={onRetireMore} className="w-full text-xs">
        Retire more SAL
      </Button>
    </div>
  );
}
