/**
 * ATHAR Impact Score Engine
 *
 * The central composite score demanded by the brief: a weighted 0-100 score
 * of portfolio performance across the five decision dimensions.
 *
 *   Economic Impact   × w1
 * + Social Impact     × w2
 * + Employment        × w3
 * + Risk (safety)     × w4
 * + Time to Impact    × w5
 * = ATHAR IMPACT SCORE
 *
 * Weights are surfaced in the UI and adjustable by the user (default
 * 30 / 30 / 20 / 10 / 10). Each dimension is computed as a share of the best
 * achievable single-strategy benchmark under the model's stated assumptions —
 * the same relative convention used across the rest of the engine — so every
 * dimension lands on a comparable 0-100 scale without inventing absolute
 * numbers.
 *
 * Academic-integrity note: this is a *relative, model-based* score, never a
 * forecast. It ranks allocations against one another under the current
 * assumptions and is labelled SIMULATION OUTPUT in the UI.
 */

import type { Sector } from '../data/sectors';
import { computePortfolioMetrics } from './portfolio';
import { getSectorSROI } from './sroi';
import { hhi } from './resilience';

export type AtharDimensionKey =
  | 'economic'
  | 'social'
  | 'employment'
  | 'risk'
  | 'time';

export interface AtharWeights {
  economic: number;
  social: number;
  employment: number;
  risk: number;
  time: number;
}

export const DEFAULT_ATHAR_WEIGHTS: AtharWeights = {
  economic: 0.3,
  social: 0.3,
  employment: 0.2,
  risk: 0.1,
  time: 0.1,
};

export interface AtharDimension {
  key: AtharDimensionKey;
  labelAr: string;
  labelEn: string;
  /** 0-100. For risk, higher = SAFER (good) — inverted for the composite. */
  score: number;
  weight: number;
  /** One-line model-derived explanation of why this dimension scored as it did. */
  whyAr: string;
  whyEn: string;
}

export interface AtharScoreResult {
  /** 0-100 composite. */
  overall: number;
  dimensions: AtharDimension[];
  /** The dimension contributing most (normalized by weight) to the score. */
  primaryDriver: AtharDimensionKey;
  /** Human-readable "Why this result?" narrative. */
  insightAr: string;
  insightEn: string;
  /** Sum of weights — should equal ~1 (0.99-1.01 tolerance allowed). */
  weightSum: number;
}

const clamp = (n: number, min = 0, max = 100) => Math.max(min, Math.min(max, n));

function pickMax(sectors: Sector[], fn: (s: Sector) => number): number {
  let best = -Infinity;
  for (const s of sectors) best = Math.max(best, fn(s));
  return best;
}

/**
 * Economic Impact — total GDP multiplier impact relative to "all budget in the
 * highest-multiplier sector". Higher economic multiplier ⇒ higher score.
 */
function calculateEconomicImpact(
  sectors: Sector[],
  totalGdpImpact: number,
  totalBudget: number
): { score: number; whyAr: string; whyEn: string } {
  if (totalBudget <= 0 || totalGdpImpact <= 0) {
    return { score: 0, whyAr: 'لا يوجد تخصيص اقتصادي لحساب الأثر.', whyEn: 'No allocation to measure economic impact.' };
  }
  // We weight the achieved per-riyal GDP impact against the best possible
  // sector's cash multiplier (direct × indirect × induced, net of leakage).
  const topMultiplier = pickMax(
    sectors,
    (s) => s.multiplier.direct * (1 + s.multiplier.indirect) * (1 + s.multiplier.induced) * (1 - s.multiplier.leakage)
  );
  const achievedMultiplier = totalGdpImpact / totalBudget;
  const score = clamp(topMultiplier > 0 ? (achievedMultiplier / topMultiplier) * 100 : 0);
  return {
    score,
    whyAr:
      score >= 80
        ? 'يتركّز التخصيص في قطاعات ذات مضاعفات اقتصادية عالية، فيرتفع الأثر السوقي لكل ريال.'
        : 'المضاعف الاقتصادي المتوسط للمحفظة دون ذروة القطاعات؛ يمكن رفع الأثر السوقي بإعادة التخصيص نحو قطاعات مضاعفة أعلى.',
    whyEn:
      score >= 80
        ? 'Portfolio concentrates in high-multiplier sectors, lifting market impact per riyal.'
        : 'Average portfolio multiplier trails sector peaks; reallocating toward higher-multiplier sectors would lift economic impact.',
  };
}

/**
 * Social Impact — total SROI social value relative to "all budget in the
 * highest-SROI sector".
 */
function calculateSocialImpact(
  sectors: Sector[],
  totalSocialValue: number,
  totalBudget: number
): { score: number; whyAr: string; whyEn: string } {
  if (totalBudget <= 0 || totalSocialValue <= 0) {
    return { score: 0, whyAr: 'لا يوجد تخصيص اجتماعي لحساب الأثر.', whyEn: 'No allocation to measure social impact.' };
  }
  const topSroi = pickMax(sectors, (s) => getSectorSROI(s).median);
  const achieved = topSroi > 0 ? (totalSocialValue / totalBudget / topSroi) * 100 : 0;
  const score = clamp(achieved);
  return {
    score,
    whyAr:
      score >= 80
        ? 'المحفظة تحقق قيمة اجتماعية عالية لكل ريال بفضل قطاعات ذات عائد SROI مرتفع.'
        : 'متوسط SROI للمحفظة دون أعلى عائد اجتماعي ممكن؛ التحويل نحو القطاعات الأعلى SROI يرفع البُعد الاجتماعي.',
    whyEn:
      score >= 40
        ? 'Portfolio returns high social value per riyal from high-SROI sectors.'
        : 'Portfolio SROI trails the best social return; shifting toward higher-SROI sectors raises this dimension.',
  };
}

/**
 * Employment — total jobs relative to "all budget in the highest-jobs sector".
 */
function calculateEmploymentImpact(
  sectors: Sector[],
  totalEmployment: number,
  totalBudget: number
): { score: number; whyAr: string; whyEn: string } {
  if (totalBudget <= 0 || totalEmployment <= 0) {
    return { score: 0, whyAr: 'لا يوجد تخصيص لقياس أثر التوظيف.', whyEn: 'No allocation to measure employment.' };
  }
  const topJobs = pickMax(sectors, (s) => s.jobsPerMSAR.value);
  const achieved = topJobs > 0 ? (totalEmployment / (totalBudget / 1_000_000) / topJobs) * 100 : 0;
  const score = clamp(achieved);
  return {
    score,
    whyAr:
      score >= 80
        ? 'التخصيص قوي في القطاعات كثيفة التوظيف، فينتج أثرًا وظيفيًا مرتفعًا لكل مليون ريال.'
        : 'كثافة التوظيف للمحفظة دون ذروتها؛ القطاعات الأكثر تشغيلًا للوظائف ترفع هذا البعد.',
    whyEn:
      score >= 40
        ? 'Allocation is strong in employment-intensive sectors, producing high jobs per million riyal.'
        : 'Portfolio employment intensity trails its peak; more job-intensive sectors would lift this dimension.',
  };
}

/**
 * Risk (safety) — higher = SAFER. Derived from resilience and concentration
 * (HHI), matching the resilience convention used elsewhere in the engine.
 */
function calculateRisk(sectors: Sector[], allocations: Record<string, number>, resilienceScore: number): number {
  const tot = Object.values(allocations).reduce((s, v) => s + v, 0);
  if (tot <= 0) return 0;
  const hhiValue = hhi(sectors.map((s) => allocations[s.id] ?? 0));
  const safety = 0.5 * resilienceScore + 0.5 * (1 - hhiValue);
  return clamp(safety * 100);
}

/**
 * Time to Impact — how quickly impact materializes. Higher score = faster.
 * Derived from the cumulative share of impact realized in the early years of
 * the portfolio's time profile.
 */
function calculateTimeToImpact(
  sectors: Sector[],
  allocations: Record<string, number>
): { score: number; whyAr: string; whyEn: string; yearsToHalf: number } {
  const tot = Object.values(allocations).reduce((s, v) => s + v, 0);
  if (tot <= 0) {
    return { score: 0, whyAr: 'لا يوجد تخصيص لقياس زمن الأثر.', whyEn: 'No allocation to measure time to impact.', yearsToHalf: 0 };
  }

  // Build a weighted average time profile from sector weight shares.
  // Each sector's time profile is its cumulative share (0..1) at y1, y3, y5, y10.
  const shares = sectors
    .filter((s) => (allocations[s.id] ?? 0) > 0)
    .map((s) => ({ weight: (allocations[s.id] ?? 0) / tot, profile: s.timeProfile }));

  if (shares.length === 0) {
    return { score: 0, whyAr: 'لا يوجد تخصيص لقياس زمن الأثر.', whyEn: 'No allocation to measure time to impact.', yearsToHalf: 0 };
  }

  // Cumulative portfolio share by year.
  const cum = (y: number) => shares.reduce((acc, x) => acc + x.weight * (profileShare(x.profile, y) as number), 0);

  // Find the year at which cumulative impact reaches its half-life (50%).
  let yearsToHalf = 10;
  for (let y = 1; y <= 10; y++) {
    if (cum(y) >= 0.5) {
      yearsToHalf = y - 1 + (0.5 - (y > 1 ? cum(y - 1) : 0)) / Math.max(cum(y) - (y > 1 ? cum(y - 1) : 0), 1e-9);
      break;
    }
  }
  yearsToHalf = Math.max(1, Math.min(10, yearsToHalf));

  // Score: faster realization (smaller years-to-half) ⇒ higher score.
  const score = clamp(100 * (1 - (yearsToHalf - 1) / 9));
  return {
    score,
    whyAr:
      yearsToHalf <= 3
        ? `معظم الأثر يتحقق خلال ~${yearsToHalf.toFixed(1)} سنوات — أثر مبكّر وسريع الظهور.`
        : `الأثر يتطلب ~${yearsToHalf.toFixed(1)} سنوات للنضج — بطيء نسبيًا كون الاستثمار بعيد المدى.`,
    whyEn:
      yearsToHalf <= 3
        ? `Most impact materializes within ~${yearsToHalf.toFixed(1)} years — a fast, front-loaded profile.`
        : `Impact takes ~${yearsToHalf.toFixed(1)} years to mature — a slower, long-horizon profile.`,
    yearsToHalf,
  };
}

/** Read a cumulative share value from a time profile at year y (linear-ish). */
function profileShare(p: { y1: number; y3: number; y5: number; y10: number }, y: number): number | undefined {
  if (y <= 1) return y <= 0 ? 0 : p.y1;
  if (y <= 3) return p.y1 + ((p.y3 - p.y1) * (y - 1)) / 2;
  if (y <= 5) return p.y3 + ((p.y5 - p.y3) * (y - 3)) / 2;
  return p.y5 + ((p.y10 - p.y5) * (y - 5)) / 5;
}

/**
 * Compute the full ATHAR Impact Score for a portfolio.
 * `weights` may be partial; missing keys fall back to defaults. Weights are
 * normalized so the display always sums to ~100% even if the caller passes a
 * non-normalized set.
 */
export function calculateAtharScore(
  sectors: Sector[],
  allocations: Record<string, number>,
  weights?: Partial<AtharWeights>,
  discountRate = 0.03,
  horizon = 10
): AtharScoreResult {
  const w: AtharWeights = {
    economic: weights?.economic ?? DEFAULT_ATHAR_WEIGHTS.economic,
    social: weights?.social ?? DEFAULT_ATHAR_WEIGHTS.social,
    employment: weights?.employment ?? DEFAULT_ATHAR_WEIGHTS.employment,
    risk: weights?.risk ?? DEFAULT_ATHAR_WEIGHTS.risk,
    time: weights?.time ?? DEFAULT_ATHAR_WEIGHTS.time,
  };
  // Normalize so the effective weight sum is 1.
  const rawSum = w.economic + w.social + w.employment + w.risk + w.time;
  const norm = rawSum > 0 ? rawSum : 1;
  const wn: AtharWeights = {
    economic: w.economic / norm,
    social: w.social / norm,
    employment: w.employment / norm,
    risk: w.risk / norm,
    time: w.time / norm,
  };

  const tot = Object.values(allocations).reduce((s, v) => s + v, 0);

  if (tot <= 0) {
    const zero: AtharDimension[] = [
      { key: 'economic', labelAr: 'الأثر الاقتصادي', labelEn: 'Economic Impact', score: 0, weight: wn.economic, whyAr: 'لا يوجد تخصيص.', whyEn: 'No allocation.' },
      { key: 'social', labelAr: 'الأثر الاجتماعي', labelEn: 'Social Impact', score: 0, weight: wn.social, whyAr: 'لا يوجد تخصيص.', whyEn: 'No allocation.' },
      { key: 'employment', labelAr: 'التوظيف', labelEn: 'Employment', score: 0, weight: wn.employment, whyAr: 'لا يوجد تخصيص.', whyEn: 'No allocation.' },
      { key: 'risk', labelAr: 'سلامة المخاطر', labelEn: 'Risk Safety', score: 0, weight: wn.risk, whyAr: 'لا يوجد تخصيص.', whyEn: 'No allocation.' },
      { key: 'time', labelAr: 'زمن الأثر', labelEn: 'Time to Impact', score: 0, weight: wn.time, whyAr: 'لا يوجد تخصيص.', whyEn: 'No allocation.' },
    ];
    return {
      overall: 0,
      dimensions: zero,
      primaryDriver: 'social',
      insightAr: 'أضف تخصيصًا لرأس المال لحساب سكور ATHAR.',
      insightEn: 'Allocate capital to compute the ATHAR impact score.',
      weightSum: wn.economic + wn.social + wn.employment + wn.risk + wn.time,
    };
  }

  const metrics = computePortfolioMetrics(sectors, allocations, discountRate, horizon);

  const econ = calculateEconomicImpact(sectors, metrics.totalGdpImpact, tot);
  const soc = calculateSocialImpact(sectors, metrics.totalSocialValue, tot);
  const emp = calculateEmploymentImpact(sectors, metrics.totalEmployment, tot);
  const riskScore = calculateRisk(sectors, allocations, metrics.resilienceScore);
  const time = calculateTimeToImpact(sectors, allocations);

  const dimensions: AtharDimension[] = [
    { key: 'economic', labelAr: 'الأثر الاقتصادي', labelEn: 'Economic Impact', score: Math.round(econ.score), weight: wn.economic, whyAr: econ.whyAr, whyEn: econ.whyEn },
    { key: 'social', labelAr: 'الأثر الاجتماعي', labelEn: 'Social Impact', score: Math.round(soc.score), weight: wn.social, whyAr: soc.whyAr, whyEn: soc.whyEn },
    { key: 'employment', labelAr: 'التوظيف', labelEn: 'Employment', score: Math.round(emp.score), weight: wn.employment, whyAr: emp.whyAr, whyEn: emp.whyEn },
    // Risk dimension reports SAFETY (higher = safer); the composite adds it as a benefit.
    { key: 'risk', labelAr: 'سلامة المخاطر', labelEn: 'Risk Safety', score: Math.round(riskScore), weight: wn.risk, whyAr: riskScore >= 70 ? 'المحفظة متنوعة ومرنة، فخفّضت تركّز المخاطر.' : 'تركّز عالٍ أو مرونة منخفضة يرفعان تعرّض المخاطر.', whyEn: riskScore >= 70 ? 'Portfolio is diversified and resilient, lowering risk concentration.' : 'High concentration or low resilience raises risk exposure.' },
    { key: 'time', labelAr: 'زمن الأثر', labelEn: 'Time to Impact', score: Math.round(time.score), weight: wn.time, whyAr: time.whyAr, whyEn: time.whyEn },
  ];

  // Composite: benefits + risk safety, weighted.
  const composite =
    wn.economic * econ.score +
    wn.social * soc.score +
    wn.employment * emp.score +
    wn.risk * riskScore +
    wn.time * time.score;
  const overall = clamp(Math.round(composite));

  // Primary driver = highest weighted contribution.
  const weighted: Array<[AtharDimensionKey, number]> = [
    ['economic', wn.economic * econ.score],
    ['social', wn.social * soc.score],
    ['employment', wn.employment * emp.score],
    ['risk', wn.risk * riskScore],
    ['time', wn.time * time.score],
  ];
  weighted.sort((a, b) => b[1] - a[1]);
  const primaryDriver = weighted[0][0];

  const driverLabel = dimensions.find((d) => d.key === primaryDriver)?.labelEn ?? 'Economic Impact';
  const insightEn = `The portfolio scores ${overall}/100. Its strongest engine is ${driverLabel}; overall performance is ${overall >= 80 ? 'strong under the stated assumptions' : overall >= 60 ? 'moderate' : 'weak'}.`;
  const insightAr = `تحصل المحفظة على ${overall}/100. أقوى محرّك هو "${dimensions.find((d) => d.key === primaryDriver)?.labelAr}". الأداء الكلي ${overall >= 80 ? 'قوي تحت الافتراضات المعلنة' : overall >= 60 ? 'متوسط' : 'ضعيف'}.`;

  return {
    overall,
    dimensions,
    primaryDriver,
    insightAr,
    insightEn,
    weightSum: wn.economic + wn.social + wn.employment + wn.risk + wn.time,
  };
}
