import { useMemo } from 'react';
import { motion } from 'framer-motion';
import { useLabStore } from '../../state/labStore';
import { runSensitivity, type Metric } from '../../engine/sensitivity';
import { SECTORS } from '../../data/sectors';
import { formatSAR, formatNumber, formatMultiplier } from '../../lib/format';
import { useState } from 'react';
import { EvidenceBadge } from '../shared/EvidenceBadge';
import { StageNav } from '../shared/StageNav';

export function Sensitivity() {
  const allocations = useLabStore((s) => s.allocations);
  const discountRate = useLabStore((s) => s.discountRate);
  const horizon = useLabStore((s) => s.horizon);
  const setStage = useLabStore((s) => s.setStage);
  const [metric, setMetric] = useState<Metric>('socialValue');

  const bars = useMemo(
    () => runSensitivity(SECTORS, allocations, metric, discountRate, horizon),
    [allocations, metric, discountRate, horizon]
  );

  const maxRange = Math.max(...bars.map((b) => b.range));
  const metricLabel: Record<Metric, { ar: string; format: (v: number) => string }> = {
    beneficiaries: { ar: 'المستفيدون', format: (v) => formatNumber(v) },
    socialValue: { ar: 'القيمة الاجتماعية', format: (v) => formatSAR(v, { compact: true }) },
    gdpImpact: { ar: 'أثر GDP', format: (v) => formatSAR(v, { compact: true }) },
    npv: { ar: 'NPV', format: (v) => formatSAR(v, { compact: true }) },
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
            Stage 07 / Sensitivity
          </div>
          <h1 className="text-3xl md:text-4xl text-ivory font-light mt-2">
            تحليل الحساسية
          </h1>
          <p className="text-ivory/60 mt-2 text-sm">
            What if assumptions change? Tornado chart shows which parameters matter most.
          </p>
        </div>

        {/* Metric selector */}
        <div className="flex gap-2 mb-6">
          {(Object.keys(metricLabel) as Metric[]).map((m) => (
            <button
              key={m}
              onClick={() => setMetric(m)}
              className={`text-xs px-3 py-2 font-mono uppercase tracking-wider border ${
                metric === m
                  ? 'border-gold text-gold bg-gold/10'
                  : 'border-ivory/15 text-ivory/60 hover:border-ivory/40'
              }`}
            >
              {metricLabel[m].ar}
            </button>
          ))}
        </div>

        {/* Tornado chart */}
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          className="glass-panel terminal-border p-6 mb-6"
        >
          <div className="text-[10px] tracking-widest uppercase text-gold font-mono mb-4">
            Tornado Chart / أي افتراض يؤثر أكثر؟
          </div>

          <div className="space-y-3">
            {bars.map((bar, i) => {
              const lowPct = (bar.lowMetric / maxRange) * 100;
              const highPct = (bar.highMetric / maxRange) * 100;
              return (
                <div key={bar.parameter} className="space-y-1">
                  <div className="flex items-center gap-3 text-xs">
                    <div className="w-32 text-ivory/80 flex-shrink-0">
                      {bar.parameterAr}
                    </div>
                    <div className="flex-1 relative h-7">
                      {/* Zero line (centered) */}
                      <div className="absolute inset-y-0 left-1/2 w-px bg-ivory/30" />
                      {/* Low bar (left) */}
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${(lowPct / 2) || 0}%` }}
                        transition={{ duration: 0.6, delay: i * 0.05 }}
                        className="absolute right-1/2 top-0 bottom-0 bg-gradient-to-l from-red-500/40 to-red-500/80 border border-red-500/60 flex items-center justify-end pr-2"
                      >
                        <span className="text-[9px] font-mono text-red-200">
                          {metricLabel[metric].format(bar.lowMetric)}
                        </span>
                      </motion.div>
                      {/* High bar (right) */}
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${(highPct / 2) || 0}%` }}
                        transition={{ duration: 0.6, delay: i * 0.05 + 0.1 }}
                        className="absolute left-1/2 top-0 bottom-0 bg-gradient-to-r from-emerald-500/40 to-emerald-500/80 border border-emerald-500/60 flex items-center pl-2"
                      >
                        <span className="text-[9px] font-mono text-emerald-200">
                          {metricLabel[metric].format(bar.highMetric)}
                        </span>
                      </motion.div>
                    </div>
                    <div className="w-16 text-right font-mono text-ivory/50 text-[10px] tabular-nums flex-shrink-0">
                      ±10%
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          <div className="mt-6 pt-4 border-t border-ivory/10 text-[10px] text-ivory/50 font-mono leading-relaxed">
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-red-500/60 border border-red-500" />
                <span>-10% scenario</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-emerald-500/60 border border-emerald-500" />
                <span>+10% scenario</span>
              </div>
            </div>
            <div className="mt-3">
              كل شريط يوضح كيف يتغير المقياس عند ±10% في كل افتراض.
              الأطول = الأكثر تأثيرًا. المعلمات مرتبة تنازليًا.
            </div>
          </div>
        </motion.div>

        {/* Key insight */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="glass-panel p-6 mb-6"
        >
          <div className="text-[10px] tracking-widest uppercase text-gold font-mono mb-2">
            Key Insight / الخلاصة
          </div>
          <div className="text-sm text-ivory/80 leading-relaxed">
            {bars[0] && (
              <>
                المعامل الأكثر تأثيرًا على{' '}
                <span className="text-gold">{metricLabel[metric].ar}</span> هو{' '}
                <span className="text-gold font-medium">{bars[0].parameterAr}</span>.
                {' '}تغييره ±10% يُحدث تغييرًا بمقدار{' '}
                <span className="font-mono text-ivory">
                  {formatSAR(bars[0].range, { compact: true })}
                </span>{' '}
                في المقياس. هذا يعني أن{' '}
                <span className="text-[#10b981]">دقة الافتراضات</span> هي العامل الحاسم في
                مصداقية أي تنبؤ.
              </>
            )}
          </div>
        </motion.div>

        {/* Methodology */}
        <div className="flex items-center gap-2 mb-2 text-[10px] text-ivory/40 font-mono">
          <EvidenceBadge level="SIMULATION_ASSUMPTION" size="xs" />
          <span>±10% perturbation on each parameter. All others held constant (ceteris paribus).</span>
        </div>
        <div className="mb-6 text-[11px] text-ivory/60">
          يوضح هذا التحليل مدى حساسية نتائج المحفظة للتغيرات في الافتراضات الأساسية.
          <span className="font-mono text-ivory/30"> (Simulation based on stated assumptions)</span>
        </div>
        <div className="mb-6 text-[9px] font-mono text-gold/50 uppercase text-center" style={{ letterSpacing: '0.3em' }}>
          Joud Al-Arjani
        </div>

        {/* Sequential journey nav */}
        <StageNav />
      </motion.div>
    </div>
  );
}
