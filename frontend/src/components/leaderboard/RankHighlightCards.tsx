import { formatNumber, shortAddress } from '../../lib/format';

const MONO = "'JetBrains Mono', monospace";
const SYNE = "'Syne', sans-serif";

export interface LeaderRow {
  parentWalletAddress?: string;
  walletAddress?: string;
  address?: string;
  totalRetiredCO2Kg?: number;
  totalRetired?: number;
  retiredCO2Kg?: number;
  certificateCount?: number;
}

interface Props {
  rows: LeaderRow[];
}

// Renders a 3-card podium: rank 2 (left), rank 1 (center featured), rank 3 (right)
export function RankHighlightCards({ rows }: Props) {
  if (rows.length < 3) return null;

  const podium: [LeaderRow, string, boolean][] = [
    [rows[1], '02', false],
    [rows[0], '01', true],
    [rows[2], '03', false],
  ];

  return (
    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.12fr 1fr', gap: 10, marginTop: 34 }}>
      {podium.map(([row, rank, featured]) => {
        const address = row.parentWalletAddress ?? row.walletAddress ?? row.address ?? '';
        const kg = row.totalRetiredCO2Kg ?? row.totalRetired ?? row.retiredCO2Kg ?? 0;

        const cardStyle = featured
          ? { border: '1px solid rgba(45,201,34,.30)', background: 'linear-gradient(160deg,rgba(45,201,34,.16),rgba(45,201,34,.03))' }
          : { border: '1px solid var(--bd-soft)', background: 'var(--surf)' };

        const labelColor = featured ? 'var(--g)' : 'var(--mut)';
        const rankOpacity = featured ? 'rgba(45,201,34,.10)' : 'rgba(244,242,234,.05)';

        return (
          <div
            key={address || rank}
            style={{ position: 'relative', padding: '18px 15px', minHeight: 100, overflow: 'hidden', borderRadius: 11, ...cardStyle }}
          >
            <div style={{ fontFamily: MONO, fontSize: 9, letterSpacing: '.08em', textTransform: 'uppercase', color: labelColor }}>
              {rank} · {featured ? 'LEADING IMPACT' : 'IMPACT LEADER'}
            </div>
            <div style={{ fontFamily: SYNE, fontSize: 18, letterSpacing: '-.01em', margin: '12px 0 5px', color: 'var(--ink)', fontWeight: 700 }}>
              {shortAddress(address, 8, 6)}
            </div>
            <strong style={{ fontFamily: MONO, fontSize: 10, color: 'var(--g)', fontWeight: 500 }}>
              {formatNumber(kg)} kg CO₂e
            </strong>
            {row.certificateCount != null && (
              <div style={{ fontFamily: MONO, fontSize: 8, color: 'var(--mut)', marginTop: 4 }}>{row.certificateCount} SBTs</div>
            )}
            <span style={{ position: 'absolute', right: 16, bottom: 10, fontFamily: SYNE, fontSize: 32, fontWeight: 800, color: rankOpacity, letterSpacing: '-.05em', pointerEvents: 'none' }}>
              {rank}
            </span>
          </div>
        );
      })}
    </div>
  );
}
