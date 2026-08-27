/**
 * Regional Allocation Strategies
 *
 * Two strategies for distributing 100M SAR across Saudi's 13 regions:
 * 1. Population-based: allocate proportional to population share
 * 2. Gap-based: allocate to underserved regions (where coverage index < 1)
 *
 * Important: We do NOT assume that lower-development regions always
 * have higher marginal returns. This is a heuristic, not a prediction.
 */

import type { Region } from '../data/regions';

export interface RegionalAllocation {
  regionId: string;
  arName: string;
  enName: string;
  amount: number;
  share: number;
  rationale: string;
}

export function populationBasedAllocation(
  regions: Region[],
  totalBudget: number
): RegionalAllocation[] {
  const totalPop = regions.reduce((s, r) => s + r.populationShare, 0);
  return regions
    .map((r) => ({
      regionId: r.id,
      arName: r.arName,
      enName: r.enName,
      amount: Math.round((r.populationShare / totalPop) * totalBudget),
      share: r.populationShare / totalPop,
      rationale: `يتناسب مع الحصة السكانية (${(r.populationShare * 100).toFixed(1)}%)`,
    }))
    .sort((a, b) => b.amount - a.amount);
}

export function gapBasedAllocation(
  regions: Region[],
  totalBudget: number
): RegionalAllocation[] {
  // Gap score: how underserved is this region
  // coverageIndex < 1 means underserved
  // We weight by (1 - coverageIndex) but bounded to be non-negative
  const gaps = regions.map((r) => ({
    region: r,
    gap: Math.max(0, 1 - r.coverageIndex) + 0.1, // floor at 0.1 to avoid zero
  }));
  const totalGap = gaps.reduce((s, g) => s + g.gap, 0);
  return gaps
    .map((g) => ({
      regionId: g.region.id,
      arName: g.region.arName,
      enName: g.region.enName,
      amount: Math.round((g.gap / totalGap) * totalBudget),
      share: g.gap / totalGap,
      rationale: `منطقة منخفضة التغطية (مؤشر ${g.region.coverageIndex.toFixed(2)}) — فجوة ${(g.gap * 100).toFixed(0)}%`,
    }))
    .sort((a, b) => b.amount - a.amount);
}

export function compareAllocations(
  pop: RegionalAllocation[],
  gap: RegionalAllocation[]
): Array<{
  regionId: string;
  arName: string;
  popAmount: number;
  gapAmount: number;
  diff: number;
  diffPct: number;
}> {
  return pop.map((p, i) => {
    const g = gap[i];
    return {
      regionId: p.regionId,
      arName: p.arName,
      popAmount: p.amount,
      gapAmount: g.amount,
      diff: g.amount - p.amount,
      diffPct: p.amount > 0 ? ((g.amount - p.amount) / p.amount) * 100 : 0,
    };
  });
}
