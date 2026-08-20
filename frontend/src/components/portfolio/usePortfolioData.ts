import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { backend } from '../../services/backend';
import {
  accountFinance,
  cancelListing,
  cancelPendingProject,
  createListing,
  salBalance,
  withdrawProceeds,
  withdrawTokenizationRefund,
} from '../../services/blockchain';
import { useWallet } from '../../contexts/WalletContext';
import type { Certificate, Listing, Project } from '../../types/domain';
import { errorMessage } from '../../lib/errors';

export interface BalanceRow {
  project: Project;
  balance: number;
}

export interface AccountFinance {
  proceedsETH: string;
  refundETH: string;
  certificateFeeETH: string;
  minPriceETH: string;
  maxPriceETH: string;
  paused: boolean;
}

export interface UsePortfolioDataResult {
  balances: BalanceRow[];
  myProjects: Project[];
  myPending: Project[];
  listings: Listing[];
  certificates: Certificate[];
  finance: AccountFinance | null;
  totalSAL: number;
  loading: boolean;
  busy: boolean;
  message: string | null;
  messageIsError: boolean;
  clearMessage: () => void;
  selectedProjectId: number | null;
  setSelectedProjectId: (id: number) => void;
  listAmount: number;
  setListAmount: (n: number) => void;
  listPrice: string;
  setListPrice: (s: string) => void;
  runCreateListing: () => Promise<void>;
  runCancelListing: (listingId: number) => Promise<void>;
  runCancelPending: (projectId: number) => Promise<void>;
  runWithdrawProceeds: () => Promise<void>;
  runWithdrawRefund: () => Promise<void>;
}

export function usePortfolioData(): UsePortfolioDataResult {
  const wallet = useWallet();
  const [balances, setBalances] = useState<BalanceRow[]>([]);
  const [allProjects, setAllProjects] = useState<Project[]>([]);
  const [listings, setListings] = useState<Listing[]>([]);
  const [certificates, setCertificates] = useState<Certificate[]>([]);
  const [finance, setFinance] = useState<AccountFinance | null>(null);
  const [loading, setLoading] = useState(false);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [messageIsError, setMessageIsError] = useState(false);
  const [selectedProjectId, setSelectedProjectId] = useState<number | null>(null);
  const [listAmount, setListAmount] = useState(1);
  const [listPrice, setListPrice] = useState('0.001');
  const initialProjectSet = useRef(false);

  const load = useCallback(async () => {
    if (!wallet.address) return;
    setLoading(true);
    try {
      const [projects, sellerListings, fin, certs] = await Promise.all([
        backend.projects('all'),
        backend.listings({ seller: wallet.address }),
        accountFinance(wallet.address),
        backend.certificatesByWallet(wallet.address).catch(() => [] as Certificate[]),
      ]);
      setAllProjects(projects);
      setListings(sellerListings);
      setFinance(fin as AccountFinance);
      setCertificates(certs);

      const approved = projects.filter(p => p.status === 'Approved' && p.onChainProjectId != null);
      // O(n) parallel balance reads — one RPC per project
      const rows = await Promise.all(
        approved.map(async p => ({
          project: p,
          balance: await salBalance(wallet.address!, p.onChainProjectId!),
        }))
      );
      const visible = rows.filter(
        r => r.balance > 0 || r.project.ownerWallet?.toLowerCase() === wallet.address?.toLowerCase()
      );
      setBalances(visible);
      if (!initialProjectSet.current && visible[0]?.project.onChainProjectId != null) {
        initialProjectSet.current = true;
        setSelectedProjectId(visible[0].project.onChainProjectId);
      }
    } catch (err) {
      setMessageIsError(true);
      setMessage(errorMessage(err));
    } finally {
      setLoading(false);
    }
  }, [wallet.address]);

  useEffect(() => { load(); }, [load]);

  const myProjects = useMemo(
    () => allProjects.filter(p => p.ownerWallet?.toLowerCase() === wallet.address?.toLowerCase()),
    [allProjects, wallet.address]
  );
  const myPending = useMemo(() => myProjects.filter(p => p.status === 'Pending'), [myProjects]);
  const totalSAL = useMemo(() => balances.reduce((sum, r) => sum + r.balance, 0), [balances]);

  const run = useCallback(async (fn: () => Promise<any>, successHint: string) => {
    setBusy(true);
    setMessageIsError(false);
    setMessage(null);
    try {
      const result = await fn();
      setMessage(`${successHint} ${result?.txHash ?? ''}`.trim());
      await load();
    } catch (err) {
      setMessageIsError(true);
      setMessage(errorMessage(err));
    } finally {
      setBusy(false);
    }
  }, [load]);

  const runCreateListing = useCallback((): Promise<void> => {
    if (!wallet.address || !selectedProjectId) return Promise.resolve();
    return run(
      () => createListing(wallet.address!, selectedProjectId, listAmount, listPrice),
      '✓ Listing created'
    );
  }, [wallet.address, selectedProjectId, listAmount, listPrice, run]);

  const runCancelListing = useCallback((listingId: number): Promise<void> => {
    return run(() => cancelListing(listingId), '✓ Listing cancelled');
  }, [run]);

  const runCancelPending = useCallback((projectId: number): Promise<void> => {
    return run(() => cancelPendingProject(projectId), '✓ Project cancelled and refund issued');
  }, [run]);

  const runWithdrawProceeds = useCallback((): Promise<void> => {
    return run(withdrawProceeds, '✓ Proceeds withdrawn');
  }, [run]);

  const runWithdrawRefund = useCallback((): Promise<void> => {
    return run(withdrawTokenizationRefund, '✓ Refund withdrawn');
  }, [run]);

  return {
    balances,
    myProjects,
    myPending,
    listings,
    certificates,
    finance,
    totalSAL,
    loading,
    busy,
    message,
    messageIsError,
    clearMessage: () => setMessage(null),
    selectedProjectId,
    setSelectedProjectId,
    listAmount,
    setListAmount,
    listPrice,
    setListPrice,
    runCreateListing,
    runCancelListing,
    runCancelPending,
    runWithdrawProceeds,
    runWithdrawRefund,
  };
}
