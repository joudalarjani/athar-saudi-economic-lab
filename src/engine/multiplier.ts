/**
 * Keynesian / Economic Multiplier Cascade
 *
 * Computes the market-transaction ripple effect of social investment.
 *
 *   Direct:    Investment → Income to beneficiaries
 *   Indirect:  Income → Local supply chain (procurement)
 *   Induced:   Worker consumption → Additional business activity
 *   Final:     (Direct + Indirect + Induced) × (1 - Leakage)
 *
 * KEY PRINCIPLE: This is a MARKET-TRANSACTION multiplier, not a social
 * value metric. It measures GDP ripple, not welfare.
 *
 * We use it SEPARATELY from SROI. See sroi.ts for the welfare/social
 * value perspective.
 *
 * Sources: IMF Article IV Saudi 2024; SAMA research; Kahn (2010).
 * Per-sector multipliers are SIMULATION ASSUMPTIONS because Saudi
 * sector-specific multipliers are not officially published.
 */

import type { Sector } from '../data/sectors';

export interface MultiplierResult {
  sectorId: string;
  allocation: number;
  directValue: number;
  indirectValue: number;
  inducedValue: number;
  totalGdpImpact: number; // after leakage
  effectiveMultiplier: number; // totalGdpImpact / allocation
  /** Per SAR invested, total GDP generated (rounded for display) */
  ratio: string;
  /** Provenance — most sectors are SIMULATION_ASSUMPTION */
  evidenceLevel: string;
}

/**
 * Apply the 3-step cascade for a single sector.
 */
export function computeMultiplier(sector: Sector, allocation: number): MultiplierResult {
  if (allocation <= 0) {
    return {
      sectorId: sector.id,
      allocation: 0,
      directValue: 0,
      indirectValue: 0,
      inducedValue: 0,
      totalGdpImpact: 0,
      effectiveMultiplier: 0,
      ratio: '0.0×',
      evidenceLevel: sector.multiplier.evidence.level,
    };
  }

  const m = sector.multiplier;

  // Stage 1: Direct income to beneficiaries
  const directValue = allocation * m.direct;

  // Stage 2: Indirect supply chain
  // (driven by demand for goods/services from the direct beneficiaries + programs)
  const indirectValue = directValue * m.indirect;

  // Stage 3: Induced consumption by workers
  const inducedValue = (directValue + indirectValue) * m.induced;

  // Total before leakage
  const grossTotal = directValue + indirectValue + inducedValue;

  // Apply leakage
  const totalGdpImpact = grossTotal * (1 - m.leakage);

  const effectiveMultiplier = totalGdpImpact / allocation;

  return {
    sectorId: sector.id,
    allocation,
    directValue,
    indirectValue,
    inducedValue,
    totalGdpImpact,
    effectiveMultiplier,
    ratio: `${effectiveMultiplier.toFixed(2)}×`,
    evidenceLevel: m.evidence.level,
  };
}

export function computeAllMultipliers(
  sectors: Sector[],
  allocations: Record<string, number>
): MultiplierResult[] {
  return sectors.map((s) => computeMultiplier(s, allocations[s.id] ?? 0));
}

export function portfolioMultiplier(results: MultiplierResult[]): number {
  const totalGdp = results.reduce((s, r) => s + r.totalGdpImpact, 0);
  const totalInvestment = results.reduce((s, r) => s + r.allocation, 0);
  if (totalInvestment === 0) return 0;
  return totalGdp / totalInvestment;
}
