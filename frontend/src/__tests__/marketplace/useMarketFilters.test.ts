import { describe, it, expect } from 'vitest';
import type { Listing, Project } from '../../types/domain';
import { applyDcFilters, deriveFilterOptions, geographyOf, VINTAGE_MIN } from '../../components/marketplace/useMarketFilters';

function makeProject(onChainProjectId: number, overrides: Partial<Project> = {}): Project {
  return {
    _id: String(onChainProjectId),
    chainId: 11155111,
    marketplaceContractAddress: '0x',
    projectName: `Project ${onChainProjectId}`,
    ownerWallet: '0xowner',
    ipfsHash: `Qm${onChainProjectId}`,
    totalCarbon: 1000,
    mintedTokenAmount: 100,
    status: 'Approved',
    onChainProjectId,
    approvalVotes: 1,
    rejectionVotes: 0,
    eligibleValidatorCount: 1,
    approvalQuorum: 1,
    listedTokens: 100,
    soldTokens: 0,
    blacklisted: false,
    cancelled: false,
    projectMetadata: {
      description: 'desc',
      properties: {
        project_type: 'Solar',
        location: 'Ho Chi Minh City, Vietnam',
        methodology: 'VCS',
        monitoring_period: { start: '2024-01-01', end: '2024-12-31' },
      },
    },
    ...overrides,
  };
}

function makeListing(projectId: number): Listing {
  return {
    listingId: projectId,
    projectId,
    sellerAddress: '0xseller',
    initialAmount: 100,
    remainingAmount: 50,
    pricePerUnitWei: '20000000000000000',
    pricePerUnitETH: '0.020',
    active: true,
  };
}

// ── geographyOf ──────────────────────────────────────────────────────────────

describe('geographyOf', () => {
  it('extracts last segment from "City, Country" format', () => {
    expect(geographyOf(makeProject(1))).toBe('Vietnam');
  });

  it('returns the only segment when no comma', () => {
    const p = makeProject(1, { projectMetadata: { properties: { location: 'Vietnam' } } });
    expect(geographyOf(p)).toBe('Vietnam');
  });

  it('handles multi-segment "City, Province, Country"', () => {
    const p = makeProject(1, { projectMetadata: { properties: { location: 'Cần Giờ, Ho Chi Minh City, Vietnam' } } });
    expect(geographyOf(p)).toBe('Vietnam');
  });

  it('returns empty string for undefined project', () => {
    expect(geographyOf(undefined)).toBe('');
  });

  it('returns empty string when location is absent', () => {
    const p = makeProject(1, { projectMetadata: { properties: {} } });
    expect(geographyOf(p)).toBe('');
  });
});

// ── applyDcFilters ───────────────────────────────────────────────────────────

describe('applyDcFilters', () => {
  const solar2024 = makeProject(1);
  const wind2025 = makeProject(2, {
    projectMetadata: {
      properties: {
        project_type: 'Wind',
        location: 'Bạc Liêu, Vietnam',
        methodology: 'VCS',
        monitoring_period: { start: '2025-03-01', end: '2025-12-31' },
      },
    },
  });
  const forestNoVintage = makeProject(3, {
    projectMetadata: {
      properties: { project_type: 'Forest', location: 'Đà Lạt, Vietnam', methodology: 'Gold Standard' },
    },
  });

  const listings = [makeListing(1), makeListing(2), makeListing(3)];
  const projectMap = new Map<number | null | undefined, Project>([
    [1, solar2024],
    [2, wind2025],
    [3, forestNoVintage],
  ]);

  const noFilter = { projectType: '', geography: '', vintage: VINTAGE_MIN };

  it('returns original reference when no filters are active', () => {
    const result = applyDcFilters(listings, projectMap, noFilter);
    expect(result).toBe(listings);
  });

  it('filters by project type', () => {
    const result = applyDcFilters(listings, projectMap, { ...noFilter, projectType: 'Solar' });
    expect(result).toHaveLength(1);
    expect(result[0].projectId).toBe(1);
  });

  it('filters by geography', () => {
    const result = applyDcFilters(listings, projectMap, { ...noFilter, geography: 'Vietnam' });
    expect(result).toHaveLength(3);
  });

  it('filters by vintage year — 2024', () => {
    const result = applyDcFilters(listings, projectMap, { ...noFilter, vintage: 2024 });
    // projectId 1 matches; projectId 3 has no vintage (passes through); projectId 2 is 2025 (excluded)
    const ids = result.map((l) => l.projectId);
    expect(ids).toContain(1);
    expect(ids).toContain(3);
    expect(ids).not.toContain(2);
  });

  it('projects with no vintage data always pass the vintage filter', () => {
    const result = applyDcFilters(listings, projectMap, { ...noFilter, vintage: 2025 });
    expect(result.find((l) => l.projectId === 3)).toBeDefined();
  });

  it('combines type + vintage filters', () => {
    const result = applyDcFilters(listings, projectMap, { projectType: 'Wind', geography: '', vintage: 2025 });
    expect(result).toHaveLength(1);
    expect(result[0].projectId).toBe(2);
  });

  it('returns empty array when nothing matches', () => {
    const result = applyDcFilters(listings, projectMap, { ...noFilter, projectType: 'Mangrove' });
    expect(result).toHaveLength(0);
  });

  it('does not mutate the original listings array', () => {
    const copy = [...listings];
    applyDcFilters(listings, projectMap, { ...noFilter, projectType: 'Solar' });
    expect(listings).toEqual(copy);
  });
});

// ── deriveFilterOptions ──────────────────────────────────────────────────────

describe('deriveFilterOptions', () => {
  it('extracts unique sorted types and geographies', () => {
    const projects = [
      makeProject(1),  // Solar, Vietnam
      makeProject(2, { projectMetadata: { properties: { project_type: 'Wind', location: 'Hanoi, Vietnam' } } }),
    ];
    const { types, geos } = deriveFilterOptions(projects);
    expect(types).toEqual(['Solar', 'Wind']);
    expect(geos).toEqual(['Vietnam']);
  });

  it('deduplicates entries', () => {
    const projects = [makeProject(1), makeProject(2)];
    const { types, geos } = deriveFilterOptions(projects);
    expect(types).toHaveLength(1);
    expect(geos).toHaveLength(1);
  });

  it('skips projects with no type or location', () => {
    const empty = makeProject(1, { projectMetadata: { properties: {} } });
    const { types, geos } = deriveFilterOptions([empty]);
    expect(types).toHaveLength(0);
    expect(geos).toHaveLength(0);
  });

  it('returns empty arrays for empty input', () => {
    const { types, geos } = deriveFilterOptions([]);
    expect(types).toHaveLength(0);
    expect(geos).toHaveLength(0);
  });
});
