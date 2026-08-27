/**
 * Time Discounting + NPV + Time Profile Integration
 *
 * Each sector has a time profile (when does impact peak?).
 * We compute year-by-year impact, then NPV.
 *
 *   NPV = Σ_t  Impact_t / (1 + r)^t
 *
 * Where r is the discount rate (default 3% per HM Treasury Green Book).
 *
 * This module:
 * 1. Projects sector impact across years 1, 3, 5, 10 using time profile
 * 2. Interpolates between profile points (linear)
 * 3. Computes NPV
 * 4. Computes year-by-year beneficiary counts
 */

import type { Sector } from '../data/sectors';
import { computeDirectImpact } from './impact';

export interface YearProjection {
  year: number;
  totalBeneficiaries: number;
  totalSocialValue: number;
  totalGdpImpact: number;
  totalEmployment: number;
  discountFactor: number;
  discountedValue: number;
}

export interface TimeProfileResult {
  /** Year 0 to Year 10 inclusive */
  years: YearProjection[];
  /** Net present value of social + economic value */
  npvSocial: number;
  npvGdp: number;
  npvTotal: number;
  discountRate: number;
  horizon: number;
}

const PROFILE_YEARS = [1, 3, 5, 10] as const;

/**
 * Linear interpolation between profile years.
 * Returns the share of total impact realized at the given year.
 */
function getProfileShare(sector: Sector, year: number): number {
  const profile = sector.timeProfile;
  if (year <= 0) return 0;
  if (year >= 10) return profile.y10;

  // Find the bracketing points
  for (let i = 0; i < PROFILE_YEARS.length - 1; i++) {
    const y1 = PROFILE_YEARS[i];
    const y2 = PROFILE_YEARS[i + 1];
    if (year >= y1 && year <= y2) {
      const v1 = (profile as any)[`y${y1}`];
      const v2 = (profile as any)[`y${y2}`];
      const t = (year - y1) / (y2 - y1);
      return v1 + t * (v2 - v1);
    }
  }
  return profile.y10;
}

/**
 * Project sector impact across horizon, given total allocation.
 */
export function projectSectorOverTime(
  sector: Sector,
  allocation: number,
  totalSocialValue: number,
  totalGdpImpact: number,
  totalEmployment: number,
  discountRate: number,
  horizon: number
): YearProjection[] {
  const years: YearProjection[] = [];

  for (let y = 0; y <= horizon; y++) {
    const share = getProfileShare(sector, y);
    const beneficiaries = computeDirectImpact(sector, allocation).directBeneficiaries * share;
    const social = totalSocialValue * share;
    const gdp = totalGdpImpact * share;
    const emp = totalEmployment * share;
    const discountFactor = y === 0 ? 1 : 1 / Math.pow(1 + discountRate, y);
    const discounted = (social + gdp) * discountFactor;

    years.push({
      year: y,
      totalBeneficiaries: Math.round(beneficiaries),
      totalSocialValue: social,
      totalGdpImpact: gdp,
      totalEmployment: emp,
      discountFactor,
      discountedValue: discounted,
    });
  }

  return years;
}

export function portfolioTimeProfile(
  sectors: Sector[],
  allocations: Record<string, number>,
  socialValues: Record<string, number>,
  gdpImpacts: Record<string, number>,
  employments: Record<string, number>,
  discountRate: number,
  horizon: number
): TimeProfileResult {
  const aggregatedYears: Record<number, YearProjection> = {};

  // Initialize year 0
  aggregatedYears[0] = {
    year: 0,
    totalBeneficiaries: 0,
    totalSocialValue: 0,
    totalGdpImpact: 0,
    totalEmployment: 0,
    discountFactor: 1,
    discountedValue: 0,
  };

  for (const sector of sectors) {
    const a = allocations[sector.id] ?? 0;
    if (a <= 0) continue;
    const sv = socialValues[sector.id] ?? 0;
    const gdp = gdpImpacts[sector.id] ?? 0;
    const emp = employments[sector.id] ?? 0;
    const proj = projectSectorOverTime(sector, a, sv, gdp, emp, discountRate, horizon);
    for (const y of proj) {
      const existing = aggregatedYears[y.year] ?? {
        year: y.year,
        totalBeneficiaries: 0,
        totalSocialValue: 0,
        totalGdpImpact: 0,
        totalEmployment: 0,
        discountFactor: y.discountFactor,
        discountedValue: 0,
      };
      aggregatedYears[y.year] = {
        year: y.year,
        totalBeneficiaries: existing.totalBeneficiaries + y.totalBeneficiaries,
        totalSocialValue: existing.totalSocialValue + y.totalSocialValue,
        totalGdpImpact: existing.totalGdpImpact + y.totalGdpImpact,
        totalEmployment: existing.totalEmployment + y.totalEmployment,
        discountFactor: y.discountFactor,
        discountedValue: existing.discountedValue + y.discountedValue,
      };
    }
  }

  const years: YearProjection[] = [];
  for (let y = 0; y <= horizon; y++) {
    years.push(aggregatedYears[y]);
  }

  const npvSocial = years.reduce((s, y) => s + y.totalSocialValue * y.discountFactor, 0);
  const npvGdp = years.reduce((s, y) => s + y.totalGdpImpact * y.discountFactor, 0);
  const npvTotal = npvSocial + npvGdp;

  return { years, npvSocial, npvGdp, npvTotal, discountRate, horizon };
}
