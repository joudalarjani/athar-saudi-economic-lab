/**
 * Adjustable Capital — budget helper.
 *
 * Sector min/max bounds in `sectors.ts` are calibrated absolute SAR amounts
 * for the 100M baseline budget. When the total budget is user-adjustable
 * (25M–500M+), those absolute bounds would become incoherent (e.g. a 60M max
 * is impossible with a 25M budget). So we express every bound as a fixed
 * *proportion* of the baseline and scale it to whatever budget the user chose.
 *
 * This keeps every existing engine and slider consistent while the total
 * capital changes, without inventing new data.
 */

import type { Sector } from '../data/sectors';

export const SYSTEM_BUDGET = 100_000_000;
const DEFAULT_BUDGET = SYSTEM_BUDGET;

export const BUDGET_PRESETS = [
  { label: '25M', value: 25_000_000 },
  { label: '50M', value: 50_000_000 },
  { label: '100M', value: 100_000_000 },
  { label: '250M', value: 250_000_000 },
  { label: '500M', value: 500_000_000 },
];

export const BUDGET_MIN = 10_000_000;
export const BUDGET_MAX = 1_000_000_000;

export function clampBudget(v: number): number {
  return Math.max(BUDGET_MIN, Math.min(BUDGET_MAX, Math.round(v)));
}

export function defaultBudget(): number {
  return DEFAULT_BUDGET;
}

/** Scale an absolute baseline-SAR amount to the chosen budget. */
export function scaleAmount(abs: number, budget: number): number {
  return (abs / SYSTEM_BUDGET) * budget;
}

/** Effective per-sector minimum allocation for a given budget. */
export function sectorMin(sector: Sector, budget: number): number {
  return Math.round(scaleAmount(sector.minAllocation, budget));
}

/** Effective per-sector maximum allocation for a given budget. */
export function sectorMax(sector: Sector, budget: number): number {
  return Math.round(scaleAmount(sector.maxAllocation, budget));
}

/** Per-sector proportion (0-1) of the total budget for a baseline-SAR amount. */
export function shareOf(amount: number, budget: number): number {
  if (budget <= 0) return 0;
  return Math.max(0, Math.min(1, amount / budget));
}
