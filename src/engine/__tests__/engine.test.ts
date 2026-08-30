/**
 * Economic Engine Unit Tests
 * Run with: npm test
 */

import { describe, it, expect } from 'vitest';
import { SECTORS, TOTAL_BUDGET } from '../../data/sectors';
import { computeDirectImpact } from '../impact';
import { computeSROI, getSectorSROI } from '../sroi';
import { computeMultiplier } from '../multiplier';
import { computeResilience, hhi } from '../resilience';
import { critiquePortfolio } from '../critique';
import { runStressTest } from '../stress';
import { evaluateCapitalStack } from '../capitalStack';
import { populationBasedAllocation } from '../regional';
import { optimizeAllocation } from '../optimizer';
import { runSensitivity } from '../sensitivity';
import { computePortfolioMetrics } from '../portfolio';
import { esgComposite, buildConsequenceProfile } from '../consequence';
import { buildChallenges, analyzeDefense } from '../reviewer';
import { clampBudget, BUDGET_MIN, BUDGET_MAX, sectorMin, sectorMax, SYSTEM_BUDGET } from '../../lib/budget';
import { buildProposedAllocation, computeTradeOff } from '../tradeoff';
import { runMonteCarlo, evaluateDeterministic } from '../monteCarlo';
import { buildPPFDataset, findKnee, findParetoFrontier } from '../ppf';

describe('Impact Calculator', () => {
  it('should return zero for zero allocation', () => {
    const result = computeDirectImpact(SECTORS[0], 0);
    expect(result.directBeneficiaries).toBe(0);
  });

  it('should compute beneficiaries proportional to allocation', () => {
    const a1 = 10_000_000;
    const a2 = 20_000_000;
    const r1 = computeDirectImpact(SECTORS[0], a1);
    const r2 = computeDirectImpact(SECTORS[0], a2);
    expect(r2.directBeneficiaries).toBeGreaterThan(r1.directBeneficiaries);
  });

  it('should apply diminishing returns', () => {
    const r1 = computeDirectImpact(SECTORS[0], 5_000_000);
    const r2 = computeDirectImpact(SECTORS[0], 50_000_000);
    const ratio = r2.directBeneficiaries / r1.directBeneficiaries;
    expect(ratio).toBeLessThan(10);
  });
});

describe('SROI', () => {
  it('should return zero for zero allocation', () => {
    const r = computeSROI(SECTORS[0], 0, 0);
    expect(r.sroi).toBe(0);
  });

  it('should return positive SROI for valid allocation', () => {
    const r = computeSROI(SECTORS[0], 10_000_000, 1000);
    expect(r.sroi).toBeGreaterThan(0);
    expect(r.totalSocialValue).toBeGreaterThan(0);
  });

  it('should have SROI range for each sector', () => {
    SECTORS.forEach((s) => {
      const range = getSectorSROI(s);
      expect(range.min).toBeLessThanOrEqual(range.median);
      expect(range.median).toBeLessThanOrEqual(range.max);
      expect(range.min).toBeGreaterThan(0);
    });
  });
});

describe('Multiplier', () => {
  it('should return zero for zero allocation', () => {
    const r = computeMultiplier(SECTORS[0], 0);
    expect(r.totalGdpImpact).toBe(0);
  });

  it('should apply 3-step cascade (Direct → Indirect → Induced)', () => {
    const r = computeMultiplier(SECTORS[0], 10_000_000);
    expect(r.directValue).toBeGreaterThan(0);
    expect(r.indirectValue).toBeGreaterThan(0);
    expect(r.inducedValue).toBeGreaterThan(0);
    const gross = r.directValue + r.indirectValue + r.inducedValue;
    expect(gross).toBeGreaterThan(r.directValue);
  });

  it('should apply leakage', () => {
    const r = computeMultiplier(SECTORS[0], 10_000_000);
    const gross = r.directValue + r.indirectValue + r.inducedValue;
    expect(r.totalGdpImpact).toBeLessThan(gross);
  });
});

describe('HHI', () => {
  it('should be 0 for empty allocation', () => {
    expect(hhi([])).toBe(0);
  });

  it('should be 1 for single-sector concentration', () => {
    expect(hhi([100, 0, 0, 0, 0, 0, 0])).toBe(1);
  });

  it('should be ~0.14 for equal 7-way split', () => {
    expect(hhi([1, 1, 1, 1, 1, 1, 1])).toBeCloseTo(1 / 7, 4);
  });
});

describe('Resilience', () => {
  const equalAlloc = (): Record<string, number> => {
    const a: Record<string, number> = {};
    SECTORS.forEach((s) => (a[s.id] = TOTAL_BUDGET / SECTORS.length));
    return a;
  };
  const concentratedAlloc = (): Record<string, number> => {
    const a: Record<string, number> = {};
    SECTORS.forEach((s) => (a[s.id] = s.id === 'education' ? 90_000_000 : 2_000_000));
    return a;
  };
  // Same funding mix for both so only allocation concentration differs
  const funding = { grants: 1.0 };

  it('should give high resilience for diversified portfolio', () => {
    const r = computeResilience(SECTORS, equalAlloc(), funding);
    expect(r.totalResilience).toBeGreaterThan(0.4);
  });

  it('should give lower resilience for concentrated vs diversified portfolio', () => {
    const diversified = computeResilience(SECTORS, equalAlloc(), funding).totalResilience;
    const concentrated = computeResilience(SECTORS, concentratedAlloc(), funding).totalResilience;
    expect(concentrated).toBeLessThan(diversified);
  });
});

describe('Policy Critique', () => {
  it('should flag concentration risk', () => {
    const alloc: Record<string, number> = {};
    SECTORS.forEach((s) => (alloc[s.id] = s.id === 'education' ? 80_000_000 : 4_000_000));
    const r = critiquePortfolio(SECTORS, alloc);
    expect(r.critiques.some((c) => c.id === 'concentration-high' || c.id === 'single-heavy-education')).toBe(true);
  });

  it('should give high health score for balanced portfolio', () => {
    const alloc: Record<string, number> = {};
    SECTORS.forEach((s) => (alloc[s.id] = TOTAL_BUDGET / SECTORS.length));
    const r = critiquePortfolio(SECTORS, alloc);
    expect(r.healthScore).toBeGreaterThan(0.3);
  });
});

describe('Stress Test', () => {
  it('should reduce impact under adverse shock', () => {
    const alloc: Record<string, number> = {};
    SECTORS.forEach((s) => (alloc[s.id] = TOTAL_BUDGET / SECTORS.length));
    const r = runStressTest(SECTORS, alloc, {
      id: 'pandemic',
      arName: '',
      enName: '',
      description: '',
      sectorEffectivenessMultiplier: Object.fromEntries(SECTORS.map((s) => [s.id, 0.5])),
      budgetMultiplier: 0.8,
      multiplierMultiplier: 0.7,
      deadweightMultiplier: 1.3,
      evidenceSource: { name: 'test', year: 2025, accessDate: '2025-08-24' },
    });
    expect(r.after.beneficiaries).toBeLessThan(r.before.beneficiaries);
  });
});

describe('Capital Stack', () => {
  it('should give high sustainability for waqf-heavy stack', () => {
    const mix = { waqf: 0.8, government_grants: 0.2 };
    const r = evaluateCapitalStack(
      [
        { id: 'waqf', arName: '', enName: '', description: '', risk: 0.1, sustainability: 1, liquidity: 0.3, governmentDependency: 0.2, examples: [], evidenceSource: { name: '', year: 2025, accessDate: '' } },
        { id: 'government_grants', arName: '', enName: '', description: '', risk: 0.2, sustainability: 0.7, liquidity: 0.9, governmentDependency: 1, examples: [], evidenceSource: { name: '', year: 2025, accessDate: '' } },
      ],
      mix
    );
    expect(r.sustainabilityScore).toBeGreaterThan(0.85);
  });
});

const REGIONS_DATA = [
  { id: 'riyadh', arName: 'الرياض', enName: 'Riyadh', populationShare: 0.275, nonprofitShare: 0.31, coverageIndex: 1.13, orgCount: 1592, evidenceSource: { name: '', year: 2025, accessDate: '' } },
  { id: 'makkah', arName: 'مكة', enName: 'Makkah', populationShare: 0.225, nonprofitShare: 0.18, coverageIndex: 0.8, orgCount: 1041, evidenceSource: { name: '', year: 2025, accessDate: '' } },
  { id: 'eastern', arName: 'الشرقية', enName: 'Eastern', populationShare: 0.165, nonprofitShare: 0.09, coverageIndex: 0.55, orgCount: 503, evidenceSource: { name: '', year: 2025, accessDate: '' } },
];

describe('Regional Allocation', () => {
  it('should sum to total budget', () => {
    const pop = populationBasedAllocation(REGIONS_DATA, 100_000_000);
    const total = pop.reduce((s, r) => s + r.amount, 0);
    expect(Math.abs(total - 100_000_000)).toBeLessThan(1_000_000);
  });
});

describe('Optimizer', () => {
  it('should produce a valid allocation', () => {
    const weights = { efficiency: 0.3, impact: 0.3, equity: 0.15, sustainability: 0.15, resilience: 0.1 };
    const r = optimizeAllocation(SECTORS, TOTAL_BUDGET, weights);
    const total = Object.values(r.allocation).reduce((s, v) => s + v, 0);
    expect(Math.abs(total - TOTAL_BUDGET)).toBeLessThan(1_000_000);
  });
});

describe('Sensitivity', () => {
  it('should produce tornado bars for each parameter', () => {
    const alloc: Record<string, number> = {};
    SECTORS.forEach((s) => (alloc[s.id] = TOTAL_BUDGET / SECTORS.length));
    const bars = runSensitivity(SECTORS, alloc, 'socialValue', 0.03, 10);
    expect(bars.length).toBeGreaterThan(3);
    expect(bars[0].range).toBeGreaterThanOrEqual(bars[bars.length - 1].range);
  });
});

describe('Portfolio Aggregator', () => {
  it('should compute consistent totals', () => {
    const alloc: Record<string, number> = {};
    SECTORS.forEach((s) => (alloc[s.id] = TOTAL_BUDGET / SECTORS.length));
    const m = computePortfolioMetrics(SECTORS, alloc);
    expect(m.totalBudget).toBeCloseTo(TOTAL_BUDGET, 0);
    expect(m.totalBeneficiaries).toBeGreaterThan(0);
    expect(m.totalSocialValue).toBeGreaterThan(0);
    expect(m.totalGdpImpact).toBeGreaterThan(0);
  });
});

describe('Consequence Lab', () => {
  const alloc: Record<string, number> = {};
  SECTORS.forEach((s) => (alloc[s.id] = TOTAL_BUDGET / SECTORS.length));

  it('should fold ESG levers into a bounded composite', () => {
    expect(esgComposite({ governance: 1, environmental: 0.5, social: 0.5 })).toBeCloseTo(0.7, 2);
    expect(esgComposite({ governance: 0, environmental: 0, social: 0 })).toBe(0);
    expect(esgComposite({ governance: 1, environmental: 1, social: 1 })).toBe(1);
  });

  it('should build a full 6-dimension profile', () => {
    const p = buildConsequenceProfile(SECTORS, alloc, { governance: 0.7, environmental: 0.6, social: 0.7 }, 'governance');
    expect(p.dimensions).toHaveLength(6);
    expect(p.strategyLabel.length).toBeGreaterThan(0);
    expect(p.retention).toBeGreaterThanOrEqual(0);
    expect(p.retention).toBeLessThanOrEqual(100);
  });

  it('should raise resilience as governance improves (illustrative only)', () => {
    const low = buildConsequenceProfile(SECTORS, alloc, { governance: 0.1, environmental: 0.1, social: 0.1 }, 'economic');
    const high = buildConsequenceProfile(SECTORS, alloc, { governance: 1, environmental: 0.1, social: 0.1 }, 'economic');
    expect(high.resilienceWithEsg).toBeGreaterThanOrEqual(low.resilienceWithEsg);
  });

  it('should reuse every archetype without error', () => {
    const keys = ['economic', 'funding', 'employment', 'governance'] as const;
    keys.forEach((k) => {
      const p = buildConsequenceProfile(SECTORS, alloc, { governance: 0.7, environmental: 0.6, social: 0.7 }, k);
      expect(p.retention).toBeGreaterThanOrEqual(0);
    });
  });
});

describe('Defend Your Decision — Reviewer', () => {
  const concentrated: Record<string, number> = {};
  SECTORS.forEach((s) => (concentrated[s.id] = s.id === 'education' ? 80_000_000 : 4_000_000));

  it('should raise challenges backed by real user shares', () => {
    const challenges = buildChallenges(SECTORS, concentrated);
    expect(challenges.some((c) => c.category === 'concentration')).toBe(true);
    expect(challenges.some((c) => c.category === 'single-sector')).toBe(true);
    challenges.forEach((c) => expect(c.figure.length).toBeGreaterThan(0));
  });

  it('should score empty allocation as clean (no challenges)', () => {
    const empty: Record<string, number> = {};
    const v = analyzeDefense(SECTORS, empty, 'anything');
    expect(v.total).toBe(0);
    expect(v.score).toBe(1);
  });

  it('should reward a defense that articulates the real trade-offs', () => {
    const silent = analyzeDefense(SECTORS, concentrated, 'ميزانية فقط');
    const articulate = analyzeDefense(
      SECTORS,
      concentrated,
      'اخترت التعليم رغم التركيز لأنه رأس مال بشري أولوية، وأعترف أن الصحة تحتاج حصة أكبر، وأخطط لتنويع المخاطر في المرحلة الثانية'
    );
    expect(articulate.score).toBeGreaterThan(silent.score);
  });
});

describe('The Trade-Off — two-sector reallocation', () => {
  const alloc: Record<string, number> = {};
  SECTORS.forEach((s) => (alloc[s.id] = 1_000_000 + (100_000_000 - SECTORS.length * 1_000_000) / SECTORS.length));

  it('should never withdraw more than the from-sector holds', () => {
    const proposed = buildProposedAllocation(SECTORS, alloc, 'education', 'health', 999_999_999);
    expect(Object.values(proposed).reduce((s, v) => s + v, 0)).toBeCloseTo(100_000_000, 0);
    const from = proposed['education'] ?? 0;
    expect(from).toBeGreaterThanOrEqual(0);
  });

  it('should return direction of movement for distinct sectors', () => {
    const r = computeTradeOff({ sectors: SECTORS, allocations: alloc, fromId: 'education', toId: 'environment', shift: 5_000_000 });
    expect(r.proposedAllocation['education']).toBeLessThan(alloc['education']);
    expect(r.proposedAllocation['environment']).toBeGreaterThan(alloc['environment']);
  });

  it('should preserve total budget exactly', () => {
    const r = computeTradeOff({ sectors: SECTORS, allocations: alloc, fromId: 'health', toId: 'education', shift: 3_000_000 });
    const sum = Object.values(r.proposedAllocation).reduce((s, v) => s + v, 0);
    expect(sum).toBeCloseTo(100_000_000, 0);
  });

  it('should produce an opportunity-cost narrative', () => {
    const r = computeTradeOff({ sectors: SECTORS, allocations: alloc, fromId: 'education', toId: 'health', shift: 2_000_000 });
    expect(r.opportunityCost.en.length).toBeGreaterThan(0);
    expect(r.opportunityCost.ar.length).toBeGreaterThan(0);
  });

  it('should report an even favor when no shift is possible (same sector)', () => {
    const r = computeTradeOff({ sectors: SECTORS, allocations: alloc, fromId: 'education', toId: 'education', shift: 5_000_000 });
    expect(r.favor.socialValue).toBe('even');
  });
});

describe('Adjustable Capital — budget scaling', () => {
  it('clamps budget into the supported range', () => {
    expect(clampBudget(1)).toBe(BUDGET_MIN);
    expect(clampBudget(2_000_000_000)).toBe(BUDGET_MAX);
    expect(clampBudget(SYSTEM_BUDGET)).toBe(SYSTEM_BUDGET);
  });

  it('scales sector min/max proportionally to budget', () => {
    for (const s of SECTORS) {
      // At the system budget, scaled bounds equal the absolute bounds.
      expect(sectorMin(s, SYSTEM_BUDGET)).toBe(s.minAllocation);
      expect(sectorMax(s, SYSTEM_BUDGET)).toBe(s.maxAllocation);
      // At half the budget, bounds halve.
      expect(sectorMin(s, SYSTEM_BUDGET / 2)).toBe(Div(s.minAllocation, 2));
      expect(sectorMax(s, SYSTEM_BUDGET / 2)).toBe(Div(s.maxAllocation, 2));
    }
  });

  it('keeps min-sum feasible at the smallest budget', () => {
    const totalMin = SECTORS.reduce((sum, s) => sum + sectorMin(s, BUDGET_MIN), 0);
    expect(totalMin).toBeLessThanOrEqual(BUDGET_MIN);
  });

  it('optimizer respects scaled bounds at a small budget', () => {
    const budget = 25_000_000;
    const r = optimizeAllocation(SECTORS, budget, { efficiency: 0.3, impact: 0.3, equity: 0.15, sustainability: 0.15, resilience: 0.1 });
    const sum = Object.values(r.allocation).reduce((s, v) => s + v, 0);
    expect(Math.abs(sum - budget)).toBeLessThan(1_000_000);
    for (const s of SECTORS) {
      const a = r.allocation[s.id] ?? 0;
      expect(a).toBeGreaterThanOrEqual(sectorMin(s, budget) - 1);
      expect(a).toBeLessThanOrEqual(sectorMax(s, budget) + 1);
    }
  });

  it('trade-off engine clamps with a scaled budget context', () => {
    const budget = 25_000_000;
    const alloc: Record<string, number> = {};
    SECTORS.forEach((s) => {
      const equal = budget / SECTORS.length;
      alloc[s.id] = Math.max(sectorMin(s, budget), Math.min(sectorMax(s, budget), equal));
    });
    const r = computeTradeOff({ sectors: SECTORS, allocations: alloc, fromId: 'education', toId: 'health', shift: 1_000_000, budget });
    const sum = Object.values(r.proposedAllocation).reduce((s, v) => s + v, 0);
    expect(Math.abs(sum - budget)).toBeLessThan(1);
    // From-sector must never fall below its scaled floor.
    expect(r.proposedAllocation['education']).toBeGreaterThanOrEqual(sectorMin(SECTORS.find((s) => s.id === 'education')!, budget) - 1);
    // To-sector must never exceed its scaled ceiling.
    expect(r.proposedAllocation['health']).toBeLessThanOrEqual(sectorMax(SECTORS.find((s) => s.id === 'health')!, budget) + 1);
  });
});

function Div(a: number, b: number): number {
  return Math.round(a / b);
}

describe('Monte-Carlo simulation', () => {
  const alloc: Record<string, number> = {};
  SECTORS.forEach((s) => {
    const equal = TOTAL_BUDGET / SECTORS.length;
    alloc[s.id] = Math.max(s.minAllocation, Math.min(s.maxAllocation, equal));
  });

  it('runs the requested number of trials', () => {
    const r = runMonteCarlo(SECTORS, alloc, 500, 1);
    expect(r.trials.length).toBe(500);
    expect(r.numTrials).toBe(500);
  });

  it('orders percentiles p5 <= p50 <= p95', () => {
    const r = runMonteCarlo(SECTORS, alloc, 800, 3);
    for (const metric of ['socialValue', 'gdpImpact', 'beneficiaries', 'npv'] as const) {
      expect(r.percentiles[metric].p5).toBeLessThanOrEqual(r.percentiles[metric].p50);
      expect(r.percentiles[metric].p50).toBeLessThanOrEqual(r.percentiles[metric].p95);
    }
  });

  it('is deterministic for the same seed', () => {
    const a = runMonteCarlo(SECTORS, alloc, 400, 99);
    const b = runMonteCarlo(SECTORS, alloc, 400, 99);
    expect(a.percentiles.socialValue).toEqual(b.percentiles.socialValue);
  });

  it('keeps the deterministic baseline equal to the point estimate', () => {
    const r = runMonteCarlo(SECTORS, alloc, 200, 5, 0.03, 10);
    const base = evaluateDeterministic(SECTORS, alloc, 0.03, 10);
    expect(r.deterministicBase.socialValue).toBeCloseTo(base.socialValue, 0);
    expect(r.deterministicBase.gdpImpact).toBeCloseTo(base.gdpImpact, 0);
  });

  it('produces a legitimate downside probability and positive mean', () => {
    const r = runMonteCarlo(SECTORS, alloc, 600, 11);
    for (const metric of ['socialValue', 'gdpImpact', 'beneficiaries', 'npv'] as const) {
      expect(r.downsideProbability[metric]).toBeGreaterThanOrEqual(0);
      expect(r.downsideProbability[metric]).toBeLessThanOrEqual(1);
      expect(r.mean[metric]).toBeGreaterThan(0);
    }
  });
});

describe('PPF knee point', () => {
  const alloc: Record<string, number> = {};
  SECTORS.forEach((s) => {
    const equal = TOTAL_BUDGET / SECTORS.length;
    alloc[s.id] = Math.max(s.minAllocation, Math.min(s.maxAllocation, equal));
  });

  it('builds a dataset with a knee on the frontier', () => {
    const ds = buildPPFDataset(SECTORS, TOTAL_BUDGET, alloc, 200, 7);
    expect(ds.frontier.length).toBeGreaterThan(0);
    expect(ds.knee.point).toBeDefined();
    expect(ds.knee.point.isOptimal).toBe(true);
    // The knee must be a frontier point.
    const onFrontier = ds.frontier.some((p) => p.id === ds.knee.point.id);
    expect(onFrontier).toBe(true);
  });

  it('knee position sits within [0,1] and distance is non-negative', () => {
    const ds = buildPPFDataset(SECTORS, TOTAL_BUDGET, alloc, 200, 7);
    expect(ds.knee.position).toBeGreaterThanOrEqual(0);
    expect(ds.knee.position).toBeLessThanOrEqual(1);
    expect(ds.knee.distance).toBeGreaterThanOrEqual(0);
    expect(ds.knee.opportunityCostRatio).toBeGreaterThanOrEqual(0);
  });

  it('knee allocation sums to the total budget', () => {
    const ds = buildPPFDataset(SECTORS, TOTAL_BUDGET, alloc, 200, 7);
    const sum = Object.values(ds.knee.point.allocation).reduce((s, v) => s + v, 0);
    expect(sum).toBeCloseTo(TOTAL_BUDGET, 0);
  });

  it('findKnee on a synthetic frontier returns the maximally-distant point', () => {
    const pts = [
      { id: 'A', allocation: {}, socialValue: 0, economicImpact: 0, beneficiaries: 0 },
      { id: 'B', allocation: {}, socialValue: 1, economicImpact: 1, beneficiaries: 0 },
      { id: 'C', allocation: {}, socialValue: 2, economicImpact: 0.1, beneficiaries: 0 },
    ];
    const frontier = findParetoFrontier(pts);
    const knee = findKnee(frontier).point;
    expect(knee.id).toBe('B');
  });
});
