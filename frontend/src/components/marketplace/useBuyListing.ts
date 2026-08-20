import { useState } from 'react';
import type { Listing } from '../../types/domain';
import { buySAL } from '../../services/blockchain';
import { errorMessage } from '../../lib/errors';
import { useWallet } from '../../contexts/WalletContext';

export interface BuyListingState {
  amount: number;
  setAmount: (value: number) => void;
  busy: boolean;
  isWalletConnected: boolean;
  message: string | null;
  clearMessage: () => void;
  buy: () => Promise<void>;
}

export function useBuyListing(listing: Listing, onSuccess: () => void): BuyListingState {
  const wallet = useWallet();
  const [amount, setAmountRaw] = useState(1);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  const setAmount = (value: number) =>
    setAmountRaw(Math.max(1, Math.min(listing.remainingAmount, value)));

  const buy = async () => {
    if (!wallet.address) {
      wallet.openWalletModal();
      return;
    }
    setBusy(true);
    setMessage(null);
    try {
      const result = await buySAL(listing.listingId, amount, listing.pricePerUnitWei);
      setMessage(`✓ ${result.txHash.slice(0, 12)}…`);
      onSuccess();
    } catch (error) {
      setMessage(errorMessage(error));
    } finally {
      setBusy(false);
    }
  };

  return {
    amount,
    setAmount,
    busy,
    isWalletConnected: Boolean(wallet.address),
    message,
    clearMessage: () => setMessage(null),
    buy,
  };
}
