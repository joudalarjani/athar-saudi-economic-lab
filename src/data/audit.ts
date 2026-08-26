/**
 * ATHAR | أثر — Data Audit
 *
 * Generated: August 2026
 * Purpose: Transparent summary of data quality across all sectors
 *
 * METHODOLOGY: All parameters are documented. No numbers are fabricated.
 * Where Saudi-specific data exists, it is used. Where it doesn't,
 * international literature is adapted with clear disclosure.
 */

export const DATA_AUDIT = {
  generated: "2026-08-26",

  // ═══════════════════════════════════════════════════
  // SECTOR-BY-SECTOR AUDIT
  // ═══════════════════════════════════════════════════

  sectors: [
    {
      sector: "Education",
      evidence_quality: "MEDIUM",
      SROI_evidence: "ESTIMATE — Based on OECD (3-6x) and Social Value UK (2.5-8.0) ranges. No Saudi SROI study.",
      multiplier_evidence: "ESTIMATE — IMF WP/20/134 (0.5-1.2 for GCC). Mid-range 0.85 used.",
      key_risk: "SROI could be 2x higher or lower depending on intervention type",
      what_we_know: [
        "GASTAT education data exists (enrollment, attainment)",
        "Vision 2030 targets are published",
        "OECD returns to education data is well-established",
      ],
      what_we_dont_know: [
        "Saudi-specific SROI for education programs",
        "Regional education quality gaps (quantified)",
        "Program-level effectiveness data",
      ],
    },
    {
      sector: "Healthcare",
      evidence_quality: "MEDIUM",
      SROI_evidence: "ESTIMATE — WHO-CHOICE thresholds (5-14x preventive, 2-4x treatment). Adapted for Saudi context.",
      multiplier_evidence: "ESTIMATE — IMF WP/20/134 (0.4-1.0 for GCC). Import-intensive nature reduces multiplier.",
      key_risk: "SROI depends heavily on prevention vs. treatment mix",
      what_we_know: [
        "MOH infrastructure data exists",
        "WHO cost-effectiveness data is robust",
        "Saudi healthcare spending data from budget",
      ],
      what_we_dont_know: [
        "Saudi-specific health intervention SROI",
        "Health workforce capacity constraints (quantified)",
        "Import content of health spending",
      ],
    },
    {
      sector: "Housing",
      evidence_quality: "LOW",
      SROI_evidence: "ESTIMATE — UK Social Value Bank (2.0-3.5). Conservative 2.8x used.",
      multiplier_evidence: "ESTIMATE — Construction sector multiplier literature (0.9-1.3 indirect). High local content.",
      key_risk: "Construction cost overruns and import content of materials",
      what_we_know: [
        "Vision 2030 housing targets (70% ownership)",
        "NHC unit cost data exists",
        "Construction sector multiplier literature",
      ],
      what_we_dont_know: [
        "Saudi housing SROI",
        "Post-completion maintenance outcomes",
        "True local content in construction",
      ],
    },
    {
      sector: "Employment",
      evidence_quality: "MEDIUM",
      SROI_evidence: "CASE_STUDY — ILO range (2.0-5.0). Saudi Nitaqat evaluations (2-4x). Mid-range 3.5x.",
      multiplier_evidence: "ESTIMATE — IMF labor market programs (0.8-1.5). High induced multiplier from wages.",
      key_risk: "Crowding-out effect and skill mismatch",
      what_we_know: [
        "GASTAT unemployment data (4.9% overall, ~15-20% youth)",
        "Nitaqat program exists with some evaluations",
        "ILO employment multiplier literature",
      ],
      what_we_dont_know: [
        "Program-level SROI for Saudi employment programs",
        "Private sector absorption capacity",
        "Long-term career outcomes beyond placement",
      ],
    },
    {
      sector: "Women Empowerment",
      evidence_quality: "MEDIUM",
      SROI_evidence: "CASE_STUDY — McKinsey (3-5x GDP), IFC (3-7x MENA), World Bank (4-8x). Mid-range 5.0x.",
      multiplier_evidence: "ESTIMATE — Gender-inclusive growth models (0.7-1.2). Moderate consumption channel.",
      key_risk: "Cultural barriers and measurement challenges",
      what_we_know: [
        "Women participation increased from 17% to 33% (2017-2023)",
        "Vision 2030 explicit targets",
        "International gender program evaluations",
      ],
      what_we_dont_know: [
        "Saudi-specific SROI for women's programs",
        "Regional variation in participation barriers",
        "Long-term structural change dynamics",
      ],
    },
    {
      sector: "Environment",
      evidence_quality: "LOW",
      SROI_evidence: "ESTIMATE — World Bank (1.5-3.5 MENA). Conservative 2.2x due to monetization uncertainty.",
      multiplier_evidence: "ESTIMATE — Green fiscal multiplier (0.5-1.0). Capital-intensive, lower labor multiplier.",
      key_risk: "Technology uncertainty and long payback periods",
      what_we_know: [
        "Saudi Green Initiative targets",
        "USEPA social cost of carbon data",
        "International green investment literature",
      ],
      what_we_dont_know: [
        "Saudi environmental SROI",
        "Actual vs. target renewable energy deployment",
        "Regional environmental impact distribution",
      ],
    },
    {
      sector: "Hajj & Umrah / Social Services",
      evidence_quality: "VERY LOW",
      SROI_evidence: "SIMULATION_ASSUMPTION — No published study. Estimate 3.0x from tourism literature + public good reasoning.",
      multiplier_evidence: "ESTIMATE — UNWTO tourism multiplier (0.8-1.5). Adapted for Hajj/Umrah context.",
      key_risk: "Event-dependent, pandemic vulnerability, extreme concentration in Makkah/Madinah",
      what_we_know: [
        "Hajj/Umrah economy estimates (SAR 20-30bn)",
        "Pilgrim numbers (~2.5M Hajj, millions Umrah)",
        "Vision 2030 target: 30M Umrah visitors",
      ],
      what_we_dont_know: [
        "Hajj/Umrah social SROI (no study found)",
        "Social services cost-effectiveness",
        "True multiplier for religious tourism services",
      ],
    },
  ],

  // ═══════════════════════════════════════════════════
  // OVERALL DATA QUALITY ASSESSMENT
  // ═══════════════════════════════════════════════════

  overall: {
    sectors_with_some_evidence: 6,
    sectors_relying_on_assumptions: 1, // Hajj & Umrah
    SROI_source_type: "International case studies adapted for Saudi context",
    multiplier_source_type: "IMF/OECD international literature",
    verified_saudi_data: [
      "Population by region (GASTAT Census 2022)",
      "Unemployment rates (GASTAT Labor Force Survey)",
      "Women participation rates (GASTAT)",
      "Vision 2030 targets (government published)",
      "Budget allocations (Ministry of Finance)",
    ],
    simulation_assumptions: [
      "Impact curvature parameters (θ)",
      "Time realization curves",
      "Sector risk parameters (σ)",
      "Inter-sector correlations",
      "Regional gap indices",
      "SROI proxy values (adapted from international)",
    ],
    critical_disclaimer:
      "This model is a PEDAGOGICAL TOOL and POLICY EXPLORATION FRAMEWORK. " +
      "It should NOT be used as the sole basis for real investment decisions. " +
      "All parameters are disclosed and traceable to sources or clearly marked as assumptions.",
  },

  // ═══════════════════════════════════════════════════
  // DATA SEPARATION AUDIT
  // ═══════════════════════════════════════════════════

  separation_audit: {
    SROI: {
      definition: "Social Return on Investment — monetized social value per SAR invested",
      unit: "Ratio (e.g., 3.5 = 3.5 SAR social value per 1 SAR)",
      calculation: "Present value of social outcomes (discounted at 3%) / Investment amount",
      independence: "CALCULATED from sector-specific parameters. Allocation-dependent due to diminishing returns.",
    },
    Multiplier: {
      definition: "Keynesian Fiscal Multiplier — GDP flow per SAR of government spending",
      unit: "Ratio (e.g., 1.0 = 1 SAR GDP output per 1 SAR spending)",
      calculation: "1 + Indirect (supply chain) + Induced (household consumption)",
      independence: "SEPARATE from SROI. Measures economic activity, not social value.",
    },
    Economic_Impact: {
      definition: "Total economic output generated (direct + indirect + induced)",
      unit: "SAR (annual flow)",
      calculation: "Investment × Multiplier × Time realization factor",
      independence: "DERIVED from Multiplier. Measures GDP contribution.",
    },
    Social_Impact: {
      definition: "Non-monetary social outcomes",
      unit: "Varies by sector (years, lives, units, participation counts)",
      calculation: "Investment × Impact function (sector-specific)",
      independence: "SEPARATE from Economic Impact. Cannot be directly compared across sectors without monetization.",
    },
  },
};
