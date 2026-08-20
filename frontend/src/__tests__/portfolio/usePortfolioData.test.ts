import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, act, waitFor } from '@testing-library/react';

vi.mock('../../services/backend', () => ({
  backend: {
    projects: vi.fn(),
    listings: vi.fn(),
    certificatesByWallet: vi.fn(),
  },
}));

vi.mock('../../services/blockchain', () => ({
  accountFinance: vi.fn(),
  salBalance: vi.fn(),
  createListing: vi.fn(),
  cancelListing: vi.fn(),
  cancelPendingProject: vi.fn(),
  withdrawProceeds: vi.fn(),
  withdrawTokenizationRefund: vi.fn(),
}));

vi.mock('../../contexts/WalletContext', () => ({
  useWallet: vi.fn(),
}));

import { usePortfolioData } from '../../components/portfolio/usePortfolioData';
import { backend } from '../../services/backend';
import {
  accountFinance,
  salBalance,
  createListing,
  cancelListing,
  cancelPendingProject,
  withdrawProceeds,
  withdrawTokenizationRefund,
} from '../../services/blockchain';
import { useWallet } from '../../contexts/WalletContext';

const mockProjects = vi.mocked(backend.projects);
const mockListings = vi.mocked(backend.listings);
const mockCertsByWallet = vi.mocked(backend.certificatesByWallet);
const mockAccountFinance = vi.mocked(accountFinance);
const mockSalBalance = vi.mocked(salBalance);
const mockCreateListing = vi.mocked(createListing);
const mockCancelListing = vi.mocked(cancelListing);
const mockCancelPendingProject = vi.mocked(cancelPendingProject);
const mockWithdrawProceeds = vi.mocked(withdrawProceeds);
const mockWithdrawTokenizationRefund = vi.mocked(withdrawTokenizationRefund);
const mockUseWallet = vi.mocked(useWallet);

const WALLET = { address: '0xOwner', connected: true, connecting: false, openWalletModal: vi.fn() };
const DISCONNECTED = { address: null, connected: false, connecting: false, openWalletModal: vi.fn() };

const APPROVED_PROJECT = {
  _id: 'p1',
  onChainProjectId: 1,
  projectName: 'Forest A',
  ownerWallet: '0xOwner',
  status: 'Approved',
  blacklisted: false,
} as any;
const PENDING_PROJECT = {
  _id: 'p2',
  onChainProjectId: null,
  projectName: 'Wind B',
  ownerWallet: '0xOwner',
  status: 'Pending',
  approvalVotes: 2,
  approvalQuorum: 5,
} as any;

const FINANCE = {
  proceedsETH: '0.5',
  refundETH: '0.1',
  certificateFeeETH: '0.001',
  minPriceETH: '0.001',
  maxPriceETH: '1',
  paused: false,
};

const TX_RESP = { txHash: '0xTX123', blockNumber: 42 };

function setupDefaultMocks() {
  mockProjects.mockResolvedValue([APPROVED_PROJECT, PENDING_PROJECT]);
  mockListings.mockResolvedValue([]);
  mockCertsByWallet.mockResolvedValue([]);
  mockAccountFinance.mockResolvedValue(FINANCE as any);
  mockSalBalance.mockResolvedValue(10);
}

describe('usePortfolioData', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockUseWallet.mockReturnValue(WALLET as any);
    setupDefaultMocks();
  });

  describe('initialization', () => {
    it('starts with empty state', () => {
      const { result } = renderHook(() => usePortfolioData());
      expect(result.current.balances).toHaveLength(0);
      expect(result.current.finance).toBeNull();
      expect(result.current.busy).toBe(false);
      expect(result.current.message).toBeNull();
    });

    it('skips load when wallet is disconnected', async () => {
      mockUseWallet.mockReturnValue(DISCONNECTED as any);
      renderHook(() => usePortfolioData());
      await act(async () => {});
      expect(mockProjects).not.toHaveBeenCalled();
    });

    it('loads all data on mount', async () => {
      const { result } = renderHook(() => usePortfolioData());
      await waitFor(() => expect(result.current.loading).toBe(false));
      expect(mockProjects).toHaveBeenCalledWith('all');
      expect(mockAccountFinance).toHaveBeenCalledWith('0xOwner');
      expect(result.current.finance?.proceedsETH).toBe('0.5');
    });

    it('populates balances for approved projects only', async () => {
      const { result } = renderHook(() => usePortfolioData());
      await waitFor(() => expect(result.current.balances).toHaveLength(1));
      expect(result.current.balances[0].project._id).toBe('p1');
      expect(result.current.balances[0].balance).toBe(10);
    });

    it('computes totalSAL from balances', async () => {
      mockSalBalance.mockResolvedValue(25);
      const { result } = renderHook(() => usePortfolioData());
      await waitFor(() => expect(result.current.totalSAL).toBe(25));
    });

    it('separates myPending projects', async () => {
      const { result } = renderHook(() => usePortfolioData());
      await waitFor(() => expect(result.current.loading).toBe(false));
      expect(result.current.myPending).toHaveLength(1);
      expect(result.current.myPending[0]._id).toBe('p2');
    });

    it('filters out zero-balance non-owner projects', async () => {
      const otherProject = { ...APPROVED_PROJECT, _id: 'other', ownerWallet: '0xOther' };
      mockProjects.mockResolvedValue([otherProject]);
      mockSalBalance.mockResolvedValue(0);
      const { result } = renderHook(() => usePortfolioData());
      await waitFor(() => expect(result.current.loading).toBe(false));
      expect(result.current.balances).toHaveLength(0);
    });

    it('sets error message when load fails', async () => {
      mockProjects.mockRejectedValue(new Error('network error'));
      const { result } = renderHook(() => usePortfolioData());
      await waitFor(() => expect(result.current.message).toBeTruthy());
      expect(result.current.messageIsError).toBe(true);
    });
  });

  describe('runWithdrawProceeds', () => {
    it('calls withdrawProceeds and reloads', async () => {
      mockWithdrawProceeds.mockResolvedValue(TX_RESP);
      const { result } = renderHook(() => usePortfolioData());
      await waitFor(() => expect(result.current.loading).toBe(false));
      await act(async () => { await result.current.runWithdrawProceeds(); });
      expect(mockWithdrawProceeds).toHaveBeenCalled();
      expect(result.current.message).toContain('✓');
      expect(result.current.messageIsError).toBe(false);
    });

    it('sets error on failure', async () => {
      mockWithdrawProceeds.mockRejectedValue(new Error('insufficient balance'));
      const { result } = renderHook(() => usePortfolioData());
      await waitFor(() => expect(result.current.loading).toBe(false));
      await act(async () => { await result.current.runWithdrawProceeds(); });
      expect(result.current.messageIsError).toBe(true);
      expect(result.current.message).toBe('insufficient balance');
    });
  });

  describe('runWithdrawRefund', () => {
    it('calls withdrawTokenizationRefund', async () => {
      mockWithdrawTokenizationRefund.mockResolvedValue(TX_RESP);
      const { result } = renderHook(() => usePortfolioData());
      await waitFor(() => expect(result.current.loading).toBe(false));
      await act(async () => { await result.current.runWithdrawRefund(); });
      expect(mockWithdrawTokenizationRefund).toHaveBeenCalled();
      expect(result.current.message).toContain('✓');
    });
  });

  describe('runCancelListing', () => {
    it('calls cancelListing with listingId', async () => {
      mockCancelListing.mockResolvedValue(TX_RESP);
      const { result } = renderHook(() => usePortfolioData());
      await waitFor(() => expect(result.current.loading).toBe(false));
      await act(async () => { await result.current.runCancelListing(7); });
      expect(mockCancelListing).toHaveBeenCalledWith(7);
    });
  });

  describe('runCancelPending', () => {
    it('calls cancelPendingProject with projectId', async () => {
      mockCancelPendingProject.mockResolvedValue(TX_RESP);
      const { result } = renderHook(() => usePortfolioData());
      await waitFor(() => expect(result.current.loading).toBe(false));
      await act(async () => { await result.current.runCancelPending(3); });
      expect(mockCancelPendingProject).toHaveBeenCalledWith(3);
    });
  });

  describe('runCreateListing', () => {
    it('calls createListing with selectedProjectId, amount, price', async () => {
      mockCreateListing.mockResolvedValue(TX_RESP);
      const { result } = renderHook(() => usePortfolioData());
      await waitFor(() => expect(result.current.balances).toHaveLength(1));
      // selectedProjectId is auto-set to 1 by initial load
      act(() => { result.current.setListAmount(5); result.current.setListPrice('0.02'); });
      await act(async () => { await result.current.runCreateListing(); });
      expect(mockCreateListing).toHaveBeenCalledWith('0xOwner', 1, 5, '0.02');
    });

    it('is a no-op when no project is selected', async () => {
      const { result } = renderHook(() => usePortfolioData());
      // Don't wait for load — selectedProjectId is null initially
      await act(async () => { await result.current.runCreateListing(); });
      expect(mockCreateListing).not.toHaveBeenCalled();
    });
  });

  describe('clearMessage', () => {
    it('resets message to null', async () => {
      mockWithdrawProceeds.mockRejectedValue(new Error('fail'));
      const { result } = renderHook(() => usePortfolioData());
      await waitFor(() => expect(result.current.loading).toBe(false));
      await act(async () => { await result.current.runWithdrawProceeds(); });
      expect(result.current.message).toBeTruthy();
      act(() => result.current.clearMessage());
      expect(result.current.message).toBeNull();
    });
  });
});
