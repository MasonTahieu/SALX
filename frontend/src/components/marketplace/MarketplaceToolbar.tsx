import { useLanguage } from '../../contexts/LanguageContext';

export type MarketSort = 'featured' | 'priceAsc' | 'priceDesc' | 'availableDesc';

export function MarketplaceToolbar({
  search,
  onSearch,
  projectType,
  onProjectType,
  projectTypes,
  sort,
  onSort,
}: {
  search: string;
  onSearch: (value: string) => void;
  projectType: string;
  onProjectType: (value: string) => void;
  projectTypes: string[];
  sort: MarketSort;
  onSort: (value: MarketSort) => void;
}) {
  const { t } = useLanguage();
  return (
    <div className="market-toolbar">
      <div className="min-w-0 flex-1">
        <label className="sal-label">{t('market.searchLabel')}</label>
        <input className="sal-input" placeholder={t('market.search')} value={search} onChange={(event) => onSearch(event.target.value)} />
      </div>
      <div className="min-w-[190px]">
        <label className="sal-label">{t('market.projectType')}</label>
        <select className="sal-input" value={projectType} onChange={(event) => onProjectType(event.target.value)}>
          <option value="">{t('market.allTypes')}</option>
          {projectTypes.map((value) => <option key={value} value={value}>{value}</option>)}
        </select>
      </div>
      <div className="min-w-[190px]">
        <label className="sal-label">{t('market.sort')}</label>
        <select className="sal-input" value={sort} onChange={(event) => onSort(event.target.value as MarketSort)}>
          <option value="featured">{t('market.sortFeatured')}</option>
          <option value="priceAsc">{t('market.sortPriceAsc')}</option>
          <option value="priceDesc">{t('market.sortPriceDesc')}</option>
          <option value="availableDesc">{t('market.sortAvailable')}</option>
        </select>
      </div>
    </div>
  );
}
