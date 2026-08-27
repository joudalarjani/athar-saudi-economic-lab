/**
 * Capital Stack Funding Instruments
 *
 * Each instrument has different risk, sustainability, and liquidity profiles.
 * Users build their funding mix in the Capital Stack Builder.
 */

import { SOURCES } from './sources';
import type { SourceRef } from './sources';

export interface FundingInstrument {
  id: string;
  arName: string;
  enName: string;
  description: string;
  /** 0-1: low to high risk */
  risk: number;
  /** 0-1: sustainability (long-term persistence) */
  sustainability: number;
  /** 0-1: liquidity (ease of access) */
  liquidity: number;
  /** 0-1: dependency on government */
  governmentDependency: number;
  /** Examples in Saudi context */
  examples: string[];
  evidenceSource: SourceRef;
}

export const FUNDING_INSTRUMENTS: FundingInstrument[] = [
  {
    id: 'government_grants',
    arName: 'منح حكومية',
    enName: 'Government Grants',
    description: 'تمويل مباشر من الميزانية العامة، عبر الوزارات والجهات الإشرافية',
    risk: 0.2,
    sustainability: 0.7,
    liquidity: 0.9,
    governmentDependency: 1.0,
    examples: ['منح MHRSD', 'صندوق دعم الجمعيات', 'برامج رؤية 2030'],
    evidenceSource: SOURCES.HRSD_SOCIAL_IMPACT_INV,
  },
  {
    id: 'waqf',
    arName: 'أوقاف',
    enName: 'Waqf / Endowment',
    description: 'أصول وقفية تُدر عائدًا مستدامًا طويل الأجل',
    risk: 0.1,
    sustainability: 1.0,
    liquidity: 0.3,
    governmentDependency: 0.2,
    examples: ['الأوقاف العامة والخاصة', 'صندوق الأوقف الصحي', 'وقف دروب'],
    evidenceSource: SOURCES.AWQAF_ENDOWMENT,
  },
  {
    id: 'social_investment',
    arName: 'استثمار اجتماعي',
    enName: 'Social Investment (Impact Investing)',
    description: 'استثمارات بعائد مالي مع أثر اجتماعي قابل للقياس',
    risk: 0.6,
    sustainability: 0.85,
    liquidity: 0.6,
    governmentDependency: 0.2,
    examples: ['صندوق الاستثمار الاجتماعي السعودي', 'SSROIF', 'Invest in Impact'],
    evidenceSource: SOURCES.HRSD_SOCIAL_IMPACT_INV,
  },
  {
    id: 'outcome_finance',
    arName: 'تمويل مرتبط بالنتائج',
    enName: 'Outcome-Based Finance (SIB / DIB)',
    description: 'التمويل يُصرف بناءً على تحقيق نتائج متفق عليها',
    risk: 0.7,
    sustainability: 0.9,
    liquidity: 0.4,
    governmentDependency: 0.5,
    examples: ['Social Impact Bonds (SIB)', 'Development Impact Bonds (DIB)'],
    evidenceSource: SOURCES.HRSD_SOCIAL_IMPACT_INV,
  },
  {
    id: 'csr',
    arName: 'مسؤولية اجتماعية للشركات',
    enName: 'CSR Contributions',
    description: 'مساهمات الشركات ضمن برامج المسؤولية الاجتماعية',
    risk: 0.3,
    sustainability: 0.5,
    liquidity: 0.7,
    governmentDependency: 0.0,
    examples: ['SABIC CSR', 'أرامكو CSR', 'برامج CSR للشركات الكبرى'],
    evidenceSource: SOURCES.SABIC_CSR_2022,
  },
  {
    id: 'crowdfunding',
    arName: 'تمويل جماعي',
    enName: 'Crowdfunding / Digital Donations',
    description: 'تبرعات فردية عبر منصات رقمية',
    risk: 0.2,
    sustainability: 0.4,
    liquidity: 0.9,
    governmentDependency: 0.0,
    examples: ['منصة إحسان', 'منصة وقفي', 'GoFundMe Charity'],
    evidenceSource: SOURCES.EHSAN_PLATFORM,
  },
];
