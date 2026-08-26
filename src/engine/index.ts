import type { SectorParams, SectorId, ComputedResults, ObjectiveWeights, ShockId } from "../data/types";
import { BUDGET, DISCOUNT_RATE, TIME_YEARS } from "../data/types";
import { SECTORS } from "../data/sectors.db";
import { SHOCK_MAP } from "../data/shocks.db";

const DEFAULT_WEIGHTS: ObjectiveWeights = {
  efficiency: 0.30,
  social_impact: 0.30,
  equity: 0.20,
  sustainability: 0.10,
  resilience: 0.10,
};

function clamp(a: number, lo: number, hi: number) {
  return Math.max(lo, Math.min(hi, a));
}

function sumRecord(r: Record<string, number>) {
  return Object.values(r).reduce((s, v) => s + v, 0);
}

function impactAtSector(sec: SectorParams, allocation: number): number {
  if (allocation <= 0) return 0;
  return Math.pow(allocation / BUDGET, sec.theta) * 100 * (allocation / BUDGET);
}

function maturityAtYear(sec: SectorParams, yearIdx: number): number {
  const c = sec.maturityCurve;
  if (c.length === 0) return 0;
  if (yearIdx >= c.length) return c[c.length - 1];
  return c[yearIdx];
}

function yearIndex(year: number): number {
  const idx = TIME_YEARS.indexOf(year as (typeof TIME_YEARS)[number]);
  return idx >= 0 ? idx : 0;
}

function discountFactor(year: number): number {
  return 1 / Math.pow(1 + DISCOUNT_RATE, year);
}

function computeSROI(
  sec: SectorParams,
  allocation: number,
  year: number
): number {
  if (allocation <= 0) return 0;
  const yi = yearIndex(year);
  let cumulativeValue = 0;
  for (let t = 0; t <= yi; t++) {
    const maturity = maturityAtYear(sec, t);
    const impact = impactAtSector(sec, allocation) * maturity;
    const value = impact * sec.proxyValue;
    const discounted = value * discountFactor(TIME_YEARS[t]);
    cumulativeValue += discounted;
  }
  const deadweightAdjusted = cumulativeValue * (1 - sec.deadweight);
  return deadweightAdjusted / allocation;
}

function computeGDPFlow(
  sec: SectorParams,
  allocation: number,
  year: number
): { direct: number; indirect: number; induced: number; total: number } {
  if (allocation <= 0)
    return { direct: 0, indirect: 0, induced: 0, total: 0 };
  const yi = yearIndex(year);
  const maturity = maturityAtYear(sec, yi);
  const direct = allocation * maturity;
  const indirect = direct * sec.multIndirect;
  const induced = direct * sec.multInduced;
  return { direct, indirect, induced, total: direct + indirect + induced };
}

function computeJobs(
  sec: SectorParams,
  allocation: number,
  year: number
): number {
  if (allocation <= 0) return 0;
  const yi = yearIndex(year);
  const maturity = maturityAtYear(sec, yi);
  const directJobs = (allocation / 1_000_000) * sec.jobsPerMillion;
  const totalMultiplier =
    1 + sec.multIndirect * 0.6 + sec.multInduced * 0.4;
  return directJobs * totalMultiplier * maturity;
}

function computeRisk(
  amounts: Record<SectorId, number>
): { portfolio: number; sectorRisks: Record<SectorId, number> } {
  const total = sumRecord(amounts);
  const sectorRisks = {} as Record<SectorId, number>;
  let variance = 0;

  for (const sec of SECTORS) {
    const w = total > 0 ? amounts[sec.id] / total : 0;
    sectorRisks[sec.id] = sec.sigma * w;
    variance += Math.pow(w * sec.sigma, 2);
  }

  for (const sec of SECTORS) {
    for (const sec2 of SECTORS) {
      if (sec.id !== sec2.id) {
        const w1 = total > 0 ? amounts[sec.id] / total : 0;
        const w2 = total > 0 ? amounts[sec2.id] / total : 0;
        const rho = 0.3;
        variance += w1 * w2 * sec.sigma * sec2.sigma * rho;
      }
    }
  }

  return { portfolio: Math.sqrt(variance), sectorRisks };
}

function computeResilience(
  amounts: Record<SectorId, number>,
  risk: { portfolio: number },
  financialSustainability: number
) {
  const total = sumRecord(amounts);
  const weights = SECTORS.map((s) =>
    total > 0 ? amounts[s.id] / total : 1 / SECTORS.length
  );
  const hhi = weights.reduce((s, w) => s + w * w, 0);
  const diversification = 1 - hhi;

  const shockRetention = Math.max(0, 1 - risk.portfolio * 2.5);

  const allocatedCount = SECTORS.filter((s) => amounts[s.id] > 0).length;
  const timeBalance = allocatedCount / SECTORS.length;

  const R =
    100 *
    (0.30 * diversification +
      0.35 * shockRetention +
      0.20 * financialSustainability +
      0.15 * timeBalance);

  return {
    total: clamp(R, 0, 100),
    breakdown: {
      diversification: clamp(diversification * 100, 0, 100),
      shockRetention: clamp(shockRetention * 100, 0, 100),
      financialSustainability: clamp(financialSustainability * 100, 0, 100),
      timeBalance: clamp(timeBalance * 100, 0, 100),
    },
  };
}

function computeEquity(
  amounts: Record<SectorId, number>
): number {
  const total = sumRecord(amounts);
  if (total === 0) return 0;
  const sectorShares = SECTORS.map((s) => amounts[s.id] / total);
  const equalShare = 1 / SECTORS.length;
  const gini =
    sectorShares.reduce(
      (s, share) => s + Math.abs(share - equalShare),
      0
    ) / (2 * equalShare * SECTORS.length);
  return clamp(1 - gini, 0, 1);
}

function computeOpportunityCost(
  amounts: Record<SectorId, number>,
): Record<SectorId, number> {
  const total = sumRecord(amounts);
  const opportunityCost = {} as Record<SectorId, number>;
  for (const sec of SECTORS) {
    const currentImpact = impactAtSector(sec, amounts[sec.id]);
    const fullImpact = impactAtSector(sec, total);
    opportunityCost[sec.id] = Math.max(0, fullImpact - currentImpact);
  }
  return opportunityCost;
}

export function computeOptimalAllocation(
  weights: ObjectiveWeights
): Record<SectorId, number> {
  const allocation = {} as Record<SectorId, number>;
  const step = 1_000_000;
  let remaining = BUDGET;
  for (const sec of SECTORS) allocation[sec.id] = 0;

  while (remaining >= step) {
    let bestSector = SECTORS[0].id;
    let bestScore = -Infinity;

    for (const sec of SECTORS) {
      const testAmount = allocation[sec.id] + step;
      const effScore = impactAtSector(sec, testAmount);
      const impactScore = computeSROI(sec, testAmount, 10);
      const eqScore = computeEquity({
        ...allocation,
        [sec.id]: allocation[sec.id] + step,
      });

      const weighted =
        weights.efficiency * (effScore / 100) +
        weights.social_impact * impactScore +
        weights.equity * eqScore +
        weights.sustainability * 0.5 +
        weights.resilience * 0.5;

      if (weighted > bestScore) {
        bestScore = weighted;
        bestSector = sec.id;
      }
    }

    allocation[bestSector] += step;
    remaining -= step;
  }

  return allocation;
}

function applyShocks(
  amounts: Record<SectorId, number>,
  activeShocks: ShockId[]
): Record<SectorId, number> {
  const shocked = { ...amounts };
  for (const shockId of activeShocks) {
    const shock = SHOCK_MAP[shockId];
    if (!shock) continue;
    for (const sec of SECTORS) {
      const mult = shock.sectorMultipliers[sec.id] ?? 1.0;
      shocked[sec.id] *= mult;
    }
  }
  return shocked;
}

export function computeAll(
  amounts: Record<SectorId, number>,
  year: number,
  _weights: ObjectiveWeights = DEFAULT_WEIGHTS,
  activeShocks: ShockId[] = []
): ComputedResults {
  const shockedAmounts = applyShocks(amounts, activeShocks);

  const impact = {} as Record<SectorId, number>;
  const sroi = {} as Record<SectorId, number>;
  const sroiTimeSeries = {} as Record<SectorId, number[]>;
  const impactTimeSeries = {} as Record<SectorId, number[]>;
  const directGDP = {} as Record<SectorId, number>;
  const indirectGDP = {} as Record<SectorId, number>;
  const inducedGDP = {} as Record<SectorId, number>;
  const totalMultiplier = {} as Record<SectorId, number>;
  const jobs = {} as Record<SectorId, number>;

  for (const sec of SECTORS) {
    impact[sec.id] = impactAtSector(sec, shockedAmounts[sec.id]);
    sroi[sec.id] = computeSROI(sec, shockedAmounts[sec.id], year);
    jobs[sec.id] = computeJobs(sec, shockedAmounts[sec.id], year);

    const gdp = computeGDPFlow(sec, shockedAmounts[sec.id], year);
    directGDP[sec.id] = gdp.direct;
    indirectGDP[sec.id] = gdp.indirect;
    inducedGDP[sec.id] = gdp.induced;
    totalMultiplier[sec.id] = gdp.direct > 0 ? gdp.total / gdp.direct : 0;

    impactTimeSeries[sec.id] = TIME_YEARS.map((t) =>
      impactAtSector(sec, shockedAmounts[sec.id]) * maturityAtYear(sec, yearIndex(t))
    );
    sroiTimeSeries[sec.id] = TIME_YEARS.map((t) =>
      computeSROI(sec, shockedAmounts[sec.id], t)
    );
  }

  const risk = computeRisk(shockedAmounts);
  const finSus = 0.5;
  const resilience = computeResilience(shockedAmounts, risk, finSus);
  const equityIndex = computeEquity(shockedAmounts);
  const opportunityCost = computeOpportunityCost(amounts);

  return {
    impact,
    impactTimeSeries,
    sroi,
    sroiTimeSeries,
    directGDP,
    indirectGDP,
    inducedGDP,
    totalMultiplier,
    jobs,
    risk,
    resilience: resilience.total,
    resilienceBreakdown: resilience.breakdown,
    equityIndex,
    totalImpact: sumRecord(impact),
    totalGDP: sumRecord(directGDP) + sumRecord(indirectGDP) + sumRecord(inducedGDP),
    totalJobs: sumRecord(jobs),
    opportunityCost,
  };
}

export function computeFrontier(
  weights: ObjectiveWeights
): { label: string; amounts: Record<SectorId, number>; impact: number; risk: number }[] {
  const frontier = [];
  const points = 20;

  for (let i = 0; i <= points; i++) {
    const eqW = i / points;
    const effW = weights.efficiency * (1 - eqW);
    const rawSum = effW + weights.social_impact + eqW + weights.sustainability + weights.resilience;
    const scale = rawSum > 0 ? 1 / rawSum : 1;
    const adjustedWeights: ObjectiveWeights = {
      efficiency: effW * scale,
      social_impact: weights.social_impact * scale,
      equity: eqW * scale,
      sustainability: weights.sustainability * scale,
      resilience: weights.resilience * scale,
    };
    const amounts = computeOptimalAllocation(adjustedWeights);
    const results = computeAll(amounts, 10, adjustedWeights);
    frontier.push({
      label: `EQ${Math.round(eqW * 100)}`,
      amounts,
      impact: results.totalImpact,
      risk: results.risk.portfolio,
    });
  }

  return frontier;
}

export function computeOptimal(
  amounts: Record<SectorId, number>,
  weights: ObjectiveWeights
): {
  optimal: Record<SectorId, number>;
  comparison: {
    myImpact: number;
    optImpact: number;
    myRisk: number;
    optRisk: number;
    myResilience: number;
    optResilience: number;
  };
} {
  const optimal = computeOptimalAllocation(weights);
  const myResults = computeAll(amounts, 10, weights);
  const optResults = computeAll(optimal, 10, weights);

  return {
    optimal,
    comparison: {
      myImpact: myResults.totalImpact,
      optImpact: optResults.totalImpact,
      myRisk: myResults.risk.portfolio,
      optRisk: optResults.risk.portfolio,
      myResilience: myResults.resilience,
      optResilience: optResults.resilience,
    },
  };
}

export function computeSensitivity(
  amounts: Record<SectorId, number>,
  year: number
): { param: string; delta: number; resultImpact: number }[] {
  const results: { param: string; delta: number; resultImpact: number }[] = [];
  const deltas = [-0.10, 0.10];

  for (const sec of SECTORS) {
    for (const delta of deltas) {
      const modified = { ...amounts };
      modified[sec.id] *= 1 + delta;
      const r = computeAll(modified, year);
      results.push({
        param: `${sec.nameEn} allocation`,
        delta,
        resultImpact: r.totalImpact,
      });
    }
  }

  return results;
}

export function computeStressTest(
  amounts: Record<SectorId, number>,
  year: number,
  shockId: ShockId
): {
  before: ComputedResults;
  after: ComputedResults;
  delta: {
    impact: number;
    jobs: number;
    resilience: number;
    gdp: number;
  };
} {
  const before = computeAll(amounts, year);
  const after = computeAll(amounts, year, DEFAULT_WEIGHTS, [shockId]);
  return {
    before,
    after,
    delta: {
      impact: after.totalImpact - before.totalImpact,
      jobs: after.totalJobs - before.totalJobs,
      resilience: after.resilience - before.resilience,
      gdp: after.totalGDP - before.totalGDP,
    },
  };
}

export function generatePolicyBrief(
  amounts: Record<SectorId, number>,
  year: number,
  weights: ObjectiveWeights
): string {
  const results = computeAll(amounts, year, weights);
  const total = Object.values(amounts).reduce((s, v) => s + v, 0);

  let brief = "# POLICY BRIEF — ATHAR | أثر\n\n";
  brief += "## Allocation Summary\n\n";
  brief += `Total Budget: ${total.toLocaleString()} SAR\n\n`;
  brief += "| Sector | Allocation | % |\n|---|---|---|\n";

  for (const sec of SECTORS) {
    const pct = total > 0 ? ((amounts[sec.id] / total) * 100).toFixed(1) : "0.0";
    brief += `| ${sec.nameEn} | ${amounts[sec.id].toLocaleString()} SAR | ${pct}% |\n`;
  }

  brief += "\n## Expected Impact\n\n";
  brief += `- Total Impact Score: ${results.totalImpact.toFixed(1)}\n`;
  brief += `- Total GDP Flow: ${results.totalGDP.toLocaleString()} SAR\n`;
  brief += `- Total Jobs: ${results.totalJobs.toFixed(0)}\n`;
  brief += `- Resilience Score: ${results.resilience.toFixed(1)}\n`;
  brief += `- Equity Index: ${(results.equityIndex * 100).toFixed(1)}\n`;

  brief += "\n## Risk Profile\n\n";
  brief += `- Portfolio Risk (σ): ${(results.risk.portfolio * 100).toFixed(1)}%\n`;

  brief += "\n## Methodology\n\n";
  brief += "Simulation based on stated assumptions and available evidence.\n";
  brief += "All parameters are documented in the Model Transparency panel.\n";
  brief += "SROI values are allocation-dependent due to diminishing marginal returns.\n";

  return brief;
}

export function computeDiminishingCurve(
  sec: SectorParams,
  maxAllocation: number = BUDGET,
  steps: number = 20
): { allocation: number; impact: number; marginalImpact: number }[] {
  const curve = [];
  const stepSize = maxAllocation / steps;
  let prevImpact = 0;

  for (let i = 0; i <= steps; i++) {
    const allocation = i * stepSize;
    const impact = impactAtSector(sec, allocation);
    const marginalImpact = i > 0 ? impact - prevImpact : impact;
    curve.push({ allocation, impact, marginalImpact });
    prevImpact = impact;
  }

  return curve;
}

export function computeOpportunityCostBreakdown(
  amounts: Record<SectorId, number>
): {
  sector: SectorId;
  currentAllocation: number;
  currentImpact: number;
  fullAllocImpact: number;
  lostImpact: number;
  gainIfRedirected: number;
}[] {
  const total = Object.values(amounts).reduce((s, v) => s + v, 0);
  const unallocatedSectors = SECTORS.filter((s) => amounts[s.id] === 0);

  const breakdown = SECTORS.map((sec) => {
    const currentImpact = impactAtSector(sec, amounts[sec.id]);
    const fullAllocImpact = impactAtSector(sec, total);
    const lostImpact = fullAllocImpact - currentImpact;

    const gainIfRedirected = unallocatedSectors.length > 0
      ? impactAtSector(sec, amounts[sec.id] + total / unallocatedSectors.length) - currentImpact
      : 0;

    return {
      sector: sec.id,
      currentAllocation: amounts[sec.id],
      currentImpact,
      fullAllocImpact,
      lostImpact,
      gainIfRedirected,
    };
  });

  return breakdown;
}
