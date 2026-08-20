import { useEffect, useState } from 'react';
import { backend } from '../services/backend';
import { useWallet } from '../contexts/WalletContext';
import type { Certificate, Project, TransactionEvent } from '../types/domain';
import { formatDate } from '../lib/format';
import { Card } from '../components/ui/Card';
import { Badge } from '../components/ui/Badge';
import { WalletButton } from '../components/wallet/WalletButton';
import { CertificateCard } from '../components/certificate/CertificateCard';
import { EmptyState } from '../components/ui/EmptyState';
import { useLanguage } from '../contexts/LanguageContext';

type CertStatus = Certificate['status'];

const STATUS_TONE: Record<CertStatus, 'success' | 'danger' | 'warning' | 'neutral'> = {
  ACTIVE: 'success',
  REVOKED: 'danger',
  PENDING: 'warning',
  EXPIRED: 'neutral',
};

function CertStatusBadge({ status }: { status: CertStatus }) {
  return <Badge tone={STATUS_TONE[status] ?? 'neutral'}>{status}</Badge>;
}

export function CertificatesPage() {
  const wallet = useWallet();
  const { t } = useLanguage();
  const [certs, setCerts] = useState<Certificate[]>([]);
  const [txs, setTxs] = useState<TransactionEvent[]>([]);
  const [projectMap, setProjectMap] = useState<Map<number, Project>>(new Map());
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!wallet.address) return;
    setLoading(true);
    // Certs + txs are critical — load together; a failure here is a real error
    Promise.all([
      backend.certificatesByWallet(wallet.address),
      backend.transactions(wallet.address),
    ])
      .then(([certificates, transactions]) => {
        setCerts(certificates);
        setTxs(transactions);
      })
      .catch(() => {})
      .finally(() => setLoading(false));

    // Projects are non-critical — only needed to enrich CertificateCard with metadata
    backend.projects('approved')
      .then(projects => {
        const map = new Map<number, Project>();
        for (const p of projects) {
          if (p.onChainProjectId != null) map.set(p.onChainProjectId, p);
        }
        setProjectMap(map);
      })
      .catch(() => {}); // Cert display still works without it
  }, [wallet.address]);

  if (!wallet.address) {
    return (
      <Card className="p-6">
        <h1 className="text-2xl font-black">{t('cert.title')}</h1>
        <p className="mt-2 text-[var(--sal-muted)]">{t('dashboard.notConnected')}</p>
        <WalletButton className="mt-4" />
      </Card>
    );
  }

  const activeCerts = certs.filter(c => c.status === 'ACTIVE');

  return (
    <div className="space-y-6">
      <div className="sal-hero p-6 sm:p-8">
        <div className="text-xs font-black uppercase tracking-widest text-white/55">{t('cert.eyebrow')}</div>
        <h1 className="mt-2 text-2xl font-black sm:text-3xl">{t('cert.title')}</h1>
        <p className="mt-2 max-w-xl text-sm text-white/70">{t('cert.desc')}</p>
        {certs.length > 0 && (
          <div className="mt-6 flex flex-wrap gap-3">
            <div className="market-hero-stat">
              <span>Soulbound Tokens</span>
              <strong>{certs.length}</strong>
            </div>
            <div className="market-hero-stat">
              <span>Active</span>
              <strong>{activeCerts.length}</strong>
            </div>
          </div>
        )}
      </div>

      {loading ? (
        <div className="grid gap-5 lg:grid-cols-2">
          <CertSkeletonCard />
          <CertSkeletonCard />
        </div>
      ) : certs.length === 0 ? (
        <EmptyState title={t('cert.none')} description={t('cert.noneHint')} />
      ) : (
        <div className="grid gap-5 lg:grid-cols-2">
          {certs.map(certificate => (
            <div key={certificate.certificateTokenId} className="space-y-2">
              <div className="flex items-center justify-between px-1">
                <span className="text-sm font-black">SBT #{certificate.certificateTokenId}</span>
                <CertStatusBadge status={certificate.status} />
              </div>
              <CertificateCard certificate={certificate} project={projectMap.get(certificate.projectId)} />
            </div>
          ))}
        </div>
      )}

      <Card className="p-5">
        <div className="flex items-center justify-between gap-3">
          <div>
            <h2 className="text-lg font-black">{t('cert.history')}</h2>
            <p className="mt-1 text-xs text-[var(--sal-muted)]">{t('cert.historyHint')}</p>
          </div>
          <span className="sal-meta-pill">{txs.length}</span>
        </div>
        <div className="mt-4 divide-y divide-[var(--sal-border)]">
          {txs.length === 0 ? (
            <div className="py-4 text-sm text-[var(--sal-muted)]">{t('cert.noHistory')}</div>
          ) : (
            txs.map((tx, index) => (
              <div key={`${tx.txHash}-${index}`} className="flex items-center justify-between gap-4 py-3">
                <div>
                  <b>{tx.transactionType || 'Blockchain event'}</b>
                  <div className="text-xs text-[var(--sal-muted)]">{tx.txHash.slice(0, 18)}…</div>
                </div>
                <div className="text-right text-xs text-[var(--sal-muted)]">
                  <div>{tx.tokenAmount != null ? `${tx.tokenAmount} SAL` : ''}</div>
                  <div>{formatDate(tx.timestamp)}</div>
                </div>
              </div>
            ))
          )}
        </div>
      </Card>
    </div>
  );
}

function CertSkeletonCard() {
  return (
    <div style={{ background: 'var(--sal-surface)', border: '1px solid var(--sal-border)', borderRadius: 12, overflow: 'hidden' }}>
      <div style={{ height: 56, background: 'var(--sal-surface-soft)', borderBottom: '1px solid var(--sal-border)' }} className="market-card-skeleton__cover" />
      <div style={{ height: 190 }} className="market-card-skeleton__cover" />
      <div style={{ padding: '14px 18px', display: 'flex', flexDirection: 'column', gap: 10 }}>
        <div className="market-card-skeleton__line" style={{ width: '60%' }} />
        <div className="market-card-skeleton__line" style={{ width: '80%' }} />
        <div className="market-card-skeleton__line" style={{ width: '45%' }} />
      </div>
    </div>
  );
}
