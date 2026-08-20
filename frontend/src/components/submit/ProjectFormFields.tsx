import type { ProjectFormData } from './useProjectSubmit';

const PROJECT_TYPES = [
  'Forestry', 'Mangrove', 'Solar', 'Wind',
  'Methane', 'Cookstove', 'Blue Carbon', 'Other',
];

interface Props {
  form: ProjectFormData;
  setField: (key: keyof ProjectFormData, value: string) => void;
  t: (key: string) => string;
}

export function ProjectFormFields({ form, setField, t }: Props) {
  const requestedSAL = Math.floor(Number(form.proposedCO2Kg || 0) / 10);

  return (
    <div className="grid gap-4 md:grid-cols-2">
      <div className="md:col-span-2">
        <label className="sal-label">{t('submit.name')} *</label>
        <input
          className="sal-input"
          required
          value={form.projectName}
          onChange={e => setField('projectName', e.target.value)}
        />
      </div>

      <div className="md:col-span-2">
        <label className="sal-label">{t('submit.description')} *</label>
        <textarea
          className="sal-input min-h-28"
          required
          value={form.description}
          onChange={e => setField('description', e.target.value)}
        />
      </div>

      <div>
        <label className="sal-label">{t('submit.proposed')} *</label>
        <input
          className="sal-input"
          type="number"
          min="10"
          step="10"
          required
          value={form.proposedCO2Kg}
          onChange={e => setField('proposedCO2Kg', e.target.value)}
        />
        <p className="mt-1 text-xs text-[var(--sal-muted)]">
          {t('submit.requested')}: {requestedSAL} SAL
        </p>
      </div>

      <div>
        <label className="sal-label">{t('submit.type')}</label>
        <select
          className="sal-input"
          value={form.projectType}
          onChange={e => setField('projectType', e.target.value)}
        >
          <option value="">— Select —</option>
          {PROJECT_TYPES.map(pt => (
            <option key={pt} value={pt}>{pt}</option>
          ))}
        </select>
      </div>

      <div>
        <label className="sal-label">{t('submit.location')}</label>
        <input
          className="sal-input"
          value={form.location}
          onChange={e => setField('location', e.target.value)}
        />
      </div>

      <div>
        <label className="sal-label">{t('submit.methodology')}</label>
        <input
          className="sal-input"
          value={form.methodology}
          onChange={e => setField('methodology', e.target.value)}
        />
      </div>

      <div>
        <label className="sal-label">{t('submit.start')}</label>
        <input
          className="sal-input"
          type="date"
          value={form.monitoringStart}
          onChange={e => setField('monitoringStart', e.target.value)}
        />
      </div>

      <div>
        <label className="sal-label">{t('submit.end')}</label>
        <input
          className="sal-input"
          type="date"
          value={form.monitoringEnd}
          onChange={e => setField('monitoringEnd', e.target.value)}
        />
      </div>

      <div>
        <label className="sal-label">{t('submit.external')}</label>
        <input
          className="sal-input"
          placeholder="https://…"
          value={form.externalUrl}
          onChange={e => setField('externalUrl', e.target.value)}
        />
      </div>

      <div>
        <label className="sal-label">{t('submit.image')}</label>
        <input
          className="sal-input"
          placeholder="ipfs://…"
          value={form.image}
          onChange={e => setField('image', e.target.value)}
        />
      </div>
    </div>
  );
}
