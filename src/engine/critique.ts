/**
 * Policy Critique Engine
 *
 * Rule-based system that analyzes a portfolio and surfaces structural concerns.
 * Each rule is documented with a clear economic rationale.
 */

import type { Sector } from '../data/sectors';
import type { SourceRef } from '../data/sources';
import { hhi } from './resilience';
import { computeResilience } from './resilience';

export type CritiqueSeverity = 'info' | 'warning' | 'critical';

export interface Critique {
  id: string;
  severity: CritiqueSeverity;
  titleAr: string;
  titleEn: string;
  messageAr: string;
  messageEn: string;
  evidence: SourceRef;
  category: 'concentration' | 'sustainability' | 'equity' | 'efficiency' | 'long-term' | 'risk' | 'opportunity-cost';
}

export interface CritiqueResult {
  critiques: Critique[];
  /** Overall portfolio health: 0-1 */
  healthScore: number;
  /** Counts by severity */
  counts: { critical: number; warning: number; info: number };
}

const SOURCES_REFS = {
  VISION_2030: {
    name: 'Saudi Vision 2030 — Nonprofit Sector Priority',
    url: 'https://vision2030.ai/ar/vision/priority-nonprofit-sector/',
    year: 2024,
    accessDate: '2025-08-24',
  } as SourceRef,
  SAMA: {
    name: 'SAMA Annual Reports',
    url: 'https://www.sama.gov.sa/en-US/EconomicReports',
    year: 2024,
    accessDate: '2025-08-24',
  } as SourceRef,
  IMF: {
    name: 'IMF Article IV — Saudi Arabia 2024',
    url: 'https://www.imf.org/en/Publications/CR/Issues/2024/09/24/saudi-arabia-2024-article-iv-consultation',
    year: 2024,
    accessDate: '2025-08-24',
  } as SourceRef,
  KKF: {
    name: 'King Khalid Foundation — Nonprofit Sector Outlook 2025',
    url: 'https://kkf.org.sa/ne/n27/',
    year: 2025,
    accessDate: '2025-08-24',
  } as SourceRef,
};

export function critiquePortfolio(
  sectors: Sector[],
  allocations: Record<string, number>
): CritiqueResult {
  const critiques: Critique[] = [];
  const total = Object.values(allocations).reduce((s, v) => s + v, 0);
  if (total === 0) {
    return {
      critiques: [],
      healthScore: 0,
      counts: { critical: 0, warning: 0, info: 0 },
    };
  }

  const hhiValue = hhi(sectors.map((s) => allocations[s.id] ?? 0));
  const sectorShares = sectors.map((s) => ({ sector: s, share: (allocations[s.id] ?? 0) / total }));

  // Rule 1: Concentration Risk (HHI > 0.4)
  if (hhiValue > 0.4) {
    critiques.push({
      id: 'concentration-high',
      severity: 'critical',
      titleAr: 'مخاطر التركيز العالي',
      titleEn: 'High Concentration Risk',
      messageAr: `${(hhiValue * 100).toFixed(0)}% من التخصيص مركّز في قطاعات قليلة. مؤشر HHI > 0.4 يدل على محفظة غير متنوعة وعرضة للصدمات القطاعية.`,
      messageEn: `HHI of ${hhiValue.toFixed(2)} indicates heavy concentration. Suggests sectoral fragility.`,
      evidence: SOURCES_REFS.IMF,
      category: 'concentration',
    });
  } else if (hhiValue > 0.25) {
    critiques.push({
      id: 'concentration-moderate',
      severity: 'warning',
      titleAr: 'تركيز متوسط',
      titleEn: 'Moderate Concentration',
      messageAr: `تنويع متوسط. HHI = ${hhiValue.toFixed(2)}. قد يفيدك توزيع إضافي.`,
      messageEn: `Moderate HHI of ${hhiValue.toFixed(2)}. Consider further diversification.`,
      evidence: SOURCES_REFS.IMF,
      category: 'concentration',
    });
  }

  // Rule 2: Single sector > 40%
  for (const { sector, share } of sectorShares) {
    if (share > 0.4) {
      critiques.push({
        id: `single-heavy-${sector.id}`,
        severity: 'critical',
        titleAr: `تركيز مفرط في ${sector.arName}`,
        titleEn: `Over-allocation in ${sector.enName}`,
        messageAr: `${(share * 100).toFixed(0)}% من المحفظة في ${sector.arName}. هذا ينتهك مبدأ التنويع ويزيد مخاطر القطاع.`,
        messageEn: `${(share * 100).toFixed(0)}% in ${sector.enName}. High single-sector exposure.`,
        evidence: SOURCES_REFS.VISION_2030,
        category: 'concentration',
      });
    }
  }

  // Rule 3: Health below 10% (Vision 2030 priority)
  const healthShare = sectorShares.find((s) => s.sector.id === 'health')?.share ?? 0;
  if (healthShare < 0.10 && total > 0) {
    critiques.push({
      id: 'health-underfunded',
      severity: 'warning',
      titleAr: 'الرعاية الصحية تحت الحد المقترح',
      titleEn: 'Healthcare underfunded',
      messageAr: `الرعاية الصحية ممثلة بـ ${(healthShare * 100).toFixed(0)}% فقط. ضمن مستهدفات رؤية 2030، يُنصح بتخصيص 15-20%.`,
      messageEn: `Health at ${(healthShare * 100).toFixed(0)}%. Vision 2030 recommends 15-20%.`,
      evidence: SOURCES_REFS.VISION_2030,
      category: 'equity',
    });
  }

  // Rule 4: Education below 15%
  const eduShare = sectorShares.find((s) => s.sector.id === 'education')?.share ?? 0;
  if (eduShare < 0.15) {
    critiques.push({
      id: 'education-underfunded',
      severity: 'warning',
      titleAr: 'التعليم تحت الحد المقترح',
      titleEn: 'Education underfunded',
      messageAr: `التعليم ${(eduShare * 100).toFixed(0)}% فقط. استثمار رأس المال البشري ركيزة رؤية 2030.`,
      messageEn: `Education at ${(eduShare * 100).toFixed(0)}%. Vision 2030 prioritizes human capital.`,
      evidence: SOURCES_REFS.VISION_2030,
      category: 'equity',
    });
  }

  // Rule 5: Short-term bias
  // Sum of y1 shares weighted by allocation
  let weightedShortTerm = 0;
  for (const { sector, share } of sectorShares) {
    weightedShortTerm += share * sector.timeProfile.y1;
  }
  if (weightedShortTerm > 0.40) {
    critiques.push({
      id: 'short-term-bias',
      severity: 'warning',
      titleAr: 'تحيّز قصير المدى',
      titleEn: 'Short-term bias',
      messageAr: `${(weightedShortTerm * 100).toFixed(0)}% من الأثر المتوقع يتحقق في السنة الأولى. المحفظة تفتقر للاستثمارات طويلة المدى.`,
      messageEn: `${(weightedShortTerm * 100).toFixed(0)}% of impact by year 1. Lacks long-term investments.`,
      evidence: SOURCES_REFS.KKF,
      category: 'long-term',
    });
  }

  // Rule 6: Low sustainability
  let weightedSustainability = 0;
  for (const { sector, share } of sectorShares) {
    weightedSustainability += share * sector.sustainabilityScore.value;
  }
  if (weightedSustainability < 0.6) {
    critiques.push({
      id: 'low-sustainability',
      severity: 'warning',
      titleAr: 'استدامة منخفضة',
      titleEn: 'Low sustainability',
      messageAr: `متوسط استدامة المحفظة ${(weightedSustainability * 100).toFixed(0)}%. قد يضعف الأثر بعد 5 سنوات.`,
      messageEn: `Portfolio sustainability ${(weightedSustainability * 100).toFixed(0)}%. Year-5+ impact at risk.`,
      evidence: SOURCES_REFS.KKF,
      category: 'sustainability',
    });
  }

  // Rule 7: No environment (Vision 2030 green priority)
  const envShare = sectorShares.find((s) => s.sector.id === 'environment')?.share ?? 0;
  if (envShare < 0.05) {
    critiques.push({
      id: 'environment-marginal',
      severity: 'info',
      titleAr: 'البيئة مهمّشة',
      titleEn: 'Environment marginalized',
      messageAr: `البيئة ممثلة بـ ${(envShare * 100).toFixed(0)}%. السعودية التوقيعية على Saudi Green Initiative.`,
      messageEn: `Environment at ${(envShare * 100).toFixed(0)}%. Saudi Green Initiative targets need attention.`,
      evidence: SOURCES_REFS.VISION_2030,
      category: 'equity',
    });
  }

  // Rule 8: No regional consideration (heuristic)
  // (We don't have direct regional allocation in MVP, but we can check sector distribution)

  // Calculate health score
  const resilience = computeResilience(sectors, allocations);
  const criticalCount = critiques.filter((c) => c.severity === 'critical').length;
  const warningCount = critiques.filter((c) => c.severity === 'warning').length;
  const infoCount = critiques.filter((c) => c.severity === 'info').length;

  const healthScore = Math.max(
    0,
    resilience.totalResilience * 100 - criticalCount * 25 - warningCount * 8 - infoCount * 2
  ) / 100;

  return {
    critiques,
    healthScore,
    counts: {
      critical: criticalCount,
      warning: warningCount,
      info: infoCount,
    },
  };
}
