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
