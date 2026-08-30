export type GlossaryTermId =
  | 'sroi'
  | 'multiplier'
  | 'diminishing'
  | 'opportunity'
  | 'resilience'
  | 'ppf'
  | 'pareto'
  | 'hhi'
  | 'time-discounting'
  | 'leakage'
  | 'stress-test'
  | 'sensitivity';

export type GlossaryCategory = 'core' | 'engine' | 'analysis';

export interface GlossaryTerm {
  id: GlossaryTermId;
  labelAr: string;
  labelEn: string;
  /** Short one-line definition */
  short: string;
  /** Detailed Arabic explanation */
  body: string;
  example?: string;
  formula?: string;
  category: GlossaryCategory;
}

const CATEGORY: Record<GlossaryCategory, { labelAr: string; color: string }> = {
  core: { labelAr: 'أساسي', color: 'text-gold' },
  engine: { labelAr: 'محرك', color: 'text-blue-400' },
  analysis: { labelAr: 'تحليل', color: 'text-emerald-400' },
};

export const GLOSSARY_TERMS: GlossaryTerm[] = [
  {
    id: 'sroi',
    labelAr: 'العائد الاجتماعي على الاستثمار',
    labelEn: 'SROI — Social Return on Investment',
    short: 'Social Return on Investment',
    category: 'core',
    body:
      'يقيس القيمة الاجتماعية المولّدة مقابل كل ريال يُستثمر. يحوّل النتائج الاجتماعية (صحة، تعليم، تمكين) إلى قيمة مالية من خلال مقاييس مالية، مع خصم deadweight (ما كان سيحدث دون تدخل) و attribution و displacement.',
    example: 'دروب: 1 ريال → 4.9 ريال قيمة اجتماعية.',
    formula: 'SROI = القيمة الاجتماعية / الاستثمار',
  },
  {
    id: 'multiplier',
    labelAr: 'المضاعف الكينزي',
    labelEn: 'Keynesian Multiplier',
    short: 'Keynesian-style market ripple',
    category: 'core',
    body:
      'يمثل الأثر السوقي (الـ GDP ripple) للاستثمار عبر ثلاث مراحل: دخل مباشر للمستفيدين، ثم مشتريات لسلسلة التوريد (غير مباشر)، ثم استهلاك العمال (مستحث) — مع خصم التسريب للخارج. يقيس المعاملات السوقية لا الرفاه الاجتماعي.',
    example: '1 ريال → 0.60 دخل مباشر → 0.24 supply chain → 0.12 worker consumption.',
    formula: 'Multiplier = (مباشر + غير مباشر + مستحث) × (1 − تسريب)',
  },
  {
    id: 'diminishing',
    labelAr: 'تناقص العائد',
    labelEn: 'Diminishing Returns',
    short: 'D(x) = D_max × (1 − e^(−λx))',
    category: 'engine',
    body:
      'مع زيادة التخصيص في قطاع ما، يقلّ العائد على كل ريال إضافي. السوق والمستفيدون يقتربون من التشبع، لذا يُنمذج الأثر بدالة أسية: Impact = Max × (1 − e^(−λ·x)).',
    example: 'الريال الإضافي في قطاع مشبع يشتري مستفيدين أقل من سابقه.',
    formula: 'Impact = Max × (1 − e^(−λ·x))',
  },
  {
    id: 'opportunity',
    labelAr: 'تكلفة الفرصة البديلة',
    labelEn: 'Opportunity Cost',
    short: 'What you give up',
    category: 'core',
    body:
      'قيمة أفضل بديل تُتخلى عنه عند اتخاذ القرار. تخصيص 1M ريال للتعليم يعني التخلي عن ما كان يمكن تحقيقه بنفس الريال في الإسكان أو التوظيف — لذلك يُقارن العائد الحدي بين القطاعات.',
    example: 'التحرك يمينًا على PPF (مزيد SROI) = خسارة في Economic Impact.',
  },
  {
    id: 'resilience',
    labelAr: 'مؤشر المرونة',
    labelEn: 'Resilience Score',
    short: 'How robust is the portfolio?',
    category: 'analysis',
    body:
      'مؤشر مركّب يقيس مدى صمود المحفظة أمام الصدمات: تنويع (1−HHI)، واستقلالية عن مصدر تمويل، وcounter-cyclicality، وثبات الأثر تحت الصدمات. كلما ارتفع = المحفظة تصمد أمام الأزمات.',
    formula: 'Resilience = 0.3×(1−HHI) + 0.3×(1−Dependency) + 0.2×CounterCyclicality + 0.2×(1−λ)',
  },
  {
    id: 'ppf',
    labelAr: 'منحنى إمكانيات الإنتاج',
    labelEn: 'PPF — Production Possibility Frontier',
    short: 'Trade-off frontier between two outputs',
    category: 'core',
    body:
      'منحنى كلاسيكي في الاقتصاد يوضح أقصى ما يمكن إنتاجه من سلعتين بموارد محدودة. هنا: SROI Social Value vs Economic Multiplier Impact. أي نقطة على المنحنى = efficient، تحته = inefficient.',
  },
  {
    id: 'pareto',
    labelAr: 'حد باريتو',
    labelEn: 'Pareto Frontier',
    short: 'Set of efficient portfolios',
    category: 'engine',
    body:
      'مجموعة النقاط التي لا يمكن تحسين أي بُعد إلا بتضحية بُعد آخر. سُمّيت على اسم الاقتصادي الإيطالي فيلفريدو باريتو.',
  },
  {
    id: 'hhi',
    labelAr: 'مؤشر هيرفندال-هيرشمان',
    labelEn: 'Herfindahl-Hirschman Index',
    short: 'Measure of concentration',
    category: 'engine',
    body:
      'مقياس للتركيز: مجموع مربعات الحصص. 0 = تام التنويع، 1 = تام التركيز. HHI > 0.4 = محفظة مركّزة بشدة.',
  },
  {
    id: 'time-discounting',
    labelAr: 'الخصم الزمني',
    labelEn: 'Time Discounting',
    short: 'NPV across years',
    category: 'engine',
    body:
      'تحويل أثر السنوات القادمة إلى قيمة حالية. NPV = Σ Impact_t / (1+r)^t. معدل الخصم الافتراضي 3% (UK Treasury Green Book).',
    example: 'أثر 1M ريال في السنة 5 = 1M / (1.03)^5 = 862K ريال حاضرًا.',
  },
  {
    id: 'leakage',
    labelAr: 'التسرب الاقتصادي',
    labelEn: 'Leakage',
    short: 'Share that leaves the local economy',
    category: 'engine',
    body:
      'نسبة الإنفاق الذي يخرج من الاقتصاد المحلي (واردات، تحويلات للخارج). يخفض multiplier. الإسكان مثلًا: leakage عالٍ بسبب واردات مواد البناء.',
  },
  {
    id: 'stress-test',
    labelAr: 'اختبار الصدمات',
    labelEn: 'Stress Test',
    short: 'How does the portfolio fare under shock?',
    category: 'analysis',
    body:
      'محاكاة المحفظة تحت سيناريوهات صعبة (pandemic, oil shock, inflation). يُحسب impact retention = % المتبقي من الأثر.',
  },
  {
    id: 'sensitivity',
    labelAr: 'تحليل الحساسية',
    labelEn: 'Sensitivity Analysis',
    short: 'Tornado chart',
    category: 'analysis',
    body:
      'يختبر كيف يتغير الناتج (±10%) لكل افتراض. الأطول في Tornado = الأكثر تأثيرًا. يكشف أي مدخلات تستحق دقة أكثر.',
  },
];

export function getGlossaryTerm(id: GlossaryTermId): GlossaryTerm | undefined {
  return GLOSSARY_TERMS.find((t) => t.id === id);
}

export { CATEGORY as GLOSSARY_CATEGORIES };
