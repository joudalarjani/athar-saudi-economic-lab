/**
 * Central state for ATHAR lab.
 * Uses Zustand for simplicity.
 */

import { create } from 'zustand';
import { isStageUnlocked } from '../lib/levels';
import { SECTORS } from '../data/sectors';
import { DEFAULT_OBJECTIVE_WEIGHTS } from '../data/objectives';
import { FUNDING_INSTRUMENTS } from '../data/fundingInstruments';
import { clampBudget, defaultBudget, sectorMin, sectorMax } from '../lib/budget';
import type { ObjectiveWeights } from '../engine/optimizer';
import type { GlossaryTermId } from '../data/glossary';

export type Stage =
  | 'hero'
  | 'map'
  | 'lab'
  | 'analysis'
  | 'optimization'
  | 'consequence'
  | 'stress'
  | 'sensitivity'
  | 'trade'
  | 'capitalStack'
  | 'sankey'
  | 'regional'
  | 'ppf'
  | 'marginalReturns'
  | 'critique'
  | 'brief'
  | 'credits';

interface LabState {
  // Navigation
  stage: Stage;
  setStage: (s: Stage) => void;

  // Progressively unlocked stages (sequential journey gate)
  visited: Stage[];
  resetProgress: () => void;

  // Allocation
  allocations: Record<string, number>;
  setAllocation: (sectorId: string, amount: number) => void;
  setAllAllocations: (allocations: Record<string, number>) => void;
  resetAllocations: () => void;

  // Adjustable total capital
  totalBudget: number;
  setTotalBudget: (budget: number) => void;

  // Parameters
  discountRate: number;
  setDiscountRate: (r: number) => void;
  horizon: number;
  setHorizon: (h: number) => void;

  // Time machine
  currentYear: number;
  setCurrentYear: (y: number) => void;

  // Multi-objective weights
  objectiveWeights: ObjectiveWeights;
  setObjectiveWeight: (key: keyof ObjectiveWeights, value: number) => void;
  resetObjectiveWeights: () => void;

  // Funding mix (capital stack)
  fundingMix: Record<string, number>;
  setFundingShare: (instrumentId: string, value: number) => void;
  resetFundingMix: () => void;

  // Reach rates (per sector)
  reachRates: Record<string, number>;
  setReachRate: (sectorId: string, value: number) => void;

  // 3D camera
  cameraMode: 'free' | 'top' | 'cinematic';
  setCameraMode: (m: 'free' | 'top' | 'cinematic') => void;
  showLabels: boolean;
  toggleLabels: () => void;

  // Reduced motion / 2D fallback
  prefer2D: boolean;
  setPrefer2D: (b: boolean) => void;

  // Mobile detection
  isMobile: boolean;
  setIsMobile: (b: boolean) => void;

  // Model explainer modal
  showModelExplainer: boolean;
  setShowModelExplainer: (b: boolean) => void;

  // Glossary modal
  glossaryTerm: GlossaryTermId | null;
  setGlossaryTerm: (t: GlossaryTermId | null) => void;

  // Sources panel
  showSources: boolean;
  setShowSources: (b: boolean) => void;

  // Saved strategy name (policy card)
  strategyName: string;
  setStrategyName: (name: string) => void;

  // Consequence Lab — ESG levers (0-1, illustrative, only used in the Consequence view)
  governance: number;
  setGovernance: (v: number) => void;
  environmental: number;
  setEnvironmental: (v: number) => void;
  social: number;
  setSocial: (v: number) => void;
}

/**
 * Compute initial equal allocation within min/max bounds for a given budget.
 */
function initialAllocations(budget: number): Record<string, number> {
  const total = budget;
  const allocations: Record<string, number> = {};

  for (const sector of SECTORS) {
    const equalShare = total / SECTORS.length;
    const a = Math.max(sectorMin(sector, budget), Math.min(sectorMax(sector, budget), equalShare));
    allocations[sector.id] = a;
  }

  // Adjust to hit total
  const sum = Object.values(allocations).reduce((s, v) => s + v, 0);
  const diff = total - sum;
  if (Math.abs(diff) > 0.01) {
    // Distribute diff to flexible sectors
    for (const sector of SECTORS) {
      const a = allocations[sector.id];
      const room = sectorMax(sector, budget) - a;
      if (room > 0) {
        const adjustment = Math.min(room, diff / SECTORS.length);
        allocations[sector.id] = a + adjustment;
      }
    }
  }

  return allocations;
}

const initialFunding = (): Record<string, number> => {
  const mix: Record<string, number> = {};
  const total = 1.0;
  const perShare = total / FUNDING_INSTRUMENTS.length;
  for (const inst of FUNDING_INSTRUMENTS) {
    mix[inst.id] = perShare;
  }
  return mix;
};

const initialReachRates = (): Record<string, number> => {
  const rates: Record<string, number> = {};
  for (const s of SECTORS) {
    rates[s.id] = 0.7;
  }
  return rates;
};

export const useLabStore = create<LabState>((set, get) => ({
  stage: 'hero',
  visited: [],
  setStage: (s) => {
    const { visited } = get();
    // Sequential gate: block navigation to locked stages.
    if (!isStageUnlocked(s, visited)) return;
    const newVisited = visited.includes(s) ? visited : [...visited, s];
    set({ stage: s, visited: newVisited });
  },
  resetProgress: () => set({ visited: [] }),

  allocations: initialAllocations(defaultBudget()),
  setAllocation: (sectorId, amount) => {
    const { allocations, totalBudget } = get();
    const sector = SECTORS.find((s) => s.id === sectorId);
    if (!sector) return;
    const clamped = Math.max(sectorMin(sector, totalBudget), Math.min(sectorMax(sector, totalBudget), amount));
    const newAllocations = { ...allocations, [sectorId]: clamped };

    // Rebalance: ensure total is exactly totalBudget
    const currentSum = Object.values(newAllocations).reduce((s, v) => s + v, 0);
    const diff = totalBudget - currentSum;
    if (Math.abs(diff) > 0.01) {
      // Distribute diff to other sectors
      for (const s of SECTORS) {
        if (s.id === sectorId) continue;
        const current = newAllocations[s.id] ?? 0;
        const adjustment = diff / (SECTORS.length - 1);
        const newVal = current + adjustment;
        const clampedVal = Math.max(sectorMin(s, totalBudget), Math.min(sectorMax(s, totalBudget), newVal));
        newAllocations[s.id] = clampedVal;
      }
    }

    set({ allocations: newAllocations });
  },
  setAllAllocations: (allocations) => set({ allocations }),
  resetAllocations: () => set((s) => ({ allocations: initialAllocations(s.totalBudget) })),

  totalBudget: defaultBudget(),
  setTotalBudget: (budget) => {
    const next = clampBudget(budget);
    set((s) => ({ totalBudget: next, allocations: initialAllocations(next) }));
  },

  discountRate: 0.03,
  setDiscountRate: (r) => set({ discountRate: Math.max(0, Math.min(0.15, r)) }),
  horizon: 10,
  setHorizon: (h) => set({ horizon: Math.max(1, Math.min(15, h)) }),

  currentYear: 5,
  setCurrentYear: (y) => set({ currentYear: Math.max(0, Math.min(15, y)) }),

  objectiveWeights: { ...DEFAULT_OBJECTIVE_WEIGHTS },
  setObjectiveWeight: (key, value) => {
    const { objectiveWeights } = get();
    const newWeights = { ...objectiveWeights, [key]: Math.max(0, Math.min(1, value)) };
    set({ objectiveWeights: newWeights });
  },
  resetObjectiveWeights: () => set({ objectiveWeights: { ...DEFAULT_OBJECTIVE_WEIGHTS } }),

  fundingMix: initialFunding(),
  setFundingShare: (instrumentId, value) => {
    const { fundingMix } = get();
    const clamped = Math.max(0, Math.min(1, value));
    set({ fundingMix: { ...fundingMix, [instrumentId]: clamped } });
  },
  resetFundingMix: () => set({ fundingMix: initialFunding() }),

  reachRates: initialReachRates(),
  setReachRate: (sectorId, value) => {
    const { reachRates } = get();
    set({ reachRates: { ...reachRates, [sectorId]: Math.max(0.1, Math.min(1, value)) } });
  },

  cameraMode: 'cinematic',
  setCameraMode: (m) => set({ cameraMode: m }),
  showLabels: true,
  toggleLabels: () => set((s) => ({ showLabels: !s.showLabels })),

  prefer2D: false,
  setPrefer2D: (b) => set({ prefer2D: b }),

  isMobile: false,
  setIsMobile: (b) => set({ isMobile: b }),

  showModelExplainer: false,
  setShowModelExplainer: (b) => set({ showModelExplainer: b }),

  glossaryTerm: null,
  setGlossaryTerm: (t) => set({ glossaryTerm: t }),

  showSources: false,
  setShowSources: (b) => set({ showSources: b }),

  strategyName: 'Your Strategy • استراتيجيتي',
  setStrategyName: (name) => set({ strategyName: name }),

  governance: 0.7,
  setGovernance: (v) => set({ governance: Math.max(0, Math.min(1, v)) }),
  environmental: 0.6,
  setEnvironmental: (v) => set({ environmental: Math.max(0, Math.min(1, v)) }),
  social: 0.7,
  setSocial: (v) => set({ social: Math.max(0, Math.min(1, v)) }),
}));
