/**
 * Stress Test Engine
 *
 * Applies a shock to the portfolio and computes before/after metrics.
 * Returns the same metrics as a normal run but with shock-adjusted
 * parameters.
 */

import type { Sector } from '../data/sectors';
import type { Shock } from '../data/shocks';
import { computeDirectImpact } from './impact';
import { getSectorSROI } from './sroi';
import { computeMultiplier } from './multiplier';

export interface StressTestResult {
  shock: Shock;
  before: {
    beneficiaries: number;
    socialValue: number;
    gdpImpact: number;
    employment: number;
  };
  after: {
    beneficiaries: number;
    socialValue: number;
    gdpImpact: number;
    employment: number;
  };
  deltas: {
    beneficiaries: number;
    socialValue: number;
    gdpImpact: number;
    employment: number;
  };
  /** % of original impact retained (0-1) */
  retentionRate: number;
}

export function applyShock(
  sector: Sector,
  allocation: number,
  shock: Shock
): { sector: Sector; adjustedAllocation: number; adjustedMultiplier: Sector['multiplier'] } {
  // Adjust budget
  const adjustedAllocation = allocation * shock.budgetMultiplier;

  // Adjust multiplier
  const adjustedMultiplier = {
    ...sector.multiplier,
    direct: sector.multiplier.direct * shock.multiplierMultiplier,
    indirect: sector.multiplier.indirect * shock.multiplierMultiplier,
    induced: sector.multiplier.induced * shock.multiplierMultiplier,
    // leakage can change with shock too — typically increases (more imports in crisis)
    leakage: Math.min(0.9, sector.multiplier.leakage * (1 + (1 - shock.multiplierMultiplier) * 0.5)),
    evidence: sector.multiplier.evidence,
  };

  // Effectiveness multiplier
  const eff = shock.sectorEffectivenessMultiplier[sector.id] ?? 1.0;

  // Create "shocked" sector for calculation
  const shockedSector: Sector = {
    ...sector,
    multiplier: adjustedMultiplier,
    costPerBeneficiary: {
      value: sector.costPerBeneficiary.value * (1 / eff), // cost per effective beneficiary rises
      evidence: sector.costPerBeneficiary.evidence,
    },
  };

  return {
    sector: shockedSector,
    adjustedAllocation: adjustedAllocation * eff,
    adjustedMultiplier,
  };
}

export function runStressTest(
  sectors: Sector[],
  allocations: Record<string, number>,
  shock: Shock
): StressTestResult {
  let beforeBeneficiaries = 0;
  let beforeSocialValue = 0;
  let beforeGdp = 0;
  let beforeEmployment = 0;

  let afterBeneficiaries = 0;
  let afterSocialValue = 0;
  let afterGdp = 0;
  let afterEmployment = 0;

  for (const sector of sectors) {
    const a = allocations[sector.id] ?? 0;
    if (a <= 0) continue;

    // Before
    const beforeD = computeDirectImpact(sector, a);
    const beforeSroi = getSectorSROI(sector);
    const beforeMult = computeMultiplier(sector, a);
    beforeBeneficiaries += beforeD.directBeneficiaries;
    beforeSocialValue += a * beforeSroi.median;
    beforeGdp += beforeMult.totalGdpImpact;
    beforeEmployment += (a / 1_000_000) * sector.jobsPerMSAR.value;

    // After shock
    const { sector: shockedSector, adjustedAllocation } = applyShock(sector, a, shock);
    const afterD = computeDirectImpact(shockedSector, adjustedAllocation);
    const afterSroi = getSectorSROI(shockedSector);
    const afterMult = computeMultiplier(shockedSector, adjustedAllocation);
    afterBeneficiaries += afterD.directBeneficiaries;
    afterSocialValue += adjustedAllocation * afterSroi.median;
    afterGdp += afterMult.totalGdpImpact;
    afterEmployment += (adjustedAllocation / 1_000_000) * shockedSector.jobsPerMSAR.value;
  }

  const retentionRate = beforeBeneficiaries > 0 ? afterBeneficiaries / beforeBeneficiaries : 0;

  return {
    shock,
    before: {
      beneficiaries: beforeBeneficiaries,
      socialValue: beforeSocialValue,
      gdpImpact: beforeGdp,
      employment: beforeEmployment,
    },
    after: {
      beneficiaries: afterBeneficiaries,
      socialValue: afterSocialValue,
      gdpImpact: afterGdp,
      employment: afterEmployment,
    },
    deltas: {
      beneficiaries: afterBeneficiaries - beforeBeneficiaries,
      socialValue: afterSocialValue - beforeSocialValue,
      gdpImpact: afterGdp - beforeGdp,
      employment: afterEmployment - beforeEmployment,
    },
    retentionRate,
  };
}
