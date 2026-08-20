import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';

vi.mock('../../services/backend', () => ({
  uploadDocumentToIPFS: vi.fn(),
  backend: {},
}));

import { useDocumentUpload } from '../../components/submit/useDocumentUpload';
import { uploadDocumentToIPFS } from '../../services/backend';

const mockUpload = vi.mocked(uploadDocumentToIPFS);

function makeFile(name: string, sizeBytes = 1024): File {
  return new File([new Uint8Array(sizeBytes)], name, { type: 'application/pdf' });
}

function makeFileList(...files: File[]): FileList {
  return {
    length: files.length,
    item: (i: number) => files[i] ?? null,
    [Symbol.iterator]: function* () { yield* files; },
  } as unknown as FileList;
}

describe('useDocumentUpload', () => {
  beforeEach(() => {
    mockUpload.mockReset();
  });

  it('starts with empty entries', () => {
    const { result } = renderHook(() => useDocumentUpload());
    expect(result.current.entries).toHaveLength(0);
  });

  it('addFiles appends files as pending', () => {
    const { result } = renderHook(() => useDocumentUpload());
    act(() => result.current.addFiles(makeFileList(makeFile('a.pdf'), makeFile('b.pdf'))));
    expect(result.current.entries).toHaveLength(2);
    expect(result.current.entries[0].status).toBe('pending');
    expect(result.current.entries[1].status).toBe('pending');
  });

  it('addFiles ignores null', () => {
    const { result } = renderHook(() => useDocumentUpload());
    act(() => result.current.addFiles(null));
    expect(result.current.entries).toHaveLength(0);
  });

  it('addFiles deduplicates by name+size', () => {
    const { result } = renderHook(() => useDocumentUpload());
    const file = makeFile('dup.pdf');
    act(() => result.current.addFiles(makeFileList(file)));
    act(() => result.current.addFiles(makeFileList(file)));
    expect(result.current.entries).toHaveLength(1);
  });

  it('addFiles caps at 20 files', () => {
    const { result } = renderHook(() => useDocumentUpload());
    const files = Array.from({ length: 25 }, (_, i) => makeFile(`f${i}.pdf`));
    act(() => result.current.addFiles(makeFileList(...files)));
    expect(result.current.entries.length).toBeLessThanOrEqual(20);
  });

  it('removeFile removes entry at given index', () => {
    const { result } = renderHook(() => useDocumentUpload());
    act(() => result.current.addFiles(makeFileList(makeFile('a.pdf'), makeFile('b.pdf'))));
    act(() => result.current.removeFile(0));
    expect(result.current.entries).toHaveLength(1);
    expect(result.current.entries[0].file.name).toBe('b.pdf');
  });

  it('uploadAll uploads pending files and returns UploadedDocument[]', async () => {
    mockUpload.mockResolvedValue({ ipfsHash: 'QmABC' });
    const { result } = renderHook(() => useDocumentUpload());
    act(() => result.current.addFiles(makeFileList(makeFile('doc.pdf'))));

    let docs: Awaited<ReturnType<typeof result.current.uploadAll>>;
    await act(async () => { docs = await result.current.uploadAll(); });

    expect(docs!).toEqual([{ name: 'doc.pdf', uri: 'ipfs://QmABC' }]);
    expect(result.current.entries[0].status).toBe('done');
    expect(result.current.entries[0].uri).toBe('ipfs://QmABC');
  });

  it('uploadAll skips already-done files without re-uploading', async () => {
    mockUpload.mockResolvedValue({ ipfsHash: 'QmFirst' });
    const { result } = renderHook(() => useDocumentUpload());
    act(() => result.current.addFiles(makeFileList(makeFile('doc.pdf'))));

    await act(async () => { await result.current.uploadAll(); });
    await act(async () => { await result.current.uploadAll(); });

    expect(mockUpload).toHaveBeenCalledTimes(1);
  });

  it('uploadAll marks oversized file as error and excludes it from results', async () => {
    const bigFile = makeFile('big.pdf', 6 * 1024 * 1024);
    const { result } = renderHook(() => useDocumentUpload());
    act(() => result.current.addFiles(makeFileList(bigFile)));

    let docs: Awaited<ReturnType<typeof result.current.uploadAll>>;
    await act(async () => { docs = await result.current.uploadAll(); });

    expect(docs!).toHaveLength(0);
    expect(result.current.entries[0].status).toBe('error');
    expect(mockUpload).not.toHaveBeenCalled();
  });

  it('uploadAll marks file as error when network fails', async () => {
    mockUpload.mockRejectedValue(new Error('Network error'));
    const { result } = renderHook(() => useDocumentUpload());
    act(() => result.current.addFiles(makeFileList(makeFile('doc.pdf'))));

    let docs: Awaited<ReturnType<typeof result.current.uploadAll>>;
    await act(async () => { docs = await result.current.uploadAll(); });

    expect(docs!).toHaveLength(0);
    expect(result.current.entries[0].status).toBe('error');
    expect(result.current.entries[0].error).toBe('Network error');
  });

  it('uploadAll handles multiple files independently — one error does not abort others', async () => {
    mockUpload
      .mockRejectedValueOnce(new Error('fail'))
      .mockResolvedValueOnce({ ipfsHash: 'QmGood' });
    const { result } = renderHook(() => useDocumentUpload());
    act(() => result.current.addFiles(makeFileList(makeFile('bad.pdf'), makeFile('good.pdf'))));

    let docs: Awaited<ReturnType<typeof result.current.uploadAll>>;
    await act(async () => { docs = await result.current.uploadAll(); });

    expect(docs!).toHaveLength(1);
    expect(docs![0].name).toBe('good.pdf');
    expect(result.current.entries[0].status).toBe('error');
    expect(result.current.entries[1].status).toBe('done');
  });

  it('oversizedFileNames returns names of files over 5 MB', () => {
    const { result } = renderHook(() => useDocumentUpload());
    act(() => result.current.addFiles(makeFileList(
      makeFile('big.pdf', 6 * 1024 * 1024),
      makeFile('small.pdf', 100),
    )));
    expect(result.current.oversizedFileNames).toEqual(['big.pdf']);
  });

  it('isUploading is false when no uploads are in flight', () => {
    const { result } = renderHook(() => useDocumentUpload());
    expect(result.current.isUploading).toBe(false);
  });
});
