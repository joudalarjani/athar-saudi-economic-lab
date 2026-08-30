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

  // Shared horizontal domain for the tornado (across all bars), padded so bars
  // never touch the edges.
  const rawMin = Math.min(...bars.map((b) => Math.min(b.lowMetric, b.highMetric)));
  const rawMax = Math.max(...bars.map((b) => Math.max(b.lowMetric, b.highMetric)));
  const rawSpan = rawMax - rawMin || 1;
  const PAD = rawSpan * 0.08;
  const domainMin = rawMin - PAD;
  const domainMax = rawMax + PAD;
  const baseValue = bars[0]?.baseValue ?? 0;

  const pos = (v: number) => ((v - domainMin) / (domainMax - domainMin)) * 100;
  const domainTicks = [domainMin, (domainMin + domainMax) / 2, domainMax];

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
              const low = Math.min(bar.lowMetric, bar.highMetric);
              const high = Math.max(bar.lowMetric, bar.highMetric);
              const base = Math.min(
                Math.max(bar.baseValue, domainMin),
                domainMax
              );
              // Widths are measured from the base-anchor outwards.
              const lowW = Math.max(0, base - bar.lowMetric) / (domainMax - domainMin) * 100;
              const highW = Math.max(0, bar.highMetric - base) / (domainMax - domainMin) * 100;
              return (
                <div key={bar.parameter} className="space-y-1">
                  <div className="flex items-center gap-3 text-xs">
                    <div className="w-32 text-ivory/80 flex-shrink-0">
                      {bar.parameterAr}
                    </div>
                    {/* Chart track */}
                    <div className="flex-1 relative h-7" role="img" aria-label={`Sensitivity of ${bar.parameterAr}`}>
                      {/* Base anchor (current portfolio value) */}
                      <div
                        className="absolute inset-y-0 w-px bg-ivory/40"
                        style={{ left: `${pos(base)}%` }}
                      />
                      {/* Low bar (left of anchor) */}
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${lowW}%` }}
                        transition={{ duration: 0.6, delay: i * 0.05 }}
                        className="absolute top-0 bottom-0 bg-gradient-to-l from-red-500/40 to-red-500/80 border border-red-500/60 flex items-center justify-end pr-2"
                        style={{ right: `${100 - pos(base)}%` }}
                      >
                        {lowW > 12 && (
                          <span className="text-[9px] font-mono text-red-100 whitespace-nowrap">
                            {metricLabel[metric].format(low)}
                          </span>
                        )}
                      </motion.div>
                      {/* High bar (right of anchor) */}
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${highW}%` }}
                        transition={{ duration: 0.6, delay: i * 0.05 + 0.1 }}
                        className="absolute top-0 bottom-0 bg-gradient-to-r from-emerald-500/40 to-emerald-500/80 border border-emerald-500/60 flex items-center pl-2"
                        style={{ left: `${pos(base)}%` }}
                      >
                        {highW > 12 && (
                          <span className="text-[9px] font-mono text-emerald-100 whitespace-nowrap">
                            {metricLabel[metric].format(high)}
                          </span>
                        )}
                      </motion.div>
                    </div>
                    <div className="w-16 text-right font-mono text-ivory/50 text-[10px] tabular-nums flex-shrink-0">
                      ±10%
                    </div>
                  </div>
                  {/* Domain axis for this row (aligned to the track in RTL) */}
                  <div
                    className="relative h-px bg-ivory/10"
                    style={{ marginInlineStart: '8.75rem', marginInlineEnd: '4rem' }}
                  >
                    {domainTicks.map((t) => (
                      <span
                        key={t}
                        className="absolute -top-[3px] w-px h-[7px] bg-ivory/20"
                        style={{ left: `${pos(t)}%` }}
                      />
                    ))}
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
              <div className="flex items-center gap-2">
                <div className="w-px h-3 bg-ivory/40" />
                <span>base (current value)</span>
              </div>
            </div>
            <div className="mt-3 flex flex-wrap gap-3">
              {domainTicks.map((t) => (
                <span key={`tick-${t}`} className="text-ivory/40 tabular-nums">
                  {metricLabel[metric].format(t)}
                </span>
              ))}
              <span className="text-ivory/20">← domain scale</span>
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
