import type { Stage } from '../state/labStore';

/**
 * Progressive LEVEL narrative for ATHAR.
 * Groups stages into 5 cinematic levels so the product reads as a
 * journey (a lab experience) rather than a flat dashboard.
 */
export type LevelId = 1 | 2 | 3 | 4 | 5;

export interface LevelMeta {
  id: LevelId;
  code: string;
  nameEn: string;
  nameAr: string;
  tagline: string;
  color: string;
}

export const LEVELS: LevelMeta[] = [
  {
    id: 1,
    code: '01',
    nameEn: 'Allocate',
    nameAr: 'خَصِّص',
    tagline: 'Where do 100M SAR flow?',
    color: '#d4a017',
  },
  {
    id: 2,
    code: '02',
    nameEn: 'Observe Impact',
    nameAr: 'راقب الأثر',
    tagline: 'SROI vs Multiplier',
    color: '#10b981',
  },
  {
    id: 3,
    code: '03',
    nameEn: 'Analyze',
    nameAr: 'حلّل',
    tagline: 'Frontiers, returns, efficiency',
    color: '#2dd4bf',
  },
  {
    id: 4,
    code: '04',
    nameEn: 'Stress Test',
    nameAr: 'اختبر الصدمات',
    tagline: 'Resilience under shock',
    color: '#fb7185',
  },
  {
    id: 5,
    code: '05',
    nameEn: 'Policy Review',
    nameAr: 'راجع السياسة',
    tagline: 'Critique & brief',
    color: '#f59e0b',
  },
];

const STAGE_LEVEL: Record<Stage, LevelId> = {
  hero: 1,
  map: 1,
  lab: 1, // Allocate — the decision engine
  analysis: 2, // Observe Impact
  optimization: 3, // Analyze
  ppf: 3,
  marginalReturns: 3,
  sensitivity: 3,
  stress: 4, // Stress Test
  regional: 5, // Policy Review
  capitalStack: 5,
  critique: 5,
  brief: 5,
  credits: 5,
};

export function getLevelForStage(stage: Stage): LevelMeta {
  const id = STAGE_LEVEL[stage] ?? 3;
  return LEVELS.find((l) => l.id === id) ?? LEVELS[2];
}

/** Ordered stage sequences per level for nav grouping. */
export const LEVEL_STAGES: Array<{ level: LevelMeta; stages: Stage[] }> = [
  { level: LEVELS[0], stages: ['lab'] },
  { level: LEVELS[1], stages: ['analysis'] },
  { level: LEVELS[2], stages: ['optimization', 'ppf', 'marginalReturns', 'sensitivity'] },
  { level: LEVELS[3], stages: ['stress'] },
  { level: LEVELS[4], stages: ['regional', 'capitalStack', 'critique', 'brief'] },
];

export const JOURNEY_STAGES: Array<{ id: Stage; label: string; ar: string }> = [
  { id: 'lab', label: 'Allocate', ar: 'تخصيص' },
  { id: 'analysis', label: 'Impact', ar: 'أثر' },
  { id: 'optimization', label: 'Optimize', ar: 'تحسين' },
  { id: 'ppf', label: 'PPF', ar: 'PPF' },
  { id: 'marginalReturns', label: 'Marginal', ar: 'عائد' },
  { id: 'sensitivity', label: 'Sensitivity', ar: 'حساسية' },
  { id: 'stress', label: 'Stress', ar: 'صدمات' },
  { id: 'regional', label: 'Regional', ar: 'إقليمي' },
  { id: 'capitalStack', label: 'Capital', ar: 'تمويل' },
  { id: 'critique', label: 'Critique', ar: 'مراجعة' },
  { id: 'brief', label: 'Brief', ar: 'موجز' },
];
