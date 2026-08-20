import { Button } from '../ui/Button';
import { Card } from '../ui/Card';
import type { BalanceRow } from './usePortfolioData';

interface Props {
  selectedRow: BalanceRow | undefined;
  walletAddress: string;
  listAmount: number;
  listPrice: string;
  busy: boolean;
  onSetAmount: (n: number) => void;
  onSetPrice: (s: string) => void;
  onSubmit: () => void;
  t: (key: string) => string;
}

export function CreateListingPanel({
  selectedRow,
  walletAddress,
  listAmount,
  listPrice,
  busy,
  onSetAmount,
  onSetPrice,
  onSubmit,
  t,
}: Props) {
  if (!selectedRow) return null;
  const isOwner = selectedRow.project.ownerWallet?.toLowerCase() === walletAddress?.toLowerCase();
  if (!isOwner) return null;

  const amountInvalid = listAmount < 1 || listAmount > selectedRow.balance;

  return (
    <Card className="p-5">
      <h2 className="text-lg font-black">{t('dashboard.createListing')}</h2>
      <p className="mt-1 text-sm text-[var(--sal-muted)]">{t('dashboard.onlyOwner')}</p>
      <div className="mt-4 grid gap-3 md:grid-cols-2">
        <div>
          <label className="sal-label">{t('common.amount')}</label>
          <input
            className="sal-input"
            type="number"
            min={1}
            max={selectedRow.balance}
            value={listAmount}
            onChange={e => onSetAmount(Number(e.target.value))}
          />
          <div className="mt-1 text-xs text-[var(--sal-muted)]">
            Available: {selectedRow.balance} SAL
          </div>
        </div>
        <div>
          <label className="sal-label">{t('dashboard.pricePerSal')}</label>
          <input
            className="sal-input"
            placeholder="0.001"
            value={listPrice}
            onChange={e => onSetPrice(e.target.value)}
          />
        </div>
      </div>
      <Button
        className="mt-4"
        disabled={busy || amountInvalid}
        onClick={onSubmit}
      >
        {busy ? t('common.processing') : t('dashboard.listAction')}
      </Button>
    </Card>
  );
}
