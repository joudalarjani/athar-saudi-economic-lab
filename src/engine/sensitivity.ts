/**
 * Sensitivity Analysis (Tornado)
 *
 * For each parameter, vary it ±10% and measure the change in NPV (or
 * another key metric). Sort by magnitude to create a tornado chart.
 */

import type { Sector } from '../data/sectors';
import { computeDirectImpact } from './impact';
import { getSectorSROI } from './sroi';
import { computeMultiplier } from './multiplier';

export interface SensitivityBar {
  parameter: string;
  parameterAr: string;
  baseValue: number;
  lowValue: number; // -10% case
  highValue: number; // +10% case
  lowMetric: number;
  highMetric: number;
  range: number; // |high - low|
  direction: 'positive' | 'negative' | 'mixed';
}

export type Metric = 'beneficiaries' | 'socialValue' | 'gdpImpact' | 'npv';

export function computeBaseMetric(
  sectors: Sector[],
  allocations: Record<string, number>,
  metric: Metric,
  discountRate: number,
  horizon: number
): number {
  let total = 0;
  for (const sector of sectors) {
    const a = allocations[sector.id] ?? 0;
    if (a <= 0) continue;
    switch (metric) {
      case 'beneficiaries':
        total += computeDirectImpact(sector, a).directBeneficiaries;
        break;
      case 'socialValue':
        total += a * getSectorSROI(sector).median;
        break;
      case 'gdpImpact':
        total += computeMultiplier(sector, a).totalGdpImpact;
        break;
      case 'npv': {
        const sroi = getSectorSROI(sector).median;
        const mult = computeMultiplier(sector, a);
        // Simple NPV approximation
        const totalValue = a * sroi + mult.totalGdpImpact;
        const npv = totalValue / Math.pow(1 + discountRate, horizon / 2);
        total += npv;
        break;
      }
    }
  }
  return total;
}

export function runSensitivity(
  sectors: Sector[],
  allocations: Record<string, number>,
  metric: Metric,
  discountRate: number,
  horizon: number
): SensitivityBar[] {
  const baseValue = computeBaseMetric(sectors, allocations, metric, discountRate, horizon);

  // Define parameters to vary
  const parameters = [
    { id: 'sroi', ar: 'مضاعف SROI', sectorScoped: true, scalar: false },
    { id: 'multiplier', ar: 'المضاعف الاقتصادي', sectorScoped: true, scalar: false },
    { id: 'costPerBeneficiary', ar: 'تكلفة المستفيد', sectorScoped: true, scalar: false },
    { id: 'reachRate', ar: 'معدل الوصول', sectorScoped: true, scalar: false },
    { id: 'discountRate', ar: 'معدل الخصم', sectorScoped: false, scalar: true },
    { id: 'sustainability', ar: 'درجة الاستدامة', sectorScoped: true, scalar: false },
  ];

  const bars: SensitivityBar[] = [];

  for (const param of parameters) {
    let lowMetric = 0;
    let highMetric = 0;

    if (param.scalar) {
      // Global parameter
      const scale = (factor: number) => {
        switch (param.id) {
          case 'discountRate': {
            // For discount rate, +10% rate = LESS value (negative)
            const newRate = discountRate * (1 + factor * 0.1);
            return computeBaseMetric(sectors, allocations, metric, newRate, horizon);
          }
          default:
            return baseValue;
        }
      };
      lowMetric = scale(-1);
      highMetric = scale(1);
    } else {
      // Sector-scoped: apply ±10% to each sector's parameter
      let lowTotal = 0;
      let highTotal = 0;
      for (const sector of sectors) {
        const a = allocations[sector.id] ?? 0;
        if (a <= 0) continue;

        const sroi = getSectorSROI(sector);
        const mult = computeMultiplier(sector, a);

        // For "low" scenario: -10% on the parameter; for "high": +10%
        const lowImpact = computeParameterScen(
          sector,
          a,
          param.id,
          -0.1,
          metric,
          discountRate,
          horizon
        );
        const highImpact = computeParameterScen(
          sector,
          a,
          param.id,
          0.1,
          metric,
          discountRate,
          horizon
        );
        lowTotal += lowImpact;
        highTotal += highImpact;
      }
      lowMetric = lowTotal;
      highMetric = highTotal;
    }

    const range = Math.abs(highMetric - lowMetric);
    const direction =
      highMetric > lowMetric
        ? Math.abs(highMetric - baseValue) > Math.abs(lowMetric - baseValue)
          ? 'positive'
          : 'mixed'
        : 'negative';

    bars.push({
      parameter: param.id,
      parameterAr: param.ar,
      baseValue,
      lowValue: lowMetric,
      highValue: highMetric,
      lowMetric,
      highMetric,
      range,
      direction,
    });
  }

  // Sort by range descending (biggest impact first)
  bars.sort((a, b) => b.range - a.range);

  return bars;
}

function computeParameterScen(
  sector: Sector,
  allocation: number,
  paramId: string,
  factor: number,
  metric: Metric,
  discountRate: number,
  horizon: number
): number {
  switch (paramId) {
    case 'sroi': {
      const baseSroi = getSectorSROI(sector).median;
      const newSroi = baseSroi * (1 + factor);
      return allocation * newSroi;
    }
    case 'multiplier': {
      const mult = computeMultiplier(sector, allocation);
      return mult.totalGdpImpact * (1 + factor);
    }
    case 'costPerBeneficiary': {
      // For "cost per beneficiary": +10% cost → fewer beneficiaries
      // So for "low" (-10%) → more beneficiaries, "high" (+10%) → fewer
      const newCost = sector.costPerBeneficiary.value * (1 + factor);
      const newBeneficiaries = (allocation / newCost) * 0.7;
      return newBeneficiaries;
    }
    case 'reachRate': {
      const newReach = 0.7 * (1 + factor);
      const newBeneficiaries = (allocation / sector.costPerBeneficiary.value) * newReach;
      return newBeneficiaries;
    }
    case 'sustainability': {
      // Affects long-term impact, simplified
      return allocation * (1 + factor * 0.05);
    }
    default:
      return 0;
  }
}
