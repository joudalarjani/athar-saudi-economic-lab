/**
 * Multi-Objective Optimizer
 *
 * Uses a simple weighted-sum LP approach (we don't need glpk.js for 7 variables;
 * we can solve directly).
 *
 * Maximize: Σ_k w_k × F_k(x)
 * Subject to: Σ x_s = 100M, x_s in [min_s, max_s]
 *
 * Where F_k are normalized objective functions (all 0-1).
 *
 * This is a simplified optimization — no integrality, no convexity guarantees.
 * We present it as "optimal under the selected objectives and assumptions"
 * (never as "the perfect allocation").
 */

import type { Sector } from '../data/sectors';
import { computeDirectImpact } from './impact';
import { getSectorSROI } from './sroi';
import { computeMultiplier } from './multiplier';
import { computeResilience } from './resilience';
import { sectorMin, sectorMax } from '../lib/budget';

export interface OptimizationResult {
  allocation: Record<string, number>;
  objectiveBreakdown: {
    objective: string;
    weight: number;
    normalizedScore: number;
  }[];
  totalBeneficiaries: number;
  totalSocialValue: number;
  totalGdpImpact: number;
  resilience: number;
  /** Comparison to user allocation */
  diffVsUser: Record<string, number>;
}

export type ObjectiveWeights = {
  efficiency: number;
  impact: number;
  equity: number;
  sustainability: number;
  resilience: number;
};

const DEFAULT_WEIGHTS: ObjectiveWeights = {
  efficiency: 0.30,
  impact: 0.30,
  equity: 0.15,
  sustainability: 0.15,
  resilience: 0.10,
};

/**
 * Normalize weights to sum to 1.
 */
export function normalizeWeights(w: ObjectiveWeights): ObjectiveWeights {
  const total = w.efficiency + w.impact + w.equity + w.sustainability + w.resilience;
  if (total === 0) return DEFAULT_WEIGHTS;
  return {
    efficiency: w.efficiency / total,
    impact: w.impact / total,
    equity: w.equity / total,
    sustainability: w.sustainability / total,
    resilience: w.resilience / total,
  };
}

/**
 * Compute the objective function score for a candidate allocation.
 * Returns a value 0-1.
 */
function evaluateObjective(
  sectors: Sector[],
  allocation: Record<string, number>,
  weights: ObjectiveWeights
): { total: number; breakdown: { objective: string; weight: number; normalizedScore: number }[] } {
  const w = normalizeWeights(weights);
  const total = Object.values(allocation).reduce((s, v) => s + v, 0);
  if (total === 0) {
    return { total: 0, breakdown: [] };
  }

  // Efficiency: lower cost per beneficiary is better
  let totalBeneficiaries = 0;
  for (const sector of sectors) {
    const a = allocation[sector.id] ?? 0;
    totalBeneficiaries += computeDirectImpact(sector, a).directBeneficiaries;
  }
  // Max possible beneficiaries if all budget went to highest-efficiency sector
  // (heuristic: use the sector with lowest cost per beneficiary)
  const minCost = Math.min(...sectors.map((s) => s.costPerBeneficiary.value));
  const maxBeneficiariesIfAll = total / minCost;
  const efficiencyScore = Math.min(1, totalBeneficiaries / maxBeneficiariesIfAll);

  // Impact: total SROI social value (normalized)
  let totalSocialValue = 0;
  for (const sector of sectors) {
    const a = allocation[sector.id] ?? 0;
    const sroi = getSectorSROI(sector);
    totalSocialValue += a * sroi.median;
  }
  // Max possible social value (all in highest SROI sector)
  const maxSroi = Math.max(...sectors.map((s) => getSectorSROI(s).median));
  const maxSocialValue = total * maxSroi;
  const impactScore = maxSocialValue > 0 ? totalSocialValue / maxSocialValue : 0;

  // Equity: lower HHI is better (1 - HHI)
  const hhi = sectors.reduce((sum, s) => {
    const share = (allocation[s.id] ?? 0) / total;
    return sum + share * share;
  }, 0);
  const equityScore = 1 - hhi;

  // Sustainability: weighted average of sector sustainability scores
  let weightedSustainability = 0;
  for (const sector of sectors) {
    const share = (allocation[sector.id] ?? 0) / total;
    weightedSustainability += share * sector.sustainabilityScore.value;
  }
  const sustainabilityScore = weightedSustainability;

  // Resilience: use resilience module
  const resilienceResult = computeResilience(sectors, allocation);
  const resilienceScore = resilienceResult.totalResilience;

  const breakdown = [
    { objective: 'efficiency', weight: w.efficiency, normalizedScore: efficiencyScore },
    { objective: 'impact', weight: w.impact, normalizedScore: impactScore },
    { objective: 'equity', weight: w.equity, normalizedScore: equityScore },
    { objective: 'sustainability', weight: w.sustainability, normalizedScore: sustainabilityScore },
    { objective: 'resilience', weight: w.resilience, normalizedScore: resilienceScore },
  ];

  const totalScore =
    w.efficiency * efficiencyScore +
    w.impact * impactScore +
    w.equity * equityScore +
    w.sustainability * sustainabilityScore +
    w.resilience * resilienceScore;

  return { total: totalScore, breakdown };
}

/**
 * Iterative LP-like search.
 * Since we have only 7 sectors and constraints are box + sum, we can
 * solve directly with a smart greedy / coordinate-descent.
 */
export function optimizeAllocation(
  sectors: Sector[],
  totalBudget: number,
  weights: ObjectiveWeights
): OptimizationResult {
  // Start with equal allocation
  const n = sectors.length;
  let allocation: Record<string, number> = {};
  for (const s of sectors) {
    allocation[s.id] = Math.max(
      sectorMin(s, totalBudget),
      Math.min(sectorMax(s, totalBudget), totalBudget / n)
    );
  }

  // Adjust to hit total budget
  let allocatedSum = Object.values(allocation).reduce((s, v) => s + v, 0);
  const diff = totalBudget - allocatedSum;
  if (Math.abs(diff) > 0.01) {
    // Distribute the diff to sectors with capacity
    const flexible = sectors.filter(
      (s) =>
        (allocation[s.id] ?? 0) + diff / n >= sectorMin(s, totalBudget) &&
        (allocation[s.id] ?? 0) + diff / n <= sectorMax(s, totalBudget)
    );
    if (flexible.length > 0) {
      for (const s of flexible) {
        allocation[s.id] = (allocation[s.id] ?? 0) + diff / flexible.length;
      }
    }
  }

  // Coordinate descent: try shifting budget from one sector to another
  const MAX_ITERATIONS = 50;
  const STEP = Math.max(50_000, Math.round(totalBudget / 40)); // ~40 steps across the range

  let currentScore = evaluateObjective(sectors, allocation, weights).total;
  let improved = true;
  let iter = 0;

  while (improved && iter < MAX_ITERATIONS) {
    improved = false;
    iter++;

    for (let i = 0; i < sectors.length; i++) {
      for (let j = 0; j < sectors.length; j++) {
        if (i === j) continue;
        const from = sectors[i];
        const to = sectors[j];
        const fromAmount = allocation[from.id] ?? 0;
        const toAmount = allocation[to.id] ?? 0;

        if (fromAmount - STEP < sectorMin(from, totalBudget)) continue;
        if (toAmount + STEP > sectorMax(to, totalBudget)) continue;

        // Try the swap
        allocation[from.id] = fromAmount - STEP;
        allocation[to.id] = toAmount + STEP;
        const newScore = evaluateObjective(sectors, allocation, weights).total;

        if (newScore > currentScore + 0.0001) {
          currentScore = newScore;
          improved = true;
        } else {
          // Revert
          allocation[from.id] = fromAmount;
          allocation[to.id] = toAmount;
        }
      }
    }
  }

  // Compute final metrics
  let totalBeneficiaries = 0;
  let totalSocialValue = 0;
  let totalGdpImpact = 0;
  for (const sector of sectors) {
    const a = allocation[sector.id] ?? 0;
    totalBeneficiaries += computeDirectImpact(sector, a).directBeneficiaries;
    const sroi = getSectorSROI(sector);
    totalSocialValue += a * sroi.median;
    const mult = computeMultiplier(sector, a);
    totalGdpImpact += mult.totalGdpImpact;
  }
  const resilienceResult = computeResilience(sectors, allocation);

  const { breakdown } = evaluateObjective(sectors, allocation, weights);

  return {
    allocation,
    objectiveBreakdown: breakdown,
    totalBeneficiaries,
    totalSocialValue,
    totalGdpImpact,
    resilience: resilienceResult.totalResilience,
    diffVsUser: {}, // filled by caller
  };
}

export function compareToUser(
  optimized: OptimizationResult,
  userAllocation: Record<string, number>
): OptimizationResult {
  const diffVsUser: Record<string, number> = {};
  for (const id of Object.keys(optimized.allocation)) {
    diffVsUser[id] = (optimized.allocation[id] ?? 0) - (userAllocation[id] ?? 0);
  }
  return { ...optimized, diffVsUser };
}
