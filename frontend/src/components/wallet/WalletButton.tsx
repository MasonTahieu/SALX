import { useEffect, useRef } from 'react';
import { useWallet } from '../../contexts/WalletContext';
import { useLanguage } from '../../contexts/LanguageContext';
import { shortAddress } from '../../lib/format';
import { networkById } from '../../config/networks';
import { NetworkSwitcher } from './NetworkSwitcher';
import { AccountMenu } from './AccountMenu';
import { Button } from '../ui/Button';

export function WalletButton({ className = '' }: { className?: string }) {
  const wallet = useWallet();
  const { t } = useLanguage();
  const wrap = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const onDocument = (event: MouseEvent) => {
      if (!wrap.current?.contains(event.target as Node)) wallet.closeAccountMenu();
    };
    document.addEventListener('mousedown', onDocument);
    return () => document.removeEventListener('mousedown', onDocument);
  }, [wallet]);

  const activeNetwork = networkById(wallet.chainId);

  return <div ref={wrap} className={`relative flex items-center gap-2 ${className}`}>
    <NetworkSwitcher />
    {wallet.address ? <button
      type="button"
      onClick={() => wallet.accountMenuOpen ? wallet.closeAccountMenu() : wallet.openAccountMenu()}
      className="sal-wallet-account-button"
      aria-expanded={wallet.accountMenuOpen}
    >
      <span className="sal-wallet-avatar" aria-hidden="true">♟</span>
      <span className="hidden min-w-0 text-left sm:block">
        <span className="block max-w-[90px] truncate text-sm font-black">{shortAddress(wallet.address, 4, 4)}</span>
        <span className={`block text-[10px] font-bold ${wallet.connected ? 'text-emerald-500' : 'text-amber-500'}`}>
          {activeNetwork?.shortName || `Chain ${wallet.chainId ?? '—'}`}
        </span>
      </span>
      <span className="text-xs">⌄</span>
    </button> : <Button onClick={wallet.openWalletModal} variant="primary" className="!rounded-xl">
      {t('common.connectWallet')}
    </Button>}
    {wallet.accountMenuOpen && wallet.address && <AccountMenu />}
  </div>;
}
