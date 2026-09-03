import { useMemo, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { SECTORS } from '../../data/sectors';
import { useLabStore } from '../../state/labStore';
import { calculateAtharScore, type AtharDimensionKey } from '../../engine/impactScore';
import { EvidenceBadge } from '../shared/EvidenceBadge';

const DIM_META: Record<AtharDimensionKey, { ar: string; en: string; color: string }> = {
  economic: { ar: 'الأثر الاقتصادي', en: 'Economic Impact', color: '#2dd4bf' },
  social: { ar: 'الأثر الاجتماعي', en: 'Social Impact', color: '#10b981' },
  employment: { ar: 'التوظيف', en: 'Employment', color: '#f59e0b' },
  risk: { ar: 'سلامة المخاطر', en: 'Risk Safety', color: '#fb7185' },
  time: { ar: 'زمن الأثر', en: 'Time to Impact', color: '#8b5cf6' },
};

const DIM_KEYS: AtharDimensionKey[] = ['economic', 'social', 'employment', 'risk', 'time'];

export function AtharScorePanel() {
  const allocations = useLabStore((s) => s.allocations);
  const atharWeights = useLabStore((s) => s.atharWeights);
  const setAtharWeight = useLabStore((s) => s.setAtharWeight);
  const resetAtharWeights = useLabStore((s) => s.resetAtharWeights);
  const resetModel = useLabStore((s) => s.resetModel);
  const discountRate = useLabStore((s) => s.discountRate);
  const horizon = useLabStore((s) => s.horizon);

  const [showWeights, setShowWeights] = useState(false);
  const [expanded, setExpanded] = useState<AtharDimensionKey | null>('economic');

  const result = useMemo(
    () => calculateAtharScore(SECTORS, allocations, atharWeights, discountRate, horizon),
    [allocations, atharWeights, discountRate, horizon]
  );

  const totalAllocated = Object.values(allocations).reduce((s, v) => s + v, 0);
  const isEmpty = totalAllocated <= 0;

  const badgeColor =
    result.overall >= 80 ? 'text-emerald-300' : result.overall >= 60 ? 'text-gold' : 'text-red-400';

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      className="glass-panel terminal-border p-6 mt-4"
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-4 flex-wrap gap-2">
        <div className="text-[10px] tracking-widest uppercase text-gold font-mono">
          ATHAR Impact Score {/* composite */}
        </div>
        <div className="flex items-center gap-2">
          <EvidenceBadge level="SIMULATION_ASSUMPTION" size="xs" />
          <button
            onClick={() => setShowWeights(!showWeights)}
            className="text-[10px] px-2 py-1 font-mono uppercase border border-ivory/20 text-ivory/60 hover:text-gold hover:border-gold/40"
          >
            {showWeights ? 'Hide Weights' : 'Adjust Weights'}
          </button>
        </div>
      </div>

      {/* Level 1 — the big score */}
      <div className="flex items-center gap-6 flex-wrap">
        <div className="relative w-28 h-28">
          <svg viewBox="0 0 100 100" className="w-full h-full">
            <circle cx="50" cy="50" r="42" fill="none" stroke="rgba(240,230,211,0.08)" strokeWidth="9" />
            <motion.circle
              cx="50"
              cy="50"
              r="42"
              fill="none"
              stroke={result.overall >= 80 ? '#10b981' : result.overall >= 60 ? '#d4a017' : '#fb7185'}
              strokeWidth="9"
              strokeLinecap="round"
              strokeDasharray={`${(result.overall / 100) * 264} 264`}
              transform="rotate(-90 50 50)"
              initial={{ strokeDasharray: '0 264' }}
              animate={{ strokeDasharray: `${(result.overall / 100) * 264} 264` }}
              transition={{ duration: 1 }}
            />
            <text
              x="50"
              y="52"
              textAnchor="middle"
              dominantBaseline="middle"
              fill={result.overall >= 80 ? '#10b981' : result.overall >= 60 ? '#d4a017' : '#fb7185'}
              fontSize="22"
              fontFamily="JetBrains Mono, monospace"
            >
              {result.overall}
            </text>
          </svg>
        </div>

        <div className="flex-1 min-w-[220px]">
          <div className={`text-2xl font-mono tabular-nums ${badgeColor}`}>
            {result.overall} / 100
          </div>
          <div className="text-[11px] text-ivory/60 mt-1">
            Athar Impact Score — درجة مركبة مرجّحة من 5 أبعاد.
          </div>
          <div className="text-[11px] text-ivory/50 mt-1 leading-relaxed">
            الأوزان المعروضة قابلة للتعديل أدناه. النتيجة <span className="text-ivory/70">نسبية</span> وليست توقّعًا.
          </div>
          {isEmpty && (
            <div className="mt-2 text-[11px] text-red-300">
              Allocation must be &gt; 0 before running the score.
            </div>
          )}
        </div>
      </div>

      {/* Level 2 — dimensions with weights */}
      <div className="mt-5 grid gap-2">
        {result.dimensions.map((d) => {
          const meta = DIM_META[d.key];
          const pct = Math.round(d.weight * 100);
          const active = expanded === d.key;
          return (
            <div key={d.key} className="border border-ivory/10 rounded-sm overflow-hidden">
              <button
                onClick={() => setExpanded(active ? null : d.key)}
                className="w-full flex items-center gap-3 px-3 py-2 hover:bg-ivory/5 text-left"
              >
                <span className="w-2.5 h-2.5 rounded-sm flex-shrink-0" style={{ backgroundColor: meta.color }} />
                <span className="w-32 text-xs text-ivory/80">{meta.ar}</span>
                <div className="flex-1 h-1.5 bg-ivory/10 rounded-full overflow-hidden">
                  <motion.div
                    className="h-full rounded-full"
                    style={{ backgroundColor: meta.color }}
                    initial={{ width: 0 }}
                    animate={{ width: `${d.score}%` }}
                    transition={{ duration: 0.8 }}
                  />
                </div>
                <span className="w-10 text-right font-mono text-sm text-ivory tabular-nums">{d.score}</span>
                <span className="w-14 text-right font-mono text-[10px] text-ivory/40">w={pct}%</span>
                <span className="text-ivory/30">{active ? '▾' : '▸'}</span>
              </button>
              <AnimatePresence>
                {active && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    className="px-3 pb-3"
                  >
                    <button
                      className="text-[11px] text-gold/80 hover:text-gold"
                      onClick={(e) => {
                        e.stopPropagation();
                        setExpanded(null);
                      }}
                    >
                      {meta.en} — why?
                    </button>
                    <p className="text-[11px] text-ivory/60 leading-relaxed mt-1">{d.whyAr}</p>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          );
        })}
      </div>

      {/* Level 3 — overall why */}
      <div className="mt-4 pt-4 border-t border-ivory/10">
        <div className="text-[10px] tracking-widest uppercase text-gold font-mono mb-2">
          Why This Result?
        </div>
        <p className="text-sm text-ivory/80 leading-relaxed">{result.insightAr}</p>
      </div>

      {/* Weight editor */}
      <AnimatePresence>
        {showWeights && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden"
          >
            <div className="mt-4 pt-4 border-t border-ivory/10">
              <div className="flex items-center justify-between mb-3">
                <div className="text-[10px] tracking-widest uppercase text-ivory/50 font-mono">
                  Weights — sum {Math.round(result.weightSum * 100)}%
                </div>
                <button
                  onClick={resetAtharWeights}
                  className="text-[10px] px-2 py-1 font-mono uppercase border border-gold/30 text-gold hover:bg-gold/10"
                >
                  Reset
                </button>
              </div>
              <div className="grid md:grid-cols-2 gap-3">
                {DIM_KEYS.map((key) => {
                  const meta = DIM_META[key];
                  const val = atharWeights[key];
                  return (
                    <label key={key} className="flex items-center gap-3">
                      <span className="w-28 text-[11px] text-ivory/70">{meta.ar}</span>
                      <input
                        type="range"
                        min={0}
                        max={0.6}
                        step={0.05}
                        value={val}
                        onChange={(e) => setAtharWeight(key, parseFloat(e.target.value))}
                        className="flex-1 accent-[#d4a017]"
                      />
                      <span className="w-10 text-right font-mono text-[11px] text-ivory tabular-nums">
                        {Math.round(val * 100)}%
                      </span>
                    </label>
                  );
                })}
              </div>
              <p className="mt-2 text-[10px] text-ivory/40 font-mono">
                Weights are normalized automatically; Economic &amp; Social default to 30%, Employment 20%, Risk &amp; Time 10%.
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Reset model — full model back to base case */}
      <div className="mt-4 pt-3 border-t border-ivory/10 flex items-center justify-between gap-3">
        <span className="text-[10px] text-ivory/40">
          Reset to SAR 100M · Default allocation · Base case · Default weights
        </span>
        <button
          onClick={resetModel}
          className="text-[10px] px-2.5 py-1 font-mono uppercase border border-ivory/20 text-ivory/60 hover:text-red-300 hover:border-red-400/40 transition-colors"
        >
          RESET MODEL
        </button>
      </div>
    </motion.div>
  );
}
