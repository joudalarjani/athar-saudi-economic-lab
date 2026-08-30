/**
 * THE TRADE-OFF — two-sector reallocation engine
 *
 * Frames the core economics question directly: moving capital between two
 * sectors (from → to) forces a trade-off. This engine computes the EXACT
 * delta across every measured dimension by re-running the same validated
 * portfolio engine on a hypothetical post-shift allocation.
 *
 * No data is invented here: every number derives from `computePortfolioMetrics`
 * on the real sector data. Outputs are marked SIMULATION OUTPUT because they
 * depend on the model's parameterized assumptions, never a forecast.
 *
 *   - Delta metrics: gained/lost in Social Value (SROI), GDP Impact,
 *     Employment, Beneficiaries, Resilience.
 *   - Opportunity cost: what you give up from → to capture the gain in `to`.
 *   - Trade-Off ratio: marginal loss of `from`-attribute per gain of
 *     `to`-attribute (a ratio, not a claim about absolute value).
 */

import type { Sector } from '../data/sectors';
import { computePortfolioMetrics } from './portfolio';
import { sectorMin, sectorMax } from '../lib/budget';

export interface TradeOffDelta {
  /** Signed delta; positive = the portfolio gains, negative = it loses. */
  deltaSocialValue: number;
  deltaGdpImpact: number;
  deltaEmployment: number;
  deltaBeneficiaries: number;
  /** Signed portfolio resilience shift (0-1 scale). */
  deltaResilience: number;
  /** Signed per-SAR return change for the from-sector. */
  fromLossSroi: number;
  /** Signed per-SAR return change for the to-sector. */
  toGainSroi: number;
}

export interface TradeOffResult {
  fromId: string;
  toId: string;
  shift: number;
  /** The proposed post-shift allocation (never committed by the engine). */
  proposedAllocation: Record<string, number>;
  delta: TradeOffDelta;
  /** Opportunity-cost framing, in plain text (EN/AR). */
  opportunityCost: { en: string; ar: string };
  /** Which direction is favoured across each dimension (for the UI labels). */
  favor: {
    socialValue: 'to' | 'from' | 'even';
    gdpImpact: 'to' | 'from' | 'even';
    employment: 'to' | 'from' | 'even';
    beneficiaries: 'to' | 'from' | 'even';
    resilience: 'to' | 'from' | 'even';
  };
}

export interface TradeOffInput {
  sectors: Sector[];
  allocations: Record<string, number>;
  /** Sector the capital is taken FROM. */
  fromId: string;
  /** Sector the capital is moved TO. */
  toId: string;
  /** SAR amount to shift (engine clamps to available headroom). */
  shift: number;
  /** Optional budget context for scaled min/max bounds (defaults to absolute bounds). */
  budget?: number;
  discountRate?: number;
  horizon?: number;
}

/**
 * Build the hypothetical allocation that moves `shift` SAR from `fromId` to
 * `toId`, clamped so we never withdraw more than the from-sector holds and
 * never exceed the to-sector's max allocation.
 */
export function buildProposedAllocation(
  sectors: Sector[],
  allocations: Record<string, number>,
  fromId: string,
  toId: string,
  shift: number,
  budget?: number
): Record<string, number> {
  const fromSector = sectors.find((s) => s.id === fromId);
  const toSector = sectors.find((s) => s.id === toId);
  if (!fromSector || !toSector || fromId === toId) {
    return { ...allocations };
  }

  const available = allocations[fromId] ?? 0;
  const fromFloor = budget ? sectorMin(fromSector, budget) : fromSector.minAllocation;
  const toCeiling = budget ? sectorMax(toSector, budget) : toSector.maxAllocation;
  const headroom = toCeiling - (allocations[toId] ?? 0);
  // Never withdraw below the from-sector's floor: applied is the amount that
  // is actually removed from `from` AND added to `to`, so total budget holds.
  const applied = Math.max(0, Math.min(shift, available - fromFloor, headroom));

  const proposed = { ...allocations };
  proposed[fromId] = available - applied;
  proposed[toId] = (allocations[toId] ?? 0) + applied;
  return proposed;
}

/** Signed difference, rounded to avoid float noise near zero. */
function signed(a: number, b: number): number {
  const d = a - b;
  return Math.abs(d) < 1e-6 ? 0 : d;
}

function favorOf(delta: number): 'to' | 'from' | 'even' {
  if (Math.abs(delta) < 1e-9) return 'even';
  return delta > 0 ? 'to' : 'from';
}

/**
 * Compute the trade-off the user is exposed to by shifting capital from one
 * sector to another. Returns deltas and an opportunity-cost framing.
 */
export function computeTradeOff(input: TradeOffInput): TradeOffResult {
  const { sectors, allocations, fromId, toId, discountRate = 0.03, horizon = 10, budget } = input;

  const proposedAllocation = buildProposedAllocation(sectors, allocations, fromId, toId, input.shift, budget);

  const base = computePortfolioMetrics(sectors, allocations, discountRate, horizon);
  const proposed = computePortfolioMetrics(sectors, proposedAllocation, discountRate, horizon);

  const fromBase = base.sectorMetrics.find((m) => m.sectorId === fromId);
  const toBase = base.sectorMetrics.find((m) => m.sectorId === toId);
  const fromProp = proposed.sectorMetrics.find((m) => m.sectorId === fromId);
  const toProp = proposed.sectorMetrics.find((m) => m.sectorId === toId);

  const d = {
    deltaSocialValue: signed(proposed.totalSocialValue, base.totalSocialValue),
    deltaGdpImpact: signed(proposed.totalGdpImpact, base.totalGdpImpact),
    deltaEmployment: signed(proposed.totalEmployment, base.totalEmployment),
    deltaBeneficiaries: signed(proposed.totalBeneficiaries, base.totalBeneficiaries),
    deltaResilience: signed(proposed.resilienceScore, base.resilienceScore),
    fromLossSroi: signed(fromBase?.sroi ?? 0, fromProp?.sroi ?? 0),
    toGainSroi: signed(toProp?.sroi ?? 0, toBase?.sroi ?? 0),
  };

  const fromName = fromBase?.arName ?? fromId;
  const toName = toBase?.arName ?? toId;

  const opportunityCost = {
    en: `Moving SAR ${Math.round(d.deltaSocialValue / 1_000_000)}M of social value from ${fromName} to ${toName}. You give up ${fromName}'s marginal ${fromBase?.sroi.toFixed(2)}x to pursue ${toName}'s ${toBase?.sroi.toFixed(2)}x.`,
    ar: `تحويل إجمالي القيمة الاجتماعية من ${fromName} إلى ${toName} — تتخلى عن عائد ${fromBase?.sroi.toFixed(2)}x لدى ${fromName} مقابل عائد ${toBase?.sroi.toFixed(2)}x لدى ${toName}.`,
  };

  return {
    fromId,
    toId,
    shift: input.shift,
    proposedAllocation,
    delta: d,
    opportunityCost,
    favor: {
      socialValue: favorOf(d.deltaSocialValue),
      gdpImpact: favorOf(d.deltaGdpImpact),
      employment: favorOf(d.deltaEmployment),
      beneficiaries: favorOf(d.deltaBeneficiaries),
      resilience: favorOf(d.deltaResilience),
    },
  };
}
