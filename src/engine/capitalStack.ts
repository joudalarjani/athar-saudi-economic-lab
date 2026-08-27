/**
 * Capital Stack Builder
 *
 * Computes the blended risk/sustainability/liquidity/dependency score
 * for a user's funding mix.
 */

import type { FundingInstrument } from '../data/fundingInstruments';

export interface CapitalStackResult {
  /** Total funding should equal 1.0; if not, normalization applied */
  totalMix: number;
  riskScore: number; // 0-1
  sustainabilityScore: number; // 0-1
  liquidityScore: number; // 0-1
  governmentDependency: number; // 0-1
  diversification: number; // 1 - HHI
  blendedViability: number; // 0-1: weighted score favoring sustainability - risk + liquidity
}

export function evaluateCapitalStack(
  instruments: FundingInstrument[],
  mix: Record<string, number>
): CapitalStackResult {
  const totalMix = Object.values(mix).reduce((s, v) => s + v, 0);
  if (totalMix === 0) {
    return {
      totalMix: 0,
      riskScore: 0,
      sustainabilityScore: 0,
      liquidityScore: 0,
      governmentDependency: 0,
      diversification: 0,
      blendedViability: 0,
    };
  }

  let riskSum = 0;
  let sustainabilitySum = 0;
  let liquiditySum = 0;
  let govDepSum = 0;

  for (const inst of instruments) {
    const share = (mix[inst.id] ?? 0) / totalMix;
    riskSum += share * inst.risk;
    sustainabilitySum += share * inst.sustainability;
    liquiditySum += share * inst.liquidity;
    govDepSum += share * inst.governmentDependency;
  }

  // HHI
  const shares = instruments.map((i) => (mix[i.id] ?? 0) / totalMix);
  const hhi = shares.reduce((s, sh) => s + sh * sh, 0);
  const diversification = 1 - hhi;

  // Blended viability: weighted sum favoring sustainability, penalizing risk and gov dependency
  const blendedViability =
    0.4 * sustainabilitySum + 0.25 * (1 - riskSum) + 0.2 * liquiditySum + 0.15 * (1 - govDepSum);

  return {
    totalMix,
    riskScore: riskSum,
    sustainabilityScore: sustainabilitySum,
    liquidityScore: liquiditySum,
    governmentDependency: govDepSum,
    diversification,
    blendedViability,
  };
}
