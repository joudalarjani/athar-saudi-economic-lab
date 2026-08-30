/**
 * Monte-Carlo Simulation Engine
 *
 * Re-runs the same deterministic model N times with randomized parameters to
 * expose the RANGE of plausible outcomes — not a point estimate. This is how
 * we answer "what could happen", replacing a false sense of precision with an
 * honest distribution.
 *
 * Uncertainty is drawn ONLY from existing model data:
 *   - SROI is sampled uniformly within the sector's REAL case-study range
 *     (`sroiRange.min`–`sroiRange.max`).
 *   - The Keynesian multiplier cascade is perturbed with multiplicative
 *     Normal noise (σ = 10%) around the sector's stated (SIMULATION_ASSUMPTION)
 *     multiplier.
 *   - Cost per beneficiary is perturbed with multiplicative Normal noise
 *     (σ = 8%) around its estimate.
 *
 * Outputs: a full trial distribution + P5/P50/P95 percentiles, mean, std,
 * downside probability (P(result < deterministic baseline)), worst/best case.
 * Every figure is labeled SIMULATION OUTPUT in the UI — never a forecast.
 */

import type { Sector } from '../data/sectors';
import { computeDirectImpact } from './impact';
import { computeMultiplier } from './multiplier';

export type MonteCarloMetric = 'socialValue' | 'gdpImpact' | 'beneficiaries' | 'npv';

export interface MonteCarloTrial {
  id: number;
  socialValue: number;
  gdpImpact: number;
  beneficiaries: number;
  npvTotal: number;
}

export interface MonteCarloResult {
  trials: MonteCarloTrial[];
  deterministicBase: Record<MonteCarloMetric, number>;
  mean: Record<MonteCarloMetric, number>;
  std: Record<MonteCarloMetric, number>;
  percentiles: Record<MonteCarloMetric, { p5: number; p50: number; p95: number }>;
  /** P(result below the deterministic baseline) — the "downside" risk. */
  downsideProbability: Record<MonteCarloMetric, number>;
  /** Tail reading of the trial distribution. */
  worst: Record<MonteCarloMetric, number>;
  best: Record<MonteCarloMetric, number>;
  /** CV = std / mean (>0.25 read as "high dispersion"). */
  cv: Record<MonteCarloMetric, number>;
  numTrials: number;
  seed: number;
}

/** Deterministic evaluation once, using published median/point values. */
export function evaluateDeterministic(
  sectors: Sector[],
  allocations: Record<string, number>,
  discountRate: number,
  horizon: number
): Record<MonteCarloMetric, number> {
  let socialValue = 0;
  let gdpImpact = 0;
  let beneficiaries = 0;
  let npvTotal = 0;

  for (const sector of sectors) {
    const a = allocations[sector.id] ?? 0;
    if (a <= 0) continue;

    const sroi = sector.sroiRange.median;
    socialValue += a * sroi;

    const gdp = computeMultiplier(sector, a).totalGdpImpact;
    gdpImpact += gdp;

    beneficiaries += computeDirectImpact(sector, a).directBeneficiaries;

    npvTotal += (a * sroi + gdp) / Math.pow(1 + discountRate, horizon / 2);
  }

  return { socialValue, gdpImpact, beneficiaries, npvTotal };
}

/** Seeded mulberry32 PRNG — same convention as the PPF engine. */
export function createPrng(seed: number): () => number {
  let state = seed | 0;
  return () => {
    state = (state + 0x6d2b79f5) | 0;
    let t = state;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/** Box–Muller normal via one internal uniform source. */
function normal(rand: () => number): number {
  let u = 0;
  let v = 0;
  while (u === 0) u = rand();
  while (v === 0) v = rand();
  return Math.sqrt(-2.0 * Math.log(u)) * Math.cos(2.0 * Math.PI * v);
}

const SROI_NOISE = 0.1; // ±σ for the multiplier cascade
const COST_NOISE = 0.08; // ±σ for cost per beneficiary

function pct(sorted: number[], q: number): number {
  if (sorted.length === 0) return 0;
  const pos = (sorted.length - 1) * q;
  const lo = Math.floor(pos);
  const hi = Math.ceil(pos);
  if (lo === hi) return sorted[lo];
  const frac = pos - lo;
  return sorted[lo] * (1 - frac) + sorted[hi] * frac;
}

function summarize(values: number[]): { mean: number; std: number } {
  const n = values.length;
  if (n === 0) return { mean: 0, std: 0 };
  const mean = values.reduce((s, v) => s + v, 0) / n;
  const variance = values.reduce((s, v) => s + (v - mean) * (v - mean), 0) / n;
  return { mean, std: Math.sqrt(variance) };
}

export function runMonteCarlo(
  sectors: Sector[],
  allocations: Record<string, number>,
  numTrials: number = 2000,
  seed: number = 42,
  discountRate: number = 0.03,
  horizon: number = 10
): MonteCarloResult {
  const rand = createPrng(seed);
  const trials: MonteCarloTrial[] = [];

  const base = evaluateDeterministic(sectors, allocations, discountRate, horizon);

  for (let i = 0; i < numTrials; i++) {
    let socialValue = 0;
    let gdpImpact = 0;
    let beneficiaries = 0;
    let npvTotal = 0;

    for (const sector of sectors) {
      const a = allocations[sector.id] ?? 0;
      if (a <= 0) continue;

      // SROI: uniform within the real case-study range.
      const lo = sector.sroiRange.min;
      const hi = sector.sroiRange.max;
      const span = Math.max(hi - lo, 1e-9);
      const sroiSample = lo + rand() * span;

      // Multiplier cascade: multiplicative normal noise.
      const m = sector.multiplier;
      const dirNoise = 1 + normal(rand) * SROI_NOISE;
      const indNoise = 1 + normal(rand) * SROI_NOISE;
      const indcNoise = 1 + normal(rand) * SROI_NOISE;
      const direct = Math.max(0, m.direct * dirNoise);
      const indirect = Math.max(0, m.indirect * indNoise);
      const induced = Math.max(0, m.induced * indcNoise);
      // Leakage may rise when the picture turns adverse (more imports in stress).
      const leakage = Math.min(0.9, m.leakage * (1 + Math.max(0, -normal(rand)) * 0.5));
      const gross = direct + direct * indirect + (direct + direct * indirect) * induced;
      const gdp = gross * (1 - leakage);

      // Cost per beneficiary noise → beneficiaries, with the SAME diminishing-
      // returns saturation used by the deterministic impact model.
      const cost = Math.max(1, sector.costPerBeneficiary.value * (1 + normal(rand) * COST_NOISE));
      const saturation = 1 - Math.exp(-sector.diminishingLambda.value * a);
      const currentBeneficiaries = (a / cost) * 0.7 * saturation;

      socialValue += a * sroiSample;
      gdpImpact += gdp;
      beneficiaries += currentBeneficiaries;
      npvTotal += (a * sroiSample + gdp) / Math.pow(1 + discountRate, horizon / 2);
    }

    trials.push({ id: i, socialValue, gdpImpact, beneficiaries, npvTotal });
  }

  const series: Record<MonteCarloMetric, number[]> = {
    socialValue: trials.map((t) => t.socialValue),
    gdpImpact: trials.map((t) => t.gdpImpact),
    beneficiaries: trials.map((t) => t.beneficiaries),
    npv: trials.map((t) => t.npvTotal),
  };

  const mean: Record<MonteCarloMetric, number> = {} as Record<MonteCarloMetric, number>;
  const std: Record<MonteCarloMetric, number> = {} as Record<MonteCarloMetric, number>;
  const percentiles = {} as MonteCarloResult['percentiles'];
  const downsideProbability = {} as Record<MonteCarloMetric, number>;
  const worst = {} as Record<MonteCarloMetric, number>;
  const best = {} as Record<MonteCarloMetric, number>;
  const cv = {} as Record<MonteCarloMetric, number>;

  (Object.keys(series) as MonteCarloMetric[]).forEach((metric) => {
    const values = series[metric];
    const sorted = [...values].sort((x, y) => x - y);
    const { mean: m, std: s } = summarize(values);
    mean[metric] = m;
    std[metric] = s;
    percentiles[metric] = { p5: pct(sorted, 0.05), p50: pct(sorted, 0.5), p95: pct(sorted, 0.95) };
    worst[metric] = sorted[0];
    best[metric] = sorted[sorted.length - 1];
    downsideProbability[metric] =
      sorted.length === 0 ? 0 : values.filter((v) => v < base[metric]).length / values.length;
    cv[metric] = m === 0 ? 0 : s / m;
  });

  return {
    trials,
    deterministicBase: base,
    mean,
    std,
    percentiles,
    downsideProbability,
    worst,
    best,
    cv,
    numTrials,
    seed,
  };
}