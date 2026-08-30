import { useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import { useLabStore } from '../../state/labStore';
import { SECTORS, TOTAL_BUDGET } from '../../data/sectors';
import { analyzeEconomicGoal, weightsToAllocation } from '../../engine/advisor';
import { formatPercent } from '../../lib/format';
import { EvidenceBadge } from '../shared/EvidenceBadge';

/**
 * "اكتب هدفك الاقتصادي" — free-text economic goal advisor.
 * Runs the deterministic keyword engine (src/engine/advisor) over what the
 * user types and lets them apply the suggested weights to the portfolio.
 */
export function EconomicAdvisor() {
  const setAllAllocations = useLabStore((s) => s.setAllAllocations);
  const [input, setInput] = useState('');

  const result = useMemo(() => analyzeEconomicGoal(input), [input]);
  const show = input.trim().length > 2;

  const allocation = useMemo(
    () => weightsToAllocation(result.recommendedWeights, TOTAL_BUDGET),
    [result]
  );

  const weightsSum = useMemo(
    () => Object.values(result.recommendedWeights).reduce((s, v) => s + v, 0),
    [result]
  );

  return (
    <div className="glass-panel terminal-border p-6">
      <div className="flex items-center justify-between mb-1">
        <div className="text-[10px] tracking-widest uppercase text-gold font-mono">
          Economic Goal / اكتب هدفك الاقتصادي
        </div>
        <EvidenceBadge level="SIMULATION_ASSUMPTION" size="xs" />
      </div>

      <div className="text-xs text-ivory/60 mb-4">
        عبّر عن هدفك بأسلوبك (عربي أو إنجليزي) — يعرض المستشار نصيحة ونسب تخصيص مقترحة لكل قطاع.
      </div>

      {/* Goal input */}
      <div className="max-w-2xl">
        <textarea
          value={input}
          onChange={(e) => setInput(e.target.value)}
          rows={2}
          placeholder="مثال: أريد رفع فرص العمل ودعم التمكين الاقتصادي…"
          className="w-full bg-midnight-800/60 border border-ivory/15 rounded px-3 py-2 text-sm text-ivory placeholder:text-ivory/30 focus:outline-none focus:border-gold/50 resize-none leading-relaxed"
        />
        <div className="mt-2 flex items-center gap-3">
          <span className="text-[10px] text-ivory/35 font-mono">
            {input.trim().length > 2 ? 'تحليل مباشر أثناء الكتابة…' : 'اكتب هدفك (3 أحرف على الأقل) ليبدأ التحليل'}
          </span>
        </div>
      </div>

      {/* Feedback */}
      {show ? (
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          className="mt-5"
        >
          {/* Advisor feedback box */}
          <div className="border border-gold/25 bg-gold/[0.04] rounded p-3 text-xs text-ivory/80 leading-relaxed mb-4">
            <span className="text-gold font-medium">نصيحة المستشار: </span>
            {result.advice}
          </div>

          <div className="flex items-center justify-between mb-3">
            <span className="text-[10px] tracking-widest uppercase text-[#10b981] font-mono">
              Recommended Allocation
            </span>
            <span className="text-[10px] text-ivory/40 font-mono tabular-nums">
              Σ {formatPercent(weightsSum / 100, 0)}
            </span>
          </div>

          {/* Weight bars */}
          <div className="space-y-1.5">
            {SECTORS.map((s) => {
              const w = result.recommendedWeights[s.id] ?? 0;
              return (
                <div key={s.id} className="flex items-center gap-3 text-xs">
                  <div className="w-28 text-ivory/70 truncate flex items-center gap-1.5">
                    <span className="inline-block w-2 h-2 rounded-sm flex-shrink-0" style={{ backgroundColor: s.color }} />
                    {s.arName}
                  </div>
                  <div className="flex-1 h-3.5 relative overflow-hidden rounded-sm bg-midnight-800/60 border border-ivory/10">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${w}%` }}
                      transition={{ duration: 0.5 }}
                      className="h-full bg-gradient-to-r from-[#d4a017] to-[#f0c14b]"
                    />
                  </div>
                  <div className="w-14 text-left font-mono text-gold tabular-nums">
                    {w}%
                  </div>
                </div>
              );
            })}
          </div>

          <div className="mt-4 flex flex-wrap items-center gap-4">
            <button
              onClick={() => setAllAllocations(allocation)}
              className="text-[10px] text-gold hover:text-gold-light font-mono tracking-widest uppercase"
            >
              Apply to Portfolio →
            </button>
            {result.matched ? (
              <span className="text-[9px] text-ivory/35 font-mono">matched scenario</span>
            ) : (
              <span className="text-[9px] text-ivory/35 font-mono">balanced fallback</span>
            )}
          </div>
        </motion.div>
      ) : (
        <div className="mt-5 text-xs text-ivory/35">
          اكتب هدفك الاقتصادي (3 أحرف فأكثر) ليُظهر المستشار نصيحته ونسب التخصيص المقترحة مباشرة.
        </div>
      )}
    </div>
  );
}
