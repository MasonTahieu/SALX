import { describe, it, expect } from 'vitest';
import { filterAndSortListings } from '../../components/marketplace/filterAndSortListings';
import type { Listing, Project } from '../../types/domain';

function makeProject(overrides: Partial<Project> = {}): Project {
  return {
    _id: '1',
    chainId: 11155111,
    marketplaceContractAddress: '0x',
    projectName: 'Forest Alpha',
    ownerWallet: '0xowner',
    ipfsHash: 'Qm1',
    totalCarbon: 100,
    mintedTokenAmount: 100,
    status: 'Approved',
    approvalVotes: 3,
    rejectionVotes: 0,
    eligibleValidatorCount: 5,
    approvalQuorum: 3,
    listedTokens: 50,
    soldTokens: 0,
    blacklisted: false,
    cancelled: false,
    onChainProjectId: 1,
    projectMetadata: {
      description: 'Forest description',
      properties: {
        project_type: 'Forest',
        location: 'Vietnam',
        methodology: 'REDD+',
      },
    },
    ...overrides,
  };
}

function makeListing(overrides: Partial<Listing> = {}): Listing {
  return {
    listingId: 1,
    projectId: 1,
    sellerAddress: '0xseller',
    initialAmount: 100,
    remainingAmount: 80,
    pricePerUnitWei: '1000000000000000',
    pricePerUnitETH: '0.001',
    active: true,
    ...overrides,
  };
}

const forestProject = makeProject({ onChainProjectId: 1, projectName: 'Forest Alpha' });
const solarProject = makeProject({
  _id: '2',
  onChainProjectId: 2,
  projectName: 'Solar Beta',
  projectMetadata: {
    description: 'Solar description',
    properties: { project_type: 'Solar', location: 'Germany', methodology: 'CDM' },
  },
});

const projectMap = new Map<number | null | undefined, Project>([
  [1, forestProject],
  [2, solarProject],
]);

const listing1 = makeListing({ listingId: 1, projectId: 1, pricePerUnitETH: '0.002', remainingAmount: 50 });
const listing2 = makeListing({ listingId: 2, projectId: 2, pricePerUnitETH: '0.005', remainingAmount: 200 });

describe('filterAndSortListings', () => {
  describe('filtering', () => {
    it('returns all listings when search and projectType are empty', () => {
      const result = filterAndSortListings([listing1, listing2], projectMap, {
        search: '', projectType: '', sort: 'featured',
      });
      expect(result).toHaveLength(2);
    });

    it('filters by search term matching project name (case-insensitive)', () => {
      const result = filterAndSortListings([listing1, listing2], projectMap, {
        search: 'FOREST', projectType: '', sort: 'featured',
      });
      expect(result).toHaveLength(1);
      expect(result[0].listingId).toBe(1);
    });

    it('filters by search term matching projectId string', () => {
      const result = filterAndSortListings([listing1, listing2], projectMap, {
        search: '2', projectType: '', sort: 'featured',
      });
      expect(result.some((l) => l.listingId === 2)).toBe(true);
    });

    it('filters by project type', () => {
      const result = filterAndSortListings([listing1, listing2], projectMap, {
        search: '', projectType: 'Solar', sort: 'featured',
      });
      expect(result).toHaveLength(1);
      expect(result[0].listingId).toBe(2);
    });

    it('applies both search and projectType filters together', () => {
      const result = filterAndSortListings([listing1, listing2], projectMap, {
        search: 'germany', projectType: 'Solar', sort: 'featured',
      });
      expect(result).toHaveLength(1);
      expect(result[0].listingId).toBe(2);
    });

    it('returns empty array when search matches nothing', () => {
      const result = filterAndSortListings([listing1, listing2], projectMap, {
        search: 'xyznotfound', projectType: '', sort: 'featured',
      });
      expect(result).toHaveLength(0);
    });

    it('returns empty array when projectType matches nothing', () => {
      const result = filterAndSortListings([listing1, listing2], projectMap, {
        search: '', projectType: 'Wind', sort: 'featured',
      });
      expect(result).toHaveLength(0);
    });

    it('handles empty listings array', () => {
      const result = filterAndSortListings([], projectMap, {
        search: 'anything', projectType: '', sort: 'featured',
      });
      expect(result).toHaveLength(0);
    });

    it('includes orphan listing (no matching project) when no filters active', () => {
      const orphan = makeListing({ listingId: 3, projectId: 99 });
      const result = filterAndSortListings([orphan], projectMap, {
        search: '', projectType: '', sort: 'featured',
      });
      expect(result).toHaveLength(1);
    });

    it('excludes orphan listing when projectType filter is active', () => {
      const orphan = makeListing({ listingId: 3, projectId: 99 });
      const result = filterAndSortListings([orphan], projectMap, {
        search: '', projectType: 'Forest', sort: 'featured',
      });
      expect(result).toHaveLength(0);
    });

    it('trims whitespace from search term', () => {
      const result = filterAndSortListings([listing1, listing2], projectMap, {
        search: '   solar   ', projectType: '', sort: 'featured',
      });
      expect(result).toHaveLength(1);
    });
  });

  describe('sorting', () => {
    it('sorts by listingId ascending when sort is "featured"', () => {
      const result = filterAndSortListings([listing2, listing1], projectMap, {
        search: '', projectType: '', sort: 'featured',
      });
      expect(result[0].listingId).toBe(1);
      expect(result[1].listingId).toBe(2);
    });

    it('sorts by pricePerUnitETH ascending', () => {
      const result = filterAndSortListings([listing2, listing1], projectMap, {
        search: '', projectType: '', sort: 'priceAsc',
      });
      expect(Number(result[0].pricePerUnitETH)).toBeLessThanOrEqual(Number(result[1].pricePerUnitETH));
    });

    it('sorts by pricePerUnitETH descending', () => {
      const result = filterAndSortListings([listing1, listing2], projectMap, {
        search: '', projectType: '', sort: 'priceDesc',
      });
      expect(Number(result[0].pricePerUnitETH)).toBeGreaterThanOrEqual(Number(result[1].pricePerUnitETH));
    });

    it('sorts by remainingAmount descending', () => {
      const result = filterAndSortListings([listing1, listing2], projectMap, {
        search: '', projectType: '', sort: 'availableDesc',
      });
      expect(result[0].remainingAmount).toBeGreaterThanOrEqual(result[1].remainingAmount);
    });
  });

  describe('immutability', () => {
    it('does not mutate the original listings array', () => {
      const original = [listing2, listing1];
      filterAndSortListings(original, projectMap, { search: '', projectType: '', sort: 'priceAsc' });
      expect(original[0].listingId).toBe(2);
    });
  });
});
