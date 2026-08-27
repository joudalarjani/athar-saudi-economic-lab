/**
 * Resilience Score
 *
 * Composite metric of how robust a portfolio is to shocks.
 *
 *   Resilience = 0.3 × (1 - HHI) + 0.3 × (1 - Dependency) + 0.2 × CounterCyclicality + 0.2 × (1 - σ)
 *
 * Where:
 *   HHI = Herfindahl-Hirschman Index of allocation concentration
 *   Dependency = reliance on single funding source
 *   CounterCyclicality = how each sector performs in downturns (sector-specific)
 *   σ = variance of impact under historical stress tests
 *
 * All four components are documented and bounded 0-1.
 * Final score 0-1, higher = more resilient.
 */

import type { Sector } from '../data/sectors';
import { SUSTAINABILITY_UNDER_SHOCK } from './sectorResilienceParams';

export interface ResilienceResult {
  hhi: number;
  allocationConcentrationScore: number; // 1 - HHI
  fundingDependency: number;
  fundingDependencyScore: number; // 1 - fundingDependency
  counterCyclicality: number; // 0-1
  counterCyclicalityScore: number; // 0-1
  shockStdDev: number; // σ
  shockStdDevScore: number; // 1 - normalized σ
  totalResilience: number; // 0-1
  breakdown: {
    label: string;
    score: number;
    weight: number;
    contribution: number;
  }[];
}

/**
 * Herfindahl-Hirschman Index for allocation.
 * 0 = perfectly diversified, 1 = all in one sector.
 */
export function hhi(values: number[]): number {
  const total = values.reduce((s, v) => s + v, 0);
  if (total === 0) return 0;
  const shares = values.map((v) => v / total);
  return shares.reduce((s, sh) => s + sh * sh, 0);
}

/**
 * Funding mix dependency: max single share (excluding diversified assumptions).
 */
export function fundingDependency(fundingMix: Record<string, number>): number {
  const total = Object.values(fundingMix).reduce((s, v) => s + v, 0);
  if (total === 0) return 0;
  const maxShare = Math.max(...Object.values(fundingMix).map((v) => v / total));
  return maxShare;
}

/**
 * Counter-cyclicality of the portfolio.
 * Each sector has a "performs-better-in-downturn" coefficient.
 * This aggregates to portfolio level.
 *
 * For simplicity, we use sector's sustainabilityScore (higher = more
 * persistent through shocks) as a proxy.
 */
export function counterCyclicalityScore(
  sectors: Sector[],
  allocations: Record<string, number>
): number {
  const total = Object.values(allocations).reduce((s, v) => s + v, 0);
  if (total === 0) return 0;
  let weightedSum = 0;
  for (const s of sectors) {
    const a = allocations[s.id] ?? 0;
    if (a <= 0) continue;
    const weight = a / total;
    // sustainabilityScore is 0-1, higher = better counter-cyclicality proxy
    weightedSum += weight * s.sustainabilityScore.value;
  }
  return weightedSum;
}

/**
 * Compute σ from sector impact under stress (we run a simple model).
 * For each sector, we use its performance under each shock (the
 * sectorEffectivenessMultiplier from shocks.ts). σ is the std dev of
 * sectoral impact variability.
 */
export function shockStdDev(
  sectors: Sector[],
  allocations: Record<string, number>
): number {
  const allMultipliers = SUSTAINABILITY_UNDER_SHOCK; // from sectorResilienceParams
  const variances: number[] = [];
  const total = Object.values(allocations).reduce((s, v) => s + v, 0);
  if (total === 0) return 0;

  for (const s of sectors) {
    const a = allocations[s.id] ?? 0;
    if (a <= 0) continue;
    const sectorMults = allMultipliers[s.id] ?? [];
    if (sectorMults.length === 0) continue;
    const mean = sectorMults.reduce((sum, v) => sum + v, 0) / sectorMults.length;
    const variance =
      sectorMults.reduce((sum, v) => sum + (v - mean) * (v - mean), 0) / sectorMults.length;
    const weight = a / total;
    variances.push(weight * variance);
  }
  return Math.sqrt(variances.reduce((s, v) => s + v, 0));
}

export function computeResilience(
  sectors: Sector[],
  allocations: Record<string, number>,
  fundingMix: Record<string, number> = {}
): ResilienceResult {
  const allocationsArr = sectors.map((s) => allocations[s.id] ?? 0);
  const hhiValue = hhi(allocationsArr);
  const concentrationScore = 1 - hhiValue;

  const fundDep = fundingMix && Object.keys(fundingMix).length > 0 ? fundingDependency(fundingMix) : 0.5;
  const fundingDepScore = 1 - fundDep;

  const cycScore = counterCyclicalityScore(sectors, allocations);
  const sigma = shockStdDev(sectors, allocations);
  // Normalize σ: 0 → 1, 0.5+ → 0
  const sigmaScore = Math.max(0, 1 - sigma * 2);

  const weights = { concentration: 0.3, funding: 0.3, counter: 0.2, shock: 0.2 };
  const total =
    concentrationScore * weights.concentration +
    fundingDepScore * weights.funding +
    cycScore * weights.counter +
    sigmaScore * weights.shock;

  return {
    hhi: hhiValue,
    allocationConcentrationScore: concentrationScore,
    fundingDependency: fundDep,
    fundingDependencyScore: fundingDepScore,
    counterCyclicality: cycScore,
    counterCyclicalityScore: cycScore,
    shockStdDev: sigma,
    shockStdDevScore: sigmaScore,
    totalResilience: total,
    breakdown: [
      {
        label: 'تنويع التخصيص (1 - HHI)',
        score: concentrationScore,
        weight: weights.concentration,
        contribution: concentrationScore * weights.concentration,
      },
      {
        label: 'تنويع التمويل (1 - Dependency)',
        score: fundingDepScore,
        weight: weights.funding,
        contribution: fundingDepScore * weights.funding,
      },
      {
        label: 'القدرة على الصمود (Counter-Cyclicality)',
        score: cycScore,
        weight: weights.counter,
        contribution: cycScore * weights.counter,
      },
      {
        label: 'استقرار الأثر تحت الصدمات (1 - σ)',
        score: sigmaScore,
        weight: weights.shock,
        contribution: sigmaScore * weights.shock,
      },
    ],
  };
}
