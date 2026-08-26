export type EvidenceTier = "VERIFIED" | "CASE_STUDY" | "ESTIMATE" | "SIM_ASSUMPTION";

export interface Evidence {
  source: string;
  year: number;
  method: string;
  unit: string;
  tier: EvidenceTier;
  url?: string;
}

export type SectorId =
  | "education"
  | "healthcare"
  | "housing"
  | "employment"
  | "women_empowerment"
  | "environment"
  | "community";

export interface SectorParams {
  id: SectorId;
  nameEn: string;
  nameAr: string;
  icon: string;
  impactUnit: string;
  theta: number;
  thetaEvidence: Evidence;
  maturityCurve: number[];
  maturityEvidence: Evidence;
  proxyValue: number;
  proxyValueEvidence: Evidence;
  deadweight: number;
  deadweightEvidence: Evidence;
  multIndirect: number;
  multIndirectEvidence: Evidence;
  multInduced: number;
  multInducedEvidence: Evidence;
  jobsPerMillion: number;
  jobsPerMillionEvidence: Evidence;
  sigma: number;
  sigmaEvidence: Evidence;
}

export type ObjectiveId =
  | "efficiency"
  | "social_impact"
  | "equity"
  | "sustainability"
  | "resilience";

export interface ObjectiveWeights {
  efficiency: number;
  social_impact: number;
  equity: number;
  sustainability: number;
  resilience: number;
}

export type ShockId =
  | "inflation"
  | "funding_cut"
  | "downturn"
  | "employment_shock"
  | "service_disruption";

export interface ShockParams {
  id: ShockId;
  nameEn: string;
  nameAr: string;
  description: string;
  sectorMultipliers: Partial<Record<SectorId, number>>;
  costMultiplier: number;
  fundingCutShare: Record<string, number>;
}

export interface AllocationState {
  amounts: Record<SectorId, number>;
  year: 0 | 1 | 3 | 5 | 10;
  weights: ObjectiveWeights;
  activeShocks: ShockId[];
  snapshots: AllocationSnapshot[];
}

export interface AllocationSnapshot {
  label: string;
  amounts: Record<SectorId, number>;
  year: 0 | 1 | 3 | 5 | 10;
  timestamp: number;
}

export interface ComputedResults {
  impact: Record<SectorId, number>;
  impactTimeSeries: Record<SectorId, number[]>;
  sroi: Record<SectorId, number>;
  sroiTimeSeries: Record<SectorId, number[]>;
  directGDP: Record<SectorId, number>;
  indirectGDP: Record<SectorId, number>;
  inducedGDP: Record<SectorId, number>;
  totalMultiplier: Record<SectorId, number>;
  jobs: Record<SectorId, number>;
  risk: { portfolio: number; sectorRisks: Record<SectorId, number> };
  resilience: number;
  resilienceBreakdown: {
    diversification: number;
    shockRetention: number;
    financialSustainability: number;
    timeBalance: number;
  };
  equityIndex: number;
  totalImpact: number;
  totalGDP: number;
  totalJobs: number;
  opportunityCost: Record<SectorId, number>;
}

export const BUDGET = 100_000_000;
export const DISCOUNT_RATE = 0.03;
export const TIME_YEARS = [0, 1, 3, 5, 10] as const;
