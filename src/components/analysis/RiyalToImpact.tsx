import { useMemo } from 'react';
import { motion } from 'framer-motion';
import { SECTORS } from '../../data/sectors';
import { computeAllMultipliers } from '../../engine/multiplier';
import { formatSAR, formatMultiplier } from '../../lib/format';
import { useLabStore } from '../../state/labStore';
import { EvidenceBadge } from '../shared/EvidenceBadge';

/**
 * "من ريال إلى أثر" — From Riyal to Impact.
 * Pedagogical animated flow showing how capital turns into measurable impact
 * through the Keynesian cascade + SROI social value.
 * Values come from the live multi-sector model (not fabricated static numbers).
 */
export function RiyalToImpact() {
  const allocations = useLabStore((s) => s.allocations);
  const totalBudget = useLabStore((s) => s.totalBudget);

  const results = useMemo(() => computeAllMultipliers(SECTORS, allocations), [allocations]);

  const multiplier = useMemo(() => {
    const totalGdp = results.reduce((s, r) => s + r.totalGdpImpact, 0);
    return totalBudget > 0 ? totalGdp / totalBudget : 0;
  }, [results, totalBudget]);

  const socialValue = useMemo(() => {
    let sv = 0;
    for (const s of SECTORS) sv += (allocations[s.id] ?? 0) * s.sroiRange.median;
    return sv;
  }, [allocations]);

  const steps = useMemo(() => {
    const direct = results.reduce((s, r) => s + r.directValue, 0);
    const indirect = results.reduce((s, r) => s + r.indirectValue, 0);
    const induced = results.reduce((s, r) => s + r.inducedValue, 0);
    const gdp = results.reduce((s, r) => s + r.totalGdpImpact, 0);
    return [
      { ar: 'استثمار', en: 'Investment', value: totalBudget, fmt: () => formatSAR(totalBudget, { compact: true }) },
      { ar: 'دخل مباشر', en: 'Direct', value: direct, fmt: () => formatSAR(direct, { compact: true }) },
      { ar: 'سلاسل توريد', en: 'Indirect', value: indirect, fmt: () => formatSAR(indirect, { compact: true }) },
      { ar: 'استهلاك مستحث', en: 'Induced', value: induced, fmt: () => formatSAR(induced, { compact: true }) },
      { ar: 'أثر GDP', en: 'GDP Impact', value: gdp, fmt: () => formatSAR(gdp, { compact: true }) },
    ];
  }, [results, totalBudget]);

  return (
    <div className="glass-panel terminal-border p-6">
      <div className="flex items-center gap-2 mb-1">
        <div className="text-[10px] tracking-widest uppercase text-gold font-mono">
          من ريال إلى أثر
        </div>
        <EvidenceBadge level="SIMULATION_ASSUMPTION" size="xs" />
      </div>
      <div className="text-xs text-ivory/60 mb-6">
        From Riyal to Impact — كل ريال يتحول عبر سلسلة اقتصادية ثم إلى قيمة اجتماعية
      </div>

      {/* The cascade flow */}
      <div className="flex flex-col md:flex-row items-stretch md:items-center gap-2 md:gap-1">
        {steps.map((step, i) => (
          <motion.div
            key={step.en}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15 + i * 0.18 }}
            className="flex-1 relative"
          >
            {i > 0 && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.3 + i * 0.18 }}
                className="hidden md:block absolute -left-2 top-1/2 -translate-y-1/2 z-10 text-gold/50 text-lg"
              >
                →
              </motion.div>
            )}
            <div className="lux-glass p-4 text-center h-full">
              <div className="text-[9px] tracking-widest uppercase font-mono text-ivory/40">
                {step.en}
              </div>
              <div className="text-[10px] text-gold/70 font-light mb-2">{step.ar}</div>
              <div className="text-base md:text-lg text-[#e9eadf] font-mono tabular-nums">
                {step.fmt()}
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Final value — social impact */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 1.1 }}
        className="mt-6 grid grid-cols-2 md:grid-cols-3 gap-3"
      >
        <div className="lux-glass p-4 text-center">
          <div className="text-[9px] tracking-widest uppercase font-mono text-ivory/40">GDP Ripple</div>
          <div className="text-2xl text-blue-300 font-mono mt-1">{formatMultiplier(multiplier)}</div>
          <div className="text-[10px] text-ivory/50 mt-1">من كل ريال</div>
        </div>
        <div className="lux-glass p-4 text-center">
          <div className="text-[9px] tracking-widest uppercase font-mono text-ivory/40">Social Value</div>
          <div className="text-2xl text-[#10b981] font-mono mt-1">
            {formatSAR(socialValue, { compact: true })}
          </div>
          <div className="text-[10px] text-ivory/50 mt-1">العائد الاجتماعي</div>
        </div>
        <div className="lux-glass p-4 text-center col-span-2 md:col-span-1">
          <div className="text-[9px] tracking-widest uppercase font-mono text-ivory/40">Social + Market</div>
          <div className="text-2xl text-gold font-mono mt-1">
            {formatSAR(socialValue + results.reduce((s, r) => s + r.totalGdpImpact, 0), { compact: true })}
          </div>
          <div className="text-[10px] text-ivory/50 mt-1">مجموع الأثر المزدوج</div>
        </div>
      </motion.div>

      <p className="mt-4 text-[10px] text-ivory/40 font-mono leading-relaxed">
        {formatSAR(totalBudget, { compact: true })} → قيمة سوقية GDP + قيمة اجتماعية SROI. هذه أرقام توضيحية مبنية على
        افتراضات نموذج مبسّطة لأغراض تعليمية ومحفظة تجريبية.
      </p>
    </div>
  );
}
