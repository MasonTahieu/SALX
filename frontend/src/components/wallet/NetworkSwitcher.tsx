import { useWallet } from '../../contexts/WalletContext';
import { networkById, NETWORKS } from '../../config/networks';

import { useState } from 'react';

export function NetworkSwitcher() {
  const wallet = useWallet();
  const [open, setOpen] = useState(false);
  const active = networkById(wallet.chainId) || NETWORKS[0];

  return <div className="relative">
    <button type="button" onClick={() => setOpen(v => !v)} className="sal-network-button" aria-expanded={open}>
      <span className="sal-network-icon" style={{ background: active.accent }}>{active.icon}</span>
      <span className="hidden text-sm font-black sm:inline">{active.shortName}</span>
      <span className="text-xs">⌄</span>
    </button>
    {open && <div className="sal-network-menu">
      <div className="sal-network-menu-title">Switch Networks</div>
      <button type="button" className="sal-network-close" onClick={() => setOpen(false)} aria-label="Close">×</button>
      <div className="mt-3 space-y-1.5">
        {NETWORKS.map(network => {
          const selected = wallet.chainId === network.id;
          return <button
            key={network.id}
            type="button"
            onClick={async () => { await wallet.switchNetwork(network.id); setOpen(false); }}
            className={`sal-network-option ${selected ? 'is-selected' : ''}`}
          >
            <span className="sal-network-icon" style={{ background: network.accent }}>{network.icon}</span>
            <span className="flex-1 text-left font-black">{network.name}</span>
            {selected && <span className="sal-network-connected">Connected</span>}
          </button>;
        })}
      </div>
      {!wallet.address && <div className="mt-3 rounded-xl border border-[var(--sal-border)] bg-[var(--sal-surface-soft)] p-3 text-xs text-[var(--sal-muted)]">Connect a wallet to switch networks.</div>}
      {wallet.error && <div className="mt-3 rounded-xl border border-red-500/30 bg-red-500/10 p-3 text-xs text-red-500">{wallet.error}</div>}
    </div>}
  </div>;
}
