import { useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import { useLabStore } from '../../state/labStore';
import { SECTORS } from '../../data/sectors';
import { sectorMin, sectorMax } from '../../lib/budget';
import { formatPercent } from '../../lib/format';
import { EvidenceBadge } from '../shared/EvidenceBadge';

interface AdvisorRule {
  id: string;
  label: string;
  match: string[];
  allocation: Record<string, number>;
  rationale: string;
}

const RULES: AdvisorRule[] = [
  {
    id: 'jobs-lowrisk',
    label: 'وظائف + مخاطر منخفضة',
    match: ['وظائف', 'فرص عمل', 'عمل', 'توظيف', 'jobs', 'employment', 'work', 'مخاطر', 'risk', 'أمان', 'توازن'],
    allocation: {
      employment: 30_000_000,
      education: 25_000_000,
      women: 15_000_000,
      health: 10_000_000,
      housing: 10_000_000,
      environment: 5_000_000,
      hajj: 5_000_000,
    },
    rationale:
      'لزيادة فرص العمل مع تقليل المخاطر، يرفع النموذج حصة التوظيف والتمكين (عائد مباشر مرتفع وظيفيًا) مع توزيع واسع يخفض تركيز المحفظة والـHHI — وبالتالي يخفض مخاطرها.',
  },
  {
    id: 'max-impact',
    label: 'أقصى أثر اجتماعي',
    match: ['أثر', 'اجتماعي', 'impact', 'social', 'أكبر أثر', 'قيمة'],
    allocation: {
      education: 50_000_000,
      health: 15_000_000,
      housing: 15_000_000,
      employment: 10_000_000,
      women: 5_000_000,
      environment: 2_000_000, // clamped by setter
      hajj: 3_000_000,
    },
    rationale:
      'لتعظيم الأثر الاجتماعي يعطي النموذج أولوية قصوى للتعليم (أعلى عائد اجتماعي SROI) لأن نتائجه تتراكم عبر الزمن وتنعكس على الأسر والأجيال.',
  },
  {
    id: 'sustainability',
    label: 'استدامة + بيئة',
    match: ['استدامة', 'بيئة', 'مناخ', 'sustain', 'environment', 'climate', 'أخضر'],
    allocation: {
      environment: 35_000_000,
      education: 20_000_000,
      housing: 15_000_000,
      employment: 15_000_000,
      women: 5_000_000,
      health: 5_000_000,
      hajj: 5_000_000,
    },
    rationale:
      'يرفع النموذج حصة البيئة والاستدامة لأن آثارها عالية الثبات على المدى الطويل، مع بقاء توازن في التعليم والإسكان والتوظيف.',
  },
  {
    id: 'balanced',
    label: 'محفظة متوازنة',
    match: ['متوازن', 'توازن', 'جميع', 'balanced', 'all', 'متنوع', 'تنويع'],
    allocation: {
      education: 20_000_000,
      health: 15_000_000,
      housing: 15_000_000,
      employment: 20_000_000,
      women: 10_000_000,
      environment: 10_000_000,
      hajj: 10_000_000,
    },
    rationale:
      'المحفظة المتوازنة توزّع رأس المال بالتساوي النسبي، مما يحسّن الإنصاف والمرونة ويقلل المخاطر عبر التنويع دون تركيز زائد في أي قطاع.',
  },
];

function clampAlloc(alloc: Record<string, number>, budget: number): Record<string, number> {
  const out: Record<string, number> = {};
  for (const s of SECTORS) {
    const raw = alloc[s.id] ?? 0;
    out[s.id] = Math.max(sectorMin(s, budget), Math.min(sectorMax(s, budget), raw));
  }
  // Rebalance to budget
  let sum = Object.values(out).reduce((a, b) => a + b, 0);
  const deficit = budget - sum;
  if (Math.abs(deficit) > 1) {
    const flexible = SECTORS.filter(
      (s) =>
        (out[s.id] ?? 0) + deficit / SECTORS.length <= sectorMax(s, budget) &&
        (out[s.id] ?? 0) + deficit / SECTORS.length >= sectorMin(s, budget)
    );
    const pool = flexible.length ? flexible : SECTORS;
    for (const s of pool) out[s.id] = (out[s.id] ?? 0) + deficit / pool.length;
  }
  return out;
}

/**
 * ATHAR INTELLIGENCE — rule-based economic decision-support prototype.
 * Clearly NOT a real AI model; a transparent rules layer over the model.
 */
export function AdvisorPanel() {
  const setAllAllocations = useLabStore((s) => s.setAllAllocations);
  const totalBudget = useLabStore((s) => s.totalBudget);

  const [input, setInput] = useState('');
  const [active, setActive] = useState<string | null>(null);

  const recommendation = useMemo(() => {
    const selected = active
      ? RULES.find((r) => r.id === active) ?? null
      : RULES.find((r) => r.match.some((m) => (input || '').toLowerCase().includes(m.toLowerCase()))) ?? null;
    return selected;
  }, [input, active]);

  const alloc = useMemo(
    () => (recommendation ? clampAlloc(recommendation.allocation, totalBudget) : null),
    [recommendation, totalBudget]
  );

  return (
    <div className="glass-panel terminal-border p-6">
      <div className="flex items-center justify-between mb-1">
        <div className="text-[10px] tracking-widest uppercase text-gold font-mono">
          ATHAR INTELLIGENCE
        </div>
        <EvidenceBadge level="SIMULATION_ASSUMPTION" size="xs" />
      </div>
      <div className="text-xs text-ivory/60 mb-4">
        مساعد قرار مبني على قواعد النموذج — نموذج أولي لدعم القرار وليس AI حقيقي
      </div>

      {/* Intent buttons */}
      <div className="flex flex-wrap gap-2 mb-4">
        {RULES.map((r) => (
          <button
            key={r.id}
            onClick={() => {
              setActive(r.id);
              setInput('');
            }}
            className={`px-3 py-1.5 text-xs font-mono rounded-full border transition cursor-pointer ${
              active === r.id
                ? 'border-gold text-gold-light bg-gold/10'
                : 'border-ivory/15 text-ivory/60 hover:border-gold/40 hover:text-ivory'
            }`}
          >
            {r.label}
          </button>
        ))}
      </div>

      {/* Text input */}
      <div className="max-w-xl">
        <label className="text-[10px] text-ivory/40 font-mono">
          أو اكتب هدفك الاقتصادي (عربي/إنجليزي):
        </label>
        <input
          value={input}
          onChange={(e) => {
            setInput(e.target.value);
            setActive(null);
          }}
          placeholder="أريد زيادة فرص العمل مع تقليل المخاطر"
          className="mt-1 w-full bg-midnight-800/60 border border-ivory/15 rounded px-3 py-2 text-sm text-ivory placeholder:text-ivory/30 focus:outline-none focus:border-gold/50"
        />
      </div>

      {/* Recommendation */}
      {recommendation && alloc ? (
        <motion.div
          key={recommendation.id}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          className="mt-5"
        >
          <div className="flex items-center gap-2 mb-4">
            <span className="text-[10px] tracking-widest uppercase text-[#10b981] font-mono">
              Recommended Allocation
            </span>
          </div>
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <div className="space-y-1.5">
                {SECTORS.map((s) => {
                  const a = alloc[s.id] ?? 0;
                  return (
                    <div key={s.id} className="flex items-center gap-2 text-xs">
                      <div className="w-2 h-2 rounded-sm flex-shrink-0" style={{ backgroundColor: s.color }} />
                      <div className="flex-1 text-ivory/70 truncate">{s.arName}</div>
                      <div className="font-mono text-gold tabular-nums">
                        {formatPercent(a / totalBudget, 0)}
                      </div>
                    </div>
                  );
                })}
              </div>
              <button
                onClick={() => setAllAllocations(alloc)}
                className="mt-4 text-[10px] text-gold hover:text-gold-light font-mono"
              >
                Apply to Portfolio →
              </button>
            </div>
            <div className="text-xs text-ivory/70 leading-relaxed flex items-start">
              <span className="text-gold/70 mr-1">لماذا؟</span>
              <span>{recommendation.rationale}</span>
            </div>
          </div>
        </motion.div>
      ) : (
        <div className="mt-5 text-xs text-ivory/35">
          اختر هدفًا من الأعلى، أو اكتب هدفك بلغتك ليحلله النموذج.
        </div>
      )}
    </div>
  );
}
