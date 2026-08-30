import { useMemo } from 'react';
import { motion } from 'framer-motion';
import { useLabStore } from '../../state/labStore';
import { computePortfolioMetrics } from '../../engine/portfolio';
import { SECTORS } from '../../data/sectors';
import { formatSAR, formatMultiplier, formatNumber, formatSROIRange } from '../../lib/format';
import { EvidenceBadge } from '../shared/EvidenceBadge';
import { MarginalReturns } from '../analysis/MarginalReturns';
import { GlossaryTag } from '../shared/GlossaryModal';
import { LevelHud } from '../shared/LevelHud';
import { StageNav } from '../shared/StageNav';

export function Analysis() {
  const allocations = useLabStore((s) => s.allocations);
  const discountRate = useLabStore((s) => s.discountRate);
  const horizon = useLabStore((s) => s.horizon);
  const setStage = useLabStore((s) => s.setStage);

  const metrics = useMemo(
    () => computePortfolioMetrics(SECTORS, allocations, discountRate, horizon),
    [allocations, discountRate, horizon]
  );

  return (
    <div className="min-h-screen pt-20 px-4 md:px-8 pb-12">
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-6xl mx-auto"
      >
        {/* Header */}
        <div className="mb-8">
          <LevelHud />
          <h1 className="text-3xl md:text-4xl text-ivory font-light mt-3">
            التحليل الاقتصادي
          </h1>
          <p className="text-ivory/60 mt-2 text-sm">
            فصل صارم بين SROI (القيمة الاجتماعية) والـMultiplier (الأثر السوقي)
          </p>
        </div>

        {/* Top: Big SROI vs Multiplier comparison */}
        <div className="grid md:grid-cols-2 gap-4 mb-6">
          <motion.div
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            className="glass-panel terminal-border p-6"
          >
              <div className="flex items-center justify-between mb-3">
                <div className="text-[10px] tracking-widest uppercase text-[#10b981] font-mono">
                  <GlossaryTag id="sroi">SROI / العائد الاجتماعي</GlossaryTag>
                </div>
              <EvidenceBadge level="CASE_STUDY" size="xs" />
            </div>
            <div className="text-5xl text-[#10b981] font-mono tabular-nums">
              {formatSROIRange(metrics.portfolioSROIMin, metrics.portfolioSROIMax)}
            </div>
            <div className="text-ivory/60 text-sm mt-1">
              Social Return on Investment
            </div>
            <div className="text-[10px] text-ivory/40 font-mono">
              نطاق تقديري (متوسط {formatMultiplier(metrics.portfolioSROI)})
            </div>
            <div className="mt-4 pt-4 border-t border-emerald-700/30 space-y-2 text-xs text-ivory/70">
              <div className="flex justify-between">
                <span>Total Social Value:</span>
                <span className="font-mono text-[#10b981]">
                  {formatSAR(metrics.totalSocialValue, { compact: true })}
                </span>
              </div>
              <div className="flex justify-between">
                <span>Definition:</span>
                <span className="text-ivory/50 text-right max-w-[200px]">
                  Monetized social outcomes (welfare, capability, equity)
                </span>
              </div>
              <div className="flex justify-between">
                <span>Methodology:</span>
                <span className="text-ivory/50">SROI v6 + Social Value Intl.</span>
              </div>
            </div>
            <div className="mt-3 text-[10px] text-ivory/40 leading-relaxed">
              يستخدم proxies مالية لتقييم النتائج غير السوقية. يشمل deadweight
              و attribution و displacement.
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 10 }}
            animate={{ opacity: 1, x: 0 }}
            className="glass-panel terminal-border p-6"
          >
              <div className="flex items-center justify-between mb-3">
                <div className="text-[10px] tracking-widest uppercase text-blue-400 font-mono">
                  <GlossaryTag id="multiplier">Economic Multiplier / المضاعف</GlossaryTag>
                </div>
              <EvidenceBadge level="SIMULATION_ASSUMPTION" size="xs" />
            </div>
            <div className="text-6xl text-blue-300 font-mono tabular-nums">
              {formatMultiplier(metrics.portfolioMultiplier)}
            </div>
            <div className="text-ivory/60 text-sm mt-2">
              Keynesian-style Market Ripple
            </div>
            <div className="mt-4 pt-4 border-t border-blue-700/30 space-y-2 text-xs text-ivory/70">
              <div className="flex justify-between">
                <span>Total GDP Impact:</span>
                <span className="font-mono text-blue-300">
                  {formatSAR(metrics.totalGdpImpact, { compact: true })}
                </span>
              </div>
              <div className="flex justify-between">
                <span>Definition:</span>
                <span className="text-ivory/50 text-right max-w-[200px]">
                  Market transactions ripple (Direct + Indirect + Induced)
                </span>
              </div>
              <div className="flex justify-between">
                <span>Methodology:</span>
                <span className="text-ivory/50">MPC + sectoral leakage</span>
              </div>
            </div>
            <div className="mt-3 text-[10px] text-ivory/40 leading-relaxed">
              يقيس الـGDP ripple فقط. لا يشمل welfare. القيم تقديرية لـSaudi
              context (IMF Article IV + SAMA).
            </div>
          </motion.div>
        </div>

        {/* Sector breakdown */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="glass-panel terminal-border p-6"
        >
          <div className="text-[10px] tracking-widest uppercase text-gold font-mono mb-4">
            Sector Breakdown / تفصيل القطاعات
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-xs">
              <thead>
                <tr className="border-b border-ivory/10 text-ivory/50">
                  <th className="text-right py-2 px-2 font-mono">Sector</th>
                  <th className="text-right py-2 px-2 font-mono">Alloc.</th>
                  <th className="text-right py-2 px-2 font-mono">Bene.</th>
                  <th className="text-right py-2 px-2 font-mono">SROI</th>
                  <th className="text-right py-2 px-2 font-mono">SocVal</th>
                  <th className="text-right py-2 px-2 font-mono">Mult.</th>
                  <th className="text-right py-2 px-2 font-mono">GDP</th>
                </tr>
              </thead>
              <tbody>
                {metrics.sectorMetrics.map((s, i) => (
                  <tr
                    key={s.sectorId}
                    className="border-b border-ivory/5 hover:bg-ivory/5"
                  >
                    <td className="py-2 px-2">
                      <div className="flex items-center gap-2">
                        <div
                          className="w-2 h-2 rounded-sm flex-shrink-0"
                          style={{ backgroundColor: s.color }}
                        />
                        <span className="text-ivory">{s.arName}</span>
                      </div>
                    </td>
                    <td className="py-2 px-2 text-right font-mono text-ivory/70">
                      {formatSAR(s.allocation, { compact: true })}
                    </td>
                    <td className="py-2 px-2 text-right font-mono text-ivory/70">
                      {formatNumber(s.directBeneficiaries)}
                    </td>
                    <td className="py-2 px-2 text-right font-mono text-[#10b981]">
                      {formatSROIRange(s.sroiMin, s.sroiMax)}
                    </td>
                    <td className="py-2 px-2 text-right font-mono text-[#10b981]/70">
                      {(s.socialValue / 1_000_000).toFixed(1)}M
                    </td>
                    <td className="py-2 px-2 text-right font-mono text-blue-300">
                      {s.allocation > 0
                        ? formatMultiplier(s.gdpImpact / s.allocation)
                        : '0×'}
                    </td>
                    <td className="py-2 px-2 text-right font-mono text-blue-300/70">
                      {(s.gdpImpact / 1_000_000).toFixed(1)}M
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </motion.div>

        {/* Cascade visualization */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="glass-panel terminal-border p-6 mt-4"
        >
          <div className="text-[10px] tracking-widest uppercase text-gold font-mono mb-4">
            Keynesian Cascade / السلسلة الاقتصادية
          </div>

          <div className="grid grid-cols-4 gap-2 text-center">
            {[
              { label: 'Direct', ar: 'مباشر', value: metrics.sectorMetrics.reduce((s, x) => s + x.allocation * 0.6, 0) },
              { label: 'Indirect', ar: 'غير مباشر', value: metrics.sectorMetrics.reduce((s, x) => s + x.allocation * 0.6 * 0.4, 0) },
              { label: 'Induced', ar: 'مستحَث', value: metrics.sectorMetrics.reduce((s, x) => s + (x.allocation * 0.6 * 0.4) * 0.5, 0) },
              { label: 'Final GDP', ar: 'نهائي', value: metrics.totalGdpImpact },
            ].map((stage, i) => (
              <div key={i} className="relative">
                <div className="text-[10px] text-ivory/50 font-mono">{stage.label}</div>
                <div className="text-lg text-blue-300 font-mono tabular-nums mt-1">
                  {Math.round(stage.value / 1_000_000)}M
                </div>
                <div className="text-[9px] text-ivory/40 mt-0.5">{stage.ar}</div>
                {i < 3 && (
                  <div className="absolute top-1/2 -right-1 text-gold/40 text-lg">→</div>
                )}
              </div>
            ))}
          </div>
          <div className="mt-4 text-[10px] text-ivory/40 font-mono leading-relaxed">
            استثمار 1 ريال → 0.60 دخل مباشر → 0.24 supply chain → 0.12 worker
            consumption → مع leakage → أثر GDP نهائي
          </div>
        </motion.div>

        {/* Time profile chart */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="glass-panel terminal-border p-6 mt-4"
        >
          <div className="text-[10px] tracking-widest uppercase text-gold font-mono mb-4">
            Time Profile / الزمن
          </div>
          <div className="space-y-2">
            {metrics.timeProfile.years.map((y) => {
              const total = y.totalSocialValue + y.totalGdpImpact;
              const max = Math.max(
                ...metrics.timeProfile.years.map((p) => p.totalSocialValue + p.totalGdpImpact)
              );
              const pct = max > 0 ? (total / max) * 100 : 0;
              return (
                <div key={y.year} className="flex items-center gap-3 text-xs">
                  <div className="w-12 text-ivory/50 font-mono">Y{y.year}</div>
                  <div className="flex-1 h-4 bg-midnight-700 rounded-sm overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-l from-emerald to-blue-500"
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                  <div className="w-24 text-right text-ivory/70 font-mono tabular-nums">
                    {(total / 1_000_000).toFixed(0)}M
                  </div>
                </div>
              );
            })}
          </div>
        </motion.div>

        {/* Marginal returns section */}
        <MarginalReturns />

        {/* Sequential journey nav */}
        <div className="mt-8">
          <StageNav />
        </div>
      </motion.div>
    </div>
  );
}
