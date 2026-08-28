/**
 * Formatting utilities for SAR, percentages, and numbers.
 */

export function formatSAR(amount: number, options: { compact?: boolean; decimals?: number } = {}): string {
  const { compact = false, decimals = 0 } = options;
  if (compact) {
    if (amount >= 1_000_000_000) return `${(amount / 1_000_000_000).toFixed(2)}B ريال`;
    if (amount >= 1_000_000) return `${(amount / 1_000_000).toFixed(1)}M ريال`;
    if (amount >= 1_000) return `${(amount / 1_000).toFixed(0)}K ريال`;
    return `${amount.toFixed(0)} ريال`;
  }
  return new Intl.NumberFormat('ar-SA', {
    style: 'currency',
    currency: 'SAR',
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  }).format(amount);
}

export function formatNumber(n: number, decimals: number = 0): string {
  return new Intl.NumberFormat('ar-SA', {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  }).format(n);
}

export function formatPercent(value: number, decimals: number = 1): string {
  return `${(value * 100).toFixed(decimals)}%`;
}

export function formatMultiplier(value: number): string {
  return `${value.toFixed(2)}×`;
}

/** Format an SROI range as "1.5×–2.5×" (min–max). Rounds to 1 decimal for readability. */
export function formatSROIRange(min: number, max: number, decimals: number = 1): string {
  return `${min.toFixed(decimals)}×–${max.toFixed(decimals)}×`;
}
