/**
 * Direct Impact Calculator
 *
 * Computes direct beneficiaries from sector allocation, accounting for
 * diminishing marginal returns and sector reach rates.
 *
 *   D_i_s = (A_s / c_i_s) * reach_s * saturation_factor(A_s)
 *
 * Where:
 *   A_s = allocation to sector s
 *   c_i_s = average cost per direct beneficiary
 *   reach_s = fraction of target population reached (0-1)
 *   saturation_factor = 1 - e^(-λ_s * A_s)   (diminishing returns)
 */

import type { Sector } from '../data/sectors';

export interface DirectImpactResult {
  sectorId: string;
  allocation: number;
  directBeneficiaries: number;
  saturationFactor: number;
  costPerBeneficiaryUsed: number;
  reachRate: number;
}

/**
 * Compute direct beneficiaries for a single sector.
 * Reach rate is a function of allocation (more money → more reach, but saturates).
 */
export function computeDirectImpact(
  sector: Sector,
  allocation: number,
  reachRate: number = 0.7
): DirectImpactResult {
  if (allocation <= 0) {
    return {
      sectorId: sector.id,
      allocation: 0,
      directBeneficiaries: 0,
      saturationFactor: 0,
      costPerBeneficiaryUsed: sector.costPerBeneficiary.value,
      reachRate: 0,
    };
  }

  const { value: costPerBeneficiary } = sector.costPerBeneficiary;
  const lambda = sector.diminishingLambda.value;
  const saturationFactor = 1 - Math.exp(-lambda * allocation);

  // Raw reach-adjusted beneficiaries
  const rawBeneficiaries = (allocation / costPerBeneficiary) * reachRate;

  // Apply diminishing returns
  const effectiveBeneficiaries = rawBeneficiaries * saturationFactor;

  return {
    sectorId: sector.id,
    allocation,
    directBeneficiaries: Math.round(effectiveBeneficiaries),
    saturationFactor,
    costPerBeneficiaryUsed: costPerBeneficiary,
    reachRate,
  };
}

/**
 * Compute direct impact across all sectors.
 */
export function computeTotalDirectImpact(
  sectors: Sector[],
  allocations: Record<string, number>,
  reachRates: Record<string, number> = {}
): DirectImpactResult[] {
  return sectors.map((s) => {
    const allocation = allocations[s.id] ?? 0;
    const reach = reachRates[s.id] ?? 0.7;
    return computeDirectImpact(s, allocation, reach);
  });
}

/**
 * Sum of direct beneficiaries across all sectors.
 */
export function totalBeneficiaries(results: DirectImpactResult[]): number {
  return results.reduce((sum, r) => sum + r.directBeneficiaries, 0);
}
