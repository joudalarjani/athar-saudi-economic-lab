/**
 * ATHAR | أثر — Sources & References
 *
 * Comprehensive documentation of all data sources used in the model.
 * Each source is classified by type and reliability.
 *
 * Last updated: August 2026
 */

export interface Source {
  id: string;
  title: string;
  author: string;
  year: number;
  url: string;
  type: "GOVERNMENT" | "INTERNATIONAL_ORG" | "ACADEMIC" | "CONSULTANCY" | "NGO";
  reliability: "HIGH" | "MEDIUM" | "LOW";
  notes: string;
}

export const SOURCES: Source[] = [
  // ═══════════════════════════════════════════════════
  // SAUDI GOVERNMENT DATA (VERIFIED)
  // ═══════════════════════════════════════════════════
  {
    id: "GASTAT-CENSUS-2022",
    title: "Saudi Census 2022 (Preliminary Results)",
    author: "General Authority for Statistics (GASTAT)",
    year: 2022,
    url: "https://www.stats.gov.sa/en",
    type: "GOVERNMENT",
    reliability: "HIGH",
    notes:
      "Total population ~32.2 million. Regional population shares used in model. " +
      "This is the most recent comprehensive census. Published by GASTAT.",
  },
  {
    id: "GASTAT-LABOR-2023",
    title: "Labor Force Survey 2023",
    author: "General Authority for Statistics (GASTAT)",
    year: 2023,
    url: "https://www.stats.gov.sa/en/indicators/labour-force",
    type: "GOVERNMENT",
    reliability: "HIGH",
    notes:
      "Unemployment rate ~4.9%. Youth unemployment significantly higher. " +
      "Women labor force participation ~33%. Published quarterly.",
  },
  {
    id: "VISION2030",
    title: "Saudi Vision 2030 Annual Report",
    author: "Council of Economic and Development Affairs",
    year: 2023,
    url: "https://www.vision2030.gov.sa/en",
    type: "GOVERNMENT",
    reliability: "HIGH",
    notes:
      "Official government targets for housing (70% ownership), women participation (30%+), " +
      "tourism (100M visits), renewable energy (50% by 2030). " +
      "Program-level targets are government commitments, not necessarily achieved outcomes.",
  },
  {
    id: "MOF-BUDGET-2024",
    title: "Saudi Arabia Federal Budget FY2024",
    author: "Ministry of Finance",
    year: 2024,
    url: "https://mof.gov.sa/en/budget",
    type: "GOVERNMENT",
    reliability: "HIGH",
    notes:
      "Total budget ~SAR 1.114 trillion. Revenue ~SAR 1.172 trillion. " +
      "Sectoral allocation data used for context, not direct model input.",
  },
  {
    id: "SGI-2021",
    title: "Saudi Green Initiative",
    author: "Saudi Green Initiative",
    year: 2021,
    url: "https://www.saudigreeninitiative.org/en",
    type: "GOVERNMENT",
    reliability: "MEDIUM",
    notes:
      "Targets: 10 billion trees, 50% renewable energy by 2030, net-zero by 2060. " +
      "These are announced targets, not yet fully implemented.",
  },

  // ═══════════════════════════════════════════════════
  // INTERNATIONAL ORGANIZATIONS
  // ═══════════════════════════════════════════════════
  {
    id: "IMF-WP20-134",
    title: "Fiscal Multipliers in the Gulf Cooperation Council",
    author: "International Monetary Fund",
    year: 2020,
    url: "https://www.imf.org/en/Publications/WP/Issues/2020/10/26/Fiscal-Multipliers-in-the-Gulf-Cooperation-Council-497438",
    type: "INTERNATIONAL_ORG",
    reliability: "HIGH",
    notes:
      "Working Paper estimates fiscal multipliers for GCC countries. " +
      "Government consumption multiplier: 0.5-1.0. Capital expenditure: 0.6-1.5. " +
      "Transfer payments: 0.3-0.8. Varies by oil price environment. " +
      "Used as primary source for Keynesian multiplier estimates.",
  },
  {
    id: "OECD-EDU-2023",
    title: "Education at a Glance 2023",
    author: "OECD",
    year: 2023,
    url: "https://www.oecd.org/en/publications/education-at-a-glance-2023_c00cad37-en.html",
    type: "INTERNATIONAL_ORG",
    reliability: "HIGH",
    notes:
      "Returns to education data across OECD and partner countries. " +
      "Lifetime earnings premium for tertiary education: 3-6x in GCC context. " +
      "Used for SROI proxy value estimation.",
  },
  {
    id: "WHO-CHOICE",
    title: "CHOosing Interventions that are Cost-Effective (WHO-CHOICE)",
    author: "World Health Organization",
    year: 2023,
    url: "https://www.who.int/health-impact/who-choice",
    type: "INTERNATIONAL_ORG",
    reliability: "HIGH",
    notes:
      "Cost-effectiveness thresholds for health interventions. " +
      "Preventive health: very cost-effective in middle-income countries. " +
      "Used for healthcare SROI estimation.",
  },
  {
    id: "ILO-2022",
    title: "World Employment and Social Outlook",
    author: "International Labour Organization",
    year: 2022,
    url: "https://www.ilo.org/global/research/global-reports/weso",
    type: "INTERNATIONAL_ORG",
    reliability: "HIGH",
    notes:
      "Employment intensity by sector, active labor market program evaluations. " +
      "SROI range for employment programs: 2.0-5.0 in developing contexts. " +
      "Used for employment sector SROI and job creation estimates.",
  },
  {
    id: "WB-GENDER-2023",
    title: "Women, Business and the Law 2023",
    author: "World Bank",
    year: 2023,
    url: "https://www.worldbank.org/en/topic/gender",
    type: "INTERNATIONAL_ORG",
    reliability: "HIGH",
    notes:
      "Gender equality metrics and economic participation data. " +
      "Women's employment programs show 4-8x social return in developing economies. " +
      "Used for Women Empowerment SROI.",
  },
  {
    id: "UNWTO-RELIGIOUS",
    title: "Tourism and the Sustainable Development Goals",
    author: "UN World Tourism Organization",
    year: 2022,
    url: "https://www.unwto.org/tourism-data",
    type: "INTERNATIONAL_ORG",
    reliability: "MEDIUM",
    notes:
      "Religious tourism multiplier: 0.8-1.5. " +
      "Hajj/Umrah data: ~2.5M pilgrims annually (pre-COVID). " +
      "Used for Hajj & Umrah multiplier estimation.",
  },

  // ═══════════════════════════════════════════════════
  // CASE STUDIES
  // ═══════════════════════════════════════════════════
  {
    id: "SOCIAL-VALUE-UK",
    title: "Social Value Bank Methodology",
    author: "Social Value UK",
    year: 2023,
    url: "https://www.socialvaluebank.org.uk",
    type: "NGO",
    reliability: "MEDIUM",
    notes:
      "SROI methodology and proxy values for social programs. " +
      "Housing SROI: 2.0-3.5. Education SROI: 2.5-8.0. " +
      "Used as methodological reference, not direct Saudi application.",
  },
  {
    id: "MCKINSEY-GENDER-2015",
    title: "The Power of Parity: How Advancing Women's Equality Can Add $12 Trillion to Global Growth",
    author: "McKinsey Global Institute",
    year: 2015,
    url: "https://www.mckinsey.com/featured-insights/employment-and-growth/how-advancing-womens-equality-can-add-12-trillion-to-global-growth",
    type: "CONSULTANCY",
    reliability: "MEDIUM",
    notes:
      "Global macro estimates of women's economic participation impact. " +
      "MENA region: potential +$2.6T GDP increase. " +
      "Used for Women Empowerment SROI proxy.",
  },
  {
    id: "IFC-BANKING-WOMEN-2019",
    title: "Banking on Women",
    author: "International Finance Corporation",
    year: 2019,
    url: "https://www.ifc.org/en/insights-reports/2019/banking-on-women",
    type: "INTERNATIONAL_ORG",
    reliability: "MEDIUM",
    notes:
      "Women-owned enterprise programs in MENA: SROI 3-7x. " +
      "Case study evidence from specific IFC programs, not generalizable.",
  },
  {
    id: "USEPA-SCC-2023",
    title: "Social Cost of Carbon",
    author: "US Environmental Protection Agency",
    year: 2023,
    url: "https://www.epa.gov/climate-economics",
    type: "GOVERNMENT",
    reliability: "HIGH",
    notes:
      "Social cost of carbon: $50-100/tCO2e (central estimate ~$190/tCO2e as of 2023 update). " +
      "Used for environmental outcome monetization.",
  },

  // ═══════════════════════════════════════════════════
  // MODEL PARAMETERS (SIMULATION ASSUMPTIONS)
  // ═══════════════════════════════════════════════════
  {
    id: "SIM-THETA",
    title: "Impact Curvature Parameters (θ)",
    author: "ATHAR Model",
    year: 2024,
    url: "",
    type: "ACADEMIC",
    reliability: "LOW",
    notes:
      "Curvature parameters calibrated to standard concave production functions in economics. " +
      "θ = 0.6-0.85 range: moderate to strong diminishing returns. " +
      "These are simulation assumptions, not empirically estimated for Saudi Arabia.",
  },
  {
    id: "SIM-MATURITY",
    title: "Time Realization Curves",
    author: "ATHAR Model",
    year: 2024,
    url: "",
    type: "ACADEMIC",
    reliability: "LOW",
    notes:
      "Piecewise linear approximation of program maturation. " +
      "Education: slow (10 years). Employment: fast (1-3 years). " +
      "Based on general program evaluation literature, not Saudi-specific timelines.",
  },
  {
    id: "SIM-RISK",
    title: "Sector Risk Parameters",
    author: "ATHAR Model",
    year: 2024,
    url: "",
    type: "ACADEMIC",
    reliability: "LOW",
    notes:
      "Risk estimates based on: construction cost overrun literature, " +
      "program evaluation meta-analyses, technology uncertainty assessments. " +
      "These are informed assumptions, not measured risks.",
  },
  {
    id: "SIM-CORRELATION",
    title: "Sector Correlation Matrix",
    author: "ATHAR Model",
    year: 2024,
    url: "",
    type: "ACADEMIC",
    reliability: "LOW",
    notes:
      "Default inter-sector correlation: ρ = 0.3. " +
      "Assumes moderate positive correlation (general economic conditions affect all sectors). " +
      "No empirical correlation data available for Saudi social investment sectors.",
  },
];

// ═══════════════════════════════════════════════════
// KEY METHODOLOGICAL NOTES
// ═══════════════════════════════════════════════════

export const METHODOLOGY_NOTES = {
  SROI_calculation:
    "SROI = (Social Value Created) / (Investment). Social Value is monetized using proxy values " +
    "from international case studies, adjusted for Saudi context. " +
    "SROI is ALLOCATION-DEPENDENT: more money → lower marginal SROI due to diminishing returns. " +
    "This is a key teaching point of the model.",

  Multiplier_calculation:
    "Total Fiscal Multiplier = 1 + Indirect Multiplier + Induced Multiplier. " +
    "Indirect = supply chain effects (local content of spending). " +
    "Induced = household consumption from wages/income generated. " +
    "IMF estimates for GCC: 0.5-1.5 depending on spending type and oil price environment.",

  Economic_Impact:
    "Economic Impact = Direct Output + Indirect Output + Induced Output. " +
    "This is a GDP FLOW measure (annual output), NOT a value measure. " +
    "Units: SAR of economic activity per year.",

  Social_Impact:
    "Social Impact = Non-monetary outcomes: education years, health outcomes, " +
    "housing units, jobs created, women participating, tCO2e avoided. " +
    "Units vary by sector. NOT directly comparable across sectors without monetization.",

  Discount_rate:
    "Social discount rate: 3% per year (based on international convention: " +
    "HM Treasury Green Book 3.5% declining, US OMB 3%). " +
    "Used for present value calculations over time horizons.",

  Data_quality_warning:
    "Saudi-specific empirical data for social investment SROI is extremely limited. " +
    "Most parameters are adapted from international literature. " +
    "This model should be treated as a PEDAGOGICAL TOOL and POLICY EXPLORATION FRAMEWORK, " +
    "not as an evidence-based decision support system.",
};
