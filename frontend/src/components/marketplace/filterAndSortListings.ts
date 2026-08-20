import type { Listing, Project } from '../../types/domain';
import type { MarketSort } from './MarketplaceToolbar';
import { projectDisplay, projectSearchText } from '../../lib/projectMeta';

export interface FilterOptions {
  search: string;
  projectType: string;
  sort: MarketSort;
}

/**
 * O(n) filter pass followed by O(n log n) sort.
 * Returns a new array — the original is never mutated.
 */
export function filterAndSortListings(
  listings: Listing[],
  projectMap: Map<number | null | undefined, Project>,
  { search, projectType, sort }: FilterOptions,
): Listing[] {
  const needle = search.trim().toLowerCase();

  const filtered = listings.filter((listing) => {
    const project = projectMap.get(listing.projectId);
    const type = projectDisplay(project).projectType;
    const matchesSearch =
      !needle ||
      projectSearchText(project).includes(needle) ||
      String(listing.projectId).includes(needle);
    const matchesType = !projectType || type === projectType;
    return matchesSearch && matchesType;
  });

  return [...filtered].sort((a, b) => {
    if (sort === 'priceAsc') return Number(a.pricePerUnitETH) - Number(b.pricePerUnitETH);
    if (sort === 'priceDesc') return Number(b.pricePerUnitETH) - Number(a.pricePerUnitETH);
    if (sort === 'availableDesc') return b.remainingAmount - a.remainingAmount;
    return a.listingId - b.listingId;
  });
}
