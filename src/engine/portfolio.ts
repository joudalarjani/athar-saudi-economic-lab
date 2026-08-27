/**
 * Portfolio Aggregator
 *
 * Combines all engine results into a single comprehensive portfolio view
 * that the UI can consume.
 */

import type { Sector } from '../data/sectors';
import { computeTotalDirectImpact, totalBeneficiaries } from './impact';
import { computeAllSROI, portfolioSROI } from './sroi';
import { computeAllMultipliers, portfolioMultiplier } from './multiplier';
import { portfolioTimeProfile } from './timeDiscounting';
import { computeResilience } from './resilience';

export interface PortfolioMetrics {
  totalBudget: number;
  totalBeneficiaries: number;
  totalSocialValue: number;
  totalGdpImpact: number;
  totalEmployment: number;
  portfolioSROI: number;
  portfolioMultiplier: number;
  npvSocial: number;
  npvGdp: number;
  npvTotal: number;
  resilienceScore: number;
  /** Year-by-year projection */
  timeProfile: ReturnType<typeof portfolioTimeProfile>;
  /** Sector-level breakdown */
  sectorMetrics: Array<{
    sectorId: string;
    arName: string;
    color: string;
    allocation: number;
    directBeneficiaries: number;
    sroi: number;
    socialValue: number;
    gdpImpact: number;
    employment: number;
  }>;
}

export function computePortfolioMetrics(
  sectors: Sector[],
  allocations: Record<string, number>,
  discountRate: number = 0.03,
  horizon: number = 10
): PortfolioMetrics {
  const totalBudget = Object.values(allocations).reduce((s, v) => s + v, 0);

  // Direct impact
  const directResults = computeTotalDirectImpact(sectors, allocations);
  const totalBene = totalBeneficiaries(directResults);
  const directBySector: Record<string, number> = {};
  for (const r of directResults) {
    directBySector[r.sectorId] = r.directBeneficiaries;
  }

  // SROI
  const sroiResults = computeAllSROI(sectors, allocations, directBySector);
  const totalSocialValue = sroiResults.reduce((s, r) => s + r.totalSocialValue, 0);
  const portSROI = portfolioSROI(sroiResults);
  const sroiBySector: Record<string, number> = {};
  for (const r of sroiResults) {
    sroiBySector[r.sectorId] = r.totalSocialValue;
  }

  // Multiplier
  const multResults = computeAllMultipliers(sectors, allocations);
  const totalGdp = multResults.reduce((s, r) => s + r.totalGdpImpact, 0);
  const portMult = portfolioMultiplier(multResults);
  const gdpBySector: Record<string, number> = {};
  for (const r of multResults) {
    gdpBySector[r.sectorId] = r.totalGdpImpact;
  }

  // Employment
  const empBySector: Record<string, number> = {};
  let totalEmployment = 0;
  for (const sector of sectors) {
    const a = allocations[sector.id] ?? 0;
    const emp = (a / 1_000_000) * sector.jobsPerMSAR.value;
    empBySector[sector.id] = emp;
    totalEmployment += emp;
  }

  // Time profile
  const timeProfile = portfolioTimeProfile(
    sectors,
    allocations,
    sroiBySector,
    gdpBySector,
    empBySector,
    discountRate,
    horizon
  );

  // Resilience
  const resilience = computeResilience(sectors, allocations);

  // Per-sector metrics
  const sectorMetrics = sectors.map((s) => {
    const a = allocations[s.id] ?? 0;
    return {
      sectorId: s.id,
      arName: s.arName,
      color: s.color,
      allocation: a,
      directBeneficiaries: directBySector[s.id] ?? 0,
      sroi: sroiResults.find((r) => r.sectorId === s.id)?.sroi ?? 0,
      socialValue: sroiBySector[s.id] ?? 0,
      gdpImpact: gdpBySector[s.id] ?? 0,
      employment: empBySector[s.id] ?? 0,
    };
  });

  return {
    totalBudget,
    totalBeneficiaries: totalBene,
    totalSocialValue,
    totalGdpImpact: totalGdp,
    totalEmployment,
    portfolioSROI: portSROI,
    portfolioMultiplier: portMult,
    npvSocial: timeProfile.npvSocial,
    npvGdp: timeProfile.npvGdp,
    npvTotal: timeProfile.npvTotal,
    resilienceScore: resilience.totalResilience,
    timeProfile,
    sectorMetrics,
  };
}
