import type { ShockParams, ShockId, SectorId } from "./types";

export const SHOCKS: ShockParams[] = [
  {
    id: "inflation" as ShockId,
    nameEn: "Inflation Shock",
    nameAr: "صدمة التضخم",
    description: "Cost of service delivery increases 20%, reducing real purchasing power of allocated funds",
    sectorMultipliers: {} as Record<SectorId, number>,
    costMultiplier: 1.20,
    fundingCutShare: {},
  },
  {
    id: "funding_cut" as ShockId,
    nameEn: "Funding Cut",
    nameAr: "قص التمويل",
    description: "Government grant component reduced by 30%; impact concentrated on grant-dependent programs",
    sectorMultipliers: {
      education: 0.85,
      healthcare: 0.90,
      housing: 0.75,
      community: 0.80,
      hajj: 0.70,
    } as Record<SectorId, number>,
    costMultiplier: 1.0,
    fundingCutShare: { grant: 0.30 },
  },
  {
    id: "downturn" as ShockId,
    nameEn: "Economic Downturn",
    nameAr: "ركود اقتصادي",
    description: "MPC drops, local demand falls, multiplier effects weakened by 25%",
    sectorMultipliers: {
      employment: 0.70,
      housing: 0.80,
      community: 0.85,
      hajj: 0.75,
    } as Record<SectorId, number>,
    costMultiplier: 1.10,
    fundingCutShare: {},
  },
  {
    id: "employment_shock" as ShockId,
    nameEn: "Employment Shock",
    nameAr: "صدمة سوق العمل",
    description: "Private sector hiring capacity reduced by 35%; job placement rates fall",
    sectorMultipliers: {
      employment: 0.65,
      women_empowerment: 0.80,
      education: 0.90,
      hajj: 0.80,
    } as Record<SectorId, number>,
    costMultiplier: 1.05,
    fundingCutShare: {},
  },
  {
    id: "service_disruption" as ShockId,
    nameEn: "Service Disruption",
    nameAr: "اضطراب الخدمة",
    description: "Pandemic-like scenario: in-person service delivery disrupted by 40%, health demand surges 25%",
    sectorMultipliers: {
      education: 0.60,
      community: 0.55,
      women_empowerment: 0.70,
      hajj: 0.50,
    } as Record<SectorId, number>,
    costMultiplier: 1.25,
    fundingCutShare: {},
  },
];

export const SHOCK_MAP = Object.fromEntries(
  SHOCKS.map((s) => [s.id, s])
) as Record<ShockId, ShockParams>;
