/**
 * Sector resilience parameters — used by resilience and stress modules.
 *
 * For each sector, we record its effectiveness multiplier under each
 * historical-inspired shock scenario. This is what determines σ in the
 * resilience score.
 *
 * Source: SIMULATION_ASSUMPTION derived from shocks.ts
 */

export const SUSTAINABILITY_UNDER_SHOCK: Record<string, number[]> = {
  education: [0.92, 0.85, 1.0, 0.65, 0.90, 0.88],
  health: [0.88, 0.80, 0.50, 1.30, 0.92, 0.85],
  housing: [0.95, 0.75, 1.0, 0.80, 0.85, 0.80],
  employment: [0.90, 0.90, 0.95, 0.55, 0.75, 0.82],
  women: [0.92, 0.85, 0.95, 0.70, 0.85, 0.85],
  environment: [0.94, 0.95, 1.0, 0.85, 0.90, 0.90],
  hajj: [0.90, 0.82, 1.0, 0.35, 0.86, 0.84],
};
