/**
 * Policy Stress Test Scenarios
 *
 * Each shock represents a plausible economic disruption to the social
 * investment portfolio. Scenarios are inspired by historical events
 * (2008 GFC, 2014 oil crash, COVID-19 2020) but parameterized for
 * generalization.
 *
 * IMPORTANT: These are SIMULATION ASSUMPTIONS, not forecasts.
 */

import { SOURCES } from './sources';
import type { SourceRef } from './sources';

export type ShockId =
  | 'inflation'
  | 'funding_cut'
  | 'sector_crisis_health'
  | 'pandemic'
  | 'economic_downturn'
  | 'oil_price_shock';

export interface Shock {
  id: ShockId;
  arName: string;
  enName: string;
  description: string;
  historicalInspiration?: string;
  /** Multipliers applied to each sector's effectiveness (1.0 = no change) */
  sectorEffectivenessMultiplier: Record<string, number>;
  /** Multiplier applied to overall budget (1.0 = no change) */
  budgetMultiplier: number;
  /** Multiplier applied to Keynesian multiplier (1.0 = no change) */
  multiplierMultiplier: number;
  /** Multiplier applied to deadweight (higher = more attribution lost) */
  deadweightMultiplier: number;
  evidenceSource: SourceRef;
}

export const SHOCKS: Shock[] = [
  {
    id: 'inflation',
    arName: 'صدمة تضخم',
    enName: 'Inflation Shock',
    description: 'ارتفاع الأسعار يقلل القوة الشرائية الحقيقية للتمويل الاجتماعي',
    historicalInspiration: '2022 global inflation',
    sectorEffectivenessMultiplier: {
      education: 0.92,
      health: 0.88,
      housing: 0.95,
      employment: 0.90,
      women: 0.92,
      environment: 0.94,
      hajj: 0.93,
    },
    budgetMultiplier: 0.95, // real budget shrinks
    multiplierMultiplier: 0.95,
    deadweightMultiplier: 1.10,
    evidenceSource: SOURCES.SAMA_REPORTS,
  },
  {
    id: 'funding_cut',
    arName: 'خفض التمويل',
    enName: 'Funding Cut',
    description: 'انخفاض المنح الحكومية أو الأوقاف — الميزانية تتقلص',
    historicalInspiration: 'Periods of fiscal consolidation',
    sectorEffectivenessMultiplier: {
      education: 0.85,
      health: 0.80,
      housing: 0.75,
      employment: 0.90,
      women: 0.85,
      environment: 0.95,
      hajj: 0.85,
    },
    budgetMultiplier: 0.70, // budget cut to 70%
    multiplierMultiplier: 0.85,
    deadweightMultiplier: 1.20,
    evidenceSource: SOURCES.IMF_ARTICLE_IV_SA,
  },
  {
    id: 'sector_crisis_health',
    arName: 'أزمة قطاعية (صحة)',
    enName: 'Sector Crisis (Health)',
    description: 'صدمة في قطاع واحد (مثلًا: وباء، إصلاح، فجوة كوادر)',
    sectorEffectivenessMultiplier: {
      education: 1.0,
      health: 0.50, // health hit hard
      housing: 1.0,
      employment: 0.95,
      women: 0.95,
      environment: 1.0,
      hajj: 1.0,
    },
    budgetMultiplier: 1.0,
    multiplierMultiplier: 0.95,
    deadweightMultiplier: 1.05,
    evidenceSource: SOURCES.IMF_ARTICLE_IV_SA,
  },
  {
    id: 'pandemic',
    arName: 'صدمة وبائية',
    enName: 'Pandemic Shock',
    description: 'مثل COVID-19: تضرر قطاعات، ارتفاع طلب الصحة، تراجع التوظيف',
    historicalInspiration: 'COVID-19 2020 — Saudi NCNP report on sector response',
    sectorEffectivenessMultiplier: {
      education: 0.65, // schools closed
      health: 1.30,    // surge demand
      housing: 0.80,
      employment: 0.55, // massive job loss
      women: 0.70,     // disproportionate impact
      environment: 0.85,
      hajj: 0.40,      // Hajj severely limited
    },
    budgetMultiplier: 0.85,
    multiplierMultiplier: 0.70,
    deadweightMultiplier: 1.30,
    evidenceSource: SOURCES.NCNP_ANNUAL_2024,
  },
  {
    id: 'economic_downturn',
    arName: 'ركود اقتصادي',
    enName: 'Economic Downturn',
    description: 'تباطؤ اقتصادي عام — يقلل multiplier ويخفض الاستهلاك المحلي',
    historicalInspiration: '2008 GFC global effects',
    sectorEffectivenessMultiplier: {
      education: 0.90,
      health: 0.92,
      housing: 0.85,
      employment: 0.75,
      women: 0.85,
      environment: 0.90,
      hajj: 0.90,
    },
    budgetMultiplier: 0.90,
    multiplierMultiplier: 0.75,
    deadweightMultiplier: 1.15,
    evidenceSource: SOURCES.IMF_ARTICLE_IV_SA,
  },
  {
    id: 'oil_price_shock',
    arName: 'صدمة أسعار النفط',
    enName: 'Oil Price Shock',
    description: 'انخفاض أسعار النفط يؤثر على الميزانية الحكومية والقدرة الاستيعابية',
    historicalInspiration: '2014-2016 oil crash',
    sectorEffectivenessMultiplier: {
      education: 0.88,
      health: 0.85,
      housing: 0.80,
      employment: 0.82,
      women: 0.85,
      environment: 0.90,
      hajj: 0.88,
    },
    budgetMultiplier: 0.80,
    multiplierMultiplier: 0.80,
    deadweightMultiplier: 1.20,
    evidenceSource: SOURCES.SAMA_REPORTS,
  },
];

export function getShock(id: ShockId): Shock | undefined {
  return SHOCKS.find((s) => s.id === id);
}
