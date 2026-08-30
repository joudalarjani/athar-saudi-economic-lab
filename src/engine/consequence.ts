/**
 * The Consequence Lab — Engine
 *
 * Wraps the existing stress-test model with a higher-level "consequence"
 * narrative. It maps the user-facing shock archetypes, folds an ESG
 * (Governance / Environmental / Social) slider layer into an ILLUSTRATIVE
 * resilience adjustment, and builds a compact impact profile.
 *
 * IMPORTANT — integrity: nothing here modifies the existing portfolio or
 * stress engine. The ESG adjustment is a separate, explicitly-labeled
 * "illustrative model parameter" applied only within the Consequence view.
 * It does NOT claim ESG prevents collapse; it says higher governance quality
 * "may be associated with higher resilience under the model's assumptions."
 */

import type { Sector } from '../data/sectors';
import type { ShockId } from '../data/shocks';
import { getShock } from '../data/shocks';
import { runStressTest } from './stress';
import { computePortfolioMetrics } from './portfolio';
import { hhi } from './resilience';

/** The four user-facing shock archetypes of the Consequence Lab. */
export type ConsequenceShockKey =
  | 'economic'
  | 'funding'
  | 'employment'
  | 'governance';

export interface ConsequenceShock {
  key: ConsequenceShockKey;
  order: string;
  titleEn: string;
  titleAr: string;
  blurb: string;
  /** Real shock id behind this archetype (reuses existing stress model). */
  shockId: ShockId;
  color: string;
}

export const CONSEQUENCE_SHOCKS: ConsequenceShock[] = [
  {
    key: 'economic',
    order: '01',
    titleEn: 'Economic Shock',
    titleAr: 'صدمة اقتصادية',
    blurb: 'ركود عام يقلل القوة الشرائية للتمويل الاجتماعي.',
    shockId: 'economic_downturn',
    color: '#f59e0b',
  },
  {
    key: 'funding',
    order: '02',
    titleEn: 'Funding Shock',
    titleAr: 'صدمة تمويل',
    blurb: 'انخفاض المنح والأوقاف — الميزانية تتقلص.',
    shockId: 'funding_cut',
    color: '#ef4444',
  },
  {
    key: 'employment',
    order: '03',
    titleEn: 'Employment Shock',
    titleAr: 'صدمة توظيف',
    blurb: 'تراجع الطلب على العمالة وارتفاع البطالة.',
    shockId: 'pandemic',
    color: '#8b5cf6',
  },
  {
    key: 'governance',
    order: '04',
    titleEn: 'Governance Shock',
    titleAr: 'صدمة حوكمة',
    blurb: 'ضعف الحوكمة وارتفاع مخاطر سوء التخصيص.',
    shockId: 'governance',
    color: '#2dd4bf',
  },
];

export interface EsgInput {
  governance: number; // 0-1
  environmental: number; // 0-1
  social: number; // 0-1
}

export interface ConsequenceProfile {
  esg: { governance: number; environmental: number; social: number; composite: number };
  /** Illustrative 0-1 resilience adjustment derived from ESG (NOT the model score). */
  governanceAdjustment: number;
  /** Model resilience before any ESG adjustment. */
  baseResilience: number;
  /** Composite resilience = base score with a bounded ESG tilt (illustrative). */
  resilienceWithEsg: number;
  /** Impact retention (0-100) under the chosen archetype shock. */
  retention: number;
  /** Per-dimension profile metrics (0-100), all model-derived or clear proxies. */
  dimensions: Array<{
    key: string;
    labelEn: string;
    labelAr: string;
    score: number;
    color: string;
    hint: string;
  }>;
  strategyLabel: string;
  strategyTaglineAr: string;
}

function clamp01(v: number): number {
  return Math.max(0, Math.min(1, v));
}

/**
 * Fold the three ESG levers into a single illustrative composite (0-1).
 */
export function esgComposite(e: EsgInput): number {
  return (
    clamp01(e.governance) * 0.4 +
    clamp01(e.environmental) * 0.3 +
    clamp01(e.social) * 0.3
  );
}

/**
 * Build the full Consequence Lab profile for a portfolio and chosen archetype.
 *
 * @param sectors     sector definitions
 * @param allocations current user allocation (SAR)
 * @param esg         governance/environmental/social slider inputs (0-1)
 * @param discountRate portfolio discount rate
 * @param horizon      portfolio horizon (years)
 */
export function buildConsequenceProfile(
  sectors: Sector[],
  allocations: Record<string, number>,
  esg: EsgInput,
  shockKey: ConsequenceShockKey = 'economic',
  discountRate = 0.03,
  horizon = 10
): ConsequenceProfile {
  const shockDef = CONSEQUENCE_SHOCKS.find((s) => s.key === shockKey) ?? CONSEQUENCE_SHOCKS[0];

  const metrics = computePortfolioMetrics(sectors, allocations, discountRate, horizon);

  // Resilience pieces
  const hhiValue = hhi(sectors.map((s) => allocations[s.id] ?? 0));
  const weightedSustain = sectors.reduce((sum, s) => {
    const share = (allocations[s.id] ?? 0) / Math.max(metrics.totalBudget, 1);
    return sum + share * s.sustainabilityScore.value;
  }, 0);

  // Efficiency: beneficiaries per riyal, normalized to the best sector.
  const maxEff = Math.max(
    1,
    ...sectors.map((s) => {
      const alloc = allocations[s.id] ?? 0;
      if (alloc <= 0) return 0;
      return (alloc / s.costPerBeneficiary.value) / (alloc || 1);
    })
  );
  const effScoreRaw =
    sectors.reduce((sum, s) => {
      const alloc = allocations[s.id] ?? 0;
      if (alloc <= 0) return sum;
      return sum + (alloc / s.costPerBeneficiary.value);
    }, 0) / Math.max(maxEff * metrics.totalBudget, 1);

  const socialScore = clamp01(metrics.portfolioSROI / Math.max(metrics.portfolioSROIMax, 0.01));
  const economicScore = clamp01(metrics.portfolioMultiplier / (metrics.portfolioMultiplier + 0.5));

  // Retention under the archetype shock (reuses the real stress engine).
  const realShock = getShock(shockDef.shockId);
  const stressResult = realShock
    ? runStressTest(sectors, allocations, realShock)
    : null;
  const retention = stressResult ? stressResult.retentionRate : 0;

  // ESG-driven illustrative resilience adjustment.
  const composite = esgComposite(esg);
  const governanceAdjustment = 0.5 + 0.5 * composite; // 0.5..1.0
  const resilienceWithEsg = clamp01(
    metrics.resilienceScore * (0.6 + 0.4 * governanceAdjustment)
  );

  const dimensions = [
    { key: 'social', labelEn: 'Social Impact', labelAr: 'أثر اجتماعي', score: Math.round(socialScore * 100), color: '#8b5cf6', hint: 'SROI للأثر الاجتماعي' },
    { key: 'economic', labelEn: 'Economic Impact', labelAr: 'أثر اقتصادي', score: Math.round(economicScore * 100), color: '#f59e0b', hint: 'المضاعف الكينزي' },
    { key: 'efficiency', labelEn: 'Efficiency', labelAr: 'كفاءة', score: Math.round(clamp01(effScoreRaw) * 100), color: '#10b981', hint: 'مستفيد / ريال' },
    { key: 'equity', labelEn: 'Equity', labelAr: 'إنصاف', score: Math.round((1 - hhiValue) * 100), color: '#f472b6', hint: 'تنويع التخصيص (1 - HHI)' },
    { key: 'sustainability', labelEn: 'Sustainability', labelAr: 'استدامة', score: Math.round(weightedSustain * 100), color: '#22c55e', hint: 'استمرارية الأثر عبر الزمن' },
    { key: 'resilience', labelEn: 'Resilience', labelAr: 'مرونة', score: Math.round(resilienceWithEsg * 100), color: '#2dd4bf', hint: 'الصمود (مع لمسة ESG توضيحية)' },
  ];

  // Short strategy label from profile.
  const profile = {
    social: socialScore,
    economic: economicScore,
    resilience: resilienceWithEsg,
    equity: 1 - hhiValue,
  };
  let strategyLabel = 'Balanced Strategy';
  let strategyTaglineAr = 'محفظة متوازنة بين الأثر والمرونة.';
  if (profile.social >= 0.85 && profile.resilience >= 0.7 && profile.equity >= 0.6) {
    strategyLabel = 'Resilient High-Impact Strategy';
    strategyTaglineAr = 'أثر مرتفع مع صمود جيد — توازن نادر بين الحجم والاستمرارية.';
  } else if (profile.social >= 0.8 && profile.resilience < 0.6) {
    strategyLabel = 'High Impact — Lower Resilience';
    strategyTaglineAr = 'محفظتك تحقق أثرًا كبيرًا، لكنها أكثر هشاشة أمام الصدمات.';
  } else if (profile.resilience >= 0.7 && profile.economic >= 0.7) {
    strategyLabel = 'Stable Growth Strategy';
    strategyTaglineAr = 'نمو مستقر وأثر اقتصادي متين مع حماية جيدة من الصدمات.';
  } else if (profile.social < 0.5) {
    strategyLabel = 'Conservative Allocation';
    strategyTaglineAr = 'توزيع متحفظ — أولوية للصمود على حساب حجم الأثر.';
  }

  return {
    esg: { governance: clamp01(esg.governance), environmental: clamp01(esg.environmental), social: clamp01(esg.social), composite },
    governanceAdjustment,
    baseResilience: metrics.resilienceScore,
    resilienceWithEsg,
    retention: retention * 100,
    dimensions,
    strategyLabel,
    strategyTaglineAr,
  };
}
