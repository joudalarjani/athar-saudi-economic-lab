/**
 * Performance detection — decides whether to render 3D or 2D fallback.
 */

export function detectLowEndDevice(): boolean {
  if (typeof window === 'undefined') return true;

  // Check for prefers-reduced-motion
  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (prefersReducedMotion) return true;

  // Check hardware concurrency (CPU cores)
  const cores = navigator.hardwareConcurrency ?? 4;
  if (cores <= 2) return true;

  // Check device memory
  const memory = (navigator as any).deviceMemory;
  if (memory && memory < 4) return true;

  // Check connection
  const conn = (navigator as any).connection;
  if (conn && (conn.effectiveType === '2g' || conn.effectiveType === 'slow-2g')) return true;

  return false;
}

export function detectMobile(): boolean {
  if (typeof window === 'undefined') return false;
  return window.innerWidth < 768;
}

export function detectWebGL(): boolean {
  if (typeof window === 'undefined') return false;
  try {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('webgl2') || canvas.getContext('webgl');
    return !!ctx;
  } catch {
    return false;
  }
}
