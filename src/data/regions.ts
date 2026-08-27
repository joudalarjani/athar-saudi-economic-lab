/**
 * Regional data for Saudi Arabia (13 administrative regions).
 *
 * Source: NCNP Annual Report 2024-2025 + KKF Nonprofit Outlook 2025 + GASTAT.
 * Distribution shows % of total nonprofit organizations.
 * Population shares from GASTAT.
 *
 * IMPORTANT: We do NOT assume that lower-development regions always have
 * higher marginal return. The "gap-based" allocation uses these as
 * indicators, but the user can verify via sensitivity analysis.
 */

import { SOURCES } from './sources';
import type { SourceRef } from './sources';

export interface Region {
  id: string;
  arName: string;
  enName: string;
  /** Share of total population (0-1) */
  populationShare: number;
  /** Share of total nonprofit organizations (0-1) */
  nonprofitShare: number;
  /** Ratio: nonprofitShare / populationShare — values >1 = overserved, <1 = underserved */
  coverageIndex: number;
  /** Number of organizations (2024) */
  orgCount: number;
  /** Number of volunteers (2024, where available) */
  volunteerCount?: number;
  evidenceSource: SourceRef;
  note?: string;
}

export const REGIONS: Region[] = [
  {
    id: 'riyadh',
    arName: 'الرياض',
    enName: 'Riyadh',
    populationShare: 0.275,
    nonprofitShare: 0.31,
    coverageIndex: 1.13,
    orgCount: 1592,
    volunteerCount: 380_000,
    evidenceSource: SOURCES.NCNP_ANNUAL_2024,
  },
  {
    id: 'makkah',
    arName: 'مكة المكرمة',
    enName: 'Makkah',
    populationShare: 0.225,
    nonprofitShare: 0.18,
    coverageIndex: 0.80,
    orgCount: 1041,
    volunteerCount: 290_000,
    evidenceSource: SOURCES.NCNP_ANNUAL_2024,
  },
  {
    id: 'madinah',
    arName: 'المدينة المنورة',
    enName: 'Madinah',
    populationShare: 0.073,
    nonprofitShare: 0.06,
    coverageIndex: 0.82,
    orgCount: 337,
    evidenceSource: SOURCES.NCNP_ANNUAL_2024,
  },
  {
    id: 'qassim',
    arName: 'القصيم',
    enName: 'Qassim',
    populationShare: 0.045,
    nonprofitShare: 0.10,
    coverageIndex: 2.22,
    orgCount: 561,
    evidenceSource: SOURCES.NCNP_ANNUAL_2024,
  },
  {
    id: 'eastern',
    arName: 'المنطقة الشرقية',
    enName: 'Eastern Province',
    populationShare: 0.165,
    nonprofitShare: 0.09,
    coverageIndex: 0.55,
    orgCount: 503,
    evidenceSource: SOURCES.NCNP_ANNUAL_2024,
  },
  {
    id: 'aseer',
    arName: 'عسير',
    enName: 'Aseer',
    populationShare: 0.067,
    nonprofitShare: 0.08,
    coverageIndex: 1.19,
    orgCount: 452,
    evidenceSource: SOURCES.NCNP_ANNUAL_2024,
  },
  {
    id: 'tabuk',
    arName: 'تبوك',
    enName: 'Tabuk',
    populationShare: 0.027,
    nonprofitShare: 0.02,
    coverageIndex: 0.74,
    orgCount: 127,
    evidenceSource: SOURCES.NCNP_ANNUAL_2024,
  },
  {
    id: 'hail',
    arName: 'حائل',
    enName: 'Hail',
    populationShare: 0.022,
    nonprofitShare: 0.056,
    coverageIndex: 2.55,
    orgCount: 325,
    evidenceSource: SOURCES.NCNP_ANNUAL_2024,
  },
  {
    id: 'northern_borders',
    arName: 'الحدود الشمالية',
    enName: 'Northern Borders',
    populationShare: 0.011,
    nonprofitShare: 0.017,
    coverageIndex: 1.55,
    orgCount: 99,
    evidenceSource: SOURCES.NCNP_ANNUAL_2024,
  },
  {
    id: 'jazan',
    arName: 'جازان',
    enName: 'Jazan',
    populationShare: 0.045,
    nonprofitShare: 0.05,
    coverageIndex: 1.11,
    orgCount: 265,
    evidenceSource: SOURCES.NCNP_ANNUAL_2024,
  },
  {
    id: 'najran',
    arName: 'نجران',
    enName: 'Najran',
    populationShare: 0.018,
    nonprofitShare: 0.020,
    coverageIndex: 1.11,
    orgCount: 114,
    evidenceSource: SOURCES.NCNP_ANNUAL_2024,
  },
  {
    id: 'bahah',
    arName: 'الباحة',
    enName: 'Al Bahah',
    populationShare: 0.015,
    nonprofitShare: 0.03,
    coverageIndex: 2.00,
    orgCount: 175,
    evidenceSource: SOURCES.NCNP_ANNUAL_2024,
  },
  {
    id: 'jawf',
    arName: 'الجوف',
    enName: 'Al Jawf',
    populationShare: 0.016,
    nonprofitShare: 0.028,
    coverageIndex: 1.75,
    orgCount: 163,
    evidenceSource: SOURCES.NCNP_ANNUAL_2024,
  },
];

export const TOTAL_ORGANIZATIONS_2024 = REGIONS.reduce((s, r) => s + r.orgCount, 0);
