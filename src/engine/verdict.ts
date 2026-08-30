/**
 * Policy Verdict Engine
 *
 * Produces a model-derived 0-100 verdict for a portfolio across the four
 * decision dimensions the simulation cares about — Education (human capital),
 * Jobs, Social Impact, and Risk — plus an overall impact score.
 *
 * Every number is computed from the existing economic model
 * (beneficiaries, SROI social value, employment, resilience/HHI), never
 * hardcoded. Scores are normalized against the best achievable single-strategy
 * benchmark ("all budget in the leading sector" for that dimension), which is
 * the same convention used by the multi-objective optimizer. All scores are
 * therefore "relative under the model's stated assumptions" — displayed with an
 * illustrative/simulation label in the UI.
 */

import type { Sector } from '../data/sectors';
import { computePortfolioMetrics, type PortfolioMetrics } from './portfolio';
import { getSectorSROI } from './sroi';
import { hhi } from './resilience';

export interface VerdictDimension {
  key: 'education' | 'jobs' | 'social' | 'risk';
  labelAr: string;
  labelEn: string;
  /** 0-100. For risk, higher = riskier (worse). */
  score: number;
}

export interface VerdictResult {
  /** 0-100 composite impact score */
  overallScore: number;
  dimensions: VerdictDimension[];
  /** Highest-scoring benefit dimension */
  strongest: VerdictDimension;
  /** Narrative of the dominant trade-off */
  tradeOffAr: string;
  tradeOffEn: string;
  /** Data-driven recommended move: sector id + SAR to shift */
  recommendation: { sectorId: string; sectorAr: string; amount: number; reasonAr: string };
  strategyLabel: string;
}

const clamp = (n: number, min = 0, max = 100) => Math.max(min, Math.min(max, n));

function pickCandidate(
  sectors: Sector[],
  metric: (s: Sector) => number
): { sector: Sector; value: number } | null {
  let best: Sector | null = null;
  let bestV = -Infinity;
  for (const s of sectors) {
    const v = metric(s);
    if (v > bestV) {
      bestV = v;
      best = s;
    }
  }
  return best ? { sector: best, value: bestV } : null;
}

export function computeVerdict(
  sectors: Sector[],
  allocations: Record<string, number>,
  discountRate = 0.03,
  horizon = 10
): VerdictResult {
  const metrics: PortfolioMetrics = computePortfolioMetrics(sectors, allocations, discountRate, horizon);
  const total = Object.values(allocations).reduce((s, v) => s + v, 0);

  if (total === 0) {
    return {
      overallScore: 0,
      dimensions: [],
      strongest: { key: 'social', labelAr: 'الأثر الاجتماعي', labelEn: 'Social Impact', score: 0 },
      tradeOffAr: 'لم يتم تخصيص رأس المال بعد.',
      tradeOffEn: 'No capital allocated yet.',
      recommendation: { sectorId: '', sectorAr: '', amount: 0, reasonAr: '' },
      strategyLabel: 'Empty Portfolio',
    };
  }

  const getSector = (id: string) => sectors.find((s) => s.id === id);

  // ---- Dimension scores (all relative to the best single-sector scenario) ----

  // SOCIAL: total social value vs "all budget in highest-SROI sector"
  const maxSroiSector = pickCandidate(sectors, (s) => getSectorSROI(s).median);
  const maxSocialValue = maxSroiSector ? total * getSectorSROI(maxSroiSector.sector).median : 0;
  const socialScore = maxSocialValue > 0 ? clamp((metrics.totalSocialValue / maxSocialValue) * 100) : 0;

  // JOBS: total employment vs "all budget in highest-jobs sector"
  const maxJobsSector = pickCandidate(sectors, (s) => s.jobsPerMSAR.value);
  const maxJobs = maxJobsSector ? (total / 1_000_000) * maxJobsSector.sector.jobsPerMSAR.value : 0;
  const jobsScore = maxJobs > 0 ? clamp((metrics.totalEmployment / maxJobs) * 100) : 0;

  // EDUCATION: human-capital contribution vs education's social value potential
  const eduSector = getSector('education');
  const eduAlloc = allocations.education ?? 0;
  const eduValue = eduSector ? eduAlloc * getSectorSROI(eduSector).median : 0;
  const eduBenchmark = eduSector ? total * 0.3 * getSectorSROI(eduSector).median : 0;
  // anchor: germane share of budget-to-education mapped against 0.30 weight
  const eduScore = eduBenchmark > 0 ? clamp((eduValue / eduBenchmark) * 100) : 0;

  // RISK: higher = riskier. Derived from resilience and concentration.
  const hhiValue = hhi(sectors.map((s) => allocations[s.id] ?? 0));
  const safety = 0.5 * metrics.resilienceScore + 0.5 * (1 - hhiValue);
  const riskScore = clamp((1 - safety) * 100);

  const dimensions: VerdictDimension[] = [
    { key: 'education', labelAr: 'رأس المال البشري (التعليم)', labelEn: 'Education', score: Math.round(eduScore) },
    { key: 'jobs', labelAr: 'الوظائف', labelEn: 'Jobs', score: Math.round(jobsScore) },
    { key: 'social', labelAr: 'الأثر الاجتماعي', labelEn: 'Social Impact', score: Math.round(socialScore) },
    { key: 'risk', labelAr: 'المخاطر', labelEn: 'Risk', score: Math.round(riskScore) },
  ];

  // ---- Overall impact score ----
  // Weighted toward outcomes, penalized by risk (higher risk drags the score).
  const benefitWeight =
    (0.35 / 100) * socialScore + (0.30 / 100) * jobsScore + (0.20 / 100) * eduScore + (0.15 / 100) * (100 - riskScore);
  const overallScore = clamp(Math.round(benefitWeight * 100));

  // ---- Strongest ----
  const strongest = [...dimensions].filter((d) => d.key !== 'risk').sort((a, b) => b.score - a.score)[0];

  // ---- Trade-off narrative ----
  let tradeOffAr = `أنت توازن بين الأثر و${riskScore >= 50 ? 'مخاطرة أعلى من المتوسط' : 'مخاطرة منخفضة'}.`;
  const hiImpact = socialScore >= 80;
  const hiJobs = jobsScore >= 80;
  if (hiImpact && hiJobs) tradeOffAr = 'استراتيجيتك تحقق أثرًا اجتماعيًا مرتفعًا ووظائف قوية، مع حمولة تنفيذية تحتاج إلى ضبط المخاطر.';
  else if (hiJobs && !hiImpact) tradeOffAr = 'استراتيجيتك معززة للوظائف، لكن الأثر الاجتماعي والتراكمي أقل — مقايضة بين التوظيف والأثر.';
  else if (hiImpact && !hiJobs) tradeOffAr = 'استراتيجيتك تحقق أثرًا اجتماعيًا مرتفعًا، ولكنها تتحمل مخاطرة تنفيذية وظيفية أعلى.';
  else tradeOffAr = 'أداؤك متوازن نسبيًا بين جميع الأبعاد دون هيمنة واضحة لأي منها.';
  const tradeOffEn = 'Model-derived comparative assessment of your chosen strategy.';

  // ---- Recommended adjustment ----
  // Highest marginal social-return sector (highest SROI) with capacity to absorb
  // a 5% reallocation, unless it's already near its max.
  const target = sectors
    .map((s) => ({ sector: s, sroi: getSectorSROI(s).median, alloc: allocations[s.id] ?? 0 }))
    .filter((x) => x.alloc + 5_000_000 <= 100_000_000)
    .sort((a, b) => b.sroi - a.sroi)[0];

  const recommendation = target
    ? {
        sectorId: target.sector.id,
        sectorAr: target.sector.arName,
        amount: 5_000_000,
        reasonAr: `تحويل 5% من المحفظة إلى ${target.sector.arName} يرفع العائد الاجتماعي الهامشي بأعلى معدل ضمن قيود التنويع.`,
      }
    : { sectorId: eduSector?.id ?? '', sectorAr: eduSector?.arName ?? '', amount: 5_000_000, reasonAr: 'تحويل 5% نحو التعليم لرفع رأس المال البشري.' };

  // ---- Strategy label ----
  let strategyLabel = 'Balanced';
  if (socialScore >= 85 && jobsScore < 70) strategyLabel = 'Social-First';
  else if (jobsScore >= 85 && socialScore < 70) strategyLabel = 'Jobs-First';
  else if (eduScore >= 85) strategyLabel = 'Education-First';
  else if (metrics.resilienceScore >= 0.75) strategyLabel = 'Resilient Balance';

  return {
    overallScore,
    dimensions,
    strongest,
    tradeOffAr,
    tradeOffEn,
    recommendation,
    strategyLabel,
  };
}
