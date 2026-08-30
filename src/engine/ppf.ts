/**
 * Production Possibility Frontier (PPF) Engine
 *
 * Computes the Pareto frontier of social investment portfolios,
 * trading off SROI (Social Value) against Economic Multiplier Impact.
 *
 *   - X: Total Social Value (SROI × allocation per sector)
 *   - Y: Total Economic Multiplier Impact (direct + indirect + induced - leakage)
 *
 * Each random portfolio is a point in 2D space. The frontier is the
 * upper envelope — you cannot increase Y without giving up some X,
 * and vice versa.
 *
 * IMPORTANT: PPF is a *trade-off visualization*, not a forecast.
 * The shape depends on:
 *   - Sector SROI ranges (real data from case studies)
 *   - Sector multiplier estimates (SIMULATION_ASSUMPTION)
 *   - Sector diminishing returns (parameterized)
 *   - The Monte Carlo sample size
 */

import type { Sector } from '../data/sectors';
import { computeDirectImpact } from './impact';
import { getSectorSROI } from './sroi';
import { computeMultiplier } from './multiplier';

export interface PPFPoint {
  id: string;
  allocation: Record<string, number>;
  /** Total social value (SAR) — X axis */
  socialValue: number;
  /** Total GDP impact (SAR) — Y axis */
  economicImpact: number;
  /** Direct beneficiaries (for tooltip) */
  beneficiaries: number;
  isUser?: boolean;
  isOptimal?: boolean;
}

/**
 * Compute the social value and economic impact for a given allocation.
 */
function evaluatePortfolio(
  sectors: Sector[],
  allocation: Record<string, number>
): { socialValue: number; economicImpact: number; beneficiaries: number } {
  let socialValue = 0;
  let economicImpact = 0;
  let beneficiaries = 0;

  for (const sector of sectors) {
    const a = allocation[sector.id] ?? 0;
    if (a <= 0) continue;

    const sroi = getSectorSROI(sector);
    socialValue += a * sroi.median;

    const mult = computeMultiplier(sector, a);
    economicImpact += mult.totalGdpImpact;

    const direct = computeDirectImpact(sector, a);
    beneficiaries += direct.directBeneficiaries;
  }

  return { socialValue, economicImpact, beneficiaries };
}

/**
 * Generate N random portfolios using Dirichlet-like sampling.
 * We use a power-biased random to spread points across the simplex.
 */
export function generateRandomPortfolios(
  sectors: Sector[],
  totalBudget: number,
  numPortfolios: number,
  seed: number = 1
): PPFPoint[] {
  // Simple seeded PRNG (mulberry32) for reproducibility
  let state = seed;
  const rand = () => {
    state |= 0;
    state = (state + 0x6D2B79F5) | 0;
    let t = state;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };

  const points: PPFPoint[] = [];

  for (let i = 0; i < numPortfolios; i++) {
    // Random weights with concentration parameter
    // Lower alpha = more uniform; higher alpha = more concentrated
    const alpha = 0.5 + rand() * 1.5; // 0.5 to 2.0
    const rawWeights = sectors.map(() => {
      // Gamma distribution approximation via sum of exponentials
      let g = 0;
      for (let k = 0; k < Math.max(1, Math.floor(alpha)); k++) {
        g -= Math.log(rand() || 1e-9);
      }
      return g;
    });

    const totalWeight = rawWeights.reduce((s, w) => s + w, 0);
    const allocation: Record<string, number> = {};
    sectors.forEach((s, idx) => {
      allocation[s.id] = (rawWeights[idx] / totalWeight) * totalBudget;
    });

    const evalResult = evaluatePortfolio(sectors, allocation);

    points.push({
      id: `random-${i}`,
      allocation,
      socialValue: evalResult.socialValue,
      economicImpact: evalResult.economicImpact,
      beneficiaries: evalResult.beneficiaries,
    });
  }

  return points;
}

/**
 * Find the Pareto frontier (upper envelope) of a set of points.
 * Returns points that are not dominated by any other point.
 *
 * A point (x, y) dominates (x', y') if x >= x' AND y >= y' (with at least one strict).
 * The frontier maximizes Y for each X.
 */
export function findParetoFrontier(points: PPFPoint[]): PPFPoint[] {
  // Sort by X (social value) ascending
  const sorted = [...points].sort((a, b) => a.socialValue - b.socialValue);

  const frontier: PPFPoint[] = [];
  let maxY = -Infinity;

  for (const p of sorted) {
    if (p.economicImpact > maxY) {
      frontier.push(p);
      maxY = p.economicImpact;
    }
  }

  return frontier;
}

export interface KneeInfo {
  point: PPFPoint;
  /** Max perpendicular distance from the extremes diagonal (the "elbow" signal). */
  distance: number;
  /** How far along the frontier (0 = pure social, 1 = pure economic) the knee sits. */
  position: number;
  /** Opportunity cost ratio at the knee: economic impact given up per 1 SAR of social value. */
  opportunityCostRatio: number;
}

/**
 * Find the "knee" of the frontier — the point with maximum
 * distance from the diagonal between extremes.
 * This is a common heuristic for the "best balanced" allocation
 * (the elbow where pushing further in either dimension yields rapidly
 * diminishing gains for the other).
 */
export function findKnee(frontier: PPFPoint[]): KneeInfo {
  if (frontier.length === 0) {
    throw new Error('Empty frontier');
  }
  if (frontier.length === 1) {
    return { point: frontier[0], distance: 0, position: 0, opportunityCostRatio: 0 };
  }
  if (frontier.length === 2) {
    return { point: frontier[0], distance: 0, position: 0, opportunityCostRatio: 0 };
  }

  const first = frontier[0];
  const last = frontier[frontier.length - 1];

  // Line from first to last
  const dx = last.socialValue - first.socialValue;
  const dy = last.economicImpact - first.economicImpact;
  const lineLen = Math.sqrt(dx * dx + dy * dy) || 1;

  let maxDist = 0;
  let knee = first;
  let kIdx = 0;

  for (let i = 0; i < frontier.length; i++) {
    const p = frontier[i];
    // Perpendicular distance from p to the line
    const cross = Math.abs(
      dx * (first.economicImpact - p.economicImpact) -
        dy * (first.socialValue - p.socialValue)
    );
    const dist = cross / lineLen;
    if (dist > maxDist) {
      maxDist = dist;
      knee = p;
      kIdx = i;
    }
  }

  // Position along the frontier in [0,1].
  const spanX = Math.max(last.socialValue - first.socialValue, 1e-9);
  const position = (knee.socialValue - first.socialValue) / spanX;

  // Local opportunity cost ratio: compare the point after the knee to the knee.
  // economicImpact given up per SAR of social value gained as we leave the elbow.
  let opportunityCostRatio = 0;
  const next = frontier[kIdx + 1];
  if (next && next.socialValue > knee.socialValue) {
    const sGain = next.socialValue - knee.socialValue;
    const eLoss = knee.economicImpact - next.economicImpact;
    if (sGain > 0) opportunityCostRatio = Math.max(0, eLoss / sGain);
  }

  return { point: knee, distance: maxDist, position, opportunityCostRatio };
}

/**
 * Compute opportunity cost between two PPF points.
 * Returns: "Moving from A to B gains X social value but loses Y economic impact"
 */
export function computeOpportunityCost(
  from: PPFPoint,
  to: PPFPoint
): { sroiGain: number; multLoss: number; ratio: number } {
  const sroiGain = to.socialValue - from.socialValue;
  const multLoss = from.economicImpact - to.economicImpact;
  const ratio = sroiGain > 0 ? multLoss / sroiGain : 0;
  return { sroiGain, multLoss, ratio };
}

/**
 * Build the full PPF dataset: random portfolios + frontier + user point + knee.
 */
export function buildPPFDataset(
  sectors: Sector[],
  totalBudget: number,
  userAllocation: Record<string, number>,
  numPortfolios: number = 250,
  seed: number = 42
): {
  allPoints: PPFPoint[];
  frontier: PPFPoint[];
  userPoint: PPFPoint;
  knee: KneeInfo;
  maxX: number;
  maxY: number;
  minX: number;
  minY: number;
} {
  const random = generateRandomPortfolios(sectors, totalBudget, numPortfolios, seed);
  const userEval = evaluatePortfolio(sectors, userAllocation);

  const userPoint: PPFPoint = {
    id: 'user',
    allocation: { ...userAllocation },
    socialValue: userEval.socialValue,
    economicImpact: userEval.economicImpact,
    beneficiaries: userEval.beneficiaries,
    isUser: true,
  };

  // Combine random + user + knee to find the full frontier
  const allForAnalysis = [...random, userPoint];
  const frontier = findParetoFrontier(allForAnalysis);

  // Find knee
  const knee = findKnee(frontier);
  knee.point.isOptimal = true;

  // Compute axis bounds (with some padding)
  const allX = allForAnalysis.map((p) => p.socialValue);
  const allY = allForAnalysis.map((p) => p.economicImpact);
  const maxX = Math.max(...allX);
  const maxY = Math.max(...allY);
  const minX = Math.min(...allX);
  const minY = Math.min(...allY);

  // Add padding
  const xRange = maxX - minX || 1;
  const yRange = maxY - minY || 1;

  return {
    allPoints: random,
    frontier,
    userPoint,
    knee,
    maxX: maxX + xRange * 0.05,
    maxY: maxY + yRange * 0.05,
    minX: Math.max(0, minX - xRange * 0.05),
    minY: Math.max(0, minY - yRange * 0.05),
  };
}
