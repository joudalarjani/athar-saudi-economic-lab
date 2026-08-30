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
  consequence: 4, // The Consequence Lab — gateway into shocks
  stress: 4, // Stress Test
  regional: 5, // Policy Review
  capitalStack: 5,
  sankey: 5,
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
  { level: LEVELS[3], stages: ['consequence', 'stress'] },
  { level: LEVELS[4], stages: ['regional', 'capitalStack', 'sankey', 'critique', 'brief'] },
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
  { id: 'sankey', label: 'Flow', ar: 'تدفق' },
  { id: 'critique', label: 'Critique', ar: 'مراجعة' },
  { id: 'brief', label: 'Brief', ar: 'موجز' },
];

/**
 * Canonical ordered journey enforced for progressive unlocking.
 * A user must pass through these stages in order (Option A / LEVEL 01→05).
 * Stages NOT in this list (`hero`, `map`, `credits`) are always reachable
 * and are excluded from the sequential gate.
 */
export const STAGE_SEQUENCE: Stage[] = [
  'lab',
  'analysis',
  'optimization',
  'ppf',
  'marginalReturns',
  'sensitivity',
  'consequence',
  'stress',
  'regional',
  'capitalStack',
  'sankey',
  'critique',
  'brief',
];

/** Ancilary/terminal screens that are never gated. */
export const ALWAYS_UNLOCKED: Stage[] = ['hero', 'map', 'credits'];

export function isAlwaysUnlocked(stage: Stage): boolean {
  return ALWAYS_UNLOCKED.includes(stage);
}

/** The frontier = first stage in the canonical sequence not yet visited. */
export function nextFrontier(visited: Stage[]): Stage | undefined {
  return STAGE_SEQUENCE.find((s) => !visited.includes(s));
}

/**
 * A stage can be entered if it is always-unlocked, already visited, or is the
 * current frontier (moving forward is restricted to the immediate next stage).
 */
export function isStageUnlocked(stage: Stage, visited: Stage[]): boolean {
  if (isAlwaysUnlocked(stage)) return true;
  if (visited.includes(stage)) return true;
  return nextFrontier(visited) === stage;
}

/** The next stage a user may advance to after `current`. */
export function getNextStage(current: Stage, visited: Stage[]): Stage | null {
  const idx = STAGE_SEQUENCE.indexOf(current);
  if (idx === -1) return nextFrontier(visited) ?? null;
  for (let i = idx + 1; i < STAGE_SEQUENCE.length; i++) {
    const s = STAGE_SEQUENCE[i];
    if (isStageUnlocked(s, visited)) return s;
  }
  return null;
}

/** The previous stage in the journey (always reachable once `current` is open). */
export function getPrevStage(current: Stage): Stage | null {
  const idx = STAGE_SEQUENCE.indexOf(current);
  if (idx > 0) return STAGE_SEQUENCE[idx - 1];
  return idx === 0 ? 'hero' : null;
}

/** Human label for a stage used in nav buttons. */
const STAGE_LABEL: Record<Stage, { en: string; ar: string }> = {
  hero: { en: 'Entry', ar: 'المدخل' },
  map: { en: 'Map', ar: 'الخريطة' },
  lab: { en: 'Allocate', ar: 'تخصيص' },
  analysis: { en: 'Impact', ar: 'أثر' },
  optimization: { en: 'Optimize', ar: 'تحسين' },
  ppf: { en: 'PPF', ar: 'PPF' },
  marginalReturns: { en: 'Marginal', ar: 'عائد' },
  sensitivity: { en: 'Sensitivity', ar: 'حساسية' },
  consequence: { en: 'Consequence', ar: 'عواقب' },
  stress: { en: 'Stress', ar: 'صدمات' },
  regional: { en: 'Regional', ar: 'إقليمي' },
  capitalStack: { en: 'Capital', ar: 'تمويل' },
  sankey: { en: 'Flow', ar: 'تدفق' },
  critique: { en: 'Critique', ar: 'مراجعة' },
  brief: { en: 'Brief', ar: 'موجز' },
  credits: { en: 'Credits', ar: 'شكرًا' },
};

export function stageLabel(stage: Stage): { en: string; ar: string } {
  return STAGE_LABEL[stage] ?? { en: stage, ar: stage };
}
