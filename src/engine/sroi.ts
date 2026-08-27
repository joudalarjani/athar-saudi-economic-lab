/**
 * SROI (Social Return on Investment) Calculator
 *
 * SROI monetizes the social outcomes created by an investment:
 *   Social Value = Σ (Beneficiaries × Financial Proxy) × (1 - Deadweight) × Attribution
 *   SROI = Social Value / Investment
 *
 * KEY PRINCIPLE: SROI ≠ Economic Multiplier.
 *   - SROI captures monetized social outcomes (welfare, capability, equity)
 *   - Economic Multiplier captures market transactions (GDP ripple)
 *   - They answer different questions and use different methodologies
 *
 * This module intentionally keeps them separate. Do not mix.
 */

/** SROI evidence levels exclude VERIFIED (a single official figure) — SROI is always a range */
type SROIEvidenceLevel = 'CASE_STUDY' | 'ESTIMATE' | 'SIMULATION_ASSUMPTION';

import type { Sector } from '../data/sectors';
import { CASE_STUDIES } from '../data/caseStudies';

export interface SROIResult {
  sectorId: string;
  allocation: number;
  sroi: number; // single value: median of case-study range
  sroiMin: number;
  sroiMax: number;
  totalSocialValue: number; // SAR
  /** A range representing uncertainty from case studies */
  socialValueMin: number;
  socialValueMax: number;
  /** Provenance of SROI estimate */
  evidenceLevel: SROIEvidenceLevel;
  caseStudyCount: number;
}

/**
 * Get the effective SROI for a sector.
 * If we have case studies, we use their range.
 * Otherwise we use the sector's declared range (which may be SIMULATION_ASSUMPTION).
 */
export function getSectorSROI(sector: Sector): {
  min: number;
  max: number;
  median: number;
  caseStudyCount: number;
  evidenceLevel: SROIEvidenceLevel;
} {
  const relevantCases = CASE_STUDIES.filter((c) => c.sector === sector.id);
  if (relevantCases.length > 0) {
    const srois = relevantCases.map((c) => c.reportedSROI);
    return {
      min: Math.min(...srois) * 0.85, // give a small band
      max: Math.max(...srois) * 1.15,
      median: median(srois),
      caseStudyCount: relevantCases.length,
      evidenceLevel: 'CASE_STUDY',
    };
  }
  return {
    min: sector.sroiRange.min,
    max: sector.sroiRange.max,
    median: sector.sroiRange.median,
    caseStudyCount: 0,
    evidenceLevel: sector.sroiRange.evidence.level === 'VERIFIED'
      ? 'CASE_STUDY'
      : sector.sroiRange.evidence.level,
  };
}

function median(arr: number[]): number {
  const sorted = [...arr].sort((a, b) => a - b);
  const mid = Math.floor(sorted.length / 2);
  return sorted.length % 2 === 0 ? (sorted[mid - 1] + sorted[mid]) / 2 : sorted[mid];
}

/**
 * Compute SROI for a single sector.
 */
export function computeSROI(sector: Sector, allocation: number, directBeneficiaries: number): SROIResult {
  const range = getSectorSROI(sector);

  if (allocation <= 0 || directBeneficiaries <= 0) {
    return {
      sectorId: sector.id,
      allocation: 0,
      sroi: 0,
      sroiMin: 0,
      sroiMax: 0,
      totalSocialValue: 0,
      socialValueMin: 0,
      socialValueMax: 0,
      evidenceLevel: range.evidenceLevel,
      caseStudyCount: range.caseStudyCount,
    };
  }

  // Social value at median SROI
  const socialValue = allocation * range.median;
  const socialValueMin = allocation * range.min;
  const socialValueMax = allocation * range.max;

  return {
    sectorId: sector.id,
    allocation,
    sroi: range.median,
    sroiMin: range.min,
    sroiMax: range.max,
    totalSocialValue: socialValue,
    socialValueMin,
    socialValueMax,
    evidenceLevel: range.evidenceLevel,
    caseStudyCount: range.caseStudyCount,
  };
}

export function computeAllSROI(
  sectors: Sector[],
  allocations: Record<string, number>,
  directBeneficiariesBySector: Record<string, number>
): SROIResult[] {
  return sectors.map((s) => {
    return computeSROI(s, allocations[s.id] ?? 0, directBeneficiariesBySector[s.id] ?? 0);
  });
}

/**
 * Total SROI across portfolio.
 * We aggregate by social value / total investment.
 */
export function portfolioSROI(results: SROIResult[]): number {
  const totalSocialValue = results.reduce((s, r) => s + r.totalSocialValue, 0);
  const totalInvestment = results.reduce((s, r) => s + r.allocation, 0);
  if (totalInvestment === 0) return 0;
  return totalSocialValue / totalInvestment;
}
