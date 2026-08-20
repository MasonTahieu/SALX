import type { FileEntry, UseDocumentUploadResult } from './useDocumentUpload';

const STATUS_ICON: Record<FileEntry['status'], string> = {
  pending: '○',
  uploading: '◌',
  done: '✓',
  error: '✕',
};

const STATUS_COLOR: Record<FileEntry['status'], string> = {
  pending: 'text-[var(--sal-muted)]',
  uploading: 'text-[var(--sal-primary)] animate-spin',
  done: 'text-[var(--sal-primary)]',
  error: 'text-[var(--sal-danger)]',
};

interface Props {
  entries: UseDocumentUploadResult['entries'];
  addFiles: UseDocumentUploadResult['addFiles'];
  removeFile: UseDocumentUploadResult['removeFile'];
  isUploading: UseDocumentUploadResult['isUploading'];
}

export function DocumentUploadPanel({ entries, addFiles, removeFile, isUploading }: Props) {
  return (
    <div className="space-y-3">
      <label className="sal-label">
        Project documents · max 20 · 5 MB each
      </label>

      <div className="relative flex items-center justify-center gap-2 rounded-[14px] border border-dashed border-[var(--sal-border)] bg-[var(--sal-surface-soft)] py-7 px-5 text-sm transition hover:border-[var(--sal-primary)]">
        <input
          type="file"
          multiple
          className="absolute inset-0 cursor-pointer opacity-0"
          onChange={e => addFiles(e.target.files)}
          disabled={isUploading}
          accept="application/pdf,image/*,.doc,.docx,.xlsx,.csv"
          aria-label="Upload project documents"
        />
        <span className="font-bold text-[var(--sal-primary)]">Click to add files</span>
        <span className="text-[var(--sal-muted)]">· PDF, images, Office docs</span>
      </div>

      {entries.length > 0 && (
        <ul className="space-y-2">
          {entries.map((entry, i) => (
            <li
              key={`${entry.file.name}-${entry.file.size}`}
              className="flex items-center gap-3 rounded-[13px] border border-[var(--sal-border)] bg-[var(--sal-surface)] px-4 py-3 text-sm"
            >
              <span className={`w-4 flex-none text-center text-base font-bold leading-none ${STATUS_COLOR[entry.status]}`}>
                {STATUS_ICON[entry.status]}
              </span>
              <span className="flex-1 truncate font-medium">{entry.file.name}</span>
              <span className="flex-none text-xs text-[var(--sal-muted)]">
                {(entry.file.size / (1024 * 1024)).toFixed(1)} MB
              </span>
              {entry.error && (
                <span className="flex-none text-xs text-[var(--sal-danger)]">{entry.error}</span>
              )}
              {entry.status !== 'uploading' && (
                <button
                  type="button"
                  onClick={() => removeFile(i)}
                  className="flex-none text-[var(--sal-muted)] transition hover:text-[var(--sal-danger)]"
                  aria-label={`Remove ${entry.file.name}`}
                >
                  ✕
                </button>
              )}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
