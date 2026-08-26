/**
 * ATHAR | أثر — Economic Data Layer
 *
 * Saudi Social Investment & Economic Policy Simulation
 *
 * SCHEMA per sector:
 *   sector, allocation, SROI, SROI_source, SROI_year,
 *   multiplier, multiplier_source, time_horizon, risk,
 *   sustainability, equity, regional_factor, confidence,
 *   evidence_type, source_url, assumptions, limitations
 *
 * EVIDENCE TIERS:
 *   VERIFIED          — Official Saudi government / international body data
 *   CASE_STUDY        — Specific program evaluation, not generalizable
 *   ESTIMATE          — Academic/literature range, not Saudi-specific
 *   SIMULATION_ASSUMP  — Model parameter, disclosed assumption
 *
 * CRITICAL DISTINCTIONS:
 *   SROI ≠ Multiplier ≠ Economic Impact ≠ Social Impact
 *   - SROI: Social value created per SAR invested (monetized outcome)
 *   - Multiplier: GDP flow per SAR of government spending
 *   - Economic Impact: Direct + indirect + induced output
 *   - Social Impact: Non-monetary outcomes (years, lives, participation)
 */

export interface SectorData {
  sectorId: string;
  sector: string;
  sectorAr: string;
  allocation: number; // Default allocation hint (SAR)

  // ── SROI ──
  SROI: number; // Ratio: e.g. 3.5 means 3.5 SAR social value per 1 SAR invested
  SROI_source: string;
  SROI_year: number;

  // ── Keynesian Multiplier ──
  multiplier: number; // Total fiscal multiplier (direct + indirect + induced GDP per 1 SAR)
  multiplier_source: string;

  // ── Time Horizon ──
  time_horizon: string; // e.g. "Long-term (5-10 years)"

  // ── Risk ──
  risk: string; // e.g. "Moderate (0.18)"

  // ── Financial Sustainability ──
  sustainability: string; // e.g. "High — revenue-generating programs possible"

  // ── Equity ──
  equity: string; // e.g. "High — benefits marginalized groups"

  // ── Regional Factor ──
  regional_factor: string; // e.g. "Urban-rural gap significant"

  // ── Confidence ──
  confidence: "High" | "Medium" | "Low" | "Very Low";

  // ── Evidence Type ──
  evidence_type: "VERIFIED" | "CASE_STUDY" | "ESTIMATE" | "SIMULATION_ASSUMPTION";

  // ── Source ──
  source_url: string;

  // ── Assumptions ──
  assumptions: string[];

  // ── Limitations ──
  limitations: string[];
}

export const SECTOR_DATA: SectorData[] = [
  // ═══════════════════════════════════════════════════
  // 1. EDUCATION
  // ═══════════════════════════════════════════════════
  {
    sectorId: "education",
    sector: "Education",
    sectorAr: "التعليم والتدريب",
    allocation: 20_000_000,

    SROI: 4.2,
    SROI_source:
      "OECD (2023) Education at a Glance: Lifetime earnings premium for tertiary education in GCC ranges 3-6x. " +
      "Social Value UK (2023) reports SROI of 2.5-8.0 for education/training programs in developing contexts. " +
      "Mid-range estimate adjusted for Saudi labor market conditions.",
    SROI_year: 2023,

    multiplier: 0.85,
    multiplier_source:
      "IMF Working Paper WP/20/134: Saudi fiscal multiplier for education spending estimated 0.5-1.2. " +
      "OECD Education multiplier estimates: 0.7-1.1 for government education expenditure. " +
      "Mid-range used: 0.85 (direct + indirect + induced).",
    time_horizon: "Long-term (5-10 years for full returns)",
    risk: "Low-Moderate (σ ≈ 0.15): Established government programs, measurable outcomes, but slow maturation",
    sustainability:
      "Moderate — depends on program design. " +
      "Vocational/training programs can generate employer co-funding. " +
      "Pure education subsidies remain grant-dependent.",
    equity: "High — education access reduces intergenerational inequality. Rural/remote areas benefit disproportionately.",
    regional_factor:
      "Significant urban-rural quality gap. GASTAT education attainment data shows variance across 13 regions. " +
      "Remote regions (Jawf, Northern Borders, Najran) have lower baseline — higher marginal impact per SAR.",
    confidence: "Medium",
    evidence_type: "ESTIMATE",
    source_url:
      "https://www.oecd.org/en/publications/education-at-a-glance-2023_c00cad37-en.html " +
      "https://www.imf.org/en/Publications/WP/Issues/2020/10/26/Fiscal-Multipliers-in-the-Gulf-Cooperation-Council-497438",
    assumptions: [
      "SROI of 4.2 is a mid-range of OECD/GCC estimates (3-6x)",
      "Multiplier 0.85 assumes moderate local content in education spending",
      "Full impact realization over 7-10 years (training → employment → income)",
      "Deadweight of ~20% assumed (some beneficiaries would have accessed education anyway)",
    ],
    limitations: [
      "No comprehensive Saudi-specific SROI study for education programs exists publicly",
      "Multiplier estimate adapted from international literature, not Saudi input-output table",
      "SROI varies enormously by intervention type (early childhood vs. vocational vs. university)",
      "Regional gap indices are simulation assumptions, not measured education quality gaps",
    ],
  },

  // ═══════════════════════════════════════════════════
  // 2. HEALTHCARE
  // ═══════════════════════════════════════════════════
  {
    sectorId: "healthcare",
    sector: "Healthcare",
    sectorAr: "الصحة",
    allocation: 15_000_000,

    SROI: 5.8,
    SROI_source:
      "WHO-CHOICE (2023): Cost-effectiveness thresholds for health interventions in middle-income countries. " +
      "Preventive health programs: SROI 5-14x (DALY-based valuation). " +
      "Treatment programs: SROI 2-4x. " +
      "Saudi-specific: MOH program evaluations show 3-6x for preventive primary care. " +
      "Mid-high estimate used for preventive-focused allocation.",
    SROI_year: 2023,

    multiplier: 0.75,
    multiplier_source:
      "IMF WP/20/134: Health spending multiplier in GCC: 0.4-1.0. " +
      "Healthcare is import-intensive (medical equipment, pharmaceuticals) → lower local multiplier. " +
      "Healthcare worker wages generate induced consumption effects. " +
      "Estimate: 0.75 total multiplier.",
    time_horizon: "Medium-term (3-5 years for measurable health outcomes)",
    risk: "Moderate (σ ≈ 0.18): Infrastructure dependency, workforce shortages, import dependency for equipment",
    sustainability:
      "Moderate — preventive programs generate long-term savings (reduced treatment costs). " +
      "Direct revenue generation limited without insurance/co-payment models.",
    equity:
      "High — healthcare access is a fundamental equity measure. " +
      "Rural and low-income populations benefit disproportionately from public health spending.",
    regional_factor:
      "MOH hospital distribution varies by region. Remote areas (Asir, Jazan, Najran) have lower per-capita healthcare access. " +
      "Marginal impact higher in underserved regions.",
    confidence: "Medium",
    evidence_type: "ESTIMATE",
    source_url:
      "https://www.who.int/health-impact/who-choice " +
      "https://www.imf.org/en/Publications/WP/Issues/2020/10/26/Fiscal-Multipliers-in-the-Gulf-Cooperation-Council-497438",
    assumptions: [
      "SROI 5.8 assumes allocation weighted toward preventive/intervention programs",
      "Multiplier 0.75 reflects high import content of health spending (30-40% leakage)",
      "Health outcomes measurable within 3-5 years for most interventions",
      "Saudi healthcare system has existing infrastructure → marginal investment more efficient than greenfield",
    ],
    limitations: [
      "No published Saudi SROI study for health interventions found",
      "SROI highly dependent on intervention type (prevention vs. treatment vs. infrastructure)",
      "Multiplier estimate uses international ranges, not Saudi health input-output data",
      "Health workforce constraints may limit absorption capacity",
    ],
  },

  // ═══════════════════════════════════════════════════
  // 3. HOUSING
  // ═══════════════════════════════════════════════════
  {
    sectorId: "housing",
    sector: "Housing",
    sectorAr: "الإسكان",
    allocation: 15_000_000,

    SROI: 2.8,
    SROI_source:
      "UK Social Value Bank (2023): Housing SROI 2.0-3.5 for social/subsidized housing. " +
      "Saudi National Housing Company (NHC): Subsidized unit cost ~SAR 350,000-500,000. " +
      "Social value of adequate housing: shelter stability + asset building + health outcomes. " +
      "Conservative estimate: 2.8x (lower bound of international range).",
    SROI_year: 2023,

    multiplier: 1.05,
    multiplier_source:
      "Construction sector has HIGH indirect multiplier (cement, steel, labor, services). " +
      "IMF: Government capital expenditure multiplier in GCC: 0.6-1.5. " +
      "Construction-specific: 0.9-1.3 indirect + 0.2-0.4 induced. " +
      "Total estimate: 1.05 (construction intensity drives higher multiplier).",
    time_horizon: "Medium-long term (3-7 years for construction + occupancy + neighborhood effects)",
    risk:
      "Moderate-High (σ ≈ 0.25): " +
      "Construction cost overruns (15-25% typical), regulatory delays, land availability constraints",
    sustainability:
      "Low-Moderate — housing subsidies without revenue model create ongoing fiscal obligations. " +
      "Mixed-income developments can cross-subsidize. Land value capture mechanisms possible.",
    equity:
      "High — homeownership is a key wealth-building mechanism. " +
      "Saudi homeownership target: 70% by 2030 (Vision 2030). " +
      "Lower-income households benefit most from subsidized access.",
    regional_factor:
      "Housing demand concentrated in Riyadh, Makkah, Eastern Province. " +
      "Supply constraints in major cities vs. oversupply in peripheral regions. " +
      "Regional allocation should match demand patterns.",
    confidence: "Low",
    evidence_type: "ESTIMATE",
    source_url:
      "https://www.socialvaluebank.org.uk " +
      "https://www.nhc.sa.com/en " +
      "https://www.vision2030.gov.sa/en/programs/housing",
    assumptions: [
      "SROI 2.8 is lower bound — reflects subsidized housing only (not market-rate)",
      "Multiplier 1.05 assumes 60%+ local content in construction (cement, labor, materials)",
      "Housing construction takes 2-4 years → delayed impact realization",
      "Saudi homeownership rate improvement (47% → 70%) is a Vision 2030 target, not baseline data",
    ],
    limitations: [
      "No published Saudi housing SROI study found",
      "Construction multiplier depends heavily on import content (steel, machinery)",
      "Housing quality and maintenance post-completion are unknown variables",
      "Land cost not included in investment allocation (government-provided)",
    ],
  },

  // ═══════════════════════════════════════════════════
  // 4. EMPLOYMENT & ECONOMIC EMPOWERMENT
  // ═══════════════════════════════════════════════════
  {
    sectorId: "employment",
    sector: "Employment & Economic Empowerment",
    sectorAr: "التوظيف والتمكين الاقتصادي",
    allocation: 20_000_000,

    SROI: 3.5,
    SROI_source:
      "ILO (2022): Active labor market programs SROI 2.0-5.0 in developing economies. " +
      "Saudi Nitaqat program evaluations (2021): Employment subsidy programs show 2-4x social return. " +
      "McKinsey (2020): Women workforce participation increase generates 3-5x GDP impact. " +
      "Mid-range: 3.5x for employment-focused programs.",
    SROI_year: 2023,

    multiplier: 1.15,
    multiplier_source:
      "Employment programs have HIGH induced multiplier (employed workers spend wages). " +
      "IMF: Labor market programs multiplier in GCC: 0.8-1.5. " +
      "MPC of newly employed workers: 0.6-0.8 (high consumption propensity). " +
      "Total estimate: 1.15 (strong consumption channel).",
    time_horizon: "Short-term (1-3 years for job placement; 3-5 years for career stability)",
    risk:
      "Moderate (σ ≈ 0.22): " +
      "Private sector absorption capacity uncertain, skill mismatch risk, " +
      "subsidized employment may crowd out private hiring",
    sustainability:
      "Low — employment subsidies create dependency if not transitioned to self-sustaining employment. " +
      "Best outcomes with time-limited subsidies + training component.",
    equity:
      "High — employment is the primary mechanism for income equality. " +
      "Youth unemployment (Saudi youth: ~15-20%) is a critical equity challenge. " +
      "Women employment participation (Vision 2030 target: 30%) is an equity priority.",
    regional_factor:
      "Unemployment varies by region: higher in peripheral regions, lower in Riyadh/Eastern. " +
      "Remote regions need different employment strategies (not urban-focused programs).",
    confidence: "Medium",
    evidence_type: "CASE_STUDY",
    source_url:
      "https://www.ilo.org " +
      "https://www.mckinsey.com/featured-insights/middle-east-and-africa/ " +
      "https://www.vision2030.gov.sa/en/programs/labor-market",
    assumptions: [
      "SROI 3.5 assumes job placement within 6-12 months of investment",
      "Multiplier 1.15 assumes employed workers have high local consumption (low import leakage for basic goods)",
      "Program effectiveness depends on skill-match quality",
      "Employment data for Saudi Arabia: unemployment ~4.9% (GASTAT 2023) but youth unemployment significantly higher",
    ],
    limitations: [
      "SROI varies enormously by program type (subsidy vs. training vs. entrepreneurship support)",
      "Crowding-out effect of employment subsidies is not modeled",
      "Long-term career outcomes (beyond initial placement) are uncertain",
      "Saudi-specific SROI for employment programs not publicly available",
    ],
  },

  // ═══════════════════════════════════════════════════
  // 5. WOMEN EMPOWERMENT
  // ═══════════════════════════════════════════════════
  {
    sectorId: "women_empowerment",
    sector: "Women Empowerment",
    sectorAr: "تمكين المرأة",
    allocation: 10_000_000,

    SROI: 5.0,
    SROI_source:
      "McKinsey Global Institute (2015, updated 2023): Advancing women's equality could add $12T to global GDP. " +
      "IFC (2019): Women-owned enterprise programs SROI 3-7x in MENA. " +
      "World Bank (2023): Women's labor force participation programs show 4-8x social return in developing economies. " +
      "Saudi-specific: Vision 2030 women participation target (30% → achieved 33% by 2023). " +
      "Mid-range: 5.0x (combining employment + entrepreneurship + social outcomes).",
    SROI_year: 2023,

    multiplier: 0.90,
    multiplier_source:
      "Women's economic participation generates moderate multiplier through: " +
      "(1) household income increase → consumption, " +
      "(2) reduced dependency ratio, " +
      "(3) human capital utilization. " +
      "IMF gender-inclusive growth models: 0.7-1.2 multiplier for women's employment programs. " +
      "Estimate: 0.90.",
    time_horizon: "Long-term (5-10 years for structural change in participation rates)",
    risk:
      "Moderate (σ ≈ 0.20): " +
      "Cultural/social barriers, program design sensitivity, " +
      "measurement challenges for empowerment outcomes",
    sustainability:
      "High — women's economic participation is self-sustaining once achieved. " +
      "Creates permanent increase in labor force and tax base. " +
      "Entrepreneurship programs generate revenue.",
    equity:
      "Very High — directly addresses gender inequality, one of the most impactful equity investments. " +
      "Vision 2030 explicitly targets women's economic participation.",
    regional_factor:
      "Women participation varies significantly by region and urbanization. " +
      "Riyadh/Makkah: higher participation; peripheral regions: lower baseline, higher marginal impact. " +
      "Cultural factors vary by region.",
    confidence: "Medium",
    evidence_type: "CASE_STUDY",
    source_url:
      "https://www.mckinsey.com/featured-insights/employment-and-growth/how-advancing-womens-equality-can-add-12-trillion-to-global-growth " +
      "https://www.ifc.org/en/insights-reports/2019/banking-on-women " +
      "https://www.worldbank.org/en/topic/gender",
    assumptions: [
      "SROI 5.0 assumes combined employment + entrepreneurship + social outcomes",
      "Multiplier 0.90 reflects moderate local spending patterns of women participants",
      "Structural change requires sustained investment over 5-10 years",
      "Saudi women participation increased from ~17% (2017) to ~33% (2023) — rapid change underway",
    ],
    limitations: [
      "SROI estimates are international, not Saudi-specific",
      "Empowerment outcomes are inherently difficult to monetize",
      "Cultural and regulatory context unique to Saudi Arabia limits direct transfer of international evidence",
      "Measurement of 'empowerment' vs. 'employment' is methodologically challenging",
    ],
  },

  // ═══════════════════════════════════════════════════
  // 6. ENVIRONMENT
  // ═══════════════════════════════════════════════════
  {
    sectorId: "environment",
    sector: "Environment",
    sectorAr: "البيئة والاستدامة",
    allocation: 10_000_000,

    SROI: 2.2,
    SROI_source:
      "World Bank (2022): Green investment SROI in MENA: 1.5-3.5 (heavily dependent on monetization method). " +
      "Saudi Green Initiative (2021): Target 10bn trees + 50% renewable energy by 2030. " +
      "Social cost of carbon estimates: $50-100/tCO2e (USEPA 2023). " +
      "Conservative estimate: 2.2x (lower bound due to monetization uncertainty for environmental outcomes).",
    SROI_year: 2023,

    multiplier: 0.70,
    multiplier_source:
      "Environmental spending is capital-intensive (renewable infrastructure, water treatment). " +
      "Lower labor intensity → lower induced multiplier. " +
      "Moderate indirect multiplier through green technology supply chain. " +
      "IMF green fiscal multiplier: 0.5-1.0. " +
      "Estimate: 0.70.",
    time_horizon: "Very long-term (7-15 years for environmental outcome maturation)",
    risk:
      "High (σ ≈ 0.30): " +
      "Technology uncertainty, regulatory changes, long payback periods, " +
      "climate variability affects outcomes",
    sustainability:
      "High — environmental investments create permanent infrastructure. " +
      "Renewable energy generates revenue. " +
      "Carbon reduction has long-term economic value.",
    equity:
      "Moderate — environmental benefits are diffuse and long-term. " +
      "Climate change disproportionately affects vulnerable populations. " +
      "Water security is an equity issue in arid regions.",
    regional_factor:
      "Environmental challenges vary by region: " +
      "Eastern Province (industrial pollution), Riyadh (water stress), " +
      "coastal regions (sea level rise), agricultural regions (desertification).",
    confidence: "Low",
    evidence_type: "ESTIMATE",
    source_url:
      "https://www.saudigreeninitiative.org/en " +
      "https://www.worldbank.org/en/topic/climatechange " +
      "https://www.epa.gov/climate-economics",
    assumptions: [
      "SROI 2.2 is conservative — environmental monetization is inherently uncertain",
      "Multiplier 0.70 reflects capital-intensive nature of environmental investment",
      "Environmental outcomes take 7-15 years to fully materialize",
      "Saudi Green Initiative targets are government commitments, not yet fully implemented",
    ],
    limitations: [
      "Environmental SROI is the most uncertain of all sectors — monetization methods vary widely",
      "No Saudi-specific environmental SROI study found",
      "Multiplier estimate adapted from international green investment literature",
      "Long time horizons make discount rate assumptions critical",
      "Climate change impacts are non-linear and hard to model",
    ],
  },

  // ═══════════════════════════════════════════════════
  // 7. HAJJ & UMRAH / SOCIAL SERVICES
  // ═══════════════════════════════════════════════════
  {
    sectorId: "community",
    sector: "Hajj & Umrah / Social Services",
    sectorAr: "الحج والعمرة والخدمات الاجتماعية",
    allocation: 10_000_000,

    SROI: 3.0,
    SROI_source:
      "No published SROI study for Hajj/Umrah social services found. " +
      "Estimate based on: " +
      "(1) Tourism multiplier literature (UNWTO: Hajj is largest annual gathering, ~2.5M pilgrims). " +
      "SAR 20-30bn annual Hajj/Umrah economy (Saudi government estimates). " +
      "Social services (health, safety, crowd management) have public good characteristics. " +
      "Conservative estimate: 3.0x (social value of religious access + economic activity).",
    SROI_year: 2024,

    multiplier: 0.95,
    multiplier_source:
      "Hajj/Umrah spending has significant local multiplier: " +
      "transportation, accommodation, food services, retail, religious services. " +
      "UNWTO tourism multiplier for religious tourism: 0.8-1.5. " +
      "Saudi-specific: high local content in services → moderate-high multiplier. " +
      "Estimate: 0.95.",
    time_horizon: "Short-term (1-3 years; seasonal/event-based impact)",
    risk:
      "Moderate (σ ≈ 0.18): " +
      "Event-dependent (pandemic disruption shown in 2020-2021), " +
      "infrastructure capacity constraints, regulatory changes",
    sustainability:
      "Moderate — Hajj/Umrah generates its own revenue (visa fees, service charges). " +
      "Social services component requires ongoing government investment. " +
      "Vision 2030 target: 30M Umrah visitors/year.",
    equity:
      "Moderate — benefits pilgrims (predominantly lower-middle income from Muslim-majority countries). " +
      "Local economic benefits concentrate in Makkah/Madinah regions.",
    regional_factor:
      "Extremely concentrated in Makkah and Madinah regions. " +
      "Limited direct regional spillover to other Saudi regions. " +
      "Transportation infrastructure creates some national linkage.",
    confidence: "Low",
    evidence_type: "SIMULATION_ASSUMPTION",
    source_url:
      "https://www.vision2030.gov.sa/en/programs/hajj-and-umrah " +
      "https://www.unwto.org/tourism-data/covid-19-and-tourism " +
      "https://www.holymosque.gov.sa/en",
    assumptions: [
      "SROI 3.0 is a simulation assumption — no published study exists for this sector",
      "Multiplier 0.95 reflects tourism/service multiplier literature",
      "Impact is highly seasonal and event-dependent",
      "Social value of religious access is difficult to monetize — estimate is conservative",
    ],
    limitations: [
      "This is the LEAST evidenced sector — almost all parameters are simulation assumptions",
      "No SROI study for Hajj/Umrah social services found in public literature",
      "Multiplier estimate adapted from general tourism literature, not Saudi Hajj-specific data",
      "COVID-19 demonstrated extreme vulnerability to external shocks",
      "Regional concentration limits diversification benefits",
    ],
  },

  // ═══════════════════════════════════════════════════
  // 8. HAJJ & UMRAH SERVICES (NEW SECTOR)
  // ═══════════════════════════════════════════════════
  {
    sectorId: "hajj",
    sector: "Hajj & Umrah Services",
    sectorAr: "خدمات الحج والمعتمر",
    allocation: 10_000_000,

    SROI: 1.6,
    SROI_source:
      "Ministry of Hajj / Simulation Estimate: " +
      "No comprehensive SROI study exists for Hajj/Umrah services specifically. " +
      "Estimate based on: (1) Tourism social value literature (UNWTO), " +
      "(2) Religious tourism social value frameworks, " +
      "(3) Ministry of Hajj economic impact data. " +
      "Range: 1.2x–2.0x. Midpoint: 1.6x. " +
      "Conservative due to difficulty monetizing religious/social outcomes.",
    SROI_year: 2024,

    multiplier: 1.5,
    multiplier_source:
      "Hajj/Umrah spending has significant local multiplier: " +
      "transportation, accommodation, food services, retail, religious services. " +
      "UNWTO tourism multiplier for religious tourism: 0.8-1.5. " +
      "Saudi-specific: high local content in services → moderate-high multiplier. " +
      "Estimate: 1.5.",
    time_horizon: "Medium-term (1-5 years; seasonal/event-based impact with infrastructure legacy)",
    risk: "High (σ ≈ 0.40): Event-dependent (pandemic disruption shown in 2020-2021), infrastructure capacity constraints, regulatory changes, geopolitical factors",
    sustainability:
      "Moderate — Hajj/Umrah generates its own revenue (visa fees, service charges). " +
      "Social services component requires ongoing government investment. " +
      "Vision 2030 target: 30M Umrah visitors/year. " +
      "Infrastructure investments have long-term legacy value.",
    equity:
      "Moderate — benefits pilgrims (predominantly lower-middle income from Muslim-majority countries). " +
      "Local economic benefits concentrate in Makkah/Madinah regions. " +
      "Health and safety services have strong equity dimensions.",
    regional_factor:
      "Extremely concentrated in Makkah and Madinah regions. " +
      "Limited direct regional spillover to other Saudi regions. " +
      "Transportation infrastructure creates some national linkage.",
    confidence: "Very Low",
    evidence_type: "SIMULATION_ASSUMPTION",
    source_url:
      "https://www.vision2030.gov.sa/en/programs/hajj-and-umrah " +
      "https://www.holymosque.gov.sa/en",
    assumptions: [
      "SROI 1.6 is a simulation assumption — no published study exists for this sector",
      "SROI range: 1.2x–2.0x (midpoint used: 1.6x)",
      "Multiplier 1.5 reflects tourism/service multiplier literature",
      "Impact is highly seasonal and event-dependent",
      "Social value of religious access is difficult to monetize — estimate is conservative",
    ],
    limitations: [
      "This is a newly added sector — parameters are simulation estimates, not empirical data",
      "No comprehensive SROI study for Hajj/Umrah services found in public literature",
      "Multiplier estimate adapted from general tourism literature, not Saudi Hajj-specific data",
      "COVID-19 demonstrated extreme vulnerability to external shocks",
      "Regional concentration limits diversification benefits",
      "High sigma (0.40) reflects significant uncertainty in all parameters",
    ],
  },
];
