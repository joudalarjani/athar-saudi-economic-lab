import { create } from "zustand";
import type { SectorId, ObjectiveWeights, ShockId, AllocationSnapshot, ComputedResults } from "../data/types";
import { BUDGET } from "../data/types";
import { SECTORS } from "../data/sectors.db";
import { computeAll } from "../engine";

type Phase =
  | "hero"
  | "question"
  | "evidence"
  | "mechanism"
  | "model"
  | "scenarios"
  | "tradeoff"
  | "policy"
  | "impact"
  | "thesis"
  | "about";

interface AtharState {
  amounts: Record<SectorId, number>;
  year: 0 | 1 | 3 | 5 | 10;
  weights: ObjectiveWeights;
  activeShocks: ShockId[];
  snapshots: AllocationSnapshot[];
  phase: Phase;
  results: ComputedResults;

  setAmount: (sector: SectorId, amount: number) => void;
  resetAmounts: () => void;
  setYear: (year: 0 | 1 | 3 | 5 | 10) => void;
  setWeight: (key: keyof ObjectiveWeights, value: number) => void;
  toggleShock: (shock: ShockId) => void;
  saveSnapshot: (label: string) => void;
  setPhase: (phase: Phase) => void;
  recalc: () => void;
}

const initialAmounts: Record<SectorId, number> = Object.fromEntries(
  SECTORS.map((s) => [s.id, 0])
) as Record<SectorId, number>;

function recalcResults(state: Partial<AtharState>) {
  return computeAll(
    state.amounts || initialAmounts,
    state.year || 0,
    state.weights || { efficiency: 0.3, social_impact: 0.3, equity: 0.2, sustainability: 0.1, resilience: 0.1 },
    state.activeShocks || []
  );
}

export const useStore = create<AtharState>((set, get) => ({
  amounts: { ...initialAmounts },
  year: 0,
  weights: { efficiency: 0.3, social_impact: 0.3, equity: 0.2, sustainability: 0.1, resilience: 0.1 },
  activeShocks: [],
  snapshots: [],
  phase: "hero",
  results: computeAll(initialAmounts, 0),

  setAmount: (sector, amount) => {
    const current = get();
    const othersTotal = Object.entries(current.amounts)
      .filter(([k]) => k !== sector)
      .reduce((s, [, v]) => s + v, 0);
    const maxForSector = BUDGET - othersTotal;
    const clamped = Math.max(0, Math.min(amount, maxForSector));
    const newAmounts = { ...current.amounts, [sector]: clamped };
    set({ amounts: newAmounts, results: recalcResults({ amounts: newAmounts, year: current.year, weights: current.weights, activeShocks: current.activeShocks }) });
  },

  resetAmounts: () => {
    const state = get();
    const reset = { ...initialAmounts };
    set({ amounts: reset, results: recalcResults({ amounts: reset, year: state.year, weights: state.weights, activeShocks: state.activeShocks }) });
  },

  setYear: (year) => {
    const state = get();
    set({ year, results: recalcResults({ amounts: state.amounts, year, weights: state.weights, activeShocks: state.activeShocks }) });
  },

  setWeight: (key, value) => {
    const state = get();
    const weights = { ...state.weights, [key]: value };
    set({ weights, results: recalcResults({ amounts: state.amounts, year: state.year, weights, activeShocks: state.activeShocks }) });
  },

  toggleShock: (shock) => {
    const state = get();
    const active = state.activeShocks.includes(shock)
      ? state.activeShocks.filter((s) => s !== shock)
      : [...state.activeShocks, shock];
    set({ activeShocks: active, results: recalcResults({ amounts: state.amounts, year: state.year, weights: state.weights, activeShocks: active }) });
  },

  saveSnapshot: (label) => {
    const state = get();
    const snap: AllocationSnapshot = {
      label,
      amounts: { ...state.amounts },
      year: state.year,
      timestamp: Date.now(),
    };
    set({ snapshots: [...state.snapshots, snap] });
  },

  setPhase: (phase) => set({ phase }),

  recalc: () => {
    const state = get();
    set({ results: recalcResults({ amounts: state.amounts, year: state.year, weights: state.weights, activeShocks: state.activeShocks }) });
  },
}));
