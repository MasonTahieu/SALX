import { formatNumber } from '../../lib/format';

const MONO = "'JetBrains Mono', monospace";
const SYNE = "'Syne', sans-serif";

interface Props {
  totalRetiredKg: number;
  entryCount: number;
}

export function LeaderboardHero({ totalRetiredKg, entryCount }: Props) {
  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', borderBottom: '1px solid var(--bd-soft)', paddingBottom: 12 }}>
        <span style={{ fontFamily: MONO, fontSize: 10, letterSpacing: '.08em', textTransform: 'uppercase', color: 'var(--mut)' }}>01 / VERIFIED CLIMATE IMPACT</span>
        <span style={{ fontFamily: MONO, fontSize: 8, letterSpacing: '.14em', color: 'var(--g)' }}>FY 2026</span>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0,1.2fr) minmax(240px,.7fr)', gap: 40, marginTop: 28, alignItems: 'end' }}>
        <h1 style={{ fontFamily: SYNE, fontWeight: 800, fontSize: 'clamp(48px,6.2vw,70px)', lineHeight: .88, letterSpacing: '-.02em', margin: 0, color: 'var(--g)' }}>
          GREEN LEADERS,<br />
          <span style={{ color: 'var(--ink)', fontSize: 70 }}>ON-CHAIN.</span>
        </h1>

        {entryCount > 0 && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            <div style={{ display: 'flex', flexDirection: 'column', background: 'var(--surf)', border: '1px solid var(--bd-soft)', borderRadius: 10, padding: '12px 16px' }}>
              <span style={{ fontFamily: MONO, fontSize: 7, letterSpacing: '.12em', textTransform: 'uppercase', color: 'var(--mut)', marginBottom: 6 }}>PARTICIPANTS</span>
              <strong style={{ fontFamily: MONO, fontSize: 22, color: 'var(--ink)', fontWeight: 700 }}>{entryCount}</strong>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', background: 'var(--surf)', border: '1px solid var(--bd-soft)', borderRadius: 10, padding: '12px 16px' }}>
              <span style={{ fontFamily: MONO, fontSize: 7, letterSpacing: '.12em', textTransform: 'uppercase', color: 'var(--mut)', marginBottom: 6 }}>TOTAL RETIRED</span>
              <strong style={{ fontFamily: MONO, fontSize: 22, color: 'var(--g)', fontWeight: 700 }}>{formatNumber(totalRetiredKg / 1000, 1)} tCO₂e</strong>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
