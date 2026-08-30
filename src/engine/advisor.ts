/**
 * Economic Goal Advisor Engine
 *
 * Analyzes a user-typed economic goal (Arabic/English) and returns a reasoned
 * Arabic recommendation plus a set of suggested allocation weights per sector.
 *
 * This is a transparent, deterministic keyword layer over the model — NOT a
 * real AI model (mirrors the ATHAR INTELLIGENCE prototype's framing). Every
 * weight sums to 100% and maps to the seven real sectors:
 * education / health / housing / employment / women / environment / hajj.
 */

export interface EconomicGoalAdvice {
  /** Short Arabic "نصيحة المستشار" string. */
  advice: string;
  /** Sector → weight (0-100, summing to 100). */
  recommendedWeights: Record<string, number>;
  /** True when a specific scenario matched; false when fallback was used. */
  matched: boolean;
}

interface Branch {
  id: string;
  match: string[];
  advice: string;
  weights: Record<string, number>;
}

const BRANCHES: Branch[] = [
  {
    id: 'education',
    match: [
      'تعليم', 'مدراس', 'مدارس', 'جامعات', 'جامعة', 'مهارات', 'تعلم', 'تدريب',
      'education', 'learn', 'skill', 'training', 'school', 'university',
    ],
    advice:
      'نصيحة المستشار: نظراً لتركيزك على التعليم، يُنصح بتوجيه الحصة الكبرى نحو التعليم والتمكين البشري لأن عائده الاجتماعي (SROI) يتراكم بقوة عبر الأجيال.',
    weights: { education: 50, health: 15, housing: 15, employment: 10, women: 5, environment: 3, hajj: 2 },
  },
  {
    id: 'jobs',
    match: [
      'وظيف', 'توظيف', 'فرص عمل', 'عمل', 'دخل', 'تشغيل', 'بطالة', 'تمكين اقتصادي',
      'jobs', 'job', 'work', 'employment', 'income', 'unemployment', 'business',
    ],
    advice:
      'نصيحة المستشار: لدعم فرص العمل وتقليل المخاطر، يُفضل رفع مخصصات التوظيف والتمكين الاقتصادي لزيادة التأثير المباشر على الناتج المحلي الإجمالي.',
    weights: { education: 20, health: 10, housing: 10, employment: 45, women: 10, environment: 3, hajj: 2 },
  },
  {
    id: 'sustainability',
    match: [
      'سكن', 'بيئة', 'استدامة', 'مناخ', 'البيئة', 'جودة حياة', 'إسكان', 'أخضر',
      'housing', 'environment', 'sustain', 'climate', 'green', 'home',
    ],
    advice:
      'نصيحة المستشار: الاستثمار في الإسكان والبيئة يرفع جودة الحياة ويحقق استقراراً مجتمعياً طويل الأمد بعيداً عن الهزات الاقتصادية.',
    weights: { education: 20, health: 15, housing: 30, employment: 10, women: 10, environment: 12, hajj: 3 },
  },
];

/** Total budget in SAR used to convert weights (%) into absolute allocation. */
export function weightsToAllocation(weights: Record<string, number>, totalBudget: number): Record<string, number> {
  const total = Object.values(weights).reduce((s, v) => s + (v || 0), 0);
  const safe = total > 0 ? total : 100;
  const allocation: Record<string, number> = {};
  for (const [id, w] of Object.entries(weights)) {
    allocation[id] = (w / safe) * totalBudget;
  }
  return allocation;
}

/**
 * Analyze a free-text economic goal.
 * The first branch whose keyword matches wins; otherwise a balanced fallback.
 */
export function analyzeEconomicGoal(inputText: string): EconomicGoalAdvice {
  const text = (inputText || '').toLowerCase();

  for (const branch of BRANCHES) {
    const hit = branch.match.some((m) => text.includes(m.toLowerCase()));
    if (hit) {
      return { advice: branch.advice, recommendedWeights: { ...branch.weights }, matched: true };
    }
  }

  return {
    advice:
      'نصيحة المستشار: بناءً على هدفك العام، تم بناء محفظة متوازنة توزع الأثر بكفاءة بين تنمية القدرات وتحفيز الأنشطة الأساسية.',
    recommendedWeights: { education: 35, health: 20, housing: 15, employment: 15, women: 10, environment: 3, hajj: 2 },
    matched: false,
  };
}
