/**
 * Formatting utilities for SAR, percentages, and numbers.
 *
 * IMPORTANT — numeral policy:
 * Every number rendered anywhere in the interface uses Western / Arabic-Indic
 * digits (0-9, "en-US" style) even when surrounding copy is Arabic. We never
 * format with `ar-SA` (which yields Eastern Arabic-Indic ٠١٢٣...), because the
 * data must read as real economic output.
 */

/**
 * Format a number in Western numerals with thousands separators.
 * Uses "en-US" locale purely for digit/grouping style.
 */
export function formatNumber(n: number, decimals: number = 0): string {
  return new Intl.NumberFormat('en-US', {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  }).format(n);
}

/**
 * Compact SAR: `100M SAR`, `250K SAR`, `1.5B SAR`.
 * Uses Western numerals only.
 */
export function formatSARCompact(amount: number): string {
  const abs = Math.abs(amount);
  if (abs >= 1_000_000_000) return `${(amount / 1_000_000_000).toFixed(2)}B SAR`;
  if (abs >= 1_000_000) return `${(amount / 1_000_000).toFixed(1)}M SAR`;
  if (abs >= 1_000) return `${(amount / 1_000).toFixed(0)}K SAR`;
  return `${amount.toFixed(0)} SAR`;
}

/**
 * Full SAR with Western digit grouping (no currency symbol, keeps the
 * optional `SAR` unit suffix controlled by the caller).
 */
export function formatSARFull(amount: number, decimals: number = 0): string {
  return new Intl.NumberFormat('en-US', {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  }).format(amount);
}

export function formatSAR(amount: number, options: { compact?: boolean; decimals?: number } = {}): string {
  const { compact = false, decimals = 0 } = options;
  if (compact) return formatSARCompact(amount);
  return formatSARFull(amount, decimals);
}

/**
 * Percentage as Western numeral. If `signed` is true a leading `+`/`-` is
 * attached (e.g. `+18.6%`).
 */
export function formatPercent(value: number, decimals: number = 1, signed: boolean = false): string {
  const num = (value * 100).toFixed(decimals);
  if (signed) return `${value >= 0 ? '+' : ''}${num}%`;
  return `${num}%`;
}

export function formatMultiplier(value: number): string {
  return `${value.toFixed(2)}×`;
}

/** Format an SROI range as "2.5×–5.5×" (min–max). Western numerals. */
export function formatSROIRange(min: number, max: number, decimals: number = 1): string {
  return `${min.toFixed(decimals)}×–${max.toFixed(decimals)}×`;
}

/**
 * Format a time-horizon value in years as a Western numeral with a `Y` unit,
 * e.g. `4.2Y`. A zero/undefined value degrades gracefully to `—`.
 */
export function formatYears(years: number | undefined | null, decimals: number = 1): string {
  if (years === undefined || years === null || Number.isNaN(years)) return '—';
  return `${years.toFixed(decimals)}Y`;
}
