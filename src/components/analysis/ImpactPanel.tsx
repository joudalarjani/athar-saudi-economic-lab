import { useMemo } from 'react';
import { useLabStore } from '../../state/labStore';
import { computePortfolioMetrics } from '../../engine/portfolio';
import { SECTORS } from '../../data/sectors';
import { Stat } from '../shared/Stat';
import { formatSAR, formatMultiplier, formatSROIRange } from '../../lib/format';
import { motion } from 'framer-motion';
import { GlossaryTag } from '../shared/GlossaryModal';

export function ImpactPanel() {
  const allocations = useLabStore((s) => s.allocations);
  const discountRate = useLabStore((s) => s.discountRate);
  const horizon = useLabStore((s) => s.horizon);

  const metrics = useMemo(
    () => computePortfolioMetrics(SECTORS, allocations, discountRate, horizon),
    [allocations, discountRate, horizon]
  );

  return (
    <div className="space-y-3">
      {/* Hero stats */}
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        className="glass-panel p-5 terminal-border"
      >
        <div className="text-[10px] tracking-[0.25em] uppercase text-ivory/50 font-mono mb-3">
          Live Impact / الأثر المباشر
        </div>

        <div className="grid grid-cols-2 gap-4">
          <Stat
            label="Direct Beneficiaries"
            value={metrics.totalBeneficiaries}
            format="number"
            color="text-gold"
            size="lg"
            trend="positive"
            subtitle="مستفيد مباشر"
          />
          <Stat
            label="Social Value (SROI)"
            value={metrics.totalSocialValue}
            format="sar-compact"
            color="text-[#10b981]"
            size="lg"
            trend="positive"
            subtitle="قيمة اجتماعية"
          />
        </div>
      </motion.div>

      {/* SROI vs Multiplier — THE critical distinction */}
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="glass-panel p-5 terminal-border"
      >
        <div className="text-[10px] tracking-[0.25em] uppercase text-ivory/50 font-mono mb-2">
          SROI vs Economic Multiplier
        </div>
        <div className="text-xs text-ivory/70 leading-relaxed mb-3">
          فصل صارم بين القيمة الاجتماعية (Welfare) والمضاعف الاقتصادي (Market)
        </div>

        <div className="grid grid-cols-2 gap-3">
          {/* SROI Box */}
          <div className="border border-emerald-700/30 rounded-sm p-3 bg-emerald-900/10">
            <div className="flex items-center justify-between mb-1">
              <div className="text-[10px] text-[#10b981] font-mono tracking-wider">
                <GlossaryTag id="sroi">SROI</GlossaryTag>
              </div>
              <div className="text-[9px] text-ivory/40 font-mono">CASE STUDY</div>
            </div>
            <div className="text-2xl font-mono text-[#10b981] tabular-nums">
              {formatSROIRange(metrics.portfolioSROIMin, metrics.portfolioSROIMax)}
            </div>
            <div className="text-[9px] text-ivory/50 font-mono mt-0.5">
              نطاق تقديري ({formatMultiplier(metrics.portfolioSROI)} متوسط)
            </div>
            <div className="text-[10px] text-ivory/60 mt-1">
              {formatSAR(metrics.totalSocialValue, { compact: true })} قيمة اجتماعية
            </div>
            <div className="text-[9px] text-ivory/40 mt-1 leading-relaxed">
              يقيس القيمة المُحوّلة للنتائج الاجتماعية (welfare, capability)
            </div>
          </div>

          {/* Multiplier Box */}
          <div className="border border-blue-700/30 rounded-sm p-3 bg-blue-900/10">
            <div className="flex items-center justify-between mb-1">
              <div className="text-[10px] text-blue-400 font-mono tracking-wider">
                <GlossaryTag id="multiplier">Multiplier</GlossaryTag>
              </div>
              <div className="text-[9px] text-ivory/40 font-mono">SIM ASSUMPTION</div>
            </div>
            <div className="text-3xl font-mono text-blue-300 tabular-nums">
              {formatMultiplier(metrics.portfolioMultiplier)}
            </div>
            <div className="text-[10px] text-ivory/60 mt-1">
              {formatSAR(metrics.totalGdpImpact, { compact: true })} أثر GDP
            </div>
            <div className="text-[9px] text-ivory/40 mt-1 leading-relaxed">
              يقيس الأثر السوقي فقط (transactions، لا welfare)
            </div>
          </div>
        </div>

        <div className="mt-3 pt-3 border-t border-ivory/10">
          <div className="text-[10px] text-ivory/50 font-mono leading-relaxed">
            <span className="text-gold">⚠</span> SROI ≠ Multiplier. الأول welfare monetization، الثاني market ripple.
            <br />
            <span className="text-ivory/30">
              المنهجية: Social Value International + IMF Article IV
            </span>
          </div>
        </div>
      </motion.div>

      {/* Employment + NPV */}
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="glass-panel p-4"
      >
        <div className="grid grid-cols-2 gap-4">
          <Stat
            label="Jobs Created"
            value={Math.round(metrics.totalEmployment)}
            format="number"
            color="text-gold"
            size="md"
            subtitle="وظيفة (مباشر + غير مباشر)"
          />
          <Stat
            label="NPV (10Y, 3%)"
            value={metrics.npvTotal}
            format="sar-compact"
            color="text-[#10b981]"
            size="md"
            subtitle="صافي القيمة الحالية"
          />
        </div>
      </motion.div>
    </div>
  );
}
