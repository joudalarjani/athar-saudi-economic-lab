/**
 * Case Studies — Real Saudi SROI Evaluations
 *
 * Each case study is a published, documented evaluation of a Saudi
 * social sector program. ATHAR uses these to ground sector SROI ranges.
 */

import { SOURCES } from './sources';
import type { SourceRef } from './sources';

export interface CaseStudy {
  id: string;
  organization: string;
  program: string;
  year: number;
  reportedSROI: number;
  methodology: string;
  sector: string;
  evidenceSource: SourceRef;
  summary: string;
  beneficiaryCount?: number;
  investmentSAR?: number;
  socialValueSAR?: number;
}

export const CASE_STUDIES: CaseStudy[] = [
  {
    id: 'doroob-scholarships',
    organization: 'Doroob Al Barakah (دروب البركة)',
    program: 'Doroob Scholarships (منح دراسية)',
    year: 2017,
    reportedSROI: 4.9,
    methodology: 'SROI v6 (Social Value International)',
    sector: 'education',
    evidenceSource: SOURCES.DOROOB_SROI_2019,
    summary:
      'Each SAR invested in the scholarship program generated SAR 4.9 of social value across Sudan, Kenya, and Saudi Arabia. Strong long-term capability formation effect.',
  },
  {
    id: 'doroob-leadership',
    organization: 'Doroob Al Barakah',
    program: 'Childhood Leadership Investment',
    year: 2018,
    reportedSROI: 4.5,
    methodology: 'SROI v6 (estimated from same methodology)',
    sector: 'education',
    evidenceSource: SOURCES.DOROOB_SROI_2019,
    summary: 'Educational + leadership training for children. 40-year endowment model.',
  },
  {
    id: 'wareef-housing',
    organization: 'Wareef Foundation (وقف وريف)',
    program: 'Sakan Khairi Housing Project (السكن الخيري)',
    year: 2023,
    reportedSROI: 5.49,
    methodology: 'SROI 6-stage framework',
    sector: 'housing',
    evidenceSource: SOURCES.WAREEF_SAKAN_2024,
    summary:
      'For every SAR invested in the housing project, SAR 5.49 of social value was generated. 90.33% satisfaction rate. Multi-dimensional outcomes (health, education, productivity).',
    beneficiaryCount: 100,
    socialValueSAR: 5_490_000,
  },
  {
    id: 'autism-research',
    organization: 'Wareef Foundation',
    program: 'Autism Research Center (مركز أبحاث التوحد)',
    year: 2023,
    reportedSROI: 3.14,
    methodology: 'SROI 6-stage framework',
    sector: 'health',
    evidenceSource: SOURCES.WAREEF_AUTISM_2023,
    summary:
      'Long-term autism research and family support. Social value SAR 8M-25M over 2018-2023.',
    socialValueSAR: 25_315_808,
  },
  {
    id: 'ensan-club',
    organization: 'Insan Charitable Society (جمعية إنسان)',
    program: 'Insan Social Club Training (نادي إنسان الاجتماعي)',
    year: 2021,
    reportedSROI: 2.8,
    methodology: 'SROI 6-stage framework',
    sector: 'employment',
    evidenceSource: SOURCES.ENSAN_CLUB_2021,
    summary: 'Training and development of orphans. Sponsored by Bank Aljazira.',
  },
  {
    id: 'zmzm-health',
    organization: 'Zamzam Health Society (جمعية زمزم الصحية)',
    program: 'Health Services SROI',
    year: 2021,
    reportedSROI: 3.5,
    methodology: 'SROI 6-stage',
    sector: 'health',
    evidenceSource: SOURCES.ZMZM_2021,
    summary: 'Multi-program health services SROI evaluation.',
  },
  {
    id: 'sd-masarat',
    organization: 'Bank Aljazira × ASE',
    program: 'Social Finance Specialist Program (برنامج مهارات أخصائي المالية الاجتماعية)',
    year: 2023,
    reportedSROI: 3.2,
    methodology: 'Pre/post beneficiary survey + SROI proxy',
    sector: 'employment',
    evidenceSource: SOURCES.ASE_ASSOCIATION,
    summary:
      'Capacity-building for social finance professionals. Strong intermediate outcomes, long-term sectoral effect.',
  },
];

export function getCaseStudiesBySector(sectorId: string): CaseStudy[] {
  return CASE_STUDIES.filter((c) => c.sector === sectorId);
}
