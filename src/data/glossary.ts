export type GlossaryTermId = 'sroi' | 'multiplier' | 'diminishing' | 'opportunity' | 'resilience';

export interface GlossaryTerm {
  id: GlossaryTermId;
  labelAr: string;
  labelEn: string;
  body: string;
  formula?: string;
}

export const GLOSSARY_TERMS: GlossaryTerm[] = [
  {
    id: 'sroi',
    labelAr: 'العائد الاجتماعي على الاستثمار',
    labelEn: 'SROI — Social Return on Investment',
    body:
      'يقيس القيمة الاجتماعية المولّدة مقابل كل ريال يُستثمر. يحوّل النتائج الاجتماعية (صحة، تعليم، تمكين) إلى قيمة مالية من خلال مقاييس مالية، مع خصم deadweight (ما كان سيحدث دون تدخل) و attribution و displacement.',
    formula: 'SROI = القيمة الاجتماعية / الاستثمار',
  },
  {
    id: 'multiplier',
    labelAr: 'المضاعف الكينزي',
    labelEn: 'Keynesian Multiplier',
    body:
      'يمثل الأثر السوقي (الـ GDP ripple) للاستثمار عبر ثلاث مراحل: دخل مباشر للمستفيدين، ثم مشتريات لسلسلة التوريد (غير مباشر)، ثم استهلاك العمال (مستحث) — مع خصم التسريب للخارج. يقيس المعاملات السوقية لا الرفاه الاجتماعي.',
    formula: 'Multiplier = (مباشر + غير مباشر + مستحث) × (1 − تسريب)',
  },
  {
    id: 'diminishing',
    labelAr: 'تناقص العائد',
    labelEn: 'Diminishing Returns',
    body:
      'مع زيادة التخصيص في قطاع ما، يقلّ العائد على كل ريال إضافي. السوق والمستفيدون يقتربون من التشبع، لذا يُنمذج الأثر بدالة أسية: Impact = Max × (1 − e^(−λ·x)).',
    formula: 'Impact = Max × (1 − e^(−λ·x))',
  },
  {
    id: 'opportunity',
    labelAr: 'تكلفة الفرصة البديلة',
    labelEn: 'Opportunity Cost',
    body:
      'قيمة أفضل بديل تُتخلى عنه عند اتخاذ القرار. تخصيص 1M ريال للتعليم يعني التخلي عن ما كان يمكن تحقيقه بنفس الريال في الإسكان أو التوظيف — لذلك يُقارن العائد الحدي بين القطاعات.',
  },
  {
    id: 'resilience',
    labelAr: 'مؤشر المرونة',
    labelEn: 'Resilience Score',
    body:
      'يقيس مدى صمود محفظة الاستثمارات الاجتماعي أمام الصدمات الاقتصادية أو تقلبات السوق. يُحسب من تركّز التخصيص (HHI) والاعتماد على قطاع واحد، وقدرة القطاعات على الأداء أثناء الأزمات. محفظة متنوعة تحقق مرونة أعلى.',
    formula: 'Resilience = 0.3×(1−HHI) + 0.3×(1−Dependency) + 0.2×CounterCyclicality + 0.2×(1−λ)',
  },
];

export function getGlossaryTerm(id: GlossaryTermId): GlossaryTerm | undefined {
  return GLOSSARY_TERMS.find((t) => t.id === id);
}
