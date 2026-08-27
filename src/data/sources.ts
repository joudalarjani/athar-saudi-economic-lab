/**
 * Source registry — every claim in ATHAR traces back to a SourceRef.
 * Used in the Model Explainer and Evidence Badge tooltips.
 */

export interface SourceRef {
  name: string;
  url?: string;
  year: number;
  accessDate: string;
  publisher?: string;
  pageOrTable?: string;
}

export const SOURCES = {
  // === Saudi Official Sources ===
  NCNP_ANNUAL_2025: {
    name: 'NCNP Annual Report 2025 (المركز الوطني لتنمية القطاع غير الربحي)',
    url: 'https://ncnp.gov.sa/ar/reports/التقرير-السنوي-لعام-2025',
    year: 2026,
    accessDate: '2025-08-24',
    publisher: 'National Center for Nonprofit Sector',
  } as SourceRef,
  NCNP_ANNUAL_2024: {
    name: 'NCNP Annual Report 2024',
    url: 'https://ncnp.gov.sa/ar/media-center/...',
    year: 2025,
    accessDate: '2025-08-24',
    publisher: 'National Center for Nonprofit Sector',
  } as SourceRef,
  VISION_2030_KPI: {
    name: 'Saudi Vision 2030 — Nonprofit Sector Priority',
    url: 'https://vision2030.ai/ar/vision/priority-nonprofit-sector/',
    year: 2024,
    accessDate: '2025-08-24',
    publisher: 'Saudi Vision 2030',
  } as SourceRef,
  GASTAT_NPO_2023: {
    name: 'GASTAT — Nonprofit Sector Organizations Statistics 2023',
    url: 'https://www.stats.gov.sa/ar/w/إحصاءات-منظمات-القطاع-غير-الربحي-2023',
    year: 2024,
    accessDate: '2025-08-24',
    publisher: 'General Authority for Statistics',
  } as SourceRef,
  KKF_OUTLOOK_2025: {
    name: 'King Khalid Foundation — Nonprofit Sector Outlook 2025 (آفاق القطاع غير الربحي)',
    url: 'https://kkf.org.sa/ne/n27/',
    year: 2025,
    accessDate: '2025-08-24',
    publisher: 'King Khalid Foundation',
  } as SourceRef,
  HRSD_SOCIAL_IMPACT_INV: {
    name: 'MHRSD Social Impact Investment Rules 2025',
    url: 'https://istitlaa.ncc.gov.sa/ar/Labor/ncnp/SocialImpactInvesment/Pages/default.aspx',
    year: 2025,
    accessDate: '2025-08-24',
    publisher: 'Ministry of Human Resources and Social Development',
  } as SourceRef,
  AWQAF_ENDOWMENT: {
    name: 'Awqaf Authority — Endowment Report',
    url: 'https://www.awqaf.gov.sa',
    year: 2024,
    accessDate: '2025-08-24',
    publisher: 'Saudi General Authority of Awqaf',
  } as SourceRef,
  EHSAN_PLATFORM: {
    name: 'Ehsan Donation Platform — Annual Stats',
    year: 2024,
    accessDate: '2025-08-24',
    publisher: 'Ehsan',
  } as SourceRef,
  NCDF_VOLUNTEER: {
    name: 'National Center for Volunteerism — Annual Stats 2024',
    url: 'https://volunteer.sa',
    year: 2024,
    accessDate: '2025-08-24',
    publisher: 'NCDF',
  } as SourceRef,
  ASE_ASSOCIATION: {
    name: 'Association for Social Economics (جمعية الاقتصاد الاجتماعي)',
    url: 'https://ase.org.sa',
    year: 2024,
    accessDate: '2025-08-24',
    publisher: 'ASE',
  } as SourceRef,

  // === Published SROI Case Studies ===
  DOROOB_SROI_2019: {
    name: 'Doroob Al Barakah SROI Report 2019 (Scholarships + Leadership)',
    url: 'https://www.socialvalueint.org/blog/announcing-doroob-as-social-value-pioneers',
    year: 2019,
    accessDate: '2025-08-24',
    publisher: 'Doroob Al Barakah × Social Value International',
  } as SourceRef,
  WAREEF_SAKAN_2024: {
    name: 'Wareef Foundation — Sakan Khairi SROI 2024 (5.49x)',
    url: 'https://wareef.org/wp-content/uploads/2024/12/sakan.pdf',
    year: 2024,
    accessDate: '2025-08-24',
    publisher: 'Wareef Foundation',
  } as SourceRef,
  WAREEF_AUTISM_2023: {
    name: 'Wareef Foundation — Autism Research Center SROI 2023 (3.14x)',
    url: 'https://wareef.org/wp-content/uploads/2024/01/قياس-الأثر-الاجتماعي-لمشروع-مركز-أبحاث-التوحد.pdf',
    year: 2023,
    accessDate: '2025-08-24',
    publisher: 'Wareef Foundation',
  } as SourceRef,
  ENSAN_CLUB_2021: {
    name: 'Insan Charitable Society — Club SROI Study 2021',
    url: 'https://ensan.org.sa/wp-content/uploads/2025/08/دراسة-قياس-الأثر-الاجتماعي-نادي-إنسان_compressed-1.pdf',
    year: 2021,
    accessDate: '2025-08-24',
    publisher: 'Insan × ASE',
  } as SourceRef,
  SABIC_CSR_2022: {
    name: 'SABIC Annual CSR Report 2022',
    url: 'https://www.sabic.com/en/reports/annual-2022/corporate/corporate-social-responsibility',
    year: 2022,
    accessDate: '2025-08-24',
    publisher: 'SABIC',
  } as SourceRef,
  ZMZM_2021: {
    name: 'Zamzam Health Society SROI 2021',
    url: 'https://zmzm.sa/sites/default/files/تقرير%20الأثر%20الاجتماعي%20Social%20Impact%20Report%202021.pdf',
    year: 2021,
    accessDate: '2025-08-24',
    publisher: 'Zamzam Society',
  } as SourceRef,

  // === Methodology & Macro Sources ===
  SROI_GUIDE: {
    name: 'A Guide to Social Return on Investment (Social Value International)',
    url: 'https://www.socialvalueint.org/guide-to-sroi',
    year: 2009,
    accessDate: '2025-08-24',
    publisher: 'Social Value International (originally UK Cabinet Office)',
  } as SourceRef,
  HM_TREASURY_GREEN_BOOK: {
    name: 'HM Treasury Green Book — Discount Rate Methodology',
    url: 'https://www.gov.uk/government/publications/the-green-book-appraisal-and-evaluation-in-central-governent',
    year: 2022,
    accessDate: '2025-08-24',
    publisher: 'UK HM Treasury',
  } as SourceRef,
  IMF_ARTICLE_IV_SA: {
    name: 'IMF Article IV — Saudi Arabia 2024',
    url: 'https://www.imf.org/en/Publications/CR/Issues/2024/09/24/saudi-arabia-2024-article-iv-consultation',
    year: 2024,
    accessDate: '2025-08-24',
    publisher: 'International Monetary Fund',
  } as SourceRef,
  SAMA_REPORTS: {
    name: 'SAMA Annual Reports',
    url: 'https://www.sama.gov.sa/en-US/EconomicReports',
    year: 2024,
    accessDate: '2025-08-24',
    publisher: 'Saudi Central Bank',
  } as SourceRef,
  KAHN_MULTIPLIER: {
    name: 'Kahn, R. — "A market-based approach to estimating the fiscal multiplier"',
    year: 2010,
    accessDate: '2025-08-24',
    publisher: 'Federal Reserve Bank of Kansas City',
  } as SourceRef,
  ASHRM_SROI_VAL: {
    name: 'Alshammari, A. — "Efficiency and Social Return on Investment in Volunteer Organizations"',
    url: 'https://www.hnjournal.net/en/6-11-3/',
    year: 2024,
    accessDate: '2025-08-24',
    publisher: 'Humanities & Natural Sciences Journal',
  } as SourceRef,
};
