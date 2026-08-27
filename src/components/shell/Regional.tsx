import { useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import { useLabStore } from '../../state/labStore';
import { REGIONS } from '../../data/regions';
import { populationBasedAllocation, gapBasedAllocation, compareAllocations } from '../../engine/regional';
import { formatSAR, formatPercent } from '../../lib/format';
import { EvidenceBadge } from '../shared/EvidenceBadge';

export function Regional() {
  const setStage = useLabStore((s) => s.setStage);
  const [strategy, setStrategy] = useState<'population' | 'gap' | 'compare'>('compare');

  const popAlloc = useMemo(() => populationBasedAllocation(REGIONS, 100_000_000), []);
  const gapAlloc = useMemo(() => gapBasedAllocation(REGIONS, 100_000_000), []);
  const comparison = useMemo(() => compareAllocations(popAlloc, gapAlloc), [popAlloc, gapAlloc]);

  return (
    <div className="min-h-screen pt-20 px-4 md:px-8 pb-12">
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-6xl mx-auto"
      >
        <div className="mb-8">
          <div className="text-[10px] tracking-[0.3em] uppercase text-gold font-mono">
            Stage 09 / Regional
          </div>
          <h1 className="text-3xl md:text-4xl text-ivory font-light mt-2">
            التحليل الإقليمي
          </h1>
          <p className="text-ivory/60 mt-2 text-sm">
            How should 100M SAR be distributed across Saudi's 13 regions?
            <br />
            <span className="text-ivory/40 text-xs">
              Two strategies: Population-based vs Gap-based. We do NOT assume lower-development regions always yield higher returns.
            </span>
          </p>
        </div>

        {/* Strategy selector */}
        <div className="flex gap-2 mb-6">
          {(['population', 'gap', 'compare'] as const).map((s) => (
            <button
              key={s}
              onClick={() => setStrategy(s)}
              className={`text-xs px-3 py-2 font-mono uppercase tracking-wider border ${
                strategy === s
                  ? 'border-gold text-gold bg-gold/10'
                  : 'border-ivory/15 text-ivory/60 hover:border-ivory/40'
              }`}
            >
              {s === 'population' ? 'سكان' : s === 'gap' ? 'فجوة' : 'مقارنة'}
            </button>
          ))}
        </div>

        {/* List */}
        {strategy !== 'compare' && (
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            className="glass-panel terminal-border p-6 mb-6"
          >
            <div className="text-[10px] tracking-widest uppercase text-gold font-mono mb-4">
              {strategy === 'population' ? 'Population-Based' : 'Gap-Based'} Allocation
            </div>
            <div className="space-y-2">
              {(strategy === 'population' ? popAlloc : gapAlloc).map((r) => {
                const region = REGIONS.find((rg) => rg.id === r.regionId);
                return (
                  <div key={r.regionId} className="flex items-center gap-3 text-xs">
                    <div className="w-32 text-ivory/80 flex-shrink-0">{r.arName}</div>
                    <div className="flex-1 h-5 bg-midnight-700 rounded-sm overflow-hidden">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${r.share * 100}%` }}
                        transition={{ duration: 0.6 }}
                        className="h-full bg-gradient-to-l from-gold to-emerald"
                      />
                    </div>
                    <div className="w-24 text-right font-mono text-ivory/70 tabular-nums">
                      {formatSAR(r.amount, { compact: true })}
                    </div>
                    <div className="w-12 text-right font-mono text-gold tabular-nums">
                      {formatPercent(r.share, 1)}
                    </div>
                  </div>
                );
              })}
            </div>
            <div className="mt-4 text-[10px] text-ivory/40 font-mono leading-relaxed">
              <EvidenceBadge level="VERIFIED" size="xs" />
              <span className="ml-2">
                Data: NCNP Annual Report 2024 (5,754 organizations × 13 regions)
              </span>
            </div>
          </motion.div>
        )}

        {/* Comparison */}
        {strategy === 'compare' && (
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            className="glass-panel terminal-border p-6 mb-6"
          >
            <div className="text-[10px] tracking-widest uppercase text-gold font-mono mb-4">
              Side-by-Side Comparison
            </div>
            <div className="space-y-2">
              {comparison.map((c) => {
                const region = REGIONS.find((rg) => rg.id === c.regionId);
                return (
                  <div key={c.regionId} className="flex items-center gap-3 text-xs py-1.5">
                    <div className="w-24 text-ivory/80 flex-shrink-0">{c.arName}</div>
                    <div className="flex-1 flex items-center gap-2">
                      <div className="w-20 text-ivory/50 text-right font-mono">
                        {formatSAR(c.popAmount, { compact: true })}
                      </div>
                      <div className="flex-1 h-4 bg-midnight-700 rounded-sm relative overflow-hidden">
                        {/* Pop portion (gold) */}
                        <div
                          className="absolute inset-y-0 right-0 bg-gold/40"
                          style={{ width: `${(c.popAmount / 100_000_000) * 100 * 4}%` }}
                        />
                        {/* Gap portion (emerald) overlaid */}
                        <div
                          className="absolute inset-y-0 right-0 bg-emerald/60"
                          style={{
                            width: `${(c.gapAmount / 100_000_000) * 100 * 4}%`,
                            mixBlendMode: 'screen',
                          }}
                        />
                      </div>
                      <div className="w-20 text-ivory/70 font-mono">
                        {formatSAR(c.gapAmount, { compact: true })}
                      </div>
                    </div>
                    <div
                      className={`w-14 text-right font-mono text-[10px] ${
                        c.diff > 0 ? 'text-emerald-400' : c.diff < 0 ? 'text-red-400' : 'text-ivory/30'
                      }`}
                    >
                      {c.diff > 0 ? '+' : ''}
                      {formatPercent(c.diffPct / 100, 0)}
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="mt-6 pt-4 border-t border-ivory/10 grid md:grid-cols-2 gap-4 text-xs">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-gold/60" />
                <span className="text-ivory/70">Population-Based</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-emerald/60" />
                <span className="text-ivory/70">Gap-Based</span>
              </div>
            </div>

            <div className="mt-4 text-[10px] text-ivory/40 leading-relaxed font-mono">
              Gap-based يوجه التمويل للمناطق ذات التغطية المنخفضة من المنظمات
              غير الربحية نسبةً لعدد السكان. مثال: المنطقة الشرقية بـ coverage
              index 0.55 تحصل على حصة أكبر.
            </div>
          </motion.div>
        )}

        {/* Key insight */}
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="glass-panel p-6 mb-6"
        >
          <div className="text-[10px] tracking-widest uppercase text-gold font-mono mb-2">
            Key Insight
          </div>
          <div className="text-sm text-ivory/80 leading-relaxed">
            الفرق بين الاستراتيجيتين ليس مجرد رياضيات — هو <span className="text-gold">قيمة</span>:
            <br />
            <span className="text-ivory/70">
              • السكان: انصاف وعدالة سكانية (كل شخص يحصل نصيبه)
            </span>
            <br />
            <span className="text-ivory/70">
              • الفجوة: تصحيح اختلال تاريخي في التغطية
            </span>
            <br />
            <span className="text-yellow-300">
              ⚠ لا يوجد "صحيح" مطلق. القرار يعتمد على القيمة المُقدّمة.
            </span>
          </div>
        </motion.div>

        {/* Nav */}
        <div className="flex gap-3">
          <button
            onClick={() => setStage('capitalStack')}
            className="flex-1 py-3 border border-ivory/20 text-ivory/70 text-xs font-mono tracking-widest uppercase hover:bg-ivory/5"
          >
            ← Capital Stack
          </button>
          <button
            onClick={() => setStage('brief')}
            className="flex-1 py-3 border border-gold/30 text-gold text-xs font-mono tracking-widest uppercase hover:bg-gold/10"
          >
            → Policy Brief
          </button>
        </div>
      </motion.div>
    </div>
  );
}
