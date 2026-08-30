import { useMemo } from 'react';
import { motion } from 'framer-motion';
import { useLabStore } from '../../state/labStore';
import { optimizeAllocation, compareToUser } from '../../engine/optimizer';
import { SECTORS } from '../../data/sectors';
import { computePortfolioMetrics } from '../../engine/portfolio';
import { formatSAR, formatPercent, formatNumber, formatSROIRange } from '../../lib/format';
import { StageNav } from '../shared/StageNav';

export function Optimization() {
  const allocations = useLabStore((s) => s.allocations);
  const objectiveWeights = useLabStore((s) => s.objectiveWeights);
  const setObjectiveWeight = useLabStore((s) => s.setObjectiveWeight);
  const setAllAllocations = useLabStore((s) => s.setAllAllocations);
  const discountRate = useLabStore((s) => s.discountRate);
  const horizon = useLabStore((s) => s.horizon);
  const setStage = useLabStore((s) => s.setStage);

  const optimized = useMemo(() => {
    const result = optimizeAllocation(SECTORS, 100_000_000, objectiveWeights);
    return compareToUser(result, allocations);
  }, [objectiveWeights, allocations]);

  const userMetrics = useMemo(
    () => computePortfolioMetrics(SECTORS, allocations, discountRate, horizon),
    [allocations, discountRate, horizon]
  );

  const optMetrics = useMemo(
    () => computePortfolioMetrics(SECTORS, optimized.allocation, discountRate, horizon),
    [optimized.allocation, discountRate, horizon]
  );

  const objectiveLabels: Record<string, { ar: string; en: string; color: string }> = {
    efficiency: { ar: 'الكفاءة', en: 'Efficiency', color: 'emerald' },
    impact: { ar: 'الأثر', en: 'Impact', color: 'gold' },
    equity: { ar: 'العدالة', en: 'Equity', color: 'blue' },
    sustainability: { ar: 'الاستدامة', en: 'Sustainability', color: 'purple' },
    resilience: { ar: 'المرونة', en: 'Resilience', color: 'rose' },
  };

  return (
    <div className="min-h-screen pt-20 px-4 md:px-8 pb-12">
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-6xl mx-auto"
      >
        <div className="mb-8">
          <div className="text-[10px] tracking-[0.3em] uppercase text-gold font-mono">
            Stage 03 / Optimization
          </div>
          <h1 className="text-3xl md:text-4xl text-ivory font-light mt-2">
            التحسين متعدد الأهداف
          </h1>
          <p className="text-ivory/60 mt-2 text-sm">
            اضبط أوزان أهدافك → النظام يحسب التخصيص الأمثل تحتها
            <br />
            <span className="text-ivory/40 text-xs">
              النتيجة: "Optimal under the selected objectives and assumptions" — لا
              توجد محفظة مثالية مطلقة
            </span>
          </p>
        </div>

        {/* Objective weights */}
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          className="glass-panel terminal-border p-6 mb-6"
        >
          <div className="text-[10px] tracking-widest uppercase text-gold font-mono mb-4">
            Objective Weights / أوزان الأهداف
          </div>
          <div className="grid md:grid-cols-5 gap-3">
            {Object.entries(objectiveWeights).map(([key, value]) => {
              const labels = objectiveLabels[key];
              return (
                <div key={key} className="space-y-1">
                  <div className="flex items-center justify-between">
                    <div className="text-xs text-ivory">{labels.ar}</div>
                    <div className="text-xs text-gold font-mono">{formatPercent(value, 0)}</div>
                  </div>
                  <input
                    type="range"
                    min={0}
                    max={1}
                    step={0.05}
                    value={value}
                    onChange={(e) =>
                      setObjectiveWeight(key as any, parseFloat(e.target.value))
                    }
                    className="w-full h-1 appearance-none cursor-pointer"
                    style={{ accentColor: '#10b981' }}
                  />
                  <div className="text-[9px] text-ivory/40 font-mono uppercase">
                    {labels.en}
                  </div>
                </div>
              );
            })}
          </div>
        </motion.div>

        {/* Comparison: Your vs Optimized */}
        <div className="grid md:grid-cols-2 gap-4 mb-6">
          {/* Your allocation */}
          <motion.div
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            className="glass-panel p-6"
          >
            <div className="text-[10px] tracking-widest uppercase text-ivory/50 font-mono mb-3">
              Your Allocation / تخصيصك
            </div>
            <div className="text-3xl text-gold font-mono tabular-nums">
              {formatNumber(userMetrics.totalBeneficiaries)}
            </div>
            <div className="text-[10px] text-ivory/50 mt-1">مستفيد مباشر</div>

            <div className="mt-4 space-y-1.5">
              {SECTORS.map((s) => {
                const a = allocations[s.id] ?? 0;
                const share = a / 100_000_000;
                return (
                  <div key={s.id} className="flex items-center gap-2 text-xs">
                    <div
                      className="w-2 h-2 rounded-sm flex-shrink-0"
                      style={{ backgroundColor: s.color }}
                    />
                    <div className="flex-1 text-ivory/70 truncate">{s.arName}</div>
                    <div className="font-mono text-ivory/50 tabular-nums w-12 text-right">
                      {formatPercent(share, 0)}
                    </div>
                  </div>
                );
              })}
            </div>
          </motion.div>

          {/* Optimized allocation */}
          <motion.div
            initial={{ opacity: 0, x: 10 }}
            animate={{ opacity: 1, x: 0 }}
            className="glass-panel p-6 border-gold/40"
          >
            <div className="flex items-center justify-between mb-3">
              <div className="text-[10px] tracking-widest uppercase text-gold font-mono">
                Optimized / الأمثل
              </div>
              <button
                onClick={() => setAllAllocations(optimized.allocation)}
                className="text-[10px] text-gold hover:text-gold-light font-mono"
              >
                Apply →
              </button>
            </div>
            <div className="text-3xl text-[#10b981] font-mono tabular-nums">
              {formatNumber(optMetrics.totalBeneficiaries)}
            </div>
            <div className="text-[10px] text-ivory/50 mt-1">مستفيد مباشر</div>

            <div className="mt-4 space-y-1.5">
              {SECTORS.map((s) => {
                const a = optimized.allocation[s.id] ?? 0;
                const share = a / 100_000_000;
                return (
                  <div key={s.id} className="flex items-center gap-2 text-xs">
                    <div
                      className="w-2 h-2 rounded-sm flex-shrink-0"
                      style={{ backgroundColor: s.color }}
                    />
                    <div className="flex-1 text-ivory/70 truncate">{s.arName}</div>
                    <div className="font-mono text-gold tabular-nums w-12 text-right">
                      {formatPercent(share, 0)}
                    </div>
                  </div>
                );
              })}
            </div>
          </motion.div>
        </div>

        {/* Key metrics comparison */}
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          className="glass-panel terminal-border p-6 mb-6"
        >
          <div className="text-[10px] tracking-widest uppercase text-gold font-mono mb-4">
            Comparison / مقارنة
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-center">
            <div>
              <div className="text-[10px] text-ivory/50 font-mono">Beneficiaries</div>
              <div className="text-lg text-ivory font-mono">
                {formatNumber(userMetrics.totalBeneficiaries)}
              </div>
              <div className="text-[10px] text-ivory/30 my-1">→</div>
              <div className="text-lg text-[#10b981] font-mono">
                {formatNumber(optMetrics.totalBeneficiaries)}
              </div>
            </div>
            <div>
              <div className="text-[10px] text-ivory/50 font-mono">SROI</div>
              <div className="text-base text-ivory font-mono">
                {formatSROIRange(userMetrics.portfolioSROIMin, userMetrics.portfolioSROIMax)}
              </div>
              <div className="text-[10px] text-ivory/30 my-1">→</div>
              <div className="text-base text-[#10b981] font-mono">
                {formatSROIRange(optMetrics.portfolioSROIMin, optMetrics.portfolioSROIMax)}
              </div>
            </div>
            <div>
              <div className="text-[10px] text-ivory/50 font-mono">Social Value</div>
              <div className="text-lg text-ivory font-mono">
                {formatSAR(userMetrics.totalSocialValue, { compact: true })}
              </div>
              <div className="text-[10px] text-ivory/30 my-1">→</div>
              <div className="text-lg text-[#10b981] font-mono">
                {formatSAR(optMetrics.totalSocialValue, { compact: true })}
              </div>
            </div>
            <div>
              <div className="text-[10px] text-ivory/50 font-mono">Resilience</div>
              <div className="text-lg text-ivory font-mono">
                {formatPercent(userMetrics.resilienceScore, 0)}
              </div>
              <div className="text-[10px] text-ivory/30 my-1">→</div>
              <div className="text-lg text-[#10b981] font-mono">
                {formatPercent(optMetrics.resilienceScore, 0)}
              </div>
            </div>
          </div>
        </motion.div>

        {/* Opportunity cost visualization */}
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          className="glass-panel terminal-border p-6 mb-6"
        >
          <div className="text-[10px] tracking-widest uppercase text-gold font-mono mb-3">
            Opportunity Cost / التكلفة البديلة
          </div>
          <div className="text-xs text-ivory/50 mb-3">
            ما الذي أعطيته لزيادة كل قطاع؟
          </div>
          {SECTORS.map((s) => {
            const diff = (optimized.allocation[s.id] ?? 0) - (allocations[s.id] ?? 0);
            return (
              <div key={s.id} className="flex items-center gap-2 text-xs py-1">
                <div
                  className="w-2 h-2 rounded-sm flex-shrink-0"
                  style={{ backgroundColor: s.color }}
                />
                <div className="flex-1 text-ivory/70">{s.arName}</div>
                <div
                  className={`font-mono tabular-nums w-24 text-right ${
                    diff > 0
                      ? 'text-[#10b981]'
                      : diff < 0
                      ? 'text-red-400'
                      : 'text-ivory/30'
                  }`}
                >
                  {diff > 0 ? '+' : ''}
                  {formatSAR(diff, { compact: true })}
                </div>
              </div>
            );
          })}
        </motion.div>

        {/* Sequential journey nav */}
        <StageNav />
      </motion.div>
    </div>
  );
}
