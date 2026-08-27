/**
 * Multi-objective optimization objectives.
 * The user assigns weights to these to drive the "Optimal Allocation" view.
 */

import { SOURCES } from './sources';
import type { SourceRef } from './sources';
import type { ObjectiveWeights } from '../engine/optimizer';

export interface Objective {
  id: string;
  arName: string;
  enName: string;
  description: string;
  /** Mathematical direction (max / min) */
  direction: 'max' | 'min';
  /** Reference for why this is a valid objective */
  evidenceSource: SourceRef;
}

export const OBJECTIVES: Objective[] = [
  {
    id: 'efficiency',
    arName: 'الكفاءة الاقتصادية',
    enName: 'Economic Efficiency',
    description: 'تعظيم الأثر لكل ريال مُنفق',
    direction: 'max',
    evidenceSource: SOURCES.HM_TREASURY_GREEN_BOOK,
  },
  {
    id: 'impact',
    arName: 'الأثر الاجتماعي',
    enName: 'Social Impact',
    description: 'تعظيم عدد المستفيدين والقيمة الاجتماعية المُحققة',
    direction: 'max',
    evidenceSource: SOURCES.SROI_GUIDE,
  },
  {
    id: 'equity',
    arName: 'العدالة التوزيعية',
    enName: 'Equity',
    description: 'تقليل الفجوة بين المناطق والفئات',
    direction: 'min',
    evidenceSource: SOURCES.VISION_2030_KPI,
  },
  {
    id: 'sustainability',
    arName: 'الاستدامة المالية',
    enName: 'Financial Sustainability',
    description: 'ضمان استمرارية الأثر بعد 5 سنوات',
    direction: 'max',
    evidenceSource: SOURCES.KKF_OUTLOOK_2025,
  },
  {
    id: 'resilience',
    arName: 'المرونة',
    enName: 'Resilience',
    description: 'قدرة المحفظة على امتصاص الصدمات',
    direction: 'max',
    evidenceSource: SOURCES.IMF_ARTICLE_IV_SA,
  },
];

export const DEFAULT_OBJECTIVE_WEIGHTS: ObjectiveWeights = {
  efficiency: 0.30,
  impact: 0.30,
  equity: 0.15,
  sustainability: 0.15,
  resilience: 0.10,
};
