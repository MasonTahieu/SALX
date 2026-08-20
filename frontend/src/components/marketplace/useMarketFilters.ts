import { useState } from 'react';
import type { Listing, Project } from '../../types/domain';
import { projectDisplay } from '../../lib/projectMeta';

export const VINTAGE_MIN = 2020;
export const VINTAGE_MAX = 2026;

export interface DcFilterState {
  projectType: string;
  geography: string;
  vintage: number;
}

const DEFAULT: DcFilterState = { projectType: '', geography: '', vintage: VINTAGE_MIN };

function vintageYear(project?: Project): number | null {
  const { monitoringStart } = projectDisplay(project);
  if (monitoringStart) {
    const y = new Date(monitoringStart).getFullYear();
    if (!isNaN(y) && y > 1970) return y;
  }
  if (project?.createdAt) {
    const y = new Date(project.createdAt).getFullYear();
    if (!isNaN(y) && y > 1970) return y;
  }
  return null;
}

export function geographyOf(project?: Project): string {
  const loc = projectDisplay(project).location;
  if (!loc) return '';
  const parts = loc.split(',').map((s) => s.trim()).filter(Boolean);
  return parts.length > 1 ? parts[parts.length - 1] : parts[0];
}

// O(n) single-pass filter — never mutates input array
export function applyDcFilters(
  listings: Listing[],
  projectMap: Map<number | null | undefined, Project>,
  { projectType, geography, vintage }: DcFilterState,
): Listing[] {
  const byType = Boolean(projectType);
  const byGeo = Boolean(geography);
  const byVintage = vintage > VINTAGE_MIN;

  if (!byType && !byGeo && !byVintage) return listings;

  return listings.filter((listing) => {
    const project = projectMap.get(listing.projectId);
    if (byType && projectDisplay(project).projectType !== projectType) return false;
    if (byGeo && geographyOf(project) !== geography) return false;
    if (byVintage) {
      const vy = vintageYear(project);
      // projects with no vintage data always pass through
      if (vy !== null && vy !== vintage) return false;
    }
    return true;
  });
}

// O(n) derivation of unique, sorted option lists from real project data
export function deriveFilterOptions(projects: Project[]): { types: string[]; geos: string[] } {
  const seenTypes = new Set<string>();
  const seenGeos = new Set<string>();
  const types: string[] = [];
  const geos: string[] = [];

  for (const p of projects) {
    const type = projectDisplay(p).projectType;
    if (type && !seenTypes.has(type)) { seenTypes.add(type); types.push(type); }
    const geo = geographyOf(p);
    if (geo && !seenGeos.has(geo)) { seenGeos.add(geo); geos.push(geo); }
  }

  return { types: types.sort(), geos: geos.sort() };
}

export function useMarketFilters() {
  const [pending, setPending] = useState<DcFilterState>(DEFAULT);
  const [active, setActive] = useState<DcFilterState>(DEFAULT);

  const updatePending = (patch: Partial<DcFilterState>) =>
    setPending((prev) => ({ ...prev, ...patch }));

  const apply = () => setActive({ ...pending });
  const clear = () => { setPending(DEFAULT); setActive(DEFAULT); };

  return { pending, updatePending, active, apply, clear };
}
