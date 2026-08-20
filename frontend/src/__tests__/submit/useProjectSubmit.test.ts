import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';

vi.mock('../../services/backend', () => ({
  uploadDocumentToIPFS: vi.fn(),
  backend: {
    createProjectMetadata: vi.fn(),
  },
}));

vi.mock('../../services/blockchain', () => ({
  submitProject: vi.fn(),
}));

vi.mock('../../contexts/WalletContext', () => ({
  useWallet: vi.fn(),
}));

import { useProjectSubmit } from '../../components/submit/useProjectSubmit';
import { backend } from '../../services/backend';
import { submitProject } from '../../services/blockchain';
import { useWallet } from '../../contexts/WalletContext';

const mockCreateMetadata = vi.mocked(backend.createProjectMetadata);
const mockSubmitProject = vi.mocked(submitProject);
const mockUseWallet = vi.mocked(useWallet);

const CONNECTED_WALLET = {
  address: '0xOwner',
  connected: true,
  connecting: false,
  openWalletModal: vi.fn(),
};

const MOCK_METADATA_RESP = {
  projectURI: 'ipfs://QmMeta',
  ipfsHash: 'QmMeta',
  metadata: {},
  nextAction: {
    contract: '0xMarket',
    method: 'submitProject' as const,
    args: ['ipfs://QmMeta', 1000] as [string, number],
    valueWei: '667000000000',
    valueETH: '0.000667',
  },
};

describe('useProjectSubmit', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockUseWallet.mockReturnValue(CONNECTED_WALLET as any);
  });

  it('initializes with empty form, null metadata, null txHash', () => {
    const { result } = renderHook(() => useProjectSubmit());
    expect(result.current.form.projectName).toBe('');
    expect(result.current.form.proposedCO2Kg).toBe('1000');
    expect(result.current.metadata).toBeNull();
    expect(result.current.txHash).toBeNull();
    expect(result.current.busy).toBe(false);
    expect(result.current.error).toBeNull();
  });

  it('setField updates the target form field only', () => {
    const { result } = renderHook(() => useProjectSubmit());
    act(() => result.current.setField('projectName', 'Cần Giờ Forest'));
    expect(result.current.form.projectName).toBe('Cần Giờ Forest');
    expect(result.current.form.description).toBe('');
  });

  describe('fetchMetadata', () => {
    it('calls backend.createProjectMetadata with correct payload', async () => {
      mockCreateMetadata.mockResolvedValue(MOCK_METADATA_RESP);
      const { result } = renderHook(() => useProjectSubmit());
      act(() => result.current.setField('projectName', 'Forest'));

      await act(async () => {
        await result.current.fetchMetadata([{ name: 'doc.pdf', uri: 'ipfs://QmDoc' }]);
      });

      expect(mockCreateMetadata).toHaveBeenCalledWith(
        expect.objectContaining({
          projectName: 'Forest',
          proposedCO2Kg: 1000,
          ownerWallet: '0xOwner',
          documents: [{ name: 'doc.pdf', uri: 'ipfs://QmDoc' }],
        }),
      );
    });

    it('returns true and populates metadata on success', async () => {
      mockCreateMetadata.mockResolvedValue(MOCK_METADATA_RESP);
      const { result } = renderHook(() => useProjectSubmit());

      let ok: boolean;
      await act(async () => { ok = await result.current.fetchMetadata([]); });

      expect(ok!).toBe(true);
      expect(result.current.metadata).toEqual({
        projectURI: 'ipfs://QmMeta',
        valueWei: '667000000000',
        valueETH: '0.000667',
        proposedCO2Kg: 1000,
      });
    });

    it('strips empty optional fields from payload', async () => {
      mockCreateMetadata.mockResolvedValue(MOCK_METADATA_RESP);
      const { result } = renderHook(() => useProjectSubmit());

      await act(async () => { await result.current.fetchMetadata([]); });

      const payload = mockCreateMetadata.mock.calls[0][0];
      expect(payload.monitoringStart).toBeUndefined();
      expect(payload.monitoringEnd).toBeUndefined();
      expect(payload.externalUrl).toBeUndefined();
      expect(payload.image).toBeUndefined();
    });

    it('includes optional fields when they are set', async () => {
      mockCreateMetadata.mockResolvedValue(MOCK_METADATA_RESP);
      const { result } = renderHook(() => useProjectSubmit());
      act(() => {
        result.current.setField('monitoringStart', '2024-01-01');
        result.current.setField('externalUrl', 'https://example.com');
      });

      await act(async () => { await result.current.fetchMetadata([]); });

      const payload = mockCreateMetadata.mock.calls[0][0];
      expect(payload.monitoringStart).toBe('2024-01-01');
      expect(payload.externalUrl).toBe('https://example.com');
    });

    it('returns false and sets error on API failure', async () => {
      mockCreateMetadata.mockRejectedValue(new Error('API down'));
      const { result } = renderHook(() => useProjectSubmit());

      let ok: boolean;
      await act(async () => { ok = await result.current.fetchMetadata([]); });

      expect(ok!).toBe(false);
      expect(result.current.error).toBe('API down');
      expect(result.current.metadata).toBeNull();
    });

    it('opens wallet modal and returns false when wallet not connected', async () => {
      const openWalletModal = vi.fn();
      mockUseWallet.mockReturnValue({ ...CONNECTED_WALLET, address: null, openWalletModal } as any);
      const { result } = renderHook(() => useProjectSubmit());

      let ok: boolean;
      await act(async () => { ok = await result.current.fetchMetadata([]); });

      expect(ok!).toBe(false);
      expect(openWalletModal).toHaveBeenCalledOnce();
      expect(mockCreateMetadata).not.toHaveBeenCalled();
    });
  });

  describe('submitOnChain', () => {
    it('calls submitProject with projectURI, proposedCO2Kg, and valueWei', async () => {
      mockCreateMetadata.mockResolvedValue(MOCK_METADATA_RESP);
      mockSubmitProject.mockResolvedValue({ txHash: '0xTX', blockNumber: 50 } as any);
      const { result } = renderHook(() => useProjectSubmit());

      await act(async () => { await result.current.fetchMetadata([]); });
      await act(async () => { await result.current.submitOnChain(); });

      expect(mockSubmitProject).toHaveBeenCalledWith('ipfs://QmMeta', 1000, '667000000000');
    });

    it('returns true and sets txHash on success', async () => {
      mockCreateMetadata.mockResolvedValue(MOCK_METADATA_RESP);
      mockSubmitProject.mockResolvedValue({ txHash: '0xDEADBEEF' } as any);
      const { result } = renderHook(() => useProjectSubmit());

      await act(async () => { await result.current.fetchMetadata([]); });

      let ok: boolean;
      await act(async () => { ok = await result.current.submitOnChain(); });

      expect(ok!).toBe(true);
      expect(result.current.txHash).toBe('0xDEADBEEF');
    });

    it('returns false and sets error when metadata is missing', async () => {
      const { result } = renderHook(() => useProjectSubmit());

      let ok: boolean;
      await act(async () => { ok = await result.current.submitOnChain(); });

      expect(ok!).toBe(false);
      expect(result.current.error).toBeTruthy();
      expect(mockSubmitProject).not.toHaveBeenCalled();
    });

    it('returns false and sets error on blockchain rejection', async () => {
      mockCreateMetadata.mockResolvedValue(MOCK_METADATA_RESP);
      mockSubmitProject.mockRejectedValue(new Error('user rejected'));
      const { result } = renderHook(() => useProjectSubmit());

      await act(async () => { await result.current.fetchMetadata([]); });

      let ok: boolean;
      await act(async () => { ok = await result.current.submitOnChain(); });

      expect(ok!).toBe(false);
      expect(result.current.error).toBe('user rejected');
      expect(result.current.txHash).toBeNull();
    });

    it('opens wallet modal and returns false when wallet disconnected at submit time', async () => {
      mockCreateMetadata.mockResolvedValue(MOCK_METADATA_RESP);
      const openWalletModal = vi.fn();
      const { result, rerender } = renderHook(() => useProjectSubmit());
      await act(async () => { await result.current.fetchMetadata([]); });

      // Change the mock and re-render so the hook closure picks up the new wallet value
      mockUseWallet.mockReturnValue({ ...CONNECTED_WALLET, address: null, openWalletModal } as any);
      rerender();

      let ok: boolean;
      await act(async () => { ok = await result.current.submitOnChain(); });

      expect(ok!).toBe(false);
      expect(openWalletModal).toHaveBeenCalledOnce();
      expect(mockSubmitProject).not.toHaveBeenCalled();
    });
  });

  it('clearError resets error to null', async () => {
    mockCreateMetadata.mockRejectedValue(new Error('boom'));
    const { result } = renderHook(() => useProjectSubmit());
    await act(async () => { await result.current.fetchMetadata([]); });
    expect(result.current.error).toBeTruthy();

    act(() => result.current.clearError());
    expect(result.current.error).toBeNull();
  });
});
